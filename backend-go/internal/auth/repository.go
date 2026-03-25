package auth

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type User struct {
	ID           string  `json:"id"`
	Email        string  `json:"email"`
	Name         *string `json:"name"`
	Role         string  `json:"role"`
	PasswordHash *string `json:"-"`
}

type PasswordResetToken struct {
	ID        string
	Token     string
	UserID    string
	ExpiresAt time.Time
	CreatedAt time.Time
}

type Repository struct {
	Pool *pgxpool.Pool
}

func NewRepository(pool *pgxpool.Pool) *Repository {
	return &Repository{Pool: pool}
}

func (r *Repository) FindUserByEmail(ctx context.Context, email string) (*User, error) {
	query := `
		SELECT id, email, name, role, "passwordHash"
		FROM "User"
		WHERE email = $1
	`

	var user User
	err := r.Pool.QueryRow(ctx, query, email).Scan(
		&user.ID,
		&user.Email,
		&user.Name,
		&user.Role,
		&user.PasswordHash,
	)
	if err != nil {
		if err.Error() == "no rows in result set" {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to find user by email: %w", err)
	}

	return &user, nil
}

func (r *Repository) CreateUser(ctx context.Context, id, email string, name, phone, passwordHash *string, role string) (*User, error) {
	query := `
		INSERT INTO "User" (id, email, name, phone, role, "passwordHash", "createdAt", "updatedAt")
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id, email, name, role
	`

	now := time.Now()
	var user User
	err := r.Pool.QueryRow(ctx, query, id, email, name, phone, role, passwordHash, now, now).Scan(
		&user.ID,
		&user.Email,
		&user.Name,
		&user.Role,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	return &user, nil
}

func (r *Repository) DeleteResetTokensByUserID(ctx context.Context, userID string) error {
	_, err := r.Pool.Exec(ctx, `DELETE FROM "PasswordResetToken" WHERE "userId" = $1`, userID)
	if err != nil {
		return fmt.Errorf("failed to delete reset tokens: %w", err)
	}
	return nil
}

func (r *Repository) CreateResetToken(ctx context.Context, id, token, userID string, expiresAt time.Time) error {
	_, err := r.Pool.Exec(
		ctx,
		`INSERT INTO "PasswordResetToken" (id, token, "userId", "expiresAt", "createdAt") VALUES ($1, $2, $3, $4, $5)`,
		id,
		token,
		userID,
		expiresAt,
		time.Now(),
	)
	if err != nil {
		return fmt.Errorf("failed to create reset token: %w", err)
	}
	return nil
}

func (r *Repository) GetResetToken(ctx context.Context, token string) (*PasswordResetToken, error) {
	query := `
		SELECT id, token, "userId", "expiresAt", "createdAt"
		FROM "PasswordResetToken"
		WHERE token = $1
	`

	var reset PasswordResetToken
	err := r.Pool.QueryRow(ctx, query, token).Scan(
		&reset.ID,
		&reset.Token,
		&reset.UserID,
		&reset.ExpiresAt,
		&reset.CreatedAt,
	)
	if err != nil {
		if err.Error() == "no rows in result set" {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to query reset token: %w", err)
	}

	return &reset, nil
}

func (r *Repository) UpdatePasswordAndConsumeResetToken(ctx context.Context, userID, resetTokenID, passwordHash string) error {
	tx, err := r.Pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin tx: %w", err)
	}
	defer tx.Rollback(ctx)

	_, err = tx.Exec(
		ctx,
		`UPDATE "User" SET "passwordHash" = $1, "updatedAt" = $2 WHERE id = $3`,
		passwordHash,
		time.Now(),
		userID,
	)
	if err != nil {
		return fmt.Errorf("failed to update password: %w", err)
	}

	_, err = tx.Exec(ctx, `DELETE FROM "PasswordResetToken" WHERE id = $1`, resetTokenID)
	if err != nil {
		return fmt.Errorf("failed to consume reset token: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("failed to commit tx: %w", err)
	}

	return nil
}
