package dto

import (
	"time"

	"github.com/google/uuid"

	"workroom/backend/internal/models"
)

type CreateProjectRequest struct {
	ClientID    string               `json:"client_id" binding:"required,uuid"`
	Title       string               `json:"title" binding:"required,min=2,max=160"`
	Description *string              `json:"description" binding:"omitempty,max=2000"`
	Status      models.ProjectStatus `json:"status" binding:"omitempty,oneof=PLANNING IN_PROGRESS REVIEW COMPLETED ON_HOLD ARCHIVED"`
	StartDate   *string              `json:"start_date" binding:"omitempty,datetime=2006-01-02"`
	Deadline    *string              `json:"deadline" binding:"omitempty,datetime=2006-01-02"`
	Budget      *int                 `json:"budget" binding:"omitempty,gte=0"`
	Progress    *int                 `json:"progress" binding:"omitempty,gte=0,lte=100"`
}

type UpdateProjectRequest struct {
	ClientID    *string               `json:"client_id" binding:"omitempty,uuid"`
	Title       *string               `json:"title" binding:"omitempty,min=2,max=160"`
	Description *string               `json:"description" binding:"omitempty,max=2000"`
	Status      *models.ProjectStatus `json:"status" binding:"omitempty,oneof=PLANNING IN_PROGRESS REVIEW COMPLETED ON_HOLD ARCHIVED"`
	StartDate   *string               `json:"start_date" binding:"omitempty,datetime=2006-01-02"`
	Deadline    *string               `json:"deadline" binding:"omitempty,datetime=2006-01-02"`
	Budget      *int                  `json:"budget" binding:"omitempty,gte=0"`
	Progress    *int                  `json:"progress" binding:"omitempty,gte=0,lte=100"`
}

type ProjectListQuery struct {
	Status   string `form:"status" binding:"omitempty,oneof=PLANNING IN_PROGRESS REVIEW COMPLETED ON_HOLD ARCHIVED"`
	ClientID string `form:"client_id" binding:"omitempty,uuid"`
	Search   string `form:"search" binding:"omitempty,max=120"`
}

type ProjectResponse struct {
	ID          uuid.UUID            `json:"id"`
	AgencyID    uuid.UUID            `json:"agency_id"`
	ClientID    uuid.UUID            `json:"client_id"`
	Title       string               `json:"title"`
	Description *string              `json:"description,omitempty"`
	Status      models.ProjectStatus `json:"status"`
	StartDate   *string              `json:"start_date,omitempty"`
	Deadline    *string              `json:"deadline,omitempty"`
	Budget      int                  `json:"budget"`
	Progress    int                  `json:"progress"`
	CreatedAt   time.Time            `json:"created_at"`
	UpdatedAt   time.Time            `json:"updated_at"`
}

func ToProjectResponse(project models.Project) ProjectResponse {
	return ProjectResponse{
		ID:          project.ID,
		AgencyID:    project.AgencyID,
		ClientID:    project.ClientID,
		Title:       project.Title,
		Description: project.Description,
		Status:      project.Status,
		StartDate:   formatDate(project.StartDate),
		Deadline:    formatDate(project.Deadline),
		Budget:      project.Budget,
		Progress:    project.Progress,
		CreatedAt:   project.CreatedAt,
		UpdatedAt:   project.UpdatedAt,
	}
}

func ToProjectResponses(projects []models.Project) []ProjectResponse {
	responses := make([]ProjectResponse, 0, len(projects))
	for _, project := range projects {
		responses = append(responses, ToProjectResponse(project))
	}

	return responses
}

func formatDate(value *time.Time) *string {
	if value == nil {
		return nil
	}

	formatted := value.Format("2006-01-02")
	return &formatted
}
