#!/bin/bash

# Renkler - daha iyi görünüm için
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # Renk Yok

# Başlık yazdırmak için fonksiyon
print_header() {
    echo -e "\n${MAGENTA}====================================================${NC}"
    echo -e "${MAGENTA}      $1${NC}"
    echo -e "${MAGENTA}====================================================${NC}"
}

# Başarı mesajları yazdırmak için fonksiyon
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Hata mesajları yazdırmak için fonksiyon
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Bilgi mesajları yazdırmak için fonksiyon
print_info() {
    echo -e "${YELLOW}→ $1${NC}"
}

# Uyarı mesajları yazdırmak için fonksiyon
print_warning() {
    echo -e "${CYAN}⚠ $1${NC}"
}

# Servislerin listesi
SERVICES=(
    "api-gateway"
    "member-service"
    "staff-service"
    "class-service"
    "facility-service"
    "payment-service"
)

# Servis durumlarını tutacak dizi
declare -A service_selected

# Varsayılan olarak tüm servisler seçili
for service in "${SERVICES[@]}"; do
    service_selected["$service"]=true
done

# Docker kurulumunu kontrol et
check_docker() {
    print_info "Docker kontrol ediliyor..."
    if ! command -v docker &> /dev/null; then
        print_error "Docker yüklü değil veya PATH içinde değil"
        print_info "Lütfen Docker'ı yükleyin: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        print_error "Docker daemon çalışmıyor"
        print_info "Lütfen Docker servisini başlatın"
        exit 1
    fi
    
    print_success "Docker hazır"
}

# Docker ağı var mı kontrol et, yoksa oluştur
ensure_docker_network() {
    print_info "Docker ağı kontrol ediliyor..."
    
    if docker network inspect fitness-network &> /dev/null; then
        print_success "Docker ağı 'fitness-network' zaten var"
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

# Servis seçim menüsü
select_services() {
    clear
    print_header "FİTNESS CENTER SERVİSLERİ SEÇİMİ"
    
    echo -e "\nHangi servisleri yönetmek istiyorsunuz?"
    echo -e "(${GREEN}✓${NC} = Seçili, ${RED}✗${NC} = Seçili değil)\n"
    
    local counter=1
    for service in "${SERVICES[@]}"; do
        if [[ ${service_selected["$service"]} == true ]]; then
            echo -e "$counter) [${GREEN}✓${NC}] $service"
        else
            echo -e "$counter) [${RED}✗${NC}] $service"
        fi
        counter=$((counter+1))
    done
    
    echo -e "\n${CYAN}Seçenekler:${NC}"
    echo -e "  ${YELLOW}Servis numarasını${NC} girerek seçiminizi değiştirebilirsiniz"
    echo -e "  ${YELLOW}a${NC} - Tümünü seç"
    echo -e "  ${YELLOW}n${NC} - Tümünü seçme"
    echo -e "  ${YELLOW}c${NC} - Devam et"
    echo -e "  ${YELLOW}q${NC} - Çıkış\n"
    
    read -p "Seçiminiz: " choice
    
    case "$choice" in
        [1-9]*)
            # Servis indeksini ayarla (0-tabanlı)
            local index=$((choice-1))
            if [ $index -lt ${#SERVICES[@]} ]; then
                local selected_service=${SERVICES[$index]}
                # Seçimi tersine çevir
                if [[ ${service_selected["$selected_service"]} == true ]]; then
                    service_selected["$selected_service"]=false
                else
                    service_selected["$selected_service"]=true
                fi
                select_services  # Menüyü tekrar göster
            else
                print_error "Geçersiz seçim"
                sleep 1
                select_services
            fi
            ;;
        a|A)
            # Tümünü seç
            for service in "${SERVICES[@]}"; do
                service_selected["$service"]=true
            done
            select_services
            ;;
        n|N)
            # Tümünü seçme
            for service in "${SERVICES[@]}"; do
                service_selected["$service"]=false
            done
            select_services
            ;;
        c|C)
            # Devam et - hiçbir şey yapmadan çık
            ;;
        q|Q)
            echo -e "\n${YELLOW}Programdan çıkılıyor...${NC}"
            exit 0
            ;;
        *)
            print_error "Geçersiz seçim"
            sleep 1
            select_services
            ;;
    esac
}

# Servis başlatma fonksiyonu
start_service() {
    local service=$1
    local with_sample_data=$2
    local start_process=$3
    
    print_info "$service başlatılıyor..."
    
    # Servis dizinine git
    cd "$service" || {
        print_error "$service dizinine gidilemedi"
        return 1
    }
    
    if [ "$start_process" = true ]; then
        # Sadece servis sürecini başlat
        print_info "$service sürecini başlatıyorum..."
        
        if [ "$service" = "api-gateway" ]; then
            # API Gateway için terminal arka planda çalıştır
            ./run.sh --start-only &
            sleep 2
        else
            # Diğer servisler için terminal arka planda çalıştır
            ./run.sh --start-only &
            sleep 2
        fi
    else
        # Setup işlemleri
        # Sample data parametresi kontrol et
        if [ "$with_sample_data" = true ]; then
            ./run.sh --setup-with-data
        else
            ./run.sh --setup-only
        fi
    fi
    
    # Ana dizine geri dön
    cd ..
    
    print_success "$service başlatıldı"
}

