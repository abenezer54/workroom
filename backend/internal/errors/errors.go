package errors

import "net/http"

type AppError struct {
	Status  int
	Code    string
	Message string
	Details interface{}
}

func (e AppError) Error() string {
	return e.Message
}

func New(status int, code string, message string, details interface{}) AppError {
	return AppError{
		Status:  status,
		Code:    code,
		Message: message,
		Details: details,
	}
}

func BadRequest(message string, details interface{}) AppError {
	return New(http.StatusBadRequest, "BAD_REQUEST", message, details)
}

func NotFound(message string) AppError {
	return New(http.StatusNotFound, "NOT_FOUND", message, nil)
}

func Internal(message string) AppError {
	return New(http.StatusInternalServerError, "INTERNAL_SERVER_ERROR", message, nil)
}
