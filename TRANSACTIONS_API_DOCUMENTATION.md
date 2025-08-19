# Transactions API Documentation

## Overview
The Transactions API provides comprehensive management capabilities for financial transactions in the Alapay HMO Admin system. This API includes transaction retrieval, search, filtering, and analytics with full Swagger documentation.

## Required Database Setup

### Manual SQL Queries to Run (if needed)
The existing database structure should already support the Transactions API. However, if you encounter any missing columns, run these SQL queries:

```sql
-- Check if transactions table exists and has all required columns
-- If any columns are missing, add them:

-- Add reference column if missing
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS reference VARCHAR(255);

-- Add transaction_type column if missing
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS transaction_type VARCHAR(100);

-- Add metadata column if missing (should be JSONB)
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Add gateway_response column if missing (should be JSONB)
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS gateway_response JSONB;

-- Add fee_amount column if missing
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS fee_amount DECIMAL(10,2) DEFAULT 0;

-- Add currency column if missing
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'NGN';
```

**Note:** Run these SQL queries manually in your database only if you encounter missing column errors. No migrations will be executed automatically.

## API Endpoints

### Base URL
```
http://localhost:6547/api/v1/transactions
```

### Authentication
All endpoints require JWT Bearer token authentication:
```
Authorization: Bearer <your-jwt-token>
```

---

## 1. Fetch All Transactions

### Endpoint
```
GET /api/v1/transactions
```

### Description
Retrieve all transactions with pagination, search, and filtering capabilities.

### Query Parameters
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `search` | string | No | Search term for transaction reference, user name, or email | `TXN001` |
| `status` | enum | No | Filter by transaction status | `completed` |
| `userId` | UUID | No | Filter by user ID | `d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0` |
| `hmoId` | UUID | No | Filter by HMO ID | `d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0` |
| `planId` | UUID | No | Filter by healthcare plan ID | `d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0` |
| `paymentMethod` | string | No | Filter by payment method | `CARD` |
| `minAmount` | number | No | Filter by minimum amount | `1000` |
| `maxAmount` | number | No | Filter by maximum amount | `100000` |
| `startDate` | string | No | Filter by start date (ISO string) | `2024-01-01T00:00:00Z` |
| `endDate` | string | No | Filter by end date (ISO string) | `2024-12-31T23:59:59Z` |
| `year` | number | No | Filter by year | `2024` |
| `month` | number | No | Filter by month (1-12) | `6` |
| `transactionType` | string | No | Filter by transaction type | `subscription` |
| `page` | number | No | Page number (default: 1) | `1` |
| `limit` | number | No | Items per page (default: 10) | `10` |
| `sortBy` | string | No | Sort field (default: createdAt) | `amount` |
| `sortOrder` | enum | No | Sort order ASC/DESC (default: DESC) | `ASC` |

### Example Request
```bash
curl -X GET "http://localhost:6547/api/v1/transactions?page=1&limit=10&status=completed&minAmount=1000&maxAmount=100000" \
  -H "Authorization: Bearer your-jwt-token"
```

### Example Response
```json
{
  "success": true,
  "message": "Transactions retrieved successfully",
  "data": {
    "transactions": [
      {
        "id": "d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0",
        "amount": 50000.00,
        "status": "completed",
        "reference": "TXN001",
        "createdAt": "2024-01-15T10:30:00Z",
        "payments": [
          {
            "id": "payment-id",
            "amount": 50000.00,
            "paymentMethod": "CARD",
            "status": "completed",
            "user": {
              "id": "user-id",
              "firstName": "John",
              "lastName": "Doe",
              "email": "john.doe@example.com"
            },
            "subscriptions": [
              {
                "id": "subscription-id",
                "name": "Premium Plan Subscription",
                "enrolleeNo": "ENR001",
                "plan": {
                  "id": "plan-id",
                  "name": "Premium Health Plan",
                  "coverageType": "Comprehensive"
                }
              }
            ]
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

## 2. Fetch All Transactions by Year

### Endpoint
```
GET /api/v1/transactions/year/{year}
```

### Description
Retrieve all transactions for a specific year with filtering capabilities.

### Path Parameters
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `year` | number | Yes | Year to filter transactions | `2024` |

### Query Parameters
All the same query parameters as the main transactions endpoint are supported.

### Example Request
```bash
curl -X GET "http://localhost:6547/api/v1/transactions/year/2024?status=completed&page=1&limit=10" \
  -H "Authorization: Bearer your-jwt-token"
