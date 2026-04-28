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
	jwt.RegisteredClaims
}

type JWTService interface {
	Generate(user models.User) (string, error)
	Validate(tokenString string) (*Claims, error)
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
	if !ok || !token.Valid {
		return nil, fmt.Errorf("invalid token")
	}

	return claims, nil
}
