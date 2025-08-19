# Plans API Documentation

## Overview
The Plans API provides comprehensive management capabilities for healthcare plans in the Alapay HMO Admin system. This API includes plan creation, retrieval, deletion, and subscriber management with full Swagger documentation.

## Required Database Setup

### Manual SQL Queries to Run (if needed)
The existing database structure should already support the Plans API. However, if you encounter any missing columns, run these SQL queries:

```sql
-- Check if healthcare_plans table exists and has all required columns
-- If any columns are missing, add them:

-- Add minimumUsersRequired column if missing
ALTER TABLE healthcare_plans ADD COLUMN IF NOT EXISTS minimum_users_required INTEGER;

-- Add minimumPremiumRequired column if missing  
ALTER TABLE healthcare_plans ADD COLUMN IF NOT EXISTS minimum_premium_required DECIMAL(10,2);

-- Add planBenefits column if missing (should be JSONB)
ALTER TABLE healthcare_plans ADD COLUMN IF NOT EXISTS plan_benefits JSONB;

-- Add dependentDiscountRate column if missing
ALTER TABLE healthcare_plans ADD COLUMN IF NOT EXISTS dependent_discount_rate FLOAT;

-- Add maxDependents column if missing
ALTER TABLE healthcare_plans ADD COLUMN IF NOT EXISTS max_dependents INTEGER;

-- Add familyPlanAvailable column if missing
ALTER TABLE healthcare_plans ADD COLUMN IF NOT EXISTS family_plan_available BOOLEAN DEFAULT FALSE;
```

**Note:** Run these SQL queries manually in your database only if you encounter missing column errors. No migrations will be executed automatically.

## API Endpoints

### Base URL
```
http://localhost:6547/api/v1/plans
```

### Authentication
All endpoints require JWT Bearer token authentication:
```
Authorization: Bearer <your-jwt-token>
```

---

## 1. Add New Plan

### Endpoint
```
POST /api/v1/plans
```

### Description
Create a new healthcare plan with comprehensive details including benefits, account tiers, and hospitals.

### Request Body
```json
{
  "name": "Premium Health Plan",
  "coverageType": "Comprehensive",
  "pricingStructure": "Monthly",
  "hmoId": "d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0",
  "accountTierIds": ["d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0"],
  "hospitalIds": ["d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0"],
  "familyPlanAvailable": true,
  "dependentDiscountRate": 20,
  "maxDependents": 5,
  "planBenefits": [
    {
      "name": "Doctor Consultation",
      "description": "Unlimited doctor consultations",
      "limit": 100000,
      "percentage": 80
    },
    {
      "name": "Laboratory Tests",
      "description": "Comprehensive lab tests coverage",
      "limit": 50000,
      "percentage": 90
    }
  ],
  "status": "active",
  "minimumUsersRequired": 10,
  "minimumPremiumRequired": 50000.00
}
```

### Example Request
```bash
curl -X POST "http://localhost:6547/api/v1/plans" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Premium Health Plan",
    "coverageType": "Comprehensive",
    "pricingStructure": "Monthly",
    "hmoId": "d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0",
    "accountTierIds": ["d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0"],
    "familyPlanAvailable": true,
    "dependentDiscountRate": 20,
    "maxDependents": 5
  }'
```

### Example Response
```json
{
  "success": true,
  "message": "Healthcare plan created successfully",
  "data": {
    "id": "d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0",
    "name": "Premium Health Plan",
    "coverageType": "Comprehensive",
    "pricingStructure": "Monthly",
    "familyPlanAvailable": true,
    "dependentDiscountRate": 20,
    "maxDependents": 5,
    "status": "active",
    "createdAt": "2024-01-15T10:30:00Z",
    "hmo": {
      "id": "hmo-id",
      "name": "Premium HMO",
      "email": "info@premiumhmo.com",
      "phoneNumber": "+2348012345678"
    },
    "accountTiers": [
      {
        "id": "tier-id",
        "name": "Gold",
        "premium": 50000.00,
        "coverageDetails": "Comprehensive coverage"
      }
    ]
  }
}
```

