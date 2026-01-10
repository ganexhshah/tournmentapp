# CrackZone Backend API

A comprehensive Node.js backend API for the CrackZone gaming platform, built with Express, Prisma ORM, JWT authentication, Redis caching, Socket.io real-time features, PostgreSQL database, and Nginx load balancing.

## 🚀 Features

- **Express.js** - Fast, unopinionated web framework
- **Prisma ORM** - Type-safe database access with PostgreSQL
- **JWT Authentication** - Secure user authentication with refresh tokens
- **Redis Caching** - High-performance caching and session management
- **Socket.io** - Real-time communication for tournaments, teams, and matches
- **Nginx Load Balancer** - Distributed load balancing across multiple instances
- **PostgreSQL** - Robust relational database
- **TypeScript** - Type-safe development
- **Docker** - Containerized deployment
- **Rate Limiting** - API protection against abuse
- **Email Service** - User verification and notifications
- **File Upload** - Cloudinary integration for media management

## 📋 Prerequisites

- Node.js 18+ 
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+

## 🛠️ Installation

### 1. Clone and Setup

```bash
cd backend
npm install
```

### 2. Environment Configuration

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/crackzone_db"

# Server
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret-here
JWT_REFRESH_EXPIRES_IN=30d

# Redis
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Or run migrations (for production)
npm run db:migrate
```

### 4. Development

```bash
# Start development server
npm run dev

# View database
npm run db:studio
```

## 🐳 Docker Deployment

### Development
```bash
docker-compose -f docker-compose.dev.yml up -d
```

### Production
```bash
docker-compose up -d
```

This will start:
- **PostgreSQL** on port 5432
- **Redis** on port 6379  
- **Backend API** (3 instances) behind Nginx
- **Nginx Load Balancer** on ports 80/443

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/verify-email` - Email verification
- `GET /api/auth/me` - Get current user profile

### Users
- `GET /api/users` - List users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user profile
- `DELETE /api/users/:id` - Delete user

### Tournaments
- `GET /api/tournaments` - List tournaments
- `POST /api/tournaments` - Create tournament
- `GET /api/tournaments/:id` - Get tournament details
- `PUT /api/tournaments/:id` - Update tournament
- `DELETE /api/tournaments/:id` - Delete tournament
- `POST /api/tournaments/:id/join` - Join tournament
- `POST /api/tournaments/:id/leave` - Leave tournament

### Teams
- `GET /api/teams` - List teams
- `POST /api/teams` - Create team
- `GET /api/teams/:id` - Get team details
- `PUT /api/teams/:id` - Update team
- `DELETE /api/teams/:id` - Delete team
- `POST /api/teams/:id/join` - Join team
- `POST /api/teams/:id/leave` - Leave team

### Matches
- `GET /api/matches` - List matches
- `POST /api/matches` - Create match
- `GET /api/matches/:id` - Get match details
- `PUT /api/matches/:id` - Update match
- `POST /api/matches/:id/result` - Submit match result

## 🔌 Socket.io Events

### Connection
- `connection` - User connects
- `disconnect` - User disconnects

### Rooms
- `join_tournament` - Join tournament room
- `leave_tournament` - Leave tournament room
- `join_team` - Join team room
- `leave_team` - Leave team room
- `join_match` - Join match room
- `leave_match` - Leave match room

### Messaging
- `send_message` - Send chat message
- `new_message` - Receive chat message
- `typing_start` - User starts typing
- `typing_stop` - User stops typing

## 🗄️ Database Schema

The database includes the following main entities:

- **Users** - User accounts and profiles
- **Teams** - Gaming teams and memberships
- **Tournaments** - Tournament management
- **Matches** - Individual game matches
- **Transactions** - Financial transactions
- **Notifications** - User notifications
- **Rewards** - Achievement system
- **Orders** - E-commerce orders

## 🔧 Configuration

### Nginx Load Balancer
- Configured for 3 backend instances
- Rate limiting for API and auth endpoints
- WebSocket support for Socket.io
- SSL/HTTPS ready (certificates needed)
- Static file serving for uploads

### Redis Caching
- User session caching
- API response caching
- Rate limiting storage
- Real-time data synchronization

### Security Features
- JWT token authentication
- Password hashing with bcrypt
- Rate limiting protection
- CORS configuration
- Helmet security headers
- Input validation
- SQL injection protection

## 📊 Monitoring & Health

- Health check endpoint: `GET /health`
- Docker health checks configured
- Nginx access and error logs
- Application logging with Morgan

## 🚀 Production Deployment

1. **Environment Setup**
   - Configure production environment variables
   - Set up SSL certificates for Nginx
   - Configure email service (SMTP)
   - Set up Cloudinary for file uploads

2. **Database Migration**
   ```bash
   npm run db:migrate
   ```

3. **Docker Deployment**
   ```bash
   docker-compose up -d
   ```

4. **Scaling**
   - Add more backend instances in docker-compose.yml
   - Update Nginx upstream configuration
   - Configure database connection pooling

## 🔍 Development Tools

- **TypeScript** - Type safety
- **ESLint** - Code linting
- **Prisma Studio** - Database GUI
- **Nodemon** - Development auto-reload
- **Jest** - Testing framework (configured)

## 📝 Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Prisma Studio
npm run lint         # Run ESLint
npm run test         # Run tests
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.