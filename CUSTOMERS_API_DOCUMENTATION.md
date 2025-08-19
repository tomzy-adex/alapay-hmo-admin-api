# Customers API Documentation

## Overview
The Customers API provides comprehensive management capabilities for HMO customers (individual users) in the Alapay HMO Admin system. This API includes search, filter, view, and delete operations with full Swagger documentation.

## Required Database Setup

### Manual SQL Query to Run
Before using the API, you need to add the missing `organization_id` column to the `users` table:

```sql
-- Add the missing organization_id column
ALTER TABLE users ADD COLUMN organization_id UUID;

-- Optional: Add foreign key constraint (recommended)
ALTER TABLE users ADD CONSTRAINT fk_users_organization 
FOREIGN KEY (organization_id) REFERENCES organizations(id);
```

**Note:** Run this SQL manually in your database. No migrations will be executed automatically.

## API Endpoints

### Base URL
```
http://localhost:6547/api/v1/customers
```

### Authentication
All endpoints require JWT Bearer token authentication:
```
Authorization: Bearer <your-jwt-token>
```

---

## 1. Fetch All Customers

### Endpoint
```
GET /api/v1/customers
```

### Description
Retrieve all customers with pagination, search, and filtering capabilities.

### Query Parameters
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `search` | string | No | Search term for name, email, or phone | `john` |
| `status` | enum | No | Filter by account status | `active` |
| `accountStatus` | enum | No | Filter by process status | `approved` |
| `hmoId` | UUID | No | Filter by HMO ID | `d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0` |
| `organizationId` | UUID | No | Filter by organization ID | `d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0` |
| `gender` | string | No | Filter by gender | `male` |
| `bloodGroup` | string | No | Filter by blood group | `O+` |
| `isEmailVerified` | boolean | No | Filter by email verification | `true` |
| `page` | number | No | Page number (default: 1) | `1` |
| `limit` | number | No | Items per page (default: 10) | `10` |
| `sortBy` | string | No | Sort field (default: createdAt) | `firstName` |
| `sortOrder` | enum | No | Sort order ASC/DESC (default: DESC) | `ASC` |

### Example Request
```bash
curl -X GET "http://localhost:6547/api/v1/customers?page=1&limit=10&status=active" \
  -H "Authorization: Bearer your-jwt-token"
```

### Example Response
```json
{
  "success": true,
  "message": "Customers retrieved successfully",
  "data": {
    "customers": [
      {
        "id": "d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "phoneNumber": "+2348012345678",
        "status": "active",
        "accountStatus": "approved",
        "isEmailVerified": true,
        "createdAt": "2024-01-15T10:30:00Z",
        "role": {
          "id": "role-id",
          "permission": "individual-user"
        },
        "hmo": {
          "id": "hmo-id",
          "name": "Premium HMO",
          "email": "info@premiumhmo.com",
          "phoneNumber": "+2348012345678"
        },
        "wallet": {
          "id": "wallet-id",
          "balance": 50000.00
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

## 2. Search Customers

### Endpoint
```
GET /api/v1/customers/search
```

### Description
Search customers by name, email, or phone number with advanced filtering.

### Query Parameters
Same as "Fetch All Customers" endpoint.

### Example Request
```bash
curl -X GET "http://localhost:6547/api/v1/customers/search?search=john&page=1&limit=5" \
  -H "Authorization: Bearer your-jwt-token"
