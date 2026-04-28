package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"

	"workroom/backend/internal/models"
	"workroom/backend/internal/response"
	"workroom/backend/internal/services"
)

func Auth(jwtService services.JWTService) gin.HandlerFunc {
	return func(c *gin.Context) {
		header := strings.TrimSpace(c.GetHeader("Authorization"))
		if header == "" {
			response.Error(c, http.StatusUnauthorized, "UNAUTHORIZED", "Authentication is required", nil)
			c.Abort()
			return
		}

		parts := strings.SplitN(header, " ", 2)
		if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") || strings.TrimSpace(parts[1]) == "" {
			response.Error(c, http.StatusUnauthorized, "UNAUTHORIZED", "Invalid authorization header", nil)
			c.Abort()
			return
		}

		claims, err := jwtService.Validate(strings.TrimSpace(parts[1]))
		if err != nil {
			response.Error(c, http.StatusUnauthorized, "UNAUTHORIZED", "Invalid or expired token", nil)
			c.Abort()
			return
		}

		c.Set("user_id", claims.UserID)
		c.Set("role", claims.Role)
		if claims.AgencyID != nil {
			c.Set("agency_id", *claims.AgencyID)
		}
		if claims.ClientID != nil {
			c.Set("client_id", *claims.ClientID)
		}

		c.Next()
	}
}

func RequireRole(allowedRoles ...models.UserRole) gin.HandlerFunc {
	return func(c *gin.Context) {
		value, ok := c.Get("role")
		if !ok {
			response.Error(c, http.StatusUnauthorized, "UNAUTHORIZED", "Authentication is required", nil)
			c.Abort()
			return
		}

		role, ok := value.(models.UserRole)
		if !ok {
			response.Error(c, http.StatusForbidden, "FORBIDDEN", "Permission denied", nil)
			c.Abort()
			return
		}

		for _, allowedRole := range allowedRoles {
			if role == allowedRole {
				c.Next()
				return
			}
		}

		response.Error(c, http.StatusForbidden, "FORBIDDEN", "Permission denied", nil)
		c.Abort()
	}
}
