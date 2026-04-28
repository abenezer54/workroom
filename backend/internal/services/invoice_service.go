package services

import (
	"math"
	"strings"
	"time"

	"github.com/google/uuid"

	"workroom/backend/internal/dto"
	apperrors "workroom/backend/internal/errors"
	"workroom/backend/internal/models"
	"workroom/backend/internal/repositories"
)

type InvoiceService interface {
	ListForAgency(agencyID uuid.UUID, query dto.InvoiceListQuery) ([]dto.InvoiceResponse, error)
	ListForClient(clientID uuid.UUID, query dto.InvoiceListQuery) ([]dto.InvoiceResponse, error)
	Create(agencyID uuid.UUID, req dto.CreateInvoiceRequest) (*dto.InvoiceResponse, error)
	GetForAgency(agencyID uuid.UUID, invoiceID uuid.UUID) (*dto.InvoiceResponse, error)
	GetForClient(clientID uuid.UUID, invoiceID uuid.UUID) (*dto.InvoiceResponse, error)
	Update(agencyID uuid.UUID, invoiceID uuid.UUID, req dto.UpdateInvoiceRequest) (*dto.InvoiceResponse, error)
	UpdateStatus(agencyID uuid.UUID, invoiceID uuid.UUID, status models.InvoiceStatus) (*dto.InvoiceResponse, error)
	Cancel(agencyID uuid.UUID, invoiceID uuid.UUID) error
}

type invoiceService struct {
	invoices InvoiceRepositoryAdapter
	clients  repositories.ClientRepository
	projects repositories.ProjectRepository
}

type InvoiceRepositoryAdapter interface {
	ListByAgency(agencyID uuid.UUID, filters repositories.InvoiceFilters) ([]models.Invoice, error)
	ListByClient(clientID uuid.UUID, filters repositories.InvoiceFilters) ([]models.Invoice, error)
	FindByIDAndAgency(id uuid.UUID, agencyID uuid.UUID) (*models.Invoice, error)
	FindByIDAndClient(id uuid.UUID, clientID uuid.UUID) (*models.Invoice, error)
	CreateWithItems(invoice *models.Invoice) error
	UpdateWithItems(invoice *models.Invoice, replaceItems bool) error
	UpdateStatus(id uuid.UUID, agencyID uuid.UUID, status models.InvoiceStatus) error
	Cancel(id uuid.UUID, agencyID uuid.UUID) error
}

func NewInvoiceService(
	invoices InvoiceRepositoryAdapter,
	clients repositories.ClientRepository,
	projects repositories.ProjectRepository,
) InvoiceService {
	return &invoiceService{
		invoices: invoices,
		clients:  clients,
		projects: projects,
	}
}

func (s *invoiceService) ListForAgency(agencyID uuid.UUID, query dto.InvoiceListQuery) ([]dto.InvoiceResponse, error) {
	filters, err := parseInvoiceFilters(query)
	if err != nil {
		return nil, err
	}

	invoices, err := s.invoices.ListByAgency(agencyID, filters)
	if err != nil {
		return nil, apperrors.Internal("Could not list invoices")
	}

	return dto.ToInvoiceResponses(invoices), nil
}

func (s *invoiceService) ListForClient(clientID uuid.UUID, query dto.InvoiceListQuery) ([]dto.InvoiceResponse, error) {
	filters, err := parseInvoiceFilters(query)
	if err != nil {
		return nil, err
	}
	filters.ClientID = nil

	invoices, err := s.invoices.ListByClient(clientID, filters)
	if err != nil {
		return nil, apperrors.Internal("Could not list invoices")
	}

	return dto.ToInvoiceResponses(invoices), nil
}

