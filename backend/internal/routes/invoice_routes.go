package routes

import (
	"github.com/gin-gonic/gin"

	"workroom/backend/internal/handlers"
	"workroom/backend/internal/middleware"
	"workroom/backend/internal/models"
	"workroom/backend/internal/services"
)

func RegisterInvoiceRoutes(api *gin.RouterGroup, handler *handlers.InvoiceHandler, jwtService services.JWTService) {
	invoices := api.Group("/invoices")
	invoices.Use(middleware.Auth(jwtService))
	invoices.GET("", middleware.RequireRole(models.RoleAgencyAdmin, models.RoleClient), handler.List)
	invoices.POST("", middleware.RequireRole(models.RoleAgencyAdmin), handler.Create)
	invoices.GET("/:id", middleware.RequireRole(models.RoleAgencyAdmin, models.RoleClient), handler.GetByID)
	invoices.PATCH("/:id", middleware.RequireRole(models.RoleAgencyAdmin), handler.Update)
	invoices.PATCH("/:id/status", middleware.RequireRole(models.RoleAgencyAdmin), handler.UpdateStatus)
	invoices.DELETE("/:id", middleware.RequireRole(models.RoleAgencyAdmin), handler.Cancel)
}
