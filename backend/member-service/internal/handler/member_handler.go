package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/FurkanArikk/fitness-center/backend/member-service/internal/model"
	"github.com/FurkanArikk/fitness-center/backend/member-service/internal/service"
	"github.com/gorilla/mux"
)

// MemberHandler, üye işlemleri için HTTP endpoint'lerini sağlar
type MemberHandler struct {
	service service.MemberService
}

// NewMemberHandler, yeni bir MemberHandler oluşturur
func NewMemberHandler(service service.MemberService) *MemberHandler {
	return &MemberHandler{
		service: service,
	}
}

// CreateMember creates a new member
func (h *MemberHandler) CreateMember(w http.ResponseWriter, r *http.Request) {
	var memberReq struct {
		FirstName             string `json:"firstName"`
		LastName              string `json:"lastName"`
		Email                 string `json:"email"`
		Phone                 string `json:"phone"`
		Address               string `json:"address"`
		DateOfBirth           string `json:"dateOfBirth"`
		EmergencyContactName  string `json:"emergencyContactName"`
		EmergencyContactPhone string `json:"emergencyContactPhone"`
	}

	if err := json.NewDecoder(r.Body).Decode(&memberReq); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Convert to model (simplified for demonstration)
	member := &model.Member{
		FirstName:             memberReq.FirstName,
		LastName:              memberReq.LastName,
		Email:                 memberReq.Email,
		Phone:                 memberReq.Phone,
		Address:               memberReq.Address,
		EmergencyContactName:  memberReq.EmergencyContactName,
		EmergencyContactPhone: memberReq.EmergencyContactPhone,
	}

	if err := h.service.Create(r.Context(), member); err != nil {
		http.Error(w, "Failed to create member", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(member)
}

// ListMembers retrieves a paginated list of members
func (h *MemberHandler) ListMembers(w http.ResponseWriter, r *http.Request) {
	pageStr := r.URL.Query().Get("page")
	sizeStr := r.URL.Query().Get("size")

	page := 1
	size := 10

	if pageStr != "" {
		if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
			page = p
		}
	}

	if sizeStr != "" {
		if s, err := strconv.Atoi(sizeStr); err == nil && s > 0 {
			size = s
		}
	}

	members, err := h.service.List(r.Context(), page, size)
	if err != nil {
		http.Error(w, "Failed to retrieve members", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(members)
}

// GetMember, belirli bir üyeyi getirir
func (h *MemberHandler) GetMember(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http.Error(w, "Invalid member ID", http.StatusBadRequest)
		return
	}

	member, err := h.service.GetByID(r.Context(), id)
	if err != nil {
		http.Error(w, "Member not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(member)
}

// UpdateMember updates an existing member
func (h *MemberHandler) UpdateMember(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http.Error(w, "Invalid member ID", http.StatusBadRequest)
		return
	}

	var memberReq struct {
		FirstName             string `json:"firstName"`
		LastName              string `json:"lastName"`
		Email                 string `json:"email"`
		Phone                 string `json:"phone"`
		Address               string `json:"address"`
		EmergencyContactName  string `json:"emergencyContactName"`
		EmergencyContactPhone string `json:"emergencyContactPhone"`
	}

	if err := json.NewDecoder(r.Body).Decode(&memberReq); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// First get the existing member
	existingMember, err := h.service.GetByID(r.Context(), id)
	if err != nil {
		http.Error(w, "Member not found", http.StatusNotFound)
		return
	}

	// Update fields
	existingMember.FirstName = memberReq.FirstName
	existingMember.LastName = memberReq.LastName
	existingMember.Email = memberReq.Email
	existingMember.Phone = memberReq.Phone
	existingMember.Address = memberReq.Address
	existingMember.EmergencyContactName = memberReq.EmergencyContactName
	existingMember.EmergencyContactPhone = memberReq.EmergencyContactPhone

	if err := h.service.Update(r.Context(), existingMember); err != nil {
		http.Error(w, "Failed to update member", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(existingMember)
}

// DeleteMember, bir üyeyi siler
func (h *MemberHandler) DeleteMember(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http.Error(w, "Invalid member ID", http.StatusBadRequest)
		return
	}

	if err := h.service.Delete(r.Context(), id); err != nil {
		http.Error(w, "Failed to delete member", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
