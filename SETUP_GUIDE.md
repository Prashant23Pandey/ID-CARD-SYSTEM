# Academic Session Management & Student Promotion System

## Project Overview

This is a production-grade Academic Session Management and Student Promotion System built for a Multi-School ID Card SaaS platform. It enables schools to manage academic sessions, handle student promotions across classes, and maintain comprehensive promotion history with rollback capabilities.

## Architecture

```
Multi-Tenant SaaS
├── Backend (Node.js/Express)
│   ├── Session Management
│   ├── Student Promotion System
│   ├── Promotion History Tracking
│   ├── Rollback System
│   └── Reporting & Analytics
├── Frontend (React)
│   ├── Session Management UI
│   ├── Promotion Center
│   ├── History & Reports
│   └── Dashboard
└── Database (MongoDB)
    ├── Sessions
    ├── PromotionHistory
    ├── Students
    └── Classes/Sections
```

## Backend Setup

### Prerequisites

- Node.js 16+ and npm
- MongoDB 4.4+
- Docker (optional)

### Installation

```bash
cd backend
npm install
```

### Environment Variables

Create `.env` file in `backend/` directory:

```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/multischool-idcard
MONGODB_USER=admin
MONGODB_PASS=password

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRY=7d

# Frontend
FRONTEND_URL=http://localhost:5173

# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_password

# Google OAuth
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_secret
```

### Running Backend

```bash
# Development
npm run dev

# Production
npm start

# Tests
npm test
npm run test:coverage
```

The backend API will be available at `http://localhost:5000/api/v1`

## Frontend Setup

### Prerequisites

- Node.js 16+ and npm
- React 18+

### Installation

```bash
cd frontend
npm install
```

### Environment Variables

Create `.env` file in `frontend/` directory:

```env
REACT_APP_API_URL=http://localhost:5000/api/v1
REACT_APP_APP_NAME=Multischool ID Card System
```

### Running Frontend

```bash
# Development
npm run dev

# Build
npm run build

# Preview production build
npm run preview
```

The frontend will be available at `http://localhost:5173`

## Core Features

### 1. Academic Session Management

**Create Session**
- Generate unique session codes
- Set start/end dates with overlap detection
- Validate academic year format (e.g., 2024-25)
- Support for multiple sessions per school

**Activate Session**
- Only one active session per school
- Automatic deactivation of previous session
- Status tracking (PLANNED, ACTIVE, COMPLETED, ARCHIVED)

**Archive Session**
- Prevent modifications to archived sessions
- Require promotion completion before archiving
- Maintain historical data

### 2. Student Promotion System

**Individual Student Promotion**
- Promote single student to new class/section
- Record performance metrics (attendance, grades, conduct)
- Generate promotion history entry

**Bulk Promotion**
- Promote multiple students in batch
- Batch ID tracking for easy rollback
- Error handling and reporting
- Limit of 1000 students per batch

**Class-Level Promotion**
- Promote entire class to next level
- Section-based promotion support
- Automatic mapping to new section

**School-Wide Promotion**
- Promote all students across all classes
- Class-to-class mapping configuration
- Comprehensive error handling
- Transaction-based for data consistency

### 3. Promotion Features

**Promotion History**
- Track all student promotions
- Filter by student, session, status
- Search and pagination support
- Performance metrics storage

**Promotion Preview**
- Preview students before promotion
- Validation checks
- Estimated impact analysis

**Rollback Support**
- Rollback single promotion
- Rollback entire batch
- Reason tracking for audit trail
- Transaction-based to maintain consistency

### 4. Dashboard & Reporting

**Session Dashboard**
- Active session overview
- Student/teacher/class counts
- Promotion status
- Recent activities

**Promotion Reports**
- Summary reports by status
- Detailed student reports
- Class-wise analysis
- Export to PDF/Excel

## API Endpoints

### Session Endpoints

```
POST   /sessions                          - Create session
GET    /sessions                          - Get all sessions
GET    /sessions/:id                      - Get session by ID
PUT    /sessions/:id                      - Update session
DELETE /sessions/:id                      - Delete session (soft)
PATCH  /sessions/:id/activate             - Activate session
PATCH  /sessions/:id/deactivate           - Deactivate session
PATCH  /sessions/:id/archive              - Archive session
GET    /sessions/:id/statistics           - Get statistics
GET    /sessions/dashboard/overview       - Get dashboard
PATCH  /sessions/:id/mark-promotion-completed - Mark promotion complete
PATCH  /sessions/:id/reset-promotion      - Reset promotion status
```

### Promotion Endpoints

```
POST   /promotions/student                        - Promote single student
POST   /promotions/bulk-students                  - Bulk promote students
POST   /promotions/class                          - Promote class
POST   /promotions/school                         - Promote school
GET    /promotions/history                        - Get history (with filters)
GET    /promotions/student/:studentId/history     - Get student history
GET    /promotions/preview                        - Get preview
GET    /promotions/report                         - Get report
POST   /promotions/:id/rollback                   - Rollback promotion
POST   /promotions/batch/rollback                 - Rollback batch
```

