package routes

import (
	"github.com/gin-gonic/gin"

	"workroom/backend/internal/handlers"
	"workroom/backend/internal/middleware"
	"workroom/backend/internal/models"
	"workroom/backend/internal/services"
)

func RegisterProjectUpdateRoutes(api *gin.RouterGroup, handler *handlers.ProjectUpdateHandler, jwtService services.JWTService) {
	projectUpdates := api.Group("/projects/:id/updates")
	projectUpdates.Use(middleware.Auth(jwtService))
	projectUpdates.GET("", middleware.RequireRole(models.RoleAgencyAdmin, models.RoleClient), handler.ListByProject)
	projectUpdates.POST("", middleware.RequireRole(models.RoleAgencyAdmin), handler.Create)

	updates := api.Group("/updates")
	updates.Use(middleware.Auth(jwtService), middleware.RequireRole(models.RoleAgencyAdmin))
	updates.GET("/recent", handler.Recent)
}
