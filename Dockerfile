# syntax=docker/dockerfile:1

FROM golang:1.23

# Set destination for COPY
WORKDIR /app

# Copy 
COPY go.mod .

COPY . . 

# Build
RUN CGO_ENABLED=0 GOOS=linux go build -o /atla-quotes-api

# Expose
EXPOSE 9329

# Run
CMD ["/atla-quotes-api"]