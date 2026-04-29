package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"workroom/backend/internal/dto"
	"workroom/backend/internal/models"
	"workroom/backend/internal/response"
	"workroom/backend/internal/services"
)

type ProjectUpdateHandler struct {
	updates services.ProjectUpdateService
}

func NewProjectUpdateHandler(updates services.ProjectUpdateService) *ProjectUpdateHandler {
	return &ProjectUpdateHandler{updates: updates}
}

func (h *ProjectUpdateHandler) ListAll(c *gin.Context) {
	agencyID, ok := agencyIDFromContext(c)
	if !ok {
		return
	}

	var projectID *uuid.UUID
	projectIDValue := c.Query("project_id")
	if projectIDValue != "" {
		parsedProjectID, err := uuid.Parse(projectIDValue)
		if err != nil {
			response.Error(c, http.StatusBadRequest, "BAD_REQUEST", "Invalid project id", nil)
			return
		}
		projectID = &parsedProjectID
	}

	updates, err := h.updates.ListAllForAgency(agencyID, projectID)
	if err != nil {
		respondAppError(c, err)
		return
	}

	response.OK(c, updates)
}

func (h *ProjectUpdateHandler) ListByProject(c *gin.Context) {
	projectID, ok := projectIDFromProjectParam(c)
	if !ok {
		return
	}

	role, ok := roleFromContext(c)
	if !ok {
		return
	}

	switch role {
	case models.RoleAgencyAdmin:
		agencyID, ok := agencyIDFromContext(c)
		if !ok {
			return
		}
		updates, err := h.updates.ListForAgency(agencyID, projectID)
		if err != nil {
			respondAppError(c, err)
			return
		}
		response.OK(c, updates)
	case models.RoleClient:
		clientID, ok := clientIDFromContext(c)
		if !ok {
			return
		}
		updates, err := h.updates.ListForClient(clientID, projectID)
		if err != nil {
			respondAppError(c, err)
			return
		}
		response.OK(c, updates)
	default:
		response.Error(c, http.StatusForbidden, "FORBIDDEN", "Permission denied", nil)
	}
}

func (h *ProjectUpdateHandler) Create(c *gin.Context) {
	agencyID, ok := agencyIDFromContext(c)
	if !ok {
		return
	}

	userID, ok := userIDFromContext(c)
	if !ok {
		return
	}

	projectID, ok := projectIDFromProjectParam(c)
	if !ok {
		return
	}

	var req dto.CreateProjectUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondValidationError(c, err)
		return
	}

	update, err := h.updates.Create(agencyID, projectID, userID, req)
	if err != nil {
		respondAppError(c, err)
		return
	}

	response.Created(c, update)
}

func (h *ProjectUpdateHandler) Recent(c *gin.Context) {
	agencyID, ok := agencyIDFromContext(c)
	if !ok {
		return
	}

	var query dto.RecentProjectUpdatesQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		respondValidationError(c, err)
		return
	}

	updates, err := h.updates.ListRecent(agencyID, query.Limit)
	if err != nil {
		respondAppError(c, err)
		return
	}

	response.OK(c, updates)
}

func userIDFromContext(c *gin.Context) (uuid.UUID, bool) {
	value, ok := c.Get("user_id")
	if !ok {
		response.Error(c, http.StatusUnauthorized, "UNAUTHORIZED", "Invalid authentication context", nil)
		return uuid.Nil, false
	}

	userID, ok := value.(uuid.UUID)
	if !ok {
		response.Error(c, http.StatusUnauthorized, "UNAUTHORIZED", "Invalid authentication context", nil)
		return uuid.Nil, false
	}

	return userID, true
}
