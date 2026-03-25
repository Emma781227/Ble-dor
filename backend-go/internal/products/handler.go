package products

import (
	"errors"
	"net/http"

	"ble-dor/backend-go/internal/httpx"
)

type Handler struct {
	repo *Repository
}

func NewHandler(repo *Repository) *Handler {
	return &Handler{repo: repo}
}

func (h *Handler) List() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		products, err := h.repo.ListAvailable(r.Context())
		if err != nil {
			httpx.Error(w, http.StatusInternalServerError, "unable to list products")
			return
		}

		httpx.JSON(w, http.StatusOK, map[string]any{
			"items": products,
		})
	})
}

func (h *Handler) GetByID() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		id := r.PathValue("id")
		if id == "" {
			httpx.Error(w, http.StatusBadRequest, "id is required")
			return
		}

		product, err := h.repo.GetAvailableByID(r.Context(), id)
		if err != nil {
			if errors.Is(err, ErrProductNotFound) {
				httpx.Error(w, http.StatusNotFound, "product not found")
				return
			}
			httpx.Error(w, http.StatusInternalServerError, "unable to get product")
			return
		}

		httpx.JSON(w, http.StatusOK, map[string]any{"item": product})
	})
}
