#!/bin/bash

# Colors for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Service information
declare -A SERVICE_DIRS=(
    ["member"]="member-service"
    ["staff"]="staff-service"
    ["facility"]="facility-service"
    ["payment"]="payment-service"
    ["class"]="class-service"
)

declare -A SERVICE_NAMES=(
    ["member"]="Üye Yönetim Servisi"
    ["staff"]="Personel Yönetim Servisi"
    ["facility"]="Tesis Yönetim Servisi"
    ["payment"]="Ödeme Yönetim Servisi"
    ["class"]="Sınıf Yönetim Servisi"
)

declare -A SERVICE_PORTS=(
    ["member"]="8001"
    ["staff"]="8002"
    ["payment"]="8003"
    ["facility"]="8080"
    ["class"]="8005"
)

# Default all services selected
declare -A SELECTED_SERVICES=(
    ["member"]=true
    ["staff"]=true
    ["facility"]=true
    ["payment"]=true
    ["class"]=true
)

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

# Function to print warnings
print_warning() {
    echo -e "${MAGENTA}⚠ $1${NC}"
}

# Function to check if Docker is available
check_docker() {
    print_header "Docker Kontrol Ediliyor"
    if ! command -v docker &> /dev/null; then
        print_error "Docker kurulu değil veya PATH değişkeninde bulunamıyor"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        print_error "Docker daemon çalışmıyor"
        exit 1
    fi
    
    print_success "Docker kullanıma hazır"
}

# Function to ensure Docker network exists
ensure_docker_network() {
    print_header "Docker Ağı Kontrol Ediliyor"
    
    if docker network inspect fitness-network &> /dev/null; then
        print_success "Docker ağı 'fitness-network' zaten mevcut"
    else
        print_info "Docker ağı 'fitness-network' oluşturuluyor..."
        if docker network create fitness-network &> /dev/null; then
            print_success "Docker ağı başarıyla oluşturuldu"
        else
            print_error "Docker ağı oluşturulamadı"
            exit 1
        fi
    fi
}

# Function to show service selection menu
select_services() {
    clear
    print_header "Fitness Center Servis Seçimi"
    
    echo -e "${YELLOW}Hangi servisleri kurmak istiyorsunuz?${NC}"
    echo -e "${CYAN}0)${NC} Tüm servisleri kur (varsayılan)"
    local i=1
    for service in "${!SERVICE_NAMES[@]}"; do
        local status="[ ]"
        if [ "${SELECTED_SERVICES[$service]}" = true ]; then
            status="[${GREEN}✓${NC}]"
        fi
        echo -e "${CYAN}$i)${NC} $status ${SERVICE_NAMES[$service]} (port: ${SERVICE_PORTS[$service]})"
        i=$((i+1))
    done
    echo -e "${CYAN}6)${NC} Kurulumu başlat"
    echo -e "${CYAN}7)${NC} Çıkış"
    
    read -p "Seçiminizi yapın (0-7): " choice
    
    case $choice in
        0)
            # Select all services
            for service in "${!SELECTED_SERVICES[@]}"; do
                SELECTED_SERVICES[$service]=true
            done
            select_services
            ;;
        1|2|3|4|5)
            local selected_service=$(get_service_by_index $choice)
            if [ "${SELECTED_SERVICES[$selected_service]}" = true ]; then
                SELECTED_SERVICES[$selected_service]=false
            else
                SELECTED_SERVICES[$selected_service]=true
            fi
            select_services
            ;;
        6)
            # Proceed with installation
            return 0
            ;;
        7)
            echo -e "${YELLOW}Kurulum iptal edildi.${NC}"
            exit 0
            ;;
        *)
            print_error "Geçersiz seçim"
            select_services
            ;;
    esac
}

# Helper function to get service name by index
get_service_by_index() {
    local idx=$1
    local count=1
    for service in "${!SERVICE_NAMES[@]}"; do
        if [ $count -eq $idx ]; then
            echo $service
            return 0
        fi
        count=$((count+1))
    done
    echo ""
}

