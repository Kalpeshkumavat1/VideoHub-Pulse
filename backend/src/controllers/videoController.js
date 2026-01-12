import Video from '../models/Video.js';
import { io } from '../server.js';
import cloudinary from '../config/cloudinary.js';
import { Readable } from 'stream';

export const uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No video file uploaded'
      });
    }

    const { title, description, tags, privacy, sensitivityLevel, category, customCategories } = req.body;

    // Validate organization exists and is populated
    if (!req.user.organization) {
      return res.status(400).json({
        success: false,
        message: 'User organization not found'
      });
    }

    // Get organization (handle both populated and ObjectId cases)
    const org = req.user.organization;
    const orgId = org._id || org;

    // Validate file size against organization limits
    const maxFileSize = org.settings?.maxVideoSize || 10 * 1024 * 1024 * 1024; // 10GB default
    if (req.file.size > maxFileSize) {
      return res.status(400).json({
        success: false,
        message: `File size exceeds organization limit of ${(maxFileSize / (1024 * 1024 * 1024)).toFixed(2)}GB`
      });
    }

    // Validate file format against organization allowed formats
    const fileExt = req.file.originalname.split('.').pop()?.toLowerCase();
    const allowedFormats = org.settings?.allowedVideoFormats || ['mp4', 'avi', 'mov', 'mkv', 'webm'];
    if (!allowedFormats.includes(fileExt)) {
      return res.status(400).json({
        success: false,
        message: `File format .${fileExt} is not allowed. Allowed formats: ${allowedFormats.join(', ')}`
      });
    }

    // Upload to Cloudinary
    console.log('Uploading video to Cloudinary...');
    
    // Convert buffer to stream for Cloudinary
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'video',
        folder: `videos/${orgId}`,
        public_id: `${req.user._id}_${Date.now()}`,
        chunk_size: 6000000, // 6MB chunks for large files
        eager: [
          { width: 480, height: 270, crop: 'limit', quality: 'auto' },
          { width: 720, height: 405, crop: 'limit', quality: 'auto' },
          { width: 1080, height: 608, crop: 'limit', quality: 'auto' }
        ],
        eager_async: true,
      },
      async (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return res.status(500).json({
            success: false,
            message: 'Error uploading video to Cloudinary: ' + error.message
          });
        }

        try {
          // Extract video metadata from Cloudinary response
          const duration = result.duration || 0;
          const width = result.width || 0;
          const height = result.height || 0;
          const format = result.format || 'mp4';
          
          // Generate thumbnail URL using Cloudinary transformation
          const thumbnailUrl = cloudinary.url(result.public_id, {
            resource_type: 'video',
            transformation: [
              { width: 320, height: 240, crop: 'fill', quality: 'auto' }
            ],
            format: 'jpg'
          });

          // Create video record with Cloudinary URL
          const video = await Video.create({
            title: title || req.file.originalname,
            description: description || '',
            filename: result.public_id,
            originalFilename: req.file.originalname,
            fileSize: req.file.size,
            mimeType: req.file.mimetype,
            cloudinaryUrl: result.secure_url,
            cloudinaryPublicId: result.public_id,
            uploader: req.user._id,
            organization: orgId,
            privacy: privacy || 'private',
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            category: category || 'uncategorized',
            customCategories: customCategories ? customCategories.split(',').map(cat => cat.trim()) : [],
            sensitivityLevel: sensitivityLevel || 'low',
            status: 'completed', // Cloudinary handles processing
            duration: Math.floor(duration),
            thumbnailUrl: thumbnailUrl,
            metadata: {
              width: width,
              height: height,
              format: format
            }
          });

          // Emit upload complete event
          try {
            io.to(req.user._id.toString()).emit('video:uploaded', {
              videoId: video._id,
              status: 'completed',
              cloudinaryUrl: result.secure_url
            });
          } catch (socketError) {
            console.error('Socket emit error:', socketError);
          }

          res.status(201).json({
            success: true,
            video: {
              id: video._id,
              title: video.title,
              status: video.status,
              cloudinaryUrl: result.secure_url,
              thumbnailUrl: thumbnailUrl
            }
          });
        } catch (dbError) {
          console.error('Database error:', dbError);
          // Try to delete from Cloudinary if DB save fails
          try {
            await cloudinary.uploader.destroy(result.public_id, { resource_type: 'video' });
          } catch (deleteError) {
            console.error('Error deleting from Cloudinary:', deleteError);
          }
          
          res.status(500).json({
            success: false,
            message: 'Error saving video record: ' + dbError.message
          });
        }
      }
    );

    // Pipe the file buffer to Cloudinary
    const bufferStream = new Readable();
    bufferStream.push(req.file.buffer);
    bufferStream.push(null);
    bufferStream.pipe(stream);

  } catch (error) {
    // Log the actual error for debugging
    console.error('Video upload error:', error);
    console.error('Error stack:', error.stack);

    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'production' 
        ? 'Error uploading video. Please try again.' 
        : `Error uploading video: ${error.message}`
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
      .select('-uploadPath -processedPath -cloudinaryPublicId');

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

// @desc    Get video stream URL (Cloudinary)
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

    if (video.status === 'failed') {
      return res.status(400).json({
        success: false,
        message: 'Video processing failed'
      });
    }

    // Use Cloudinary URL if available
    if (video.cloudinaryUrl) {
      // Increment view count
      video.views += 1;
      await video.save({ validateBeforeSave: false });

      // Get quality parameter (Cloudinary supports quality transformations)
      const quality = req.query.quality || 'auto';
      
      // Build Cloudinary URL with quality transformation
      let videoUrl = video.cloudinaryUrl;
      
      if (quality !== 'auto' && video.cloudinaryPublicId) {
        // Apply quality transformation using Cloudinary
        const height = quality === '480' ? 270 : quality === '720' ? 405 : quality === '1080' ? 608 : 'auto';
        videoUrl = cloudinary.url(video.cloudinaryPublicId, {
          resource_type: 'video',
          transformation: [
            { height: height, crop: 'limit', quality: 'auto' }
          ]
        });
      }

      // Redirect to Cloudinary URL (Cloudinary handles streaming)
      return res.redirect(videoUrl);
    }

    // Fallback to legacy local file streaming (for backward compatibility)
    if (video.uploadPath) {
      const fs = await import('fs');
      const path = await import('path');
      
      const videoPath = path.resolve(video.uploadPath);
      if (fs.existsSync(videoPath)) {
        const stat = fs.statSync(videoPath);
        const fileSize = stat.size;
        const range = req.headers.range;

        if (range) {
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
          const head = {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4',
          };
          res.writeHead(200, head);
          fs.createReadStream(videoPath).pipe(res);
        }

        video.views += 1;
        await video.save({ validateBeforeSave: false });
        return;
      }
    }

    return res.status(404).json({
      success: false,
      message: 'Video file not found'
    });
  } catch (error) {
    console.error('Stream video error:', error);
    res.status(500).json({
      success: false,
      message: 'Error streaming video'
    });
  }
};

