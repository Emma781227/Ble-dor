package auth

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"ble-dor/backend-go/internal/httpx"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type Handler struct {
	repo      *Repository
	jwtSecret string
	appURL    string
}

func NewHandler(repo *Repository, jwtSecret, appURL string) *Handler {
	return &Handler{repo: repo, jwtSecret: jwtSecret, appURL: appURL}
}

func (h *Handler) Register() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			Name     string `json:"name"`
			Email    string `json:"email"`
			Phone    string `json:"phone"`
			Password string `json:"password"`
		}

		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			httpx.Error(w, http.StatusBadRequest, "Invalid request body")
			return
		}

		normalizedEmail := strings.TrimSpace(strings.ToLower(req.Email))
		if normalizedEmail == "" || req.Password == "" {
			httpx.Error(w, http.StatusBadRequest, "Email et mot de passe sont obligatoires.")
			return
		}
		if len(req.Password) < 6 {
			httpx.Error(w, http.StatusBadRequest, "Le mot de passe doit contenir au moins 6 caracteres.")
			return
		}

		existing, err := h.repo.FindUserByEmail(r.Context(), normalizedEmail)
		if err != nil {
			httpx.Error(w, http.StatusInternalServerError, "Erreur serveur.")
			return
		}
		if existing != nil {
			httpx.Error(w, http.StatusBadRequest, "Un compte existe deja avec cet email.")
			return
		}

		hashed, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			httpx.Error(w, http.StatusInternalServerError, "Erreur serveur.")
			return
		}

		var namePtr *string
		if v := strings.TrimSpace(req.Name); v != "" {
			namePtr = &v
		}
		var phonePtr *string
		if v := strings.TrimSpace(req.Phone); v != "" {
			phonePtr = &v
		}
		hashStr := string(hashed)

		user, err := h.repo.CreateUser(r.Context(), uuid.NewString(), normalizedEmail, namePtr, phonePtr, &hashStr, "CLIENT")
		if err != nil {
			httpx.Error(w, http.StatusInternalServerError, "Erreur serveur pendant l'inscription.")
			return
		}

		httpx.JSON(w, http.StatusCreated, map[string]any{
			"success": true,
			"user": map[string]any{
				"id":    user.ID,
				"email": user.Email,
				"name":  user.Name,
				"role":  user.Role,
			},
		})
	})
}

func (h *Handler) Login() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			Email    string `json:"email"`
			Password string `json:"password"`
		}

		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			httpx.Error(w, http.StatusBadRequest, "Invalid request body")
			return
		}

		email := strings.TrimSpace(strings.ToLower(req.Email))
		if email == "" || req.Password == "" {
			httpx.Error(w, http.StatusBadRequest, "Email et mot de passe obligatoires.")
			return
		}

		user, err := h.repo.FindUserByEmail(r.Context(), email)
		if err != nil || user == nil || user.PasswordHash == nil {
			httpx.Error(w, http.StatusUnauthorized, "Identifiants invalides.")
			return
		}

		if bcrypt.CompareHashAndPassword([]byte(*user.PasswordHash), []byte(req.Password)) != nil {
			httpx.Error(w, http.StatusUnauthorized, "Identifiants invalides.")
			return
		}

		token, err := h.issueJWT(user)
		if err != nil {
			httpx.Error(w, http.StatusInternalServerError, "Erreur serveur.")
			return
		}

		httpx.JSON(w, http.StatusOK, map[string]any{
			"token": token,
			"user": map[string]any{
				"id":    user.ID,
				"email": user.Email,
				"name":  user.Name,
				"role":  user.Role,
			},
		})
	})
}

func (h *Handler) ForgotPassword() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			Email string `json:"email"`
		}

		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			httpx.Error(w, http.StatusBadRequest, "Invalid request body")
			return
		}

		email := strings.TrimSpace(strings.ToLower(req.Email))
		if email == "" {
			httpx.Error(w, http.StatusBadRequest, "Email requis.")
			return
		}

		user, err := h.repo.FindUserByEmail(r.Context(), email)
		if err != nil {
			httpx.Error(w, http.StatusInternalServerError, "Erreur serveur.")
			return
		}

		message := "Si un compte existe avec cet email, un lien de reinitialisation a ete genere."
		if user == nil {
			httpx.JSON(w, http.StatusOK, map[string]any{"success": true, "message": message})
			return
		}

		_ = h.repo.DeleteResetTokensByUserID(r.Context(), user.ID)

		tokenBytes := make([]byte, 32)
		if _, err := rand.Read(tokenBytes); err != nil {
			httpx.Error(w, http.StatusInternalServerError, "Erreur serveur.")
			return
		}
		token := hex.EncodeToString(tokenBytes)
		expiresAt := time.Now().Add(1 * time.Hour)

		if err := h.repo.CreateResetToken(r.Context(), uuid.NewString(), token, user.ID, expiresAt); err != nil {
			httpx.Error(w, http.StatusInternalServerError, "Erreur serveur.")
			return
		}

		appURL := h.appURL
		if appURL == "" {
			appURL = "http://localhost:3000"
		}
		resetURL := appURL + "/reset-password?token=" + token
		println("Reset URL:", resetURL)

		httpx.JSON(w, http.StatusOK, map[string]any{"success": true, "message": message})
	})
}

func (h *Handler) ResetPassword() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			Token    string `json:"token"`
			Password string `json:"password"`
		}

		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			httpx.Error(w, http.StatusBadRequest, "Invalid request body")
			return
		}

		if req.Token == "" || req.Password == "" {
			httpx.Error(w, http.StatusBadRequest, "Token et mot de passe sont requis.")
			return
		}
		if len(req.Password) < 6 {
			httpx.Error(w, http.StatusBadRequest, "Le mot de passe doit contenir au moins 6 caracteres.")
			return
		}

		resetToken, err := h.repo.GetResetToken(r.Context(), req.Token)
		if err != nil {
			httpx.Error(w, http.StatusInternalServerError, "Erreur serveur.")
			return
		}
		if resetToken == nil || resetToken.ExpiresAt.Before(time.Now()) {
			httpx.Error(w, http.StatusBadRequest, "Lien de reinitialisation invalide ou expire.")
			return
		}

		hashed, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			httpx.Error(w, http.StatusInternalServerError, "Erreur serveur.")
			return
		}

		if err := h.repo.UpdatePasswordAndConsumeResetToken(r.Context(), resetToken.UserID, resetToken.ID, string(hashed)); err != nil {
			httpx.Error(w, http.StatusInternalServerError, "Erreur serveur.")
			return
		}

		httpx.JSON(w, http.StatusOK, map[string]any{"success": true, "message": "Mot de passe mis a jour."})
	})
}

func (h *Handler) issueJWT(user *User) (string, error) {
	now := time.Now()
	claims := jwt.MapClaims{
		"sub":  user.ID,
		"role": user.Role,
		"iat":  now.Unix(),
		"exp":  now.Add(24 * time.Hour).Unix(),
		"iss":  "ble-dor-go-api",
		"aud":  "ble-dor-app",
	}
	if user.Email != "" {
		claims["email"] = user.Email
	}
	if user.Name != nil {
		claims["name"] = *user.Name
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(h.jwtSecret))
}
