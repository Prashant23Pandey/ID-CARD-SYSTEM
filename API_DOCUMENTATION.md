# Session & Promotion API Documentation

## Base URL
```
http://localhost:5000/api/v1
```

## Authentication
All endpoints require JWT Bearer token in the `Authorization` header:
```
Authorization: Bearer <token>
```

---

## SESSION MANAGEMENT ENDPOINTS

### 1. Create Session
**Endpoint:** `POST /sessions`  
**Access:** SUPERADMIN, SCHOOLADMIN

**Request Body:**
```json
{
  "sessionName": "2024-25",
  "sessionCode": "SES-2024-25",
  "academicYear": "2024",
  "startDate": "2024-04-01T00:00:00Z",
  "endDate": "2025-03-31T23:59:59Z",
  "description": "Academic year 2024-2025"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "schoolId": "507f1f77bcf86cd799439012",
    "sessionName": "2024-25",
    "sessionCode": "SES-2024-25",
    "academicYear": "2024",
    "startDate": "2024-04-01T00:00:00Z",
    "endDate": "2025-03-31T23:59:59Z",
    "description": "Academic year 2024-2025",
    "isActive": false,
    "isArchived": false,
    "status": "PLANNED",
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  },
  "message": "Session created successfully"
}
```

**Error (400):**
```json
{
  "success": false,
  "message": "Session code already exists for this school"
}
```

---

### 2. Get All Sessions
**Endpoint:** `GET /sessions`  
**Access:** SUPERADMIN, SCHOOLADMIN, TEACHER

**Query Parameters:**
- `page` (integer, default: 1) - Page number
- `limit` (integer, default: 10, max: 100) - Records per page
- `status` (string) - Filter by status: PLANNED, ACTIVE, COMPLETED, ARCHIVED
- `search` (string) - Search by session name or code
- `academicYear` (string) - Filter by academic year
- `isArchived` (boolean) - Filter by archive status
- `sortBy` (string) - Sort field: sessionName, startDate, endDate, createdAt
- `sortOrder` (string) - asc or desc

**Example Request:**
```
GET /sessions?page=1&limit=10&status=ACTIVE&sortBy=createdAt&sortOrder=desc
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "sessionName": "2024-25",
      "sessionCode": "SES-2024-25",
      "academicYear": "2024",
      "startDate": "2024-04-01T00:00:00Z",
      "endDate": "2025-03-31T23:59:59Z",
      "status": "ACTIVE",
      "isActive": true,
      "studentCount": 245,
      "classCount": 12,
      "teacherCount": 38
    }
  ],
  "total": 5,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

---

### 3. Get Session by ID
**Endpoint:** `GET /sessions/:id`  
**Access:** SUPERADMIN, SCHOOLADMIN, TEACHER

**Example Request:**
```
GET /sessions/507f1f77bcf86cd799439011
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "schoolId": "507f1f77bcf86cd799439012",
    "sessionName": "2024-25",
    "sessionCode": "SES-2024-25",
    "academicYear": "2024",
    "startDate": "2024-04-01T00:00:00Z",
    "endDate": "2025-03-31T23:59:59Z",
    "description": "Academic year 2024-2025",
    "isActive": true,
    "isArchived": false,
    "promotionCompleted": false,
    "status": "ACTIVE",
    "studentCount": 245,
    "classCount": 12,
    "teacherCount": 38,
    "createdBy": {
      "_id": "507f1f77bcf86cd799439013",
      "firstName": "Admin",
      "lastName": "User",
      "email": "admin@school.com"
    },
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
}
```

---

### 4. Update Session
**Endpoint:** `PUT /sessions/:id`  
**Access:** SUPERADMIN, SCHOOLADMIN

**Request Body:**
```json
{
  "sessionName": "2024-25 (Updated)",
  "description": "Updated description",
  "startDate": "2024-04-01T00:00:00Z",
  "endDate": "2025-03-31T23:59:59Z"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { /* Updated session object */ },
  "message": "Session updated successfully"
}
```

---

### 5. Delete Session (Soft Delete)
**Endpoint:** `DELETE /sessions/:id`  
**Access:** SUPERADMIN, SCHOOLADMIN

**Response (200):**
```json
{
  "success": true,
  "message": "Session deleted successfully"
}
```

---

### 6. Activate Session
**Endpoint:** `PATCH /sessions/:id/activate`  
**Access:** SUPERADMIN, SCHOOLADMIN

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "isActive": true,
    "status": "ACTIVE"
  },
  "message": "Session activated successfully"
}
```

