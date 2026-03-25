package orders

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"ble-dor/backend-go/internal/authx"
	"ble-dor/backend-go/internal/httpx"

	"github.com/google/uuid"
)

type Handler struct {
	repo      *Repository
	jwtSecret string
}

func NewHandler(repo *Repository, jwtSecret string) *Handler {
	return &Handler{repo: repo, jwtSecret: jwtSecret}
}

// List returns a handler for GET /v1/orders
// - Clients see only their orders
// - Managers/Owners see today's orders
func (h *Handler) List() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()

		claims, ok := authx.UserFromRequest(r, h.jwtSecret)
		role := claims.Role

		var orders []Order
		var err error

		// Determine what orders to return based on role
		if role == "CLIENT" && ok {
			// Client: return only their orders
			orders, err = h.repo.GetUserOrders(ctx, claims.UserID)
		} else if role == "MANAGER" || role == "OWNER" {
			// Manager/Owner: return today's orders
			orders, err = h.repo.GetTodayOrders(ctx)
		} else {
			// Unauthenticated: return empty list
			httpx.JSON(w, http.StatusOK, []Order{})
			return
		}

		if err != nil {
			fmt.Printf("Error listing orders: %v\n", err)
			httpx.Error(w, http.StatusInternalServerError, "Failed to fetch orders")
			return
		}

		if orders == nil {
			orders = []Order{} // Return empty array instead of null
		}

		httpx.JSON(w, http.StatusOK, orders)
	})
}

// GetByID returns a handler for GET /v1/orders/{id}
func (h *Handler) GetByID() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()

		orderID := r.PathValue("id")
		if orderID == "" {
			httpx.Error(w, http.StatusBadRequest, "Order ID required")
			return
		}

		order, err := h.repo.GetByID(ctx, orderID)
		if err != nil {
			fmt.Printf("Error fetching order: %v\n", err)
			httpx.Error(w, http.StatusInternalServerError, "Failed to fetch order")
			return
		}

		if order == nil {
			httpx.Error(w, http.StatusNotFound, "Order not found")
			return
		}

		httpx.JSON(w, http.StatusOK, order)
	})
}

// Create returns a handler for POST /v1/orders (manager checkout)
func (h *Handler) Create() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()

		var req struct {
			Items           []struct{ ProductID string; Quantity int } `json:"items"`
			PaymentMethod   string                                      `json:"paymentMethod"`
			CustomerName    string                                      `json:"customerName"`
			CustomerNote    string                                      `json:"customerNote"`
		}

		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			httpx.Error(w, http.StatusBadRequest, "Invalid request body")
			return
		}

		if len(req.Items) == 0 {
			httpx.Error(w, http.StatusBadRequest, "Order must contain at least one item")
			return
		}

		if req.PaymentMethod == "" {
			req.PaymentMethod = "CASH"
		}

		// Get manager ID from auth
		claims, ok := authx.UserFromRequest(r, h.jwtSecret)
		if !ok {
			httpx.Error(w, http.StatusUnauthorized, "Non authentifie")
			return
		}
		managerID := claims.UserID

		// Get product prices for calculation
		productMap, err := h.getProductPrices(ctx, req.Items)
		if err != nil {
			fmt.Printf("Error fetching products: %v\n", err)
			httpx.Error(w, http.StatusInternalServerError, "Failed to fetch products")
			return
		}

		// Calculate total and prepare order items
		var total float64
		var orderItems []OrderItem

		for _, item := range req.Items {
			product, ok := productMap[item.ProductID]
			if !ok {
				httpx.Error(w, http.StatusBadRequest, fmt.Sprintf("Product not found: %s", item.ProductID))
				return
			}

			qty := item.Quantity
			if qty <= 0 {
				qty = 1
			}

			total += product * float64(qty)
			orderItems = append(orderItems, OrderItem{
				ID:        uuid.New().String(),
				Quantity:  qty,
				UnitPrice: product,
				ProductID: item.ProductID,
			})
		}

		// Generate ticket number
		ticketNumber := generateTicketNumber()

		// Create order
		order := &Order{
			ID:            uuid.New().String(),
			CreatedAt:     time.Now(),
			UpdatedAt:     time.Now(),
			Status:        "PENDING",
			Total:         total,
			PaymentMethod: req.PaymentMethod,
			TicketNumber:  &ticketNumber,
			CustomerName:  nil,
			CustomerNote:  nil,
			ManagerID:     &managerID,
			ClientID:      nil,
			Items:         orderItems,
		}

		if req.CustomerName != "" {
			order.CustomerName = &req.CustomerName
		}
		if req.CustomerNote != "" {
			order.CustomerNote = &req.CustomerNote
		}

		if err := h.repo.Create(ctx, order); err != nil {
			fmt.Printf("Error creating order: %v\n", err)
			httpx.Error(w, http.StatusInternalServerError, "Failed to create order")
			return
		}

		httpx.JSON(w, http.StatusCreated, order)
	})
}

