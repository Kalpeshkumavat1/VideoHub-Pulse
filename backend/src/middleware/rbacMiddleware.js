
const roleHierarchy = {
  viewer: 1,
  editor: 2,
  admin: 3
};

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userRole = req.user.role;
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${userRole}`
      });
    }

    next();
  };
};

export const requireMinRole = (minRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userRoleLevel = roleHierarchy[req.user.role] || 0;
    const minRoleLevel = roleHierarchy[minRole] || 0;

    if (userRoleLevel < minRoleLevel) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Minimum required role: ${minRole}. Your role: ${req.user.role}`
      });
    }

    next();
  };
};

export const canAccessVideo = async (req, res, next) => {
  try {
    const user = req.user;
    const videoId = req.params.id || req.params.videoId;

    if (!videoId) {
      return res.status(400).json({
        success: false,
        message: 'Video ID is required'
      });
    }

    const Video = (await import('../models/Video.js')).default;
    const video = await Video.findById(videoId).populate('organization');

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    if (user.role === 'admin' || user.role === 'editor') {
      const userOrgId = user.organization._id?.toString() || user.organization.toString();
      const videoOrgId = video.organization._id?.toString() || video.organization.toString();
      
      if (userOrgId === videoOrgId) {
        req.video = video;
        return next();
      }
    }

    if (user.role === 'viewer') {
      if (video.uploader.toString() === user._id.toString()) {
        req.video = video;
        return next();
      }

      if (video.privacy === 'public') {
        req.video = video;
        return next();
      }

      const userOrgId = user.organization._id?.toString() || user.organization.toString();
      const videoOrgId = video.organization._id?.toString() || video.organization.toString();
      
      if (userOrgId === videoOrgId) {
        req.video = video;
        return next();
      }
    }

    return res.status(403).json({
      success: false,
      message: 'You do not have permission to access this video'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error checking video access permissions'
    });
  }
};

export const canModifyVideo = async (req, res, next) => {
  try {
    const user = req.user;
    const videoId = req.params.id || req.params.videoId;

    if (!videoId) {
      return res.status(400).json({
        success: false,
        message: 'Video ID is required'
      });
    }

    if (user.role === 'viewer') {
      return res.status(403).json({
        success: false,
        message: 'Viewers do not have permission to modify videos'
      });
    }

    const Video = (await import('../models/Video.js')).default;
    const video = await Video.findById(videoId).populate('organization');

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    if (user.role === 'admin') {
      const userOrgId = user.organization._id?.toString() || user.organization.toString();
      const videoOrgId = video.organization._id?.toString() || video.organization.toString();
      
      if (userOrgId === videoOrgId) {
        req.video = video;
        return next();
      }
    }

    if (user.role === 'editor') {
      if (video.uploader.toString() === user._id.toString()) {
        req.video = video;
        return next();
      }

      const userOrgId = user.organization._id?.toString() || user.organization.toString();
      const videoOrgId = video.organization._id?.toString() || video.organization.toString();
      
      if (userOrgId === videoOrgId) {
        req.video = video;
        return next();
      }
    }

    return res.status(403).json({
      success: false,
      message: 'You do not have permission to modify this video'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error checking video modify permissions'
    });
  }
};

export const canUploadVideo = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (req.user.role === 'viewer') {
      return res.status(403).json({
        success: false,
        message: 'Viewers do not have permission to upload videos'
      });
    }

    // Ensure organization is populated
    if (!req.user.organization) {
      // Try to populate if not already populated
      const User = (await import('../models/User.js')).default;
      const user = await User.findById(req.user._id).populate('organization');
      
      if (!user || !user.organization) {
        return res.status(400).json({
          success: false,
          message: 'User organization not found. Please contact administrator.'
        });
      }
      
      req.user.organization = user.organization;
    }

    next();
  } catch (error) {
    console.error('canUploadVideo error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking upload permissions'
    });
  }
};

export const canManageUsers = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Only administrators can manage users'
    });
  }

  next();
};