# Function to install a service
install_service() {
    local service=$1
    local service_dir=${SERVICE_DIRS[$service]}
    
    print_header "${SERVICE_NAMES[$service]} Kuruluyor"
    
    if [ ! -d "$service_dir" ]; then
        print_error "Servis dizini bulunamadı: $service_dir"
        return 1
    fi
    
    # Change directory to service directory
    cd "$service_dir" || return 1
    
    if [ ! -f "run.sh" ]; then
        print_error "Bu servis için run.sh dosyası bulunamadı"
        cd - > /dev/null
        return 1
    fi
    
    print_info "Servis kurulum betiğini çalıştırılıyor..."
    
    # Make sure run.sh is executable
    chmod +x run.sh
    
    # Run the script with --setup-only flag to just do the setup without starting the service
    ./run.sh --setup-only
    
    local result=$?
    if [ $result -eq 0 ]; then
        print_success "${SERVICE_NAMES[$service]} başarıyla kuruldu"
    else
        print_error "${SERVICE_NAMES[$service]} kurulumu başarısız oldu"
    fi
    
    cd - > /dev/null
    return $result
}

# Function to start a service in the background
start_service() {
    local service=$1
    local service_dir=${SERVICE_DIRS[$service]}
    
    print_header "${SERVICE_NAMES[$service]} Başlatılıyor"
    
    if [ ! -d "$service_dir" ]; then
        print_error "Servis dizini bulunamadı: $service_dir"
        return 1
    fi
    
    # Change directory to service directory
    cd "$service_dir" || return 1
    
    if [ ! -f "run.sh" ]; then
        print_error "Bu servis için run.sh dosyası bulunamadı"
        cd - > /dev/null
        return 1
    fi
    
    print_info "Servis başlatılıyor (arka planda)..."
    
    # Start the service in background
    ./run.sh --start-only > /tmp/fitness-${service}.log 2>&1 &
    
    # Save PID for future reference
    echo $! > /tmp/fitness-${service}.pid
    
    # Check if service started successfully (wait a moment)
    sleep 2
    if kill -0 $(cat /tmp/fitness-${service}.pid) 2>/dev/null; then
        print_success "${SERVICE_NAMES[$service]} başarıyla başlatıldı (PID: $(cat /tmp/fitness-${service}.pid))"
    else
        print_error "${SERVICE_NAMES[$service]} başlatılamadı"
        print_info "Hata ayrıntıları için kontrol et: /tmp/fitness-${service}.log"
        return 1
    fi
    
    cd - > /dev/null
    return 0
}

# Function to stop a running service
stop_service() {
    local service=$1
    
    print_header "${SERVICE_NAMES[$service]} Durduruluyor"
    
    if [ -f "/tmp/fitness-${service}.pid" ]; then
        local pid=$(cat "/tmp/fitness-${service}.pid")
        
        if kill -0 $pid 2>/dev/null; then
            print_info "Servis durduruluyor (PID: $pid)..."
            kill $pid
            
            # Wait for service to terminate
            for i in {1..5}; do
                if ! kill -0 $pid 2>/dev/null; then
                    print_success "${SERVICE_NAMES[$service]} başarıyla durduruldu"
                    rm -f "/tmp/fitness-${service}.pid"
                    return 0
                fi
                sleep 1
            done
            
            # Force kill if necessary
            print_warning "Servis yanıt vermiyor, zorla kapatılıyor..."
            kill -9 $pid 2>/dev/null
            rm -f "/tmp/fitness-${service}.pid"
            print_success "${SERVICE_NAMES[$service]} zorla durduruldu"
        else
            print_warning "Servis zaten çalışmıyor"
            rm -f "/tmp/fitness-${service}.pid"
        fi
    else
        print_warning "Servis PID dosyası bulunamadı, servis muhtemelen çalışmıyor"
    fi
}

# Function to display a summary of services
display_service_summary() {
    print_header "Seçilen Servisler"
    
    local selected_count=0
    for service in "${!SELECTED_SERVICES[@]}"; do
        if [ "${SELECTED_SERVICES[$service]}" = true ]; then
            selected_count=$((selected_count+1))
            print_info "${SERVICE_NAMES[$service]} (${SERVICE_DIRS[$service]})"
        fi
    done
    
    if [ $selected_count -eq 0 ]; then
        print_warning "Hiçbir servis seçilmedi! Kurulum işlemi yapılmayacak."
        exit 0
    fi
    
    echo
    read -p "Seçilen servisleri kurmak istiyor musunuz? (e/h): " confirm
    
    if [[ ! $confirm =~ ^[Ee]$ ]]; then
        echo -e "${YELLOW}Kurulum iptal edildi.${NC}"
        exit 0
    fi
}

