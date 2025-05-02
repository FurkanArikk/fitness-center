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
    ["facility"]="8004"
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

# Function to check if port is available
check_port_available() {
    local port=$1
    local service_name=$2

    print_info "Port $port kontrol ediliyor..."
    if nc -z localhost $port > /dev/null 2>&1 || lsof -ti:$port &>/dev/null; then
        print_warning "Port $port zaten kullanımda! $service_name başlatılamıyor."
        
        # List processes using this port
        local pid=$(lsof -ti:$port)
        if [ -n "$pid" ]; then
            print_info "Bu portu kullanan işlem: PID=$pid ($(ps -p $pid -o comm=))"
            
            # Ask if user wants to kill the process and retry
            read -p "Bu işlemi sonlandırmak ve servisi başlatmayı denemek istiyor musunuz? (e/h): " kill_choice
            if [[ $kill_choice =~ ^[Ee]$ ]]; then
                print_info "İşlem sonlandırılıyor (PID=$pid)..."
                kill -9 $pid
                sleep 2
                
                # Portu tekrar kontrol et
                if nc -z localhost $port > /dev/null 2>&1 || lsof -ti:$port &>/dev/null; then
                    print_error "İşlem sonlandırıldı ancak port $port hala kullanımda!"
                    return 1
                else
                    print_success "İşlem sonlandırıldı, port $port artık kullanılabilir"
                    return 0
                fi
            fi
        fi
        return 1
    fi
    
    print_success "Port $port kullanılabilir"
    return 0
}

# Function to show service selection menu
select_services() {
    local mode=$1
    local menu_title="Fitness Center Servis Seçimi"
    local menu_prompt="Hangi servisleri kurmak istiyorsunuz?"
    local confirm_option="Kurulumu başlat"
    
    # Moda göre menü metinlerini ayarla
    case "$mode" in
        "install")
            menu_title="Fitness Center Servis Kurulumu"
            menu_prompt="Hangi servisleri kurmak istiyorsunuz?"
            confirm_option="Kurulumu başlat"
            ;;
        "start")
            menu_title="Fitness Center Servis Başlatma"
            menu_prompt="Hangi servisleri başlatmak istiyorsunuz?"
            confirm_option="Servisleri başlat"
            ;;
        "stop")
            menu_title="Fitness Center Servis Durdurma"
            menu_prompt="Hangi servisleri durdurmak istiyorsunuz?"
            confirm_option="Servisleri durdur"
            ;;
        "restart")
            menu_title="Fitness Center Servis Yeniden Başlatma"
            menu_prompt="Hangi servisleri yeniden başlatmak istiyorsunuz?"
            confirm_option="Servisleri yeniden başlat"
            ;;
        "status")
            menu_title="Fitness Center Servis Durumu"
            menu_prompt="Hangi servislerin durumunu görmek istiyorsunuz?"
            confirm_option="Durum göster"
            ;;
    esac
    
    clear
    print_header "$menu_title"
    
    echo -e "${YELLOW}$menu_prompt${NC}"
    echo -e "${CYAN}0)${NC} Tüm servisleri seç (varsayılan)"
    local i=1
    for service in "${!SERVICE_NAMES[@]}"; do
        local status="[ ]"
        if [ "${SELECTED_SERVICES[$service]}" = true ]; then
            status="[${GREEN}✓${NC}]"
        fi
        echo -e "${CYAN}$i)${NC} $status ${SERVICE_NAMES[$service]} (port: ${SERVICE_PORTS[$service]})"
        i=$((i+1))
    done
    echo -e "${CYAN}6)${NC} $confirm_option"
    echo -e "${CYAN}7)${NC} Çıkış"
    
    read -p "Seçiminizi yapın (0-7): " choice
    
    case $choice in
        0)
            # Select all services
            for service in "${!SELECTED_SERVICES[@]}"; do
                SELECTED_SERVICES[$service]=true
            done
            select_services "$mode"
            ;;
        1|2|3|4|5)
            local selected_service=$(get_service_by_index $choice)
            if [ "${SELECTED_SERVICES[$selected_service]}" = true ]; then
                SELECTED_SERVICES[$selected_service]=false
            else
                SELECTED_SERVICES[$selected_service]=true
            fi
            select_services "$mode"
            ;;
        6)
            # Proceed with operation
            return 0
            ;;
        7)
            echo -e "${YELLOW}İşlem iptal edildi.${NC}"
            exit 0
            ;;
        *)
            print_error "Geçersiz seçim"
            select_services "$mode"
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
    
    # Ask if sample data should be loaded
    echo
    read -p "Bu servis için örnek veri yüklensin mi? (e/h): " load_sample_data
    
    if [[ $load_sample_data =~ ^[Ee]$ ]]; then
        # Run with sample data loading option
        print_info "Servis kurulumu ve örnek veri yükleme başlatılıyor..."
        ./run.sh --setup-with-data
    else
        # Run without sample data
        print_info "Servis kurulumu başlatılıyor (örnek veri olmadan)..."
        ./run.sh --setup-only
    fi
    
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
    local port=${SERVICE_PORTS[$service]}
    
    print_header "${SERVICE_NAMES[$service]} Başlatılıyor"
    
    if [ ! -d "$service_dir" ]; then
        print_error "Servis dizini bulunamadı: $service_dir"
        # Tam yolu göster, hata ayıklama için
        local current_dir=$(pwd)
        print_info "Mevcut dizin: $current_dir"
        print_info "Aranan dizin: $current_dir/$service_dir"
        return 1
    fi
    
    # Check if port is available
    if ! check_port_available "$port" "${SERVICE_NAMES[$service]}"; then
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
    
    # Make sure run.sh is executable
    chmod +x run.sh
    
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
    local port=${SERVICE_PORTS[$service]}
    
    print_header "${SERVICE_NAMES[$service]} Durduruluyor"
    
    # İlk olarak PID dosyası ile deneme
    if [ -f "/tmp/fitness-${service}.pid" ]; then
        local pid=$(cat "/tmp/fitness-${service}.pid")
        
        if kill -0 $pid 2>/dev/null; then
            print_info "Servis PID ile durduruluyor (PID: $pid)..."
            
            # Önce SIGTERM sinyali ile nazik bir şekilde durdurma deneyelim
            kill $pid
            
            # Wait for service to terminate
            for i in {1..5}; do
                if ! kill -0 $pid 2>/dev/null; then
                    print_success "Servis başarıyla durduruldu (PID: $pid)"
                    break
                fi
                sleep 1
            done
            
            # Hala çalışıyorsa zorla kapatma
            if kill -0 $pid 2>/dev/null; then
                print_warning "Servis yanıt vermiyor, zorla kapatılıyor..."
                kill -9 $pid 2>/dev/null
                sleep 1
            fi
        else
            print_warning "PID dosyasındaki işlem ($pid) artık çalışmıyor"
        fi
    else
        print_info "PID dosyası bulunamadı, portu kontrol ediyoruz..."
    fi
    
    # Port tabanlı kontrol - PID dosyasından bağımsız olarak port kullanımını kontrol et
    if [ -n "$port" ]; then
        # Portu kullanan tüm işlemleri bul
        local port_pids=$(lsof -ti:$port 2>/dev/null)
        
        if [ -n "$port_pids" ]; then
            print_info "Port $port hala kullanımda. İşlem(ler): $port_pids"
            print_info "İşlemleri sonlandırma..."
            
            # Her bir işlemi sonlandır
            for port_pid in $port_pids; do
                print_info "İşlem sonlandırılıyor: $port_pid"
                kill -15 $port_pid 2>/dev/null
                sleep 1
                
                # Eğer hala çalışıyorsa, zorla sonlandır
                if kill -0 $port_pid 2>/dev/null; then
                    print_warning "İşlem yanıt vermiyor, zorla sonlandırılıyor: $port_pid"
                    kill -9 $port_pid 2>/dev/null
                fi
            done
            
            # Son bir kontrol daha yap
            if lsof -ti:$port &>/dev/null; then
                print_error "Port $port hala kullanımda! Servisi tamamen durdurulamadı."
                print_info "Manuel olarak şu komutu çalıştırmayı deneyin: sudo lsof -ti:$port | xargs kill -9"
            else
                print_success "Port $port artık serbest"
            fi
        else
            print_info "Port $port zaten kullanımda değil"
        fi
    else
        print_warning "Servis için port bilgisi yok, port kontrol edilemiyor"
    fi
    
    # PID dosyasını temizle
    rm -f "/tmp/fitness-${service}.pid"
    
    # Servis durumu ile ilgili son durum bilgisi ver
    if ! lsof -ti:$port &>/dev/null; then
        print_success "${SERVICE_NAMES[$service]} başarıyla durduruldu"
    else
        print_warning "${SERVICE_NAMES[$service]} durumu belirsiz (port $port hala kullanımda)"
    fi
}

