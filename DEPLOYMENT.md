# Deployment & Production Guide

## Deployment Checklist

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database backed up
- [ ] SSL certificates obtained
- [ ] Frontend build optimized
- [ ] Backend performance tuned
- [ ] Monitoring setup
- [ ] Error logging configured
- [ ] CDN configured (if needed)
- [ ] Domain configured
- [ ] HTTPS enabled

---

## Backend Deployment

### Docker Deployment

#### Create Dockerfile

```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY src ./src

# Copy config and other necessary files
COPY .env.production .env

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/v1/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start application
CMD ["node", "src/server.js"]
```

#### Build and Push Docker Image

```bash
# Build image
docker build -t multischool-backend:1.0.0 .

# Tag for registry
docker tag multischool-backend:1.0.0 your-registry.azurecr.io/multischool-backend:1.0.0

# Push to registry
docker push your-registry.azurecr.io/multischool-backend:1.0.0
```

#### Run Container

```bash
docker run -d \
  -p 5000:5000 \
  -e NODE_ENV=production \
  -e MONGODB_URI=mongodb://mongo:27017/multischool \
  -e JWT_SECRET=your_production_secret \
  --name multischool-backend \
  multischool-backend:1.0.0
```

---

### Docker Compose

#### docker-compose.yml

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6.0
    container_name: multischool-mongodb
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
      MONGO_INITDB_DATABASE: multischool-idcard
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    networks:
      - multischool-network
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/test --quiet
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: multischool-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - multischool-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: multischool-backend
    depends_on:
      mongodb:
        condition: service_healthy
      redis:
        condition: service_healthy
    environment:
      NODE_ENV: production
      PORT: 5000
      MONGODB_URI: mongodb://admin:${MONGO_PASSWORD}@mongodb:27017/multischool-idcard
      MONGODB_USER: admin
      MONGODB_PASS: ${MONGO_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      JWT_EXPIRY: 7d
      REDIS_URL: redis://redis:6379
      FRONTEND_URL: ${FRONTEND_URL}
      SMTP_HOST: ${SMTP_HOST}
      SMTP_PORT: ${SMTP_PORT}
      SMTP_USER: ${SMTP_USER}
      SMTP_PASS: ${SMTP_PASS}
    ports:
      - "5000:5000"
    networks:
      - multischool-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/api/v1/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: multischool-frontend
    depends_on:
      - backend
    environment:
      VITE_API_URL: ${BACKEND_URL}
      VITE_APP_NAME: Multischool ID Card System
    ports:
      - "80:3000"
    networks:
      - multischool-network
    restart: unless-stopped

volumes:
  mongodb_data:
  redis_data:

networks:
  multischool-network:
    driver: bridge
```

#### Run with Docker Compose

```bash
# Create .env.production file
cp .env.example .env.production

# Edit .env.production with production values
nano .env.production

# Start all services
docker-compose -f docker-compose.yml up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

---

### Kubernetes Deployment

#### deployment.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: multischool-backend
  labels:
    app: multischool-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: multischool-backend
  template:
    metadata:
      labels:
        app: multischool-backend
    spec:
      containers:
      - name: backend
        image: your-registry.azurecr.io/multischool-backend:1.0.0
        imagePullPolicy: IfNotPresent
        ports:
        - containerPort: 5000
        env:
        - name: NODE_ENV
          value: "production"
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: multischool-secrets
              key: mongodb-uri
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: multischool-secrets
              key: jwt-secret
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/v1/health
            port: 5000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/v1/health
            port: 5000
          initialDelaySeconds: 5
          periodSeconds: 5
```

#### service.yaml

```yaml
apiVersion: v1
kind: Service
metadata:
  name: multischool-backend-service
spec:
  selector:
    app: multischool-backend
  type: LoadBalancer
  ports:
  - protocol: TCP
    port: 5000
    targetPort: 5000
```

#### Deploy to Kubernetes

```bash
# Create namespace
kubectl create namespace multischool

# Create secrets
kubectl create secret generic multischool-secrets \
  --from-literal=mongodb-uri=mongodb://... \
  --from-literal=jwt-secret=... \
  -n multischool

# Apply deployments
kubectl apply -f deployment.yaml -n multischool
kubectl apply -f service.yaml -n multischool

# Check status
kubectl get pods -n multischool
kubectl logs -f deployment/multischool-backend -n multischool
```

---

## Frontend Deployment

### Vercel Deployment

#### 1. Connect Repository

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy frontend
cd frontend
vercel --prod
```

#### 2. Configure Environment

In Vercel Dashboard:
1. Project Settings → Environment Variables
2. Add `VITE_API_URL=https://api.production.com`
3. Redeploy

#### 3. Custom Domain

1. Go to Vercel Dashboard
2. Project Settings → Domains
3. Add custom domain
4. Configure DNS records

---

### Netlify Deployment

#### 1. Connect Repository

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
cd frontend
netlify deploy --prod
```

#### 2. Configure Build

Create `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  VITE_API_URL = "https://api.production.com"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

### AWS S3 + CloudFront

#### 1. Create S3 Bucket

```bash
aws s3 mb s3://multischool-frontend-prod

# Block public access
aws s3api put-public-access-block \
  --bucket multischool-frontend-prod \
  --public-access-block-configuration \
  "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
```

#### 2. Build and Upload

```bash
# Build frontend
npm run build

# Sync to S3
aws s3 sync dist/ s3://multischool-frontend-prod --delete
```

#### 3. Setup CloudFront Distribution

```bash
# Create distribution with S3 as origin
aws cloudfront create-distribution \
  --origin-domain-name multischool-frontend-prod.s3.amazonaws.com \
  --default-root-object index.html
```

#### 4. Invalidate Cache

```bash
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

---

## Production Environment Setup

### Environment Variables (.env.production)

```env
# Server
NODE_ENV=production
PORT=5000
LOG_LEVEL=info

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/multischool-idcard
MONGODB_USER=admin
MONGODB_PASS=secure_password_123
DB_POOL_SIZE=20

# JWT
JWT_SECRET=very_long_secure_secret_key_with_random_characters
JWT_EXPIRY=7d
JWT_REFRESH_SECRET=another_very_long_secure_secret_key
JWT_REFRESH_EXPIRY=30d

# Frontend
FRONTEND_URL=https://app.multischool.com

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=production-email@multischool.com
SMTP_PASS=app_specific_password
SMTP_FROM=noreply@multischool.com

# SSL
SSL_KEY_PATH=/etc/ssl/private/key.pem
SSL_CERT_PATH=/etc/ssl/certs/cert.pem

# Monitoring
SENTRY_DSN=https://key@sentry.io/project

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100

# Cache
REDIS_URL=redis://user:pass@redis-host:6379

# Analytics
GOOGLE_ANALYTICS_ID=UA-XXXXXX-X
```

---

## Database Optimization

### MongoDB Indexing

```javascript
// Ensure indexes for performance
db.sessions.createIndex({ schoolId: 1, deletedAt: 1 });
db.sessions.createIndex({ schoolId: 1, sessionCode: 1 }, { unique: true, partialFilterExpression: { deletedAt: null } });
db.promotionhistories.createIndex({ schoolId: 1, studentId: 1, promotionDate: -1 });
db.promotionhistories.createIndex({ batchPromotionId: 1, isRolledBack: 1 });
```

### Connection Pooling

```javascript
mongoose.connect(process.env.MONGODB_URI, {
  maxPoolSize: 20,
  minPoolSize: 10,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 5000,
  retryWrites: true,
  w: 'majority'
});
```

### Query Optimization

```javascript
// Bad: Returns unnecessary fields
const session = await Session.findById(id);

// Good: Select only needed fields
const session = await Session.findById(id).select('sessionName status isActive');

// Good: Use indexes
const sessions = await Session.find({ schoolId, status: 'ACTIVE' }).lean();
```

---

## Monitoring & Logging

### Logging Setup

```javascript
// backend/src/utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: 'exceptions.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
```

### Application Performance Monitoring (APM)

```javascript
// Sentry for error tracking
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

### Health Check Endpoint

```javascript
app.get('/api/v1/health', async (req, res) => {
  try {
    // Check database
    await mongoose.connection.db.admin().ping();
    
    res.json({
      status: 'healthy',
      timestamp: new Date(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      mongodb: 'connected',
      redis: 'connected'
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});
```

---

## Security Hardening

### HTTPS/SSL

```javascript
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync(process.env.SSL_KEY_PATH),
  cert: fs.readFileSync(process.env.SSL_CERT_PATH)
};

https.createServer(options, app).listen(5000);
```

### Security Headers

```javascript
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

### Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);
```

---

## Backup & Disaster Recovery

### MongoDB Backup

```bash
# Daily backup
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/multischool-idcard" \
  --out=/backups/mongo-$(date +%Y%m%d)

# Upload to S3
aws s3 cp /backups/mongo-$(date +%Y%m%d) \
  s3://multischool-backups/ --recursive
```

### Automated Backup Script

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backups"
S3_BUCKET="s3://multischool-backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup
mongodump --uri="$MONGODB_URI" --out="$BACKUP_DIR/backup_$DATE"

# Compress
tar -czf "$BACKUP_DIR/backup_$DATE.tar.gz" "$BACKUP_DIR/backup_$DATE"

# Upload to S3
aws s3 cp "$BACKUP_DIR/backup_$DATE.tar.gz" "$S3_BUCKET/"

# Cleanup old backups (keep 30 days)
find "$BACKUP_DIR" -name "backup_*.tar.gz" -mtime +30 -delete

echo "Backup completed: backup_$DATE"
```

### Restore from Backup

```bash
# Download from S3
aws s3 cp s3://multischool-backups/backup_20240115.tar.gz .

# Extract
tar -xzf backup_20240115.tar.gz

# Restore
mongorestore --uri="mongodb+srv://user:pass@cluster.mongodb.net/multischool-idcard" \
  --dir=./backup_20240115
```

---

## Performance Optimization

### Frontend Optimization

```javascript
// Vite configuration
export default {
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'redux', '@reduxjs/toolkit'],
          'mui': ['@mui/material', '@mui/icons-material']
        }
      }
    },
    sourcemap: false
  }
};
```

### Backend Optimization

```javascript
// Caching with Redis
const redis = require('redis');
const client = redis.createClient({ url: process.env.REDIS_URL });

