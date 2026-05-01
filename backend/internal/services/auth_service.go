package services

import (
	"context"
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
	GoogleSignIn(ctx context.Context, req dto.GoogleAuthRequest) (*dto.AuthResponse, error)
	CurrentUser(userID uuid.UUID) (*dto.UserResponse, error)
}

type authService struct {
	users          repositories.UserRepository
	jwt            JWTService
	googleVerifier GoogleTokenVerifier
	googleClientID string
}

func NewAuthService(users repositories.UserRepository, jwt JWTService, googleVerifier GoogleTokenVerifier, googleClientID string) AuthService {
	return &authService{
		users:          users,
		jwt:            jwt,
		googleVerifier: googleVerifier,
		googleClientID: strings.TrimSpace(googleClientID),
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

func (s *authService) GoogleSignIn(ctx context.Context, req dto.GoogleAuthRequest) (*dto.AuthResponse, error) {
	if s.googleClientID == "" {
		return nil, apperrors.BadRequest("Google sign-in is not configured", nil)
	}
	if s.googleVerifier == nil {
		return nil, apperrors.Internal("Could not verify Google sign-in")
	}
	mode := strings.ToLower(strings.TrimSpace(req.Mode))
	if mode != "login" && mode != "register" {
		return nil, apperrors.BadRequest("Google authentication mode is invalid", nil)
	}

	identity, err := s.googleVerifier.Verify(ctx, req.Credential, s.googleClientID)
	if err != nil {
		return nil, apperrors.Unauthorized("Invalid Google sign-in token")
	}
	if !identity.EmailVerified {
		return nil, apperrors.Unauthorized("Google account email must be verified")
	}

	user, err := s.users.FindByGoogleSubject(identity.Subject)
	if err != nil {
		return nil, apperrors.Internal("Could not log in with Google")
	}

	if user == nil {
		user, err = s.findOrCreateGoogleUser(identity, mode)
		if err != nil {
			return nil, err
		}
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

func (s *authService) findOrCreateGoogleUser(identity *GoogleIdentity, mode string) (*models.User, error) {
	user, err := s.users.FindByEmail(identity.Email)
	if err != nil {
		return nil, apperrors.Internal("Could not log in with Google")
	}
	if user != nil {
		if user.GoogleSubject != nil && *user.GoogleSubject != identity.Subject {
			return nil, apperrors.Conflict("Email is already linked to another Google account")
		}

		if mode == "register" {
			return nil, apperrors.Conflict("Email is already registered. Log in to connect Google.")
		}

		if user.GoogleSubject == nil {
			if err := s.users.UpdateGoogleSubject(user.ID, identity.Subject); err != nil {
				return nil, apperrors.Internal("Could not link Google account")
			}
			user.GoogleSubject = &identity.Subject
		}

		return user, nil
	}

	if mode == "login" {
		return nil, apperrors.Unauthorized("No Workroom account is connected to that Google account")
	}

	subject := identity.Subject
	user = &models.User{
		Name:          displayNameFromGoogleIdentity(identity),
		Email:         identity.Email,
		PasswordHash:  "",
		GoogleSubject: &subject,
		Role:          models.RoleAgencyAdmin,
		IsActive:      true,
	}

	if err := s.users.Create(user); err != nil {
		return nil, apperrors.Internal("Could not create user")
	}

	if err := s.users.UpdateAgencyID(user.ID, user.ID); err != nil {
		return nil, apperrors.Internal("Could not assign agency ownership")
	}
	user.AgencyID = &user.ID

	return user, nil
}

func displayNameFromGoogleIdentity(identity *GoogleIdentity) string {
	name := strings.TrimSpace(identity.Name)
	if name != "" {
		return name
	}

	if at := strings.Index(identity.Email, "@"); at > 0 {
		return identity.Email[:at]
	}

	return identity.Email
}
