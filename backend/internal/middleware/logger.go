package middleware

import (
	"log"
	"time"

	"github.com/gin-gonic/gin"
)

func Logger() gin.HandlerFunc {
	return gin.LoggerWithFormatter(func(params gin.LogFormatterParams) string {
		log.Printf(
			"%s %s %d %s %s",
			params.Method,
			params.Path,
			params.StatusCode,
			params.Latency.Truncate(time.Millisecond),
			params.ClientIP,
		)

		return ""
	})
}
