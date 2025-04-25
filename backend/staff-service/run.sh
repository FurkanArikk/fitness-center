#!/bin/bash

# Colors for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored section headers
print_header() {
    echo -e "\n${BLUE}===${NC} ${CYAN}$1${NC} ${BLUE}===${NC}"
}

# Function to print success messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print errors
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Function to print info
print_info() {
    echo -e "${YELLOW}→ $1${NC}"
}

# Function to check if Docker is available
check_docker() {
    print_header "Checking Docker"
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed or not in PATH"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        print_error "Docker daemon is not running"
        exit 1
    fi
    
    print_success "Docker is available"
}

# Function to ensure Docker network exists
ensure_docker_network() {
    print_header "Checking Docker Network"
    
    if docker network inspect fitness-network &> /dev/null; then
        print_success "Docker network 'fitness-network' already exists"
    else
        print_info "Creating Docker network 'fitness-network'..."
        if docker network create fitness-network &> /dev/null; then
            print_success "Docker network created successfully"
        else
            print_error "Failed to create Docker network"
            exit 1
        fi
    fi
}

# Function to start the database
start_database() {
    print_header "Starting PostgreSQL Database (Docker)"
    
    if docker ps | grep -q fitness-staff-db; then
        print_info "Database container is already running"
    else
        print_info "Starting database container..."
        if ./scripts/docker-db.sh start; then
            print_success "Database container started successfully"
        else
            print_error "Failed to start database container"
            print_info "Check logs with: ./scripts/docker-db.sh logs"
            exit 1
        fi
    fi
    
    # Wait for the database to be ready
    print_info "Waiting for database to be ready..."
    attempts=0
    max_attempts=10
    
    while [ $attempts -lt $max_attempts ]; do
        if DB_HOST=localhost DB_PORT=5433 DB_USER=fitness_user DB_PASSWORD=admin ./scripts/verify_db.sh &> /dev/null; then
            print_success "Database is ready"
            break
        fi
        
        attempts=$((attempts + 1))
        if [ $attempts -eq $max_attempts ]; then
            print_error "Database did not become ready in time"
            print_info "Try running: ./scripts/docker-db.sh debug"
            exit 1
        fi
        
        echo -n "."
        sleep 2
    done
    echo ""
}

# Function to check and initialize database schema
initialize_database() {
    print_header "Checking Database Schema"

    # Check if tables exist
    if DB_HOST=localhost DB_PORT=5433 DB_USER=fitness_user DB_PASSWORD=admin ./scripts/verify_db.sh &> /dev/null; then
        print_success "Database schema already exists"
    else
        print_info "Database schema does not exist, initializing..."
        if USE_DOCKER=true ./scripts/setup-db.sh; then
            print_success "Database schema initialized"
        else
            print_error "Failed to initialize database schema"
            exit 1
        fi
    fi
}

# Function to ask about loading sample data
ask_load_sample_data() {
    print_header "Sample Data"
    
    echo -e "${YELLOW}Would you like to load sample data?${NC}"
    echo -e "${CYAN}1)${NC} Reset the database and load fresh sample data"
    echo -e "${CYAN}2)${NC} Start database without sample data"
    echo -e "${CYAN}3)${NC} Keep existing data (default)"
    
    read -p "Enter your choice [3]: " choice
    choice=${choice:-3}
    
    if [ "$choice" = "1" ]; then
        print_info "Veritabanı sıfırlanıyor ve örnek veriler yükleniyor..."
        
        # Reset database and load sample data
        if use_docker_postgres_for_reset_with_sample; then
            print_success "Veritabanı sıfırlandı ve örnek veriler yüklendi"
        else
            print_error "Veritabanı sıfırlama işlemi başarısız oldu"
        fi
    elif [ "$choice" = "2" ]; then
        print_info "Veritabanı sıfırlanıyor, örnek veri YÜKLENMİYOR..."
        
        # Reset database without loading sample data
        if use_docker_postgres_for_reset_no_sample; then
            print_success "Veritabanı sıfırlandı, örnek veriler yüklenmedi"
        else
            print_error "Veritabanı sıfırlama işlemi başarısız oldu"
        fi
    else
        print_info "Mevcut veriler korunuyor"
    fi
}

