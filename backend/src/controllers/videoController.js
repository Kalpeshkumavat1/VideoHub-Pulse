import Video from '../models/Video.js';
import { addVideoToQueue } from '../services/videoProcessingService.js';
import { io } from '../server.js';
import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import sharp from 'sharp';

ffmpeg.setFfmpegPath(ffmpegStatic);

export const uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No video file uploaded'
      });
    }

    const { title, description, tags, privacy, sensitivityLevel, category, customCategories } = req.body;

    // Ensure uploadPath is an absolute path string
    const uploadPath = path.resolve(req.file.path);

    // Validate file size against organization limits
    const org = req.user.organization;
    const maxFileSize = org.settings?.maxVideoSize || 10 * 1024 * 1024 * 1024; // 10GB default
    if (req.file.size > maxFileSize) {
      // Clean up uploaded file
      if (fs.existsSync(uploadPath)) {
        fs.unlinkSync(uploadPath);
      }
      return res.status(400).json({
        success: false,
        message: `File size exceeds organization limit of ${(maxFileSize / (1024 * 1024 * 1024)).toFixed(2)}GB`
      });
    }

    // Validate file format against organization allowed formats
    const fileExt = path.extname(req.file.originalname).toLowerCase().slice(1);
    const allowedFormats = org.settings?.allowedVideoFormats || ['mp4', 'avi', 'mov', 'mkv', 'webm'];
    if (!allowedFormats.includes(fileExt)) {
      // Clean up uploaded file
      if (fs.existsSync(uploadPath)) {
        fs.unlinkSync(uploadPath);
      }
      return res.status(400).json({
        success: false,
        message: `File format .${fileExt} is not allowed. Allowed formats: ${allowedFormats.join(', ')}`
      });
    }

    // Create video record
    const video = await Video.create({
      title: title || req.file.originalname,
      description: description || '',
      filename: req.file.filename,
      originalFilename: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadPath: uploadPath, // Store as absolute path string
      uploader: req.user._id,
      organization: req.user.organization._id,
      privacy: privacy || 'private',
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      category: category || 'uncategorized',
      customCategories: customCategories ? customCategories.split(',').map(cat => cat.trim()) : [],
      sensitivityLevel: sensitivityLevel || 'low',
      status: 'uploaded'
    });

    // Emit upload complete event
    io.to(req.user._id.toString()).emit('video:uploaded', {
      videoId: video._id,
      status: 'uploaded'
    });

    // Add to processing queue
    await addVideoToQueue(video._id.toString());

    res.status(201).json({
      success: true,
      video: {
        id: video._id,
        title: video.title,
        status: video.status,
        uploadProgress: 100
      }
    });
  } catch (error) {
    // Clean up uploaded file if video creation failed
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Error uploading video'
    });
  }
};

// @desc    Get all videos
// @route   GET /api/videos
// @access  Private
export const getVideos = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      privacy,
      search,
      category,
      sensitivityLevel,
      flagged,
      minDuration,
      maxDuration,
      minSize,
      maxSize,
      dateFrom,
      dateTo,
      sort = '-createdAt'
    } = req.query;

    // Build query based on user role
    // Ensure we get the organization ID as ObjectId for proper MongoDB comparison
    const userOrgId = req.user.organization._id || req.user.organization;
    
    // Role-based filtering for viewers
    let query = {};
    
    if (req.user.role === 'viewer') {
      // Viewers can see:
      // 1. Videos they uploaded themselves (any organization, any privacy)
      // 2. Public videos (any organization)
      // 3. ALL videos from their organization (regardless of who uploaded them or privacy setting)
      query = {
        deletedAt: null,
        $or: [
          // Their own videos (any organization, any privacy)
          { uploader: req.user._id },
          // Public videos from any organization
          { privacy: 'public' },
          // ALL videos from their organization (from editors, admins, etc.)
          { 
            organization: userOrgId
          }
        ]
      };
    } else {
      // Admin and Editor can see all videos in their organization
      query = {
        organization: userOrgId,
        deletedAt: null
      };
    }

    // Build additional filters
    const additionalFilters = {};

    // Filter by status
    if (status) {
      additionalFilters.status = status;
    }

    // Filter by privacy (only if not a viewer, as viewers already have privacy in $or)
    if (privacy && req.user.role !== 'viewer') {
      additionalFilters.privacy = privacy;
    }

    // Filter by category
    if (category) {
      additionalFilters.$or = [
        { category: category },
        { customCategories: category }
      ];
    }

    // Filter by sensitivity level
    if (sensitivityLevel) {
      additionalFilters.sensitivityLevel = sensitivityLevel;
    }

    // Filter by flagged status (sensitivity analysis)
    if (flagged !== undefined) {
      additionalFilters['sensitivityAnalysis.flagged'] = flagged === 'true';
    }

    // Filter by duration
    if (minDuration || maxDuration) {
      additionalFilters.duration = {};
      if (minDuration) additionalFilters.duration.$gte = parseInt(minDuration);
      if (maxDuration) additionalFilters.duration.$lte = parseInt(maxDuration);
    }

    // Filter by file size
    if (minSize || maxSize) {
      additionalFilters.fileSize = {};
      if (minSize) additionalFilters.fileSize.$gte = parseInt(minSize);
      if (maxSize) additionalFilters.fileSize.$lte = parseInt(maxSize);
    }

    // Filter by date range
    if (dateFrom || dateTo) {
      additionalFilters.createdAt = {};
      if (dateFrom) additionalFilters.createdAt.$gte = new Date(dateFrom);
      if (dateTo) additionalFilters.createdAt.$lte = new Date(dateTo);
    }

    // Search
    if (search) {
      additionalFilters.$text = { $search: search };
    }

    // Combine base query with additional filters
    // For viewers, we need to combine $or with additional filters using $and
    if (req.user.role === 'viewer' && query.$or && Object.keys(additionalFilters).length > 0) {
      const andConditions = [{ $or: query.$or }];
      
      // Handle category filter specially (it has its own $or)
      if (additionalFilters.$or) {
        andConditions.push({ $or: additionalFilters.$or });
        delete additionalFilters.$or;
      }
      
      // Add all other filters
      Object.keys(additionalFilters).forEach(key => {
        if (key !== '$or') {
          andConditions.push({ [key]: additionalFilters[key] });
        }
      });
      
      query.$and = andConditions;
      delete query.$or;
    } else if (req.user.role !== 'viewer') {
      // For admin/editor, merge additional filters
      Object.assign(query, additionalFilters);
    }

    // Execute query
    const videos = await Video.find(query)
      .populate('uploader', 'name email avatar')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-uploadPath -processedPath');

    const total = await Video.countDocuments(query);

    res.status(200).json({
      success: true,
      videos,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching videos'
    });
  }
};

