FROM golang:1.22-alpine AS builder

WORKDIR /app

COPY go.mod ./
RUN go mod download

COPY . .
RUN go build -o /workroom-api ./cmd/server

FROM alpine:3.20

RUN addgroup -S workroom && adduser -S workroom -G workroom

WORKDIR /app
COPY --from=builder /workroom-api /app/workroom-api

USER workroom

EXPOSE 8080

CMD ["/app/workroom-api"]
