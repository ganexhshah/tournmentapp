# Admin Panel

A modern React admin panel built with Vite and Tailwind CSS for managing gaming tournaments, teams, users, and matches. **Now integrated with the CrackZone backend API.**

## Features

- 🔐 **Authentication System** - Secure login with JWT tokens (Admin/Moderator only)
- 📊 **Dashboard** - Real-time overview of platform metrics
- 👥 **User Management** - Manage platform users with ban/unban functionality
- 🏆 **Tournament Management** - Create and manage tournaments
- 👨‍👩‍👧‍👦 **Team Management** - Handle team creation and performance tracking
- 🎮 **Match Management** - Schedule and track match results
- 📱 **Responsive Design** - Works on desktop and mobile devices
- 🎨 **Modern UI** - Clean interface with Tailwind CSS
- 🔄 **Real-time Data** - Connected to CrackZone backend API

## Backend Integration

The admin panel is now fully integrated with the CrackZone backend:

- **Authentication**: Uses the same JWT system as the mobile app
- **Role-based Access**: Only ADMIN and MODERATOR roles can access
- **Real-time Data**: Fetches live data from the database
- **User Management**: Ban/unban users, view profiles, manage roles
- **Tournament Management**: Full CRUD operations on tournaments
- **Team Management**: View and manage teams
- **Match Management**: Schedule matches, update results

## Getting Started

### Prerequisites

1. **Backend Server**: Make sure the CrackZone backend is running on `http://localhost:3000`
2. **Admin User**: Create an admin user in the database

### Create Admin User

Run this script to create an admin user:

```bash
cd backend
node scripts/create-admin.js
```

This creates an admin user with:
- **Email:** admin@crackzone.com
- **Password:** admin123
- **Role:** ADMIN

### Start Admin Panel

1. **Install dependencies:**
   ```bash
   cd admin-panel
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Access the panel:**
   - Open http://localhost:3001
   - Login with admin credentials

### Build for Production

```bash
npm run build
```

## Environment Configuration

Create a `.env` file in the admin-panel directory:

```env
VITE_API_URL=http://localhost:3000/api
VITE_NODE_ENV=development
```

For production, update the API URL to your production backend.

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Lucide React** - Icons
- **Axios** - HTTP client for API calls

## API Integration

The admin panel connects to these backend endpoints:

### Authentication
- `POST /api/auth/login` - Admin login
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/logout` - Logout

### Users
- `GET /api/users` - List users with pagination/search
- `GET /api/users/:id` - Get user details
- `PUT /api/users/:id` - Update user
- `POST /api/users/:id/ban` - Ban user
- `POST /api/users/:id/unban` - Unban user

### Tournaments
- `GET /api/tournaments` - List tournaments
- `POST /api/tournaments` - Create tournament
- `PUT /api/tournaments/:id` - Update tournament
- `DELETE /api/tournaments/:id` - Delete tournament

### Teams
- `GET /api/teams` - List teams
- `GET /api/teams/:id` - Get team details

### Matches
- `GET /api/matches` - List matches
- `POST /api/matches` - Create match
- `PUT /api/matches/:id` - Update match

## Security

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access**: Only ADMIN and MODERATOR roles allowed
- **CORS Protection**: Backend configured for admin panel origin
- **Input Validation**: All API calls include proper validation
- **Error Handling**: Comprehensive error handling and user feedback

## Features Overview

### Dashboard
- Real-time statistics from the database
- Recent activity feed
- Quick action buttons
- Performance metrics

### User Management
- Paginated user listing with search
- User profile viewing
- Ban/unban functionality
- Role management
- Account status tracking

### Tournament Management
- Tournament creation and editing
- Status tracking (Draft/Open/Active/Completed)
- Participant management
- Prize pool tracking

### Team Management
- Team listing and details
- Performance statistics
- Member management
- Win/loss tracking

### Match Management
- Match scheduling
- Live match indicators
- Result submission
- Tournament association

## Development

### Adding New Features

1. **API Service**: Add new service methods in `src/services/`
2. **Components**: Create reusable components in `src/components/`
3. **Pages**: Add new pages in `src/pages/`
4. **Routes**: Update routing in `src/App.tsx`

### Error Handling

The admin panel includes comprehensive error handling:
- API errors are caught and displayed to users
- Authentication errors redirect to login
- Loading states for better UX
- Form validation and feedback

## Deployment

### Frontend Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Deploy the `dist` folder to your web server

3. Configure environment variables for production

### Backend Configuration

Ensure your backend `.env` includes the admin panel URL in CORS settings:

```env
CORS_ORIGIN=http://localhost:8081,http://localhost:3001,https://your-admin-domain.com
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend CORS includes admin panel URL
2. **Authentication Fails**: Check if admin user exists and has correct role
3. **API Connection**: Verify backend is running and accessible
4. **Role Access**: Only ADMIN and MODERATOR roles can access

### Debug Mode

Set `VITE_NODE_ENV=development` in `.env` for detailed error logging.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.