func (s *invoiceService) Create(agencyID uuid.UUID, req dto.CreateInvoiceRequest) (*dto.InvoiceResponse, error) {
	clientID, projectID, err := s.validateInvoiceOwnership(agencyID, req.ClientID, req.ProjectID)
	if err != nil {
		return nil, err
	}

	issueDate, dueDate, err := parseInvoiceDates(req.IssueDate, req.DueDate)
	if err != nil {
		return nil, err
	}

	status := req.Status
	if status == "" {
		status = models.InvoiceStatusDraft
	}

	tax := valueOrZero(req.Tax)
	discount := valueOrZero(req.Discount)
	items, subtotal, total, err := calculateInvoiceItems(req.Items, tax, discount)
	if err != nil {
		return nil, err
	}

	invoice := &models.Invoice{
		AgencyID:  agencyID,
		ClientID:  clientID,
		ProjectID: projectID,
		Status:    status,
		IssueDate: issueDate,
		DueDate:   dueDate,
		Subtotal:  subtotal,
		Tax:       tax,
		Discount:  discount,
		Total:     total,
		Items:     items,
	}

	if err := s.invoices.CreateWithItems(invoice); err != nil {
		return nil, apperrors.Internal("Could not create invoice")
	}

	response := dto.ToInvoiceResponse(*invoice)
	return &response, nil
}

func (s *invoiceService) GetForAgency(agencyID uuid.UUID, invoiceID uuid.UUID) (*dto.InvoiceResponse, error) {
	invoice, err := s.invoices.FindByIDAndAgency(invoiceID, agencyID)
	if err != nil {
		return nil, apperrors.Internal("Could not load invoice")
	}
	if invoice == nil {
		return nil, apperrors.NotFound("Invoice not found")
	}

	response := dto.ToInvoiceResponse(*invoice)
	return &response, nil
}

func (s *invoiceService) GetForClient(clientID uuid.UUID, invoiceID uuid.UUID) (*dto.InvoiceResponse, error) {
	invoice, err := s.invoices.FindByIDAndClient(invoiceID, clientID)
	if err != nil {
		return nil, apperrors.Internal("Could not load invoice")
	}
	if invoice == nil {
		return nil, apperrors.NotFound("Invoice not found")
	}

	response := dto.ToInvoiceResponse(*invoice)
	return &response, nil
}

func (s *invoiceService) Update(agencyID uuid.UUID, invoiceID uuid.UUID, req dto.UpdateInvoiceRequest) (*dto.InvoiceResponse, error) {
	invoice, err := s.invoices.FindByIDAndAgency(invoiceID, agencyID)
	if err != nil {
		return nil, apperrors.Internal("Could not load invoice")
	}
	if invoice == nil {
		return nil, apperrors.NotFound("Invoice not found")
	}

	clientID := invoice.ClientID
	projectID := invoice.ProjectID
	if req.ClientID != nil || req.ProjectID != nil {
		clientValue := clientID.String()
		if req.ClientID != nil {
			clientValue = *req.ClientID
		}
		projectValue := projectIDToString(projectID)
		if req.ProjectID != nil {
			projectValue = req.ProjectID
		}
		validClientID, validProjectID, err := s.validateInvoiceOwnership(agencyID, clientValue, projectValue)
		if err != nil {
			return nil, err
		}
		clientID = validClientID
		projectID = validProjectID
	}

	if req.Status != nil {
		invoice.Status = *req.Status
	}
	if req.IssueDate != nil || req.DueDate != nil {
		issueValue := invoice.IssueDate.Format("2006-01-02")
		if req.IssueDate != nil {
			issueValue = *req.IssueDate
		}
		dueValue := dtoDateString(invoice.DueDate)
		if req.DueDate != nil {
			dueValue = req.DueDate
		}
		issueDate, dueDate, err := parseInvoiceDates(issueValue, dueValue)
		if err != nil {
			return nil, err
		}
		invoice.IssueDate = issueDate
		invoice.DueDate = dueDate
	}

	if req.Tax != nil {
		invoice.Tax = *req.Tax
	}
	if req.Discount != nil {
		invoice.Discount = *req.Discount
	}

	replaceItems := req.Items != nil
	if replaceItems && len(req.Items) == 0 {
		return nil, apperrors.Validation("One or more fields are invalid", map[string]string{"items": "At least one invoice item is required"})
	}

	items := invoice.Items
	if replaceItems {
		items = make([]models.InvoiceItem, 0)
	}

	if replaceItems {
		calculatedItems, subtotal, total, err := calculateInvoiceItems(req.Items, invoice.Tax, invoice.Discount)
		if err != nil {
			return nil, err
		}
		items = calculatedItems
		invoice.Subtotal = subtotal
		invoice.Total = total
	} else {
		_, subtotal, total, err := calculateExistingInvoiceTotals(invoice.Items, invoice.Tax, invoice.Discount)
		if err != nil {
			return nil, err
		}
		invoice.Subtotal = subtotal
		invoice.Total = total
	}

	invoice.ClientID = clientID
	invoice.ProjectID = projectID
	invoice.Items = items

	if err := s.invoices.UpdateWithItems(invoice, replaceItems); err != nil {
		return nil, apperrors.Internal("Could not update invoice")
	}

	updated, err := s.invoices.FindByIDAndAgency(invoiceID, agencyID)
	if err != nil {
		return nil, apperrors.Internal("Could not reload invoice")
	}

	response := dto.ToInvoiceResponse(*updated)
	return &response, nil
}

