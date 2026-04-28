package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type InvoiceStatus string

const (
	InvoiceStatusDraft     InvoiceStatus = "DRAFT"
	InvoiceStatusSent      InvoiceStatus = "SENT"
	InvoiceStatusPaid      InvoiceStatus = "PAID"
	InvoiceStatusOverdue   InvoiceStatus = "OVERDUE"
	InvoiceStatusCancelled InvoiceStatus = "CANCELLED"
)

type Invoice struct {
	ID            uuid.UUID      `gorm:"type:uuid;primaryKey" json:"id"`
	InvoiceNumber string         `gorm:"type:text;not null" json:"invoice_number"`
	AgencyID      uuid.UUID      `gorm:"type:uuid;not null;index" json:"agency_id"`
	ClientID      uuid.UUID      `gorm:"type:uuid;not null;index" json:"client_id"`
	ProjectID     *uuid.UUID     `gorm:"type:uuid;index" json:"project_id,omitempty"`
	Status        InvoiceStatus  `gorm:"type:invoice_status;not null;default:DRAFT" json:"status"`
	IssueDate     time.Time      `gorm:"type:date;not null" json:"issue_date"`
	DueDate       *time.Time     `gorm:"type:date" json:"due_date,omitempty"`
	Subtotal      int            `gorm:"not null;default:0" json:"subtotal"`
	Tax           int            `gorm:"not null;default:0" json:"tax"`
	Discount      int            `gorm:"not null;default:0" json:"discount"`
	Total         int            `gorm:"not null;default:0" json:"total"`
	Items         []InvoiceItem  `gorm:"foreignKey:InvoiceID" json:"items,omitempty"`
	CreatedAt     time.Time      `gorm:"type:timestamptz;not null" json:"created_at"`
	UpdatedAt     time.Time      `gorm:"type:timestamptz;not null" json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
}

func (i *Invoice) BeforeCreate(tx *gorm.DB) error {
	if i.ID == uuid.Nil {
		i.ID = uuid.New()
	}

	return nil
}

type InvoiceItem struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	InvoiceID   uuid.UUID `gorm:"type:uuid;not null;index" json:"invoice_id"`
	Description string    `gorm:"type:text;not null" json:"description"`
	Quantity    float64   `gorm:"type:numeric(10,2);not null;default:1" json:"quantity"`
	UnitPrice   int       `gorm:"not null;default:0" json:"unit_price"`
	Amount      int       `gorm:"not null;default:0" json:"amount"`
	CreatedAt   time.Time `gorm:"type:timestamptz;not null" json:"created_at"`
	UpdatedAt   time.Time `gorm:"type:timestamptz;not null" json:"updated_at"`
}

func (i *InvoiceItem) BeforeCreate(tx *gorm.DB) error {
	if i.ID == uuid.Nil {
		i.ID = uuid.New()
	}

	return nil
}
