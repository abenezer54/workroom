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

type TaskHandler struct {
	tasks services.TaskService
}

func NewTaskHandler(tasks services.TaskService) *TaskHandler {
	return &TaskHandler{tasks: tasks}
}

func (h *TaskHandler) ListByProject(c *gin.Context) {
	projectID, ok := projectIDFromProjectParam(c)
	if !ok {
		return
	}

	var query dto.TaskListQuery
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
		tasks, err := h.tasks.ListForAgency(agencyID, projectID, query)
		if err != nil {
			respondAppError(c, err)
			return
		}
		response.OK(c, tasks)
	case models.RoleClient:
		clientID, ok := clientIDFromContext(c)
		if !ok {
			return
		}
		tasks, err := h.tasks.ListForClient(clientID, projectID, query)
		if err != nil {
			respondAppError(c, err)
			return
		}
		response.OK(c, tasks)
	default:
		response.Error(c, http.StatusForbidden, "FORBIDDEN", "Permission denied", nil)
	}
}

func (h *TaskHandler) Create(c *gin.Context) {
	agencyID, ok := agencyIDFromContext(c)
	if !ok {
		return
	}

	projectID, ok := projectIDFromProjectParam(c)
	if !ok {
		return
	}

	var req dto.CreateTaskRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondValidationError(c, err)
		return
	}

	task, err := h.tasks.Create(agencyID, projectID, req)
	if err != nil {
		respondAppError(c, err)
		return
	}

	response.Created(c, task)
}

func (h *TaskHandler) Update(c *gin.Context) {
	agencyID, ok := agencyIDFromContext(c)
	if !ok {
		return
	}

	taskID, ok := taskIDFromParam(c)
	if !ok {
		return
	}

	var req dto.UpdateTaskRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondValidationError(c, err)
		return
	}

	task, err := h.tasks.Update(agencyID, taskID, req)
	if err != nil {
		respondAppError(c, err)
		return
	}

	response.OK(c, task)
}

func (h *TaskHandler) Delete(c *gin.Context) {
	agencyID, ok := agencyIDFromContext(c)
	if !ok {
		return
	}

	taskID, ok := taskIDFromParam(c)
	if !ok {
		return
	}

	if err := h.tasks.Delete(agencyID, taskID); err != nil {
		respondAppError(c, err)
		return
	}

	response.OKWithMessage(c, nil, "Task deleted successfully")
}

func projectIDFromProjectParam(c *gin.Context) (uuid.UUID, bool) {
	projectID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.Error(c, http.StatusBadRequest, "BAD_REQUEST", "Invalid project id", nil)
		return uuid.Nil, false
	}

	return projectID, true
}

func taskIDFromParam(c *gin.Context) (uuid.UUID, bool) {
	taskID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.Error(c, http.StatusBadRequest, "BAD_REQUEST", "Invalid task id", nil)
		return uuid.Nil, false
	}

	return taskID, true
}
