package dto

import (
	"time"

	"github.com/google/uuid"

	"workroom/backend/internal/models"
)

type CreateProjectUpdateRequest struct {
	Title   string `json:"title" binding:"required,min=2,max=160"`
	Content string `json:"content" binding:"required,min=2,max=5000"`
}

type RecentProjectUpdatesQuery struct {
	Limit int `form:"limit" binding:"omitempty,gte=1,lte=50"`
}

type ProjectUpdateResponse struct {
	ID        uuid.UUID `json:"id"`
	AgencyID  uuid.UUID `json:"agency_id"`
	ProjectID uuid.UUID `json:"project_id"`
	Title     string    `json:"title"`
	Content   string    `json:"content"`
	CreatedBy uuid.UUID `json:"created_by"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func ToProjectUpdateResponse(update models.ProjectUpdate) ProjectUpdateResponse {
	return ProjectUpdateResponse{
		ID:        update.ID,
		AgencyID:  update.AgencyID,
		ProjectID: update.ProjectID,
		Title:     update.Title,
		Content:   update.Content,
		CreatedBy: update.CreatedBy,
		CreatedAt: update.CreatedAt,
		UpdatedAt: update.UpdatedAt,
	}
}

func ToProjectUpdateResponses(updates []models.ProjectUpdate) []ProjectUpdateResponse {
	responses := make([]ProjectUpdateResponse, 0, len(updates))
	for _, update := range updates {
		responses = append(responses, ToProjectUpdateResponse(update))
	}

	return responses
}
