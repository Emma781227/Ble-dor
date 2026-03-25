package authx

import (
	"errors"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

type UserClaims struct {
	UserID string
	Role   string
}

// UserFromRequest extracts auth user from Authorization Bearer JWT first,
// then falls back to legacy migration headers.
func UserFromRequest(r *http.Request, jwtSecret string) (UserClaims, bool) {
	authHeader := r.Header.Get("Authorization")
	if strings.HasPrefix(strings.ToLower(authHeader), "bearer ") {
		tokenString := strings.TrimSpace(authHeader[len("Bearer "):])
		claims, err := parseJWT(tokenString, jwtSecret)
		if err == nil && claims.UserID != "" {
			return claims, true
		}
	}

	userID := r.Header.Get("X-User-Id")
	if userID == "" {
		return UserClaims{}, false
	}

	return UserClaims{
		UserID: userID,
		Role:   r.Header.Get("X-User-Role"),
	}, true
}

func parseJWT(tokenString, jwtSecret string) (UserClaims, error) {
	if jwtSecret == "" {
		return UserClaims{}, errors.New("jwt secret is empty")
	}

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return []byte(jwtSecret), nil
	})
	if err != nil || !token.Valid {
		return UserClaims{}, errors.New("invalid token")
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return UserClaims{}, errors.New("invalid claims")
	}

	sub, _ := claims["sub"].(string)
	role, _ := claims["role"].(string)
	if sub == "" {
		return UserClaims{}, errors.New("missing sub")
	}

	return UserClaims{UserID: sub, Role: role}, nil
}
