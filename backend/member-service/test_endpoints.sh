#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Service configuration
BASE_URL="http://localhost:8001"
API_BASE="${BASE_URL}/api/v1"

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

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
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if [ "$expected_code" -eq "$actual_code" ]; then
        echo -e "${GREEN}✓ PASS${NC} - $test_name (Expected: $expected_code, Got: $actual_code)"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}✗ FAIL${NC} - $test_name (Expected: $expected_code, Got: $actual_code)"
        echo -e "${YELLOW}Response: $response${NC}"
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
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$endpoint")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    response_body=$(echo "$response" | head -n -1)
    
    print_result "$test_name" "$expected_code" "$http_code" "$response_body"
    
    # Return response body for further use
    echo "$response_body"
}

# Function to extract IDs from JSON responses
extract_member_id() {
    echo "$1" | grep -o '"id":[0-9]*' | cut -d':' -f2 | head -1
}

extract_membership_id() {
    echo "$1" | grep -o '"id":[0-9]*' | cut -d':' -f2 | head -1
}

extract_benefit_id() {
    echo "$1" | grep -o '"id":[0-9]*' | cut -d':' -f2 | head -1
}

extract_member_membership_id() {
    echo "$1" | grep -o '"id":[0-9]*' | cut -d':' -f2 | head -1
}

extract_assessment_id() {
    echo "$1" | grep -o '"id":[0-9]*' | cut -d':' -f2 | head -1
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

# Function to print final results
print_final_results() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}TEST RESULTS SUMMARY${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo -e "Total Tests: $TOTAL_TESTS"
    echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"
    echo -e "${RED}Failed: $FAILED_TESTS${NC}"
    
    if [ $FAILED_TESTS -eq 0 ]; then
        echo -e "\n${GREEN}🎉 All tests passed!${NC}"
        exit 0
    else
        echo -e "\n${RED}❌ Some tests failed. Please check the output above.${NC}"
        exit 1
    fi
}

echo -e "${CYAN}Member Service API Test Suite${NC}"
echo -e "${CYAN}=============================${NC}"

# Wait for service to be ready
wait_for_service

# Get current timestamp for unique data
TIMESTAMP=$(date +%s)

# Health check test
print_test_header "HEALTH CHECK TESTS"
health_response=$(test_endpoint "GET" "$BASE_URL/health" 200 "Health check")
echo "$health_response"

# Member endpoint tests
print_test_header "MEMBER ENDPOINT TESTS"

# Get all members
test_endpoint "GET" "$API_BASE/members" 200 "Get all members"

# Get non-existent member
test_endpoint "GET" "$API_BASE/members/999" 404 "Get non-existent member"

# Create new members
member_data='{
    "first_name": "TestUser",
    "last_name": "TestLast",
    "email": "testuser'$TIMESTAMP'@example.com",
    "phone": "+1234567891",
    "date_of_birth": "1990-01-15",
    "address": "123 Test Street"
}'
member_response=$(test_endpoint "POST" "$API_BASE/members" 201 "Create new member" "$member_data")
member_id=$(extract_member_id "$member_response")

member_data2='{
    "first_name": "TestUser2",
    "last_name": "TestLast2",
    "email": "testuser2'$TIMESTAMP'@example.com",
    "phone": "+9876543211",
    "date_of_birth": "1985-05-20",
    "address": "456 Test Avenue"
}'
member_response2=$(test_endpoint "POST" "$API_BASE/members" 201 "Create second member" "$member_data2")
member_id2=$(extract_member_id "$member_response2")

if [ ! -z "$member_id" ]; then
    # Get member by ID
    test_endpoint "GET" "$API_BASE/members/$member_id" 200 "Get member by ID"
    
    # Update member
    updated_member_data='{
        "first_name": "John Updated",
        "last_name": "Doe",
        "email": "testuserupdated'$TIMESTAMP'@example.com",
        "phone": "+1234567890",
        "date_of_birth": "1990-01-15",
        "address": "123 Updated Street"
    }'
    test_endpoint "PUT" "$API_BASE/members/$member_id" 200 "Update member" "$updated_member_data"
fi

# Membership endpoint tests
print_test_header "MEMBERSHIP ENDPOINT TESTS"

# Get all memberships
test_endpoint "GET" "$API_BASE/memberships" 200 "Get all memberships"