# Function to display a summary of services
display_service_summary() {
    local mode=$1
    local action="kurmak"
    
    case "$mode" in
        "install")
            action="kurmak"
            ;;
        "start")
            action="başlatmak"
            ;;
        "stop")
            action="durdurmak"
            ;;
        "restart")
            action="yeniden başlatmak"
            ;;
        "status")
            action="durumunu görmek"
            ;;
    esac
    
    print_header "Seçilen Servisler"
    
    local selected_count=0
    for service in "${!SELECTED_SERVICES[@]}"; do
        if [ "${SELECTED_SERVICES[$service]}" = true ]; then
            selected_count=$((selected_count+1))
            print_info "${SERVICE_NAMES[$service]} (${SERVICE_DIRS[$service]})"
        fi
    done
    
    if [ $selected_count -eq 0 ]; then
        print_warning "Hiçbir servis seçilmedi! İşlem yapılmayacak."
        exit 0
    fi
    
    echo
    read -p "Seçilen servisleri ${action} istiyor musunuz? (e/h): " confirm
    
    if [[ ! $confirm =~ ^[Ee]$ ]]; then
        echo -e "${YELLOW}İşlem iptal edildi.${NC}"
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
        # Tam yolları kontrol et ve göster
        if [ ! -d "${SERVICE_DIRS[$service]}" ]; then
            local current_dir=$(pwd)
            print_warning "Dizin kontrolü: $current_dir/${SERVICE_DIRS[$service]}"
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
            select_services "$mode"
            
            # Show summary and confirmation
            display_service_summary "$mode"
            
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
            # Ask for service selection
            select_services "$mode"
            
            # Show summary and confirmation
            display_service_summary "$mode"
            
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
            # Ask for service selection
            select_services "$mode"
            
            # Show summary and confirmation
            display_service_summary "$mode"
            
            # Stop each selected service
            for service in "${!SELECTED_SERVICES[@]}"; do
                if [ "${SELECTED_SERVICES[$service]}" = true ]; then
                    stop_service "$service"
                fi
            done
            
            print_header "Servis Durdurma İşlemi Tamamlandı"
            ;;
            
        "restart")
            # Ask for service selection
            select_services "$mode"
            
            # Show summary and confirmation
            display_service_summary "$mode"
            
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
