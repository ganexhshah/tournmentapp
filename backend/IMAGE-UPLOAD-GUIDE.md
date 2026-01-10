# 📸 CrackZone Image Upload System

## 🎯 Overview

Complete image management system using **Cloudinary** for the CrackZone gaming platform. Handles avatars, team logos, tournament banners, and game screenshots with automatic optimization and transformations.

## ⚙️ Cloudinary Configuration

### Environment Variables
```env
CLOUDINARY_URL=cloudinary://599248742338215:JhcB8hQy4eg196gPY27n6lAjoIM@do67kredn
CLOUDINARY_CLOUD_NAME=do67kredn
CLOUDINARY_API_KEY=599248742338215
CLOUDINARY_API_SECRET=JhcB8hQy4eg196gPY27n6lAjoIM
```

### Features Enabled
- ✅ **Auto-optimization** (quality, format)
- ✅ **WebP conversion** for better compression
- ✅ **Automatic resizing** based on image type
- ✅ **Face detection** for avatar cropping
- ✅ **Multiple transformations** (thumbnail, medium, large)
- ✅ **Secure URLs** (HTTPS only)

## 🚀 Backend API Endpoints

### User Avatar Upload
```http
POST /api/users/upload-avatar
Authorization: Bearer {token}
Content-Type: multipart/form-data

Form Data:
- avatar: (file) Image file
```

**Response:**
```json
{
  "message": "Avatar uploaded successfully",
  "user": {
    "id": "user_id",
    "username": "testuser",
    "avatar": "https://res.cloudinary.com/do67kredn/image/upload/..."
  },
  "imageUrl": "https://res.cloudinary.com/do67kredn/image/upload/...",
  "publicId": "crackzone/avatars/user_id"
}
```

### Team Logo Upload
```http
POST /api/images/team/{teamId}/logo
Authorization: Bearer {token}
Content-Type: multipart/form-data

Form Data:
- logo: (file) Image file
```

### Tournament Banner Upload
```http
POST /api/images/tournament/{tournamentId}/banner
Authorization: Bearer {token} (Admin/Moderator only)
Content-Type: multipart/form-data

Form Data:
- banner: (file) Image file
```

### Game Screenshots Upload
```http
POST /api/images/match/{matchId}/screenshots
Authorization: Bearer {token}
Content-Type: multipart/form-data

Form Data:
- screenshots: (files) Multiple image files (max 5)
```

### Delete Image
```http
DELETE /api/images/{publicId}
Authorization: Bearer {token}
```

### Get Transformed Image
```http
GET /api/images/transform/{publicId}?width=300&height=300&quality=auto
```

## 📱 React Native Integration

### Installation
```bash
npm install expo-image-picker expo-image-manipulator
```

### Basic Usage

#### Avatar Upload
```tsx
import AvatarUpload from '../components/profile/AvatarUpload';

<AvatarUpload
  currentAvatar={user.avatar}
  onAvatarUpdated={(newUrl) => setUser({...user, avatar: newUrl})}
  userToken={authToken}
/>
```

#### Team Logo Upload
```tsx
import TeamLogoUpload from '../components/teams/TeamLogoUpload';

<TeamLogoUpload
  teamId={team.id}
  currentLogo={team.avatar}
  onLogoUpdated={(newUrl) => setTeam({...team, avatar: newUrl})}
  userToken={authToken}
  disabled={!isTeamLeader}
/>
```

#### Screenshot Upload
```tsx
import ScreenshotUpload from '../components/matches/ScreenshotUpload';

<ScreenshotUpload
  matchId={match.id}
  userToken={authToken}
  onScreenshotsUploaded={(screenshots) => setMatchScreenshots(screenshots)}
  maxScreenshots={5}
/>
```

### Direct Service Usage
```tsx
import { uploadAvatar, useImagePicker } from '../services/imageService';

const { pickSingleImage } = useImagePicker();

const handleAvatarChange = async () => {
  const asset = await pickSingleImage();
  if (asset) {
    const result = await uploadAvatar(asset.uri, userToken);
    console.log('Uploaded:', result.url);
  }
};
```

