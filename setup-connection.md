# 🚀 CrackZone Frontend-Backend Connection Setup

## ✅ What's Been Done

The frontend and backend are now fully connected with:

### 🔧 **API Integration**
- ✅ Complete API service layer with automatic token management
- ✅ Authentication service with login/signup/logout
- ✅ Tournament and team management services
- ✅ Real-time WebSocket connection via Socket.io
- ✅ Image upload service with compression
- ✅ Error handling and retry logic

### 📱 **Mobile App Updates**
- ✅ Login screen integrated with backend authentication
- ✅ Signup screen with validation and API calls
- ✅ Profile screen showing real user data
- ✅ Tournaments screen loading data from API
- ✅ Authentication state management with React hooks
- ✅ API test screen for debugging connection

### 🐳 **Docker Support**
- ✅ Full-stack Docker Compose configuration
- ✅ Development and production environments
- ✅ Automatic service orchestration

## 🏃‍♂️ Quick Start

### Option 1: Manual Start (Recommended for Development)

1. **Start Backend:**
   ```bash
   cd backend
   npm run dev
   ```
   ✅ Backend will run on http://localhost:3000

2. **Start Mobile App:**
   ```bash
   cd MobileApp
   npm start
   ```
   ✅ Expo will start on http://localhost:8081

### Option 2: Docker (Production-like)

```bash
docker-compose -f docker-compose.full-stack.yml up -d
```

## 🧪 Testing the Connection

### 1. **API Test Screen**
- Open the mobile app
- Tap the bug icon (🐛) in the top-right of the home screen
- Run individual tests or "Run All Tests"
- Check if all tests pass ✅

### 2. **Manual Testing**
1. **Health Check:**
   ```bash
   curl http://localhost:3000/health
   ```
   Should return: `{"status":"OK",...}`

2. **Test Signup:**
   - Open mobile app
   - Go to signup screen
   - Create a test account
   - Should redirect to OTP verification

3. **Test Login:**
   - Use the login screen
   - Enter your credentials
   - Should redirect to main app

4. **Test Tournaments:**
   - Go to tournaments tab
   - Should load tournaments from API
   - Try joining a tournament

## 🔍 Current Status

### ✅ **Working Features:**
- Backend API server running
- Mobile app connecting to backend
- User authentication (signup/login/logout)
- Tournament data loading
- Profile data display
- Real-time WebSocket connection
- Image upload functionality
- Error handling and loading states

### 🚧 **Next Steps:**
- Complete OTP verification flow
- Add more tournament features
- Implement team management
- Add push notifications
- Complete all API endpoints

## 🐛 Troubleshooting

### Common Issues:

#### 1. **"Network request failed"**
**Cause:** Mobile app can't reach backend
**Solution:**
- Ensure backend is running: `npm run dev` in backend folder
- Check backend URL in mobile app (should be `http://localhost:3000`)
- For Android emulator, try `http://10.0.2.2:3000`

#### 2. **CORS errors**
**Cause:** Backend not allowing mobile app origin
**Solution:**
- Check `CORS_ORIGIN` in backend `.env` file
- Should include: `http://localhost:8081,http://localhost:19006`

#### 3. **Database errors**
**Cause:** PostgreSQL not running or wrong connection
**Solution:**
- Start PostgreSQL service
- Check `DATABASE_URL` in backend `.env`
- Run: `npm run db:migrate` in backend

#### 4. **Authentication issues**
**Cause:** JWT token problems
**Solution:**
- Check `JWT_SECRET` in backend `.env`
- Clear app storage/cache
- Try logging out and back in

### Debug Commands:

```bash
# Check if backend is running
curl http://localhost:3000/health

# Check backend logs
cd backend && npm run dev

# Check mobile app logs
cd MobileApp && npm start

# Check running processes
netstat -tulpn | grep :3000
netstat -tulpn | grep :8081
```

## 📊 Service URLs

When everything is running:

- **Backend API:** http://localhost:3000/api
- **Backend Health:** http://localhost:3000/health
- **Mobile App:** http://localhost:8081
- **Expo DevTools:** http://localhost:19002

## 🎯 Testing Checklist

- [ ] Backend health check passes
- [ ] Mobile app loads without errors
- [ ] Can create new account (signup)
- [ ] Can login with existing account
- [ ] Profile shows user data
- [ ] Tournaments load from API
- [ ] Can join tournaments
- [ ] Logout works properly
- [ ] API test screen shows all green ✅

## 🔄 Development Workflow

1. **Make backend changes** → Backend auto-reloads
2. **Make mobile app changes** → App hot-reloads
3. **Test API changes** → Use API test screen
4. **Check logs** → Monitor both backend and mobile app consoles

## 📚 Key Files

### Backend:
- `backend/src/server.ts` - Main server
- `backend/src/controllers/` - API endpoints
- `backend/.env` - Configuration

### Mobile App:
- `MobileApp/services/` - API integration
- `MobileApp/hooks/useAuth.ts` - Authentication
- `MobileApp/app/api-test.tsx` - Connection testing
- `MobileApp/constants/Config.ts` - Configuration

## 🎉 Success!

Your CrackZone frontend and backend are now connected and ready for development!

**Next:** Start building features, add more API endpoints, and enhance the user experience.

---

**Need help?** Check the logs, use the API test screen, or refer to the troubleshooting section above.