package products

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

var ErrProductNotFound = errors.New("product not found")

type Product struct {
	ID          string  `json:"id"`
	Name        string  `json:"name"`
	Price       float64 `json:"price"`
	Category    string  `json:"category"`
	Description *string `json:"description"`
	ImageURL    *string `json:"imageUrl"`
	IsAvailable bool    `json:"isAvailable"`
}

type Repository struct {
	pool *pgxpool.Pool
}

func NewRepository(pool *pgxpool.Pool) *Repository {
	return &Repository{pool: pool}
}

func (r *Repository) ListAvailable(ctx context.Context) ([]Product, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, name, price, category, description, "imageUrl", "isAvailable"
		FROM "Product"
		WHERE "isAvailable" = true
		ORDER BY category ASC, name ASC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	products := make([]Product, 0)
	for rows.Next() {
		var p Product
		if err := rows.Scan(
			&p.ID,
			&p.Name,
			&p.Price,
			&p.Category,
			&p.Description,
			&p.ImageURL,
			&p.IsAvailable,
		); err != nil {
			return nil, err
		}
		products = append(products, p)
	}

	if rows.Err() != nil {
		return nil, rows.Err()
	}

	return products, nil
}

func (r *Repository) GetAvailableByID(ctx context.Context, id string) (*Product, error) {
	var p Product
	err := r.pool.QueryRow(ctx, `
		SELECT id, name, price, category, description, "imageUrl", "isAvailable"
		FROM "Product"
		WHERE id = $1 AND "isAvailable" = true
		LIMIT 1
	`, id).Scan(
		&p.ID,
		&p.Name,
		&p.Price,
		&p.Category,
		&p.Description,
		&p.ImageURL,
		&p.IsAvailable,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrProductNotFound
		}
		return nil, err
	}

	return &p, nil
}
