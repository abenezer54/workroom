package dto

import (
	"time"

	"github.com/google/uuid"

	"workroom/backend/internal/models"
)

type AdminDashboardResponse struct {
	SummaryCards      AdminSummaryCards        `json:"summary_cards"`
	RecentProjects    []DashboardProject       `json:"recent_projects"`
	UpcomingDeadlines []DashboardDeadline      `json:"upcoming_deadlines"`
	RecentUpdates     []DashboardProjectUpdate `json:"recent_updates"`
	InvoiceOverview   DashboardInvoiceOverview `json:"invoice_overview"`
}

type AdminSummaryCards struct {
	TotalClients    int `json:"total_clients"`
	ActiveProjects  int `json:"active_projects"`
	PendingInvoices int `json:"pending_invoices"`
	CompletedTasks  int `json:"completed_tasks"`
}

type DashboardProject struct {
	ID         uuid.UUID            `json:"id"`
	Title      string               `json:"title"`
	ClientName string               `json:"client_name"`
	Status     models.ProjectStatus `json:"status"`
	Deadline   *string              `json:"deadline,omitempty"`
	Progress   int                  `json:"progress"`
}

type DashboardDeadline struct {
	ID      uuid.UUID `json:"id"`
	Title   string    `json:"title"`
	Type    string    `json:"type"`
	DueDate *string   `json:"due_date,omitempty"`
	Status  string    `json:"status"`
}

type DashboardProjectUpdate struct {
	ID             uuid.UUID `json:"id"`
	ProjectID      uuid.UUID `json:"project_id"`
	ProjectTitle   string    `json:"project_title"`
	Title          string    `json:"title"`
	ContentPreview string    `json:"content_preview"`
	CreatedAt      time.Time `json:"created_at"`
}

type DashboardInvoiceOverview struct {
	TotalOutstanding int `json:"total_outstanding"`
	PaidTotal        int `json:"paid_total"`
	OverdueTotal     int `json:"overdue_total"`
	DraftCount       int `json:"draft_count"`
	SentCount        int `json:"sent_count"`
	PaidCount        int `json:"paid_count"`
	OverdueCount     int `json:"overdue_count"`
}

type ClientDashboardResponse struct {
	ActiveProjects       int                      `json:"active_projects"`
	ProjectProgressCards []ClientProjectProgress  `json:"project_progress_cards"`
	RecentUpdates        []DashboardProjectUpdate `json:"recent_updates"`
	PendingInvoices      []ClientPendingInvoice   `json:"pending_invoices"`
	UpcomingMilestones   []ClientMilestone        `json:"upcoming_milestones"`
}

type ClientProjectProgress struct {
	ID       uuid.UUID            `json:"id"`
	Title    string               `json:"title"`
	Status   models.ProjectStatus `json:"status"`
	Deadline *string              `json:"deadline,omitempty"`
	Progress int                  `json:"progress"`
}

type ClientPendingInvoice struct {
	ID            uuid.UUID            `json:"id"`
	InvoiceNumber string               `json:"invoice_number"`
	Status        models.InvoiceStatus `json:"status"`
	DueDate       *string              `json:"due_date,omitempty"`
	Total         int                  `json:"total"`
}

type ClientMilestone struct {
	ID        uuid.UUID         `json:"id"`
	ProjectID uuid.UUID         `json:"project_id"`
	Title     string            `json:"title"`
	Type      string            `json:"type"`
	DueDate   *string           `json:"due_date,omitempty"`
	Status    models.TaskStatus `json:"status"`
}
