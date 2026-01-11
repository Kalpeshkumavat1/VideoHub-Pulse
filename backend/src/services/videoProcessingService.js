import Queue from 'bull';
import Video from '../models/Video.js';
import { io } from '../server.js';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import ffprobeStatic from 'ffprobe-static';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { URL } from 'url';

ffmpeg.setFfmpegPath(ffmpegStatic);
const ffprobePath = typeof ffprobeStatic === 'string' ? ffprobeStatic : ffprobeStatic.path;
ffmpeg.setFfprobePath(ffprobePath);

const getRedisConfig = () => {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  
  try {
    const url = new URL(redisUrl);
    return {
      host: url.hostname,
      port: parseInt(url.port) || 6379,
      password: url.password || undefined,
      username: url.username || undefined
    };
  } catch (error) {
    return {
      host: 'localhost',
      port: 6379
    };
  }
};

const videoQueue = new Queue('video processing', {
  redis: getRedisConfig()
});

videoQueue.process(async (job) => {
  const { videoId } = job.data;
  
  try {
    const video = await Video.findById(videoId);
    if (!video) {
      throw new Error('Video not found');
    }

    // Validate uploadPath
    if (!video.uploadPath) {
      throw new Error('Video uploadPath is missing');
    }

    // Ensure uploadPath is a string
    const uploadPath = typeof video.uploadPath === 'string' 
      ? video.uploadPath 
      : String(video.uploadPath);

    if (!fs.existsSync(uploadPath)) {
      throw new Error(`Video file not found at path: ${uploadPath}`);
    }

    video.status = 'processing';
    video.processingProgress = 10;
    await video.save();
    
    io.to(video.uploader.toString()).emit('video:processing', {
      videoId: video._id,
      status: 'processing',
      progress: 10
    });

    // Get video metadata
    await getVideoMetadata(video);
    video.processingProgress = 30;
    await video.save();

    io.to(video.uploader.toString()).emit('video:processing', {
      videoId: video._id,
      status: 'processing',
      progress: 30
    });

    // Generate thumbnails
    await generateThumbnails(video);
    video.processingProgress = 50;
    await video.save();

    io.to(video.uploader.toString()).emit('video:processing', {
      videoId: video._id,
      status: 'processing',
      progress: 50
    });

    // Transcode to multiple qualities
    await transcodeVideo(video);
    video.processingProgress = 80;
    await video.save();

    io.to(video.uploader.toString()).emit('video:processing', {
      videoId: video._id,
      status: 'processing',
      progress: 80
    });

    // Analyze sensitivity
    await analyzeSensitivity(video);
    video.processingProgress = 100;
    video.status = 'completed';
    await video.save();

    io.to(video.uploader.toString()).emit('video:completed', {
      videoId: video._id,
      status: 'completed',
      progress: 100
    });

    return { success: true };
  } catch (error) {
    
    const video = await Video.findById(videoId);
    if (video) {
      video.status = 'failed';
      video.error = {
        message: error.message,
        code: 'PROCESSING_ERROR',
        occurredAt: new Date()
      };
      await video.save();

      io.to(video.uploader.toString()).emit('video:failed', {
        videoId: video._id,
        status: 'failed',
        error: error.message
      });
    }

    throw error;
  }
});

// Get video metadata
const getVideoMetadata = (video) => {
  return new Promise((resolve, reject) => {
    // Ensure uploadPath is a string
    const uploadPath = typeof video.uploadPath === 'string' 
      ? video.uploadPath 
      : String(video.uploadPath || '');

    if (!uploadPath || !fs.existsSync(uploadPath)) {
      reject(new Error(`Video file not found at path: ${uploadPath}`));
      return;
    }

    ffmpeg.ffprobe(uploadPath, (err, metadata) => {
      if (err) {
        reject(err);
        return;
      }

      if (!metadata || !metadata.streams) {
        reject(new Error('Invalid video metadata'));
        return;
      }

      const videoStream = metadata.streams.find(stream => stream.codec_type === 'video');
      
      if (!videoStream) {
        reject(new Error('No video stream found in file'));
        return;
      }

      video.metadata = {
        width: videoStream.width,
        height: videoStream.height,
        fps: eval(videoStream.r_frame_rate),
        bitrate: metadata.format.bit_rate,
        codec: videoStream.codec_name
      };

      video.duration = Math.floor(metadata.format.duration || 0);

      video.save().then(resolve).catch(reject);
    });
  });
};

