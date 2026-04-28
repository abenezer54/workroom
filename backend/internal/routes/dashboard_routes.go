package routes

import (
	"github.com/gin-gonic/gin"

	"workroom/backend/internal/handlers"
	"workroom/backend/internal/middleware"
	"workroom/backend/internal/models"
	"workroom/backend/internal/services"
)

func RegisterDashboardRoutes(api *gin.RouterGroup, handler *handlers.DashboardHandler, jwtService services.JWTService) {
	dashboard := api.Group("/dashboard")
	dashboard.Use(middleware.Auth(jwtService))
	dashboard.GET("/admin", middleware.RequireRole(models.RoleAgencyAdmin), handler.Admin)
	dashboard.GET("/client", middleware.RequireRole(models.RoleClient), handler.Client)
}