app.get('/api/v1/sessions/:id', async (req, res) => {
  const cacheKey = `session:${req.params.id}`;
  
  // Check cache
  const cached = await client.get(cacheKey);
  if (cached) {
    return res.json(JSON.parse(cached));
  }

  // Fetch from DB
  const session = await Session.findById(req.params.id);

  // Cache for 1 hour
  await client.setEx(cacheKey, 3600, JSON.stringify(session));

  res.json(session);
});
```

---

## Post-Deployment Verification

### Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Integration tests
npm run test:integration
```

### Health Checks

```bash
# Frontend
curl https://app.multischool.com

# Backend
curl https://api.multischool.com/api/v1/health

# Database
mongosh "mongodb+srv://user:pass@cluster/multischool-idcard"
```

### Smoke Tests

```bash
# Login test
curl -X POST https://api.multischool.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"test@test.com","password":"password"}'

# Session test
curl https://api.multischool.com/api/v1/sessions \
  -H "Authorization: Bearer <token>"
```

---

## Troubleshooting Production Issues

### High Memory Usage

```bash
# Check Node process memory
node --max-old-space-size=4096 src/server.js

# Check MongoDB connections
db.serverStatus().connections
```

### Database Connection Issues

```bash
# Test connection
mongosh "mongodb+srv://user:pass@cluster/multischool-idcard"

# Check connection pool
db.currentOp()
```

### API Response Time Issues

```javascript
// Add timing middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.path} - ${duration}ms`);
  });
  next();
});
```

---

## Support & Monitoring

### Monitoring Dashboard

- Server status
- Request metrics
- Error rates
- Database performance
- User activity

### Alert Rules

- Server down
- High error rate (>1%)
- Slow API response (>5s)
- Database connection failed
- Disk space low
- Memory usage high (>80%)

---

## Further Reading

- [Node.js Production Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Security Best Practices](https://owasp.org/www-project-top-ten/)