**Error (409):**
```json
{
  "success": false,
  "message": "There is already an active session: 2023-24",
  "activeSessionId": "507f1f77bcf86cd799439010"
}
```

---

### 7. Deactivate Session
**Endpoint:** `PATCH /sessions/:id/deactivate`  
**Access:** SUPERADMIN, SCHOOLADMIN

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "isActive": false,
    "status": "COMPLETED"
  },
  "message": "Session deactivated successfully"
}
```

---

### 8. Archive Session
**Endpoint:** `PATCH /sessions/:id/archive`  
**Access:** SUPERADMIN, SCHOOLADMIN

**Request Body (Optional):**
```json
{
  "archiveReason": "End of academic year"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "isArchived": true,
    "status": "ARCHIVED",
    "archivedAt": "2025-04-01T10:00:00Z"
  },
  "message": "Session archived successfully"
}
```

**Error (409):**
```json
{
  "success": false,
  "message": "Cannot archive session until promotion is completed"
}
```

---

### 9. Get Session Statistics
**Endpoint:** `GET /sessions/:id/statistics`  
**Access:** SUPERADMIN, SCHOOLADMIN, TEACHER

**Response (200):**
```json
{
  "success": true,
  "data": {
    "sessionId": "507f1f77bcf86cd799439011",
    "sessionName": "2024-25",
    "status": "ACTIVE",
    "isActive": true,
    "studentCount": 245,
    "teacherCount": 38,
    "classCount": 12,
    "sectionCount": 24,
    "promotionCompleted": false,
    "startDate": "2024-04-01T00:00:00Z",
    "endDate": "2025-03-31T23:59:59Z",
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

---

### 10. Get Session Dashboard
**Endpoint:** `GET /sessions/dashboard/overview`  
**Access:** SUPERADMIN, SCHOOLADMIN, TEACHER

**Response (200):**
```json
{
  "success": true,
  "data": {
    "activeSession": {
      "id": "507f1f77bcf86cd799439011",
      "name": "2024-25",
      "code": "SES-2024-25",
      "startDate": "2024-04-01T00:00:00Z",
      "endDate": "2025-03-31T23:59:59Z",
      "promotionCompleted": false,
      "studentCount": 245,
      "teacherCount": 38,
      "classCount": 12
    },
    "statistics": {
      "totalSessions": 5,
      "activeSessions": 1,
      "plannedSessions": 2,
      "archivedSessions": 2
    }
  }
}
```

---

### 11. Mark Promotion as Completed
**Endpoint:** `PATCH /sessions/:id/mark-promotion-completed`  
**Access:** SUPERADMIN, SCHOOLADMIN

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "promotionCompleted": true,
    "promotionEndDate": "2025-04-01T10:00:00Z"
  },
  "message": "Promotion marked as completed"
}
```

---

### 12. Reset Promotion Status
**Endpoint:** `PATCH /sessions/:id/reset-promotion`  
**Access:** SUPERADMIN, SCHOOLADMIN

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "promotionCompleted": false,
    "promotionStartDate": null,
    "promotionEndDate": null
  },
  "message": "Promotion status reset successfully"
}
```

---

## PROMOTION ENDPOINTS

### 1. Promote Single Student
**Endpoint:** `POST /promotions/student`  
**Access:** SUPERADMIN, SCHOOLADMIN

**Request Body:**
```json
{
  "studentId": "507f1f77bcf86cd799439020",
  "fromSessionId": "507f1f77bcf86cd799439011",
  "toSessionId": "507f1f77bcf86cd799439012",
  "fromClassId": "507f1f77bcf86cd799439030",
  "toClassId": "507f1f77bcf86cd799439031",
  "fromSectionId": "507f1f77bcf86cd799439040",
  "toSectionId": "507f1f77bcf86cd799439041",
  "promotionStatus": "PROMOTED",
  "remarks": "Promoted to next class",
  "performanceMetrics": {
    "attendancePercentage": 92,
    "academicPerformance": "EXCELLENT",
    "conductRating": "GOOD"
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "success": true,
    "promotionHistoryId": "507f1f77bcf86cd799439050",
    "message": "Student promoted from Class 1 to Class 2"
  }
}
```

