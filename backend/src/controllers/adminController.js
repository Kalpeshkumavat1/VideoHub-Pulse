import User from '../models/User.js';
import Video from '../models/Video.js';
import Organization from '../models/Organization.js';

export const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalVideos = await Video.countDocuments({ deletedAt: null });
    const totalOrganizations = await Organization.countDocuments();
    const totalStorage = await Video.aggregate([
      { $match: { deletedAt: null } },
      { $group: { _id: null, total: { $sum: '$fileSize' } } }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalVideos,
        totalOrganizations,
        totalStorage: totalStorage[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics'
    });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().populate('organization').select('-password');

    res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
};

export const getVideos = async (req, res) => {
  try {
    const videos = await Video.find({ deletedAt: null })
      .populate('uploader', 'name email')
      .populate('organization', 'name');

    res.status(200).json({
      success: true,
      videos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching videos'
    });
  }
};
