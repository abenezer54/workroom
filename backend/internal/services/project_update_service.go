package services

import (
	"strings"

	"github.com/google/uuid"

	"workroom/backend/internal/dto"
	apperrors "workroom/backend/internal/errors"
	"workroom/backend/internal/models"
	"workroom/backend/internal/repositories"
)

type ProjectUpdateService interface {
	ListForAgency(agencyID uuid.UUID, projectID uuid.UUID) ([]dto.ProjectUpdateResponse, error)
	ListForClient(clientID uuid.UUID, projectID uuid.UUID) ([]dto.ProjectUpdateResponse, error)
	ListRecent(agencyID uuid.UUID, limit int) ([]dto.ProjectUpdateResponse, error)
	Create(agencyID uuid.UUID, projectID uuid.UUID, userID uuid.UUID, req dto.CreateProjectUpdateRequest) (*dto.ProjectUpdateResponse, error)
}

type projectUpdateService struct {
	updates  repositories.ProjectUpdateRepository
	projects repositories.ProjectRepository
}

func NewProjectUpdateService(updates repositories.ProjectUpdateRepository, projects repositories.ProjectRepository) ProjectUpdateService {
	return &projectUpdateService{
		updates:  updates,
		projects: projects,
	}
}

func (s *projectUpdateService) ListForAgency(agencyID uuid.UUID, projectID uuid.UUID) ([]dto.ProjectUpdateResponse, error) {
	project, err := s.projects.FindByIDAndAgency(projectID, agencyID)
	if err != nil {
		return nil, apperrors.Internal("Could not validate project ownership")
	}
	if project == nil {
		return nil, apperrors.NotFound("Project not found")
	}

	return s.listByProject(projectID)
}

func (s *projectUpdateService) ListForClient(clientID uuid.UUID, projectID uuid.UUID) ([]dto.ProjectUpdateResponse, error) {
	project, err := s.projects.FindByIDAndClient(projectID, clientID)
	if err != nil {
		return nil, apperrors.Internal("Could not validate project access")
	}
	if project == nil {
		return nil, apperrors.NotFound("Project not found")
	}

	return s.listByProject(projectID)
}

func (s *projectUpdateService) ListRecent(agencyID uuid.UUID, limit int) ([]dto.ProjectUpdateResponse, error) {
	if limit == 0 {
		limit = 5
	}

	updates, err := s.updates.ListRecentByAgency(agencyID, limit)
	if err != nil {
		return nil, apperrors.Internal("Could not list recent project updates")
	}

	return dto.ToProjectUpdateResponses(updates), nil
}

func (s *projectUpdateService) Create(agencyID uuid.UUID, projectID uuid.UUID, userID uuid.UUID, req dto.CreateProjectUpdateRequest) (*dto.ProjectUpdateResponse, error) {
	project, err := s.projects.FindByIDAndAgency(projectID, agencyID)
	if err != nil {
		return nil, apperrors.Internal("Could not validate project ownership")
	}
	if project == nil || project.Status == models.ProjectStatusArchived {
		return nil, apperrors.NotFound("Project not found")
	}

	update := &models.ProjectUpdate{
		AgencyID:  agencyID,
		ProjectID: projectID,
		Title:     strings.TrimSpace(req.Title),
		Content:   strings.TrimSpace(req.Content),
		CreatedBy: userID,
	}

	if err := s.updates.Create(update); err != nil {
		return nil, apperrors.Internal("Could not create project update")
	}

	response := dto.ToProjectUpdateResponse(*update)
	return &response, nil
}

func (s *projectUpdateService) listByProject(projectID uuid.UUID) ([]dto.ProjectUpdateResponse, error) {
	updates, err := s.updates.ListByProject(projectID)
	if err != nil {
		return nil, apperrors.Internal("Could not list project updates")
	}

	return dto.ToProjectUpdateResponses(updates), nil
}
