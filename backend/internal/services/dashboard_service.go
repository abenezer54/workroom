package services

import (
	"strings"
	"time"
	"unicode/utf8"

	"github.com/google/uuid"

	"workroom/backend/internal/dto"
	apperrors "workroom/backend/internal/errors"
	"workroom/backend/internal/repositories"
)

const (
	recentDashboardLimit   = 5
	upcomingDashboardLimit = 10
	contentPreviewLimit    = 160
)

type DashboardService interface {
	AdminDashboard(agencyID uuid.UUID) (*dto.AdminDashboardResponse, error)
	ClientDashboard(clientID uuid.UUID) (*dto.ClientDashboardResponse, error)
}

type dashboardService struct {
	dashboard repositories.DashboardRepository
}

func NewDashboardService(dashboard repositories.DashboardRepository) DashboardService {
	return &dashboardService{dashboard: dashboard}
}

func (s *dashboardService) AdminDashboard(agencyID uuid.UUID) (*dto.AdminDashboardResponse, error) {
	summary, err := s.dashboard.AdminSummary(agencyID)
	if err != nil {
		return nil, apperrors.Internal("Could not load dashboard summary")
	}

	recentProjects, err := s.dashboard.AdminRecentProjects(agencyID, recentDashboardLimit)
	if err != nil {
		return nil, apperrors.Internal("Could not load recent projects")
	}

	upcomingDeadlines, err := s.dashboard.AdminUpcomingDeadlines(agencyID, upcomingDashboardLimit)
	if err != nil {
		return nil, apperrors.Internal("Could not load upcoming deadlines")
	}

	recentUpdates, err := s.dashboard.AdminRecentUpdates(agencyID, recentDashboardLimit)
	if err != nil {
		return nil, apperrors.Internal("Could not load recent updates")
	}

	invoiceOverview, err := s.dashboard.AdminInvoiceOverview(agencyID)
	if err != nil {
		return nil, apperrors.Internal("Could not load invoice overview")
	}

	return &dto.AdminDashboardResponse{
		SummaryCards: dto.AdminSummaryCards{
			TotalClients:    summary.TotalClients,
			ActiveProjects:  summary.ActiveProjects,
			PendingInvoices: summary.PendingInvoices,
			CompletedTasks:  summary.CompletedTasks,
		},
		RecentProjects:    toDashboardProjects(recentProjects),
		UpcomingDeadlines: toDashboardDeadlines(upcomingDeadlines),
		RecentUpdates:     toDashboardUpdates(recentUpdates),
		InvoiceOverview: dto.DashboardInvoiceOverview{
			TotalOutstanding: invoiceOverview.TotalOutstanding,
			PaidTotal:        invoiceOverview.PaidTotal,
			OverdueTotal:     invoiceOverview.OverdueTotal,
			DraftCount:       invoiceOverview.DraftCount,
			SentCount:        invoiceOverview.SentCount,
			PaidCount:        invoiceOverview.PaidCount,
			OverdueCount:     invoiceOverview.OverdueCount,
		},
	}, nil
}

func (s *dashboardService) ClientDashboard(clientID uuid.UUID) (*dto.ClientDashboardResponse, error) {
	if clientID == uuid.Nil {
		// Client portal data must be derived from the authenticated user's client_id.
		// TODO: If future schema work moves this link to clients.user_id, update
		// auth claims before enabling this endpoint for those accounts.
		return nil, apperrors.Forbidden("Client account is not linked to a client profile")
	}

	activeProjects, err := s.dashboard.ClientActiveProjectCount(clientID)
	if err != nil {
		return nil, apperrors.Internal("Could not load client dashboard summary")
	}

	progressCards, err := s.dashboard.ClientProjectProgressCards(clientID, recentDashboardLimit)
	if err != nil {
		return nil, apperrors.Internal("Could not load project progress")
	}

	recentUpdates, err := s.dashboard.ClientRecentUpdates(clientID, recentDashboardLimit)
	if err != nil {
		return nil, apperrors.Internal("Could not load recent updates")
	}

	pendingInvoices, err := s.dashboard.ClientPendingInvoices(clientID, recentDashboardLimit)
	if err != nil {
		return nil, apperrors.Internal("Could not load pending invoices")
	}

	upcomingMilestones, err := s.dashboard.ClientUpcomingMilestones(clientID, upcomingDashboardLimit)
	if err != nil {
		return nil, apperrors.Internal("Could not load upcoming milestones")
	}

	return &dto.ClientDashboardResponse{
		ActiveProjects:       activeProjects,
		ProjectProgressCards: toClientProjectProgress(progressCards),
		RecentUpdates:        toDashboardUpdates(recentUpdates),
		PendingInvoices:      toClientPendingInvoices(pendingInvoices),
		UpcomingMilestones:   toClientMilestones(upcomingMilestones),
	}, nil
}

