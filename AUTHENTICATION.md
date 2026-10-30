# Authentication & Authorization Guide

## Overview

The Multischool ID Card System uses JWT (JSON Web Tokens) for authentication and role-based access control (RBAC) for authorization.

---

## Authentication Flow

### 1. Registration

**Endpoint:** `POST /auth/register`

**Request:**
```json
{
  "username": "teacher1",
  "email": "teacher1@school.com",
  "name": "John Teacher",
  "mobile": "9876543210",
  "password": "SecurePassword123",
  "role": "TEACHER",
  "schoolId": "507f1f77bcf86cd799439012"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "_id": "507f1f77bcf86cd799439015",
    "username": "teacher1",
    "email": "teacher1@school.com",
    "name": "John Teacher",
    "role": "TEACHER"
  }
}
```

---

### 2. Login

**Endpoint:** `POST /auth/login`

**Request:**
```json
{
  "identifier": "teacher1@school.com",
  "password": "SecurePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439015",
      "username": "teacher1",
      "email": "teacher1@school.com",
      "name": "John Teacher",
      "role": "TEACHER",
      "schoolId": "507f1f77bcf86cd799439012"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "7d"
  }
}
```

---

### 3. Using the Token

Include the access token in Authorization header:

```bash
curl -X GET http://localhost:5000/api/v1/sessions \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**In Frontend (React):**

```javascript
const response = await fetch('/api/v1/sessions', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});
```

---

### 4. Token Refresh

**Endpoint:** `POST /auth/refresh`

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "7d"
  }
}
```

---

### 5. Logout

**Endpoint:** `POST /auth/logout`

**Request:**
```json
{
  "userId": "507f1f77bcf86cd799439015"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## Role-Based Access Control (RBAC)

### Roles Definition

#### 1. SUPERADMIN
- Full system access
- Can manage all schools
- Can manage all users
- Can manage all sessions and promotions

**Permissions:**
- Create schools
- Manage users across all schools
- Create/update/delete sessions
- Perform all promotions
- View all reports
- Manage system settings

---

#### 2. SCHOOLADMIN
- School-level administration
- Manage users within their school
- Manage sessions and promotions within their school
- Cannot access other schools' data

**Permissions:**
- Manage teachers and staff
- Create/update sessions
- Perform promotions
- View school reports
- Cannot manage other schools

---

#### 3. TEACHER
- Can view students and classes
- Can view promotion history
- Cannot perform promotions
- Cannot manage sessions

**Permissions:**
- View own class
- View student list
- View promotion history
- View student grades/attendance
- Cannot modify any data

---

### Access Control Middleware

#### Authentication Middleware

```javascript
const requireAuth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};
```

#### Role-Based Middleware

```javascript
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }
    next();
  };
};
```

#### School Access Middleware

```javascript
const requireSchoolAccess = async (req, res, next) => {
  const schoolId = req.body.schoolId || req.query.schoolId || req.params.schoolId;
  
  // SUPERADMIN has access to all schools
  if (req.user.role === 'SUPERADMIN') {
    return next();
  }

  // Others can only access their own school
  if (req.user.schoolId.toString() !== schoolId) {
    return res.status(403).json({
      success: false,
      message: 'Cannot access other schools'
    });
  }

  next();
};
```

---

### Route Protection Examples

#### Session Endpoints

```javascript
// Create Session - SUPERADMIN or SCHOOLADMIN only
router.post(
  '/',
  requireAuth,
  requireSchoolAccess,
  requireRole('SUPERADMIN', 'SCHOOLADMIN'),
  validateCreateSession,
  createSession
);

// Get Sessions - All authenticated users
router.get(
  '/',
  requireAuth,
  requireSchoolAccess,
  getSessions
);

// Delete Session - SUPERADMIN or SCHOOLADMIN only
router.delete(
  '/:id',
  requireAuth,
  requireSchoolAccess,
  requireRole('SUPERADMIN', 'SCHOOLADMIN'),
  deleteSession
);
```

#### Promotion Endpoints

```javascript
// Promote Student - SUPERADMIN or SCHOOLADMIN only
router.post(
  '/student',
  requireAuth,
  requireSchoolAccess,
  requireRole('SUPERADMIN', 'SCHOOLADMIN'),
  validatePromoteStudent,
  promoteStudent
);

// View Promotion History - All authenticated users
router.get(
  '/history',
  requireAuth,
  requireSchoolAccess,
  getPromotionHistory
);

