package services

import (
	"strings"
	"time"

	"github.com/google/uuid"

	"workroom/backend/internal/dto"
	apperrors "workroom/backend/internal/errors"
	"workroom/backend/internal/models"
	"workroom/backend/internal/repositories"
)

type TaskService interface {
	ListAllForAgency(agencyID uuid.UUID, query dto.TaskListQuery) ([]dto.AgencyTaskResponse, error)
	ListForAgency(agencyID uuid.UUID, projectID uuid.UUID, query dto.TaskListQuery) ([]dto.TaskResponse, error)
	ListForClient(clientID uuid.UUID, projectID uuid.UUID, query dto.TaskListQuery) ([]dto.TaskResponse, error)
	Create(agencyID uuid.UUID, projectID uuid.UUID, req dto.CreateTaskRequest) (*dto.TaskResponse, error)
	Update(agencyID uuid.UUID, taskID uuid.UUID, req dto.UpdateTaskRequest) (*dto.TaskResponse, error)
	Delete(agencyID uuid.UUID, taskID uuid.UUID) error
}

type taskService struct {
	tasks    repositories.TaskRepository
	projects repositories.ProjectRepository
}

func NewTaskService(tasks repositories.TaskRepository, projects repositories.ProjectRepository) TaskService {
	return &taskService{
		tasks:    tasks,
		projects: projects,
	}
}

func (s *taskService) ListAllForAgency(agencyID uuid.UUID, query dto.TaskListQuery) ([]dto.AgencyTaskResponse, error) {
	filters := taskFiltersFromQuery(query)

	tasks, err := s.tasks.ListByAgency(agencyID, filters)
	if err != nil {
		return nil, apperrors.Internal("Could not list tasks")
	}

	responses := make([]dto.AgencyTaskResponse, 0, len(tasks))
	for _, task := range tasks {
		responses = append(responses, dto.AgencyTaskResponse{
			ID:           task.ID,
			AgencyID:     task.AgencyID,
			ProjectID:    task.ProjectID,
			ProjectTitle: task.ProjectTitle,
			Title:        task.Title,
			Description:  task.Description,
			Status:       task.Status,
			Priority:     task.Priority,
			DueDate:      formatTaskDate(task.DueDate),
			CreatedAt:    task.CreatedAt,
			UpdatedAt:    task.UpdatedAt,
		})
	}

	return responses, nil
}

func formatTaskDate(value *time.Time) *string {
	if value == nil {
		return nil
	}

	formatted := value.Format("2006-01-02")
	return &formatted
}

func (s *taskService) ListForAgency(agencyID uuid.UUID, projectID uuid.UUID, query dto.TaskListQuery) ([]dto.TaskResponse, error) {
	project, err := s.projects.FindByIDAndAgency(projectID, agencyID)
	if err != nil {
		return nil, apperrors.Internal("Could not validate project ownership")
	}
	if project == nil {
		return nil, apperrors.NotFound("Project not found")
	}

	return s.listByProject(projectID, query)
}

func (s *taskService) ListForClient(clientID uuid.UUID, projectID uuid.UUID, query dto.TaskListQuery) ([]dto.TaskResponse, error) {
	project, err := s.projects.FindByIDAndClient(projectID, clientID)
	if err != nil {
		return nil, apperrors.Internal("Could not validate project access")
	}
	if project == nil {
		return nil, apperrors.NotFound("Project not found")
	}

	return s.listByProject(projectID, query)
}

func (s *taskService) Create(agencyID uuid.UUID, projectID uuid.UUID, req dto.CreateTaskRequest) (*dto.TaskResponse, error) {
	project, err := s.projects.FindByIDAndAgency(projectID, agencyID)
	if err != nil {
		return nil, apperrors.Internal("Could not validate project ownership")
	}
	if project == nil || project.Status == models.ProjectStatusArchived {
		return nil, apperrors.NotFound("Project not found")
	}

	status := req.Status
	if status == "" {
		status = models.TaskStatusTodo
	}

	priority := req.Priority
	if priority == "" {
		priority = models.TaskPriorityMedium
	}

	dueDate, err := parseOptionalDate(req.DueDate)
	if err != nil {
		return nil, apperrors.Validation("One or more fields are invalid", map[string]string{"due_date": "Must use YYYY-MM-DD"})
	}

	task := &models.Task{
		AgencyID:    agencyID,
		ProjectID:   projectID,
		Title:       strings.TrimSpace(req.Title),
		Description: trimOptional(req.Description),
		Status:      status,
		Priority:    priority,
		DueDate:     dueDate,
	}

	if err := s.tasks.Create(task); err != nil {
		return nil, apperrors.Internal("Could not create task")
	}

	response := dto.ToTaskResponse(*task)
	return &response, nil
}

func (s *taskService) Update(agencyID uuid.UUID, taskID uuid.UUID, req dto.UpdateTaskRequest) (*dto.TaskResponse, error) {
	task, err := s.tasks.FindByIDAndAgency(taskID, agencyID)
	if err != nil {
		return nil, apperrors.Internal("Could not load task")
	}
	if task == nil {
		return nil, apperrors.NotFound("Task not found")
	}

	if req.Title != nil {
		task.Title = strings.TrimSpace(*req.Title)
	}
	if req.Description != nil {
		task.Description = trimOptional(req.Description)
	}
	if req.Status != nil {
		task.Status = *req.Status
	}
	if req.Priority != nil {
		task.Priority = *req.Priority
	}
	if req.DueDate != nil {
		dueDate, err := parseOptionalDate(req.DueDate)
		if err != nil {
			return nil, apperrors.Validation("One or more fields are invalid", map[string]string{"due_date": "Must use YYYY-MM-DD"})
		}
		task.DueDate = dueDate
	}

	if err := s.tasks.Update(task); err != nil {
		return nil, apperrors.Internal("Could not update task")
	}

	response := dto.ToTaskResponse(*task)
	return &response, nil
}

func (s *taskService) Delete(agencyID uuid.UUID, taskID uuid.UUID) error {
	task, err := s.tasks.FindByIDAndAgency(taskID, agencyID)
	if err != nil {
		return apperrors.Internal("Could not load task")
	}
	if task == nil {
		return apperrors.NotFound("Task not found")
	}

	if err := s.tasks.Delete(taskID, agencyID); err != nil {
		return apperrors.Internal("Could not delete task")
	}

	return nil
}

func (s *taskService) listByProject(projectID uuid.UUID, query dto.TaskListQuery) ([]dto.TaskResponse, error) {
	filters := taskFiltersFromQuery(query)

	tasks, err := s.tasks.ListByProject(projectID, filters)
	if err != nil {
		return nil, apperrors.Internal("Could not list tasks")
	}

	return dto.ToTaskResponses(tasks), nil
}

func taskFiltersFromQuery(query dto.TaskListQuery) repositories.TaskFilters {
	filters := repositories.TaskFilters{}

	if query.Status != "" {
		status := models.TaskStatus(query.Status)
		filters.Status = &status
	}
	if query.Priority != "" {
		priority := models.TaskPriority(query.Priority)
		filters.Priority = &priority
	}
	if query.ProjectID != "" {
		projectID, err := uuid.Parse(query.ProjectID)
		if err == nil {
			filters.ProjectID = &projectID
		}
	}

	return filters
}
