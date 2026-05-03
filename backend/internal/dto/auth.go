package dto

import (
	"time"

	"github.com/google/uuid"

	"workroom/backend/internal/models"
)

type RegisterRequest struct {
	Name     string `json:"name" binding:"required,min=2,max=120"`
	Email    string `json:"email" binding:"required,email,max=255"`
	Password string `json:"password" binding:"required,min=8,max=128"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email,max=255"`
	Password string `json:"password" binding:"required,min=8,max=128"`
}

type GoogleAuthRequest struct {
	Credential string `json:"credential" binding:"required,max=4096"`
	Mode       string `json:"mode" binding:"required,oneof=login register"`
}

type VerifyEmailRequest struct {
	Token string `json:"token" binding:"required"`
}

type AuthResponse struct {
	User        UserResponse `json:"user"`
	AccessToken string       `json:"access_token"`
}

type UserResponse struct {
	ID          uuid.UUID       `json:"id"`
	AgencyID    *uuid.UUID      `json:"agency_id,omitempty"`
	Name        string          `json:"name"`
	Email       string          `json:"email"`
	Role        models.UserRole `json:"role"`
	ClientID    *uuid.UUID      `json:"client_id"`
	IsActive    bool            `json:"is_active"`
	LastLoginAt *time.Time      `json:"last_login_at,omitempty"`
	CreatedAt   time.Time       `json:"created_at"`
	UpdatedAt   time.Time       `json:"updated_at"`
}

func ToUserResponse(user models.User) UserResponse {
	return UserResponse{
		ID:          user.ID,
		AgencyID:    user.AgencyID,
		Name:        user.Name,
		Email:       user.Email,
		Role:        user.Role,
		ClientID:    user.ClientID,
		IsActive:    user.IsActive,
		LastLoginAt: user.LastLoginAt,
		CreatedAt:   user.CreatedAt,
		UpdatedAt:   user.UpdatedAt,
	}
}