// Rollback Promotion - SUPERADMIN or SCHOOLADMIN only
router.post(
  '/:id/rollback',
  requireAuth,
  requireSchoolAccess,
  requireRole('SUPERADMIN', 'SCHOOLADMIN'),
  rollbackPromotion
);
```

---

## Permission Matrix

| Feature | SUPERADMIN | SCHOOLADMIN | TEACHER |
|---------|-----------|-------------|---------|
| **Sessions** | | | |
| Create Session | ✅ | ✅ | ❌ |
| View Sessions | ✅ | ✅ | ✅ |
| Update Session | ✅ | ✅ | ❌ |
| Delete Session | ✅ | ✅ | ❌ |
| Activate Session | ✅ | ✅ | ❌ |
| Archive Session | ✅ | ✅ | ❌ |
| **Promotions** | | | |
| Promote Student | ✅ | ✅ | ❌ |
| Bulk Promote | ✅ | ✅ | ❌ |
| Promote Class | ✅ | ✅ | ❌ |
| Promote School | ✅ | ✅ | ❌ |
| View History | ✅ | ✅ | ✅ |
| Rollback | ✅ | ✅ | ❌ |
| **Users** | | | |
| Create User | ✅ | ✅ | ❌ |
| View Users | ✅ | ✅ | ❌ |
| Update User | ✅ | ✅ | ❌ |
| Delete User | ✅ | ✅ | ❌ |

---

## Frontend Authentication

### Login Component

```jsx
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { login } from '@/features/authSlice';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      const result = await dispatch(login({ 
        identifier: email, 
        password 
      })).unwrap();
      
      // Store token
      localStorage.setItem('accessToken', result.accessToken);
      localStorage.setItem('refreshToken', result.refreshToken);
      localStorage.setItem('user', JSON.stringify(result.user));
      
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit">Login</button>
    </form>
  );
}
```

### Protected Route Component

```jsx
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

function ProtectedRoute({ children, requiredRole }) {
  const { user } = useSelector(state => state.auth);

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && !requiredRole.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
}

// Usage
<Route
  path="/sessions"
  element={
    <ProtectedRoute requiredRole={['SUPERADMIN', 'SCHOOLADMIN']}>
      <SessionManagement />
    </ProtectedRoute>
  }
/>
```

### Axios Interceptor

```javascript
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.VITE_API_URL
});

// Request interceptor - Add token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(
          `${process.env.VITE_API_URL}/auth/refresh`,
          { refreshToken }
        );

        const { accessToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
```

---

## Password Security

### Password Requirements

- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 digit
- At least 1 special character (@, #, $, %, etc.)

### Password Validation

```javascript
const validatePassword = (password) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(password);
};
```

### Password Hashing

Passwords are hashed using bcrypt:

```javascript
const bcrypt = require('bcrypt');

// Hash password on registration
const hashedPassword = await bcrypt.hash(password, 10);

// Verify password on login
const isMatch = await bcrypt.compare(password, hashedPassword);
```

---

## Security Best Practices

### Token Security

1. **Store in HttpOnly Cookies** (Recommended)
   ```javascript
   res.cookie('accessToken', token, {
     httpOnly: true,
     secure: true,
     sameSite: 'strict',
     maxAge: 7 * 24 * 60 * 60 * 1000
   });
   ```

2. **Or Store in localStorage** (Current Implementation)
   ```javascript
   localStorage.setItem('accessToken', token);
   ```

### CORS Configuration

```javascript
const cors = require('cors');

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, please try again later',
  skipSuccessfulRequests: true
});

app.post('/auth/login', loginLimiter, login);
```

---

## Multi-Tenant Security

### School Isolation

All queries filter by schoolId:

```javascript
// Good - Filtered by schoolId
const sessions = await Session.find({
  schoolId: req.user.schoolId
});

// Bad - No school filter (SECURITY BREACH)
const sessions = await Session.find();
```

### Query Building Pattern

```javascript
const buildQuery = (schoolId, filters = {}) => {
  const query = {
    schoolId,
    deletedAt: null
  };

  if (filters.status) {
    query.status = filters.status;
  }

  return query;
};

// Usage
const query = buildQuery(req.user.schoolId, req.query);
const sessions = await Session.find(query);
```

---

## Troubleshooting Authentication

### "Invalid token" Error

**Cause:** Token expired or corrupted
**Solution:** 
1. Clear browser cache/cookies
2. Log in again
3. Check token expiry in backend logs

### "Insufficient permissions" Error

**Cause:** User role doesn't have required permissions
**Solution:**
1. Check user role in database
2. Verify endpoint requires specific role
3. Contact admin to upgrade role

### "Cannot access other schools" Error

**Cause:** User from different school trying to access data
**Solution:**
1. This is expected behavior
2. Each user can only access their school's data
3. SUPERADMIN can access all schools

---

## Token Structure

JWT token contains:

```javascript
{
  iat: 1234567890,           // Issued at
  exp: 1234654290,           // Expiration time
  sub: "507f1f77bcf86cd799439015",  // Subject (User ID)
  email: "user@school.com",
  role: "TEACHER",
  schoolId: "507f1f77bcf86cd799439012"
}
```

Decode JWT (for debugging):
```javascript
const jwt = require('jsonwebtoken');
const decoded = jwt.decode(token); // No verification
```

---

## Session Management

### Login Log Model

```javascript
{
  userId: ObjectId,
  schoolId: ObjectId,
  loginTime: Date,
  logoutTime: Date,
  ipAddress: String,
  userAgent: String,
  status: Enum  // SUCCESS, FAILED
}
```

### Track Login Activity

```javascript
await LoginLog.create({
  userId: user._id,
  schoolId: user.schoolId,
  loginTime: new Date(),
  ipAddress: req.ip,
  userAgent: req.get('user-agent'),
  status: 'SUCCESS'
});
```

---

## Support

For authentication issues:
1. Check backend logs
2. Verify token in jwt.io
3. Check user role and school assignment
4. Verify environment variables