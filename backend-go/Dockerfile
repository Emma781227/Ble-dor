FROM golang:1.22-alpine AS builder
WORKDIR /app

COPY go.mod ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o /bin/api ./cmd/api

FROM alpine:3.16.3
WORKDIR /app
COPY --from=builder /bin/api /app/api

EXPOSE 8080
CMD ["/app/api"]
