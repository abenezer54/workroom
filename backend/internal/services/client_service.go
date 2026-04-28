package services

import (
	"strings"

	"github.com/google/uuid"

	"workroom/backend/internal/dto"
	apperrors "workroom/backend/internal/errors"
	"workroom/backend/internal/models"
	"workroom/backend/internal/repositories"
)

type ClientService interface {
	List(agencyID uuid.UUID, query dto.ClientListQuery) ([]dto.ClientResponse, error)
	Create(agencyID uuid.UUID, req dto.CreateClientRequest) (*dto.ClientResponse, error)
	GetByID(agencyID uuid.UUID, clientID uuid.UUID) (*dto.ClientResponse, error)
	Update(agencyID uuid.UUID, clientID uuid.UUID, req dto.UpdateClientRequest) (*dto.ClientResponse, error)
	Archive(agencyID uuid.UUID, clientID uuid.UUID) error
}

type clientService struct {
	clients repositories.ClientRepository
}

func NewClientService(clients repositories.ClientRepository) ClientService {
	return &clientService{clients: clients}
}

func (s *clientService) List(agencyID uuid.UUID, query dto.ClientListQuery) ([]dto.ClientResponse, error) {
	filters := repositories.ClientFilters{
		Search: strings.TrimSpace(query.Search),
	}

	if query.Status != "" {
		status := models.ClientStatus(query.Status)
		filters.Status = &status
	}

	clients, err := s.clients.ListByAgency(agencyID, filters)
	if err != nil {
		return nil, apperrors.Internal("Could not list clients")
	}

	responses := dto.ToClientResponses(clients)
	return responses, nil
}

func (s *clientService) Create(agencyID uuid.UUID, req dto.CreateClientRequest) (*dto.ClientResponse, error) {
	email := strings.ToLower(strings.TrimSpace(req.Email))

	exists, err := s.clients.EmailExistsInAgency(agencyID, email, nil)
	if err != nil {
		return nil, apperrors.Internal("Could not check client email")
	}
	if exists {
		return nil, apperrors.Conflict("Client email already exists for this agency")
	}

	status := req.Status
	if status == "" {
		status = models.ClientStatusActive
	}

	client := &models.Client{
		AgencyID:    agencyID,
		Name:        strings.TrimSpace(req.Name),
		Email:       email,
		CompanyName: trimOptional(req.CompanyName),
		Phone:       trimOptional(req.Phone),
		Status:      status,
	}

	if err := s.clients.Create(client); err != nil {
		return nil, apperrors.Internal("Could not create client")
	}

	response := dto.ToClientResponse(*client)
	return &response, nil
}

func (s *clientService) GetByID(agencyID uuid.UUID, clientID uuid.UUID) (*dto.ClientResponse, error) {
	client, err := s.clients.FindByIDAndAgency(clientID, agencyID)
	if err != nil {
		return nil, apperrors.Internal("Could not load client")
	}
	if client == nil {
		return nil, apperrors.NotFound("Client not found")
	}

	response := dto.ToClientResponse(*client)
	return &response, nil
}

func (s *clientService) Update(agencyID uuid.UUID, clientID uuid.UUID, req dto.UpdateClientRequest) (*dto.ClientResponse, error) {
	client, err := s.clients.FindByIDAndAgency(clientID, agencyID)
	if err != nil {
		return nil, apperrors.Internal("Could not load client")
	}
	if client == nil {
		return nil, apperrors.NotFound("Client not found")
	}

	if req.Name != nil {
		client.Name = strings.TrimSpace(*req.Name)
	}

	if req.Email != nil {
		email := strings.ToLower(strings.TrimSpace(*req.Email))
		exists, err := s.clients.EmailExistsInAgency(agencyID, email, &clientID)
		if err != nil {
			return nil, apperrors.Internal("Could not check client email")
		}
		if exists {
			return nil, apperrors.Conflict("Client email already exists for this agency")
		}
		client.Email = email
	}

	if req.CompanyName != nil {
		client.CompanyName = trimOptional(req.CompanyName)
	}
	if req.Phone != nil {
		client.Phone = trimOptional(req.Phone)
	}
	if req.Status != nil {
		client.Status = *req.Status
	}

	if err := s.clients.Update(client); err != nil {
		return nil, apperrors.Internal("Could not update client")
	}

	response := dto.ToClientResponse(*client)
	return &response, nil
}

func (s *clientService) Archive(agencyID uuid.UUID, clientID uuid.UUID) error {
	client, err := s.clients.FindByIDAndAgency(clientID, agencyID)
	if err != nil {
		return apperrors.Internal("Could not load client")
	}
	if client == nil {
		return apperrors.NotFound("Client not found")
	}

	if err := s.clients.Archive(clientID, agencyID); err != nil {
		return apperrors.Internal("Could not archive client")
	}

	return nil
}

func trimOptional(value *string) *string {
	if value == nil {
		return nil
	}

	trimmed := strings.TrimSpace(*value)
	if trimmed == "" {
		return nil
	}

	return &trimmed
}