// @desc    Get thumbnail URL
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

    // Use Cloudinary thumbnail URL if available
    if (video.thumbnailUrl) {
      return res.redirect(video.thumbnailUrl);
    }

    // Generate thumbnail URL from Cloudinary if we have public ID
    if (video.cloudinaryPublicId) {
      const thumbnailUrl = cloudinary.url(video.cloudinaryPublicId, {
        resource_type: 'video',
        transformation: [
          { width: 320, height: 240, crop: 'fill', quality: 'auto' }
        ],
        format: 'jpg'
      });
      return res.redirect(thumbnailUrl);
    }

    // Fallback to legacy local thumbnail
    if (video.thumbnailPath) {
      const fs = await import('fs');
      const path = await import('path');
      
      if (fs.existsSync(video.thumbnailPath)) {
        return res.sendFile(path.resolve(video.thumbnailPath));
      }
    }

    return res.status(404).json({
      success: false,
      message: 'Thumbnail not found'
    });
  } catch (error) {
    console.error('Get thumbnail error:', error);
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

    // Delete from Cloudinary if cloudinaryPublicId exists
    if (video.cloudinaryPublicId) {
      try {
        await cloudinary.uploader.destroy(video.cloudinaryPublicId, {
          resource_type: 'video',
          invalidate: true
        });
        console.log(`Deleted video from Cloudinary: ${video.cloudinaryPublicId}`);
      } catch (cloudinaryError) {
        console.error('Error deleting from Cloudinary:', cloudinaryError);
        // Continue with soft delete even if Cloudinary deletion fails
      }
    }

    // Soft delete in database
    video.deletedAt = new Date();
    await video.save();

    res.status(200).json({
      success: true,
      message: 'Video deleted successfully'
    });
  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting video'
    });
  }
};
