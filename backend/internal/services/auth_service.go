package services

import (
	"strings"
	"time"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"

	"workroom/backend/internal/dto"
	apperrors "workroom/backend/internal/errors"
	"workroom/backend/internal/models"
	"workroom/backend/internal/repositories"
)

type AuthService interface {
	RegisterAgencyAdmin(req dto.RegisterRequest) (*dto.AuthResponse, error)
	Login(req dto.LoginRequest) (*dto.AuthResponse, error)
	CurrentUser(userID uuid.UUID) (*dto.UserResponse, error)
}

type authService struct {
	users repositories.UserRepository
	jwt   JWTService
}

func NewAuthService(users repositories.UserRepository, jwt JWTService) AuthService {
	return &authService{
		users: users,
		jwt:   jwt,
	}
}

func (s *authService) RegisterAgencyAdmin(req dto.RegisterRequest) (*dto.AuthResponse, error) {
	email := strings.ToLower(strings.TrimSpace(req.Email))

	exists, err := s.users.EmailExists(email)
	if err != nil {
		return nil, apperrors.Internal("Could not check email availability")
	}
	if exists {
		return nil, apperrors.Conflict("Email is already registered")
	}

	passwordHash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, apperrors.Internal("Could not secure password")
	}

	user := &models.User{
		Name:         strings.TrimSpace(req.Name),
		Email:        email,
		PasswordHash: string(passwordHash),
		Role:         models.RoleAgencyAdmin,
		IsActive:     true,
	}

	if err := s.users.Create(user); err != nil {
		return nil, apperrors.Internal("Could not create user")
	}

	if err := s.users.UpdateAgencyID(user.ID, user.ID); err != nil {
		return nil, apperrors.Internal("Could not assign agency ownership")
	}
	user.AgencyID = &user.ID

	token, err := s.jwt.Generate(*user)
	if err != nil {
		return nil, apperrors.Internal("Could not create access token")
	}

	return &dto.AuthResponse{
		User:        dto.ToUserResponse(*user),
		AccessToken: token,
	}, nil
}

func (s *authService) Login(req dto.LoginRequest) (*dto.AuthResponse, error) {
	user, err := s.users.FindByEmail(req.Email)
	if err != nil {
		return nil, apperrors.Internal("Could not log in")
	}
	if user == nil {
		return nil, apperrors.Unauthorized("Invalid email or password")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return nil, apperrors.Unauthorized("Invalid email or password")
	}

	if !user.IsActive {
		return nil, apperrors.Forbidden("User account is inactive")
	}

	now := time.Now().UTC()
	if err := s.users.UpdateLastLoginAt(user.ID, now); err != nil {
		return nil, apperrors.Internal("Could not update login timestamp")
	}
	user.LastLoginAt = &now

	token, err := s.jwt.Generate(*user)
	if err != nil {
		return nil, apperrors.Internal("Could not create access token")
	}

	return &dto.AuthResponse{
		User:        dto.ToUserResponse(*user),
		AccessToken: token,
	}, nil
}

func (s *authService) CurrentUser(userID uuid.UUID) (*dto.UserResponse, error) {
	user, err := s.users.FindByID(userID)
	if err != nil {
		return nil, apperrors.Internal("Could not load current user")
	}
	if user == nil || !user.IsActive {
		return nil, apperrors.Unauthorized("Invalid or expired token")
	}

	response := dto.ToUserResponse(*user)
	return &response, nil
}
