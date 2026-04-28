package repositories

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"workroom/backend/internal/models"
)

type DashboardRepository interface {
	AdminSummary(agencyID uuid.UUID) (AdminSummaryRow, error)
	AdminRecentProjects(agencyID uuid.UUID, limit int) ([]DashboardProjectRow, error)
	AdminUpcomingDeadlines(agencyID uuid.UUID, limit int) ([]DashboardDeadlineRow, error)
	AdminRecentUpdates(agencyID uuid.UUID, limit int) ([]DashboardUpdateRow, error)
	AdminInvoiceOverview(agencyID uuid.UUID) (DashboardInvoiceOverviewRow, error)
	ClientActiveProjectCount(clientID uuid.UUID) (int, error)
	ClientProjectProgressCards(clientID uuid.UUID, limit int) ([]ClientProjectProgressRow, error)
	ClientRecentUpdates(clientID uuid.UUID, limit int) ([]DashboardUpdateRow, error)
	ClientPendingInvoices(clientID uuid.UUID, limit int) ([]ClientPendingInvoiceRow, error)
	ClientUpcomingMilestones(clientID uuid.UUID, limit int) ([]ClientMilestoneRow, error)
}

type dashboardRepository struct {
	db *gorm.DB
}

func NewDashboardRepository(db *gorm.DB) DashboardRepository {
	return &dashboardRepository{db: db}
}

type AdminSummaryRow struct {
	TotalClients    int
	ActiveProjects  int
	PendingInvoices int
	CompletedTasks  int
}

type DashboardProjectRow struct {
	ID         uuid.UUID
	Title      string
	ClientName string
	Status     models.ProjectStatus
	Deadline   *time.Time
	Progress   int
}

type DashboardDeadlineRow struct {
	ID      uuid.UUID
	Title   string
	Type    string
	DueDate *time.Time
	Status  string
}

type DashboardUpdateRow struct {
	ID           uuid.UUID
	ProjectID    uuid.UUID
	ProjectTitle string
	Title        string
	Content      string
	CreatedAt    time.Time
}

type DashboardInvoiceOverviewRow struct {
	TotalOutstanding int
	PaidTotal        int
	OverdueTotal     int
	DraftCount       int
	SentCount        int
	PaidCount        int
	OverdueCount     int
}

type ClientProjectProgressRow struct {
	ID       uuid.UUID
	Title    string
	Status   models.ProjectStatus
	Deadline *time.Time
	Progress int
}

type ClientPendingInvoiceRow struct {
	ID            uuid.UUID
	InvoiceNumber string
	Status        models.InvoiceStatus
	DueDate       *time.Time
	Total         int
}

type ClientMilestoneRow struct {
	ID        uuid.UUID
	ProjectID uuid.UUID
	Title     string
	Type      string
	DueDate   *time.Time
	Status    models.TaskStatus
}

func (r *dashboardRepository) AdminSummary(agencyID uuid.UUID) (AdminSummaryRow, error) {
	var row AdminSummaryRow
	if err := r.db.Raw(`
		SELECT
			(SELECT COUNT(*) FROM clients WHERE agency_id = ? AND status <> ? AND deleted_at IS NULL) AS total_clients,
			(SELECT COUNT(*) FROM projects WHERE agency_id = ? AND status NOT IN (?, ?) AND deleted_at IS NULL) AS active_projects,
			(SELECT COUNT(*) FROM invoices WHERE agency_id = ? AND status IN (?, ?) AND deleted_at IS NULL) AS pending_invoices,
			(SELECT COUNT(*) FROM tasks WHERE agency_id = ? AND status = ? AND deleted_at IS NULL) AS completed_tasks
	`, agencyID, models.ClientStatusArchived,
		agencyID, models.ProjectStatusCompleted, models.ProjectStatusArchived,
		agencyID, models.InvoiceStatusSent, models.InvoiceStatusOverdue,
		agencyID, models.TaskStatusDone,
	).Scan(&row).Error; err != nil {
		return AdminSummaryRow{}, err
	}

	return row, nil
}

