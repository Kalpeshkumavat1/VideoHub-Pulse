# VideoHub - Video Streaming Platform

A production-ready full-stack video streaming platform with multi-tenant architecture, role-based access control (RBAC), and comprehensive video processing capabilities.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [User Roles & Permissions](#user-roles--permissions)
- [Startup Instructions](#startup-instructions)
- [Development Commands](#development-commands)
- [Video Processing Pipeline](#video-processing-pipeline)
- [Socket.io Events](#socketio-events)
- [Deployment](#deployment)

## 🎯 Overview

VideoHub is a comprehensive video streaming platform that supports:
- Multi-tenant architecture with organization-based isolation
- Role-based access control (Viewer, Editor, Admin)
- Video upload, processing, and streaming
- Real-time progress tracking via WebSockets
- Multiple quality transcoding (480p, 720p, 1080p)
- Thumbnail generation and sensitivity analysis
- Redis caching for performance optimization

## ✨ Features

### Authentication & Authorization
- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Role-based access control (RBAC)
- ✅ Multi-tenant organization support
- ✅ Email verification support

### Video Management
- ✅ Video upload with progress tracking
- ✅ Multiple quality transcoding (480p, 720p, 1080p)
- ✅ Thumbnail generation
- ✅ Video metadata extraction
- ✅ Sensitivity analysis
- ✅ HTTP Range Request streaming
- ✅ Video privacy settings (public, private, organization)

### User Management
- ✅ User profile management
- ✅ Organization-based user isolation
- ✅ Role assignment and management
- ✅ User activation/deactivation
- ✅ Storage quota management

### Performance & Security
- ✅ Redis caching
- ✅ Rate limiting
- ✅ CORS configuration
- ✅ Helmet.js security headers
- ✅ Input validation
- ✅ Error handling and logging

### Real-time Features
- ✅ Socket.io for real-time updates
- ✅ Upload progress tracking
- ✅ Processing status updates

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Cache/Queue**: Redis with Bull
- **Authentication**: JWT (jsonwebtoken)
- **Video Processing**: FFmpeg (fluent-ffmpeg)
- **Real-time**: Socket.io
- **Security**: Helmet.js, bcryptjs
- **Validation**: express-validator, validator
- **Logging**: Winston

### Frontend
- **Framework**: React 18
- **Routing**: React Router 6 (SPA mode)
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS 3
- **UI Components**: Radix UI
- **Icons**: Lucide React
- **State Management**: TanStack React Query
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Fetch API

### Development Tools
- **Package Manager**: PNPM
- **Testing**: Vitest
- **Code Quality**: Prettier, TypeScript
- **Hot Reload**: Vite HMR

## 📁 Project Structure

```
New folder (10)/
├── backend/                    # Backend API server
│   ├── src/
│   │   ├── config/            # Configuration files
│   │   │   ├── database.js    # MongoDB connection
│   │   │   └── redis.js       # Redis connection
│   │   ├── controllers/       # Route controllers
│   │   │   ├── adminController.js
│   │   │   ├── authController.js
│   │   │   ├── userController.js
│   │   │   └── videoController.js
│   │   ├── models/            # Mongoose models
│   │   │   ├── User.js
│   │   │   ├── Organization.js
│   │   │   ├── Video.js
│   │   │   └── Comment.js
│   │   ├── routes/            # Express routes
│   │   │   ├── adminRoutes.js
│   │   │   ├── authRoutes.js
│   │   │   ├── userRoutes.js
│   │   │   └── videoRoutes.js
│   │   ├── middleware/        # Custom middleware
│   │   │   ├── authMiddleware.js
│   │   │   ├── rbacMiddleware.js
│   │   │   ├── rateLimiter.js
│   │   │   └── uploadMiddleware.js
│   │   ├── socket/            # Socket.io handlers
│   │   │   └── socketHandler.js
│   │   ├── utils/             # Utility functions
│   │   │   └── generateToken.js
│   │   └── server.js          # Main server file
│   ├── package.json
│   └── README.md
│
├── frontend/                   # Frontend React application
│   ├── client/                # React SPA
│   │   ├── pages/             # Route components
│   │   ├── components/        # React components
│   │   │   └── ui/            # UI component library
│   │   ├── App.tsx            # App entry point
│   │   └── global.css         # Global styles
│   ├── server/                # Express server (integrated with Vite)
│   │   ├── routes/            # API routes
│   │   └── index.ts           # Server setup
│   ├── shared/                # Shared types/interfaces
│   │   └── api.ts             # API interfaces
│   ├── public/                # Static assets
│   ├── package.json
│   ├── vite.config.ts
│   └── AGENTS.md
│
├── ROLE_MANAGEMENT_GUIDE.md    # Role management documentation
└── README.md                   # This file
```

## 🚀 Installation & Setup

### Prerequisites

- Node.js (v18 or higher)
- PNPM (v10 or higher)
- MongoDB (v6 or higher)
- Redis (v6 or higher)
- FFmpeg (for video processing)

### Step 1: Clone and Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
pnpm install
```

### Step 2: Set Up Environment Variables

#### Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/videohub

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=30d

# CORS
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
SOCKET_IO_CORS_ORIGIN=http://localhost:5173,http://localhost:3000

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10737418240
ALLOWED_VIDEO_TYPES=video/mp4,video/avi,video/mov,video/mkv,video/webm

# Video Processing
VIDEO_PROCESSING_DIR=./processed
THUMBNAIL_DIR=./thumbnails
```

#### Frontend Environment Variables

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### Step 3: Start Services

#### Start MongoDB

```bash
# Windows
mongod

# macOS/Linux
sudo systemctl start mongod
# or
mongod
```

#### Start Redis

```bash
# Windows
redis-server

# macOS/Linux
sudo systemctl start redis
# or
redis-server
```

### Step 4: Start the Application

#### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
pnpm dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 🔐 Environment Variables

### Backend Required Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | Required |
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `JWT_SECRET` | JWT secret key | Required |
| `JWT_EXPIRE` | JWT expiration time | `30d` |
| `CORS_ORIGIN` | Allowed CORS origins | `http://localhost:5173` |
| `UPLOAD_DIR` | Video upload directory | `./uploads` |
| `MAX_FILE_SIZE` | Maximum file size (bytes) | `10737418240` (10GB) |

### Frontend Required Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:5000/api` |

## 🗄 Database Schema

### Entity Relationship Diagram

```
┌─────────────────┐
│  Organization   │
├─────────────────┤
│ _id (PK)        │
│ name            │
│ slug (unique)   │
│ description     │
│ logo            │
│ owner (FK)      │──┐
│ members[] (FK)  │  │
│ settings        │  │
│ subscription    │  │
│ isActive        │  │
│ timestamps      │  │
└─────────────────┘  │
                     │
┌─────────────────┐  │
│     User        │◄─┘
├─────────────────┤
│ _id (PK)        │
│ name            │
│ email (unique)  │
│ password        │
│ role            │──┐
│ organization(FK)│──┼──┐
│ avatar          │  │  │
│ isActive        │  │  │
│ storageUsed     │  │  │
│ storageLimit    │  │  │
│ timestamps      │  │  │
└─────────────────┘  │  │
                     │  │
┌─────────────────┐  │  │
│     Video       │  │  │
├─────────────────┤  │  │
│ _id (PK)        │  │  │
│ title           │  │  │
│ description     │  │  │
│ filename        │  │  │
│ fileSize        │  │  │
│ duration        │  │  │
│ uploadPath      │  │  │
│ status          │  │  │
│ uploader (FK)   │──┘  │
│ organization(FK)│─────┘
│ privacy         │
│ tags[]          │
│ views           │
│ metadata        │
│ timestamps      │
└─────────────────┘
         │
         │
┌─────────────────┐
│    Comment      │
├─────────────────┤
│ _id (PK)        │
│ video (FK)      │──┐
│ user (FK)       │  │
│ content         │  │
│ parentComment   │  │
│ likes           │  │
│ timestamps      │  │
└─────────────────┘  │
                     │
                     └─── References Video
```

### Model Details

#### User Model
```javascript
{
  name: String (required, max 50 chars)
  email: String (required, unique, lowercase)
  password: String (required, min 6 chars, hashed)
  role: Enum ['viewer', 'editor', 'admin'] (default: 'viewer')
  organization: ObjectId (required, ref: 'Organization')
  avatar: String (optional)
  isActive: Boolean (default: true)
  isEmailVerified: Boolean (default: false)
  storageUsed: Number (default: 0, in bytes)
  storageLimit: Number (default: 10GB)
  lastLogin: Date (optional)
  timestamps: { createdAt, updatedAt }
}
```

**Indexes:**
- `email` (unique)
- `organization`
- `role`

#### Organization Model
```javascript
{
  name: String (required, unique)
  slug: String (required, unique, lowercase)
  description: String (max 500 chars)
  logo: String (optional)
  owner: ObjectId (ref: 'User', optional)
  members: [ObjectId] (ref: 'User')
  settings: {
    maxStorage: Number (default: 100GB)
    maxVideoSize: Number (default: 10GB)
    allowedVideoFormats: [String] (default: ['mp4', 'avi', 'mov', 'mkv', 'webm'])
  }
  isActive: Boolean (default: true)
  subscription: {
    plan: Enum ['free', 'basic', 'pro', 'enterprise'] (default: 'free')
    expiresAt: Date (optional)
  }
  timestamps: { createdAt, updatedAt }
}
```

**Indexes:**
- `slug` (unique)
- `owner`

#### Video Model
```javascript
{
  title: String (required, max 200 chars)
  description: String (max 2000 chars)
  filename: String (required)
  originalFilename: String (required)
  fileSize: Number (required)
  duration: Number (seconds, default: 0)
  mimeType: String (required)
  uploadPath: String (required)
  processedPath: String (optional)
  thumbnailPath: String (optional)
  thumbnails: [String]
  qualities: Map<String, String> (quality -> file path)
  status: Enum ['uploading', 'uploaded', 'processing', 'analyzing', 'completed', 'failed']
  processingProgress: Number (0-100)
  sensitivityLevel: Enum ['low', 'medium', 'high'] (default: 'low')
  sensitivityAnalysis: {
    score: Number (0-100)
    categories: [String]
    flagged: Boolean
    analyzedAt: Date
  }
  uploader: ObjectId (required, ref: 'User')
  organization: ObjectId (required, ref: 'Organization')
  privacy: Enum ['public', 'private', 'organization'] (default: 'private')
  tags: [String]
  category: String (default: 'uncategorized')
  customCategories: [String]
  views: Number (default: 0)
  likes: Number (default: 0)
  dislikes: Number (default: 0)
  metadata: {
    width: Number
    height: Number
    fps: Number
    bitrate: Number
    codec: String
  }
  error: {
    message: String
    code: String
    occurredAt: Date
  }
  deletedAt: Date (optional, soft delete)
  timestamps: { createdAt, updatedAt }
}
```

**Indexes:**
- `uploader`
- `organization`
- `status`
- `createdAt` (descending)
- `tags`
- `title, description` (text search)

#### Comment Model
```javascript
{
  video: ObjectId (required, ref: 'Video')
  user: ObjectId (required, ref: 'User')
  content: String (required, max 1000 chars)
  parentComment: ObjectId (ref: 'Comment', optional, for replies)
  likes: Number (default: 0)
  isEdited: Boolean (default: false)
  isDeleted: Boolean (default: false, soft delete)
  timestamps: { createdAt, updatedAt }
}
```

**Indexes:**
- `video, createdAt` (descending)
- `user`
- `parentComment`

## 🔌 API Endpoints

### Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "organizationName": "Acme Corp"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "admin",
    "organization": {
      "id": "org-id",
      "name": "Acme Corp",
      "slug": "acme-corp"
    }
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt-token-here",
  "user": { ... }
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "user": { ... }
}
```

### Video Endpoints

#### Upload Video
```http
POST /api/videos/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

video: <file>
title: "My Video Title"
description: "Video description" (optional)
```

**Response:**
```json
{
  "success": true,
  "video": {
    "_id": "video-id",
    "title": "My Video Title",
    "status": "uploading",
    ...
  }
}
```

#### Get All Videos
```http
GET /api/videos
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `status` (optional): Filter by status
- `privacy` (optional): Filter by privacy
- `search` (optional): Search in title/description

**Response:**
```json
{
  "success": true,
  "videos": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50
  }
}
```

#### Get Single Video
```http
GET /api/videos/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "video": { ... }
}
```

#### Stream Video
```http
GET /api/videos/:id/stream?quality=720
Authorization: Bearer <token>
Range: bytes=0-
```

**Query Parameters:**
- `quality` (optional): Video quality (480, 720, 1080). Default: original

**Response:** Video stream with HTTP 206 Partial Content

#### Get Video Thumbnail
```http
GET /api/videos/:id/thumbnail
Authorization: Bearer <token>
```

**Response:** Image file

#### Get Processing Status
```http
GET /api/videos/:id/status
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "status": "processing",
  "progress": 45
}
```

#### Update Video
```http
PUT /api/videos/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description",
  "privacy": "public",
  "tags": ["tag1", "tag2"]
}
```

**Response:**
```json
{
  "success": true,
  "video": { ... }
}
```

#### Delete Video
```http
DELETE /api/videos/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Video deleted successfully"
}
```

### User Endpoints

#### Get User Profile
```http
GET /api/users/profile
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "user": { ... }
}
```

#### Update User Profile
```http
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "email": "newemail@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "user": { ... }
}
```

#### Create User (Admin Only)
```http
POST /api/users
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "New User",
  "email": "newuser@example.com",
  "password": "password123",
  "role": "editor"
}
```

**Response:**
```json
{
  "success": true,
  "user": { ... },
  "message": "User created successfully"
}
```

#### Get All Users (Admin Only)
```http
GET /api/users?page=1&limit=10&role=editor&search=john
Authorization: Bearer <admin-token>
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `role` (optional): Filter by role
- `search` (optional): Search in name/email
- `isActive` (optional): Filter by active status

**Response:**
```json
{
  "success": true,
  "users": [...],
  "pagination": { ... }
}
```

#### Get Single User (Admin Only)
```http
GET /api/users/:id
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "user": { ... }
}
```

#### Update User Role (Admin Only)
```http
PUT /api/users/:id/role
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "role": "editor"
}
```

**Response:**
```json
{
  "success": true,
  "user": { ... }
}
```

#### Update User Status (Admin Only)
```http
PUT /api/users/:id/status
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "isActive": false
}
```

**Response:**
```json
{
  "success": true,
  "user": { ... }
}
```

#### Delete User (Admin Only)
```http
DELETE /api/users/:id
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

### Admin Endpoints

#### Get Statistics
```http
GET /api/admin/stats
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalUsers": 100,
    "totalVideos": 500,
    "totalStorage": 107374182400,
    "activeUsers": 85,
    ...
  }
}
```

#### Get All Users (Admin)
```http
GET /api/admin/users
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "users": [...]
}
```

#### Get All Videos (Admin)
```http
GET /api/admin/videos
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "videos": [...]
}
```

### Health Check

#### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600
}
```

## 👥 User Roles & Permissions

### Role Hierarchy

1. **Viewer** (Lowest)
2. **Editor** (Medium)
3. **Admin** (Highest)

### Viewer Role

**Permissions:**
- ✅ View videos (own, public, organization-level)
- ✅ View video details
- ✅ Stream videos
- ✅ View thumbnails
- ❌ Cannot upload videos
- ❌ Cannot edit videos
- ❌ Cannot delete videos
- ❌ Cannot manage users

**Use Case:** Read-only access for content consumers

### Editor Role

**Permissions:**
- ✅ All Viewer permissions
- ✅ Upload videos
- ✅ Edit videos (own + organization videos)
- ✅ Delete videos (own + organization videos)
- ✅ Update video metadata
- ❌ Cannot manage users

**Use Case:** Content creators and managers

### Admin Role

**Permissions:**
- ✅ All Editor permissions
- ✅ Manage users (create, update, delete)
- ✅ Change user roles
- ✅ Activate/deactivate users
- ✅ View all organization data
- ✅ Access admin dashboard
- ✅ View system statistics

**Use Case:** Organization administrators

### Role Assignment Rules

1. **During Registration:**
   - First member of a new organization → Automatically gets `admin` role
   - Joining an existing organization → Automatically gets `editor` role

2. **Manual Assignment:**
   - Only admins can create users with specific roles
   - Only admins can change user roles

3. **Security Rules:**
   - Organization owner cannot have role changed from 'admin'
   - Organization owner cannot be deactivated
   - Organization owner cannot be deleted
   - Users cannot change their own role
   - Users cannot deactivate their own account
   - Users cannot delete their own account

## 🚀 Startup Instructions

### Quick Start

1. **Install Dependencies:**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   pnpm install
   ```

2. **Set Up Environment:**
   - Create `.env` files in both `backend/` and `frontend/` directories
   - Configure MongoDB URI, Redis connection, JWT secret, etc.

3. **Start Services:**
   ```bash
   # Terminal 1: MongoDB
   mongod
   
   # Terminal 2: Redis
   redis-server
   
   # Terminal 3: Backend
   cd backend
   npm run dev
   
   # Terminal 4: Frontend
   cd frontend
   pnpm dev
   ```

4. **Access Application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000
   - API Health: http://localhost:5000/health

### First User Setup

1. Register a new user with a new organization name
2. You'll automatically get `admin` role
3. You can now create other users and manage the organization

## 💻 Development Commands

### Backend Commands

```bash
cd backend

# Development (with hot reload)
npm run dev

# Production
npm start

# Run tests
npm test

# Run migrations
npm run migrate

# Seed database
npm run seed
```

### Frontend Commands

```bash
cd frontend

# Development server
pnpm dev

# Production build
pnpm build

# Preview production build
pnpm preview

# Type checking
pnpm typecheck

# Run tests
pnpm test

# Format code
pnpm format.fix
```

## 🎬 Video Processing Pipeline

The video processing pipeline follows these steps:

1. **Upload**
   - Video file uploaded to server
   - Status: `uploading` → `uploaded`

2. **Metadata Extraction**
   - Extract video properties (width, height, fps, bitrate, codec, duration)
   - Update video document with metadata

3. **Thumbnail Generation**
   - Generate multiple thumbnails at different timestamps
   - Save thumbnail paths

4. **Transcoding**
   - Convert to multiple qualities:
     - 480p (SD)
     - 720p (HD)
     - 1080p (Full HD)
   - Status: `processing`
   - Progress tracking (0-100%)

5. **Sensitivity Analysis**
   - Analyze video content
   - Calculate sensitivity score
   - Flag inappropriate content
   - Status: `analyzing`

6. **Completion**
   - Status: `completed`
   - Video ready for streaming
   - All quality versions available

**Error Handling:**
- If any step fails, status changes to `failed`
- Error details stored in `error` field
- User notified via Socket.io

## 🔌 Socket.io Events

### Client → Server Events

#### Upload Progress
```javascript
socket.emit('video:upload:progress', {
  videoId: 'video-id',
  progress: 50 // 0-100
});
```

#### Request Video Status
```javascript
socket.emit('video:status:request', {
  videoId: 'video-id'
});
```

### Server → Client Events

#### Video Uploaded
```javascript
socket.on('video:uploaded', (data) => {
  // { videoId, video }
});
```

#### Processing Status Update
```javascript
socket.on('video:processing', (data) => {
  // { videoId, status, progress }
});
```

#### Processing Complete
```javascript
socket.on('video:completed', (data) => {
  // { videoId, video }
});
```

#### Processing Failed
```javascript
socket.on('video:failed', (data) => {
  // { videoId, error }
});
```

## 🚢 Deployment

### Backend Deployment

1. **Environment Setup:**
   - Set production environment variables
   - Configure MongoDB Atlas or production MongoDB
   - Set up Redis (Redis Cloud or self-hosted)
   - Set secure JWT secret

2. **Build & Deploy:**
   ```bash
   cd backend
   npm install --production
   npm start
   ```

3. **Recommended Platforms:**
   - Heroku
   - AWS EC2
   - DigitalOcean
   - Railway
   - Render

### Frontend Deployment

1. **Build:**
   ```bash
   cd frontend
   pnpm build
   ```

2. **Deploy:**
   - **Netlify:** Configure `netlify.toml` and deploy
   - **Vercel:** Connect repository and deploy
   - **AWS S3 + CloudFront:** Upload build files
   - **GitHub Pages:** Deploy `dist` folder

3. **Environment Variables:**
   - Set `VITE_API_BASE_URL` to production backend URL

### Database Setup

1. **MongoDB Atlas:**
   - Create cluster
   - Get connection string
   - Update `MONGODB_URI` in backend `.env`

2. **Redis:**
   - Use Redis Cloud or self-hosted Redis
   - Update `REDIS_HOST` and `REDIS_PORT` in backend `.env`

### File Storage

For production, consider:
- **AWS S3** for video storage
- **Cloudinary** for video processing and storage
- **Azure Blob Storage**
- **Google Cloud Storage**

Update upload middleware to use cloud storage instead of local filesystem.

## 📝 Additional Notes

### Security Best Practices

1. **JWT Secret:** Use a strong, random secret in production
2. **HTTPS:** Always use HTTPS in production
3. **Rate Limiting:** Configure appropriate rate limits
4. **CORS:** Restrict CORS origins to your frontend domain
5. **File Validation:** Validate file types and sizes
6. **Input Validation:** Validate all user inputs
7. **Password Policy:** Enforce strong password requirements

### Performance Optimization

1. **Redis Caching:** Frequently accessed data is cached
2. **Database Indexes:** Optimized indexes on frequently queried fields
3. **Video Streaming:** HTTP Range Requests for efficient streaming
4. **Compression:** Response compression enabled
5. **CDN:** Use CDN for static assets and video delivery

### Monitoring & Logging

- Winston logger configured for error and combined logs
- Logs written to `logs/error.log` and `logs/combined.log`
- Consider integrating with monitoring services (Sentry, LogRocket, etc.)

## 📄 License

ISC

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📧 Support

For issues and questions, please open an issue on the repository.

---

**Built with ❤️ using Node.js, React, MongoDB, and Redis**
