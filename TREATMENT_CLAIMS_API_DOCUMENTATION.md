# Treatment Claims API Documentation

## Overview
The Treatment Claims API provides comprehensive management capabilities for medical treatment claims in the Alapay HMO Admin system. This API includes claim retrieval, search, filtering, export, approval/decline workflows, and analytics with full Swagger documentation.

## Required Database Setup

### Manual SQL Queries to Run (if needed)
The existing database structure should already support the Treatment Claims API. However, if you encounter any missing columns, run these SQL queries:

```sql
-- Check if claims table exists and has all required columns
-- If any columns are missing, add them:

-- Add rejection_reason column if missing
ALTER TABLE claims ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Add metadata column if missing (should be JSONB)
ALTER TABLE claims ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Add documents column if missing (should be JSONB)
ALTER TABLE claims ADD COLUMN IF NOT EXISTS documents JSONB;

-- Add provider_reference column if missing
ALTER TABLE claims ADD COLUMN IF NOT EXISTS provider_reference VARCHAR(255);

-- Add service_date column if missing
ALTER TABLE claims ADD COLUMN IF NOT EXISTS service_date DATE;

-- Add amount column if missing (should be DECIMAL)
ALTER TABLE claims ADD COLUMN IF NOT EXISTS amount DECIMAL(10,2);

-- Add type column if missing (should be ENUM)
ALTER TABLE claims ADD COLUMN IF NOT EXISTS type VARCHAR(50);

-- Add status column if missing (should be ENUM)
ALTER TABLE claims ADD COLUMN IF NOT EXISTS status VARCHAR(50);

-- Add description column if missing
ALTER TABLE claims ADD COLUMN IF NOT EXISTS description TEXT;

-- Add details column if missing
ALTER TABLE claims ADD COLUMN IF NOT EXISTS details TEXT;
```

**Note:** Run these SQL queries manually in your database only if you encounter missing column errors. No migrations will be executed automatically.

## API Endpoints

### Base URL
```
http://localhost:6547/api/v1/treatment-claims
```

### Authentication
All endpoints require JWT Bearer token authentication:
```
Authorization: Bearer <your-jwt-token>
```

---

## 1. Fetch All Treatment Claims

### Endpoint
```
GET /api/v1/treatment-claims
```

### Description
Retrieve all treatment claims with pagination, search, and filtering capabilities.

### Query Parameters
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `search` | string | No | Search term for claim reference, user name, or hospital name | `CLM001` |
| `status` | enum | No | Filter by claim status | `pending` |
| `type` | enum | No | Filter by claim type | `medical` |
| `userId` | UUID | No | Filter by user ID | `d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0` |
| `hmoId` | UUID | No | Filter by HMO ID | `d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0` |
| `hospitalId` | UUID | No | Filter by hospital ID | `d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0` |
| `planId` | UUID | No | Filter by healthcare plan ID | `d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0` |
| `minAmount` | number | No | Filter by minimum amount | `1000` |
| `maxAmount` | number | No | Filter by maximum amount | `100000` |
| `startDate` | string | No | Filter by start date (ISO string) | `2024-01-01T00:00:00Z` |
| `endDate` | string | No | Filter by end date (ISO string) | `2024-12-31T23:59:59Z` |
| `year` | number | No | Filter by year | `2024` |
| `month` | number | No | Filter by month (1-12) | `6` |
| `paymentStatus` | enum | No | Filter by payment status | `pending` |
| `authorizationCode` | string | No | Filter by authorization code | `AUTH001` |
| `providerReference` | string | No | Filter by provider reference | `PROV001` |
| `enrolleeNo` | string | No | Filter by enrollee number | `ENR001` |
| `claimReference` | string | No | Filter by claim reference | `CLM001` |
| `diagnosis` | string | No | Filter by diagnosis | `Hypertension` |
| `page` | number | No | Page number (default: 1) | `1` |
| `limit` | number | No | Items per page (default: 10) | `10` |
| `sortBy` | string | No | Sort field (default: createdAt) | `amount` |
| `sortOrder` | enum | No | Sort order ASC/DESC (default: DESC) | `ASC` |