# Create new memberships
membership_data='{
    "membership_name": "Test Monthly '$TIMESTAMP'",
    "description": "Test monthly membership with gym access",
    "duration": 30,
    "price": 29.99,
    "is_active": true
}'
membership_response=$(test_endpoint "POST" "$API_BASE/memberships" 201 "Create new membership" "$membership_data")
membership_id=$(extract_membership_id "$membership_response")

membership_data2='{
    "membership_name": "Test Annual '$TIMESTAMP'",
    "description": "Test annual membership with all amenities",
    "duration": 365,
    "price": 299.99,
    "is_active": true
}'
membership_response2=$(test_endpoint "POST" "$API_BASE/memberships" 201 "Create second membership" "$membership_data2")
membership_id2=$(extract_membership_id "$membership_response2")

if [ ! -z "$membership_id" ]; then
    # Get membership by ID
    test_endpoint "GET" "$API_BASE/memberships/$membership_id" 200 "Get membership by ID"
    
    # Update membership
    updated_membership_data='{
        "membership_name": "Basic Monthly Updated",
        "description": "Updated basic monthly membership",
        "duration": 30,
        "price": 34.99,
        "is_active": true
    }'
    test_endpoint "PUT" "$API_BASE/memberships/$membership_id" 200 "Update membership" "$updated_membership_data"
fi

# Benefit endpoint tests
print_test_header "BENEFIT ENDPOINT TESTS"

if [ ! -z "$membership_id" ]; then
    # Get benefits for membership
    test_endpoint "GET" "$API_BASE/memberships/$membership_id/benefits" 200 "Get benefits for membership"
    
    # Create new benefits
    benefit_data='{
        "membership_id": '$membership_id',
        "benefit_name": "Test Gym Access '$TIMESTAMP'",
        "description": "24/7 access to gym equipment"
    }'
    benefit_response=$(test_endpoint "POST" "$API_BASE/benefits" 201 "Create new benefit" "$benefit_data")
    benefit_id=$(extract_benefit_id "$benefit_response")
    
    benefit_data2='{
        "membership_id": '$membership_id',
        "benefit_name": "Test Personal Training '$TIMESTAMP'",
        "description": "2 free personal training sessions per month"
    }'
    benefit_response2=$(test_endpoint "POST" "$API_BASE/benefits" 201 "Create second benefit" "$benefit_data2")
    benefit_id2=$(extract_benefit_id "$benefit_response2")
    
    if [ ! -z "$benefit_id" ]; then
        # Get benefit by ID
        test_endpoint "GET" "$API_BASE/benefits/$benefit_id" 200 "Get benefit by ID"
        
        # Update benefit
        updated_benefit_data='{
            "membership_id": '$membership_id',
            "benefit_name": "Test Gym Access Updated '$TIMESTAMP'",
            "description": "24/7 access to gym equipment with locker"
        }'
        test_endpoint "PUT" "$API_BASE/benefits/$benefit_id" 200 "Update benefit" "$updated_benefit_data"
    fi
fi

# Member Membership endpoint tests
print_test_header "MEMBER MEMBERSHIP ENDPOINT TESTS"

if [ ! -z "$member_id" ] && [ ! -z "$membership_id" ]; then
    # Create member membership with future dates
    member_membership_data='{
        "member_id": '$member_id',
        "membership_id": '$membership_id',
        "start_date": "2025-06-01",
        "end_date": "2025-07-01",
        "payment_status": "paid",
        "payment_amount": 29.99
    }'
    member_membership_response=$(test_endpoint "POST" "$API_BASE/member-memberships" 201 "Create member membership" "$member_membership_data")
    member_membership_id=$(extract_member_membership_id "$member_membership_response")
    
    if [ ! -z "$member_membership_id" ]; then
        # Get member membership by ID
        test_endpoint "GET" "$API_BASE/member-memberships/$member_membership_id" 200 "Get member membership by ID"
        
        # Get memberships for member
        test_endpoint "GET" "$API_BASE/members/$member_id/memberships" 200 "Get memberships for member"
        
        # Get active membership for member
        test_endpoint "GET" "$API_BASE/members/$member_id/active-membership" 200 "Get active membership for member"
        
        # Update member membership
        updated_member_membership_data='{
            "member_id": '$member_id',
            "membership_id": '$membership_id',
            "start_date": "2025-06-01",
            "end_date": "2025-07-01",
            "payment_status": "paid",
            "payment_amount": 34.99
        }'
        test_endpoint "PUT" "$API_BASE/member-memberships/$member_membership_id" 200 "Update member membership" "$updated_member_membership_data"
    fi
