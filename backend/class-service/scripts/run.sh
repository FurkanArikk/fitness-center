# Change only the use_docker_postgres_for_reset_with_sample function
# Keep rest of the file unchanged

# Helper function to reset database and load sample data
use_docker_postgres_for_reset_with_sample() {
    print_info "Docker üzerinden veritabanı sıfırlama ve örnek veri yükleme işlemi başlatılıyor..."
    
    # Completely reset the database container
    print_info "Veritabanı konteynerini sıfırlama..."
    if ./scripts/docker-db.sh reset; then
        print_success "Veritabanı konteyner sıfırlandı"
        
        print_info "Veritabanı şemasını ve tabloları oluşturma..."
        # Wait for database to be ready
        sleep 5
        
        # First, reset schema_migrations table to ensure clean migrations
        print_info "Migration geçmişini temizleme..."
        if DB_HOST=${DB_HOST:-localhost} DB_PORT=${CLASS_SERVICE_DB_PORT:-5436} DB_USER=${DB_USER:-fitness_user} DB_PASSWORD=${DB_PASSWORD:-admin} DB_NAME=${CLASS_SERVICE_DB_NAME:-fitness_class_db} ./scripts/db-connect.sh -c "DROP TABLE IF EXISTS schema_migrations;" 2>/dev/null; then
            print_success "Migration geçmişi temizlendi"
        else
            print_info "Migration geçmişi bulunamadı, temiz bir başlangıç yapılıyor"
        fi
        
        # Apply all migrations manually to ensure they run in correct order
        print_info "Veritabanı şeması oluşturuluyor (migrations)..."
        
        # Get ordered list of up migrations
        migrations=($(ls -1v ./migrations/*_*.up.sql | grep -v "sample_data"))
        
        for migration in "${migrations[@]}"; do
            migration_name=$(basename "$migration")
            print_info "Uygulanıyor: $migration_name"
            
            if ! DB_HOST=${DB_HOST:-localhost} DB_PORT=${CLASS_SERVICE_DB_PORT:-5436} DB_USER=${DB_USER:-fitness_user} DB_PASSWORD=${DB_PASSWORD:-admin} DB_NAME=${CLASS_SERVICE_DB_NAME:-fitness_class_db} ./scripts/db-connect.sh -f "$migration"; then
                print_error "Migration başarısız: $migration_name"
                return 1
            fi
        done
        
        print_success "Temel veritabanı şeması başarıyla oluşturuldu"
        
        # Now load sample data
        print_info "Örnek verileri yükleniyor..."
        if DB_HOST=${DB_HOST:-localhost} DB_PORT=${CLASS_SERVICE_DB_PORT:-5436} DB_USER=${DB_USER:-fitness_user} DB_PASSWORD=${DB_PASSWORD:-admin} DB_NAME=${CLASS_SERVICE_DB_NAME:-fitness_class_db} ./scripts/db-connect.sh -f ./migrations/000004_sample_data.sql; then
            print_success "Örnek veriler başarıyla yüklendi"
            
            # Verify data was loaded
            print_info "Veritabanındaki veri sayısı kontrol ediliyor..."
            ./scripts/verify_db.sh
            
            return 0
        else
            print_error "Örnek veriler yüklenemedi"
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
        # Wait for database to be ready
        sleep 5
        
        # First, reset schema_migrations table to ensure clean migrations
        print_info "Migration geçmişini temizleme..."
        if DB_HOST=${DB_HOST:-localhost} DB_PORT=${CLASS_SERVICE_DB_PORT:-5436} DB_USER=${DB_USER:-fitness_user} DB_PASSWORD=${DB_PASSWORD:-admin} DB_NAME=${CLASS_SERVICE_DB_NAME:-fitness_class_db} ./scripts/db-connect.sh -c "DROP TABLE IF EXISTS schema_migrations;" 2>/dev/null; then
            print_success "Migration geçmişi temizlendi"
        else
            print_info "Migration geçmişi bulunamadı, temiz bir başlangıç yapılıyor"
        fi
        
        # Apply all migrations manually except sample data
        print_info "Veritabanı şeması oluşturuluyor (migrations)..."
        
        # Get ordered list of up migrations
        migrations=($(ls -1v ./migrations/*_*.up.sql | grep -v "sample_data"))
        
        for migration in "${migrations[@]}"; do
            migration_name=$(basename "$migration")
            print_info "Uygulanıyor: $migration_name"
            
            if ! DB_HOST=${DB_HOST:-localhost} DB_PORT=${CLASS_SERVICE_DB_PORT:-5436} DB_USER=${DB_USER:-fitness_user} DB_PASSWORD=${DB_PASSWORD:-admin} DB_NAME=${CLASS_SERVICE_DB_NAME:-fitness_class_db} ./scripts/db-connect.sh -f "$migration"; then
                print_error "Migration başarısız: $migration_name"
                return 1
            fi
        done
        
        print_success "Veritabanı şeması başarıyla oluşturuldu"
        print_info "Kullanıcı, API endpointleri aracılığıyla veri ekleyebilir"
        
        # Verify empty tables exist
        print_info "Veritabanı tabloları kontrol ediliyor..."
        ./scripts/verify_db.sh
        
        return 0
    else
        print_error "Veritabanı konteyner sıfırlanamadı"
        return 1
    fi
}
