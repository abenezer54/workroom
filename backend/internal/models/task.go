package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type TaskStatus string

const (
	TaskStatusTodo       TaskStatus = "TODO"
	TaskStatusInProgress TaskStatus = "IN_PROGRESS"
	TaskStatusDone       TaskStatus = "DONE"
)

type TaskPriority string

const (
	TaskPriorityLow    TaskPriority = "LOW"
	TaskPriorityMedium TaskPriority = "MEDIUM"
	TaskPriorityHigh   TaskPriority = "HIGH"
	TaskPriorityUrgent TaskPriority = "URGENT"
)

type Task struct {
	ID          uuid.UUID      `gorm:"type:uuid;primaryKey" json:"id"`
	AgencyID    uuid.UUID      `gorm:"type:uuid;not null;index" json:"agency_id"`
	ProjectID   uuid.UUID      `gorm:"type:uuid;not null;index" json:"project_id"`
	Title       string         `gorm:"type:text;not null" json:"title"`
	Description *string        `gorm:"type:text" json:"description,omitempty"`
	Status      TaskStatus     `gorm:"type:task_status;not null;default:TODO" json:"status"`
	Priority    TaskPriority   `gorm:"type:task_priority;not null;default:MEDIUM" json:"priority"`
	DueDate     *time.Time     `gorm:"type:date" json:"due_date,omitempty"`
	CreatedAt   time.Time      `gorm:"type:timestamptz;not null" json:"created_at"`
	UpdatedAt   time.Time      `gorm:"type:timestamptz;not null" json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

func (t *Task) BeforeCreate(tx *gorm.DB) error {
	if t.ID == uuid.Nil {
		t.ID = uuid.New()
	}

	return nil
}