### Example Request
```bash
curl -X GET "http://localhost:6547/api/v1/treatment-claims?page=1&limit=10&status=pending&minAmount=1000&maxAmount=100000" \
  -H "Authorization: Bearer your-jwt-token"
```

### Example Response
```json
{
  "success": true,
  "message": "Treatment claims retrieved successfully",
  "data": {
    "claims": [
      {
        "id": "d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0",
        "type": "medical",
        "description": "Annual medical checkup",
        "amount": 50000.00,
        "status": "pending",
        "serviceDate": "2024-01-15",
        "providerReference": "REF123456",
        "createdAt": "2024-01-15T10:30:00Z",
        "user": {
          "id": "user-id",
          "firstName": "John",
          "lastName": "Doe",
          "email": "john.doe@example.com"
        },
        "hospital": {
          "id": "hospital-id",
          "name": "City General Hospital",
          "address": "123 Healthcare Avenue"
        },
        "plan": {
          "id": "plan-id",
          "name": "Premium Health Plan",
          "coverageType": "Comprehensive"
        }
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

## 2. Fetch All Treatment Claims by Year

### Endpoint
```
GET /api/v1/treatment-claims/year/{year}
```

### Description
Retrieve all treatment claims for a specific year with filtering capabilities.

### Path Parameters
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `year` | number | Yes | Year to filter treatment claims | `2024` |

### Query Parameters
All the same query parameters as the main treatment claims endpoint are supported.

### Example Request
```bash
curl -X GET "http://localhost:6547/api/v1/treatment-claims/year/2024?status=pending&page=1&limit=10" \
  -H "Authorization: Bearer your-jwt-token"
