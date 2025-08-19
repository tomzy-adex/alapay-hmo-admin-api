# Healthcare Providers (HCP) API Documentation

## Overview
The Healthcare Providers API provides comprehensive management capabilities for healthcare providers (hospitals, clinics, diagnostic centers, etc.) in the Alapay HMO Admin system. This API includes HCP creation, retrieval, updating, deletion, and filtering with full Swagger documentation.

## Required Database Setup

### Manual SQL Queries to Run (if needed)
The existing database structure should already support the Healthcare Providers API. However, if you encounter any missing columns, run these SQL queries:

```sql
-- Check if hospitals table exists and has all required columns
-- If any columns are missing, add them:

-- Add facilityType column if missing
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS facility_type VARCHAR(255);

-- Add bedCount column if missing
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS bed_count INTEGER;

-- Add operatingHours column if missing
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS operating_hours VARCHAR(255);

-- Add specialties column if missing (should be JSONB)
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS specialties JSONB;

-- Add metadata column if missing (should be JSONB)
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Add secondaryPhone column if missing
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS secondary_phone VARCHAR(255);

-- Add website column if missing
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS website VARCHAR(255);
```

**Note:** Run these SQL queries manually in your database only if you encounter missing column errors. No migrations will be executed automatically.

## API Endpoints

### Base URL
```
http://localhost:6547/api/v1/healthcare-providers
```

### Authentication
All endpoints require JWT Bearer token authentication:
```
Authorization: Bearer <your-jwt-token>
```

---

## 1. Add New HCP

### Endpoint
```
POST /api/v1/healthcare-providers
```

### Description
Create a new healthcare provider with comprehensive details including contact info, facility info, and affiliations.

### Request Body
```json
{
  "name": "City General Hospital",
  "address": "123 Healthcare Avenue, Medical District, Lagos",
  "contactInfo": {
    "email": "contact@citygeneral.com",
    "phone": "+2348012345678",
    "secondaryPhone": "+2348012345679",
    "website": "https://www.citygeneral.com"
  },
  "facilityInfo": {
    "facilityType": "General Hospital",
    "bedCount": 100,
    "operatingHours": "24/7",
    "specialties": ["Cardiology", "Orthopedics", "Pediatrics", "Emergency Medicine"]
  },
  "planIds": ["d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0"],
  "hmoIds": ["d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0"],
  "emergencyServiceProvider": true,
  "status": "pending",
  "accountStatus": "dormant",
  "verificationComments": "Provider verified and approved",
  "metadata": {
    "accreditation": "JCI Accredited",
    "yearEstablished": 1995,
    "ownership": "Private"
  }
}
```

### Example Request
```bash
curl -X POST "http://localhost:6547/api/v1/healthcare-providers" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "City General Hospital",
    "address": "123 Healthcare Avenue, Medical District, Lagos",
    "contactInfo": {
      "email": "contact@citygeneral.com",
      "phone": "+2348012345678"
    },
    "facilityInfo": {
      "facilityType": "General Hospital",
      "bedCount": 100,
      "operatingHours": "24/7",
      "specialties": ["Cardiology", "Orthopedics", "Pediatrics"]
    },
    "planIds": ["d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0"],
    "emergencyServiceProvider": true
  }'
```

### Example Response
```json
{
  "success": true,
  "message": "Healthcare provider created successfully",
  "data": {
    "id": "d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0",
    "name": "City General Hospital",
    "address": "123 Healthcare Avenue, Medical District, Lagos",
    "email": "contact@citygeneral.com",
    "phone": "+2348012345678",
    "emergencyServiceProvider": true,
    "status": "pending",
    "createdAt": "2024-01-15T10:30:00Z",
    "plans": [
      {
        "id": "plan-id",
        "name": "Premium Health Plan",
        "coverageType": "Comprehensive"
      }
    ],
    "hmos": [
      {
        "id": "hmo-id",
        "name": "Premium HMO",
        "email": "info@premiumhmo.com"
      }
    ]
  }
}
```

---

## 2. Fetch HCP

### Endpoint
```
GET /api/v1/healthcare-providers
```

### Description
Retrieve all healthcare providers with pagination, search, and filtering capabilities.

