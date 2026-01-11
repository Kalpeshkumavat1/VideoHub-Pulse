import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide organization name'],
    trim: true,
    unique: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  logo: {
    type: String,
    default: null
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Will be set after user creation
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  settings: {
    maxStorage: {
      type: Number,
      default: 107374182400 // 100GB default
    },
    maxVideoSize: {
      type: Number,
      default: 10737418240 // 10GB default
    },
    allowedVideoFormats: {
      type: [String],
      default: ['mp4', 'avi', 'mov', 'mkv', 'webm']
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'pro', 'enterprise'],
      default: 'free'
    },
    expiresAt: {
      type: Date
    }
  }
}, {
  timestamps: true
});

// Indexes
organizationSchema.index({ slug: 1 });
organizationSchema.index({ owner: 1 });

const Organization = mongoose.model('Organization', organizationSchema);

export default Organization;