// @desc    Get single video
// @route   GET /api/videos/:id
// @access  Private
export const getVideo = async (req, res) => {
  try {
    // Use video from RBAC middleware if available, otherwise fetch
    const video = req.video || await Video.findById(req.params.id)
      .populate('uploader', 'name email avatar')
      .populate('organization', 'name slug');

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    res.status(200).json({
      success: true,
      video
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching video'
    });
  }
};

// @desc    Get processing status
// @route   GET /api/videos/:id/status
// @access  Private
export const getProcessingStatus = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    res.status(200).json({
      success: true,
      status: video.status,
      progress: video.processingProgress,
      sensitivityAnalysis: video.sensitivityAnalysis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching processing status'
    });
  }
};

// @desc    Stream video
// @route   GET /api/videos/:id/stream
// @access  Private
export const streamVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Check access
    if (!video.isAccessible(req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this video'
      });
    }

    // Allow streaming if video is uploaded (even if not fully processed)
    // This allows users to watch videos while they're being processed
    if (video.status === 'failed') {
      return res.status(400).json({
        success: false,
        message: 'Video processing failed'
      });
    }

    // Determine which quality to stream
    const quality = req.query.quality || '720';
    const videoPath = video.qualities.get(quality) || video.processedPath || video.uploadPath;

    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({
        success: false,
        message: 'Video file not found'
      });
    }

    // Get file stats
    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      // Partial content (streaming)
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(videoPath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      // Full content
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(200, head);
      fs.createReadStream(videoPath).pipe(res);
    }

    // Increment view count
    video.views += 1;
    await video.save({ validateBeforeSave: false });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error streaming video'
    });
  }
};

// @desc    Get thumbnail
// @route   GET /api/videos/:id/thumbnail
// @access  Private
export const getVideoThumbnail = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    if (!video.thumbnailPath || !fs.existsSync(video.thumbnailPath)) {
      return res.status(404).json({
        success: false,
        message: 'Thumbnail not found'
      });
    }

    res.sendFile(path.resolve(video.thumbnailPath));
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching thumbnail'
    });
  }
};

// @desc    Update video
// @route   PUT /api/videos/:id
// @access  Private
export const updateVideo = async (req, res) => {
  try {
    // Use video from middleware (already fetched and permission-checked)
    const video = req.video || await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Permissions are already checked by canModifyVideo middleware
    // If we reach here, user has permission to modify the video
    // No need to re-check permissions

    const { title, description, tags, privacy } = req.body;

    if (title) video.title = title;
    if (description !== undefined) video.description = description;
    if (tags) video.tags = tags.split(',').map(tag => tag.trim());
    if (privacy) video.privacy = privacy;

    await video.save();

    res.status(200).json({
      success: true,
      video
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating video'
    });
  }
};

// @desc    Delete video
// @route   DELETE /api/videos/:id
// @access  Private
export const deleteVideo = async (req, res) => {
  try {
    // Use video from middleware (already fetched and permission-checked)
    const video = req.video || await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Permissions are already checked by canModifyVideo middleware
    // If we reach here, user has permission to modify the video
    // No need to re-check permissions

    // Soft delete
    video.deletedAt = new Date();
    await video.save();

    res.status(200).json({
      success: true,
      message: 'Video deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting video'
    });
  }
};
