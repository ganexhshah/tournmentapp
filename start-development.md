# CrackZone Development Setup Guide

This guide will help you get both the backend and mobile app running together.

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)

1. **Start all services:**
   ```bash
   docker-compose -f docker-compose.full-stack.yml up -d
   ```

2. **Check service status:**
   ```bash
   docker-compose -f docker-compose.full-stack.yml ps
   ```

3. **View logs:**
   ```bash
   # All services
   docker-compose -f docker-compose.full-stack.yml logs -f
   
   # Specific service
   docker-compose -f docker-compose.full-stack.yml logs -f backend
   docker-compose -f docker-compose.full-stack.yml logs -f mobile-app
   ```

4. **Stop services:**
   ```bash
   docker-compose -f docker-compose.full-stack.yml down
   ```

### Option 2: Manual Setup

#### Backend Setup

1. **Navigate to backend:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Setup environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Setup database:**
   ```bash
   # Start PostgreSQL (if not using Docker)
   # Update DATABASE_URL in .env
   
   # Run migrations
   npm run db:migrate
   npm run db:generate
   ```

5. **Start backend:**
   ```bash
   npm run dev
   ```

#### Mobile App Setup

1. **Navigate to mobile app:**
   ```bash
   cd MobileApp
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start Expo development server:**
   ```bash
   npm start
   ```

4. **Run on device/simulator:**
   ```bash
   # iOS Simulator
   npm run ios
   
   # Android Emulator
   npm run android
   
   # Web browser
   npm run web
   ```

## 🔧 Configuration

### Backend Configuration

Update `backend/.env`:

```env
# Database
DATABASE_URL="postgresql://postgres:admin@localhost:5432/crackzone_db"

# Server
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# CORS (Important for mobile app)
CORS_ORIGIN=http://localhost:8081,http://localhost:19006,http://localhost:19000
SOCKET_CORS_ORIGIN=http://localhost:8081,http://localhost:19006,http://localhost:19000

# Add your Cloudinary and email configs
```

### Mobile App Configuration

The mobile app automatically detects the environment and connects to:
- **Development**: `http://localhost:3000/api`
- **Production**: Your production API URL

Update `MobileApp/constants/Config.ts` if needed:

```typescript
export const API_CONFIG = {
  [ENV.DEV]: {
    BASE_URL: 'http://localhost:3000/api',
    SOCKET_URL: 'http://localhost:3000',
  },
  // ... other environments
};
```

## 📱 Testing the Connection

### 1. Check Backend Health

```bash
curl http://localhost:3000/health
```

Should return:
```json
{
  "status": "OK",
  "timestamp": "2024-01-10T...",
  "uptime": 123.456
}
```

### 2. Test API Endpoints

```bash
# Get tournaments (should return empty array initially)
curl http://localhost:3000/api/tournaments

# Test auth endpoint
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"password123"}'
```

### 3. Test Mobile App Connection

1. Open the mobile app
2. Navigate to the example screen (`examples/ApiUsageExample.tsx`)
3. Try logging in with test credentials
4. Check if tournaments and teams load

## 🐛 Troubleshooting

### Common Issues

#### 1. "Network request failed" in mobile app

**Cause**: Mobile app can't reach backend

**Solutions**:
- Ensure backend is running on `http://localhost:3000`
- For Android emulator, try `http://10.0.2.2:3000` instead
- Check firewall settings
- Verify CORS configuration in backend

#### 2. Database connection errors

**Cause**: PostgreSQL not running or wrong credentials

**Solutions**:
- Start PostgreSQL service
- Check DATABASE_URL in `.env`
- Verify database exists and user has permissions

#### 3. Socket.io connection issues

**Cause**: WebSocket connection blocked or misconfigured

**Solutions**:
- Check SOCKET_CORS_ORIGIN in backend `.env`
- Verify no proxy/firewall blocking WebSocket connections
- Check browser/app network permissions

#### 4. CORS errors

**Cause**: Backend not allowing mobile app origin

**Solutions**:
- Add mobile app URLs to CORS_ORIGIN in backend `.env`
- Common mobile app origins:
  - `http://localhost:8081` (Expo Metro)
  - `http://localhost:19006` (Expo web)
  - `http://localhost:19000` (Expo DevTools)

#### 5. JWT/Authentication issues

**Cause**: Token problems or mismatched secrets

**Solutions**:
- Check JWT_SECRET matches between environments
- Clear app storage/cache
- Check token expiration times
- Verify auth endpoints are working

### Debug Commands

```bash
# Check running processes
netstat -tulpn | grep :3000
netstat -tulpn | grep :8081

# Check Docker containers
docker ps
docker logs crackzone-backend
docker logs crackzone-mobile-app

# Check database connection
psql -h localhost -U postgres -d crackzone_db -c "SELECT version();"

# Check Redis connection
redis-cli ping
```

## 📊 Service URLs

When everything is running:

- **Backend API**: http://localhost:3000/api
- **Backend Health**: http://localhost:3000/health
- **Mobile App (Expo)**: http://localhost:8081
- **Expo DevTools**: http://localhost:19002
- **Database**: localhost:5432
- **Redis**: localhost:6379
- **Nginx (if used)**: http://localhost:80

## 🔄 Development Workflow

### 1. Daily Development

```bash
# Start backend
cd backend && npm run dev

# In another terminal, start mobile app
cd MobileApp && npm start
```

### 2. Making API Changes

1. Update backend code
2. Backend auto-reloads (nodemon)
3. Update mobile app services if needed
4. Mobile app hot-reloads

### 3. Database Changes

```bash
cd backend
npm run db:migrate
npm run db:generate
```

### 4. Adding New Features

1. Add backend endpoints
2. Update mobile app services
3. Create/update React components
4. Test the integration

## 🚀 Production Deployment

### Backend Deployment

1. Build the backend:
   ```bash
   cd backend
   npm run build
   ```

2. Deploy using Docker:
   ```bash
   docker build -t crackzone-backend .
   docker run -p 3000:3000 crackzone-backend
   ```

### Mobile App Deployment

1. Build for production:
   ```bash
   cd MobileApp
   expo build:android
   expo build:ios
   ```

2. Update API URLs in `Config.ts` for production

## 📚 Next Steps

1. **Authentication Flow**: Implement complete login/signup screens
2. **Tournament Features**: Add tournament creation and management
3. **Team Management**: Implement team features
4. **Real-time Updates**: Add Socket.io event handling
5. **Push Notifications**: Implement push notification system
6. **Offline Support**: Add offline data caching
7. **Testing**: Add unit and integration tests

## 🤝 Contributing

1. Follow the established patterns in services
2. Add proper TypeScript types
3. Handle errors appropriately
4. Update documentation
5. Test both backend and mobile app changes

---

Your CrackZone frontend and backend are now connected! 🎉