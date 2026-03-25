package favorites

import (
	"encoding/json"
	"net/http"

	"ble-dor/backend-go/internal/authx"
	"ble-dor/backend-go/internal/httpx"
)

type Handler struct {
	repo      *Repository
	jwtSecret string
}

func NewHandler(repo *Repository, jwtSecret string) *Handler {
	return &Handler{repo: repo, jwtSecret: jwtSecret}
}

func (h *Handler) List() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		claims, ok := authx.UserFromRequest(r, h.jwtSecret)
		if !ok {
			httpx.Error(w, http.StatusUnauthorized, "Non authentifie")
			return
		}

		items, err := h.repo.ListByUser(r.Context(), claims.UserID)
		if err != nil {
			httpx.Error(w, http.StatusInternalServerError, "unable to list favorites")
			return
		}

		httpx.JSON(w, http.StatusOK, items)
	})
}

func (h *Handler) Add() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		claims, ok := authx.UserFromRequest(r, h.jwtSecret)
		if !ok {
			httpx.Error(w, http.StatusUnauthorized, "Non authentifie")
			return
		}

		var body struct {
			ProductID string `json:"productId"`
		}
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			httpx.Error(w, http.StatusBadRequest, "invalid json body")
			return
		}

		if body.ProductID == "" {
			httpx.Error(w, http.StatusBadRequest, "productId requis")
			return
		}

		if err := h.repo.Add(r.Context(), claims.UserID, body.ProductID); err != nil {
			httpx.Error(w, http.StatusInternalServerError, "unable to add favorite")
			return
		}

		httpx.JSON(w, http.StatusOK, map[string]bool{"success": true})
	})
}

func (h *Handler) Remove() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		claims, ok := authx.UserFromRequest(r, h.jwtSecret)
		if !ok {
			httpx.Error(w, http.StatusUnauthorized, "Non authentifie")
			return
		}

		productID := r.PathValue("productId")
		if productID == "" {
			httpx.Error(w, http.StatusBadRequest, "productId manquant")
			return
		}

		if err := h.repo.Remove(r.Context(), claims.UserID, productID); err != nil {
			httpx.Error(w, http.StatusInternalServerError, "unable to remove favorite")
			return
		}

		httpx.JSON(w, http.StatusOK, map[string]bool{"success": true})
	})
}
