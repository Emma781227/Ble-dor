package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"ble-dor/backend-go/internal/auth"
	"ble-dor/backend-go/internal/config"
	"ble-dor/backend-go/internal/db"
	"ble-dor/backend-go/internal/favorites"
	"ble-dor/backend-go/internal/httpx"
	"ble-dor/backend-go/internal/orders"
	"ble-dor/backend-go/internal/products"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("config error: %v", err)
	}

	ctx := context.Background()
	pool, err := db.NewPostgresPool(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("db connection error: %v", err)
	}
	defer pool.Close()

	productsRepo := products.NewRepository(pool)
	productsHandler := products.NewHandler(productsRepo)
	favoritesRepo := favorites.NewRepository(pool)
	favoritesHandler := favorites.NewHandler(favoritesRepo, cfg.JWTSecret)
	ordersRepo := orders.NewRepository(pool)
	ordersHandler := orders.NewHandler(ordersRepo, cfg.JWTSecret)
	authRepo := auth.NewRepository(pool)
	authHandler := auth.NewHandler(authRepo, cfg.JWTSecret, cfg.CORSOrigin)

	mux := http.NewServeMux()
	mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, _ *http.Request) {
		httpx.JSON(w, http.StatusOK, map[string]string{"status": "ok"})
	})
	mux.Handle("GET /v1/products", productsHandler.List())
	mux.Handle("GET /v1/products/{id}", productsHandler.GetByID())
	mux.Handle("GET /v1/favorites", favoritesHandler.List())
	mux.Handle("POST /v1/favorites", favoritesHandler.Add())
	mux.Handle("DELETE /v1/favorites/{productId}", favoritesHandler.Remove())
	mux.Handle("GET /v1/orders", ordersHandler.List())
	mux.Handle("GET /v1/orders/{id}", ordersHandler.GetByID())
	mux.Handle("POST /v1/orders", ordersHandler.Create())
	mux.Handle("POST /v1/orders/from-cart", ordersHandler.CreateFromCart())
	mux.Handle("PATCH /v1/orders/{id}/status", ordersHandler.UpdateStatus())
	mux.Handle("POST /v1/auth/register", authHandler.Register())
	mux.Handle("POST /v1/auth/login", authHandler.Login())
	mux.Handle("POST /v1/auth/forgot-password", authHandler.ForgotPassword())
	mux.Handle("POST /v1/auth/reset-password", authHandler.ResetPassword())

	handler := httpx.WithCORS(mux, cfg.CORSOrigin)

	srv := &http.Server{
		Addr:              ":" + cfg.Port,
		Handler:           handler,
		ReadHeaderTimeout: 5 * time.Second,
	}

	go func() {
		log.Printf("Go API listening on :%s", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("server error: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Printf("graceful shutdown error: %v", err)
	}
}