### Query Parameters
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `search` | string | No | Search term for HCP name, address, or contact info | `general hospital` |
| `status` | enum | No | Filter by HCP status | `approved` |
| `accountStatus` | enum | No | Filter by account status | `active` |
| `hmoId` | UUID | No | Filter by HMO ID | `d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0` |
| `planId` | UUID | No | Filter by healthcare plan ID | `d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0` |
| `facilityType` | string | No | Filter by facility type | `General Hospital` |
| `emergencyServiceProvider` | boolean | No | Filter by emergency service availability | `true` |
| `specialty` | string | No | Filter by specialty | `Cardiology` |
| `location` | string | No | Filter by location/area | `Lagos` |
| `page` | number | No | Page number (default: 1) | `1` |
| `limit` | number | No | Items per page (default: 10) | `10` |
| `sortBy` | string | No | Sort field (default: createdAt) | `name` |
| `sortOrder` | enum | No | Sort order ASC/DESC (default: DESC) | `ASC` |

### Example Request
```bash
curl -X GET "http://localhost:6547/api/v1/healthcare-providers?page=1&limit=10&status=approved&emergencyServiceProvider=true" \
  -H "Authorization: Bearer your-jwt-token"
```

### Example Response
```json
{
  "success": true,
  "message": "Healthcare providers retrieved successfully",
  "data": {
    "hcps": [
      {
        "id": "d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0",
        "name": "City General Hospital",
        "address": "123 Healthcare Avenue, Medical District, Lagos",
        "email": "contact@citygeneral.com",
        "phone": "+2348012345678",
        "emergencyServiceProvider": true,
        "status": "approved",
        "accountStatus": "active",
        "createdAt": "2024-01-15T10:30:00Z",
        "plans": [
          {
            "id": "plan-id",
            "name": "Premium Health Plan",
            "coverageType": "Comprehensive"
          }
        ],
        "hmos": [
          {
            "id": "hmo-id",
            "name": "Premium HMO",
            "email": "info@premiumhmo.com"
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

## 3. Get HCP Statistics

### Endpoint
```
GET /api/v1/healthcare-providers/stats
```

### Description
Retrieve comprehensive statistics about all healthcare providers.

### Example Request
```bash
curl -X GET "http://localhost:6547/api/v1/healthcare-providers/stats" \
  -H "Authorization: Bearer your-jwt-token"
```

### Example Response
```json
{
  "success": true,
  "message": "Healthcare provider statistics retrieved successfully",
  "data": {
    "totalHcps": 100,
    "activeHcps": 75,
    "inactiveHcps": 25,
    "approvedHcps": 80,
    "pendingHcps": 20,
    "emergencyProviders": 30,
    "nonEmergencyProviders": 70,
    "hcpsByType": [
      {
        "facilityType": "General Hospital",
        "count": 40
      },
      {
        "facilityType": "Clinic",
        "count": 30
      },
      {
        "facilityType": "Diagnostic Center",
        "count": 20
      }
    ],
    "hcpsByStatus": [
      {
        "status": "approved",
        "count": 80
      },
      {
        "status": "pending",
        "count": 15
      },
      {
        "status": "rejected",
        "count": 5
      }
    ]
  }
}
```

---

## 4. Get Emergency Providers

### Endpoint
```
GET /api/v1/healthcare-providers/emergency
```

### Description
Retrieve all healthcare providers that offer emergency services.

### Example Request
```bash
curl -X GET "http://localhost:6547/api/v1/healthcare-providers/emergency" \
  -H "Authorization: Bearer your-jwt-token"
```

### Example Response
```json
{
  "success": true,
  "message": "Emergency healthcare providers retrieved successfully",
  "data": {
    "hcps": [
      {
        "id": "hcp-id",
        "name": "Emergency Medical Center",
        "address": "456 Emergency Lane",
        "email": "emergency@emc.com",
        "phone": "+2348012345678",
        "emergencyServiceProvider": true
      }
    ]
  }
}
```

---

## 5. Get HCPs by HMO

### Endpoint
```
GET /api/v1/healthcare-providers/hmo/{hmoId}
```

### Description
Retrieve all healthcare providers affiliated with a specific HMO.

### Path Parameters
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `hmoId` | UUID | Yes | HMO ID | `d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0` |

### Example Request
```bash
curl -X GET "http://localhost:6547/api/v1/healthcare-providers/hmo/d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0" \
  -H "Authorization: Bearer your-jwt-token"
