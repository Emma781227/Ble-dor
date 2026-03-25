package orders

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// OrderItem represents a single item in an order
type OrderItem struct {
	ID        string  `json:"id"`
	Quantity  int     `json:"quantity"`
	UnitPrice float64 `json:"unitPrice"`
	ProductID string  `json:"productId"`
	Product   *struct {
		ID   string `json:"id"`
		Name string `json:"name"`
	} `json:"product"`
}

// Order represents an order
type Order struct {
	ID            string       `json:"id"`
	CreatedAt     time.Time    `json:"createdAt"`
	UpdatedAt     time.Time    `json:"updatedAt"`
	Status        string       `json:"status"`
	Total         float64      `json:"total"`
	PaymentMethod string       `json:"paymentMethod"`
	TicketNumber  *string      `json:"ticketNumber"`
	CustomerName  *string      `json:"customerName"`
	CustomerNote  *string      `json:"customerNote"`
	ManagerID     *string      `json:"managerId"`
	ClientID      *string      `json:"clientId"`
	Items         []OrderItem  `json:"items"`
	Manager       *struct {
		ID   string `json:"id"`
		Name string `json:"name"`
	} `json:"manager"`
}

type Repository struct {
	Pool *pgxpool.Pool
}

func NewRepository(pool *pgxpool.Pool) *Repository {
	return &Repository{Pool: pool}
}

// GetTodayOrders returns all orders created today (for manager/owner view)
func (r *Repository) GetTodayOrders(ctx context.Context) ([]Order, error) {
	start := time.Now()
	start = time.Date(start.Year(), start.Month(), start.Day(), 0, 0, 0, 0, start.Location())

	end := time.Now()
	end = time.Date(end.Year(), end.Month(), end.Day(), 23, 59, 59, 999999999, end.Location())

	query := `
		SELECT 
			id, "createdAt", "updatedAt", status, total, "paymentMethod",
			"ticketNumber", "customerName", "customerNote", 
			"managerId", "clientId"
		FROM "Order"
		WHERE "createdAt" >= $1 AND "createdAt" <= $2
		ORDER BY "createdAt" DESC
	`

	rows, err := r.Pool.Query(ctx, query, start, end)
	if err != nil {
		return nil, fmt.Errorf("failed to query today's orders: %w", err)
	}
	defer rows.Close()

	var orders []Order
	for rows.Next() {
		var order Order
		if err := rows.Scan(
			&order.ID, &order.CreatedAt, &order.UpdatedAt, &order.Status, &order.Total,
			&order.PaymentMethod, &order.TicketNumber, &order.CustomerName, &order.CustomerNote,
			&order.ManagerID, &order.ClientID,
		); err != nil {
			return nil, fmt.Errorf("failed to scan order: %w", err)
		}

		// Fetch items for this order
		items, err := r.getOrderItems(ctx, order.ID)
		if err != nil {
			return nil, err
		}
		order.Items = items

		orders = append(orders, order)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating orders: %w", err)
	}

	return orders, nil
}

// GetUserOrders returns orders for a specific user (client view)
func (r *Repository) GetUserOrders(ctx context.Context, userID string) ([]Order, error) {
	query := `
		SELECT 
			id, "createdAt", "updatedAt", status, total, "paymentMethod",
			"ticketNumber", "customerName", "customerNote", 
			"managerId", "clientId"
		FROM "Order"
		WHERE "clientId" = $1
		ORDER BY "createdAt" DESC
	`

	rows, err := r.Pool.Query(ctx, query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to query user orders: %w", err)
	}
	defer rows.Close()

	var orders []Order
	for rows.Next() {
		var order Order
		if err := rows.Scan(
			&order.ID, &order.CreatedAt, &order.UpdatedAt, &order.Status, &order.Total,
			&order.PaymentMethod, &order.TicketNumber, &order.CustomerName, &order.CustomerNote,
			&order.ManagerID, &order.ClientID,
		); err != nil {
			return nil, fmt.Errorf("failed to scan order: %w", err)
		}

		// Fetch items for this order
		items, err := r.getOrderItems(ctx, order.ID)
		if err != nil {
			return nil, err
		}
		order.Items = items

		orders = append(orders, order)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating orders: %w", err)
	}

	return orders, nil
}

