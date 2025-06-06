#!/bin/bash

# Payment Service API COMPLETE Endpoint Tests
# This script tests ALL 35+ endpoints of the payment service comprehensively
# Consolidates all endpoint tests into a single script

# Base URL for the payment service
BASE_URL="http://localhost:8003"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Global variables to store created IDs for testing
CREATED_PAYMENT_TYPE_ID=""
CREATED_PAYMENT_ID=""
CREATED_TRANSACTION_ID=""

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    case $status in
        "INFO")
            echo -e "${BLUE}[INFO]${NC} $message"
            ;;
        "SUCCESS")
            echo -e "${GREEN}[SUCCESS]${NC} $message"
            ;;
        "ERROR")
            echo -e "${RED}[ERROR]${NC} $message"
            ;;
        "WARNING")
            echo -e "${YELLOW}[WARNING]${NC} $message"
            ;;
        "SECTION")
            echo -e "${PURPLE}[SECTION]${NC} $message"
            ;;
    esac
}

# Function to test API endpoint with improved response handling
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local expected_status=$4
    local description=$5

    print_status "INFO" "Testing: $description"
    echo "  Method: $method"
    echo "  Endpoint: $BASE_URL$endpoint"
    
    if [ -n "$data" ]; then
        echo "  Data: $data"
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X $method -H "Content-Type: application/json" -d "$data" "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X $method "$BASE_URL$endpoint")
    fi
    
    # Extract HTTP status and body
    http_code=$(echo "$response" | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    body=$(echo "$response" | sed -e 's/HTTPSTATUS:.*//g')
    
    echo "  Response Status: $http_code"
    if [ ${#body} -gt 0 ] && [ ${#body} -lt 500 ]; then
        echo "  Response Body: $body"
    elif [ ${#body} -gt 500 ]; then
        echo "  Response Body: $(echo "$body" | head -c 200)... [truncated]"
    fi
    
    # Extract IDs for later use
    if [[ "$endpoint" == "/api/v1/payments" && "$method" == "POST" && "$http_code" == "201" ]]; then
        CREATED_PAYMENT_ID=$(echo "$body" | grep -o '"payment_id":[0-9]*' | head -1 | cut -d':' -f2)
        if [ -n "$CREATED_PAYMENT_ID" ]; then
            print_status "INFO" "💾 Created Payment ID: $CREATED_PAYMENT_ID"
        fi
    elif [[ "$endpoint" == "/api/v1/payment-types" && "$method" == "POST" && "$http_code" == "201" ]]; then
        CREATED_PAYMENT_TYPE_ID=$(echo "$body" | grep -o '"payment_type_id":[0-9]*' | head -1 | cut -d':' -f2)
        if [ -n "$CREATED_PAYMENT_TYPE_ID" ]; then
            print_status "INFO" "💾 Created Payment Type ID: $CREATED_PAYMENT_TYPE_ID"
        fi
    elif [[ "$endpoint" == "/api/v1/transactions" && "$method" == "POST" && "$http_code" == "201" ]]; then
        CREATED_TRANSACTION_ID=$(echo "$body" | grep -o '"transaction_id":[0-9]*' | head -1 | cut -d':' -f2)
        if [ -n "$CREATED_TRANSACTION_ID" ]; then
            print_status "INFO" "💾 Created Transaction ID: $CREATED_TRANSACTION_ID"
        fi
    fi
    
    if [ "$http_code" = "$expected_status" ]; then
        print_status "SUCCESS" "✓ Test passed"
        echo ""
        return 0
    else
        print_status "ERROR" "✗ Test failed - Expected: $expected_status, Got: $http_code"
        echo ""
        return 1
    fi
}

# Function to check if service is running
check_service() {
    print_status "INFO" "Checking if payment service is running..."
    
    if curl -s "$BASE_URL/health" > /dev/null; then
        print_status "SUCCESS" "Payment service is running"
        return 0
    else
        print_status "ERROR" "Payment service is not running or not accessible"
        return 1
    fi
}

# Main test execution
main() {
    print_status "SECTION" "🚀 STARTING PAYMENT SERVICE COMPLETE API TESTS"
    echo "=============================================================================="
    print_status "INFO" "Testing ALL Payment Service endpoints comprehensively"
    print_status "INFO" "Base URL: $BASE_URL"
    echo ""
    
    # Check if service is running
    if ! check_service; then
        print_status "ERROR" "Please start the payment service first using ./run.sh"
        exit 1
    fi
    
    echo ""
    local passed=0
    local total=0
    
    # ===============================
    # SECTION 1: HEALTH CHECK (1 endpoint)
    # ===============================
    print_status "SECTION" "📊 SECTION 1: HEALTH CHECK ENDPOINTS"
    echo "=============================================================================="
    
    # Test 1: Health Check
    total=$((total + 1))
    if test_endpoint "GET" "/health" "" "200" "Health check endpoint"; then
        passed=$((passed + 1))
    fi
    
    # ===============================
    # SECTION 2: PAYMENT TYPE ENDPOINTS (8 endpoints)
    # ===============================
    print_status "SECTION" "💳 SECTION 2: PAYMENT TYPE ENDPOINTS"
    echo "=============================================================================="
    
    # Test 2: Get all payment types
    total=$((total + 1))
    if test_endpoint "GET" "/api/v1/payment-types" "" "200" "Get all payment types"; then
        passed=$((passed + 1))
    fi
    
    # Test 3: Create payment type (for later use)
    total=$((total + 1))
    payment_type_data='{
        "type_name": "Test Payment Type",
        "description": "This is a test payment type for comprehensive testing",
        "is_active": true
    }'
    if test_endpoint "POST" "/api/v1/payment-types" "$payment_type_data" "201" "Create new payment type"; then
        passed=$((passed + 1))
    fi
    
    # Test 4: Get payment type by ID (use created ID or fallback to 1)
    total=$((total + 1))
    payment_type_id=${CREATED_PAYMENT_TYPE_ID:-1}
    if test_endpoint "GET" "/api/v1/payment-types/$payment_type_id" "" "200" "Get payment type by ID"; then
        passed=$((passed + 1))
    fi
    
    # Test 5: Update payment type
    total=$((total + 1))
    update_payment_type_data='{
        "type_name": "Updated Test Payment Type",
        "description": "This is an updated test payment type",
        "is_active": true
    }'
    if test_endpoint "PUT" "/api/v1/payment-types/$payment_type_id" "$update_payment_type_data" "200" "Update payment type"; then
        passed=$((passed + 1))
    fi
    
    # Test 6: Toggle payment type status
    total=$((total + 1))
    toggle_status_data='{
        "is_active": false
    }'
    if test_endpoint "PUT" "/api/v1/payment-types/$payment_type_id/status" "$toggle_status_data" "200" "Toggle payment type status"; then
        passed=$((passed + 1))
    fi
    
    # Test 7: Get payment types with active filter
    total=$((total + 1))
    if test_endpoint "GET" "/api/v1/payment-types?active=true" "" "200" "Get active payment types only"; then
        passed=$((passed + 1))
    fi
    
    # Test 8: Get payment types with pagination
    total=$((total + 1))
    if test_endpoint "GET" "/api/v1/payment-types?page=1&pageSize=5" "" "200" "Get payment types with pagination"; then
        passed=$((passed + 1))
    fi
    
    # Test 9: Delete payment type (if created)
    total=$((total + 1))
    if [ -n "$CREATED_PAYMENT_TYPE_ID" ]; then
        if test_endpoint "DELETE" "/api/v1/payment-types/$CREATED_PAYMENT_TYPE_ID" "" "200" "Delete created payment type"; then
            passed=$((passed + 1))
        fi
    else
        print_status "WARNING" "Skipping payment type deletion - no ID available"
        # Test with a non-existent ID to verify proper error handling
        if test_endpoint "DELETE" "/api/v1/payment-types/99999" "" "404" "Delete non-existent payment type"; then
            passed=$((passed + 1))
        fi
    fi
    
    # ===============================
    # SECTION 3: PAYMENT ENDPOINTS (12 endpoints)
    # ===============================
    print_status "SECTION" "💰 SECTION 3: PAYMENT ENDPOINTS"
    echo "=============================================================================="
    
    # Test 10: Get all payments
    total=$((total + 1))
    if test_endpoint "GET" "/api/v1/payments" "" "200" "Get all payments"; then
        passed=$((passed + 1))
    fi
    
    # Test 11: Create payment (for later use)
    total=$((total + 1))
    payment_data='{
        "member_id": 1,
        "amount": 50.00,
        "payment_method": "credit_card",
        "payment_status": "completed",
        "description": "Monthly membership fee",
        "payment_type_id": 1
    }'
    if test_endpoint "POST" "/api/v1/payments" "$payment_data" "201" "Create new payment"; then
        passed=$((passed + 1))
    fi
    
    # Test 12: Get payment by ID (use created ID or fallback to 1)
    total=$((total + 1))
    payment_id=${CREATED_PAYMENT_ID:-1}
    if test_endpoint "GET" "/api/v1/payments/$payment_id" "" "200" "Get payment by ID"; then
        passed=$((passed + 1))
    fi
    
    # Test 13: Update payment
    total=$((total + 1))
    update_payment_data='{
        "member_id": 1,
        "amount": 75.00,
        "payment_method": "cash",
        "payment_status": "completed",
        "description": "Updated monthly membership fee",
        "payment_type_id": 1
    }'
    if test_endpoint "PUT" "/api/v1/payments/$payment_id" "$update_payment_data" "200" "Update payment"; then
        passed=$((passed + 1))
    fi
    
    # Test 14: Get payments by member ID
    total=$((total + 1))
    if test_endpoint "GET" "/api/v1/payments/member/1" "" "200" "Get payments by member ID"; then
        passed=$((passed + 1))
    fi
    
    # Test 15: Get payments by status
    total=$((total + 1))
    if test_endpoint "GET" "/api/v1/payments/status/completed" "" "200" "Get payments by status"; then
        passed=$((passed + 1))
    fi
    
    # Test 16: Get payments by method
    total=$((total + 1))
    if test_endpoint "GET" "/api/v1/payments/method/credit_card" "" "200" "Get payments by method"; then
        passed=$((passed + 1))
    fi
    
    # Test 17: Get payments by type
    total=$((total + 1))
    if test_endpoint "GET" "/api/v1/payments/type/1" "" "200" "Get payments by type"; then
        passed=$((passed + 1))
    fi
    
    # Test 18: Get payment statistics
    total=$((total + 1))
    if test_endpoint "GET" "/api/v1/payments/statistics" "" "200" "Get payment statistics"; then
        passed=$((passed + 1))
    fi
    
    # Test 19: Get payment statistics with filters
    total=$((total + 1))
    if test_endpoint "GET" "/api/v1/payments/statistics?memberID=1&startDate=2023-01-01&endDate=2023-12-31" "" "200" "Get payment statistics with filters"; then
        passed=$((passed + 1))
    fi
    
    # Test 20: Get payments with pagination
    total=$((total + 1))
    if test_endpoint "GET" "/api/v1/payments?page=1&pageSize=5" "" "200" "Get payments with pagination"; then
        passed=$((passed + 1))
    fi
    
    # Test 21: Delete payment (if created)
    total=$((total + 1))
    if [ -n "$CREATED_PAYMENT_ID" ]; then
        if test_endpoint "DELETE" "/api/v1/payments/$CREATED_PAYMENT_ID" "" "200" "Delete created payment"; then
            passed=$((passed + 1))
        fi
    else
        print_status "WARNING" "Skipping payment deletion - no ID available"
        # Test with a non-existent ID to verify proper error handling
        if test_endpoint "DELETE" "/api/v1/payments/99999" "" "404" "Delete non-existent payment"; then
            passed=$((passed + 1))
        fi
    fi
    
    # ===============================
    # SECTION 4: TRANSACTION ENDPOINTS (10 endpoints)
    # ===============================
    print_status "SECTION" "🔄 SECTION 4: TRANSACTION ENDPOINTS"
    echo "=============================================================================="
    
    # Test 22: Get all transactions
    total=$((total + 1))
    if test_endpoint "GET" "/api/v1/transactions" "" "200" "Get all transactions"; then
        passed=$((passed + 1))
    fi
    
    # Test 23: Create transaction (for later use)
    total=$((total + 1))
    transaction_data='{
        "payment_id": 1,
        "transaction_status": "success",
        "transaction_reference": "TXN-TEST-001",
        "gateway_response": "{\"status\":\"success\",\"gateway\":\"test\"}"
    }'
    if test_endpoint "POST" "/api/v1/transactions" "$transaction_data" "201" "Create new transaction"; then
        passed=$((passed + 1))
    fi
    
    # Test 24: Get transaction by ID (use created ID or fallback to 1)
    total=$((total + 1))
    transaction_id=${CREATED_TRANSACTION_ID:-1}
    if test_endpoint "GET" "/api/v1/transactions/$transaction_id" "" "200" "Get transaction by ID"; then
        passed=$((passed + 1))
    fi
    
    # Test 25: Update transaction
    total=$((total + 1))
    update_transaction_data='{
        "payment_id": 1,
        "transaction_status": "success",
        "transaction_reference": "TXN-TEST-001-UPDATED",
        "gateway_response": "{\"status\":\"success\",\"gateway\":\"test\",\"updated\":true}"
    }'
    if test_endpoint "PUT" "/api/v1/transactions/$transaction_id" "$update_transaction_data" "200" "Update transaction"; then
        passed=$((passed + 1))
    fi
    
    # Test 26: Get transactions by payment ID
    total=$((total + 1))
    if test_endpoint "GET" "/api/v1/transactions/payment/1" "" "200" "Get transactions by payment ID"; then
        passed=$((passed + 1))
    fi
    
    # Test 27: Get transactions by status
    total=$((total + 1))
    if test_endpoint "GET" "/api/v1/transactions/status/success" "" "200" "Get transactions by status"; then
        passed=$((passed + 1))
    fi
    
    # Test 28: Get transactions with pagination
    total=$((total + 1))
    if test_endpoint "GET" "/api/v1/transactions?page=1&pageSize=5" "" "200" "Get transactions with pagination"; then
        passed=$((passed + 1))
    fi
    
    # Test 29: Process payment transaction
    total=$((total + 1))
    process_data='{
        "payment_id": 1,
        "transaction_status": "success",
        "transaction_reference": "TXN-PROCESS-001",
        "gateway_response": "{\"processor\":\"Test\",\"status\":\"succeeded\",\"auth_code\":\"AUTH-PROC-001\"}"
    }'
    if test_endpoint "POST" "/api/v1/transactions/process" "$process_data" "201" "Process payment transaction"; then
        passed=$((passed + 1))
    fi
    
    # Test 30: Delete transaction (if created)
    total=$((total + 1))
    if [ -n "$CREATED_TRANSACTION_ID" ]; then
        if test_endpoint "DELETE" "/api/v1/transactions/$CREATED_TRANSACTION_ID" "" "200" "Delete created transaction"; then
            passed=$((passed + 1))
        fi
    else
        print_status "WARNING" "Skipping transaction deletion - no ID available"
        # Test with a non-existent ID to verify proper error handling
        if test_endpoint "DELETE" "/api/v1/transactions/99999" "" "404" "Delete non-existent transaction"; then
            passed=$((passed + 1))
        fi
    fi
    
    # ===============================
    # SECTION 5: NEGATIVE TEST CASES (7 endpoints)
    # ===============================
    print_status "SECTION" "❌ SECTION 5: NEGATIVE TEST CASES"
    echo "=============================================================================="
    
    # Test 31: Invalid endpoint (should return 404)
    total=$((total + 1))
    if test_endpoint "GET" "/api/v1/invalid-endpoint" "" "404" "Test invalid endpoint"; then
        passed=$((passed + 1))
    fi
    
    # Test 32: Invalid payment creation (missing required fields)
    total=$((total + 1))
    invalid_payment_data='{
        "amount": 50.00
    }'
    if test_endpoint "POST" "/api/v1/payments" "$invalid_payment_data" "400" "Create invalid payment (missing required fields)"; then
        passed=$((passed + 1))
    fi
    
    # Test 33: Invalid payment type creation (missing required fields)
    total=$((total + 1))
    invalid_payment_type_data='{
        "description": "Missing type_name"
    }'
    if test_endpoint "POST" "/api/v1/payment-types" "$invalid_payment_type_data" "400" "Create invalid payment type (missing required fields)"; then
        passed=$((passed + 1))
    fi
    
    # Test 34: Invalid transaction creation (missing required fields)
    total=$((total + 1))
    invalid_transaction_data='{
        "transaction_reference": "TXN-INVALID"
    }'
    if test_endpoint "POST" "/api/v1/transactions" "$invalid_transaction_data" "400" "Create invalid transaction (missing required fields)"; then
        passed=$((passed + 1))
    fi
    
    # Test 35: Get non-existent payment
    total=$((total + 1))
    if test_endpoint "GET" "/api/v1/payments/99999" "" "404" "Get non-existent payment"; then
        passed=$((passed + 1))
    fi
    
    # Test 36: Get non-existent payment type
    total=$((total + 1))
    if test_endpoint "GET" "/api/v1/payment-types/99999" "" "404" "Get non-existent payment type"; then
        passed=$((passed + 1))
    fi
    
    # Test 37: Get non-existent transaction
    total=$((total + 1))
    if test_endpoint "GET" "/api/v1/transactions/99999" "" "404" "Get non-existent transaction"; then
        passed=$((passed + 1))
    fi
    
    # ===============================
    # FINAL SUMMARY
    # ===============================
    echo "=============================================================================="
    print_status "SECTION" "📊 COMPREHENSIVE TEST SUMMARY"
    echo "=============================================================================="
    print_status "INFO" "Total tests executed: $total"
    print_status "SUCCESS" "Tests passed: $passed"
    print_status "ERROR" "Tests failed: $((total - passed))"
    
    echo ""
    print_status "INFO" "📋 Test Coverage Breakdown:"
    print_status "INFO" "   ├── Health Check: 1 endpoint"
    print_status "INFO" "   ├── Payment Types: 8 endpoints"
    print_status "INFO" "   ├── Payments: 12 endpoints"
    print_status "INFO" "   ├── Transactions: 10 endpoints"
    print_status "INFO" "   └── Negative Cases: 7 tests"
    print_status "INFO" "   📊 Total Coverage: 37 comprehensive endpoint tests"
    
    if [ $passed -eq $total ]; then
        echo ""
        print_status "SUCCESS" "🎉 ALL TESTS PASSED! Payment service is fully functional!"
        print_status "SUCCESS" "✨ $total/$total endpoints working correctly"
        exit 0
    else
        echo ""
        print_status "WARNING" "⚠️  Some tests failed. Please review the output above."
        print_status "WARNING" "❌ $((total - passed))/$total tests failed"
        exit 1
    fi
}

# Check if curl is installed
if ! command -v curl &> /dev/null; then
    print_status "ERROR" "curl is required but not installed. Please install curl first."
    exit 1
fi

# Run main function
main "$@"