# Helper function to reset database and load sample data
use_docker_postgres_for_reset_with_sample() {
    print_info "Docker üzerinden veritabanı sıfırlama ve örnek veri yükleme işlemi başlatılıyor..."
    
    # Completely reset the database container
    print_info "Veritabanı konteynerini sıfırlama..."
    if ./scripts/docker-db.sh reset; then
        print_success "Veritabanı konteyner sıfırlandı"
        
        print_info "Veritabanı şemasını ve tabloları oluşturma..."
        # Veritabanı bağlantısını bekleyelim
        sleep 5
        
        # First drop all tables to ensure a clean slate
        print_info "Mevcut tabloları temizleme..."
        if DB_HOST=localhost DB_PORT=5433 DB_USER=fitness_user DB_PASSWORD=admin ./scripts/db-connect.sh -f ./migrations/000_drop_tables.sql; then
            print_success "Tüm tablolar başarıyla silindi"
            
            # Şimdi şemayı oluşturalım
            print_info "Veritabanı şemasını oluşturma..."
            if DB_HOST=localhost DB_PORT=5433 DB_USER=fitness_user DB_PASSWORD=admin ./scripts/db-connect.sh -f ./migrations/000001_create_staff_table.up.sql; then
                if DB_HOST=localhost DB_PORT=5433 DB_USER=fitness_user DB_PASSWORD=admin ./scripts/db-connect.sh -f ./migrations/000002_create_qualifications_table.up.sql; then
                    if DB_HOST=localhost DB_PORT=5433 DB_USER=fitness_user DB_PASSWORD=admin ./scripts/db-connect.sh -f ./migrations/000003_create_trainers_table.up.sql; then
                        if DB_HOST=localhost DB_PORT=5433 DB_USER=fitness_user DB_PASSWORD=admin ./scripts/db-connect.sh -f ./migrations/000004_create_personal_training_table.up.sql; then
                            print_success "Veritabanı şeması başarıyla oluşturuldu"
                            
                            # Örnek verileri yükle
                            print_info "Örnek verileri yükleniyor..."
                            if DB_HOST=localhost DB_PORT=5433 DB_USER=fitness_user DB_PASSWORD=admin ./scripts/db-connect.sh -f ./migrations/002_sample_data.sql; then
                                print_success "Örnek veriler başarıyla yüklendi"
                                return 0
                            else
                                print_error "Örnek veriler yüklenemedi"
                                return 1
                            fi
                        else
                            print_error "Personal training tablosu oluşturulamadı"
                            return 1
                        fi
                    else
                        print_error "Trainers tablosu oluşturulamadı"
                        return 1
                    fi
                else
                    print_error "Qualifications tablosu oluşturulamadı"
                    return 1
                fi
            else
                print_error "Staff tablosu oluşturulamadı"
                return 1
            fi
        else
            print_error "Tablolar silinemedi"
            return 1
        fi
    else
        print_error "Veritabanı konteyner sıfırlanamadı"
        return 1
    fi
}

