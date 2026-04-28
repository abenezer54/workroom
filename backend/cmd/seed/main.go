package main

import (
	"fmt"
	"log"
	"math"
	"os"
	"path/filepath"
	"time"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"

	"workroom/backend/internal/config"
	"workroom/backend/internal/database"
	"workroom/backend/internal/models"
)

const (
	demoPassword    = "password123"
	demoAdminEmail  = "admin@workroom.demo"
	demoClientEmail = "client@workroom.demo"
)

type seedState struct {
	admin    models.User
	client   models.User
	clients  map[string]models.Client
	projects map[string]models.Project
}

type clientSeed struct {
	Name        string
	Email       string
	CompanyName string
	Phone       string
}

type projectSeed struct {
	Title       string
	ClientName  string
	Description string
	Status      models.ProjectStatus
	StartDate   string
	Deadline    string
	Budget      int
	Progress    int
}

type taskSeed struct {
	ProjectTitle string
	Title        string
	Description  string
	Status       models.TaskStatus
	Priority     models.TaskPriority
	DueDate      string
}

type updateSeed struct {
	ProjectTitle string
	Title        string
	Content      string
}

type invoiceSeed struct {
	InvoiceNumber string
	ClientName    string
	ProjectTitle  string
	Status        models.InvoiceStatus
	IssueDate     string
	DueDate       string
	Tax           int
	Discount      int
	Items         []invoiceItemSeed
}

type invoiceItemSeed struct {
	Description string
	Quantity    float64
	UnitPrice   int
}

func main() {
	cfg := config.Load()

	db, err := database.Connect(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		log.Fatalf("failed to access database handle: %v", err)
	}
	defer sqlDB.Close()

	if err := database.RunMigrations(db, migrationsDir()); err != nil {
		log.Fatalf("failed to run migrations: %v", err)
	}

	if err := seed(db); err != nil {
		log.Fatalf("failed to seed demo data: %v", err)
	}

	log.Println("demo data seeded successfully")
	log.Printf("agency admin: %s / %s", demoAdminEmail, demoPassword)
	log.Printf("client user: %s / %s", demoClientEmail, demoPassword)
}

func seed(db *gorm.DB) error {
	return db.Transaction(func(tx *gorm.DB) error {
		state := seedState{
			clients:  map[string]models.Client{},
			projects: map[string]models.Project{},
		}

		admin, err := upsertDemoUser(tx, demoAdminEmail, "Demo Admin", models.RoleAgencyAdmin, nil, nil)
		if err != nil {
			return err
		}
		state.admin = admin

		if err := ensureAdminAgencyID(tx, &state.admin); err != nil {
			return err
		}

		if err := seedClients(tx, &state); err != nil {
			return err
		}

		acmeClientID := state.clients["Acme Studio"].ID
		clientUser, err := upsertDemoUser(tx, demoClientEmail, "Client Demo", models.RoleClient, &state.admin.ID, &acmeClientID)
		if err != nil {
			return err
		}
		state.client = clientUser

		if err := seedProjects(tx, &state); err != nil {
			return err
		}
		if err := seedTasks(tx, &state); err != nil {
			return err
		}
		if err := seedProjectUpdates(tx, &state); err != nil {
			return err
		}
		if err := seedInvoices(tx, &state); err != nil {
			return err
		}

		return nil
	})
}

func upsertDemoUser(tx *gorm.DB, email string, name string, role models.UserRole, agencyID *uuid.UUID, clientID *uuid.UUID) (models.User, error) {
	passwordHash, err := bcrypt.GenerateFromPassword([]byte(demoPassword), bcrypt.DefaultCost)
	if err != nil {
		return models.User{}, fmt.Errorf("hash password for %s: %w", email, err)
	}

	var user models.User
	result := tx.Where("LOWER(email) = LOWER(?)", email).Limit(1).Find(&user)
	if result.Error != nil {
		return models.User{}, fmt.Errorf("find user %s: %w", email, result.Error)
	}

	if result.RowsAffected == 0 {
		user = models.User{
			Name:         name,
			Email:        email,
			PasswordHash: string(passwordHash),
			Role:         role,
			AgencyID:     agencyID,
			ClientID:     clientID,
			IsActive:     true,
		}
		if err := tx.Create(&user).Error; err != nil {
			return models.User{}, fmt.Errorf("create user %s: %w", email, err)
		}
		return user, nil
	}

	user.Name = name
	user.PasswordHash = string(passwordHash)
	user.Role = role
	user.AgencyID = agencyID
	user.ClientID = clientID
	user.IsActive = true
	if err := tx.Save(&user).Error; err != nil {
		return models.User{}, fmt.Errorf("update user %s: %w", email, err)
	}

	return user, nil
}