// CreateFromCart returns a handler for POST /v1/orders/from-cart (client checkout)
func (h *Handler) CreateFromCart() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()

		claims, ok := authx.UserFromRequest(r, h.jwtSecret)
		role := claims.Role

		if !ok || role != "CLIENT" {
			httpx.Error(w, http.StatusForbidden, "Clients only")
			return
		}
		userID := claims.UserID

		var req struct {
			Items        []struct{ ProductID string; Quantity int } `json:"items"`
			CustomerName string                                      `json:"customerName"`
			CustomerNote string                                      `json:"customerNote"`
		}

		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			httpx.Error(w, http.StatusBadRequest, "Invalid request body")
			return
		}

		if len(req.Items) == 0 {
			httpx.Error(w, http.StatusBadRequest, "Order must contain at least one item")
			return
		}

		if req.CustomerName == "" {
			httpx.Error(w, http.StatusBadRequest, "Customer name required")
			return
		}

		// Get product prices
		productMap, err := h.getProductPrices(ctx, req.Items)
		if err != nil {
			fmt.Printf("Error fetching products: %v\n", err)
			httpx.Error(w, http.StatusInternalServerError, "Failed to fetch products")
			return
		}

		// Calculate total and prepare order items
		var total float64
		var orderItems []OrderItem

		for _, item := range req.Items {
			product, ok := productMap[item.ProductID]
			if !ok {
				httpx.Error(w, http.StatusBadRequest, fmt.Sprintf("Product not found: %s", item.ProductID))
				return
			}

			qty := item.Quantity
			if qty <= 0 {
				qty = 1
			}

			total += product * float64(qty)
			orderItems = append(orderItems, OrderItem{
				ID:        uuid.New().String(),
				Quantity:  qty,
				UnitPrice: product,
				ProductID: item.ProductID,
			})
		}

		// Create order
		order := &Order{
			ID:            uuid.New().String(),
			CreatedAt:     time.Now(),
			UpdatedAt:     time.Now(),
			Status:        "PENDING",
			Total:         total,
			PaymentMethod: "CASH",
			TicketNumber:  nil,
			CustomerName:  &req.CustomerName,
			CustomerNote:  nil,
			ManagerID:     nil,
			ClientID:      &userID,
			Items:         orderItems,
		}

		if req.CustomerNote != "" {
			order.CustomerNote = &req.CustomerNote
		}

		if err := h.repo.Create(ctx, order); err != nil {
			fmt.Printf("Error creating order: %v\n", err)
			httpx.Error(w, http.StatusInternalServerError, "Failed to create order")
			return
		}

		httpx.JSON(w, http.StatusCreated, order)
	})
}

// UpdateStatus returns a handler for PATCH /v1/orders/{id}/status
func (h *Handler) UpdateStatus() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()

		claims, ok := authx.UserFromRequest(r, h.jwtSecret)
		if !ok {
			httpx.Error(w, http.StatusUnauthorized, "Non authentifie")
			return
		}

		role := claims.Role
		if role != "MANAGER" && role != "OWNER" {
			httpx.Error(w, http.StatusForbidden, "Manager or owner only")
			return
		}

		orderID := r.PathValue("id")
		if orderID == "" {
			httpx.Error(w, http.StatusBadRequest, "Order ID required")
			return
		}

		var req struct {
			Status string `json:"status"`
		}

		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			httpx.Error(w, http.StatusBadRequest, "Invalid request body")
			return
		}

		order, err := h.repo.UpdateStatus(ctx, orderID, req.Status)
		if err != nil {
			fmt.Printf("Error updating order status: %v\n", err)
			httpx.Error(w, http.StatusBadRequest, "Invalid status")
			return
		}

		if order == nil {
			httpx.Error(w, http.StatusNotFound, "Order not found")
			return
		}

		httpx.JSON(w, http.StatusOK, order)
	})
}

// Helper: getProductPrices fetches prices for multiple products from DB
func (h *Handler) getProductPrices(ctx context.Context, items []struct{ ProductID string; Quantity int }) (map[string]float64, error) {
	productMap := make(map[string]float64)

	// Extract unique product IDs
	productIDs := make([]string, 0)
	idSet := make(map[string]bool)
	for _, item := range items {
		if !idSet[item.ProductID] {
			productIDs = append(productIDs, item.ProductID)
			idSet[item.ProductID] = true
		}
	}

	if len(productIDs) == 0 {
		return productMap, nil
	}

	// Query DB for all product prices - build IN clause dynamically
	query := `SELECT id, price FROM "Product" WHERE id = ANY($1)`
	rows, err := h.repo.Pool.Query(ctx, query, productIDs)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch products: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var id string
		var price float64
		if err := rows.Scan(&id, &price); err != nil {
			return nil, fmt.Errorf("failed to scan product: %w", err)
		}
		productMap[id] = price
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating products: %w", err)
	}

	return productMap, nil
}

// Helper: generateTicketNumber generates a ticket number
func generateTicketNumber() string {
	now := time.Now()
	y := now.Year()
	m := int(now.Month())
	d := now.Day()
	h := now.Hour()
	min := now.Minute()
	rnd := uuid.New().String()[:4]

	return fmt.Sprintf("BLE-%04d%02d%02d-%02d%02d-%s", y, m, d, h, min, rnd)
}