func (r *dashboardRepository) AdminRecentProjects(agencyID uuid.UUID, limit int) ([]DashboardProjectRow, error) {
	var rows []DashboardProjectRow
	if err := r.db.Table("projects").
		Select("projects.id, projects.title, clients.name AS client_name, projects.status, projects.deadline, projects.progress").
		Joins("JOIN clients ON clients.id = projects.client_id").
		Where("projects.agency_id = ? AND projects.status <> ? AND projects.deleted_at IS NULL AND clients.deleted_at IS NULL", agencyID, models.ProjectStatusArchived).
		Order("projects.created_at DESC").
		Limit(limit).
		Scan(&rows).Error; err != nil {
		return nil, err
	}

	return rows, nil
}

func (r *dashboardRepository) AdminUpcomingDeadlines(agencyID uuid.UUID, limit int) ([]DashboardDeadlineRow, error) {
	var rows []DashboardDeadlineRow
	if err := r.db.Raw(`
		SELECT id, title, type, due_date, status
		FROM (
			SELECT id, title, 'PROJECT' AS type, deadline AS due_date, status::text AS status
			FROM projects
			WHERE agency_id = ?
				AND deadline IS NOT NULL
				AND deadline >= CURRENT_DATE
				AND status NOT IN (?, ?)
				AND deleted_at IS NULL
			UNION ALL
			SELECT tasks.id, tasks.title, 'TASK' AS type, tasks.due_date, tasks.status::text AS status
			FROM tasks
			JOIN projects ON projects.id = tasks.project_id
			WHERE tasks.agency_id = ?
				AND tasks.due_date IS NOT NULL
				AND tasks.due_date >= CURRENT_DATE
				AND tasks.status <> ?
				AND tasks.deleted_at IS NULL
				AND projects.status <> ?
				AND projects.deleted_at IS NULL
		) deadlines
		ORDER BY due_date ASC
		LIMIT ?
	`, agencyID, models.ProjectStatusCompleted, models.ProjectStatusArchived,
		agencyID, models.TaskStatusDone, models.ProjectStatusArchived,
		limit,
	).Scan(&rows).Error; err != nil {
		return nil, err
	}

	return rows, nil
}

func (r *dashboardRepository) AdminRecentUpdates(agencyID uuid.UUID, limit int) ([]DashboardUpdateRow, error) {
	var rows []DashboardUpdateRow
	if err := r.db.Table("project_updates").
		Select("project_updates.id, project_updates.project_id, projects.title AS project_title, project_updates.title, project_updates.content, project_updates.created_at").
		Joins("JOIN projects ON projects.id = project_updates.project_id").
		Where("project_updates.agency_id = ? AND project_updates.deleted_at IS NULL AND projects.status <> ? AND projects.deleted_at IS NULL", agencyID, models.ProjectStatusArchived).
		Order("project_updates.created_at DESC").
		Limit(limit).
		Scan(&rows).Error; err != nil {
		return nil, err
	}

	return rows, nil
}

func (r *dashboardRepository) AdminInvoiceOverview(agencyID uuid.UUID) (DashboardInvoiceOverviewRow, error) {
	var row DashboardInvoiceOverviewRow
	if err := r.db.Table("invoices").
		Select(`
			COALESCE(SUM(CASE WHEN status IN (?, ?) THEN total ELSE 0 END), 0) AS total_outstanding,
			COALESCE(SUM(CASE WHEN status = ? THEN total ELSE 0 END), 0) AS paid_total,
			COALESCE(SUM(CASE WHEN status = ? THEN total ELSE 0 END), 0) AS overdue_total,
			COUNT(*) FILTER (WHERE status = ?) AS draft_count,
			COUNT(*) FILTER (WHERE status = ?) AS sent_count,
			COUNT(*) FILTER (WHERE status = ?) AS paid_count,
			COUNT(*) FILTER (WHERE status = ?) AS overdue_count
		`, models.InvoiceStatusSent, models.InvoiceStatusOverdue,
			models.InvoiceStatusPaid,
			models.InvoiceStatusOverdue,
			models.InvoiceStatusDraft,
			models.InvoiceStatusSent,
			models.InvoiceStatusPaid,
			models.InvoiceStatusOverdue,
		).
		Where("agency_id = ? AND deleted_at IS NULL", agencyID).
		Scan(&row).Error; err != nil {
		return DashboardInvoiceOverviewRow{}, err
	}

	return row, nil
}

