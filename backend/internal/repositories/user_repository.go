package repositories

import (
	"errors"
	"strings"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"workroom/backend/internal/models"
)

type UserRepository interface {
	Create(user *models.User) error
	FindByID(id uuid.UUID) (*models.User, error)
	FindByEmail(email string) (*models.User, error)
	EmailExists(email string) (bool, error)
	UpdateAgencyID(userID uuid.UUID, agencyID uuid.UUID) error
	UpdateLastLoginAt(userID uuid.UUID, loggedInAt time.Time) error
}

type userRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) Create(user *models.User) error {
	user.Email = normalizeEmail(user.Email)
	return r.db.Create(user).Error
}

func (r *userRepository) FindByID(id uuid.UUID) (*models.User, error) {
	var user models.User
	if err := r.db.Where("id = ?", id).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}

	return &user, nil
}

func (r *userRepository) FindByEmail(email string) (*models.User, error) {
	var user models.User
	if err := r.db.Where("LOWER(email) = ?", normalizeEmail(email)).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}

	return &user, nil
}

func (r *userRepository) EmailExists(email string) (bool, error) {
	var count int64
	if err := r.db.Model(&models.User{}).Where("LOWER(email) = ?", normalizeEmail(email)).Count(&count).Error; err != nil {
		return false, err
	}

	return count > 0, nil
}

func (r *userRepository) UpdateAgencyID(userID uuid.UUID, agencyID uuid.UUID) error {
	return r.db.Model(&models.User{}).Where("id = ?", userID).Update("agency_id", agencyID).Error
}

func (r *userRepository) UpdateLastLoginAt(userID uuid.UUID, loggedInAt time.Time) error {
	return r.db.Model(&models.User{}).Where("id = ?", userID).Update("last_login_at", loggedInAt).Error
}

func normalizeEmail(email string) string {
	return strings.ToLower(strings.TrimSpace(email))
}