```

### Example Response
```json
{
  "success": true,
  "message": "Treatment claims for year 2024 retrieved successfully",
  "data": {
    "year": 2024,
    "claims": [
      {
        "id": "claim-id",
        "type": "medical",
        "description": "Annual medical checkup",
        "amount": 50000.00,
        "status": "pending",
        "serviceDate": "2024-01-15",
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

## 3. Filter and Export Treatment Claims

### Endpoint
```
GET /api/v1/treatment-claims/filter-export
```

### Description
Filter treatment claims and prepare export in various formats (CSV, Excel, PDF).

### Query Parameters
All the same query parameters as the main treatment claims endpoint are supported, plus:

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `exportFormat` | enum | No | Export format (csv, excel, pdf) | `csv` |

### Example Request
```bash
curl -X GET "http://localhost:6547/api/v1/treatment-claims/filter-export?status=pending&minAmount=1000&maxAmount=100000&exportFormat=csv" \
  -H "Authorization: Bearer your-jwt-token"
```

### Example Response
```json
{
  "success": true,
  "message": "Treatment claims filtered and export prepared successfully",
  "data": {
    "filters": {
      "status": "pending",
      "minAmount": 1000,
      "maxAmount": 100000
    },
    "claims": [
      {
        "id": "claim-id",
        "type": "medical",
        "description": "Annual medical checkup",
        "amount": 50000.00,
        "status": "pending"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3,
      "hasNext": true,
      "hasPrev": false
    },
    "export": {
      "format": "csv",
      "filename": "treatment-claims-2024-01-15.csv",
      "data": {
        "headers": ["ID", "Type", "Description", "Amount", "Status", "Service Date", "User", "Hospital", "Plan"],
        "rows": [
          ["claim-id", "medical", "Annual medical checkup", "50000.00", "pending", "2024-01-15", "John Doe", "City General Hospital", "Premium Health Plan"]
        ],
        "content": "ID,Type,Description,Amount,Status,Service Date,User,Hospital,Plan\nclaim-id,medical,Annual medical checkup,50000.00,pending,2024-01-15,John Doe,City General Hospital,Premium Health Plan"
      }
    }
  }
}
```

---

## 4. View Treatment Claim by ID

### Endpoint
```
GET /api/v1/treatment-claims/{id}
```

### Description
Retrieve detailed information about a specific treatment claim.

### Path Parameters
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `id` | UUID | Yes | Treatment claim ID | `d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0` |

### Example Request
```bash
curl -X GET "http://localhost:6547/api/v1/treatment-claims/d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0" \
  -H "Authorization: Bearer your-jwt-token"
```

### Example Response
```json
{
  "success": true,
  "message": "Treatment claim retrieved successfully",
  "data": {
    "id": "d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0",
    "type": "medical",
    "description": "Annual medical checkup",
    "amount": 50000.00,
    "status": "pending",
    "serviceDate": "2024-01-15",
    "providerReference": "REF123456",
    "rejectionReason": null,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z",
    "user": {
      "id": "user-id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phoneNumber": "+2348012345678"
    },
    "plan": {
      "id": "plan-id",
      "name": "Premium Health Plan",
      "coverageType": "Comprehensive",
      "pricingStructure": "Monthly"
    },
    "hospital": {
      "id": "hospital-id",
      "name": "City General Hospital",
      "address": "123 Healthcare Avenue",
      "phone": "+2348012345678",
      "email": "info@citygeneral.com"
    },
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
    },
    "notes": [
      {
        "id": "note-id",
        "note": "Claim under review",
        "timestamp": "2024-01-15T10:30:00Z",
        "user": {
          "id": "user-id",
          "firstName": "Admin",
          "lastName": "User"
        }
      }
    ],
    "documents": {
      "medicalReport": "https://example.com/medical-report.pdf",
      "prescription": "https://example.com/prescription.pdf"
    },
    "metadata": {
      "claimCategory": "routine",
      "priority": "normal"
    }
  }
}
```

---

## 5. Approve/Decline Payment Refund

### Endpoint
```
POST /api/v1/treatment-claims/{id}/approve-decline
```

### Description
Approve or decline a treatment claim with optional reason and amount adjustment.

### Path Parameters
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `id` | UUID | Yes | Treatment claim ID | `d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0` |

### Request Body
```json
{
  "action": "approve",
  "reason": "Claim approved after review of medical documents",
  "approvedAmount": 45000.00,
  "notes": "Partial approval due to some services not covered",
  "status": "approved"
}
```

### Request Body Parameters
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `action` | enum | Yes | Action to perform (approve/decline) | `approve` |
| `reason` | string | No | Reason for approval or rejection | `Claim approved after review` |
| `approvedAmount` | number | No | Approved amount (if different from claimed) | `45000.00` |
| `notes` | string | No | Additional notes or comments | `Partial approval due to...` |
| `status` | enum | No | New status for the claim | `approved` |

### Example Request
```bash
curl -X POST "http://localhost:6547/api/v1/treatment-claims/d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0/approve-decline" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "approve",
    "reason": "Claim approved after review of medical documents",
    "approvedAmount": 45000.00,
    "notes": "Partial approval due to some services not covered"
  }'
```

### Example Response
```json
{
  "success": true,
  "message": "Treatment claim approved successfully",
  "data": {
    "id": "d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0",
    "status": "approved",
    "action": "approve",
    "reason": "Claim approved after review of medical documents",
    "approvedAmount": 45000.00,
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

---

## 6. Get Treatment Claim Statistics

### Endpoint
```
GET /api/v1/treatment-claims/stats
```

### Description
Retrieve comprehensive statistics about all treatment claims.

### Example Request
```bash
curl -X GET "http://localhost:6547/api/v1/treatment-claims/stats" \
  -H "Authorization: Bearer your-jwt-token"
```

### Example Response
```json
{
  "success": true,
  "message": "Treatment claim statistics retrieved successfully",
  "data": {
    "totalClaims": 1000,
    "pendingClaims": 200,
    "approvedClaims": 700,
    "rejectedClaims": 100,
    "totalAmount": 50000000.00,
    "averageAmount": 50000.00,
    "claimsByStatus": [
      {
        "status": "pending",
        "count": 200,
        "totalAmount": 10000000.00
      },
      {
        "status": "approved",
        "count": 700,
        "totalAmount": 35000000.00
      },
      {
        "status": "rejected",
        "count": 100,
        "totalAmount": 5000000.00
      }
    ],
    "claimsByType": [
      {
        "type": "medical",
        "count": 800,
        "totalAmount": 40000000.00
      },
      {
        "type": "dental",
        "count": 150,
        "totalAmount": 7500000.00
      },
      {
        "type": "optical",
        "count": 50,
        "totalAmount": 2500000.00
      }
    ],
    "claimsByMonth": [
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

## 7. Get Treatment Claim Statistics by Year

### Endpoint
```
GET /api/v1/treatment-claims/stats/year/{year}
```

### Description
Retrieve comprehensive statistics about treatment claims for a specific year.

### Path Parameters
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `year` | number | Yes | Year to get statistics for | `2024` |

### Example Request
```bash
curl -X GET "http://localhost:6547/api/v1/treatment-claims/stats/year/2024" \
  -H "Authorization: Bearer your-jwt-token"
```

### Example Response
```json
{
  "success": true,
  "message": "Treatment claim statistics for year 2024 retrieved successfully",
  "data": {
    "year": 2024,
    "totalClaims": 500,
    "pendingClaims": 100,
    "approvedClaims": 350,
    "rejectedClaims": 50,
    "totalAmount": 25000000.00,
    "averageAmount": 50000.00,
    "claimsByMonth": [
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
    "claimsByStatus": [
      {
        "status": "pending",
        "count": 100,
        "totalAmount": 5000000.00
      },
      {
        "status": "approved",
        "count": 350,
        "totalAmount": 17500000.00
      },
      {
        "status": "rejected",
        "count": 50,
        "totalAmount": 2500000.00
      }
    ]
  }
}
```

---

## Additional Endpoints

### Get Treatment Claims by User
```
GET /api/v1/treatment-claims/user/{userId}
```

### Get Treatment Claims by HMO
```
GET /api/v1/treatment-claims/hmo/{hmoId}
```

### Get Treatment Claims by Hospital
```
GET /api/v1/treatment-claims/hospital/{hospitalId}
```

### Get Recent Treatment Claims
```
GET /api/v1/treatment-claims/recent
```

### Get High Value Treatment Claims
```
GET /api/v1/treatment-claims/high-value
```

### Get Pending Treatment Claims
```
GET /api/v1/treatment-claims/pending
```

### Get Approved Treatment Claims
```
GET /api/v1/treatment-claims/approved
```

### Get Rejected Treatment Claims
```
GET /api/v1/treatment-claims/rejected
```

---

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Only pending claims can be approved or declined",
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
  "message": "Treatment claim not found"
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

Navigate to the "Treatment Claims" section to see all available endpoints with:
- Request/response schemas
- Parameter descriptions
- Example values
- Try-it-out functionality

---

## Features

### ✅ Implemented Features
- [x] Fetch all treatment claims with pagination and filtering
- [x] Fetch all treatment claims by year
- [x] Filter and export treatment claims (CSV, Excel, PDF)
- [x] View treatment claims by ID with detailed information
- [x] Approve/decline payment refund with reason and amount adjustment
- [x] Treatment claim statistics and analytics
- [x] Year-specific treatment claim statistics
- [x] User-specific treatment claim listing
- [x] HMO-specific treatment claim listing
- [x] Hospital-specific treatment claim listing
- [x] Recent treatment claims listing
- [x] High value treatment claims listing
- [x] Status-based treatment claim listing (pending, approved, rejected)
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
- Claim → User (many-to-one)
- Claim → HealthcarePlan (many-to-one)
- Claim → Hospital (many-to-one)
- User → HMO (many-to-one)
- User → Organization (many-to-one)
- User → Wallet (one-to-one)
- Claim → Notes (one-to-many)
- Note → User (many-to-one)

### 🔍 Advanced Filtering
- Search by reference, user name, or hospital name
- Filter by status (pending, approved, rejected)
- Filter by type (medical, dental, optical, etc.)
- Filter by user, HMO, hospital, or plan
- Filter by amount range
- Filter by date range
- Filter by year and month
- Filter by payment status
- Filter by authorization code
- Filter by provider reference
- Filter by enrollee number
- Filter by claim reference
- Filter by diagnosis
- Pagination and sorting

### 📈 Analytics & Statistics
- Overall treatment claim statistics
- Year-specific statistics
- Monthly breakdowns
- Status-based analytics
- Type-based analytics
- Amount-based analytics
- User-specific analytics
- HMO-specific analytics
- Hospital-specific analytics

### 📋 Export Capabilities
- CSV export with customizable headers
- Excel export with multiple sheets
- PDF export with formatted reports
- Configurable export data structure
- Automatic filename generation

### ✅ Approval Workflow
- Approve claims with optional amount adjustment
- Decline claims with reason
- Status tracking and updates
- Audit trail for all actions
- Business rule validation (only pending claims can be processed)

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
   # Get all treatment claims
   curl -X GET "http://localhost:6547/api/v1/treatment-claims" \
     -H "Authorization: Bearer YOUR_TOKEN_HERE"

   # Get treatment claims by year
   curl -X GET "http://localhost:6547/api/v1/treatment-claims/year/2024" \
     -H "Authorization: Bearer YOUR_TOKEN_HERE"

   # Filter and export treatment claims
   curl -X GET "http://localhost:6547/api/v1/treatment-claims/filter-export?status=pending&exportFormat=csv" \
     -H "Authorization: Bearer YOUR_TOKEN_HERE"

   # Get treatment claim by ID
   curl -X GET "http://localhost:6547/api/v1/treatment-claims/YOUR_CLAIM_ID" \
     -H "Authorization: Bearer YOUR_TOKEN_HERE"

   # Approve a treatment claim
   curl -X POST "http://localhost:6547/api/v1/treatment-claims/YOUR_CLAIM_ID/approve-decline" \
     -H "Authorization: Bearer YOUR_TOKEN_HERE" \
     -H "Content-Type: application/json" \
     -d '{
       "action": "approve",
       "reason": "Claim approved after review",
       "approvedAmount": 45000.00
     }'

   # Get treatment claim statistics
   curl -X GET "http://localhost:6547/api/v1/treatment-claims/stats" \
     -H "Authorization: Bearer YOUR_TOKEN_HERE"
   ```

---

## Notes

- **No migrations executed** - All database changes must be done manually
- **Comprehensive filtering** - Multiple filter criteria can be combined
- **Advanced analytics** - Detailed statistics and breakdowns
- **Export capabilities** - Multiple format support (CSV, Excel, PDF)
- **Approval workflow** - Complete claim processing with audit trail
- **Data relationships** - Treatment claims are linked to users, plans, hospitals, HMOs, and organizations
- **Audit logging** - All operations are logged for compliance
- **Security** - JWT authentication and admin guard protection
- **Pagination** - All list endpoints support pagination
- **Search capabilities** - Full-text search across multiple fields
- **Year-based filtering** - Specialized endpoints for year-specific data
- **Statistics** - Comprehensive analytics for financial reporting
- **Business rules** - Only pending claims can be approved/declined
- **Amount adjustment** - Support for partial approvals with different amounts
