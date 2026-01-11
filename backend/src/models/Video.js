import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a video title'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  filename: {
    type: String,
    required: true
  },
  originalFilename: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  duration: {
    type: Number, // in seconds
    default: 0
  },
  mimeType: {
    type: String,
    required: true
  },
  uploadPath: {
    type: String,
    required: true
  },
  processedPath: {
    type: String,
    default: null
  },
  thumbnailPath: {
    type: String,
    default: null
  },
  thumbnails: [{
    type: String
  }],
  qualities: {
    type: Map,
    of: String, // quality -> file path
    default: new Map()
  },
  status: {
    type: String,
    enum: ['uploading', 'uploaded', 'processing', 'analyzing', 'completed', 'failed'],
    default: 'uploading'
  },
  processingProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  sensitivityLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'low'
  },
  sensitivityAnalysis: {
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    categories: [{
      type: String
    }],
    flagged: {
      type: Boolean,
      default: false
    },
    analyzedAt: {
      type: Date
    }
  },
  uploader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  privacy: {
    type: String,
    enum: ['public', 'private', 'organization'],
    default: 'private'
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  category: {
    type: String,
    trim: true,
    default: 'uncategorized'
  },
  customCategories: [{
    type: String,
    trim: true
  }],
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  dislikes: {
    type: Number,
    default: 0
  },
  metadata: {
    width: Number,
    height: Number,
    fps: Number,
    bitrate: Number,
    codec: String
  },
  error: {
    message: String,
    code: String,
    occurredAt: Date
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for performance
videoSchema.index({ uploader: 1 });
videoSchema.index({ organization: 1 });
videoSchema.index({ status: 1 });
videoSchema.index({ createdAt: -1 });
videoSchema.index({ tags: 1 });
videoSchema.index({ title: 'text', description: 'text' });

// Virtual for video URL
videoSchema.virtual('url').get(function() {
  return `/api/videos/${this._id}/stream`;
});

// Method to check if video is accessible by user
videoSchema.methods.isAccessible = function(user) {
  // Public videos are accessible to everyone
  if (this.privacy === 'public') return true;
  
  // Uploader can always access their own videos (any organization, any privacy)
  if (this.uploader.toString() === user._id.toString()) return true;
  
  // Check if user is in the same organization
  // Handle both populated organization object and ObjectId
  let userOrgId;
  if (user.organization) {
    userOrgId = user.organization._id ? user.organization._id.toString() : user.organization.toString();
  }
  
  let videoOrgId;
  if (this.organization) {
    videoOrgId = this.organization._id ? this.organization._id.toString() : this.organization.toString();
  }
  
  // If both have organization IDs and they match, allow access
  if (userOrgId && videoOrgId && userOrgId === videoOrgId) {
    // Organization members can view ALL videos from their organization
    // Viewers can view all videos from their org (can't edit/delete, but can view)
    // Editors and Admins can view and manage videos from their org
    return true;
  }
  
  return false;
};

const Video = mongoose.model('Video', videoSchema);

export default Video;
