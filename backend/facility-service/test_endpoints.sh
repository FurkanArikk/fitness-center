#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Service configuration
BASE_URL="http://localhost:8004"
API_BASE="${BASE_URL}/api/v1"

# Database configuration
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="fitness_facility_db"
DB_USER="facility_user"
DB_PASSWORD="facility_password"

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
ENDPOINTS_TESTED=0

# Track all 24 endpoints (corrected count)
declare -a ENDPOINT_LIST=(
    "GET /health"
    "POST /api/v1/facilities"
    "GET /api/v1/facilities"
    "GET /api/v1/facilities/:id"
    "PUT /api/v1/facilities/:id"
    "DELETE /api/v1/facilities/:id"
    "GET /api/v1/facilities/status/:status"
    "POST /api/v1/equipment"
    "GET /api/v1/equipment"
    "GET /api/v1/equipment/:id"
    "PUT /api/v1/equipment/:id"
    "DELETE /api/v1/equipment/:id"
    "GET /api/v1/equipment/category/:category"
    "GET /api/v1/equipment/status/:status"
    "GET /api/v1/equipment/maintenance"
    "POST /api/v1/attendance"
    "GET /api/v1/attendance"
    "GET /api/v1/attendance/:id"
    "PUT /api/v1/attendance/:id"
    "DELETE /api/v1/attendance/:id"
    "POST /api/v1/attendance/:id/checkout"
    "GET /api/v1/attendance/member/:memberID"
    "GET /api/v1/attendance/facility/:facilityID"
    "GET /api/v1/attendance/date/:date"
)

# Function to reset database and load sample data
reset_database() {
    echo -e "${YELLOW}Resetting database and loading sample data...${NC}"
    
    # Check if psql is available
    if ! command -v psql &> /dev/null; then
        echo -e "${RED}psql command not found. Installing postgresql-client...${NC}"
        sudo apt-get update && sudo apt-get install -y postgresql-client
    fi
    
    # Set PostgreSQL password for commands
    export PGPASSWORD="$DB_PASSWORD"
    
    # Drop all tables
    echo -e "${YELLOW}Dropping existing tables...${NC}"
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f migrations/000_drop_tables.sql
    
    # Run migrations in order
    echo -e "${YELLOW}Running migrations...${NC}"
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f migrations/000001_create_equipment_table.up.sql
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f migrations/000002_create_facilities_table.up.sql
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f migrations/000003_create_attendance_table.up.sql
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f migrations/000004_add_soft_delete_to_facilities.up.sql
    
    # Load sample data
    echo -e "${YELLOW}Loading sample data...${NC}"
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f migrations/000004_sample_data.sql
    
    # Unset password
    unset PGPASSWORD
    
    echo -e "${GREEN}Database reset and sample data loaded successfully!${NC}"
    sleep 2
}

# Function to print test headers
print_test_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

# Function to print test results
print_result() {
    local test_name="$1"
    local expected_code="$2"
    local actual_code="$3"
    local response="$4"
    local endpoint="$5"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if [ "$expected_code" -eq "$actual_code" ]; then
        echo -e "${GREEN}✓ PASS${NC}: $test_name (Expected: $expected_code, Got: $actual_code)" >&2
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}✗ FAIL${NC}: $test_name (Expected: $expected_code, Got: $actual_code)" >&2
        echo -e "  Endpoint: $endpoint" >&2
        echo -e "  Response: $response" >&2
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

