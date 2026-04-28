package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"workroom/backend/internal/dto"
	"workroom/backend/internal/response"
	"workroom/backend/internal/services"
)

type ClientHandler struct {
	clients services.ClientService
}

func NewClientHandler(clients services.ClientService) *ClientHandler {
	return &ClientHandler{clients: clients}
}

func (h *ClientHandler) List(c *gin.Context) {
	agencyID, ok := agencyIDFromContext(c)
	if !ok {
		return
	}

	var query dto.ClientListQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		respondValidationError(c, err)
		return
	}

	clients, err := h.clients.List(agencyID, query)
	if err != nil {
		respondAppError(c, err)
		return
	}

	response.OK(c, clients)
}

func (h *ClientHandler) Create(c *gin.Context) {
	agencyID, ok := agencyIDFromContext(c)
	if !ok {
		return
	}

	var req dto.CreateClientRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondValidationError(c, err)
		return
	}

	client, err := h.clients.Create(agencyID, req)
	if err != nil {
		respondAppError(c, err)
		return
	}

	response.Created(c, client)
}

func (h *ClientHandler) GetByID(c *gin.Context) {
	agencyID, ok := agencyIDFromContext(c)
	if !ok {
		return
	}

	clientID, ok := clientIDFromParam(c)
	if !ok {
		return
	}

	client, err := h.clients.GetByID(agencyID, clientID)
	if err != nil {
		respondAppError(c, err)
		return
	}

	response.OK(c, client)
}

func (h *ClientHandler) Update(c *gin.Context) {
	agencyID, ok := agencyIDFromContext(c)
	if !ok {
		return
	}

	clientID, ok := clientIDFromParam(c)
	if !ok {
		return
	}

	var req dto.UpdateClientRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondValidationError(c, err)
		return
	}

	client, err := h.clients.Update(agencyID, clientID, req)
	if err != nil {
		respondAppError(c, err)
		return
	}

	response.OK(c, client)
}

func (h *ClientHandler) Archive(c *gin.Context) {
	agencyID, ok := agencyIDFromContext(c)
	if !ok {
		return
	}

	clientID, ok := clientIDFromParam(c)
	if !ok {
		return
	}

	if err := h.clients.Archive(agencyID, clientID); err != nil {
		respondAppError(c, err)
		return
	}

	response.OKWithMessage(c, nil, "Client archived successfully")
}

func agencyIDFromContext(c *gin.Context) (uuid.UUID, bool) {
	value, ok := c.Get("agency_id")
	if !ok {
		response.Error(c, http.StatusUnauthorized, "UNAUTHORIZED", "Invalid authentication context", nil)
		return uuid.Nil, false
	}

	agencyID, ok := value.(uuid.UUID)
	if !ok {
		response.Error(c, http.StatusUnauthorized, "UNAUTHORIZED", "Invalid authentication context", nil)
		return uuid.Nil, false
	}

	return agencyID, true
}

func clientIDFromParam(c *gin.Context) (uuid.UUID, bool) {
	clientID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.Error(c, http.StatusBadRequest, "BAD_REQUEST", "Invalid client id", nil)
		return uuid.Nil, false
	}

	return clientID, true
}
