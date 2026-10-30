# Quick Start Guide

## First Time Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ID\ CARD\ SYSTEM
```

### 2. Backend Setup

#### Install Dependencies

```bash
cd backend
npm install
```

#### Configure Environment

Create `.env` file in `backend/` directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
LOG_LEVEL=debug

# Database
MONGODB_URI=mongodb://localhost:27017/multischool-idcard
MONGODB_USER=admin
MONGODB_PASS=password
DB_POOL_SIZE=10

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
JWT_EXPIRY=7d
JWT_REFRESH_SECRET=your_super_secret_refresh_token_key
JWT_REFRESH_EXPIRY=30d

# Frontend
FRONTEND_URL=http://localhost:5173

# Email Service (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
SMTP_FROM=noreply@multischool.com

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100

# Pagination
DEFAULT_PAGE_LIMIT=10
MAX_PAGE_LIMIT=100

# File Upload
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=.jpg,.jpeg,.png,.pdf
```

#### Create MongoDB Database

```bash
# Using MongoDB Shell
mongosh

# In MongoDB Shell
use multischool-idcard
db.users.insertOne({
  username: "admin",
  email: "admin@school.com",
  role: "SUPERADMIN"
})
```

#### Run Backend

```bash
# Development mode with nodemon
npm run dev

# Production mode
npm start

# Run tests
npm test

# Run specific test file
npm test -- session.service.test.js
```

Backend will start at `http://localhost:5000`

---

### 3. Frontend Setup

#### Install Dependencies

```bash
cd frontend
npm install
```

#### Configure Environment

Create `.env` file in `frontend/` directory:

```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_APP_NAME=Multischool ID Card System
VITE_APP_VERSION=1.0.0
VITE_LOG_LEVEL=debug
```

#### Run Frontend

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Lint
npm run lint

# Format
npm run format
```

Frontend will start at `http://localhost:5173`

---

## First Login

### Creating Initial Admin User

#### Option 1: Via Backend API

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@school.com",
    "name": "Admin User",
    "mobile": "9876543210",
    "password": "SecurePassword123",
    "role": "SUPERADMIN"
  }'
