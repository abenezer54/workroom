package repositories

import (
	"errors"
	"fmt"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"workroom/backend/internal/models"
)

type InvoiceFilters struct {
	Status    *models.InvoiceStatus
	ClientID  *uuid.UUID
	ProjectID *uuid.UUID
}

type InvoiceRepository interface {
	ListByAgency(agencyID uuid.UUID, filters InvoiceFilters) ([]models.Invoice, error)
	ListByClient(clientID uuid.UUID, filters InvoiceFilters) ([]models.Invoice, error)
	FindByIDAndAgency(id uuid.UUID, agencyID uuid.UUID) (*models.Invoice, error)
	FindByIDAndClient(id uuid.UUID, clientID uuid.UUID) (*models.Invoice, error)
	CreateWithItems(invoice *models.Invoice) error
	UpdateWithItems(invoice *models.Invoice, replaceItems bool) error
	UpdateStatus(id uuid.UUID, agencyID uuid.UUID, status models.InvoiceStatus) error
	Cancel(id uuid.UUID, agencyID uuid.UUID) error
}

type invoiceRepository struct {
	db *gorm.DB
}

func NewInvoiceRepository(db *gorm.DB) InvoiceRepository {
	return &invoiceRepository{db: db}
}

func (r *invoiceRepository) ListByAgency(agencyID uuid.UUID, filters InvoiceFilters) ([]models.Invoice, error) {
	var invoices []models.Invoice
	query := r.db.Where("agency_id = ?", agencyID)
	query = applyInvoiceFilters(query, filters)

	if err := query.Order("created_at DESC").Find(&invoices).Error; err != nil {
		return nil, err
	}

	return invoices, nil
}

func (r *invoiceRepository) ListByClient(clientID uuid.UUID, filters InvoiceFilters) ([]models.Invoice, error) {
	var invoices []models.Invoice
	query := r.db.Where("client_id = ?", clientID)
	if filters.Status != nil {
		query = query.Where("status = ?", *filters.Status)
	}
	if filters.ProjectID != nil {
		query = query.Where("project_id = ?", *filters.ProjectID)
	}

	if err := query.Order("created_at DESC").Find(&invoices).Error; err != nil {
		return nil, err
	}

	return invoices, nil
}

func (r *invoiceRepository) FindByIDAndAgency(id uuid.UUID, agencyID uuid.UUID) (*models.Invoice, error) {
	var invoice models.Invoice
	if err := r.db.Preload("Items", func(db *gorm.DB) *gorm.DB {
		return db.Order("created_at ASC")
	}).Where("id = ? AND agency_id = ?", id, agencyID).First(&invoice).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}

	return &invoice, nil
}

func (r *invoiceRepository) FindByIDAndClient(id uuid.UUID, clientID uuid.UUID) (*models.Invoice, error) {
	var invoice models.Invoice
	if err := r.db.Preload("Items", func(db *gorm.DB) *gorm.DB {
		return db.Order("created_at ASC")
	}).Where("id = ? AND client_id = ?", id, clientID).First(&invoice).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}

	return &invoice, nil
}

func (r *invoiceRepository) CreateWithItems(invoice *models.Invoice) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		invoiceNumber, err := r.nextInvoiceNumber(tx, invoice.AgencyID)
		if err != nil {
			return err
		}
		invoice.InvoiceNumber = invoiceNumber

		if err := tx.Omit("Items").Create(invoice).Error; err != nil {
			return err
		}

		for i := range invoice.Items {
			invoice.Items[i].InvoiceID = invoice.ID
		}

		return tx.Create(&invoice.Items).Error
	})
}

func (r *invoiceRepository) UpdateWithItems(invoice *models.Invoice, replaceItems bool) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if replaceItems {
			if err := tx.Where("invoice_id = ?", invoice.ID).Delete(&models.InvoiceItem{}).Error; err != nil {
				return err
			}
			for i := range invoice.Items {
				invoice.Items[i].InvoiceID = invoice.ID
			}
			if err := tx.Create(&invoice.Items).Error; err != nil {
				return err
			}
		}

		return tx.Omit("Items").Save(invoice).Error
	})
}

func (r *invoiceRepository) UpdateStatus(id uuid.UUID, agencyID uuid.UUID, status models.InvoiceStatus) error {
	return r.db.Model(&models.Invoice{}).
		Where("id = ? AND agency_id = ?", id, agencyID).
		Update("status", status).
		Error
}

func (r *invoiceRepository) Cancel(id uuid.UUID, agencyID uuid.UUID) error {
	return r.UpdateStatus(id, agencyID, models.InvoiceStatusCancelled)
}

func (r *invoiceRepository) nextInvoiceNumber(tx *gorm.DB, agencyID uuid.UUID) (string, error) {
	var count int64
	if err := tx.Model(&models.Invoice{}).Where("agency_id = ?", agencyID).Count(&count).Error; err != nil {
		return "", err
	}

	return fmt.Sprintf("INV-%06d", count+1), nil
}

func applyInvoiceFilters(query *gorm.DB, filters InvoiceFilters) *gorm.DB {
	if filters.Status != nil {
		query = query.Where("status = ?", *filters.Status)
	}
	if filters.ClientID != nil {
		query = query.Where("client_id = ?", *filters.ClientID)
	}
	if filters.ProjectID != nil {
		query = query.Where("project_id = ?", *filters.ProjectID)
	}

	return query
}