```

### Example Response
```json
{
  "success": true,
  "message": "Transactions for year 2024 retrieved successfully",
  "data": {
    "year": 2024,
    "transactions": [
      {
        "id": "transaction-id",
        "amount": 50000.00,
        "status": "completed",
        "reference": "TXN001",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

## 3. Search All Transactions

### Endpoint
```
GET /api/v1/transactions/search
```

### Description
Search transactions by reference, user name, or email.

### Query Parameters
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `search` | string | Yes | Search term for transaction reference, user name, or email | `TXN001` |
| `page` | number | No | Page number (default: 1) | `1` |
| `limit` | number | No | Items per page (default: 10) | `10` |

### Example Request
```bash
curl -X GET "http://localhost:6547/api/v1/transactions/search?search=TXN001&page=1&limit=10" \
  -H "Authorization: Bearer your-jwt-token"
```

### Example Response
```json
{
  "success": true,
  "message": "Transaction search completed successfully",
  "data": {
    "searchTerm": "TXN001",
    "transactions": [
      {
        "id": "transaction-id",
        "amount": 50000.00,
        "status": "completed",
        "reference": "TXN001",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

---

## 4. Filter Transactions

### Endpoint
```
GET /api/v1/transactions/filter
```

### Description
Filter transactions by various criteria including status, amount range, date range, etc.

### Query Parameters
All the same query parameters as the main transactions endpoint are supported.

### Example Request
```bash
curl -X GET "http://localhost:6547/api/v1/transactions/filter?status=completed&minAmount=1000&maxAmount=100000&startDate=2024-01-01T00:00:00Z&endDate=2024-12-31T23:59:59Z&page=1&limit=10" \
  -H "Authorization: Bearer your-jwt-token"
```

### Example Response
```json
{
  "success": true,
  "message": "Transactions filtered successfully",
  "data": {
    "filters": {
      "status": "completed",
      "minAmount": 1000,
      "maxAmount": 100000,
      "startDate": "2024-01-01T00:00:00Z",
      "endDate": "2024-12-31T23:59:59Z"
    },
    "transactions": [
      {
        "id": "transaction-id",
        "amount": 50000.00,
        "status": "completed",
        "reference": "TXN001",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

## 5. Get Transaction Statistics

### Endpoint
```
GET /api/v1/transactions/stats
```

### Description
Retrieve comprehensive statistics about all transactions.

### Example Request
```bash
curl -X GET "http://localhost:6547/api/v1/transactions/stats" \
  -H "Authorization: Bearer your-jwt-token"
```

### Example Response
```json
{
  "success": true,
  "message": "Transaction statistics retrieved successfully",
  "data": {
    "totalTransactions": 1000,
    "completedTransactions": 800,
    "pendingTransactions": 150,
    "failedTransactions": 50,
    "totalAmount": 50000000.00,
    "averageAmount": 50000.00,
    "transactionsByStatus": [
      {
        "status": "completed",
        "count": 800,
        "totalAmount": 40000000.00
      },
      {
        "status": "pending",
        "count": 150,
        "totalAmount": 7500000.00
      },
      {
        "status": "failed",
        "count": 50,
        "totalAmount": 2500000.00
      }
    ],
    "transactionsByMonth": [
      {
        "year": 2024,
        "month": 6,
        "count": 100,
        "totalAmount": 5000000.00
      },
      {
        "year": 2024,
        "month": 5,
        "count": 95,
        "totalAmount": 4750000.00
      }
    ]
  }
}
```

---

## 6. Get Transaction Statistics by Year

### Endpoint
```
GET /api/v1/transactions/stats/year/{year}
```

### Description
Retrieve comprehensive statistics about transactions for a specific year.

### Path Parameters
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `year` | number | Yes | Year to get statistics for | `2024` |

### Example Request
```bash
curl -X GET "http://localhost:6547/api/v1/transactions/stats/year/2024" \
  -H "Authorization: Bearer your-jwt-token"
```

### Example Response
```json
{
  "success": true,
  "message": "Transaction statistics for year 2024 retrieved successfully",
  "data": {
    "year": 2024,
    "totalTransactions": 500,
    "completedTransactions": 400,
    "pendingTransactions": 80,
    "totalAmount": 25000000.00,
    "averageAmount": 50000.00,
    "transactionsByMonth": [
      {
        "month": 1,
        "count": 50,
        "totalAmount": 2500000.00
      },
      {
        "month": 2,
        "count": 45,
        "totalAmount": 2250000.00
      }
    ],
    "transactionsByStatus": [
      {
        "status": "completed",
        "count": 400,
        "totalAmount": 20000000.00
      },
      {
        "status": "pending",
        "count": 80,
        "totalAmount": 4000000.00
      },
      {
        "status": "failed",
        "count": 20,
        "totalAmount": 1000000.00
      }
    ]
  }
}
```

---

## 7. Get Transactions by User

### Endpoint
```
GET /api/v1/transactions/user/{userId}
```

### Description
Retrieve all transactions for a specific user.

### Path Parameters
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `userId` | UUID | Yes | User ID | `d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0` |

### Example Request
```bash
curl -X GET "http://localhost:6547/api/v1/transactions/user/d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0" \
  -H "Authorization: Bearer your-jwt-token"
```

### Example Response
```json
{
  "success": true,
  "message": "User transactions retrieved successfully",
  "data": {
    "userId": "d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0",
    "transactions": [
      {
        "id": "transaction-id",
        "amount": 50000.00,
        "status": "completed",
        "reference": "TXN001",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

---

## 8. Get Transactions by HMO

### Endpoint
```
GET /api/v1/transactions/hmo/{hmoId}
```

### Description
Retrieve all transactions for a specific HMO.

### Path Parameters
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `hmoId` | UUID | Yes | HMO ID | `d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0` |

### Example Request
```bash
curl -X GET "http://localhost:6547/api/v1/transactions/hmo/d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0" \
  -H "Authorization: Bearer your-jwt-token"
```

### Example Response
```json
{
  "success": true,
  "message": "HMO transactions retrieved successfully",
  "data": {
    "hmoId": "d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0",
    "transactions": [
      {
        "id": "transaction-id",
        "amount": 50000.00,
        "status": "completed",
        "reference": "TXN001",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

---

## 9. Get Transactions by Plan

### Endpoint
```
GET /api/v1/transactions/plan/{planId}
```

### Description
Retrieve all transactions for a specific healthcare plan.

### Path Parameters
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `planId` | UUID | Yes | Plan ID | `d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0` |

### Example Request
```bash
curl -X GET "http://localhost:6547/api/v1/transactions/plan/d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0" \
  -H "Authorization: Bearer your-jwt-token"
```

### Example Response
```json
{
  "success": true,
  "message": "Plan transactions retrieved successfully",
  "data": {
    "planId": "d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0",
    "transactions": [
      {
        "id": "transaction-id",
        "amount": 50000.00,
        "status": "completed",
        "reference": "TXN001",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

---

## 10. Get Recent Transactions

### Endpoint
```
GET /api/v1/transactions/recent
```

### Description
Retrieve the most recent transactions.

### Example Request
```bash
curl -X GET "http://localhost:6547/api/v1/transactions/recent" \
  -H "Authorization: Bearer your-jwt-token"
```

### Example Response
```json
{
  "success": true,
  "message": "Recent transactions retrieved successfully",
  "data": {
    "transactions": [
      {
        "id": "transaction-id",
        "amount": 50000.00,
        "status": "completed",
        "reference": "TXN001",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

---

## 11. Get High Value Transactions

### Endpoint
```
GET /api/v1/transactions/high-value
```

### Description
Retrieve transactions with amounts above a certain threshold (default: 100,000).

### Example Request
```bash
curl -X GET "http://localhost:6547/api/v1/transactions/high-value" \
  -H "Authorization: Bearer your-jwt-token"
```

### Example Response
```json
{
  "success": true,
  "message": "High value transactions retrieved successfully",
  "data": {
    "minAmount": 100000,
    "transactions": [
      {
        "id": "transaction-id",
        "amount": 150000.00,
        "status": "completed",
        "reference": "TXN001",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

---

## 12. Get Transaction by ID

### Endpoint
```
GET /api/v1/transactions/{id}
```

### Description
Retrieve detailed information about a specific transaction.

### Path Parameters
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `id` | UUID | Yes | Transaction ID | `d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0` |

### Example Request
```bash
curl -X GET "http://localhost:6547/api/v1/transactions/d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0" \
  -H "Authorization: Bearer your-jwt-token"
```

### Example Response
```json
{
  "success": true,
  "message": "Transaction retrieved successfully",
  "data": {
    "id": "d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0",
    "amount": 50000.00,
    "status": "completed",
    "reference": "TXN001",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z",
    "payments": [
      {
        "id": "payment-id",
        "amount": 50000.00,
        "paymentMethod": "CARD",
        "status": "completed",
        "dueDate": "2024-01-15",
        "receiptUrl": "https://receipt.example.com",
        "user": {
          "id": "user-id",
          "firstName": "John",
          "lastName": "Doe",
          "email": "john.doe@example.com",
          "phoneNumber": "+2348012345678"
        },
        "subscriptions": [
          {
            "id": "subscription-id",
            "name": "Premium Plan Subscription",
            "status": "active",
            "enrolleeNo": "ENR001",
            "plan": {
              "id": "plan-id",
              "name": "Premium Health Plan",
              "coverageType": "Comprehensive",
              "pricingStructure": "Monthly"
            }
          }
        ]
      }
    ],
    "dependents": [
      {
        "id": "dependent-id",
        "firstName": "Jane",
        "lastName": "Doe",
        "relationship": "Spouse",
        "enrolleeNo": "ENR002"
      }
    ],
    "hmo": {
      "id": "hmo-id",
      "name": "Premium HMO",
      "email": "info@premiumhmo.com",
      "phoneNumber": "+2348012345678"
    },
    "organization": {
      "id": "org-id",
      "name": "ABC Company",
      "email": "hr@abc.com",
      "phone": "+2348012345678"
    },
    "wallet": {
      "id": "wallet-id",
      "balance": 100000.00,
      "currency": "NGN"
    }
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Validation error or invalid data",
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Transaction not found"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

---

## Swagger Documentation

The API is fully documented with Swagger. Access the interactive documentation at:

```
http://localhost:6547/docs
```

Navigate to the "Transactions" section to see all available endpoints with:
- Request/response schemas
- Parameter descriptions
- Example values
- Try-it-out functionality

---

## Features

### ✅ Implemented Features
- [x] Fetch all transactions with pagination and filtering
- [x] Fetch all transactions by year
- [x] Search all transactions
- [x] Filter transactions by multiple criteria
- [x] Transaction statistics and analytics
- [x] Year-specific transaction statistics
- [x] User-specific transaction listing
- [x] HMO-specific transaction listing
- [x] Plan-specific transaction listing
- [x] Recent transactions listing
- [x] High value transactions listing
- [x] Individual transaction details
- [x] Comprehensive Swagger documentation
- [x] JWT authentication
- [x] Audit logging
- [x] Error handling
- [x] Data validation
- [x] Business logic validation

### 🔒 Security Features
- JWT Bearer token authentication
- Admin guard protection
- Audit logging for all operations
- Data validation and sanitization
- Secure data access patterns

### 📊 Data Relationships
The API handles complex relationships including:
- Transaction → Payments (one-to-many)
- Payment → User (many-to-one)
- Payment → PaymentOption (many-to-one)
- Payment → PlanSubscriptions (one-to-many)
- PlanSubscription → HealthcarePlan (many-to-one)
- User → HMO (many-to-one)
- User → Organization (many-to-one)
- User → Wallet (one-to-one)

### 🔍 Advanced Filtering
- Search by reference, user name, or email
- Filter by status (pending, completed, failed)
- Filter by user, HMO, or plan
- Filter by payment method
- Filter by amount range
- Filter by date range
- Filter by year and month
- Filter by transaction type
- Pagination and sorting

### 📈 Analytics & Statistics
- Overall transaction statistics
- Year-specific statistics
- Monthly breakdowns
- Status-based analytics
- Amount-based analytics
- User-specific analytics
- HMO-specific analytics
- Plan-specific analytics

---

## Testing the API

1. **Start the server:**
   ```bash
   npm run dev
   ```

2. **Access Swagger docs:**
   ```
   http://localhost:6547/docs
   ```

3. **Get authentication token:**
   ```bash
   curl -X POST "http://localhost:6547/api/v1/auth/login" \
     -H "Content-Type: application/json" \
     -d '{"email": "admin@example.com", "password": "password"}'
   ```

4. **Test endpoints using the token:**
   ```bash
   # Get all transactions
   curl -X GET "http://localhost:6547/api/v1/transactions" \
     -H "Authorization: Bearer YOUR_TOKEN_HERE"

   # Get transactions by year
   curl -X GET "http://localhost:6547/api/v1/transactions/year/2024" \
     -H "Authorization: Bearer YOUR_TOKEN_HERE"

   # Search transactions
   curl -X GET "http://localhost:6547/api/v1/transactions/search?search=TXN001" \
     -H "Authorization: Bearer YOUR_TOKEN_HERE"

   # Filter transactions
   curl -X GET "http://localhost:6547/api/v1/transactions/filter?status=completed&minAmount=1000" \
     -H "Authorization: Bearer YOUR_TOKEN_HERE"

   # Get transaction statistics
   curl -X GET "http://localhost:6547/api/v1/transactions/stats" \
     -H "Authorization: Bearer YOUR_TOKEN_HERE"
   ```

---

## Notes

- **No migrations executed** - All database changes must be done manually
- **Comprehensive filtering** - Multiple filter criteria can be combined
- **Advanced analytics** - Detailed statistics and breakdowns
- **Data relationships** - Transactions are linked to payments, users, plans, HMOs, and organizations
- **Audit logging** - All operations are logged for compliance
- **Security** - JWT authentication and admin guard protection
- **Pagination** - All list endpoints support pagination
- **Search capabilities** - Full-text search across multiple fields
- **Year-based filtering** - Specialized endpoints for year-specific data
- **Statistics** - Comprehensive analytics for financial reporting