---

## 2. Fetch Plans

### Endpoint
```
GET /api/v1/plans
```

### Description
Retrieve all healthcare plans with pagination, search, and filtering capabilities.

### Query Parameters
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `search` | string | No | Search term for plan name or coverage type | `premium` |
| `status` | enum | No | Filter by plan status | `active` |
| `hmoId` | UUID | No | Filter by HMO ID | `d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0` |
| `coverageType` | string | No | Filter by coverage type | `Comprehensive` |
| `pricingStructure` | string | No | Filter by pricing structure | `Monthly` |
| `familyPlanAvailable` | boolean | No | Filter by family plan availability | `true` |
| `page` | number | No | Page number (default: 1) | `1` |
| `limit` | number | No | Items per page (default: 10) | `10` |
| `sortBy` | string | No | Sort field (default: createdAt) | `name` |
| `sortOrder` | enum | No | Sort order ASC/DESC (default: DESC) | `ASC` |

### Example Request
```bash
curl -X GET "http://localhost:6547/api/v1/plans?page=1&limit=10&status=active" \
  -H "Authorization: Bearer your-jwt-token"
```

### Example Response
```json
{
  "success": true,
  "message": "Plans retrieved successfully",
  "data": {
    "plans": [
      {
        "id": "d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0",
        "name": "Premium Health Plan",
        "coverageType": "Comprehensive",
        "pricingStructure": "Monthly",
        "familyPlanAvailable": true,
        "status": "active",
        "createdAt": "2024-01-15T10:30:00Z",
        "hmo": {
          "id": "hmo-id",
          "name": "Premium HMO",
          "email": "info@premiumhmo.com",
          "phoneNumber": "+2348012345678"
        },
        "accountTiers": [
          {
            "id": "tier-id",
            "name": "Gold",
            "premium": 50000.00,
            "coverageDetails": "Comprehensive coverage"
          }
        ],
        "hospitals": [
          {
            "id": "hospital-id",
            "name": "General Hospital",
            "address": "123 Main St",
            "phone": "+2348012345678",
            "email": "info@generalhospital.com"
          }
        ]
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

## 3. Get Plan Statistics

### Endpoint
```
GET /api/v1/plans/stats
```

### Description
Retrieve comprehensive statistics about all healthcare plans.

### Example Request
```bash
curl -X GET "http://localhost:6547/api/v1/plans/stats" \
  -H "Authorization: Bearer your-jwt-token"
```

### Example Response
```json
{
  "success": true,
  "message": "Plan statistics retrieved successfully",
  "data": {
    "totalPlans": 50,
    "activePlans": 35,
    "inactivePlans": 15,
    "familyPlans": 20,
    "individualPlans": 30,
    "plansByCoverageType": [
      {
        "coverageType": "Comprehensive",
        "count": 25
      },
      {
        "coverageType": "Basic",
        "count": 15
      },
      {
        "coverageType": "Standard",
        "count": 10
      }
    ],
    "plansByPricingStructure": [
      {
        "pricingStructure": "Monthly",
        "count": 30
      },
      {
        "pricingStructure": "Yearly",
        "count": 15
      },
      {
        "pricingStructure": "Weekly",
        "count": 5
      }
    ]
  }
}
```

---

## 4. Get Plans by HMO

### Endpoint
```
GET /api/v1/plans/hmo/{hmoId}
```

### Description
Retrieve all plans belonging to a specific HMO.

### Path Parameters
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `hmoId` | UUID | Yes | HMO ID | `d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0` |

### Example Request
```bash
curl -X GET "http://localhost:6547/api/v1/plans/hmo/d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0" \
  -H "Authorization: Bearer your-jwt-token"
