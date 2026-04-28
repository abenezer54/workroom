package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"workroom/backend/internal/dto"
	"workroom/backend/internal/models"
	"workroom/backend/internal/response"
	"workroom/backend/internal/services"
)

type InvoiceHandler struct {
	invoices services.InvoiceService
}

func NewInvoiceHandler(invoices services.InvoiceService) *InvoiceHandler {
	return &InvoiceHandler{invoices: invoices}
}

func (h *InvoiceHandler) List(c *gin.Context) {
	var query dto.InvoiceListQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		respondValidationError(c, err)
		return
	}

	role, ok := roleFromContext(c)
	if !ok {
		return
	}

	switch role {
	case models.RoleAgencyAdmin:
		agencyID, ok := agencyIDFromContext(c)
		if !ok {
			return
		}
		invoices, err := h.invoices.ListForAgency(agencyID, query)
		if err != nil {
			respondAppError(c, err)
			return
		}
		response.OK(c, invoices)
	case models.RoleClient:
		clientID, ok := clientIDFromContext(c)
		if !ok {
			return
		}
		invoices, err := h.invoices.ListForClient(clientID, query)
		if err != nil {
			respondAppError(c, err)
			return
		}
		response.OK(c, invoices)
	default:
		response.Error(c, http.StatusForbidden, "FORBIDDEN", "Permission denied", nil)
	}
}

func (h *InvoiceHandler) Create(c *gin.Context) {
	agencyID, ok := agencyIDFromContext(c)
	if !ok {
		return
	}

	var req dto.CreateInvoiceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondValidationError(c, err)
		return
	}

	invoice, err := h.invoices.Create(agencyID, req)
	if err != nil {
		respondAppError(c, err)
		return
	}

	response.Created(c, invoice)
}

func (h *InvoiceHandler) GetByID(c *gin.Context) {
	invoiceID, ok := invoiceIDFromParam(c)
	if !ok {
		return
	}

	role, ok := roleFromContext(c)
	if !ok {
		return
	}

	switch role {
	case models.RoleAgencyAdmin:
		agencyID, ok := agencyIDFromContext(c)
		if !ok {
			return
		}
		invoice, err := h.invoices.GetForAgency(agencyID, invoiceID)
		if err != nil {
			respondAppError(c, err)
			return
		}
		response.OK(c, invoice)
	case models.RoleClient:
		clientID, ok := clientIDFromContext(c)
		if !ok {
			return
		}
		invoice, err := h.invoices.GetForClient(clientID, invoiceID)
		if err != nil {
			respondAppError(c, err)
			return
		}
		response.OK(c, invoice)
	default:
		response.Error(c, http.StatusForbidden, "FORBIDDEN", "Permission denied", nil)
	}
}

func (h *InvoiceHandler) Update(c *gin.Context) {
	agencyID, ok := agencyIDFromContext(c)
	if !ok {
		return
	}

	invoiceID, ok := invoiceIDFromParam(c)
	if !ok {
		return
	}

	var req dto.UpdateInvoiceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondValidationError(c, err)
		return
	}

	invoice, err := h.invoices.Update(agencyID, invoiceID, req)
	if err != nil {
		respondAppError(c, err)
		return
	}

	response.OK(c, invoice)
}

func (h *InvoiceHandler) UpdateStatus(c *gin.Context) {
	agencyID, ok := agencyIDFromContext(c)
	if !ok {
		return
	}

	invoiceID, ok := invoiceIDFromParam(c)
	if !ok {
		return
	}

	var req dto.UpdateInvoiceStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondValidationError(c, err)
		return
	}

	invoice, err := h.invoices.UpdateStatus(agencyID, invoiceID, req.Status)
	if err != nil {
		respondAppError(c, err)
		return
	}

	response.OK(c, invoice)
}

func (h *InvoiceHandler) Cancel(c *gin.Context) {
	agencyID, ok := agencyIDFromContext(c)
	if !ok {
		return
	}

	invoiceID, ok := invoiceIDFromParam(c)
	if !ok {
		return
	}

	if err := h.invoices.Cancel(agencyID, invoiceID); err != nil {
		respondAppError(c, err)
		return
	}

	response.OKWithMessage(c, nil, "Invoice cancelled successfully")
}

func invoiceIDFromParam(c *gin.Context) (uuid.UUID, bool) {
	invoiceID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.Error(c, http.StatusBadRequest, "BAD_REQUEST", "Invalid invoice id", nil)
		return uuid.Nil, false
	}

	return invoiceID, true
}
