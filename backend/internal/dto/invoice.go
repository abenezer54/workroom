package dto

import (
	"time"

	"github.com/google/uuid"

	"workroom/backend/internal/models"
)

type CreateInvoiceRequest struct {
	ClientID  string               `json:"client_id" binding:"required,uuid"`
	ProjectID *string              `json:"project_id" binding:"omitempty,uuid"`
	Status    models.InvoiceStatus `json:"status" binding:"omitempty,oneof=DRAFT SENT PAID OVERDUE CANCELLED"`
	IssueDate string               `json:"issue_date" binding:"required,datetime=2006-01-02"`
	DueDate   *string              `json:"due_date" binding:"omitempty,datetime=2006-01-02"`
	Tax       *int                 `json:"tax" binding:"omitempty,gte=0"`
	Discount  *int                 `json:"discount" binding:"omitempty,gte=0"`
	Items     []InvoiceItemRequest `json:"items" binding:"required,min=1,dive"`
}

type UpdateInvoiceRequest struct {
	ClientID  *string               `json:"client_id" binding:"omitempty,uuid"`
	ProjectID *string               `json:"project_id" binding:"omitempty,uuid"`
	Status    *models.InvoiceStatus `json:"status" binding:"omitempty,oneof=DRAFT SENT PAID OVERDUE CANCELLED"`
	IssueDate *string               `json:"issue_date" binding:"omitempty,datetime=2006-01-02"`
	DueDate   *string               `json:"due_date" binding:"omitempty,datetime=2006-01-02"`
	Tax       *int                  `json:"tax" binding:"omitempty,gte=0"`
	Discount  *int                  `json:"discount" binding:"omitempty,gte=0"`
	Items     []InvoiceItemRequest  `json:"items" binding:"omitempty,min=1,dive"`
}

type UpdateInvoiceStatusRequest struct {
	Status models.InvoiceStatus `json:"status" binding:"required,oneof=DRAFT SENT PAID OVERDUE CANCELLED"`
}

type InvoiceItemRequest struct {
	Description string  `json:"description" binding:"required,min=2,max=500"`
	Quantity    float64 `json:"quantity" binding:"required,gt=0"`
	UnitPrice   int     `json:"unit_price" binding:"gte=0"`
}

type InvoiceListQuery struct {
	Status    string `form:"status" binding:"omitempty,oneof=DRAFT SENT PAID OVERDUE CANCELLED"`
	ClientID  string `form:"client_id" binding:"omitempty,uuid"`
	ProjectID string `form:"project_id" binding:"omitempty,uuid"`
}

type InvoiceResponse struct {
	ID            uuid.UUID             `json:"id"`
	InvoiceNumber string                `json:"invoice_number"`
	AgencyID      uuid.UUID             `json:"agency_id"`
	ClientID      uuid.UUID             `json:"client_id"`
	ProjectID     *uuid.UUID            `json:"project_id,omitempty"`
	Status        models.InvoiceStatus  `json:"status"`
	IssueDate     string                `json:"issue_date"`
	DueDate       *string               `json:"due_date,omitempty"`
	Subtotal      int                   `json:"subtotal"`
	Tax           int                   `json:"tax"`
	Discount      int                   `json:"discount"`
	Total         int                   `json:"total"`
	Items         []InvoiceItemResponse `json:"items,omitempty"`
	CreatedAt     time.Time             `json:"created_at"`
	UpdatedAt     time.Time             `json:"updated_at"`
}

type InvoiceItemResponse struct {
	ID          uuid.UUID `json:"id"`
	InvoiceID   uuid.UUID `json:"invoice_id"`
	Description string    `json:"description"`
	Quantity    float64   `json:"quantity"`
	UnitPrice   int       `json:"unit_price"`
	Amount      int       `json:"amount"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

func ToInvoiceResponse(invoice models.Invoice) InvoiceResponse {
	items := make([]InvoiceItemResponse, 0, len(invoice.Items))
	for _, item := range invoice.Items {
		items = append(items, ToInvoiceItemResponse(item))
	}

	return InvoiceResponse{
		ID:            invoice.ID,
		InvoiceNumber: invoice.InvoiceNumber,
		AgencyID:      invoice.AgencyID,
		ClientID:      invoice.ClientID,
		ProjectID:     invoice.ProjectID,
		Status:        invoice.Status,
		IssueDate:     invoice.IssueDate.Format("2006-01-02"),
		DueDate:       formatDate(invoice.DueDate),
		Subtotal:      invoice.Subtotal,
		Tax:           invoice.Tax,
		Discount:      invoice.Discount,
		Total:         invoice.Total,
		Items:         items,
		CreatedAt:     invoice.CreatedAt,
		UpdatedAt:     invoice.UpdatedAt,
	}
}

func ToInvoiceResponses(invoices []models.Invoice) []InvoiceResponse {
	responses := make([]InvoiceResponse, 0, len(invoices))
	for _, invoice := range invoices {
		responses = append(responses, ToInvoiceResponse(invoice))
	}

	return responses
}

func ToInvoiceItemResponse(item models.InvoiceItem) InvoiceItemResponse {
	return InvoiceItemResponse{
		ID:          item.ID,
		InvoiceID:   item.InvoiceID,
		Description: item.Description,
		Quantity:    item.Quantity,
		UnitPrice:   item.UnitPrice,
		Amount:      item.Amount,
		CreatedAt:   item.CreatedAt,
		UpdatedAt:   item.UpdatedAt,
	}
}
