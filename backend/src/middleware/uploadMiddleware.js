import multer from 'multer';

// Use memory storage for Cloudinary uploads
// Files will be stored in memory and then uploaded to Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'video/mp4',
    'video/avi',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-matroska',
    'video/webm'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only video files are allowed.'), false);
  }
};

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 * 1024
  },
  fileFilter: fileFilter
});

export const handleUploadError = (err, req, res, next) => {
  // Log error for debugging
  console.error('Upload error:', err);
  
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: `File too large. Maximum size is ${(parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 * 1024) / (1024 * 1024 * 1024)}GB`
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field. Expected field name: "video"'
      });
    }
    if (err.code === 'LIMIT_PART_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many parts in the multipart request'
      });
    }
    if (err.code === 'LIMIT_FIELD_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many fields in the form'
      });
    }
    
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message || err.code}`
    });
  }

  if (err) {
    // Handle custom errors (like file type validation)
    if (err.message && err.message.includes('Invalid file type')) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    
    return res.status(400).json({
      success: false,
      message: err.message || 'Upload failed'
    });
  }

  next();
};