# Main function
main() {
    local mode="install"
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --start)
                mode="start"
                shift
                ;;
            --stop)
                mode="stop"
                shift
                ;;
            --restart)
                mode="restart"
                shift
                ;;
            --status)
                mode="status"
                shift
                ;;
            *)
                shift
                ;;
        esac
    done
    
    clear
    echo -e "${MAGENTA}==========================================${NC}"
    echo -e "${MAGENTA}      FITNESS CENTER KURULUM SİSTEMİ      ${NC}"
    echo -e "${MAGENTA}==========================================${NC}"
    
    # Check if services exist
    local missing_services=()
    for service in "${!SERVICE_DIRS[@]}"; do
        if [ ! -d "${SERVICE_DIRS[$service]}" ]; then
            missing_services+=("${SERVICE_NAMES[$service]}")
            SELECTED_SERVICES[$service]=false
        fi
    done
    
    if [ ${#missing_services[@]} -gt 0 ]; then
        print_warning "Bazı servis dizinleri bulunamadı:"
        for missing in "${missing_services[@]}"; do
            print_warning "  - $missing"
        done
        echo
    fi
    
    # Basic Docker checks
    check_docker
    ensure_docker_network
    
    # Handle different modes
    case "$mode" in
        "install")
            # Ask for service selection
            select_services
            
            # Show summary and confirmation
            display_service_summary
            
            # Install each selected service
            for service in "${!SELECTED_SERVICES[@]}"; do
                if [ "${SELECTED_SERVICES[$service]}" = true ]; then
                    install_service "$service"
                fi
            done
            
            print_header "Kurulum Tamamlandı"
            
            echo -e "${GREEN}Fitness Center servisleri kurulumu tamamlandı.${NC}"
            echo -e "${YELLOW}Servisleri başlatmak için:${NC} $0 --start"
            echo -e "${YELLOW}Çalışan servisleri kontrol etmek için:${NC} $0 --status"
            ;;
            
        "start")
            print_header "Servisleri Başlatma"
            
            # Ask for service selection
            select_services
            
            # Start each selected service
            for service in "${!SELECTED_SERVICES[@]}"; do
                if [ "${SELECTED_SERVICES[$service]}" = true ]; then
                    start_service "$service"
                fi
            done
            
            print_header "Servis Başlatma İşlemi Tamamlandı"
            
            echo -e "${GREEN}Seçilen servisler başlatıldı.${NC}"
            echo -e "${YELLOW}Aktif servisleri görmek için:${NC} $0 --status"
            echo -e "${YELLOW}Servisleri durdurmak için:${NC} $0 --stop"
            echo
            echo -e "${CYAN}Aktif Servisler:${NC}"
            for service in "${!SELECTED_SERVICES[@]}"; do
                if [ "${SELECTED_SERVICES[$service]}" = true ]; then
                    if [ -f "/tmp/fitness-${service}.pid" ] && kill -0 $(cat "/tmp/fitness-${service}.pid") 2>/dev/null; then
                        echo -e "${GREEN}- ${SERVICE_NAMES[$service]}:${NC} http://localhost:${SERVICE_PORTS[$service]} (PID: $(cat "/tmp/fitness-${service}.pid"))"
                    fi
                fi
            done
            ;;
            
        "stop")
            print_header "Servisleri Durdurma"
            
            # Ask for service selection
            select_services
            
            # Stop each selected service
            for service in "${!SELECTED_SERVICES[@]}"; do
                if [ "${SELECTED_SERVICES[$service]}" = true ]; then
                    stop_service "$service"
                fi
            done
            
            print_header "Servis Durdurma İşlemi Tamamlandı"
            ;;
            
        "restart")
            print_header "Servisleri Yeniden Başlatma"
            
            # Ask for service selection
            select_services
            
            # Restart each selected service
            for service in "${!SELECTED_SERVICES[@]}"; do
                if [ "${SELECTED_SERVICES[$service]}" = true ]; then
                    stop_service "$service"
                    start_service "$service"
                fi
            done
            
            print_header "Servis Yeniden Başlatma İşlemi Tamamlandı"
            ;;
            
        "status")
            print_header "Servis Durumları"
            
            for service in "${!SERVICE_NAMES[@]}"; do
                if [ -f "/tmp/fitness-${service}.pid" ] && kill -0 $(cat "/tmp/fitness-${service}.pid") 2>/dev/null; then
                    echo -e "${GREEN}● ${SERVICE_NAMES[$service]}${NC} - Çalışıyor (PID: $(cat "/tmp/fitness-${service}.pid")) - http://localhost:${SERVICE_PORTS[$service]}"
                else
                    echo -e "${RED}○ ${SERVICE_NAMES[$service]}${NC} - Çalışmıyor"
                fi
            done
            ;;
    esac
    
    echo
}

# Parse command line arguments and run main function
main "$@"
