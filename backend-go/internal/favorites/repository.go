package favorites

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Product struct {
	ID          string  `json:"id"`
	Name        string  `json:"name"`
	Price       float64 `json:"price"`
	Category    string  `json:"category"`
	Description *string `json:"description"`
	ImageURL    *string `json:"imageUrl"`
	IsAvailable bool    `json:"isAvailable"`
}

type Favorite struct {
	ID      string  `json:"id"`
	Product Product `json:"product"`
}

type Repository struct {
	pool *pgxpool.Pool
}

func NewRepository(pool *pgxpool.Pool) *Repository {
	return &Repository{pool: pool}
}

func (r *Repository) ListByUser(ctx context.Context, userID string) ([]Favorite, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT
			f.id,
			p.id,
			p.name,
			p.price,
			p.category,
			p.description,
			p."imageUrl",
			p."isAvailable"
		FROM "Favorite" f
		JOIN "Product" p ON p.id = f."productId"
		WHERE f."userId" = $1
		ORDER BY f."createdAt" DESC
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := make([]Favorite, 0)
	for rows.Next() {
		var fav Favorite
		if err := rows.Scan(
			&fav.ID,
			&fav.Product.ID,
			&fav.Product.Name,
			&fav.Product.Price,
			&fav.Product.Category,
			&fav.Product.Description,
			&fav.Product.ImageURL,
			&fav.Product.IsAvailable,
		); err != nil {
			return nil, err
		}
		out = append(out, fav)
	}

	if rows.Err() != nil {
		return nil, rows.Err()
	}

	return out, nil
}

func (r *Repository) Add(ctx context.Context, userID, productID string) error {
	_, err := r.pool.Exec(ctx, `
		INSERT INTO "Favorite" (id, "userId", "productId", "createdAt")
		SELECT $1, $2, $3, NOW()
		WHERE NOT EXISTS (
			SELECT 1
			FROM "Favorite"
			WHERE "userId" = $2 AND "productId" = $3
		)
	`, uuid.NewString(), userID, productID)
	return err
}

func (r *Repository) Remove(ctx context.Context, userID, productID string) error {
	_, err := r.pool.Exec(ctx, `
		DELETE FROM "Favorite"
		WHERE "userId" = $1 AND "productId" = $2
	`, userID, productID)
	return err
}