## 🎨 Image Specifications

### Avatar Images
- **Size:** 400x400px
- **Format:** WebP (auto-converted)
- **Crop:** Face-centered
- **Folder:** `crackzone/avatars/`

### Team Logos
- **Size:** 300x300px
- **Format:** WebP
- **Crop:** Fill
- **Folder:** `crackzone/teams/`

### Tournament Banners
- **Size:** 800x400px (16:9 aspect)
- **Format:** WebP
- **Crop:** Fill
- **Folder:** `crackzone/tournaments/`

### Game Screenshots
- **Size:** 1200x675px (16:9 aspect)
- **Format:** WebP
- **Crop:** Fill
- **Folder:** `crackzone/screenshots/`

## 🔒 Security Features

### File Validation
- ✅ **File type checking** (JPEG, PNG, WebP, GIF only)
- ✅ **File size limits** (10MB maximum)
- ✅ **MIME type validation**
- ✅ **Malicious file detection**

### Access Control
- ✅ **JWT authentication** required
- ✅ **Role-based permissions** (Admin/Moderator for tournaments)
- ✅ **Team leadership** verification for team logos
- ✅ **Match participation** verification for screenshots

### Rate Limiting
- ✅ **Upload rate limiting** (10 uploads per hour)
- ✅ **IP-based restrictions**
- ✅ **User-based quotas**

## 🚀 Performance Optimizations

### Automatic Transformations
```javascript
// Thumbnail (150x150)
https://res.cloudinary.com/do67kredn/image/upload/w_150,h_150,c_fill/publicId

// Medium (600x600)
https://res.cloudinary.com/do67kredn/image/upload/w_600,h_600,c_fill/publicId

// Auto-optimized
https://res.cloudinary.com/do67kredn/image/upload/q_auto,f_auto/publicId
```

### Mobile App Optimizations
- ✅ **Image compression** before upload
- ✅ **Progressive loading** with placeholders
- ✅ **Cached image URLs**
- ✅ **Lazy loading** for image galleries

## 🛠️ Development Testing

### Test Avatar Upload
```bash
# Register a user first
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"Test123!@#"}'

# Login to get token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!@#"}'

# Upload avatar (use actual image file)
curl -X POST http://localhost:3000/api/users/upload-avatar \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "avatar=@path/to/your/image.jpg"
```

## 📊 Cloudinary Dashboard

Access your Cloudinary dashboard at: https://cloudinary.com/console

### Monitor Usage
- **Transformations:** Track image processing
- **Bandwidth:** Monitor data transfer
- **Storage:** Check used space
- **API Calls:** Monitor request volume

### Folder Structure
```
crackzone/
├── avatars/          # User profile pictures
├── teams/            # Team logos
├── tournaments/      # Tournament banners
├── screenshots/      # Game screenshots
└── general/          # Miscellaneous uploads
```

## 🔧 Troubleshooting

### Common Issues

1. **"Invalid file type" Error**
   - Ensure file is JPEG, PNG, WebP, or GIF
   - Check MIME type validation

2. **"File too large" Error**
   - Compress image before upload
   - Maximum size is 10MB

3. **"Upload failed" Error**
   - Check Cloudinary credentials
   - Verify network connectivity
   - Check API rate limits

4. **"Permission denied" Error**
   - Verify JWT token is valid
   - Check user role permissions
   - Ensure team leadership for team uploads

### Debug Mode
Enable debug logging in development:
```env
NODE_ENV=development
CLOUDINARY_DEBUG=true
```

## 🚀 Production Deployment

### Environment Setup
1. Update `.env` with production Cloudinary credentials
2. Configure CDN settings in Cloudinary dashboard
3. Set up image optimization policies
4. Enable auto-backup for uploaded images

### Scaling Considerations
- **CDN:** Cloudinary provides global CDN
- **Caching:** Images cached automatically
- **Bandwidth:** Monitor usage and upgrade plan if needed
- **Storage:** Set up auto-cleanup for old images

The image upload system is now fully integrated and ready for production use! 🎉