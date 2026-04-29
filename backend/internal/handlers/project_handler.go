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

type ProjectHandler struct {
	projects services.ProjectService
}

func NewProjectHandler(projects services.ProjectService) *ProjectHandler {
	return &ProjectHandler{projects: projects}
}

func (h *ProjectHandler) List(c *gin.Context) {
	var query dto.ProjectListQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		respondValidationError(c, err)
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
		projects, err := h.projects.List(agencyID, query)
		if err != nil {
			respondAppError(c, err)
			return
		}
		response.OK(c, projects)
	case models.RoleClient:
		clientID, ok := clientIDFromContext(c)
		if !ok {
			return
		}
		projects, err := h.projects.ListForClient(clientID, query)
		if err != nil {
			respondAppError(c, err)
			return
		}
		response.OK(c, projects)
	default:
		response.Error(c, http.StatusForbidden, "FORBIDDEN", "Permission denied", nil)
	}
}

func (h *ProjectHandler) Create(c *gin.Context) {
	agencyID, ok := agencyIDFromContext(c)
	if !ok {
		return
	}

	var req dto.CreateProjectRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondValidationError(c, err)
		return
	}

	project, err := h.projects.Create(agencyID, req)
	if err != nil {
		respondAppError(c, err)
		return
	}

	response.Created(c, project)
}

func (h *ProjectHandler) GetByID(c *gin.Context) {
	projectID, ok := projectIDFromParam(c)
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
		project, err := h.projects.GetForAgency(agencyID, projectID)
		if err != nil {
			respondAppError(c, err)
			return
		}
		response.OK(c, project)
	case models.RoleClient:
		clientID, ok := clientIDFromContext(c)
		if !ok {
			return
		}
		project, err := h.projects.GetForClient(clientID, projectID)
		if err != nil {
			respondAppError(c, err)
			return
		}
		response.OK(c, project)
	default:
		response.Error(c, http.StatusForbidden, "FORBIDDEN", "Permission denied", nil)
	}
}

func (h *ProjectHandler) Update(c *gin.Context) {
	agencyID, ok := agencyIDFromContext(c)
	if !ok {
		return
	}

	projectID, ok := projectIDFromParam(c)
	if !ok {
		return
	}

	var req dto.UpdateProjectRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondValidationError(c, err)
		return
	}

	project, err := h.projects.Update(agencyID, projectID, req)
	if err != nil {
		respondAppError(c, err)
		return
	}

	response.OK(c, project)
}

func (h *ProjectHandler) Archive(c *gin.Context) {
	agencyID, ok := agencyIDFromContext(c)
	if !ok {
		return
	}

	projectID, ok := projectIDFromParam(c)
	if !ok {
		return
	}

	if err := h.projects.Archive(agencyID, projectID); err != nil {
		respondAppError(c, err)
		return
	}

	response.OKWithMessage(c, nil, "Project archived successfully")
}

func roleFromContext(c *gin.Context) (models.UserRole, bool) {
	value, ok := c.Get("role")
	if !ok {
		response.Error(c, http.StatusUnauthorized, "UNAUTHORIZED", "Invalid authentication context", nil)
		return "", false
	}

	role, ok := value.(models.UserRole)
	if !ok {
		response.Error(c, http.StatusUnauthorized, "UNAUTHORIZED", "Invalid authentication context", nil)
		return "", false
	}

	return role, true
}

func clientIDFromContext(c *gin.Context) (uuid.UUID, bool) {
	value, ok := c.Get("client_id")
	if !ok {
		response.Error(c, http.StatusForbidden, "FORBIDDEN", "Client account is not linked to a client profile", nil)
		return uuid.Nil, false
	}

	clientID, ok := value.(uuid.UUID)
	if !ok {
		response.Error(c, http.StatusForbidden, "FORBIDDEN", "Client account is not linked to a client profile", nil)
		return uuid.Nil, false
	}

	return clientID, true
}

func projectIDFromParam(c *gin.Context) (uuid.UUID, bool) {
	projectID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.Error(c, http.StatusBadRequest, "BAD_REQUEST", "Invalid project id", nil)
		return uuid.Nil, false
	}

	return projectID, true
}