```

### Example Response
```json
{
  "success": true,
  "message": "HMO healthcare providers retrieved successfully",
  "data": {
    "hmoId": "d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0",
    "hcps": [
      {
        "id": "hcp-id",
        "name": "City General Hospital",
        "address": "123 Healthcare Avenue",
        "email": "contact@citygeneral.com",
        "phone": "+2348012345678",
        "status": "approved"
      }
    ]
  }
}
```

---

## 6. Get HCPs by Plan

### Endpoint
```
GET /api/v1/healthcare-providers/plan/{planId}
```

### Description
Retrieve all healthcare providers that accept a specific healthcare plan.

### Path Parameters
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `planId` | UUID | Yes | Plan ID | `d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0` |

### Example Request
```bash
curl -X GET "http://localhost:6547/api/v1/healthcare-providers/plan/d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0" \
  -H "Authorization: Bearer your-jwt-token"
```

### Example Response
```json
{
  "success": true,
  "message": "Plan healthcare providers retrieved successfully",
  "data": {
    "planId": "d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0",
    "hcps": [
      {
        "id": "hcp-id",
        "name": "City General Hospital",
        "address": "123 Healthcare Avenue",
        "email": "contact@citygeneral.com",
        "phone": "+2348012345678",
        "status": "approved"
      }
    ]
  }
}
```

---

## 7. Fetch HCP by ID

### Endpoint
```
GET /api/v1/healthcare-providers/{id}
```

### Description
Retrieve detailed information about a specific healthcare provider.

### Path Parameters
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `id` | UUID | Yes | HCP ID | `d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0` |

### Example Request
```bash
curl -X GET "http://localhost:6547/api/v1/healthcare-providers/d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0" \
  -H "Authorization: Bearer your-jwt-token"