// Generate thumbnails
const generateThumbnails = async (video) => {
  const thumbnailDir = process.env.THUMBNAIL_PATH || './thumbnails';
  const thumbnailCount = parseInt(process.env.THUMBNAIL_COUNT) || 5;
  const thumbnails = [];

  // Ensure uploadPath is a string
  const uploadPath = typeof video.uploadPath === 'string' 
    ? video.uploadPath 
    : String(video.uploadPath || '');

  if (!uploadPath || !fs.existsSync(uploadPath)) {
    throw new Error(`Video file not found at path: ${uploadPath}`);
  }

  // Create thumbnail directory if it doesn't exist
  if (!fs.existsSync(thumbnailDir)) {
    fs.mkdirSync(thumbnailDir, { recursive: true });
  }

  return new Promise((resolve, reject) => {
    const interval = video.duration / (thumbnailCount + 1);
    
    ffmpeg(uploadPath)
      .screenshots({
        count: thumbnailCount,
        folder: thumbnailDir,
        filename: `${video._id}-%s.png`,
        size: '320x240'
      })
      .on('end', async () => {
        try {
          // Get all generated thumbnails
          for (let i = 1; i <= thumbnailCount; i++) {
            const thumbPath = path.join(thumbnailDir, `${video._id}-${i}.png`);
            if (fs.existsSync(thumbPath)) {
              thumbnails.push(thumbPath);
            }
          }

          // Set first thumbnail as main
          if (thumbnails.length > 0) {
            video.thumbnailPath = thumbnails[0];
            video.thumbnails = thumbnails;
            await video.save();
          }

          resolve();
        } catch (error) {
          reject(error);
        }
      })
      .on('error', reject);
  });
};

// Transcode video to multiple qualities
const transcodeVideo = async (video) => {
  const processedDir = process.env.PROCESSED_PATH || './processed';
  const qualities = (process.env.VIDEO_QUALITIES || '480,720,1080').split(',');

  // Ensure uploadPath is a string
  const uploadPath = typeof video.uploadPath === 'string' 
    ? video.uploadPath 
    : String(video.uploadPath || '');

  if (!uploadPath || !fs.existsSync(uploadPath)) {
    throw new Error(`Video file not found at path: ${uploadPath}`);
  }

  if (!fs.existsSync(processedDir)) {
    fs.mkdirSync(processedDir, { recursive: true });
  }

  const transcodePromises = qualities.map(quality => {
    return new Promise((resolve, reject) => {
      const outputPath = path.join(processedDir, `${video._id}-${quality}p.mp4`);
      const height = parseInt(quality);

      ffmpeg(uploadPath)
        .videoCodec('libx264')
        .audioCodec('aac')
        .size(`?x${height}`)
        .output(outputPath)
        .on('end', () => {
          video.qualities.set(quality, outputPath);
          resolve();
        })
        .on('error', reject)
        .run();
    });
  });

  await Promise.all(transcodePromises);
  
  // Set default processed path
  video.processedPath = video.qualities.get('720');
  await video.save();
};

// Analyze video sensitivity (simplified - in production, use ML models)
const analyzeSensitivity = async (video) => {
  // This is a placeholder - in production, integrate with ML service
  // For now, use a simple heuristic based on video metadata
  
  let score = 0;
  const categories = [];

  // Analyze based on duration (longer videos might be more sensitive)
  if (video.duration > 3600) { // > 1 hour
    score += 20;
    categories.push('long-duration');
  }

  // Analyze based on file size
  if (video.fileSize > 5 * 1024 * 1024 * 1024) { // > 5GB
    score += 15;
    categories.push('large-file');
  }

  // Random sensitivity for demo (replace with actual ML analysis)
  score += Math.floor(Math.random() * 30);

  video.sensitivityAnalysis = {
    score: Math.min(score, 100),
    categories: categories.length > 0 ? categories : ['standard'],
    flagged: score > 70,
    analyzedAt: new Date()
  };

  // Update sensitivity level based on score
  if (score > 70) {
    video.sensitivityLevel = 'high';
  } else if (score > 40) {
    video.sensitivityLevel = 'medium';
  } else {
    video.sensitivityLevel = 'low';
  }

  await video.save();
};

// Add video to processing queue
export const addVideoToQueue = async (videoId) => {
  await videoQueue.add({ videoId }, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    }
  });
};

export default videoQueue;
