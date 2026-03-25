package config

import (
	"fmt"
	"net/url"
	"os"
	"strings"
)

type Config struct {
	Port        string
	DatabaseURL string
	CORSOrigin  string
	JWTSecret   string
}

func Load() (Config, error) {
	cfg := Config{
		Port:        getenv("PORT", "8080"),
		DatabaseURL: os.Getenv("DATABASE_URL"),
		CORSOrigin:  getenv("CORS_ORIGIN", "http://localhost:3000"),
		JWTSecret:   getenv("JWT_SECRET", "dev-backend-jwt-secret"),
	}

	if cfg.DatabaseURL == "" {
		return Config{}, fmt.Errorf("DATABASE_URL is required")
	}

	// Accept Prisma-style URLs by normalizing query params for pgx.
	normalizedURL, err := normalizeDatabaseURL(cfg.DatabaseURL)
	if err != nil {
		return Config{}, err
	}
	cfg.DatabaseURL = normalizedURL

	return cfg, nil
}

func getenv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}

func normalizeDatabaseURL(raw string) (string, error) {
	u, err := url.Parse(raw)
	if err != nil {
		return "", fmt.Errorf("invalid DATABASE_URL: %w", err)
	}

	q := u.Query()

	// Prisma often appends schema=public, which pgx treats as an unknown server parameter.
	q.Del("schema")

	// Local docker/postgres usually has no TLS. Neon should keep sslmode=require.
	if q.Get("sslmode") == "" {
		host := strings.ToLower(u.Hostname())
		if host == "localhost" || host == "127.0.0.1" || host == "db" {
			q.Set("sslmode", "disable")
		}
	}

	u.RawQuery = q.Encode()
	return u.String(), nil
}