func ensureAdminAgencyID(tx *gorm.DB, admin *models.User) error {
	admin.AgencyID = &admin.ID
	if err := tx.Model(&models.User{}).Where("id = ?", admin.ID).Update("agency_id", admin.ID).Error; err != nil {
		return fmt.Errorf("assign demo admin agency id: %w", err)
	}

	return nil
}

func seedClients(tx *gorm.DB, state *seedState) error {
	seeds := []clientSeed{
		{Name: "Acme Studio", Email: "hello@acmestudio.demo", CompanyName: "Acme Studio", Phone: "+1 555 0101"},
		{Name: "BrightPath Marketing", Email: "ops@brightpath.demo", CompanyName: "BrightPath Marketing", Phone: "+1 555 0102"},
		{Name: "Nova Retail Group", Email: "projects@novaretail.demo", CompanyName: "Nova Retail Group", Phone: "+1 555 0103"},
		{Name: "GreenLeaf Accounting", Email: "admin@greenleaf.demo", CompanyName: "GreenLeaf Accounting", Phone: "+1 555 0104"},
	}

	for _, seed := range seeds {
		company := seed.CompanyName
		phone := seed.Phone
		client := models.Client{
			AgencyID:    state.admin.ID,
			Name:        seed.Name,
			Email:       seed.Email,
			CompanyName: &company,
			Phone:       &phone,
			Status:      models.ClientStatusActive,
		}

		if err := upsertByScope(tx, &models.Client{}, &client, "agency_id = ? AND name = ?", state.admin.ID, seed.Name); err != nil {
			return fmt.Errorf("seed client %s: %w", seed.Name, err)
		}

		state.clients[seed.Name] = client
	}

	return nil
}

func seedProjects(tx *gorm.DB, state *seedState) error {
	seeds := []projectSeed{
		{
			Title:       "Website Redesign",
			ClientName:  "Acme Studio",
			Description: "Refresh the public website, improve conversion pages, and polish the client onboarding flow.",
			Status:      models.ProjectStatusInProgress,
			StartDate:   "2026-04-01",
			Deadline:    "2026-06-14",
			Budget:      1250000,
			Progress:    68,
		},
		{
			Title:       "CRM Dashboard",
			ClientName:  "BrightPath Marketing",
			Description: "Build a focused CRM reporting dashboard for sales activity and account health.",
			Status:      models.ProjectStatusReview,
			StartDate:   "2026-03-18",
			Deadline:    "2026-05-22",
			Budget:      980000,
			Progress:    84,
		},
		{
			Title:       "Brand Landing Page",
			ClientName:  "Nova Retail Group",
			Description: "Launch a premium landing page for the spring retail campaign.",
			Status:      models.ProjectStatusPlanning,
			StartDate:   "2026-05-01",
			Deadline:    "2026-06-03",
			Budget:      640000,
			Progress:    25,
		},
		{
			Title:       "Invoice Automation",
			ClientName:  "GreenLeaf Accounting",
			Description: "Streamline invoice workflows and connect billing status to client project reporting.",
			Status:      models.ProjectStatusInProgress,
			StartDate:   "2026-04-10",
			Deadline:    "2026-07-01",
			Budget:      1120000,
			Progress:    46,
		},
	}

	for _, seed := range seeds {
		client, ok := state.clients[seed.ClientName]
		if !ok {
			return fmt.Errorf("missing client %s for project %s", seed.ClientName, seed.Title)
		}

		startDate := mustDate(seed.StartDate)
		deadline := mustDate(seed.Deadline)
		description := seed.Description
		project := models.Project{
			AgencyID:    state.admin.ID,
			ClientID:    client.ID,
			Title:       seed.Title,
			Description: &description,
			Status:      seed.Status,
			StartDate:   &startDate,
			Deadline:    &deadline,
			Budget:      seed.Budget,
			Progress:    seed.Progress,
		}

		if err := upsertByScope(tx, &models.Project{}, &project, "agency_id = ? AND title = ?", state.admin.ID, seed.Title); err != nil {
			return fmt.Errorf("seed project %s: %w", seed.Title, err)
		}

		state.projects[seed.Title] = project
	}

	return nil
}