---

### 2. Bulk Promote Students
**Endpoint:** `POST /promotions/bulk-students`  
**Access:** SUPERADMIN, SCHOOLADMIN

**Request Body:**
```json
{
  "fromSessionId": "507f1f77bcf86cd799439011",
  "toSessionId": "507f1f77bcf86cd799439012",
  "promotions": [
    {
      "studentId": "507f1f77bcf86cd799439020",
      "fromClassId": "507f1f77bcf86cd799439030",
      "toClassId": "507f1f77bcf86cd799439031",
      "fromSectionId": "507f1f77bcf86cd799439040",
      "toSectionId": "507f1f77bcf86cd799439041",
      "promotionStatus": "PROMOTED",
      "remarks": "Promoted",
      "performanceMetrics": {
        "attendancePercentage": 92
      }
    },
    {
      "studentId": "507f1f77bcf86cd799439021",
      "fromClassId": "507f1f77bcf86cd799439030",
      "toClassId": "507f1f77bcf86cd799439031",
      "promotionStatus": "PROMOTED"
    }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "success": true,
    "batchPromotionId": "batch-uuid-123",
    "successful": 2,
    "failed": 0,
    "errors": [],
    "promotionHistoryIds": ["id1", "id2"],
    "message": "Bulk promotion completed: 2 successful, 0 failed"
  }
}
```

---

### 3. Promote Entire Class
**Endpoint:** `POST /promotions/class`  
**Access:** SUPERADMIN, SCHOOLADMIN

**Request Body:**
```json
{
  "fromSessionId": "507f1f77bcf86cd799439011",
  "toSessionId": "507f1f77bcf86cd799439012",
  "fromClassId": "507f1f77bcf86cd799439030",
  "toClassId": "507f1f77bcf86cd799439031",
  "fromSectionId": "507f1f77bcf86cd799439040",
  "toSectionId": "507f1f77bcf86cd799439041"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "success": true,
    "batchPromotionId": "batch-uuid-456",
    "successful": 45,
    "failed": 0,
    "errors": [],
    "message": "Class promotion completed: 45 successful, 0 failed"
  }
}
```

---

### 4. Promote Entire School
**Endpoint:** `POST /promotions/school`  
**Access:** SUPERADMIN, SCHOOLADMIN

**Request Body:**
```json
{
  "fromSessionId": "507f1f77bcf86cd799439011",
  "toSessionId": "507f1f77bcf86cd799439012",
  "classPromotionMap": [
    {
      "fromClassId": "507f1f77bcf86cd799439030",
      "toClassId": "507f1f77bcf86cd799439031"
    },
    {
      "fromClassId": "507f1f77bcf86cd799439031",
      "toClassId": "507f1f77bcf86cd799439032"
    }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "success": true,
    "batchPromotionId": "batch-uuid-789",
    "successful": 245,
    "failed": 2,
    "errors": [
      {
        "studentId": "507f1f77bcf86cd799439022",
        "error": "No promotion mapping found"
      }
    ],
    "message": "School-wide promotion completed: 245 successful, 2 failed"
  }
}
```

---

### 5. Get Promotion History
**Endpoint:** `GET /promotions/history`  
**Access:** SUPERADMIN, SCHOOLADMIN, TEACHER

