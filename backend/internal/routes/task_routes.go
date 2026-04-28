package routes

import (
	"github.com/gin-gonic/gin"

	"workroom/backend/internal/handlers"
	"workroom/backend/internal/middleware"
	"workroom/backend/internal/models"
	"workroom/backend/internal/services"
)

func RegisterTaskRoutes(api *gin.RouterGroup, handler *handlers.TaskHandler, jwtService services.JWTService) {
	projectTasks := api.Group("/projects/:id/tasks")
	projectTasks.Use(middleware.Auth(jwtService))
	projectTasks.GET("", middleware.RequireRole(models.RoleAgencyAdmin, models.RoleClient), handler.ListByProject)
	projectTasks.POST("", middleware.RequireRole(models.RoleAgencyAdmin), handler.Create)

	tasks := api.Group("/tasks")
	tasks.Use(middleware.Auth(jwtService), middleware.RequireRole(models.RoleAgencyAdmin))
	tasks.PATCH("/:id", handler.Update)
	tasks.DELETE("/:id", handler.Delete)
}
