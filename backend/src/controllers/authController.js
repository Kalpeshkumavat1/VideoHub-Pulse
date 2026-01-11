import User from '../models/User.js';
import Organization from '../models/Organization.js';
import generateToken from '../utils/generateToken.js';

export const register = async (req, res) => {
  try {
    const { name, email, password, organizationName } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    let organization;
    if (organizationName) {
      const orgSlug = organizationName.toLowerCase().replace(/\s+/g, '-');
      organization = await Organization.findOne({ slug: orgSlug });
      
      if (!organization) {
        organization = await Organization.create({
          name: organizationName,
          slug: orgSlug,
          members: []
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Organization name is required'
      });
    }

    const isFirstMember = !organization.owner && organization.members.length === 0;

    const user = await User.create({
      name,
      email,
      password,
      organization: organization._id,
      role: isFirstMember ? 'admin' : 'editor'
    });

    if (isFirstMember) {
      organization.owner = user._id;
    }
    organization.members.push(user._id);
    await organization.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: {
          id: organization._id,
          name: organization.name,
          slug: organization.slug
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email }).select('+password').populate('organization');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: {
          id: user.organization._id,
          name: user.organization.name,
          slug: user.organization.slug
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('organization');
    
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
