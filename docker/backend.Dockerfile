FROM golang:1.23-alpine AS build

WORKDIR /app

COPY backend/go.mod backend/go.sum ./
RUN go mod download

COPY backend/ ./

RUN CGO_ENABLED=0 GOOS=linux go build -o /car-rental-api ./main.go

FROM alpine:latest

WORKDIR /app

COPY --from=build /car-rental-api .

RUN mkdir -p /app/logs

EXPOSE 8080

CMD ["/app/car-rental-api"]
