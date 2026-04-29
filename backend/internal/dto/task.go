package dto

import (
	"time"

	"github.com/google/uuid"

	"workroom/backend/internal/models"
)

type CreateTaskRequest struct {
	Title       string              `json:"title" binding:"required,min=2,max=160"`
	Description *string             `json:"description" binding:"omitempty,max=2000"`
	Status      models.TaskStatus   `json:"status" binding:"omitempty,oneof=TODO IN_PROGRESS DONE"`
	Priority    models.TaskPriority `json:"priority" binding:"omitempty,oneof=LOW MEDIUM HIGH URGENT"`
	DueDate     *string             `json:"due_date" binding:"omitempty,datetime=2006-01-02"`
}

type UpdateTaskRequest struct {
	Title       *string              `json:"title" binding:"omitempty,min=2,max=160"`
	Description *string              `json:"description" binding:"omitempty,max=2000"`
	Status      *models.TaskStatus   `json:"status" binding:"omitempty,oneof=TODO IN_PROGRESS DONE"`
	Priority    *models.TaskPriority `json:"priority" binding:"omitempty,oneof=LOW MEDIUM HIGH URGENT"`
	DueDate     *string              `json:"due_date" binding:"omitempty,datetime=2006-01-02"`
}

type TaskListQuery struct {
	Status    string `form:"status" binding:"omitempty,oneof=TODO IN_PROGRESS DONE"`
	Priority  string `form:"priority" binding:"omitempty,oneof=LOW MEDIUM HIGH URGENT"`
	ProjectID string `form:"project_id" binding:"omitempty,uuid"`
}

type TaskResponse struct {
	ID          uuid.UUID           `json:"id"`
	AgencyID    uuid.UUID           `json:"agency_id"`
	ProjectID   uuid.UUID           `json:"project_id"`
	Title       string              `json:"title"`
	Description *string             `json:"description,omitempty"`
	Status      models.TaskStatus   `json:"status"`
	Priority    models.TaskPriority `json:"priority"`
	DueDate     *string             `json:"due_date,omitempty"`
	CreatedAt   time.Time           `json:"created_at"`
	UpdatedAt   time.Time           `json:"updated_at"`
}

type AgencyTaskResponse struct {
	ID           uuid.UUID           `json:"id"`
	AgencyID     uuid.UUID           `json:"agency_id"`
	ProjectID    uuid.UUID           `json:"project_id"`
	ProjectTitle string              `json:"project_title"`
	Title        string              `json:"title"`
	Description  *string             `json:"description,omitempty"`
	Status       models.TaskStatus   `json:"status"`
	Priority     models.TaskPriority `json:"priority"`
	DueDate      *string             `json:"due_date,omitempty"`
	CreatedAt    time.Time           `json:"created_at"`
	UpdatedAt    time.Time           `json:"updated_at"`
}

func ToTaskResponse(task models.Task) TaskResponse {
	return TaskResponse{
		ID:          task.ID,
		AgencyID:    task.AgencyID,
		ProjectID:   task.ProjectID,
		Title:       task.Title,
		Description: task.Description,
		Status:      task.Status,
		Priority:    task.Priority,
		DueDate:     formatDate(task.DueDate),
		CreatedAt:   task.CreatedAt,
		UpdatedAt:   task.UpdatedAt,
	}
}

func ToTaskResponses(tasks []models.Task) []TaskResponse {
	responses := make([]TaskResponse, 0, len(tasks))
	for _, task := range tasks {
		responses = append(responses, ToTaskResponse(task))
	}

	return responses
}
