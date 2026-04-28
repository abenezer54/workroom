package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ProjectUpdate struct {
	ID        uuid.UUID      `gorm:"type:uuid;primaryKey" json:"id"`
	AgencyID  uuid.UUID      `gorm:"type:uuid;not null;index" json:"agency_id"`
	ProjectID uuid.UUID      `gorm:"type:uuid;not null;index" json:"project_id"`
	Title     string         `gorm:"type:text;not null" json:"title"`
	Content   string         `gorm:"type:text;not null" json:"content"`
	CreatedBy uuid.UUID      `gorm:"type:uuid;not null;index" json:"created_by"`
	CreatedAt time.Time      `gorm:"type:timestamptz;not null" json:"created_at"`
	UpdatedAt time.Time      `gorm:"type:timestamptz;not null" json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

func (u *ProjectUpdate) BeforeCreate(tx *gorm.DB) error {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}

	return nil
}
