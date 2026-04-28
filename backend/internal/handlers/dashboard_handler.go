package handlers

import (
	"workroom/backend/internal/response"
	"workroom/backend/internal/services"

	"github.com/gin-gonic/gin"
)

type DashboardHandler struct {
	dashboard services.DashboardService
}

func NewDashboardHandler(dashboard services.DashboardService) *DashboardHandler {
	return &DashboardHandler{dashboard: dashboard}
}

func (h *DashboardHandler) Admin(c *gin.Context) {
	agencyID, ok := agencyIDFromContext(c)
	if !ok {
		return
	}

	dashboard, err := h.dashboard.AdminDashboard(agencyID)
	if err != nil {
		respondAppError(c, err)
		return
	}

	response.OK(c, dashboard)
}

func (h *DashboardHandler) Client(c *gin.Context) {
	clientID, ok := clientIDFromContext(c)
	if !ok {
		return
	}

	dashboard, err := h.dashboard.ClientDashboard(clientID)
	if err != nil {
		respondAppError(c, err)
		return
	}

	response.OK(c, dashboard)
}