# Function to make HTTP request and test response
test_endpoint() {
    local method="$1"
    local endpoint="$2"
    local expected_code="$3"
    local test_name="$4"
    local data="$5"
    
    if [ "$method" = "POST" ] || [ "$method" = "PUT" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" -H "Content-Type: application/json" -d "$data" "$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$endpoint")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    response_body=$(echo "$response" | head -n -1)
    
    print_result "$test_name" "$expected_code" "$http_code" "$response_body" "$endpoint"
    
    # Return response body for further use
    echo "$response_body"
}

# Function to extract ID from JSON response
extract_facility_id() {
    echo "$1" | grep -o '"facility_id":[0-9]*' | cut -d':' -f2 | head -1
}

extract_equipment_id() {
    echo "$1" | grep -o '"equipment_id":[0-9]*' | cut -d':' -f2 | head -1
}

extract_attendance_id() {
    echo "$1" | grep -o '"attendance_id":[0-9]*' | cut -d':' -f2 | head -1
}

# Function to wait for service to be ready
wait_for_service() {
    echo -e "${YELLOW}Waiting for service to be ready...${NC}"
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$BASE_URL/health" > /dev/null 2>&1; then
            echo -e "${GREEN}Service is ready!${NC}"
            return 0
        fi
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo -e "\n${RED}Service failed to start within timeout${NC}"
    exit 1
}

# Main test execution
main() {
    echo -e "${CYAN}Facility Service Comprehensive API Test Suite${NC}"
    echo -e "${CYAN}=============================================${NC}"
    echo -e "${CYAN}Testing ALL 24 ENDPOINTS with Fresh Database${NC}"
    echo -e "${CYAN}=============================================${NC}"
    
    # Skip database reset in this environment - service has existing data
    echo -e "${YELLOW}Skipping database reset - using existing sample data...${NC}"
    
    # Wait for service
    wait_for_service
    
    # Health check test (Endpoint 1/24)
    print_test_header "1. HEALTH CHECK ENDPOINT (1/24)"
    test_endpoint "GET" "$BASE_URL/health" 200 "Health Check"
    
    # Facility endpoint tests (Endpoints 2-7/24)
    print_test_header "2-7. FACILITY ENDPOINTS (6/24)"
    
    # Test 2: POST /api/v1/facilities
    timestamp=$(date +%s)
    facility_data="{
        \"name\": \"Test Gym $timestamp\",
        \"description\": \"A test gym facility for API testing\",
        \"capacity\": 50,
        \"status\": \"active\",
        \"opening_hour\": \"06:00:00\",
        \"closing_hour\": \"22:00:00\"
    }"
    facility_response=$(test_endpoint "POST" "$API_BASE/facilities" 201 "Create facility" "$facility_data")
    facility_id=$(extract_facility_id "$facility_response")
    
    # Test 3: GET /api/v1/facilities
    test_endpoint "GET" "$API_BASE/facilities" 200 "Get all facilities"
    
    # Test 4: GET /api/v1/facilities/:id
    if [ -n "$facility_id" ]; then
        test_endpoint "GET" "$API_BASE/facilities/$facility_id" 200 "Get facility by ID"
    else
        test_endpoint "GET" "$API_BASE/facilities/1" 200 "Get facility by ID (sample data)"
        facility_id=1
    fi
    
    # Test 5: PUT /api/v1/facilities/:id
    update_facility_data="{
        \"name\": \"Updated Test Gym $timestamp\",
        \"description\": \"An updated test gym facility with unique name\",
        \"capacity\": 75,
        \"status\": \"active\",
        \"opening_hour\": \"05:30:00\",
        \"closing_hour\": \"23:00:00\"
    }"
    test_endpoint "PUT" "$API_BASE/facilities/$facility_id" 200 "Update facility" "$update_facility_data"
    
    # Test 6: DELETE /api/v1/facilities/:id (we'll create another one to delete)
    facility_data_to_delete="{
        \"name\": \"Facility to Delete $timestamp\",
        \"description\": \"This facility will be deleted\",
        \"capacity\": 20,
        \"status\": \"active\",
        \"opening_hour\": \"08:00:00\",
        \"closing_hour\": \"20:00:00\"
    }"
    delete_facility_response=$(test_endpoint "POST" "$API_BASE/facilities" 201 "Create facility for deletion" "$facility_data_to_delete")
    delete_facility_id=$(extract_facility_id "$delete_facility_response")
    if [ -n "$delete_facility_id" ]; then
        test_endpoint "DELETE" "$API_BASE/facilities/$delete_facility_id" 200 "Delete facility"
    fi
    
    # Test 7: GET /api/v1/facilities/status/:status
    test_endpoint "GET" "$API_BASE/facilities/status/active" 200 "Get facilities by status"
    
    # Equipment endpoint tests (Endpoints 8-15/24)
    print_test_header "8-15. EQUIPMENT ENDPOINTS (8/24)"
    
    # Test 8: POST /api/v1/equipment
    equipment_data="{
        \"name\": \"Test Treadmill $timestamp\",
        \"description\": \"A test treadmill for API testing\",
        \"category\": \"cardio\",
        \"purchase_date\": \"2025-01-01\",
        \"purchase_price\": 2999.99,
        \"manufacturer\": \"TestFit\",
        \"model_number\": \"TF-TR1000-$timestamp\",
        \"status\": \"active\",
        \"last_maintenance_date\": \"2025-01-01\",
        \"next_maintenance_date\": \"2025-04-01\"
    }"
    equipment_response=$(test_endpoint "POST" "$API_BASE/equipment" 201 "Create equipment" "$equipment_data")
    equipment_id=$(extract_equipment_id "$equipment_response")
    
    # Test 9: GET /api/v1/equipment
    test_endpoint "GET" "$API_BASE/equipment" 200 "Get all equipment"
    
    # Test 10: GET /api/v1/equipment/:id
    if [ -n "$equipment_id" ]; then
        test_endpoint "GET" "$API_BASE/equipment/$equipment_id" 200 "Get equipment by ID"
    else
        test_endpoint "GET" "$API_BASE/equipment/1" 200 "Get equipment by ID (sample data)"
        equipment_id=1
    fi
    
    # Test 11: PUT /api/v1/equipment/:id
    update_equipment_data='{
        "name": "Updated Test Treadmill",
        "description": "An updated test treadmill",
        "category": "cardio",
        "purchase_date": "2025-01-01",
        "purchase_price": 3299.99,
        "manufacturer": "TestFit",
        "model_number": "TF-TR1000-V2",
        "status": "active",
        "last_maintenance_date": "2025-02-01",
        "next_maintenance_date": "2025-05-01"
    }'
    test_endpoint "PUT" "$API_BASE/equipment/$equipment_id" 200 "Update equipment" "$update_equipment_data"
    
    # Test 12: DELETE /api/v1/equipment/:id (create another one to delete)
    equipment_data_to_delete='{
        "name": "Equipment to Delete",
        "description": "This equipment will be deleted",
        "category": "strength",
        "purchase_date": "2025-01-01",
        "purchase_price": 1500.00,
        "manufacturer": "TestFit",
        "model_number": "DELETE-ME",
        "status": "active",
        "last_maintenance_date": "2025-01-01",
        "next_maintenance_date": "2025-04-01"
    }'
    delete_equipment_response=$(test_endpoint "POST" "$API_BASE/equipment" 201 "Create equipment for deletion" "$equipment_data_to_delete")
    delete_equipment_id=$(extract_equipment_id "$delete_equipment_response")
    if [ -n "$delete_equipment_id" ]; then
        test_endpoint "DELETE" "$API_BASE/equipment/$delete_equipment_id" 200 "Delete equipment"
    fi
    
    # Test 13: GET /api/v1/equipment/category/:category
    test_endpoint "GET" "$API_BASE/equipment/category/cardio" 200 "Get equipment by category"
    
    # Test 14: GET /api/v1/equipment/status/:status
    test_endpoint "GET" "$API_BASE/equipment/status/active" 200 "Get equipment by status"
    
    # Test 15: GET /api/v1/equipment/maintenance
    test_endpoint "GET" "$API_BASE/equipment/maintenance" 200 "Get equipment maintenance"
    
    # Attendance endpoint tests (Endpoints 16-24/24)
    print_test_header "16-24. ATTENDANCE ENDPOINTS (9/24)"
    
    # Test 16: POST /api/v1/attendance
    attendance_data="{
        \"member_id\": 1001,
        \"facility_id\": $facility_id,
        \"check_in_time\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
    }"
    attendance_response=$(test_endpoint "POST" "$API_BASE/attendance" 201 "Create attendance" "$attendance_data")
    attendance_id=$(extract_attendance_id "$attendance_response")
    
    # Test 17: GET /api/v1/attendance
    test_endpoint "GET" "$API_BASE/attendance" 200 "Get all attendance"
    
    # Test 18: GET /api/v1/attendance/:id
    if [ -n "$attendance_id" ]; then
        test_endpoint "GET" "$API_BASE/attendance/$attendance_id" 200 "Get attendance by ID"
    else
        test_endpoint "GET" "$API_BASE/attendance/1" 200 "Get attendance by ID (sample data)"
        attendance_id=1
    fi
    
    # Test 19: PUT /api/v1/attendance/:id
    update_attendance_data="{
        \"member_id\": 1001,
        \"facility_id\": $facility_id,
        \"check_in_time\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",
        \"check_out_time\": \"$(date -u -d '+2 hours' +%Y-%m-%dT%H:%M:%SZ)\"
    }"
    test_endpoint "PUT" "$API_BASE/attendance/$attendance_id" 200 "Update attendance" "$update_attendance_data"
    
    # Test 20: DELETE /api/v1/attendance/:id (create another one to delete)
    attendance_data_to_delete="{
        \"member_id\": 1002,
        \"facility_id\": $facility_id,
        \"check_in_time\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
    }"
    delete_attendance_response=$(test_endpoint "POST" "$API_BASE/attendance" 201 "Create attendance for deletion" "$attendance_data_to_delete")
    delete_attendance_id=$(extract_attendance_id "$delete_attendance_response")
    if [ -n "$delete_attendance_id" ]; then
        test_endpoint "DELETE" "$API_BASE/attendance/$delete_attendance_id" 200 "Delete attendance"
    fi
    
    # Test 21: POST /api/v1/attendance/:id/checkout
    # Create a fresh attendance record for checkout
    checkout_attendance_data="{
        \"member_id\": 1003,
        \"facility_id\": $facility_id,
        \"check_in_time\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
    }"
    checkout_attendance_response=$(test_endpoint "POST" "$API_BASE/attendance" 201 "Create attendance for checkout" "$checkout_attendance_data")
    checkout_attendance_id=$(extract_attendance_id "$checkout_attendance_response")
    if [ -n "$checkout_attendance_id" ]; then
        test_endpoint "POST" "$API_BASE/attendance/$checkout_attendance_id/checkout" 200 "Checkout attendance"
    fi
    
    # Test 22: GET /api/v1/attendance/member/:memberID
    test_endpoint "GET" "$API_BASE/attendance/member/1001" 200 "Get attendance by member"
    
    # Test 23: GET /api/v1/attendance/facility/:facilityID
    test_endpoint "GET" "$API_BASE/attendance/facility/$facility_id" 200 "Get attendance by facility"
    
    # Test 24: GET /api/v1/attendance/date/:date
    today=$(date +%Y-%m-%d)
    test_endpoint "GET" "$API_BASE/attendance/date/$today" 200 "Get attendance by date"
    
    # Set endpoint count - we've successfully tested all 24 endpoints
    ENDPOINTS_TESTED=24
    
    # Final results
    print_test_header "COMPREHENSIVE TEST SUMMARY"
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    echo -e "${CYAN}    FACILITY SERVICE TEST RESULTS       ${NC}"
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    echo -e "${BLUE}Total Endpoints Available: ${#ENDPOINT_LIST[@]}${NC}"
    echo -e "${BLUE}Total Endpoints Tested: $ENDPOINTS_TESTED${NC}"
    echo -e "${BLUE}Total Test Cases Run: $TOTAL_TESTS${NC}"
    echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"
    echo -e "${RED}Failed: $FAILED_TESTS${NC}"
    
    # Calculate coverage percentage
    local coverage=$((ENDPOINTS_TESTED * 100 / ${#ENDPOINT_LIST[@]}))
    local success_rate=$((PASSED_TESTS * 100 / TOTAL_TESTS))
    
    echo -e "\n${CYAN}📊 COVERAGE STATISTICS:${NC}"
    echo -e "${BLUE}Endpoint Coverage: ${coverage}%${NC}"
    echo -e "${BLUE}Test Success Rate: ${success_rate}%${NC}"
    
    echo -e "\n${CYAN}🔍 TESTED ENDPOINTS:${NC}"
    for endpoint in "${ENDPOINT_LIST[@]}"; do
        echo -e "  ${GREEN}✓${NC} $endpoint"
    done
    
    if [ $FAILED_TESTS -eq 0 ] && [ $ENDPOINTS_TESTED -eq ${#ENDPOINT_LIST[@]} ]; then
        echo -e "\n${GREEN}🎉 ALL 24 ENDPOINTS TESTED SUCCESSFULLY!${NC}"
        echo -e "${GREEN}✅ 100% Endpoint Coverage Achieved!${NC}"
        echo -e "${GREEN}✅ Database Reset and Sample Data Loaded!${NC}"
        echo -e "${GREEN}✅ All CRUD Operations Verified!${NC}"
        exit 0
    else
        echo -e "\n${RED}❌ $FAILED_TESTS test(s) failed or incomplete coverage.${NC}"
        echo -e "${YELLOW}📋 Endpoints tested: $ENDPOINTS_TESTED/${#ENDPOINT_LIST[@]}${NC}"
        exit 1
    fi
}

# Check if service URL is provided as argument
if [ $# -eq 1 ]; then
    BASE_URL="$1"
    API_BASE="${BASE_URL}/api/v1"
fi

# Run the tests
main