```

### Example Response
```json
{
  "success": true,
  "message": "Customer search completed successfully",
  "data": {
    "customers": [...],
    "searchTerm": "john",
    "pagination": {
      "page": 1,
      "limit": 5,
      "total": 3,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

---

## 3. Filter Customers

### Endpoint
```
GET /api/v1/customers/filter
```

### Description
Filter customers by various criteria including status, HMO, organization, and date ranges.

### Additional Query Parameters
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `startDate` | date | No | Filter by start date | `2024-01-01` |
| `endDate` | date | No | Filter by end date | `2024-12-31` |
| `minHeight` | number | No | Minimum height filter | `150` |
| `maxHeight` | number | No | Maximum height filter | `200` |

### Example Request
```bash
curl -X GET "http://localhost:6547/api/v1/customers/filter?status=active&startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer your-jwt-token"
```

### Example Response
```json
{
  "success": true,
  "message": "Customer filtering completed successfully",
  "data": {
    "customers": [...],
    "filters": {
      "status": "active",
      "startDate": "2024-01-01",
      "endDate": "2024-12-31"
    },
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

## 4. Get Customer Statistics

### Endpoint
```
GET /api/v1/customers/stats
```

### Description
Retrieve comprehensive statistics about customers.

### Example Request
```bash
curl -X GET "http://localhost:6547/api/v1/customers/stats" \
  -H "Authorization: Bearer your-jwt-token"
```

### Example Response
```json
{
  "success": true,
  "message": "Customer statistics retrieved successfully",
  "data": {
    "totalCustomers": 1000,
    "activeCustomers": 850,
    "verifiedCustomers": 920,
    "inactiveCustomers": 150,
    "unverifiedCustomers": 80
  }
}
```

---

## 5. View Individual Customer

### Endpoint
```
GET /api/v1/customers/{id}
```

### Description
Retrieve detailed information about a specific customer including claims, payments, and audit logs.

### Path Parameters
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `id` | UUID | Yes | Customer ID | `d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0` |

### Example Request
```bash
curl -X GET "http://localhost:6547/api/v1/customers/d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0" \
  -H "Authorization: Bearer your-jwt-token"
```

### Example Response
```json
{
  "success": true,
  "message": "Customer retrieved successfully",
  "data": {
    "id": "d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phoneNumber": "+2348012345678",
    "dob": "1990-01-01",
    "bloodGroup": "O+",
    "height": 175,
    "genotype": "AA",
    "gender": "male",
    "isEmailVerified": true,
    "status": "approved",
    "accountStatus": "active",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z",
    "role": {
      "id": "role-id",
      "permission": "individual-user"
    },
    "hmo": {
      "id": "hmo-id",
      "name": "Premium HMO",
      "email": "info@premiumhmo.com",
      "phoneNumber": "+2348012345678"
    },
    "organization": {
      "id": "org-id",
      "name": "Tech Corp",
      "description": "Technology company"
    },
    "wallet": {
      "id": "wallet-id",
      "balance": 50000.00
    },
    "hospitals": [
      {
        "id": "hospital-id",
        "name": "General Hospital",
        "address": "123 Main St",
        "phone": "+2348012345678",
        "email": "info@generalhospital.com"
      }
    ],
    "claims": [
      {
        "id": "claim-id",
        "description": "Medical consultation",
        "amount": 15000.00,
        "status": "pending",
        "type": "medical",
        "serviceDate": "2024-01-15",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "payments": [
      {
        "id": "payment-id",
        "amount": 50000.00,
        "status": "completed",
        "type": "subscription",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "notifications": [
      {
        "id": "notification-id",
        "title": "Payment Successful",
        "message": "Your payment has been processed successfully",
        "isRead": false,
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "auditLogs": [
      {
        "id": "audit-id",
        "action": "UPDATE",
        "entityName": "User",
        "entityId": "user-id",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

---

## 6. Delete Customer

### Endpoint
```
DELETE /api/v1/customers/{id}
```

### Description
Soft delete a customer. Cannot delete customers with active claims or payments.

### Path Parameters
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `id` | UUID | Yes | Customer ID | `d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0` |

### Example Request
```bash
curl -X DELETE "http://localhost:6547/api/v1/customers/d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0" \
  -H "Authorization: Bearer your-jwt-token"
```

### Example Response
```json
{
  "success": true,
  "message": "Customer deleted successfully",
  "data": {
    "id": "d3b07384-d9a0-4f5c-a3dd-9b3786cb1df0",
    "email": "john.doe@example.com",
    "deletedAt": "2024-01-15T10:30:00Z"
  }
}
```

### Error Response (Active Claims/Payments)
```json
{
  "statusCode": 400,
  "message": "Cannot delete customer with active claims or payments. Please resolve all pending transactions first.",
  "error": "Bad Request"
}
```

---

## Error Responses

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
  "message": "Customer not found"
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

Navigate to the "Customers" section to see all available endpoints with:
- Request/response schemas
- Parameter descriptions
- Example values
- Try-it-out functionality

---

## Features

### ✅ Implemented Features
- [x] Fetch all customers with pagination
- [x] Search customers by name, email, phone
- [x] Filter customers by multiple criteria
- [x] View individual customer details
- [x] Delete customers (soft delete)
- [x] Customer statistics
- [x] Comprehensive Swagger documentation
- [x] JWT authentication
- [x] Audit logging
- [x] Error handling
- [x] Data sanitization
- [x] Business logic validation

### 🔒 Security Features
- JWT Bearer token authentication
- Admin guard protection
- Audit logging for all operations
- Data sanitization to prevent sensitive data exposure
- Soft delete to maintain data integrity

### 📊 Data Relationships
The API handles complex relationships including:
- User → Role (individual-user)
- User → HMO
- User → Organization
- User → Wallet
- User → Hospitals (many-to-many)
- User → Claims
- User → Payments
- User → Notifications
- User → Audit Logs

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
   curl -X GET "http://localhost:6547/api/v1/customers" \
     -H "Authorization: Bearer YOUR_TOKEN_HERE"
   ```

---

## Notes

- **No migrations executed** - All database changes must be done manually
- **Soft delete** - Customers are marked as deleted but not physically removed
- **Business logic** - Cannot delete customers with active claims or payments
- **Pagination** - All list endpoints support pagination
- **Search** - Case-insensitive search across multiple fields
- **Filtering** - Multiple filter criteria can be combined
- **Audit logging** - All operations are logged for compliance