# Servis durdurma fonksiyonu
stop_service() {
    local service=$1
    
    print_info "$service durduruluyor..."
    
    # Servis dizinine git
    cd "$service" || {
        print_error "$service dizinine gidilemedi"
        return 1
    }
    
    # Docker container adını belirle
    local container_name="fitness-${service%-service}-db"
    
    if [ "$service" = "api-gateway" ]; then
        # API Gateway için Docker container'ı yok, sadece process'i durdur
        pkill -f "$service"
    else
        # Docker container'ı durdur
        if ./scripts/docker-db.sh stop; then
            print_success "${service} için veritabanı durduruldu"
        else
            print_warning "${service} için veritabanı durdurulamadı"
        fi
        
        # Process'i durdur
        pkill -f "$service"
    fi
    
    # Ana dizine geri dön
    cd ..
    
    print_success "$service durduruldu"
}

# Tüm seçili servisleri başlat
start_all_services() {
    local with_sample_data=$1
    
    print_header "SEÇİLİ SERVİSLERİ BAŞLAT"
    
    # Docker kontrol et
    check_docker
    
    # Docker ağını kontrol et
    ensure_docker_network
    
    # Önce veritabanlarını başlat
    print_info "Veritabanları hazırlanıyor..."
    
    for service in "${SERVICES[@]}"; do
        if [[ ${service_selected["$service"]} == true ]] && [[ "$service" != "api-gateway" ]]; then
            # Önce veritabanı kurulumu
            start_service "$service" "$with_sample_data" false
            
            # Sonra servisi başlat
            start_service "$service" false true
        fi
    done
    
    # Son olarak API Gateway'i başlat
    if [[ ${service_selected["api-gateway"]} == true ]]; then
        # API Gateway setup
        start_service "api-gateway" false false
        
        # API Gateway sürecini başlat
        start_service "api-gateway" false true
    fi
    
    print_success "Tüm seçili servisler başlatıldı"
}

# Tüm seçili servisleri durdur
stop_all_services() {
    print_header "SEÇİLİ SERVİSLERİ DURDUR"
    
    # Önce API Gateway'i durdur
    if [[ ${service_selected["api-gateway"]} == true ]]; then
        stop_service "api-gateway"
    fi
    
    # Sonra diğer servisleri durdur
    for service in "${SERVICES[@]}"; do
        if [[ ${service_selected["$service"]} == true ]] && [[ "$service" != "api-gateway" ]]; then
            stop_service "$service"
        fi
    done
    
    print_success "Tüm seçili servisler durduruldu"
}

# Seçili servislerin durumunu kontrol et
check_services_status() {
    print_header "SERVİS DURUMLARI"
    
    for service in "${SERVICES[@]}"; do
        if [[ ${service_selected["$service"]} == true ]]; then
            echo -e "\n${CYAN}${service}${NC} durumu:"
            
            # Process kontrolü
            if pgrep -f "$service" > /dev/null; then
                echo -e "  Process: ${GREEN}Çalışıyor${NC}"
            else
                echo -e "  Process: ${RED}Çalışmıyor${NC}"
            fi
            
            # Veritabanı kontrolü (API Gateway hariç)
            if [[ "$service" != "api-gateway" ]]; then
                local container_name="fitness-${service%-service}-db"
                if docker ps | grep -q "$container_name"; then
                    echo -e "  Veritabanı: ${GREEN}Çalışıyor${NC}"
                else
                    echo -e "  Veritabanı: ${RED}Çalışmıyor${NC}"
                fi
            fi
        fi
    done
}

# Ana menüyü göster
show_main_menu() {
    clear
    print_header "FITNESS CENTER SERVİS YÖNETİCİSİ"
    
    local selected_count=0
    for service in "${SERVICES[@]}"; do
        if [[ ${service_selected["$service"]} == true ]]; then
            selected_count=$((selected_count+1))
        fi
    done
    
    echo -e "\n${CYAN}Seçili servisler:${NC} $selected_count/${#SERVICES[@]}"
    for service in "${SERVICES[@]}"; do
        if [[ ${service_selected["$service"]} == true ]]; then
            echo -e "  ${GREEN}✓${NC} $service"
        fi
    done
    
    echo -e "\n${CYAN}İşlemler:${NC}"
    echo -e "  ${YELLOW}1)${NC} Servisleri seç"
    echo -e "  ${YELLOW}2)${NC} Seçili servisleri başlat"
    echo -e "  ${YELLOW}3)${NC} Seçili servisleri örnek veri ile başlat"
    echo -e "  ${YELLOW}4)${NC} Seçili servisleri durdur"
    echo -e "  ${YELLOW}5)${NC} Seçili servisleri yeniden başlat"
    echo -e "  ${YELLOW}6)${NC} Seçili servislerin durumunu kontrol et"
    echo -e "  ${YELLOW}q)${NC} Çıkış\n"
    
    read -p "Seçiminiz: " choice
    
    case "$choice" in
        1)
            select_services
            show_main_menu
            ;;
        2)
            start_all_services false
            read -p "Ana menüye dönmek için Enter'a basın..." 
            show_main_menu
            ;;
        3)
            start_all_services true
            read -p "Ana menüye dönmek için Enter'a basın..." 
            show_main_menu
            ;;
        4)
            stop_all_services
            read -p "Ana menüye dönmek için Enter'a basın..." 
            show_main_menu
            ;;
        5)
            print_info "Servisler yeniden başlatılıyor..."
            stop_all_services
            start_all_services false
            read -p "Ana menüye dönmek için Enter'a basın..." 
            show_main_menu
            ;;
        6)
            check_services_status
            read -p "Ana menüye dönmek için Enter'a basın..." 
            show_main_menu
            ;;
        q|Q)
            echo -e "\n${YELLOW}Programdan çıkılıyor...${NC}"
            exit 0
            ;;
        *)
            print_error "Geçersiz seçim"
            sleep 1
            show_main_menu
            ;;
    esac
}

# Ana program başlangıcı
main() {
    clear
    show_main_menu
}

# Script'i başlat
main "$@"