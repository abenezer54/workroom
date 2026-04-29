package repositories

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"workroom/backend/internal/models"
)

type ProjectUpdateRepository interface {
	ListByProject(projectID uuid.UUID) ([]models.ProjectUpdate, error)
	ListByAgency(agencyID uuid.UUID, projectID *uuid.UUID) ([]AgencyProjectUpdateRow, error)
	ListRecentByAgency(agencyID uuid.UUID, limit int) ([]models.ProjectUpdate, error)
	Create(update *models.ProjectUpdate) error
}

type AgencyProjectUpdateRow struct {
	ID           uuid.UUID
	AgencyID     uuid.UUID
	ProjectID    uuid.UUID
	ProjectTitle string
	Title        string
	Content      string
	CreatedBy    uuid.UUID
	CreatedAt    time.Time
	UpdatedAt    time.Time
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

func (r *projectUpdateRepository) ListByAgency(agencyID uuid.UUID, projectID *uuid.UUID) ([]AgencyProjectUpdateRow, error) {
	var updates []AgencyProjectUpdateRow
	query := r.db.Table("project_updates").
		Select("project_updates.id, project_updates.agency_id, project_updates.project_id, projects.title AS project_title, project_updates.title, project_updates.content, project_updates.created_by, project_updates.created_at, project_updates.updated_at").
		Joins("JOIN projects ON projects.id = project_updates.project_id").
		Where("project_updates.agency_id = ? AND project_updates.deleted_at IS NULL AND projects.deleted_at IS NULL", agencyID)
	if projectID != nil {
		query = query.Where("project_updates.project_id = ?", *projectID)
	}

	if err := query.Order("project_updates.created_at DESC").Scan(&updates).Error; err != nil {
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