```

### Example Response
```json
{
  "success": true,
  "message": "HMO plans retrieved successfully",
  "data": {
    "hmoId": "d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0",
    "plans": [
      {
        "id": "plan-id",
        "name": "Premium Health Plan",
        "coverageType": "Comprehensive",
        "status": "active",
        "createdAt": "2024-01-15T10:30:00Z"
      },
      {
        "id": "plan-id-2",
        "name": "Basic Health Plan",
        "coverageType": "Basic",
        "status": "active",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

---

## 5. Get Plan by ID

### Endpoint
```
GET /api/v1/plans/{id}
```

### Description
Retrieve detailed information about a specific healthcare plan.

### Path Parameters
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `id` | UUID | Yes | Plan ID | `d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0` |

### Example Request
```bash
curl -X GET "http://localhost:6547/api/v1/plans/d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0" \
  -H "Authorization: Bearer your-jwt-token"
```

### Example Response
```json
{
  "success": true,
  "message": "Plan retrieved successfully",
  "data": {
    "id": "d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0",
    "name": "Premium Health Plan",
    "coverageType": "Comprehensive",
    "pricingStructure": "Monthly",
    "familyPlanAvailable": true,
    "dependentDiscountRate": 20,
    "maxDependents": 5,
    "planBenefits": [
      {
        "name": "Doctor Consultation",
        "description": "Unlimited doctor consultations",
        "limit": 100000,
        "percentage": 80
      },
      {
        "name": "Laboratory Tests",
        "description": "Comprehensive lab tests coverage",
        "limit": 50000,
        "percentage": 90
      }
    ],
    "status": "active",
    "minimumUsersRequired": 10,
    "minimumPremiumRequired": 50000.00,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z",
    "hmo": {
      "id": "hmo-id",
      "name": "Premium HMO",
      "email": "info@premiumhmo.com",
      "phoneNumber": "+2348012345678"
    },
    "accountTiers": [
      {
        "id": "tier-id",
        "name": "Gold",
        "premium": 50000.00,
        "coverageDetails": "Comprehensive coverage"
      }
    ],
    "hospitals": [
      {
        "id": "hospital-id",
        "name": "General Hospital",
        "address": "123 Main St",
        "phone": "+2348012345678",
        "email": "info@generalhospital.com"
      }
    ],
    "paymentOptions": [
      {
        "id": "option-id",
        "name": "Monthly",
        "duration": "Monthly"
      }
    ],
    "subscriptions": [
      {
        "id": "subscription-id",
        "name": "John Doe Subscription",
        "status": "active",
        "enrolleeNo": "ENR001",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

---

## 6. Fetch Subscribers to Plan

### Endpoint
```
GET /api/v1/plans/{id}/subscribers
```

### Description
Retrieve all subscribers for a specific healthcare plan with pagination and filtering.

### Path Parameters
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `id` | UUID | Yes | Plan ID | `d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0` |

### Query Parameters
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `page` | number | No | Page number (default: 1) | `1` |
| `limit` | number | No | Items per page (default: 10) | `10` |
| `status` | enum | No | Filter by subscription status | `active` |
| `search` | string | No | Search term for subscriber name or enrollee number | `john` |

### Example Request
```bash
curl -X GET "http://localhost:6547/api/v1/plans/d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0/subscribers?page=1&limit=10" \
  -H "Authorization: Bearer your-jwt-token"
```

### Example Response
```json
{
  "success": true,
  "message": "Plan subscribers retrieved successfully",
  "data": {
    "plan": {
      "id": "plan-id",
      "name": "Premium Health Plan",
      "coverageType": "Comprehensive"
    },
    "subscribers": [
      {
        "id": "subscription-id",
        "name": "John Doe Subscription",
        "status": "active",
        "enrolleeNo": "ENR001",
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z",
        "user": {
          "id": "user-id",
          "firstName": "John",
          "lastName": "Doe",
          "email": "john.doe@example.com",
          "phoneNumber": "+2348012345678"
        },
        "dependents": [
          {
            "id": "dependent-id",
            "firstName": "Jane",
            "lastName": "Doe",
            "dob": "1990-01-01",
            "relationship": "spouse",
            "enrolleeNo": "ENR001-DEP001"
          }
        ],
        "payment": {
          "id": "payment-id",
          "amount": 50000.00,
          "status": "completed",
          "type": "subscription"
        },
        "request": [
          {
            "id": "request-id",
            "status": "pending",
            "createdAt": "2024-01-15T10:30:00Z"
          }
        ]
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

## 7. Get Plan Subscriber Statistics

### Endpoint
```
GET /api/v1/plans/{id}/subscribers/stats
```

### Description
Retrieve statistics about subscribers for a specific healthcare plan.

### Path Parameters
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `id` | UUID | Yes | Plan ID | `d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0` |

### Example Request
```bash
curl -X GET "http://localhost:6547/api/v1/plans/d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0/subscribers/stats" \
  -H "Authorization: Bearer your-jwt-token"
```

### Example Response
```json
{
  "success": true,
  "message": "Plan subscriber statistics retrieved successfully",
  "data": {
    "plan": {
      "id": "plan-id",
      "name": "Premium Health Plan"
    },
    "totalSubscribers": 100,
    "activeSubscribers": 85,
    "inactiveSubscribers": 15,
    "totalDependents": 250,
    "averageDependentsPerSubscriber": 2.5
  }
}
```

---

## 8. Delete Plan

### Endpoint
```
DELETE /api/v1/plans/{id}
```

### Description
Soft delete a healthcare plan. Cannot delete plans with active subscriptions.

### Path Parameters
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `id` | UUID | Yes | Plan ID | `d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0` |

### Example Request
```bash
curl -X DELETE "http://localhost:6547/api/v1/plans/d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0" \
  -H "Authorization: Bearer your-jwt-token"
```

### Example Response
```json
{
  "success": true,
  "message": "Plan deleted successfully",
  "data": {
    "id": "d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0",
    "name": "Premium Health Plan",
    "deletedAt": "2024-01-15T10:30:00Z"
  }
}
```

### Error Response (Active Subscriptions)
```json
{
  "statusCode": 400,
  "message": "Cannot delete plan with active subscriptions. Please deactivate all subscriptions first.",
  "error": "Bad Request"
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
  "message": "Plan not found"
}
```

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "A plan with the name \"Premium Health Plan\" already exists for this HMO."
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

Navigate to the "Plans" section to see all available endpoints with:
- Request/response schemas
- Parameter descriptions
- Example values
- Try-it-out functionality

---

## Features

### ✅ Implemented Features
- [x] Add new plan with comprehensive details
- [x] Fetch all plans with pagination and filtering
- [x] Get plan by ID with full details
- [x] Delete plan (soft delete)
- [x] Fetch subscribers to plan
- [x] Plan statistics
- [x] HMO-specific plan listing
- [x] Subscriber statistics per plan
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
- Soft delete to maintain data integrity

### 📊 Data Relationships
The API handles complex relationships including:
- Plan → HMO
- Plan → Account Tiers (many-to-many)
- Plan → Hospitals (many-to-many)
- Plan → Payment Options
- Plan → Subscriptions
- Subscription → User
- Subscription → Dependents
- Subscription → Payment
- Subscription → Pre-Auth Requests

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
   # Create a plan
   curl -X POST "http://localhost:6547/api/v1/plans" \
     -H "Authorization: Bearer YOUR_TOKEN_HERE" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test Plan",
       "coverageType": "Basic",
       "pricingStructure": "Monthly",
       "hmoId": "YOUR_HMO_ID",
       "accountTierIds": ["YOUR_TIER_ID"]
     }'

   # Get all plans
   curl -X GET "http://localhost:6547/api/v1/plans" \
     -H "Authorization: Bearer YOUR_TOKEN_HERE"
   ```

---

## Notes

- **No migrations executed** - All database changes must be done manually
- **Soft delete** - Plans are marked as deleted but not physically removed
- **Business logic** - Cannot delete plans with active subscriptions
- **Validation** - Plan names must be unique within an HMO
- **Relationships** - Plans are linked to HMOs, account tiers, hospitals, and subscribers
- **Audit logging** - All operations are logged for compliance
- **Comprehensive filtering** - Multiple filter criteria can be combined
- **Statistics** - Detailed analytics for plans and subscribers