func (s *invoiceService) UpdateStatus(agencyID uuid.UUID, invoiceID uuid.UUID, status models.InvoiceStatus) (*dto.InvoiceResponse, error) {
	invoice, err := s.invoices.FindByIDAndAgency(invoiceID, agencyID)
	if err != nil {
		return nil, apperrors.Internal("Could not load invoice")
	}
	if invoice == nil {
		return nil, apperrors.NotFound("Invoice not found")
	}

	if err := s.invoices.UpdateStatus(invoiceID, agencyID, status); err != nil {
		return nil, apperrors.Internal("Could not update invoice status")
	}

	invoice.Status = status
	response := dto.ToInvoiceResponse(*invoice)
	return &response, nil
}

func (s *invoiceService) Cancel(agencyID uuid.UUID, invoiceID uuid.UUID) error {
	invoice, err := s.invoices.FindByIDAndAgency(invoiceID, agencyID)
	if err != nil {
		return apperrors.Internal("Could not load invoice")
	}
	if invoice == nil {
		return apperrors.NotFound("Invoice not found")
	}

	if err := s.invoices.Cancel(invoiceID, agencyID); err != nil {
		return apperrors.Internal("Could not cancel invoice")
	}

	return nil
}

func (s *invoiceService) validateInvoiceOwnership(agencyID uuid.UUID, clientIDValue string, projectIDValue *string) (uuid.UUID, *uuid.UUID, error) {
	clientID, err := uuid.Parse(clientIDValue)
	if err != nil {
		return uuid.Nil, nil, apperrors.BadRequest("Invalid client id", nil)
	}

	client, err := s.clients.FindByIDAndAgency(clientID, agencyID)
	if err != nil {
		return uuid.Nil, nil, apperrors.Internal("Could not validate client ownership")
	}
	if client == nil || client.Status == models.ClientStatusArchived {
		return uuid.Nil, nil, apperrors.NotFound("Client not found")
	}

	if projectIDValue == nil || strings.TrimSpace(*projectIDValue) == "" {
		return clientID, nil, nil
	}

	projectID, err := uuid.Parse(*projectIDValue)
	if err != nil {
		return uuid.Nil, nil, apperrors.BadRequest("Invalid project id", nil)
	}

	project, err := s.projects.FindByIDAndAgency(projectID, agencyID)
	if err != nil {
		return uuid.Nil, nil, apperrors.Internal("Could not validate project ownership")
	}
	if project == nil || project.Status == models.ProjectStatusArchived {
		return uuid.Nil, nil, apperrors.NotFound("Project not found")
	}
	if project.ClientID != clientID {
		return uuid.Nil, nil, apperrors.BadRequest("Project does not belong to the selected client", nil)
	}

	return clientID, &projectID, nil
}