func seedTasks(tx *gorm.DB, state *seedState) error {
	seeds := []taskSeed{
		{
			ProjectTitle: "Website Redesign",
			Title:        "Finalize homepage wireframe",
			Description:  "Confirm the final content hierarchy and responsive layout for the homepage.",
			Status:       models.TaskStatusDone,
			Priority:     models.TaskPriorityHigh,
			DueDate:      "2026-04-20",
		},
		{
			ProjectTitle: "Website Redesign",
			Title:        "Implement authentication flow",
			Description:  "Connect login, session handling, and protected route behavior.",
			Status:       models.TaskStatusDone,
			Priority:     models.TaskPriorityHigh,
			DueDate:      "2026-04-28",
		},
		{
			ProjectTitle: "Invoice Automation",
			Title:        "Review invoice PDF layout",
			Description:  "Review invoice structure and prepare notes for a future PDF export phase.",
			Status:       models.TaskStatusTodo,
			Priority:     models.TaskPriorityMedium,
			DueDate:      "2026-05-08",
		},
		{
			ProjectTitle: "CRM Dashboard",
			Title:        "Connect project progress API",
			Description:  "Wire dashboard summary metrics to the client portal views.",
			Status:       models.TaskStatusInProgress,
			Priority:     models.TaskPriorityHigh,
			DueDate:      "2026-05-03",
		},
		{
			ProjectTitle: "Invoice Automation",
			Title:        "Prepare production deployment",
			Description:  "Finalize environment configuration and production readiness checks.",
			Status:       models.TaskStatusTodo,
			Priority:     models.TaskPriorityUrgent,
			DueDate:      "2026-06-20",
		},
		{
			ProjectTitle: "Brand Landing Page",
			Title:        "Client feedback review",
			Description:  "Review campaign feedback and fold approved edits into the landing page.",
			Status:       models.TaskStatusInProgress,
			Priority:     models.TaskPriorityMedium,
			DueDate:      "2026-05-12",
		},
		{
			ProjectTitle: "CRM Dashboard",
			Title:        "Update dashboard metrics",
			Description:  "Align dashboard metric cards with the latest operational reporting needs.",
			Status:       models.TaskStatusTodo,
			Priority:     models.TaskPriorityMedium,
			DueDate:      "2026-05-16",
		},
	}

	for _, seed := range seeds {
		project, ok := state.projects[seed.ProjectTitle]
		if !ok {
			return fmt.Errorf("missing project %s for task %s", seed.ProjectTitle, seed.Title)
		}

		dueDate := mustDate(seed.DueDate)
		description := seed.Description
		task := models.Task{
			AgencyID:    state.admin.ID,
			ProjectID:   project.ID,
			Title:       seed.Title,
			Description: &description,
			Status:      seed.Status,
			Priority:    seed.Priority,
			DueDate:     &dueDate,
		}

		if err := upsertByScope(tx, &models.Task{}, &task, "agency_id = ? AND project_id = ? AND title = ?", state.admin.ID, project.ID, seed.Title); err != nil {
			return fmt.Errorf("seed task %s: %w", seed.Title, err)
		}
	}

	return nil
}

