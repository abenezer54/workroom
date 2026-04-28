package routes

import (
	"github.com/gin-gonic/gin"

	"workroom/backend/internal/handlers"
	"workroom/backend/internal/middleware"
	"workroom/backend/internal/models"
	"workroom/backend/internal/services"
)

func RegisterClientRoutes(api *gin.RouterGroup, handler *handlers.ClientHandler, jwtService services.JWTService) {
	clients := api.Group("/clients")
	clients.Use(middleware.Auth(jwtService), middleware.RequireRole(models.RoleAgencyAdmin))
	clients.GET("", handler.List)
	clients.POST("", handler.Create)
	clients.GET("/:id", handler.GetByID)
	clients.PATCH("/:id", handler.Update)
	clients.DELETE("/:id", handler.Archive)
}