func parseInvoiceFilters(query dto.InvoiceListQuery) (repositories.InvoiceFilters, error) {
	filters := repositories.InvoiceFilters{}
	if query.Status != "" {
		status := models.InvoiceStatus(query.Status)
		filters.Status = &status
	}
	if query.ClientID != "" {
		clientID, err := uuid.Parse(query.ClientID)
		if err != nil {
			return filters, apperrors.BadRequest("Invalid client id", nil)
		}
		filters.ClientID = &clientID
	}
	if query.ProjectID != "" {
		projectID, err := uuid.Parse(query.ProjectID)
		if err != nil {
			return filters, apperrors.BadRequest("Invalid project id", nil)
		}
		filters.ProjectID = &projectID
	}

	return filters, nil
}

func parseInvoiceDates(issueDateValue string, dueDateValue *string) (time.Time, *time.Time, error) {
	issueDate, err := parseRequiredDate(issueDateValue, "issue_date")
	if err != nil {
		return time.Time{}, nil, err
	}

	dueDate, err := parseOptionalDate(dueDateValue)
	if err != nil {
		return time.Time{}, nil, apperrors.Validation("One or more fields are invalid", map[string]string{"due_date": "Must use YYYY-MM-DD"})
	}

	if dueDate != nil && dueDate.Before(issueDate) {
		return time.Time{}, nil, apperrors.Validation("One or more fields are invalid", map[string]string{"due_date": "Due date cannot be before issue date"})
	}

	return issueDate, dueDate, nil
}

func parseRequiredDate(value string, field string) (time.Time, error) {
	parsed, err := time.Parse("2006-01-02", strings.TrimSpace(value))
	if err != nil {
		return time.Time{}, apperrors.Validation("One or more fields are invalid", map[string]string{field: "Must use YYYY-MM-DD"})
	}

	return parsed, nil
}

func calculateInvoiceItems(requestItems []dto.InvoiceItemRequest, tax int, discount int) ([]models.InvoiceItem, int, int, error) {
	items := make([]models.InvoiceItem, 0, len(requestItems))
	subtotal := 0

	for _, requestItem := range requestItems {
		amount := int(math.Round(requestItem.Quantity * float64(requestItem.UnitPrice)))
		subtotal += amount
		items = append(items, models.InvoiceItem{
			Description: strings.TrimSpace(requestItem.Description),
			Quantity:    requestItem.Quantity,
			UnitPrice:   requestItem.UnitPrice,
			Amount:      amount,
		})
	}

	total := subtotal + tax - discount
	if total < 0 {
		return nil, 0, 0, apperrors.Validation("One or more fields are invalid", map[string]string{"total": "Total cannot be negative"})
	}

	return items, subtotal, total, nil
}

func calculateExistingInvoiceTotals(items []models.InvoiceItem, tax int, discount int) ([]models.InvoiceItem, int, int, error) {
	subtotal := 0
	for _, item := range items {
		subtotal += item.Amount
	}

	total := subtotal + tax - discount
	if total < 0 {
		return nil, 0, 0, apperrors.Validation("One or more fields are invalid", map[string]string{"total": "Total cannot be negative"})
	}

	return items, subtotal, total, nil
}

func valueOrZero(value *int) int {
	if value == nil {
		return 0
	}

	return *value
}

func projectIDToString(projectID *uuid.UUID) *string {
	if projectID == nil {
		return nil
	}

	value := projectID.String()
	return &value
}

func dtoDateString(date *time.Time) *string {
	if date == nil {
		return nil
	}

	value := date.Format("2006-01-02")
	return &value
}
