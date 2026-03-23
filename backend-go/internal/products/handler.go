package products

import (
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
