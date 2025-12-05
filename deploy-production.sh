#!/bin/bash

# KVC Production Deployment Script
# Usage: ./deploy-production.sh [staging|production]
# Author: KVC DevOps Team
# Date: 2025-12-06

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DEPLOY_ENV="${1:-production}"
PROJECT_DIR="/opt/kvc-fullstack"
BACKUP_DIR="/backups/kvc"
LOG_FILE="/var/log/kvc-deployment-$(date +%Y%m%d-%H%M%S).log"

# Functions
print_header() {
    echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║${NC} $1"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
}

print_step() {
    echo -e "${YELLOW}▶${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

log_command() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# Pre-flight checks
pre_flight_checks() {
    print_header "PRE-FLIGHT CHECKS"
    
    print_step "Checking Docker..."
    if ! command -v docker &> /dev/null; then
        print_error "Docker not installed!"
        exit 1
    fi
    print_success "Docker installed"
    log_command "Docker version: $(docker --version)"
    
    print_step "Checking Docker Compose..."
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose not installed!"
        exit 1
    fi
    print_success "Docker Compose installed"
    log_command "Docker Compose version: $(docker-compose --version)"
    
    print_step "Checking project directory..."
    if [ ! -d "$PROJECT_DIR" ]; then
        print_error "Project directory not found: $PROJECT_DIR"
        exit 1
    fi
    print_success "Project directory found"
    
    print_step "Checking .env files..."
    if [ ! -f "$PROJECT_DIR/backend/.env" ]; then
        print_error "Backend .env not found!"
        exit 1
    fi
    if [ ! -f "$PROJECT_DIR/frontend/.env" ]; then
        print_error "Frontend .env not found!"
        exit 1
    fi
    print_success ".env files found"
    
    print_step "Checking SSL certificates..."
    if [ ! -f "$PROJECT_DIR/certs/server.crt" ] || [ ! -f "$PROJECT_DIR/certs/server.key" ]; then
        print_error "SSL certificates not found!"
        print_step "Generate certificates with:"
        echo "  openssl req -x509 -newkey rsa:4096 -keyout certs/server.key -out certs/server.crt -days 365 -nodes"
        exit 1
    fi
    print_success "SSL certificates found"
    
    print_success "Pre-flight checks passed!"
    log_command "Pre-flight checks PASSED"
}

# Create backup
create_backup() {
    print_header "CREATING BACKUP"
    
    mkdir -p "$BACKUP_DIR"
    BACKUP_FILE="$BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S).sql.gz"
    
    print_step "Backing up database..."
    cd "$PROJECT_DIR"
    
    if docker-compose exec -T postgres pg_dump -U postgres kvcdb 2>/dev/null | gzip > "$BACKUP_FILE"; then
        print_success "Database backed up to $BACKUP_FILE"
        log_command "Database backup created: $BACKUP_FILE"
    else
        print_error "Database backup failed!"
        return 1
    fi
}

# Stop services
stop_services() {
    print_header "STOPPING SERVICES"
    
    cd "$PROJECT_DIR"
    print_step "Stopping Docker containers..."
    docker-compose down
    print_success "Services stopped"
    log_command "Services stopped"
}

# Build images
build_images() {
    print_header "BUILDING DOCKER IMAGES"
    
    cd "$PROJECT_DIR"
    print_step "Building Docker images..."
    
    if docker-compose build --no-cache; then
        print_success "Docker images built successfully"
        log_command "Docker images built successfully"
    else
        print_error "Docker build failed!"
        return 1
    fi
}

# Start services
start_services() {
    print_header "STARTING SERVICES"
    
    cd "$PROJECT_DIR"
    print_step "Starting Docker containers..."
    
    if docker-compose up -d; then
        print_success "Services started"
        log_command "Services started"
    else
        print_error "Failed to start services!"
        return 1
    fi
    
    # Wait for services to stabilize
    print_step "Waiting for services to stabilize..."
    sleep 10
}

# Run migrations
run_migrations() {
    print_header "RUNNING DATABASE MIGRATIONS"
    
    cd "$PROJECT_DIR"
    print_step "Running Prisma migrations..."
    
    if docker-compose exec -T backend npx prisma migrate deploy; then
        print_success "Migrations completed successfully"
        log_command "Migrations completed"
    else
        print_error "Migrations failed!"
        return 1
    fi
}

# Verify deployment
verify_deployment() {
    print_header "VERIFYING DEPLOYMENT"
    
    cd "$PROJECT_DIR"
    
    print_step "Checking container status..."
    docker-compose ps
    
    print_step "Waiting for services to be ready..."
    sleep 5
    
    print_step "Checking backend health..."
    if curl -s -f http://localhost:4001/api/health > /dev/null; then
        print_success "Backend is healthy"
        log_command "Backend health check PASSED"
    else
        print_error "Backend health check failed!"
        return 1
    fi
    
    print_step "Checking frontend..."
    if curl -s -f http://localhost:3000 > /dev/null; then
        print_success "Frontend is accessible"
        log_command "Frontend health check PASSED"
    else
        print_error "Frontend health check failed!"
        return 1
    fi
    
    print_step "Checking database connection..."
    if docker-compose exec -T postgres pg_isready -U postgres; then
        print_success "Database is ready"
        log_command "Database health check PASSED"
    else
        print_error "Database health check failed!"
        return 1
    fi
    
    print_success "All health checks passed!"
    log_command "All health checks PASSED"
}

# Show deployment summary
show_summary() {
    print_header "DEPLOYMENT SUMMARY"
    
    echo -e "${GREEN}"
    echo "✓ Deployment completed successfully!"
    echo ""
    echo "Environment: $DEPLOY_ENV"
    echo "Project: $PROJECT_DIR"
    echo "Deployment Log: $LOG_FILE"
    echo ""
    echo "Services:"
    echo "  Backend:   http://localhost:4001"
    echo "  Frontend:  http://localhost:3000"
    echo "  Database:  localhost:5432"
    echo ""
    echo "Useful commands:"
    echo "  View logs:        docker-compose logs -f"
    echo "  Stop services:    docker-compose down"
    echo "  Restart services: docker-compose restart"
    echo "  Database backup:  docker-compose exec postgres pg_dump -U postgres kvcdb | gzip > backup.sql.gz"
    echo ""
    echo -e "${NC}"
    
    log_command "Deployment completed successfully"
}

# Main deployment flow
main() {
    print_header "KVC PRODUCTION DEPLOYMENT"
    echo "Environment: $DEPLOY_ENV"
    echo "Project: $PROJECT_DIR"
    echo "Log: $LOG_FILE"
    echo ""
    
    log_command "Deployment started for environment: $DEPLOY_ENV"
    
    # Run deployment steps
    if pre_flight_checks && \
       create_backup && \
       stop_services && \
       build_images && \
       start_services && \
       run_migrations && \
       verify_deployment; then
        show_summary
        exit 0
    else
        print_error "Deployment failed! Check logs: $LOG_FILE"
        log_command "Deployment FAILED"
        exit 1
    fi
}

# Trap errors
trap 'print_error "Deployment failed!"; exit 1' ERR

# Run main
main
