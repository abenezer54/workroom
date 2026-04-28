package dto

import (
	"time"

	"github.com/google/uuid"

	"workroom/backend/internal/models"
)

type CreateClientRequest struct {
	Name        string              `json:"name" binding:"required,min=2,max=120"`
	Email       string              `json:"email" binding:"required,email,max=255"`
	CompanyName *string             `json:"company_name" binding:"omitempty,max=160"`
	Phone       *string             `json:"phone" binding:"omitempty,max=40"`
	Status      models.ClientStatus `json:"status" binding:"omitempty,oneof=ACTIVE INACTIVE ARCHIVED"`
}

type UpdateClientRequest struct {
	Name        *string              `json:"name" binding:"omitempty,min=2,max=120"`
	Email       *string              `json:"email" binding:"omitempty,email,max=255"`
	CompanyName *string              `json:"company_name" binding:"omitempty,max=160"`
	Phone       *string              `json:"phone" binding:"omitempty,max=40"`
	Status      *models.ClientStatus `json:"status" binding:"omitempty,oneof=ACTIVE INACTIVE ARCHIVED"`
}

type ClientListQuery struct {
	Status string `form:"status" binding:"omitempty,oneof=ACTIVE INACTIVE ARCHIVED"`
	Search string `form:"search" binding:"omitempty,max=120"`
}

type ClientResponse struct {
	ID          uuid.UUID           `json:"id"`
	AgencyID    uuid.UUID           `json:"agency_id"`
	Name        string              `json:"name"`
	Email       string              `json:"email"`
	CompanyName *string             `json:"company_name,omitempty"`
	Phone       *string             `json:"phone,omitempty"`
	Status      models.ClientStatus `json:"status"`
	CreatedAt   time.Time           `json:"created_at"`
	UpdatedAt   time.Time           `json:"updated_at"`
}

func ToClientResponse(client models.Client) ClientResponse {
	return ClientResponse{
		ID:          client.ID,
		AgencyID:    client.AgencyID,
		Name:        client.Name,
		Email:       client.Email,
		CompanyName: client.CompanyName,
		Phone:       client.Phone,
		Status:      client.Status,
		CreatedAt:   client.CreatedAt,
		UpdatedAt:   client.UpdatedAt,
	}
}

func ToClientResponses(clients []models.Client) []ClientResponse {
	responses := make([]ClientResponse, 0, len(clients))
	for _, client := range clients {
		responses = append(responses, ToClientResponse(client))
	}

	return responses
}
