package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ClientStatus string

const (
	ClientStatusActive   ClientStatus = "ACTIVE"
	ClientStatusInactive ClientStatus = "INACTIVE"
	ClientStatusArchived ClientStatus = "ARCHIVED"
)

type Client struct {
	ID          uuid.UUID      `gorm:"type:uuid;primaryKey" json:"id"`
	AgencyID    uuid.UUID      `gorm:"type:uuid;not null;index" json:"agency_id"`
	Name        string         `gorm:"type:text;not null" json:"name"`
	Email       string         `gorm:"type:text;not null" json:"email"`
	CompanyName *string        `gorm:"type:text" json:"company_name,omitempty"`
	Phone       *string        `gorm:"type:text" json:"phone,omitempty"`
	Status      ClientStatus   `gorm:"type:client_status;not null;default:ACTIVE" json:"status"`
	CreatedAt   time.Time      `gorm:"type:timestamptz;not null" json:"created_at"`
	UpdatedAt   time.Time      `gorm:"type:timestamptz;not null" json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

func (c *Client) BeforeCreate(tx *gorm.DB) error {
	if c.ID == uuid.Nil {
		c.ID = uuid.New()
	}

	return nil
}

func IsValidClientStatus(status ClientStatus) bool {
	switch status {
	case ClientStatusActive, ClientStatusInactive, ClientStatusArchived:
		return true
	default:
		return false
	}
}
