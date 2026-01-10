# CrackZone Tournament App

A full-stack gaming tournament platform with mobile app and backend API.

## Project Structure

```
crackzone/
├── backend/          # Node.js/Express API server
│   ├── src/         # Source code
│   ├── prisma/      # Database schema
│   └── package.json
├── MobileApp/       # React Native/Expo mobile app
│   ├── app/         # App screens and navigation
│   ├── components/  # Reusable UI components
│   ├── services/    # API services
│   └── package.json
└── docker-compose.full-stack.yml
```

## Features

### Mobile App
- 🎮 User authentication (signup, login, OTP verification)
- 🏆 Tournament management
- 👥 Team creation and management
- 📊 Leaderboards and statistics
- 💰 Rewards and transactions
- 🔔 Real-time notifications

### Backend API
- 🔐 JWT-based authentication
- 📧 Email verification with OTP
- 🗄️ PostgreSQL database with Prisma ORM
- 🚀 Real-time features with Socket.io
- 📁 Image upload with Cloudinary
- 🛡️ Rate limiting and security middleware

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Expo CLI for mobile development

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure your database and email settings in .env
npm run dev
```

### Mobile App Setup
```bash
cd MobileApp
npm install
npx expo start
```

### Full Stack with Docker
```bash
docker-compose -f docker-compose.full-stack.yml up
```

## Development

### API Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-email` - Email verification
- `GET /api/tournaments` - List tournaments
- `POST /api/teams` - Create team

### Mobile App Structure
- `/app/(auth)/` - Authentication screens
- `/app/(tabs)/` - Main app tabs
- `/components/` - Reusable components
- `/services/` - API integration

## Configuration

### Environment Variables (Backend)
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/crackzone_db
JWT_SECRET=your-jwt-secret
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
CLOUDINARY_URL=cloudinary://your-cloudinary-config
```

### API Configuration (Mobile)
Update `MobileApp/constants/Config.ts` with your backend URL:
```typescript
BASE_URL: 'http://your-ip:3000/api'
```

## Tech Stack

### Backend
- Node.js + Express
- TypeScript
- Prisma ORM + PostgreSQL
- Socket.io for real-time features
- Nodemailer for emails
- Cloudinary for image storage

### Mobile App
- React Native + Expo
- TypeScript
- Expo Router for navigation
- AsyncStorage for local data

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details