# Helper function to reset database without loading sample data
use_docker_postgres_for_reset_no_sample() {
    print_info "Docker üzerinden veritabanı sıfırlama işlemi başlatılıyor (örnek veri olmadan)..."
    
    # Completely reset the database container
    print_info "Veritabanı konteynerini sıfırlama..."
    if ./scripts/docker-db.sh reset; then
        print_success "Veritabanı konteyner sıfırlandı"
        
        print_info "Sadece veritabanı şemasını oluşturma..."
        # Veritabanı bağlantısını bekleyelim
        sleep 5
        
        # First drop all tables to ensure a clean slate
        print_info "Mevcut tabloları temizleme..."
        if DB_HOST=localhost DB_PORT=5433 DB_USER=fitness_user DB_PASSWORD=admin ./scripts/db-connect.sh -f ./migrations/000_drop_tables.sql; then
            print_success "Tüm tablolar başarıyla silindi"
            
            # Şimdi şemayı oluşturalım
            print_info "Veritabanı şemasını oluşturma..."
            if DB_HOST=localhost DB_PORT=5433 DB_USER=fitness_user DB_PASSWORD=admin ./scripts/db-connect.sh -f ./migrations/000001_create_staff_table.up.sql; then
                if DB_HOST=localhost DB_PORT=5433 DB_USER=fitness_user DB_PASSWORD=admin ./scripts/db-connect.sh -f ./migrations/000002_create_qualifications_table.up.sql; then
                    if DB_HOST=localhost DB_PORT=5433 DB_USER=fitness_user DB_PASSWORD=admin ./scripts/db-connect.sh -f ./migrations/000003_create_trainers_table.up.sql; then
                        if DB_HOST=localhost DB_PORT=5433 DB_USER=fitness_user DB_PASSWORD=admin ./scripts/db-connect.sh -f ./migrations/000004_create_personal_training_table.up.sql; then
                            print_success "Veritabanı şeması başarıyla oluşturuldu"
                            print_info "Kullanıcı, API endpointleri aracılığıyla veri ekleyebilir"
                            return 0
                        else
                            print_error "Personal training tablosu oluşturulamadı"
                            return 1
                        fi
                    else
                        print_error "Trainers tablosu oluşturulamadı"
                        return 1
                    fi
                else
                    print_error "Qualifications tablosu oluşturulamadı"
                    return 1
                fi
            else
                print_error "Staff tablosu oluşturulamadı"
                return 1
            fi
        else
            print_error "Tablolar silinemedi"
            return 1
        fi
    else
        print_error "Veritabanı konteyner sıfırlanamadı"
        return 1
    fi
}

# Function to build and start the service
build_and_start_service() {
    print_header "Building Staff Service"
    
    print_info "Building Go application..."
    if go build -o staff-service cmd/main.go; then
        print_success "Build successful!"
    else
        print_error "Build failed. Please fix the errors before running the service."
        exit 1
    fi
    
    print_header "Starting Staff Service"
    print_info "The service is starting on http://localhost:8002"
    print_info "Press Ctrl+C to stop the service"
    
    # Start the service
    ./staff-service
}

# Function to display manual sample data loading instructions
display_sample_data_instructions() {
    print_header "How to Load Sample Data Manually"
    
    echo -e "${MAGENTA}If you want to load sample data later, follow these steps:${NC}"
    echo -e ""
    echo -e "${CYAN}1. Make sure the database is running:${NC}"
    echo -e "   ${YELLOW}./scripts/docker-db.sh status${NC}"
    echo -e ""
    echo -e "${CYAN}2. Connect to the database and execute the sample data SQL file:${NC}"
    echo -e "   ${YELLOW}./scripts/db-connect.sh -f ./migrations/002_sample_data.sql${NC}"
    echo -e ""
    echo -e "${CYAN}3. Or reset the database completely and start fresh:${NC}"
    echo -e "   ${YELLOW}./scripts/docker-db.sh reset${NC}"
    echo -e "   ${YELLOW}USE_DOCKER=true ./scripts/setup-db.sh${NC}"
    echo -e ""
    echo -e "${CYAN}4. Verify the data was loaded:${NC}"
    echo -e "   ${YELLOW}./scripts/verify_db.sh${NC}"
    echo -e ""
}

# Main execution starts here
clear
echo -e "${MAGENTA}==========================================${NC}"
echo -e "${MAGENTA}      FITNESS CENTER STAFF SERVICE       ${NC}"
echo -e "${MAGENTA}==========================================${NC}"

# Check docker is available
check_docker

# Ensure Docker network exists
ensure_docker_network

# Start the database
start_database

# Check and initialize database schema if needed
initialize_database

# Ask about loading sample data
ask_load_sample_data

# Show instructions for manually loading sample data
display_sample_data_instructions

# Build and start the service
build_and_start_service
