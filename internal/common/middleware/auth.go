package middleware

import (
	"context"
	"net/http"
	"strings"

	"pomopet/internal/common/jwt"
	"pomopet/internal/common/response"
)

type contextKey string

const (
	UserIDKey   contextKey = "user_id"
	UsernameKey contextKey = "username"
)

type AuthMiddleware struct {
	jwtManager *jwt.JWTManager
}

func NewAuthMiddleware(jwtManager *jwt.JWTManager) *AuthMiddleware {
	return &AuthMiddleware{jwtManager: jwtManager}
}

func (m *AuthMiddleware) RequireAuth(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			response.Error(w, http.StatusUnauthorized, "Thieu thong tin Authorization header")
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			response.Error(w, http.StatusUnauthorized, "Dinh dang token phai la 'Bearer <token>'")
			return
		}

		claims, err := m.jwtManager.ValidateToken(parts[1])
		if err != nil {
			response.Error(w, http.StatusUnauthorized, err.Error())
			return
		}

		ctx := context.WithValue(r.Context(), UserIDKey, claims.UserID)
		ctx = context.WithValue(ctx, UsernameKey, claims.Username)
		next(w, r.WithContext(ctx))
	}
}

// GetUserID retrieves authenticated user ID from context
func GetUserID(ctx context.Context) (string, bool) {
	val, ok := ctx.Value(UserIDKey).(string)
	return val, ok && val != ""
}

// GetUsername retrieves authenticated username from context
func GetUsername(ctx context.Context) (string, bool) {
	val, ok := ctx.Value(UsernameKey).(string)
	return val, ok && val != ""
}
