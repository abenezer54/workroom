package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ProjectStatus string

const (
	ProjectStatusPlanning   ProjectStatus = "PLANNING"
	ProjectStatusInProgress ProjectStatus = "IN_PROGRESS"
	ProjectStatusReview     ProjectStatus = "REVIEW"
	ProjectStatusCompleted  ProjectStatus = "COMPLETED"
	ProjectStatusOnHold     ProjectStatus = "ON_HOLD"
	ProjectStatusArchived   ProjectStatus = "ARCHIVED"
)

type Project struct {
	ID          uuid.UUID      `gorm:"type:uuid;primaryKey" json:"id"`
	AgencyID    uuid.UUID      `gorm:"type:uuid;not null;index" json:"agency_id"`
	ClientID    uuid.UUID      `gorm:"type:uuid;not null;index" json:"client_id"`
	Title       string         `gorm:"type:text;not null" json:"title"`
	Description *string        `gorm:"type:text" json:"description,omitempty"`
	Status      ProjectStatus  `gorm:"type:project_status;not null;default:PLANNING" json:"status"`
	StartDate   *time.Time     `gorm:"type:date" json:"start_date,omitempty"`
	Deadline    *time.Time     `gorm:"type:date" json:"deadline,omitempty"`
	Budget      int            `gorm:"not null;default:0" json:"budget"`
	Progress    int            `gorm:"not null;default:0" json:"progress"`
	CreatedAt   time.Time      `gorm:"type:timestamptz;not null" json:"created_at"`
	UpdatedAt   time.Time      `gorm:"type:timestamptz;not null" json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

func (p *Project) BeforeCreate(tx *gorm.DB) error {
	if p.ID == uuid.Nil {
		p.ID = uuid.New()
	}

	return nil
}
