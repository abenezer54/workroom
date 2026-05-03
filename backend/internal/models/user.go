package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UserRole string

const (
	RoleAgencyAdmin UserRole = "AGENCY_ADMIN"
	RoleClient      UserRole = "CLIENT"
)

type User struct {
	ID           uuid.UUID      `gorm:"type:uuid;primaryKey" json:"id"`
	AgencyID     *uuid.UUID     `gorm:"type:uuid;index" json:"agency_id,omitempty"`
	Name         string         `gorm:"type:text;not null" json:"name"`
	Email        string         `gorm:"type:text;not null" json:"email"`
	PasswordHash string         `gorm:"type:text;not null" json:"-"`
	GoogleSubject *string       `gorm:"type:text;index" json:"-"`
	Role         UserRole       `gorm:"type:user_role;not null" json:"role"`
	ClientID     *uuid.UUID     `gorm:"type:uuid;index" json:"client_id,omitempty"`
	IsEmailVerified bool        `gorm:"not null;default:false" json:"is_email_verified"`
	IsActive     bool           `gorm:"not null;default:true" json:"is_active"`
	LastLoginAt  *time.Time     `gorm:"type:timestamptz" json:"last_login_at,omitempty"`
	CreatedAt    time.Time      `gorm:"type:timestamptz;not null" json:"created_at"`
	UpdatedAt    time.Time      `gorm:"type:timestamptz;not null" json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
}

func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}

	return nil
}
