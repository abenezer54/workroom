package routes

import (
	"github.com/gin-gonic/gin"

	"workroom/backend/internal/handlers"
	"workroom/backend/internal/middleware"
	"workroom/backend/internal/models"
	"workroom/backend/internal/services"
)

func RegisterAuthRoutes(api *gin.RouterGroup, handler *handlers.AuthHandler, jwtService services.JWTService) {
	auth := api.Group("/auth")
	auth.POST("/register", handler.Register)
	auth.POST("/login", handler.Login)
	auth.POST("/google", handler.Google)
	auth.GET("/me", middleware.Auth(jwtService), middleware.RequireRole(models.RoleAgencyAdmin, models.RoleClient), handler.Me)
}