```

#### Option 2: Via MongoDB Shell

```javascript
db.users.insertOne({
  username: "admin",
  email: "admin@school.com",
  name: "Admin User",
  mobile: "9876543210",
  password: "hashed_password_here",
  role: "SUPERADMIN",
  schoolId: null,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

### Login

Open browser: `http://localhost:5173`

```
Email/Username: admin@school.com
Password: SecurePassword123
```

---

## Common Development Tasks

### Creating a New Session

#### Via Frontend UI
1. Navigate to Dashboard
2. Click "Create Session" button
3. Fill in session details
4. Click "Save"

#### Via API
```bash
curl -X POST http://localhost:5000/api/v1/sessions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionName": "2024-25",
    "sessionCode": "SES-2024-25",
    "academicYear": "2024",
    "startDate": "2024-04-01T00:00:00Z",
    "endDate": "2025-03-31T23:59:59Z",
    "description": "Academic year 2024-25"
  }'
```

### Promoting Students

#### Individual Promotion
```bash
curl -X POST http://localhost:5000/api/v1/promotions/student \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "507f1f77bcf86cd799439020",
    "fromSessionId": "507f1f77bcf86cd799439011",
    "toSessionId": "507f1f77bcf86cd799439012",
    "fromClassId": "507f1f77bcf86cd799439030",
    "toClassId": "507f1f77bcf86cd799439031",
    "promotionStatus": "PROMOTED",
    "performanceMetrics": {
      "attendancePercentage": 92,
      "academicPerformance": "EXCELLENT"
    }
  }'
```

#### Bulk Promotion
```bash
curl -X POST http://localhost:5000/api/v1/promotions/bulk-students \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "fromSessionId": "507f1f77bcf86cd799439011",
    "toSessionId": "507f1f77bcf86cd799439012",
    "promotions": [
      {
        "studentId": "507f1f77bcf86cd799439020",
        "fromClassId": "507f1f77bcf86cd799439030",
        "toClassId": "507f1f77bcf86cd799439031",
        "promotionStatus": "PROMOTED"
      }
    ]
  }'
```

---

## Using Postman

### Import Collection

1. Open Postman
2. Click "Import"
3. Navigate to `postman/Multischool_ID_Card_System.postman_collection.json`
4. Click Import

### Setup Environment

1. Click "Environments"
2. Import `postman/Multischool_Environment.postman_environment.json`
3. Set variables:
   - `base_url`: http://localhost:5000/api/v1
   - `token`: (Set after login)
   - `schoolId`: (Your school ID)

### Login to Get Token

1. Open "Auth" → "Login" request
2. Click "Send"
3. Copy token from response
4. Paste in Environment variable `token`

---

## Testing

### Run All Tests

```bash
cd backend
npm test
```

### Run Specific Test Suite

```bash
# Session tests
npm test -- session.service.test.js

# Promotion tests
npm test -- promotion.service.test.js
```

### Run with Coverage

```bash
npm run test:coverage
```

### Frontend Tests

```bash
cd frontend
npm run test
```

---

## Database Operations

### Backup MongoDB

```bash
mongodump --uri="mongodb://localhost:27017/multischool-idcard" \
  --out=./backup
```

### Restore MongoDB

```bash
mongorestore --uri="mongodb://localhost:27017/multischool-idcard" \
  ./backup/multischool-idcard
```

### Clear Database

```bash
# Using mongosh
use multischool-idcard
db.dropDatabase()
```

---

## Troubleshooting

### Backend Won't Start

**Error: Port 5000 already in use**
```bash
# Kill process using port 5000
lsof -i :5000
kill -9 <PID>

# Or use different port
PORT=5001 npm run dev
```

**Error: Cannot connect to MongoDB**
```bash
# Check if MongoDB is running
mongosh

# If not running, start MongoDB
# On Windows (if installed as service)
net start MongoDB

# On macOS with Homebrew
brew services start mongodb-community

# On Linux
sudo systemctl start mongod
```

### Frontend Won't Connect to Backend

**Error: CORS issues**
- Ensure `FRONTEND_URL` in backend `.env` matches frontend URL
- Restart backend after changing env vars

**Error: 404 API endpoints**
- Check if backend is running
- Verify `VITE_API_URL` in frontend `.env`
- Check if endpoints are spelled correctly

### Session Creation Fails

**Error: "Session code already exists"**
- Use unique session codes per school
- Example: `SES-2024-25` instead of `SES-2024`

**Error: "Session dates overlap"**
- Ensure new session dates don't overlap with existing sessions
- Check existing session date ranges

### Promotion Fails

**Error: "Student not found"**
- Verify student ID is correct
- Check if student exists in the session

**Error: "Invalid class ID"**
- Verify class IDs are correct
- Check if classes exist in the school

---

## Development Best Practices

### Code Style

```javascript
// Good
const createSession = async (data) => {
  const session = await Session.create(data);
  return session;
};

// Bad
const createSession = async (data) => {
  let session = Session.create(data);
  return session;
};
```

### Error Handling

```javascript
// Good - Always handle errors
try {
  const session = await sessionService.createSession(data);
  res.json({ success: true, data: session });
} catch (error) {
  res.status(500).json({ 
    success: false, 
    message: error.message 
  });
}

// Bad - No error handling
const session = await sessionService.createSession(data);
res.json({ success: true, data: session });
```

### Validation

```javascript
// Good - Validate input
if (!sessionName || sessionName.length < 3) {
  throw new Error('Invalid session name');
}

// Bad - No validation
const session = await Session.create({ sessionName });
```

---

## VS Code Extensions (Recommended)

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "zainchen.json",
    "mongodb.mongodb-vscode",
    "REST Client.rest-client"
  ]
}
```

### Install Recommendations

```bash
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension zainchen.json
code --install-extension mongodb.mongodb-vscode
code --install-extension REST Client.rest-client
```

---

## Next Steps

1. **Explore the Code**
   - Read [SETUP_GUIDE.md](SETUP_GUIDE.md) for architecture
   - Review [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for endpoints

2. **Run Examples**
   - Create a session
   - Promote a student
   - Check promotion history

3. **Customize**
   - Update branding/colors in frontend theme
   - Add custom validation rules
   - Implement additional features

4. **Deploy**
   - Read [DEPLOYMENT.md](DEPLOYMENT.md) for deployment options
   - Setup CI/CD pipeline
   - Configure production environment

---

## Support

For issues or questions:
1. Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
2. Review API documentation
3. Check backend logs: `backend/logs/`
4. Check browser console for frontend errors

---

## Quick Reference

| Task | Command |
|------|---------|
| Start backend | `cd backend && npm run dev` |
| Start frontend | `cd frontend && npm run dev` |
| Run backend tests | `cd backend && npm test` |
| Run frontend tests | `cd frontend && npm run test` |
| Build frontend | `cd frontend && npm run build` |
| Create new session | POST /sessions |
| Promote student | POST /promotions/student |
| Bulk promote | POST /promotions/bulk-students |
| Get history | GET /promotions/history |
| Rollback | POST /promotions/:id/rollback |

---

Good luck! Happy coding! 🚀