**Query Parameters:**
- `page` (integer, default: 1)
- `limit` (integer, default: 10)
- `studentId` (string) - Filter by student
- `sessionId` (string) - Filter by session
- `promotionStatus` (string) - PROMOTED, DETAINED, GRADUATED, TRANSFERRED
- `sortBy` (string) - promotionDate, studentName, createdAt
- `sortOrder` (string) - asc or desc

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439050",
      "studentId": {
        "_id": "507f1f77bcf86cd799439020",
        "firstName": "John",
        "lastName": "Doe",
        "admissionNumber": "ADM001"
      },
      "previousSessionId": {
        "sessionName": "2023-24"
      },
      "nextSessionId": {
        "sessionName": "2024-25"
      },
      "previousClassId": {
        "className": "Class 1"
      },
      "nextClassId": {
        "className": "Class 2"
      },
      "promotionStatus": "PROMOTED",
      "promotionDate": "2024-04-01T10:00:00Z",
      "promotedBy": {
        "firstName": "Admin",
        "lastName": "User"
      }
    }
  ],
  "total": 245,
  "page": 1,
  "limit": 10,
  "totalPages": 25
}
```

---

### 6. Get Student Promotion History
**Endpoint:** `GET /promotions/student/:studentId/history`  
**Access:** SUPERADMIN, SCHOOLADMIN, TEACHER

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439050",
      "promotionStatus": "PROMOTED",
      "promotionDate": "2024-04-01T10:00:00Z",
      "previousClassId": { "className": "Class 1" },
      "nextClassId": { "className": "Class 2" }
    },
    {
      "_id": "507f1f77bcf86cd799439051",
      "promotionStatus": "PROMOTED",
      "promotionDate": "2025-04-01T10:00:00Z",
      "previousClassId": { "className": "Class 2" },
      "nextClassId": { "className": "Class 3" }
    }
  ],
  "total": 2,
  "page": 1
}
```

---

### 7. Get Promotion Preview
**Endpoint:** `GET /promotions/preview`  
**Access:** SUPERADMIN, SCHOOLADMIN, TEACHER

**Query Parameters:**
- `fromSessionId` (required) - Session to promote from
- `toSessionId` (required) - Session to promote to
- `classId` (optional) - Filter by class
- `sectionId` (optional) - Filter by section

**Response (200):**
```json
{
  "success": true,
  "data": {
    "sessionInfo": {
      "fromSessionId": "507f1f77bcf86cd799439011",
      "toSessionId": "507f1f77bcf86cd799439012"
    },
    "previewCount": 45,
    "students": [
      {
        "_id": "507f1f77bcf86cd799439020",
        "firstName": "John",
        "lastName": "Doe",
        "admissionNumber": "ADM001",
        "classId": { "className": "Class 1" },
        "sectionId": { "sectionName": "A" }
      }
    ]
  }
}
```

---

### 8. Get Promotion Report
**Endpoint:** `GET /promotions/report`  
**Access:** SUPERADMIN, SCHOOLADMIN, TEACHER

**Query Parameters:**
- `sessionId` (optional)
- `classId` (optional)
- `reportType` (optional) - SUMMARY, DETAILED, BY_CLASS, BY_SECTION, BY_STATUS (default: SUMMARY)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "reportType": "SUMMARY",
    "sessionId": null,
    "classId": null,
    "data": [
      {
        "_id": {
          "promotionStatus": "PROMOTED"
        },
        "count": 240
      },
      {
        "_id": {
          "promotionStatus": "DETAINED"
        },
        "count": 5
      }
    ]
  }
}
```

---

### 9. Rollback Promotion
**Endpoint:** `POST /promotions/:promotionHistoryId/rollback`  
**Access:** SUPERADMIN, SCHOOLADMIN

**Request Body:**
```json
{
  "reason": "Incorrect promotion, student should be retained"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Promotion rolled back successfully",
    "promotionHistoryId": "507f1f77bcf86cd799439050"
  }
}
```

---

### 10. Rollback Batch Promotion
**Endpoint:** `POST /promotions/batch/rollback`  
**Access:** SUPERADMIN, SCHOOLADMIN

**Request Body:**
```json
{
  "batchPromotionId": "batch-uuid-123",
  "reason": "System error during bulk promotion"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Batch promotion rolled back successfully for 45 students",
    "batchPromotionId": "batch-uuid-123"
  }
}
```

---

## Common Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "errors": [
    {
      "msg": "Session name must be between 3 and 50 characters",
      "param": "sessionName",
      "location": "body"
    }
  ]
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Session not found"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "There is already an active session for this school"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Server Error"
}
```

---

## Rate Limiting

All API endpoints are rate-limited to prevent abuse:
- **Window:** 15 minutes
- **Limit:** 100 requests per window per IP
- **Headers:**
  - `X-RateLimit-Limit`: Total limit
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset time (Unix timestamp)