package postgres

import (
	"database/sql"
	"fmt"
	"time"

	_ "github.com/lib/pq" // PostgreSQL driver
)

// NewPostgresDB, PostgreSQL veritabanı bağlantısı oluşturur
func NewPostgresDB(host, port, user, password, dbname string) (*sql.DB, error) {
	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname)

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, fmt.Errorf("postgres connection error: %v", err)
	}

	// Bağlantıyı test et
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("postgres ping error: %v", err)
	}

	// Bağlantı havuzu ayarları
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(25)
	db.SetConnMaxLifetime(5 * time.Minute)

	return db, nil
}
