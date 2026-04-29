package repositories

import (
	"errors"
	"strings"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"workroom/backend/internal/models"
)

type ProjectFilters struct {
	Status   *models.ProjectStatus
	ClientID *uuid.UUID
	Search   string
}

type ProjectRepository interface {
	ListByAgency(agencyID uuid.UUID, filters ProjectFilters) ([]models.Project, error)
	ListByClient(clientID uuid.UUID, filters ProjectFilters) ([]models.Project, error)
	Create(project *models.Project) error
	FindByIDAndAgency(id uuid.UUID, agencyID uuid.UUID) (*models.Project, error)
	FindByIDAndClient(id uuid.UUID, clientID uuid.UUID) (*models.Project, error)
	Update(project *models.Project) error
	Archive(id uuid.UUID, agencyID uuid.UUID) error
}

type projectRepository struct {
	db *gorm.DB
}

func NewProjectRepository(db *gorm.DB) ProjectRepository {
	return &projectRepository{db: db}
}

func (r *projectRepository) ListByAgency(agencyID uuid.UUID, filters ProjectFilters) ([]models.Project, error) {
	var projects []models.Project

	query := r.db.Where("agency_id = ?", agencyID)
	if filters.Status != nil {
		query = query.Where("status = ?", *filters.Status)
	} else {
		query = query.Where("status <> ?", models.ProjectStatusArchived)
	}
	if filters.ClientID != nil {
		query = query.Where("client_id = ?", *filters.ClientID)
	}

	search := strings.TrimSpace(filters.Search)
	if search != "" {
		query = query.Where("LOWER(title) LIKE ?", "%"+strings.ToLower(search)+"%")
	}

	if err := query.Order("created_at DESC").Find(&projects).Error; err != nil {
		return nil, err
	}

	return projects, nil
}

func (r *projectRepository) ListByClient(clientID uuid.UUID, filters ProjectFilters) ([]models.Project, error) {
	var projects []models.Project

	query := r.db.Where("client_id = ?", clientID)
	if filters.Status != nil {
		query = query.Where("status = ?", *filters.Status)
	} else {
		query = query.Where("status <> ?", models.ProjectStatusArchived)
	}

	search := strings.TrimSpace(filters.Search)
	if search != "" {
		query = query.Where("LOWER(title) LIKE ?", "%"+strings.ToLower(search)+"%")
	}

	if err := query.Order("created_at DESC").Find(&projects).Error; err != nil {
		return nil, err
	}

	return projects, nil
}

func (r *projectRepository) Create(project *models.Project) error {
	return r.db.Create(project).Error
}

func (r *projectRepository) FindByIDAndAgency(id uuid.UUID, agencyID uuid.UUID) (*models.Project, error) {
	var project models.Project
	if err := r.db.Where("id = ? AND agency_id = ?", id, agencyID).First(&project).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}

	return &project, nil
}

func (r *projectRepository) FindByIDAndClient(id uuid.UUID, clientID uuid.UUID) (*models.Project, error) {
	var project models.Project
	if err := r.db.Where("id = ? AND client_id = ?", id, clientID).First(&project).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}

	return &project, nil
}

func (r *projectRepository) Update(project *models.Project) error {
	return r.db.Save(project).Error
}

func (r *projectRepository) Archive(id uuid.UUID, agencyID uuid.UUID) error {
	return r.db.Model(&models.Project{}).
		Where("id = ? AND agency_id = ?", id, agencyID).
		Update("status", models.ProjectStatusArchived).
		Error
}
