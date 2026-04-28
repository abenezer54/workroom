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

type ProjectService interface {
	List(agencyID uuid.UUID, query dto.ProjectListQuery) ([]dto.ProjectResponse, error)
	Create(agencyID uuid.UUID, req dto.CreateProjectRequest) (*dto.ProjectResponse, error)
	GetForAgency(agencyID uuid.UUID, projectID uuid.UUID) (*dto.ProjectResponse, error)
	GetForClient(clientID uuid.UUID, projectID uuid.UUID) (*dto.ProjectResponse, error)
	Update(agencyID uuid.UUID, projectID uuid.UUID, req dto.UpdateProjectRequest) (*dto.ProjectResponse, error)
	Archive(agencyID uuid.UUID, projectID uuid.UUID) error
}

type projectService struct {
	projects repositories.ProjectRepository
	clients  repositories.ClientRepository
}

func NewProjectService(projects repositories.ProjectRepository, clients repositories.ClientRepository) ProjectService {
	return &projectService{
		projects: projects,
		clients:  clients,
	}
}

func (s *projectService) List(agencyID uuid.UUID, query dto.ProjectListQuery) ([]dto.ProjectResponse, error) {
	filters := repositories.ProjectFilters{
		Search: strings.TrimSpace(query.Search),
	}

	if query.Status != "" {
		status := models.ProjectStatus(query.Status)
		filters.Status = &status
	}
	if query.ClientID != "" {
		clientID, err := uuid.Parse(query.ClientID)
		if err != nil {
			return nil, apperrors.BadRequest("Invalid client id", nil)
		}
		filters.ClientID = &clientID
	}

	projects, err := s.projects.ListByAgency(agencyID, filters)
	if err != nil {
		return nil, apperrors.Internal("Could not list projects")
	}

	return dto.ToProjectResponses(projects), nil
}

func (s *projectService) Create(agencyID uuid.UUID, req dto.CreateProjectRequest) (*dto.ProjectResponse, error) {
	clientID, err := uuid.Parse(req.ClientID)
	if err != nil {
		return nil, apperrors.BadRequest("Invalid client id", nil)
	}

	if err := s.ensureClientBelongsToAgency(agencyID, clientID); err != nil {
		return nil, err
	}

	status := req.Status
	if status == "" {
		status = models.ProjectStatusPlanning
	}

	budget := 0
	if req.Budget != nil {
		budget = *req.Budget
	}

	progress := 0
	if req.Progress != nil {
		progress = *req.Progress
	}

	startDate, err := parseOptionalDate(req.StartDate)
	if err != nil {
		return nil, apperrors.Validation("One or more fields are invalid", map[string]string{"start_date": "Must use YYYY-MM-DD"})
	}
	deadline, err := parseOptionalDate(req.Deadline)
	if err != nil {
		return nil, apperrors.Validation("One or more fields are invalid", map[string]string{"deadline": "Must use YYYY-MM-DD"})
	}

	project := &models.Project{
		AgencyID:    agencyID,
		ClientID:    clientID,
		Title:       strings.TrimSpace(req.Title),
		Description: trimOptional(req.Description),
		Status:      status,
		StartDate:   startDate,
		Deadline:    deadline,
		Budget:      budget,
		Progress:    progress,
	}

	if err := s.projects.Create(project); err != nil {
		return nil, apperrors.Internal("Could not create project")
	}

	response := dto.ToProjectResponse(*project)
	return &response, nil
}

func (s *projectService) GetForAgency(agencyID uuid.UUID, projectID uuid.UUID) (*dto.ProjectResponse, error) {
	project, err := s.projects.FindByIDAndAgency(projectID, agencyID)
	if err != nil {
		return nil, apperrors.Internal("Could not load project")
	}
	if project == nil {
		return nil, apperrors.NotFound("Project not found")
	}

	response := dto.ToProjectResponse(*project)
	return &response, nil
}

func (s *projectService) GetForClient(clientID uuid.UUID, projectID uuid.UUID) (*dto.ProjectResponse, error) {
	project, err := s.projects.FindByIDAndClient(projectID, clientID)
	if err != nil {
		return nil, apperrors.Internal("Could not load project")
	}
	if project == nil {
		return nil, apperrors.NotFound("Project not found")
	}

	response := dto.ToProjectResponse(*project)
	return &response, nil
}

func (s *projectService) Update(agencyID uuid.UUID, projectID uuid.UUID, req dto.UpdateProjectRequest) (*dto.ProjectResponse, error) {
	project, err := s.projects.FindByIDAndAgency(projectID, agencyID)
	if err != nil {
		return nil, apperrors.Internal("Could not load project")
	}
	if project == nil {
		return nil, apperrors.NotFound("Project not found")
	}

	if req.ClientID != nil {
		clientID, err := uuid.Parse(*req.ClientID)
		if err != nil {
			return nil, apperrors.BadRequest("Invalid client id", nil)
		}
		if err := s.ensureClientBelongsToAgency(agencyID, clientID); err != nil {
			return nil, err
		}
		project.ClientID = clientID
	}
	if req.Title != nil {
		project.Title = strings.TrimSpace(*req.Title)
	}
	if req.Description != nil {
		project.Description = trimOptional(req.Description)
	}
	if req.Status != nil {
		project.Status = *req.Status
	}
	if req.StartDate != nil {
		startDate, err := parseOptionalDate(req.StartDate)
		if err != nil {
			return nil, apperrors.Validation("One or more fields are invalid", map[string]string{"start_date": "Must use YYYY-MM-DD"})
		}
		project.StartDate = startDate
	}
	if req.Deadline != nil {
		deadline, err := parseOptionalDate(req.Deadline)
		if err != nil {
			return nil, apperrors.Validation("One or more fields are invalid", map[string]string{"deadline": "Must use YYYY-MM-DD"})
		}
		project.Deadline = deadline
	}
	if req.Budget != nil {
		project.Budget = *req.Budget
	}
	if req.Progress != nil {
		project.Progress = *req.Progress
	}

	if err := s.projects.Update(project); err != nil {
		return nil, apperrors.Internal("Could not update project")
	}

	response := dto.ToProjectResponse(*project)
	return &response, nil
}

func (s *projectService) Archive(agencyID uuid.UUID, projectID uuid.UUID) error {
	project, err := s.projects.FindByIDAndAgency(projectID, agencyID)
	if err != nil {
		return apperrors.Internal("Could not load project")
	}
	if project == nil {
		return apperrors.NotFound("Project not found")
	}

	if err := s.projects.Archive(projectID, agencyID); err != nil {
		return apperrors.Internal("Could not archive project")
	}

	return nil
}

func (s *projectService) ensureClientBelongsToAgency(agencyID uuid.UUID, clientID uuid.UUID) error {
	client, err := s.clients.FindByIDAndAgency(clientID, agencyID)
	if err != nil {
		return apperrors.Internal("Could not validate client ownership")
	}
	if client == nil || client.Status == models.ClientStatusArchived {
		return apperrors.NotFound("Client not found")
	}

	return nil
}

func parseOptionalDate(value *string) (*time.Time, error) {
	if value == nil {
		return nil, nil
	}

	trimmed := strings.TrimSpace(*value)
	if trimmed == "" {
		return nil, nil
	}

	parsed, err := time.Parse("2006-01-02", trimmed)
	if err != nil {
		return nil, err
	}

	return &parsed, nil
}
