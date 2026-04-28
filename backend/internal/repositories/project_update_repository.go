package repositories

import (
	"github.com/google/uuid"
	"gorm.io/gorm"

	"workroom/backend/internal/models"
)

type ProjectUpdateRepository interface {
	ListByProject(projectID uuid.UUID) ([]models.ProjectUpdate, error)
	ListRecentByAgency(agencyID uuid.UUID, limit int) ([]models.ProjectUpdate, error)
	Create(update *models.ProjectUpdate) error
}

type projectUpdateRepository struct {
	db *gorm.DB
}

func NewProjectUpdateRepository(db *gorm.DB) ProjectUpdateRepository {
	return &projectUpdateRepository{db: db}
}

func (r *projectUpdateRepository) ListByProject(projectID uuid.UUID) ([]models.ProjectUpdate, error) {
	var updates []models.ProjectUpdate
	if err := r.db.
		Where("project_id = ?", projectID).
		Order("created_at DESC").
		Find(&updates).Error; err != nil {
		return nil, err
	}

	return updates, nil
}

func (r *projectUpdateRepository) ListRecentByAgency(agencyID uuid.UUID, limit int) ([]models.ProjectUpdate, error) {
	var updates []models.ProjectUpdate
	if err := r.db.
		Where("agency_id = ?", agencyID).
		Order("created_at DESC").
		Limit(limit).
		Find(&updates).Error; err != nil {
		return nil, err
	}

	return updates, nil
}

func (r *projectUpdateRepository) Create(update *models.ProjectUpdate) error {
	return r.db.Create(update).Error
}
