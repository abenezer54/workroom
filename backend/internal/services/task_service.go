package services

import (
	"strings"

	"github.com/google/uuid"

	"workroom/backend/internal/dto"
	apperrors "workroom/backend/internal/errors"
	"workroom/backend/internal/models"
	"workroom/backend/internal/repositories"
)

type TaskService interface {
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
	filters := repositories.TaskFilters{}

	if query.Status != "" {
		status := models.TaskStatus(query.Status)
		filters.Status = &status
	}
	if query.Priority != "" {
		priority := models.TaskPriority(query.Priority)
		filters.Priority = &priority
	}

	tasks, err := s.tasks.ListByProject(projectID, filters)
	if err != nil {
		return nil, apperrors.Internal("Could not list tasks")
	}

	return dto.ToTaskResponses(tasks), nil
}
