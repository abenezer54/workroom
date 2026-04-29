package repositories

import (
	"errors"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"workroom/backend/internal/models"
)

type TaskFilters struct {
	Status    *models.TaskStatus
	Priority  *models.TaskPriority
	ProjectID *uuid.UUID
}

type TaskRepository interface {
	ListByProject(projectID uuid.UUID, filters TaskFilters) ([]models.Task, error)
	ListByAgency(agencyID uuid.UUID, filters TaskFilters) ([]AgencyTaskRow, error)
	Create(task *models.Task) error
	FindByIDAndAgency(id uuid.UUID, agencyID uuid.UUID) (*models.Task, error)
	Update(task *models.Task) error
	Delete(id uuid.UUID, agencyID uuid.UUID) error
}

type AgencyTaskRow struct {
	ID           uuid.UUID
	AgencyID     uuid.UUID
	ProjectID    uuid.UUID
	ProjectTitle string
	Title        string
	Description  *string
	Status       models.TaskStatus
	Priority     models.TaskPriority
	DueDate      *time.Time
	CreatedAt    time.Time
	UpdatedAt    time.Time
}

type taskRepository struct {
	db *gorm.DB
}

func NewTaskRepository(db *gorm.DB) TaskRepository {
	return &taskRepository{db: db}
}

func (r *taskRepository) ListByProject(projectID uuid.UUID, filters TaskFilters) ([]models.Task, error) {
	var tasks []models.Task

	query := r.db.Where("project_id = ?", projectID)
	if filters.Status != nil {
		query = query.Where("status = ?", *filters.Status)
	}
	if filters.Priority != nil {
		query = query.Where("priority = ?", *filters.Priority)
	}

	if err := query.Order("created_at DESC").Find(&tasks).Error; err != nil {
		return nil, err
	}

	return tasks, nil
}

func (r *taskRepository) ListByAgency(agencyID uuid.UUID, filters TaskFilters) ([]AgencyTaskRow, error) {
	var tasks []AgencyTaskRow

	query := r.db.Table("tasks").
		Select("tasks.id, tasks.agency_id, tasks.project_id, projects.title AS project_title, tasks.title, tasks.description, tasks.status, tasks.priority, tasks.due_date, tasks.created_at, tasks.updated_at").
		Joins("JOIN projects ON projects.id = tasks.project_id").
		Where("tasks.agency_id = ? AND tasks.deleted_at IS NULL AND projects.deleted_at IS NULL", agencyID)
	if filters.Status != nil {
		query = query.Where("tasks.status = ?", *filters.Status)
	}
	if filters.Priority != nil {
		query = query.Where("tasks.priority = ?", *filters.Priority)
	}
	if filters.ProjectID != nil {
		query = query.Where("tasks.project_id = ?", *filters.ProjectID)
	}

	if err := query.Order("tasks.created_at DESC").Scan(&tasks).Error; err != nil {
		return nil, err
	}

	return tasks, nil
}

func (r *taskRepository) Create(task *models.Task) error {
	return r.db.Create(task).Error
}

func (r *taskRepository) FindByIDAndAgency(id uuid.UUID, agencyID uuid.UUID) (*models.Task, error) {
	var task models.Task
	if err := r.db.Where("id = ? AND agency_id = ?", id, agencyID).First(&task).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}

	return &task, nil
}

func (r *taskRepository) Update(task *models.Task) error {
	return r.db.Save(task).Error
}

func (r *taskRepository) Delete(id uuid.UUID, agencyID uuid.UUID) error {
	return r.db.Where("id = ? AND agency_id = ?", id, agencyID).Delete(&models.Task{}).Error
}