func toDashboardProjects(rows []repositories.DashboardProjectRow) []dto.DashboardProject {
	projects := make([]dto.DashboardProject, 0, len(rows))
	for _, row := range rows {
		projects = append(projects, dto.DashboardProject{
			ID:         row.ID,
			Title:      row.Title,
			ClientName: row.ClientName,
			Status:     row.Status,
			Deadline:   formatDashboardDate(row.Deadline),
			Progress:   row.Progress,
		})
	}

	return projects
}

func toDashboardDeadlines(rows []repositories.DashboardDeadlineRow) []dto.DashboardDeadline {
	deadlines := make([]dto.DashboardDeadline, 0, len(rows))
	for _, row := range rows {
		deadlines = append(deadlines, dto.DashboardDeadline{
			ID:      row.ID,
			Title:   row.Title,
			Type:    row.Type,
			DueDate: formatDashboardDate(row.DueDate),
			Status:  row.Status,
		})
	}

	return deadlines
}

func toDashboardUpdates(rows []repositories.DashboardUpdateRow) []dto.DashboardProjectUpdate {
	updates := make([]dto.DashboardProjectUpdate, 0, len(rows))
	for _, row := range rows {
		updates = append(updates, dto.DashboardProjectUpdate{
			ID:             row.ID,
			ProjectID:      row.ProjectID,
			ProjectTitle:   row.ProjectTitle,
			Title:          row.Title,
			ContentPreview: contentPreview(row.Content, contentPreviewLimit),
			CreatedAt:      row.CreatedAt,
		})
	}

	return updates
}

func toClientProjectProgress(rows []repositories.ClientProjectProgressRow) []dto.ClientProjectProgress {
	projects := make([]dto.ClientProjectProgress, 0, len(rows))
	for _, row := range rows {
		projects = append(projects, dto.ClientProjectProgress{
			ID:       row.ID,
			Title:    row.Title,
			Status:   row.Status,
			Deadline: formatDashboardDate(row.Deadline),
			Progress: row.Progress,
		})
	}

	return projects
}

func toClientPendingInvoices(rows []repositories.ClientPendingInvoiceRow) []dto.ClientPendingInvoice {
	invoices := make([]dto.ClientPendingInvoice, 0, len(rows))
	for _, row := range rows {
		invoices = append(invoices, dto.ClientPendingInvoice{
			ID:            row.ID,
			InvoiceNumber: row.InvoiceNumber,
			Status:        row.Status,
			DueDate:       formatDashboardDate(row.DueDate),
			Total:         row.Total,
		})
	}

	return invoices
}

func toClientMilestones(rows []repositories.ClientMilestoneRow) []dto.ClientMilestone {
	milestones := make([]dto.ClientMilestone, 0, len(rows))
	for _, row := range rows {
		milestones = append(milestones, dto.ClientMilestone{
			ID:        row.ID,
			ProjectID: row.ProjectID,
			Title:     row.Title,
			Type:      row.Type,
			DueDate:   formatDashboardDate(row.DueDate),
			Status:    row.Status,
		})
	}

	return milestones
}

func formatDashboardDate(value *time.Time) *string {
	if value == nil {
		return nil
	}

	formatted := value.Format("2006-01-02")
	return &formatted
}

func contentPreview(content string, limit int) string {
	preview := strings.TrimSpace(content)
	if utf8.RuneCountInString(preview) <= limit {
		return preview
	}

	runes := []rune(preview)
	return strings.TrimSpace(string(runes[:limit])) + "..."
}
