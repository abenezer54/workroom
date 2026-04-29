package routes

import (
	"github.com/gin-gonic/gin"

	"workroom/backend/internal/handlers"
	"workroom/backend/internal/middleware"
	"workroom/backend/internal/models"
	"workroom/backend/internal/services"
)

func RegisterProjectRoutes(api *gin.RouterGroup, handler *handlers.ProjectHandler, jwtService services.JWTService) {
	projects := api.Group("/projects")
	projects.Use(middleware.Auth(jwtService))
	projects.GET("", middleware.RequireRole(models.RoleAgencyAdmin, models.RoleClient), handler.List)
	projects.POST("", middleware.RequireRole(models.RoleAgencyAdmin), handler.Create)
	projects.GET("/:id", middleware.RequireRole(models.RoleAgencyAdmin, models.RoleClient), handler.GetByID)
	projects.PATCH("/:id", middleware.RequireRole(models.RoleAgencyAdmin), handler.Update)
	projects.DELETE("/:id", middleware.RequireRole(models.RoleAgencyAdmin), handler.Archive)
}
