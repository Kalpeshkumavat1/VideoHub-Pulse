# Video Streaming Backend API

Optimized backend for video upload, processing, and streaming with multi-tenant architecture and RBAC.

## Features

- ✅ User Authentication & Authorization (JWT)
- ✅ Multi-Tenant Architecture
- ✅ Role-Based Access Control (RBAC)
- ✅ Video Upload with Progress Tracking
- ✅ Video Processing Pipeline (FFmpeg)
- ✅ Multiple Quality Transcoding
- ✅ Thumbnail Generation
- ✅ Sensitivity Analysis
- ✅ Real-time Updates (Socket.io)
- ✅ Video Streaming (HTTP Range Requests)
- ✅ Rate Limiting
- ✅ Redis Caching
- ✅ MongoDB Database
- ✅ Error Handling & Logging

## Tech Stack

- **Node.js** with Express
- **MongoDB** with Mongoose
- **Redis** for caching and queues
- **Socket.io** for real-time features
- **FFmpeg** for video processing
- **Bull** for job queues
- **JWT** for authentication

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start MongoDB and Redis:
```bash
# MongoDB
mongod

# Redis
redis-server
```

4. Run migrations (if needed):
```bash
npm run migrate
```

5. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Videos
- `POST /api/videos/upload` - Upload video
- `GET /api/videos` - Get all videos
- `GET /api/videos/:id` - Get single video
- `GET /api/videos/:id/stream` - Stream video
- `GET /api/videos/:id/status` - Get processing status
- `GET /api/videos/:id/thumbnail` - Get thumbnail
- `PUT /api/videos/:id` - Update video
- `DELETE /api/videos/:id` - Delete video

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile

### Admin
- `GET /api/admin/stats` - Get statistics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/videos` - Get all videos

## Socket.io Events

### Client → Server
- `video:upload:progress` - Send upload progress
- `video:status:request` - Request video status

### Server → Client
- `video:uploaded` - Video upload complete
- `video:processing` - Processing status update
- `video:completed` - Processing complete
- `video:failed` - Processing failed

## Environment Variables

See `.env.example` for all available configuration options.

## Database Models

- **User**: User accounts with roles and organization
- **Organization**: Multi-tenant organizations
- **Video**: Video metadata and processing status
- **Comment**: Video comments (optional)

## Video Processing Pipeline

1. **Upload**: Video file uploaded to server
2. **Metadata Extraction**: Extract video properties
3. **Thumbnail Generation**: Create multiple thumbnails
4. **Transcoding**: Convert to multiple qualities (480p, 720p, 1080p)
5. **Sensitivity Analysis**: Analyze video content
6. **Completion**: Video ready for streaming

## Performance Optimizations

- Redis caching for frequently accessed data
- Job queues for async video processing
- HTTP range requests for video streaming
- Database indexes on frequently queried fields
- Rate limiting to prevent abuse
- Compression middleware

## Security

- JWT authentication
- Password hashing with bcrypt
- Rate limiting
- Input validation
- CORS configuration
- Helmet.js security headers

## Error Handling

All errors are handled centrally with proper status codes and messages. Errors are logged using Winston.

## Logging

Logs are written to:
- `logs/error.log` - Error logs
- `logs/combined.log` - All logs

## License

ISC
