package handlers

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"

	"workroom/backend/internal/dto"
	apperrors "workroom/backend/internal/errors"
	"workroom/backend/internal/response"
	"workroom/backend/internal/services"
)

type AuthHandler struct {
	auth services.AuthService
}

func NewAuthHandler(auth services.AuthService) *AuthHandler {
	return &AuthHandler{auth: auth}
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req dto.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondValidationError(c, err)
		return
	}

	result, err := h.auth.RegisterAgencyAdmin(req)
	if err != nil {
		respondAppError(c, err)
		return
	}

	response.Created(c, result)
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req dto.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondValidationError(c, err)
		return
	}

	result, err := h.auth.Login(req)
	if err != nil {
		respondAppError(c, err)
		return
	}

	response.OK(c, result)
}

func (h *AuthHandler) Me(c *gin.Context) {
	userID, ok := c.Get("user_id")
	if !ok {
		response.Error(c, http.StatusUnauthorized, "UNAUTHORIZED", "Authentication is required", nil)
		return
	}

	id, ok := userID.(uuid.UUID)
	if !ok {
		response.Error(c, http.StatusUnauthorized, "UNAUTHORIZED", "Invalid authentication context", nil)
		return
	}

	user, err := h.auth.CurrentUser(id)
	if err != nil {
		respondAppError(c, err)
		return
	}

	response.OK(c, user)
}

func respondAppError(c *gin.Context, err error) {
	var appErr apperrors.AppError
	if errors.As(err, &appErr) {
		response.Error(c, appErr.Status, appErr.Code, appErr.Message, appErr.Details)
		return
	}

	response.Error(c, http.StatusInternalServerError, "INTERNAL_SERVER_ERROR", "Unexpected server error", nil)
}

func respondValidationError(c *gin.Context, err error) {
	details := map[string]string{}

	var validationErrors validator.ValidationErrors
	if errors.As(err, &validationErrors) {
		for _, fieldErr := range validationErrors {
			details[fieldErr.Field()] = validationMessage(fieldErr)
		}
	} else {
		details["body"] = "Request body must be valid JSON"
	}

	response.Error(c, http.StatusUnprocessableEntity, "VALIDATION_ERROR", "One or more fields are invalid", details)
}

func validationMessage(fieldErr validator.FieldError) string {
	switch fieldErr.Tag() {
	case "required":
		return "This field is required"
	case "email":
		return "Must be a valid email address"
	case "min":
		return "Value is too short"
	case "max":
		return "Value is too long"
	default:
		return "Invalid value"
	}
}
