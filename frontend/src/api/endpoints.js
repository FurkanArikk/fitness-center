export const API_BASE_URL = "http://localhost:80/api/v1";

// Service ports for health checks
export const SERVICE_PORTS = {
  member: "8001",
  staff: "8002",
  payment: "8003",
  facility: "8004",
  class: "8005"
};

// Service endpoints
export const ENDPOINTS = {
  // Member endpoints
  members: `${API_BASE_URL}/members`,
  memberships: `${API_BASE_URL}/memberships`,
  assessments: `${API_BASE_URL}/assessments`,
  
  // Staff endpoints
  staff: `${API_BASE_URL}/staff`,
  trainers: `${API_BASE_URL}/trainers`,
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
  transactions: `${API_BASE_URL}/transactions`
};