// GetByID fetches a single order by ID with all items
func (r *Repository) GetByID(ctx context.Context, orderID string) (*Order, error) {
	query := `
		SELECT 
			id, "createdAt", "updatedAt", status, total, "paymentMethod",
			"ticketNumber", "customerName", "customerNote", 
			"managerId", "clientId"
		FROM "Order"
		WHERE id = $1
	`

	var order Order
	err := r.Pool.QueryRow(ctx, query, orderID).Scan(
		&order.ID, &order.CreatedAt, &order.UpdatedAt, &order.Status, &order.Total,
		&order.PaymentMethod, &order.TicketNumber, &order.CustomerName, &order.CustomerNote,
		&order.ManagerID, &order.ClientID,
	)
	if err != nil {
		if err.Error() == "no rows in result set" {
			return nil, nil // Order not found
		}
		return nil, fmt.Errorf("failed to query order: %w", err)
	}

	// Fetch items for this order
	items, err := r.getOrderItems(ctx, order.ID)
	if err != nil {
		return nil, err
	}
	order.Items = items

	return &order, nil
}

// Create creates a new order with items
func (r *Repository) Create(ctx context.Context, order *Order) error {
	tx, err := r.Pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	// Insert order
	orderQuery := `
		INSERT INTO "Order" 
		(id, status, total, "paymentMethod", "ticketNumber", "customerName", "customerNote", "managerId", "clientId", "createdAt", "updatedAt")
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
	`

	_, err = tx.Exec(ctx, orderQuery,
		order.ID, order.Status, order.Total, order.PaymentMethod,
		order.TicketNumber, order.CustomerName, order.CustomerNote,
		order.ManagerID, order.ClientID, order.CreatedAt, order.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("failed to insert order: %w", err)
	}

	// Insert order items
	itemQuery := `
		INSERT INTO "OrderItem" (id, quantity, "unitPrice", "orderId", "productId")
		VALUES ($1, $2, $3, $4, $5)
	`

	for _, item := range order.Items {
		_, err = tx.Exec(ctx, itemQuery,
			item.ID, item.Quantity, item.UnitPrice, order.ID, item.ProductID,
		)
		if err != nil {
			return fmt.Errorf("failed to insert order item: %w", err)
		}
	}

	if err = tx.Commit(ctx); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

// UpdateStatus updates the status of an order
func (r *Repository) UpdateStatus(ctx context.Context, orderID string, status string) (*Order, error) {
	validStatuses := map[string]bool{
		"PENDING":     true,
		"PREPARATION": true,
		"READY":       true,
		"DELIVERED":   true,
		"CANCELED":    true,
	}

	if !validStatuses[status] {
		return nil, errors.New("invalid order status")
	}

	query := `
		UPDATE "Order"
		SET status = $1, "updatedAt" = $2
		WHERE id = $3
		RETURNING 
			id, "createdAt", "updatedAt", status, total, "paymentMethod",
			"ticketNumber", "customerName", "customerNote", 
			"managerId", "clientId"
	`

	now := time.Now()
	var order Order
	err := r.Pool.QueryRow(ctx, query, status, now, orderID).Scan(
		&order.ID, &order.CreatedAt, &order.UpdatedAt, &order.Status, &order.Total,
		&order.PaymentMethod, &order.TicketNumber, &order.CustomerName, &order.CustomerNote,
		&order.ManagerID, &order.ClientID,
	)
	if err != nil {
		if err.Error() == "no rows in result set" {
			return nil, nil // Order not found
		}
		return nil, fmt.Errorf("failed to update order: %w", err)
	}

	// Fetch items for updated order
	items, err := r.getOrderItems(ctx, order.ID)
	if err != nil {
		return nil, err
	}
	order.Items = items

	return &order, nil
}

// Helper: getOrderItems fetches all items for a given order
func (r *Repository) getOrderItems(ctx context.Context, orderID string) ([]OrderItem, error) {
	query := `
		SELECT 
			oi.id, oi.quantity, oi."unitPrice", oi."productId",
			p.name
		FROM "OrderItem" oi
		JOIN "Product" p ON oi."productId" = p.id
		WHERE oi."orderId" = $1
		ORDER BY oi.id
	`

	rows, err := r.Pool.Query(ctx, query, orderID)
	if err != nil {
		return nil, fmt.Errorf("failed to query order items: %w", err)
	}
	defer rows.Close()

	var items []OrderItem
	for rows.Next() {
		var item OrderItem
		var productName string
		if err := rows.Scan(
			&item.ID, &item.Quantity, &item.UnitPrice, &item.ProductID,
			&productName,
		); err != nil {
			return nil, fmt.Errorf("failed to scan order item: %w", err)
		}
		item.Product = &struct {
			ID   string `json:"id"`
			Name string `json:"name"`
		}{
			ID:   item.ProductID,
			Name: productName,
		}
		items = append(items, item)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating items: %w", err)
	}

	return items, nil
}
