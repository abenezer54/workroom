package main

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"

	"workroom/backend/internal/config"
	"workroom/backend/internal/database"
	"workroom/backend/internal/handlers"
	"workroom/backend/internal/middleware"
	"workroom/backend/internal/repositories"
	"workroom/backend/internal/response"
	"workroom/backend/internal/routes"
	"workroom/backend/internal/services"
)

func main() {
	cfg := config.Load()

	if cfg.AppEnv == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	db, err := database.Connect(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		log.Fatalf("failed to access database handle: %v", err)
	}
	defer sqlDB.Close()

	if err := database.RunMigrations(db, "migrations"); err != nil {
		log.Fatalf("failed to run database migrations: %v", err)
	}

	router := gin.New()
	router.Use(middleware.Logger())
	router.Use(gin.Recovery())
	router.Use(middleware.CORS(cfg.CORSAllowedOrigins))

	userRepository := repositories.NewUserRepository(db)
	clientRepository := repositories.NewClientRepository(db)
	projectRepository := repositories.NewProjectRepository(db)
	taskRepository := repositories.NewTaskRepository(db)
	projectUpdateRepository := repositories.NewProjectUpdateRepository(db)
	invoiceRepository := repositories.NewInvoiceRepository(db)
	dashboardRepository := repositories.NewDashboardRepository(db)
	jwtService := services.NewJWTService(cfg.JWTSecret, cfg.JWTExpiresIn)
	googleVerifier := services.NewGoogleTokenVerifier()
	mailService := services.NewMailService(cfg.ResendAPIKey, cfg.EmailFrom)
	authService := services.NewAuthService(userRepository, jwtService, googleVerifier, mailService, cfg.GoogleClientID, cfg.FrontendURL)
	clientService := services.NewClientService(clientRepository)
	projectService := services.NewProjectService(projectRepository, clientRepository)
	taskService := services.NewTaskService(taskRepository, projectRepository)
	projectUpdateService := services.NewProjectUpdateService(projectUpdateRepository, projectRepository)
	invoiceService := services.NewInvoiceService(invoiceRepository, clientRepository, projectRepository)
	dashboardService := services.NewDashboardService(dashboardRepository)
	authHandler := handlers.NewAuthHandler(authService)
	clientHandler := handlers.NewClientHandler(clientService)
	projectHandler := handlers.NewProjectHandler(projectService)
	taskHandler := handlers.NewTaskHandler(taskService)
	projectUpdateHandler := handlers.NewProjectUpdateHandler(projectUpdateService)
	invoiceHandler := handlers.NewInvoiceHandler(invoiceService)
	dashboardHandler := handlers.NewDashboardHandler(dashboardService)

	registerRoutes(router, authHandler, clientHandler, projectHandler, taskHandler, projectUpdateHandler, invoiceHandler, dashboardHandler, jwtService)

	log.Printf("workroom api listening on port %s", cfg.Port)
	if err := router.Run(":" + cfg.Port); err != nil {
		log.Fatalf("failed to start server: %v", err)
	}
}

func registerRoutes(
	router *gin.Engine,
	authHandler *handlers.AuthHandler,
	clientHandler *handlers.ClientHandler,
	projectHandler *handlers.ProjectHandler,
	taskHandler *handlers.TaskHandler,
	projectUpdateHandler *handlers.ProjectUpdateHandler,
	invoiceHandler *handlers.InvoiceHandler,
	dashboardHandler *handlers.DashboardHandler,
	jwtService services.JWTService,
) {
	router.GET("/health", func(c *gin.Context) {
		response.OK(c, gin.H{
			"status":  "ok",
			"service": "workroom-api",
		})
	})

	api := router.Group("/api/v1")
	api.GET("/health", func(c *gin.Context) {
		response.OK(c, gin.H{
			"status":  "ok",
			"service": "workroom-api",
		})
	})
	routes.RegisterAuthRoutes(api, authHandler, jwtService)
	routes.RegisterClientRoutes(api, clientHandler, jwtService)
	routes.RegisterProjectRoutes(api, projectHandler, jwtService)
	routes.RegisterTaskRoutes(api, taskHandler, jwtService)
	routes.RegisterProjectUpdateRoutes(api, projectUpdateHandler, jwtService)
	routes.RegisterInvoiceRoutes(api, invoiceHandler, jwtService)
	routes.RegisterDashboardRoutes(api, dashboardHandler, jwtService)

	router.NoRoute(func(c *gin.Context) {
		response.Error(c, http.StatusNotFound, "NOT_FOUND", "Route not found", nil)
	})
}
