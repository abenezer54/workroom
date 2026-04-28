package repositories

import (
	"errors"
	"strings"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"workroom/backend/internal/models"
)

type ClientFilters struct {
	Status *models.ClientStatus
	Search string
}

type ClientRepository interface {
	ListByAgency(agencyID uuid.UUID, filters ClientFilters) ([]models.Client, error)
	Create(client *models.Client) error
	FindByIDAndAgency(id uuid.UUID, agencyID uuid.UUID) (*models.Client, error)
	EmailExistsInAgency(agencyID uuid.UUID, email string, excludeClientID *uuid.UUID) (bool, error)
	Update(client *models.Client) error
	Archive(id uuid.UUID, agencyID uuid.UUID) error
}

type clientRepository struct {
	db *gorm.DB
}

func NewClientRepository(db *gorm.DB) ClientRepository {
	return &clientRepository{db: db}
}

func (r *clientRepository) ListByAgency(agencyID uuid.UUID, filters ClientFilters) ([]models.Client, error) {
	var clients []models.Client

	query := r.db.Where("agency_id = ?", agencyID)
	if filters.Status != nil {
		query = query.Where("status = ?", *filters.Status)
	} else {
		query = query.Where("status <> ?", models.ClientStatusArchived)
	}

	search := strings.TrimSpace(filters.Search)
	if search != "" {
		pattern := "%" + strings.ToLower(search) + "%"
		query = query.Where(
			"LOWER(name) LIKE ? OR LOWER(company_name) LIKE ? OR LOWER(email) LIKE ?",
			pattern,
			pattern,
			pattern,
		)
	}

	if err := query.Order("created_at DESC").Find(&clients).Error; err != nil {
		return nil, err
	}

	return clients, nil
}

func (r *clientRepository) Create(client *models.Client) error {
	client.Email = normalizeEmail(client.Email)
	return r.db.Create(client).Error
}

func (r *clientRepository) FindByIDAndAgency(id uuid.UUID, agencyID uuid.UUID) (*models.Client, error) {
	var client models.Client
	if err := r.db.Where("id = ? AND agency_id = ?", id, agencyID).First(&client).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}

	return &client, nil
}

func (r *clientRepository) EmailExistsInAgency(agencyID uuid.UUID, email string, excludeClientID *uuid.UUID) (bool, error) {
	var count int64
	query := r.db.Model(&models.Client{}).
		Where("agency_id = ? AND LOWER(email) = ? AND status <> ?", agencyID, normalizeEmail(email), models.ClientStatusArchived)

	if excludeClientID != nil {
		query = query.Where("id <> ?", *excludeClientID)
	}

	if err := query.Count(&count).Error; err != nil {
		return false, err
	}

	return count > 0, nil
}

func (r *clientRepository) Update(client *models.Client) error {
	client.Email = normalizeEmail(client.Email)
	return r.db.Save(client).Error
}

func (r *clientRepository) Archive(id uuid.UUID, agencyID uuid.UUID) error {
	return r.db.Model(&models.Client{}).
		Where("id = ? AND agency_id = ?", id, agencyID).
		Update("status", models.ClientStatusArchived).
		Error
}
