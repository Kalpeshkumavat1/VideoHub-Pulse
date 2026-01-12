# Cloudinary Integration Guide

## Overview

The application has been migrated from local file storage to Cloudinary for video hosting. Cloudinary provides:
- ✅ CDN-powered video delivery
- ✅ Automatic video transcoding and optimization
- ✅ Thumbnail generation
- ✅ Scalable storage
- ✅ No local file system dependencies

## Changes Made

### 1. Backend Changes

#### Package Updates
- ✅ Added `cloudinary` package
- ✅ Removed `ffmpeg-static`, `ffprobe-static`, `fluent-ffmpeg`, `sharp` (no longer needed)

#### New Files
- `backend/src/config/cloudinary.js` - Cloudinary configuration

#### Modified Files
- `backend/src/middleware/uploadMiddleware.js` - Changed to memory storage
- `backend/src/controllers/videoController.js` - Uploads to Cloudinary instead of local storage
- `backend/src/models/Video.js` - Added Cloudinary URL fields

### 2. Video Model Updates

New fields added:
```javascript
cloudinaryUrl: String        // Primary video URL from Cloudinary
cloudinaryPublicId: String   // Cloudinary public ID for management
thumbnailUrl: String         // Cloudinary thumbnail URL
```

Legacy fields (deprecated but kept for backward compatibility):
```javascript
uploadPath: String           // Now optional
processedPath: String        // Now optional
thumbnailPath: String       // Now optional
```

### 3. Upload Flow

**Old Flow:**
1. Upload file to local disk (`./uploads`)
2. Process video (transcode, thumbnails)
3. Store local file paths in database
4. Stream from local filesystem

**New Flow:**
1. Upload file buffer to Cloudinary
2. Cloudinary automatically processes video
3. Store Cloudinary URLs in database
4. Redirect to Cloudinary URL for streaming

## Environment Variables

Add these to your `.env` file:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Setup Instructions

### 1. Create Cloudinary Account

1. Go to https://cloudinary.com
2. Sign up for a free account
3. Get your credentials from the dashboard:
   - Cloud Name
   - API Key
   - API Secret

### 2. Install Dependencies

```bash
cd backend
npm install cloudinary
```

### 3. Configure Environment Variables

Add Cloudinary credentials to your `.env` file in the `backend/` directory.

### 4. Deploy

The application will now:
- Upload videos directly to Cloudinary
- Store Cloudinary URLs in the database
- Stream videos from Cloudinary CDN

## API Changes

### Upload Endpoint

**Endpoint:** `POST /api/videos/upload`

**Response:**
```json
{
  "success": true,
  "video": {
    "id": "video-id",
    "title": "Video Title",
    "status": "completed",
    "cloudinaryUrl": "https://res.cloudinary.com/.../video.mp4",
    "thumbnailUrl": "https://res.cloudinary.com/.../video.jpg"
  }
}
```

### Stream Endpoint

**Endpoint:** `GET /api/videos/:id/stream?quality=720`

**Behavior:**
- Returns a redirect (302) to Cloudinary URL
- Cloudinary handles video streaming with CDN
- Supports quality parameter: `480`, `720`, `1080`, or `auto`

### Thumbnail Endpoint

**Endpoint:** `GET /api/videos/:id/thumbnail`

**Behavior:**
- Returns a redirect (302) to Cloudinary thumbnail URL
- Cloudinary automatically generates thumbnails

## Frontend Usage

### Display Video

The frontend can use the video URL directly:

```tsx
// Option 1: Use cloudinaryUrl directly
<video controls>
  <source src={video.cloudinaryUrl} type="video/mp4" />
</video>

// Option 2: Use stream endpoint (redirects to Cloudinary)
<video controls>
  <source src={`/api/videos/${videoId}/stream`} type="video/mp4" />
</video>
```

### Display Thumbnail

```tsx
// Option 1: Use thumbnailUrl directly
<img src={video.thumbnailUrl} alt={video.title} />

// Option 2: Use thumbnail endpoint (redirects to Cloudinary)
<img src={`/api/videos/${videoId}/thumbnail`} alt={video.title} />
```

## Cloudinary Features Used

### 1. Automatic Transcoding

Cloudinary automatically creates multiple quality versions:
- 480p (SD)
- 720p (HD)
- 1080p (Full HD)

### 2. Thumbnail Generation

Cloudinary automatically generates thumbnails from videos.

### 3. CDN Delivery

All videos are delivered via Cloudinary's global CDN for fast playback worldwide.

### 4. Chunked Uploads

Large files are uploaded in chunks (6MB) for better reliability.

## Migration Notes

### Existing Videos

Videos uploaded before the migration will still work if they have `uploadPath` set. The system will:
1. Try to use `cloudinaryUrl` first
2. Fall back to `uploadPath` for legacy videos

### Backward Compatibility

The system maintains backward compatibility:
- Legacy videos with local file paths still work
- New videos use Cloudinary exclusively
- Both can coexist in the same database

## Benefits

1. **No Local Storage Needed** - No need to manage file uploads on server
2. **CDN Performance** - Videos load faster worldwide
3. **Automatic Processing** - No need for FFmpeg or video processing servers
4. **Scalability** - Cloudinary handles all scaling
5. **Cost Effective** - Pay only for what you use
6. **Reliability** - Cloudinary's infrastructure is highly reliable

## Troubleshooting

### Upload Fails

1. Check Cloudinary credentials in `.env`
2. Verify Cloudinary account is active
3. Check file size limits (Cloudinary free tier: 10MB, paid: up to 100MB+)
4. Check network connectivity

### Video Not Playing

1. Verify `cloudinaryUrl` is stored in database
2. Check Cloudinary URL is accessible
3. Verify video format is supported by Cloudinary

### Thumbnail Not Showing

1. Check `thumbnailUrl` is stored in database
2. Cloudinary generates thumbnails automatically
3. May take a few seconds after upload

## Cloudinary Dashboard

Monitor your videos in the Cloudinary Media Library:
- View all uploaded videos
- Check storage usage
- Monitor bandwidth
- Manage transformations

## Cost Considerations

**Free Tier:**
- 25GB storage
- 25GB bandwidth/month
- Basic transformations

**Paid Plans:**
- More storage and bandwidth
- Advanced transformations
- Priority support

Check https://cloudinary.com/pricing for current pricing.

## Support

For Cloudinary-specific issues:
- Documentation: https://cloudinary.com/documentation
- Support: https://support.cloudinary.com

For application issues:
- Check backend logs
- Verify environment variables
- Check database for video records
