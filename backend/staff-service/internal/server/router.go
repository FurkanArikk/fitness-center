package server

import (
	"net/http"
	"time"

	"github.com/gorilla/mux"

	"github.com/fitness-center/staff-service/internal/handler"
)

// Router represents the application router
type Router struct {
	*mux.Router
}

// NewRouter creates a new router with all application routes
func NewRouter(staffHandler *handler.StaffHandler, qualificationHandler *handler.QualificationHandler,
	trainerHandler *handler.TrainerHandler, trainingHandler *handler.TrainingHandler) *Router {

	router := mux.NewRouter()

	// Add middleware
	router.Use(loggingMiddleware)
	router.Use(corsMiddleware)
	router.Use(contentTypeMiddleware)

	// Register API routes
	apiRouter := router.PathPrefix("/api/v1").Subrouter()
	handler.RegisterHandlers(apiRouter, staffHandler, qualificationHandler, trainerHandler, trainingHandler)

	// Add health check endpoint
	router.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	}).Methods("GET")

	return &Router{router}
}

// loggingMiddleware logs requests with timing information
func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		next.ServeHTTP(w, r)

		// Log request details after completion
		duration := time.Since(start)
		method := r.Method
		path := r.URL.Path

		// Log using the application logger (not implemented here)
		// log.Printf("%s %s completed in %v", method, path, duration)

		// For now just use the standard library logger
		http.DefaultServeMux.Handle("/log", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Write([]byte("Log: " + method + " " + path + " " + duration.String()))
		}))
	})
}

// corsMiddleware adds CORS headers to responses
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// contentTypeMiddleware sets the default content type for API responses
func contentTypeMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		next.ServeHTTP(w, r)
	})
}