fi

# Assessment endpoint tests
print_test_header "ASSESSMENT ENDPOINT TESTS"

if [ ! -z "$member_id" ]; then
    # Create fitness assessment
    assessment_data='{
        "member_id": '$member_id',
        "trainer_id": 1,
        "weight": 70.5,
        "height": 175.0,
        "body_fat_percentage": 15.5,
        "bmi": 23.0,
        "assessment_date": "2025-01-15",
        "next_assessment_date": "2025-04-15",
        "notes": "Initial fitness assessment",
        "goals_set": "Increase muscle mass, reduce body fat"
    }'
    assessment_response=$(test_endpoint "POST" "$API_BASE/assessments" 201 "Create fitness assessment" "$assessment_data")
    assessment_id=$(extract_assessment_id "$assessment_response")
    
    if [ ! -z "$assessment_id" ]; then
        # Get assessment by ID
        test_endpoint "GET" "$API_BASE/assessments/$assessment_id" 200 "Get assessment by ID"
        
        # Get assessments for member
        test_endpoint "GET" "$API_BASE/members/$member_id/assessments" 200 "Get assessments for member"
        
        # Update assessment
        updated_assessment_data='{
            "member_id": '$member_id',
            "trainer_id": 1,
            "weight": 69.8,
            "height": 175.0,
            "body_fat_percentage": 14.5,
            "bmi": 22.8,
            "assessment_date": "2025-01-15",
            "next_assessment_date": "2025-04-15",
            "notes": "Updated fitness assessment",
            "goals_set": "Continue current training plan"
        }'
        test_endpoint "PUT" "$API_BASE/assessments/$assessment_id" 200 "Update assessment" "$updated_assessment_data"
    fi
fi

# Additional membership tests
print_test_header "ADDITIONAL MEMBERSHIP TESTS"

if [ ! -z "$membership_id" ]; then
    # Toggle membership status
    test_endpoint "PUT" "$API_BASE/memberships/$membership_id/status" 200 "Toggle membership status to inactive" '{"is_active": false}'
    test_endpoint "PUT" "$API_BASE/memberships/$membership_id/status" 200 "Toggle membership status to active" '{"is_active": true}'
    
    # Get benefits for membership (alternative endpoint)
    test_endpoint "GET" "$API_BASE/memberships/$membership_id/benefits" 200 "Get benefits for membership"
fi

# Cleanup tests (DELETE operations)
print_test_header "CLEANUP TESTS (DELETE OPERATIONS)"

# Delete in reverse order of dependencies
if [ ! -z "$member_membership_id" ]; then
    test_endpoint "DELETE" "$API_BASE/member-memberships/$member_membership_id" 200 "Delete member membership"
fi

if [ ! -z "$assessment_id" ]; then
    test_endpoint "DELETE" "$API_BASE/assessments/$assessment_id" 200 "Delete assessment"
fi

if [ ! -z "$benefit_id" ]; then
    test_endpoint "DELETE" "$API_BASE/benefits/$benefit_id" 200 "Delete benefit"
fi

if [ ! -z "$benefit_id2" ]; then
    test_endpoint "DELETE" "$API_BASE/benefits/$benefit_id2" 200 "Delete second benefit"
fi

if [ ! -z "$membership_id" ]; then
    test_endpoint "DELETE" "$API_BASE/memberships/$membership_id" 200 "Delete membership"
fi

if [ ! -z "$membership_id2" ]; then
    test_endpoint "DELETE" "$API_BASE/memberships/$membership_id2" 200 "Delete second membership"
fi

if [ ! -z "$member_id" ]; then
    test_endpoint "DELETE" "$API_BASE/members/$member_id" 200 "Delete member"
fi

if [ ! -z "$member_id2" ]; then
    test_endpoint "DELETE" "$API_BASE/members/$member_id2" 200 "Delete second member"
fi

# Print final results
print_final_results