```

### Example Response
```json
{
  "success": true,
  "message": "Healthcare provider retrieved successfully",
  "data": {
    "id": "d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0",
    "name": "City General Hospital",
    "address": "123 Healthcare Avenue, Medical District, Lagos",
    "email": "contact@citygeneral.com",
    "phone": "+2348012345678",
    "emergencyServiceProvider": true,
    "status": "approved",
    "accountStatus": "active",
    "verificationComments": "Provider verified and approved",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z",
    "plans": [
      {
        "id": "plan-id",
        "name": "Premium Health Plan",
        "coverageType": "Comprehensive",
        "pricingStructure": "Monthly"
      }
    ],
    "hmos": [
      {
        "id": "hmo-id",
        "name": "Premium HMO",
        "email": "info@premiumhmo.com",
        "phoneNumber": "+2348012345678"
      }
    ],
    "enrollments": [
      {
        "id": "enrollment-id",
        "startDate": "2024-01-01",
        "endDate": "2024-12-31",
        "status": "active",
        "terms": {
          "paymentTerms": "Net 30",
          "serviceAgreement": "Standard terms apply"
        }
      }
    ],
    "ratings": [
      {
        "id": "rating-id",
        "rating": 4.5,
        "review": "Excellent service",
        "metrics": {
          "waitTime": 4,
          "cleanliness": 5,
          "staffFriendliness": 4,
          "treatmentEffectiveness": 5
        },
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "services": [
      {
        "id": "service-id",
        "name": "Cardiology Consultation",
        "description": "Specialized heart care",
        "basePrice": 50000.00,
        "coverageDetails": {
          "isCovered": true,
          "coveragePercentage": 80
        }
      }
    ],
    "providerClaims": [
      {
        "id": "claim-id",
        "enrolleeNo": "ENR001",
        "claimReference": "CLM001",
        "status": "pending",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "users": [
      {
        "id": "user-id",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "phoneNumber": "+2348012345678"
      }
    ]
  }
}
```

---

## 8. Get HCP Enrollment Statistics

### Endpoint
```
GET /api/v1/healthcare-providers/{id}/enrollment-stats
```

### Description
Retrieve statistics about enrollments, ratings, services, and claims for a specific healthcare provider.

### Path Parameters
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `id` | UUID | Yes | HCP ID | `d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0` |

### Example Request
```bash
curl -X GET "http://localhost:6547/api/v1/healthcare-providers/d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0/enrollment-stats" \
  -H "Authorization: Bearer your-jwt-token"
```

### Example Response
```json
{
  "success": true,
  "message": "Healthcare provider enrollment statistics retrieved successfully",
  "data": {
    "hcp": {
      "id": "hcp-id",
      "name": "City General Hospital"
    },
    "totalEnrollments": 25,
    "activeEnrollments": 20,
    "inactiveEnrollments": 5,
    "totalRatings": 150,
    "averageRating": 4.2,
    "totalServices": 30,
    "totalClaims": 500
  }
}
```

---

## 9. Update HCP

### Endpoint
```
PUT /api/v1/healthcare-providers/{id}
```

### Description
Update an existing healthcare provider with new information.

### Path Parameters
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `id` | UUID | Yes | HCP ID | `d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0` |

### Request Body
```json
{
  "name": "Updated City General Hospital",
  "address": "456 Updated Healthcare Avenue, Medical District, Lagos",
  "contactInfo": {
    "email": "updated@citygeneral.com",
    "phone": "+2348012345679"
  },
  "emergencyServiceProvider": false,
  "status": "approved",
  "verificationComments": "Provider updated and re-verified"
}
```

### Example Request
```bash
curl -X PUT "http://localhost:6547/api/v1/healthcare-providers/d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated City General Hospital",
    "emergencyServiceProvider": false,
    "status": "approved"
  }'
```

### Example Response
```json
{
  "success": true,
  "message": "Healthcare provider updated successfully",
  "data": {
    "id": "d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0",
    "name": "Updated City General Hospital",
    "address": "456 Updated Healthcare Avenue, Medical District, Lagos",
    "email": "updated@citygeneral.com",
    "phone": "+2348012345679",
    "emergencyServiceProvider": false,
    "status": "approved",
    "accountStatus": "active",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

---

## 10. Delete HCP

### Endpoint
```
DELETE /api/v1/healthcare-providers/{id}
```

### Description
Soft delete a healthcare provider. Cannot delete HCPs with active enrollments or claims.

### Path Parameters
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `id` | UUID | Yes | HCP ID | `d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0` |

### Example Request
```bash
curl -X DELETE "http://localhost:6547/api/v1/healthcare-providers/d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0" \
  -H "Authorization: Bearer your-jwt-token"
```

### Example Response
```json
{
  "success": true,
  "message": "Healthcare provider deleted successfully",
  "data": {
    "id": "d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0",
    "name": "City General Hospital",
    "deletedAt": "2024-01-15T10:30:00Z"
  }
}
```

### Error Response (Active Enrollments/Claims)
```json
{
  "statusCode": 400,
  "message": "Cannot delete healthcare provider with active enrollments. Please deactivate all enrollments first.",
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
  "message": "Healthcare provider not found"
}
```

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "A healthcare provider with the name \"City General Hospital\" already exists."
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

Navigate to the "Healthcare Providers" section to see all available endpoints with:
- Request/response schemas
- Parameter descriptions
- Example values
- Try-it-out functionality

---

## Features

### ✅ Implemented Features
- [x] Add new HCP with comprehensive details
- [x] Fetch all HCPs with pagination and filtering
- [x] Get HCP by ID with full details
- [x] Update HCP information
- [x] Delete HCP (soft delete)
- [x] Filter HCP by multiple criteria
- [x] HCP statistics and analytics
- [x] Emergency providers listing
- [x] HMO-specific HCP listing
- [x] Plan-specific HCP listing
- [x] HCP enrollment statistics
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
- HCP → Healthcare Plans (many-to-many)
- HCP → HMOs (many-to-many)
- HCP → Provider Enrollments
- HCP → Provider Ratings
- HCP → Provider Services
- HCP → Provider Claims
- HCP → Users (many-to-many)

### 🔍 Advanced Filtering
- Search by name, address, email, or phone
- Filter by status (pending, approved, rejected)
- Filter by account status (active, dormant)
- Filter by HMO affiliation
- Filter by plan acceptance
- Filter by facility type
- Filter by emergency service availability
- Filter by specialty
- Filter by location/area
- Pagination and sorting

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
   # Create an HCP
   curl -X POST "http://localhost:6547/api/v1/healthcare-providers" \
     -H "Authorization: Bearer YOUR_TOKEN_HERE" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test Hospital",
       "address": "123 Test Street",
       "contactInfo": {
         "email": "test@hospital.com",
         "phone": "+2348012345678"
       },
       "planIds": ["YOUR_PLAN_ID"]
     }'

   # Get all HCPs
   curl -X GET "http://localhost:6547/api/v1/healthcare-providers" \
     -H "Authorization: Bearer YOUR_TOKEN_HERE"
   ```

---

## Notes

- **No migrations executed** - All database changes must be done manually
- **Soft delete** - HCPs are marked as deleted but not physically removed
- **Business logic** - Cannot delete HCPs with active enrollments or claims
- **Validation** - HCP names and emails must be unique
- **Relationships** - HCPs are linked to plans, HMOs, enrollments, ratings, services, and claims
- **Audit logging** - All operations are logged for compliance
- **Comprehensive filtering** - Multiple filter criteria can be combined
- **Statistics** - Detailed analytics for HCPs and their relationships
- **Emergency services** - Special filtering for emergency service providers