func (r *dashboardRepository) ClientActiveProjectCount(clientID uuid.UUID) (int, error) {
	var count int64
	if err := r.db.Model(&models.Project{}).
		Where("client_id = ? AND status NOT IN ?", clientID, []models.ProjectStatus{models.ProjectStatusCompleted, models.ProjectStatusArchived}).
		Count(&count).Error; err != nil {
		return 0, err
	}

	return int(count), nil
}

func (r *dashboardRepository) ClientProjectProgressCards(clientID uuid.UUID, limit int) ([]ClientProjectProgressRow, error) {
	var rows []ClientProjectProgressRow
	if err := r.db.Table("projects").
		Select("id, title, status, deadline, progress").
		Where("client_id = ? AND status NOT IN (?, ?) AND deleted_at IS NULL", clientID, models.ProjectStatusCompleted, models.ProjectStatusArchived).
		Order("updated_at DESC").
		Limit(limit).
		Scan(&rows).Error; err != nil {
		return nil, err
	}

	return rows, nil
}

func (r *dashboardRepository) ClientRecentUpdates(clientID uuid.UUID, limit int) ([]DashboardUpdateRow, error) {
	var rows []DashboardUpdateRow
	if err := r.db.Table("project_updates").
		Select("project_updates.id, project_updates.project_id, projects.title AS project_title, project_updates.title, project_updates.content, project_updates.created_at").
		Joins("JOIN projects ON projects.id = project_updates.project_id").
		Where("projects.client_id = ? AND project_updates.deleted_at IS NULL AND projects.status <> ? AND projects.deleted_at IS NULL", clientID, models.ProjectStatusArchived).
		Order("project_updates.created_at DESC").
		Limit(limit).
		Scan(&rows).Error; err != nil {
		return nil, err
	}

	return rows, nil
}

func (r *dashboardRepository) ClientPendingInvoices(clientID uuid.UUID, limit int) ([]ClientPendingInvoiceRow, error) {
	var rows []ClientPendingInvoiceRow
	if err := r.db.Table("invoices").
		Select("id, invoice_number, status, due_date, total").
		Where("client_id = ? AND status IN (?, ?) AND deleted_at IS NULL", clientID, models.InvoiceStatusSent, models.InvoiceStatusOverdue).
		Order("created_at DESC").
		Limit(limit).
		Scan(&rows).Error; err != nil {
		return nil, err
	}

	return rows, nil
}

func (r *dashboardRepository) ClientUpcomingMilestones(clientID uuid.UUID, limit int) ([]ClientMilestoneRow, error) {
	var rows []ClientMilestoneRow
	if err := r.db.Table("tasks").
		Select("tasks.id, tasks.project_id, tasks.title, 'TASK' AS type, tasks.due_date, tasks.status").
		Joins("JOIN projects ON projects.id = tasks.project_id").
		Where("projects.client_id = ? AND tasks.due_date IS NOT NULL AND tasks.due_date >= CURRENT_DATE AND tasks.status <> ? AND tasks.deleted_at IS NULL AND projects.status <> ? AND projects.deleted_at IS NULL", clientID, models.TaskStatusDone, models.ProjectStatusArchived).
		Order("tasks.due_date ASC").
		Limit(limit).
		Scan(&rows).Error; err != nil {
		return nil, err
	}

	return rows, nil
}