func seedProjectUpdates(tx *gorm.DB, state *seedState) error {
	seeds := []updateSeed{
		{
			ProjectTitle: "Website Redesign",
			Title:        "Homepage wireframe completed",
			Content:      "The homepage wireframe has been finalized with revised navigation, clearer conversion sections, and a cleaner mobile layout.",
		},
		{
			ProjectTitle: "Website Redesign",
			Title:        "Authentication flow implemented",
			Content:      "Login, JWT session handling, and role-based route protection are now connected for the admin and client experiences.",
		},
		{
			ProjectTitle: "Invoice Automation",
			Title:        "Invoice module reviewed",
			Content:      "Invoice creation, line item totals, and status updates have been reviewed against the MVP workflow.",
		},
		{
			ProjectTitle: "CRM Dashboard",
			Title:        "Dashboard data connected",
			Content:      "Dashboard summaries now pull live project, task, update, and invoice data scoped to the correct agency.",
		},
		{
			ProjectTitle: "Brand Landing Page",
			Title:        "Client feedback incorporated",
			Content:      "Campaign copy and page structure were adjusted after the latest client review, with final polish now in progress.",
		},
	}

	for _, seed := range seeds {
		project, ok := state.projects[seed.ProjectTitle]
		if !ok {
			return fmt.Errorf("missing project %s for update %s", seed.ProjectTitle, seed.Title)
		}

		update := models.ProjectUpdate{
			AgencyID:  state.admin.ID,
			ProjectID: project.ID,
			Title:     seed.Title,
			Content:   seed.Content,
			CreatedBy: state.admin.ID,
		}

		if err := upsertByScope(tx, &models.ProjectUpdate{}, &update, "agency_id = ? AND project_id = ? AND title = ?", state.admin.ID, project.ID, seed.Title); err != nil {
			return fmt.Errorf("seed project update %s: %w", seed.Title, err)
		}
	}

	return nil
}

func seedInvoices(tx *gorm.DB, state *seedState) error {
	seeds := []invoiceSeed{
		{
			InvoiceNumber: "INV-000001",
			ClientName:    "Acme Studio",
			ProjectTitle:  "Website Redesign",
			Status:        models.InvoiceStatusSent,
			IssueDate:     "2026-04-15",
			DueDate:       "2026-05-15",
			Items: []invoiceItemSeed{
				{Description: "Website redesign", Quantity: 1, UnitPrice: 450000},
				{Description: "Client portal setup", Quantity: 1, UnitPrice: 250000},
			},
		},
		{
			InvoiceNumber: "INV-000002",
			ClientName:    "BrightPath Marketing",
			ProjectTitle:  "CRM Dashboard",
			Status:        models.InvoiceStatusPaid,
			IssueDate:     "2026-04-01",
			DueDate:       "2026-04-20",
			Items: []invoiceItemSeed{
				{Description: "Dashboard implementation", Quantity: 1, UnitPrice: 520000},
				{Description: "API integration", Quantity: 1, UnitPrice: 280000},
			},
		},
		{
			InvoiceNumber: "INV-000003",
			ClientName:    "GreenLeaf Accounting",
			ProjectTitle:  "Invoice Automation",
			Status:        models.InvoiceStatusOverdue,
			IssueDate:     "2026-03-25",
			DueDate:       "2026-04-25",
			Items: []invoiceItemSeed{
				{Description: "API integration", Quantity: 1, UnitPrice: 360000},
				{Description: "Monthly support", Quantity: 2, UnitPrice: 95000},
			},
		},
	}

	for _, seed := range seeds {
		client, ok := state.clients[seed.ClientName]
		if !ok {
			return fmt.Errorf("missing client %s for invoice %s", seed.ClientName, seed.InvoiceNumber)
		}

		project, ok := state.projects[seed.ProjectTitle]
		if !ok {
			return fmt.Errorf("missing project %s for invoice %s", seed.ProjectTitle, seed.InvoiceNumber)
		}

		issueDate := mustDate(seed.IssueDate)
		dueDate := mustDate(seed.DueDate)
		items, subtotal := invoiceItems(seed.Items)
		total := subtotal + seed.Tax - seed.Discount
		if total < 0 {
			total = 0
		}

		invoice := models.Invoice{
			InvoiceNumber: seed.InvoiceNumber,
			AgencyID:      state.admin.ID,
			ClientID:      client.ID,
			ProjectID:     &project.ID,
			Status:        seed.Status,
			IssueDate:     issueDate,
			DueDate:       &dueDate,
			Subtotal:      subtotal,
			Tax:           seed.Tax,
			Discount:      seed.Discount,
			Total:         total,
		}

		if err := upsertInvoiceWithItems(tx, &invoice, items); err != nil {
			return fmt.Errorf("seed invoice %s: %w", seed.InvoiceNumber, err)
		}
	}

	return nil
}