## Database Schemas

### Session Collection

```javascript
{
  _id: ObjectId,
  schoolId: ObjectId,
  sessionName: String,           // e.g., "2024-25"
  sessionCode: String,           // Unique per school
  academicYear: String,
  startDate: Date,
  endDate: Date,
  description: String,
  isActive: Boolean,
  isArchived: Boolean,
  promotionCompleted: Boolean,
  status: Enum,                  // PLANNED, ACTIVE, COMPLETED, ARCHIVED
  studentCount: Number,
  classCount: Number,
  teacherCount: Number,
  promotionStartDate: Date,
  promotionEndDate: Date,
  archivedAt: Date,
  createdBy: ObjectId,
  updatedBy: ObjectId,
  createdAt: Date,
  updatedAt: Date,
  deletedAt: Date
}
```

### PromotionHistory Collection

```javascript
{
  _id: ObjectId,
  schoolId: ObjectId,
  previousSessionId: ObjectId,
  nextSessionId: ObjectId,
  studentId: ObjectId,
  previousClassId: ObjectId,
  previousSectionId: ObjectId,
  nextClassId: ObjectId,
  nextSectionId: ObjectId,
  promotionStatus: Enum,         // PROMOTED, DETAINED, GRADUATED, TRANSFERRED
  remarks: String,
  promotedBy: ObjectId,
  batchPromotionId: String,
  promotionDate: Date,
  isRolledBack: Boolean,
  rollbackDate: Date,
  rollbackBy: ObjectId,
  rollbackReason: String,
  performanceMetrics: {
    attendancePercentage: Number,
    academicPerformance: Enum,
    conductRating: Enum
  },
  createdAt: Date,
  updatedAt: Date
}
```

## Validation Rules

### Session Validation

- ✓ Session name: 3-50 characters
- ✓ Session code: 2-20 characters, uppercase, alphanumeric
- ✓ Academic year: YYYY-YY or YYYY format
- ✓ End date must be after start date
- ✓ No overlapping sessions per school
- ✓ Unique session code per school
- ✓ Cannot modify archived sessions
- ✓ Cannot delete active sessions
- ✓ Cannot archive until promotion completed

### Promotion Validation

- ✓ Valid student ID
- ✓ Valid class IDs (from and to)
- ✓ Valid session IDs (from and to)
- ✓ Different sessions for from and to
- ✓ Valid promotion status
- ✓ Attendance percentage: 0-100
- ✓ Academic performance: EXCELLENT, GOOD, AVERAGE, POOR
- ✓ Bulk max 1000 students per request

## Security Features

- **JWT Authentication**: Token-based auth with expiry
- **Role-Based Access Control (RBAC)**: SUPERADMIN, SCHOOLADMIN, TEACHER
- **School Isolation**: Multi-tenant data segregation
- **Input Validation & Sanitization**: Express-validator
- **XSS Protection**: XSS-clean middleware
- **NoSQL Injection Prevention**: Mongo-sanitize
- **Rate Limiting**: API rate limiter
- **Audit Logging**: Track all operations
- **Soft Deletes**: Maintain data integrity
- **Transactions**: Ensure data consistency

## Testing

### Backend Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

Test suites cover:
- Session CRUD operations
- Session activation/deactivation
- Student promotion logic
- Bulk promotion
- Rollback operations
- Authorization checks
- Data validation

### Frontend Tests

```bash
# Run tests
npm run test

# Coverage
npm run test:coverage
```

## Performance Optimization

- **Indexing**: Compound indexes on frequently queried fields
- **Pagination**: Default limit 10, max 100
- **Caching**: Redux state management
- **Lazy Loading**: Code splitting in React
- **Virtual Scrolling**: Large list optimization
- **Debouncing**: Search input optimization

## Deployment

### Backend Deployment (Docker)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY src ./src
EXPOSE 5000
CMD ["npm", "start"]
```

```bash
docker build -t multischool-backend .
docker run -p 5000:5000 --env-file .env multischool-backend
```

### Frontend Deployment (Vercel/Netlify)

```bash
npm run build
# Deploy dist/ folder
```

## Troubleshooting

### Session Creation Fails

**Error**: "Session code already exists"
- **Solution**: Ensure session code is unique per school

**Error**: "Session dates overlap"
- **Solution**: Check existing session date ranges

### Promotion Fails

**Error**: "Cannot promote, session not found"
- **Solution**: Verify both from and to session IDs exist

**Error**: "Batch promotion limited to 1000 students"
- **Solution**: Split into multiple batches

## Support & Contribution

For issues, feature requests, or contributions, please contact the development team.

## License

ISC