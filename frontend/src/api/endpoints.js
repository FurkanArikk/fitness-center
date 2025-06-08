// API temel URL'si environment variable'dan alınır
export const API_BASE_URL = "/api/v1";

// Health check base URL - environment variable'dan alınır
export const HEALTH_CHECK_BASE_URL = process.env.NEXT_PUBLIC_HEALTH_CHECK_BASE_URL || "http://localhost";

// Service ports for health checks - environment variable'lardan alınır
export const SERVICE_PORTS = {
  member: process.env.NEXT_PUBLIC_MEMBER_SERVICE_PORT || "8001",
  staff: process.env.NEXT_PUBLIC_STAFF_SERVICE_PORT || "8002",
  payment: process.env.NEXT_PUBLIC_PAYMENT_SERVICE_PORT || "8003",
  facility: process.env.NEXT_PUBLIC_FACILITY_SERVICE_PORT || "8004",
  class: process.env.NEXT_PUBLIC_CLASS_SERVICE_PORT || "8005",
  auth: process.env.NEXT_PUBLIC_AUTH_SERVICE_PORT || "8085"
};

// Service endpoints
export const ENDPOINTS = {
  // Member endpoints
  members: `${API_BASE_URL}/members`,
  memberships: `${API_BASE_URL}/memberships`,
  assessments: `${API_BASE_URL}/assessments`,
  benefits: `${API_BASE_URL}/benefits`,
  memberMemberships: `${API_BASE_URL}/member-memberships`,

  // Staff endpoints
  staff: `${API_BASE_URL}/staff`,
  trainers: `${API_BASE_URL}/trainers`,
  qualifications: `${API_BASE_URL}/qualifications`,
  trainingSessions: `${API_BASE_URL}/training-sessions`,
  
  // Class endpoints
  classes: `${API_BASE_URL}/classes`,
  schedules: `${API_BASE_URL}/schedules`,
  bookings: `${API_BASE_URL}/bookings`,
  
  // Facility endpoints
  facilities: `${API_BASE_URL}/facilities`,
  equipment: `${API_BASE_URL}/equipment`,
  attendance: `${API_BASE_URL}/attendance`,
  
  // Payment endpoints
  payments: `${API_BASE_URL}/payments`,
  paymentStats: `${API_BASE_URL}/payments/statistics`,
  paymentTypes: `${API_BASE_URL}/payment-types`,
  transactions: `${API_BASE_URL}/transactions`,
  
  // Auth endpoints
  auth: {
    login: `/api/v1/login`,
    updatePassword: `/api/v1/admin/password`,
    listAdmins: `/api/v1/admin/list`,
    createAdmin: `/api/v1/admin/create`,
    deleteAdmin: `/api/v1/admin`,
    health: `/health`
  }
};