func upsertByScope(tx *gorm.DB, model interface{}, value interface{}, query string, args ...interface{}) error {
	result := tx.Where(query, args...).Limit(1).Find(model)
	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return tx.Create(value).Error
	}

	if err := prepareExistingSeedModel(model, value); err != nil {
		return err
	}

	return tx.Save(value).Error
}

func upsertInvoiceWithItems(tx *gorm.DB, invoice *models.Invoice, items []models.InvoiceItem) error {
	var existing models.Invoice
	result := tx.Where("agency_id = ? AND invoice_number = ?", invoice.AgencyID, invoice.InvoiceNumber).Limit(1).Find(&existing)
	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		if err := tx.Omit("Items").Create(invoice).Error; err != nil {
			return err
		}
	} else {
		invoice.ID = existing.ID
		invoice.CreatedAt = existing.CreatedAt
		if invoice.CreatedAt.IsZero() || invoice.CreatedAt.Year() < 2000 {
			invoice.CreatedAt = time.Now().UTC()
		}
		if err := tx.Omit("Items").Save(invoice).Error; err != nil {
			return err
		}
		if err := tx.Where("invoice_id = ?", invoice.ID).Delete(&models.InvoiceItem{}).Error; err != nil {
			return err
		}
	}

	for i := range items {
		items[i].InvoiceID = invoice.ID
	}

	return tx.Create(&items).Error
}

func invoiceItems(seeds []invoiceItemSeed) ([]models.InvoiceItem, int) {
	items := make([]models.InvoiceItem, 0, len(seeds))
	subtotal := 0

	for _, seed := range seeds {
		amount := int(math.Round(seed.Quantity * float64(seed.UnitPrice)))
		subtotal += amount
		items = append(items, models.InvoiceItem{
			Description: seed.Description,
			Quantity:    seed.Quantity,
			UnitPrice:   seed.UnitPrice,
			Amount:      amount,
		})
	}

	return items, subtotal
}

func prepareExistingSeedModel(existing interface{}, value interface{}) error {
	switch existing := existing.(type) {
	case *models.Client:
		value, ok := value.(*models.Client)
		if !ok {
			return fmt.Errorf("seed model mismatch %T and %T", existing, value)
		}
		value.ID = existing.ID
		value.CreatedAt = existing.CreatedAt
	case *models.Project:
		value, ok := value.(*models.Project)
		if !ok {
			return fmt.Errorf("seed model mismatch %T and %T", existing, value)
		}
		value.ID = existing.ID
		value.CreatedAt = existing.CreatedAt
	case *models.Task:
		value, ok := value.(*models.Task)
		if !ok {
			return fmt.Errorf("seed model mismatch %T and %T", existing, value)
		}
		value.ID = existing.ID
		value.CreatedAt = existing.CreatedAt
	case *models.ProjectUpdate:
		value, ok := value.(*models.ProjectUpdate)
		if !ok {
			return fmt.Errorf("seed model mismatch %T and %T", existing, value)
		}
		value.ID = existing.ID
		value.CreatedAt = existing.CreatedAt
	default:
		return fmt.Errorf("unsupported seed model %T", existing)
	}

	return nil
}

func mustDate(value string) time.Time {
	parsed, err := time.Parse("2006-01-02", value)
	if err != nil {
		panic(fmt.Sprintf("invalid seed date %q: %v", value, err))
	}

	return parsed
}

func migrationsDir() string {
	if _, err := os.Stat("migrations"); err == nil {
		return "migrations"
	}
	if _, err := os.Stat(filepath.Join("..", "..", "migrations")); err == nil {
		return filepath.Join("..", "..", "migrations")
	}

	return filepath.Join("backend", "migrations")
}
