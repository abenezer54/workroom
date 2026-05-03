package services

import (
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"

	"workroom/backend/internal/models"
)

type Claims struct {
	UserID   uuid.UUID       `json:"user_id"`
	Role     models.UserRole `json:"role"`
	AgencyID *uuid.UUID      `json:"agency_id,omitempty"`
	ClientID *uuid.UUID      `json:"client_id,omitempty"`
	Purpose  string          `json:"purpose,omitempty"`
	jwt.RegisteredClaims
}

type JWTService interface {
	Generate(user models.User) (string, error)
	Validate(tokenString string) (*Claims, error)
	GenerateVerificationToken(userID uuid.UUID) (string, error)
	ValidateVerificationToken(tokenString string) (*Claims, error)
}

type jwtService struct {
	secret    []byte
	expiresIn time.Duration
}

func NewJWTService(secret string, expiresIn time.Duration) JWTService {
	return &jwtService{
		secret:    []byte(secret),
		expiresIn: expiresIn,
	}
}

func (s *jwtService) Generate(user models.User) (string, error) {
	now := time.Now().UTC()
	claims := Claims{
		UserID:   user.ID,
		Role:     user.Role,
		AgencyID: user.AgencyID,
		ClientID: user.ClientID,
		Purpose:  "auth",
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   user.ID.String(),
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(s.expiresIn)),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(s.secret)
}

func (s *jwtService) Validate(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method")
		}

		return s.secret, nil
	})
	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid || claims.Purpose != "auth" {
		return nil, fmt.Errorf("invalid token")
	}

	return claims, nil
}

func (s *jwtService) GenerateVerificationToken(userID uuid.UUID) (string, error) {
	now := time.Now().UTC()
	claims := Claims{
		UserID:  userID,
		Purpose: "email_verification",
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   userID.String(),
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(24 * time.Hour)), // 24 hours validity
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(s.secret)
}

func (s *jwtService) ValidateVerificationToken(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method")
		}
		return s.secret, nil
	})
	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid || claims.Purpose != "email_verification" {
		return nil, fmt.Errorf("invalid token")
	}

	return claims, nil
}
