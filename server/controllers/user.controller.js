const User = require('../models/user.models');
const jwt = require('jsonwebtoken');
const cloudinary = require('../database/cloudinary');
const fs = require('fs');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const userController = {
  register: async (req, res) => {
    try {
      const { username, email, password } = req.body;
      
      const normalizedEmail = email.toLowerCase().trim();
      
      const userExists = await User.findOne({ 
        $or: [
          { email: normalizedEmail }, 
          { username: username.toLowerCase().trim() }
        ]
      });
      
      if (userExists) {
        return res.status(400).json({ 
          success: false,
          message: 'User already exists' 
        });
      }

      const user = await User.create({
        username: username.trim(),
        email: normalizedEmail,
        password: password.trim()
      });

      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          username: user.username,
          email: user.email,
          token: generateToken(user._id)
        }
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const normalizedEmail = email.toLowerCase().trim();
      
      const user = await User.findOne({ email: normalizedEmail }).select('+password');
      
      if (!user || !(await user.matchPassword(password.trim()))) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      const token = generateToken(user._id);

      res.json({
        success: true,
        data: {
          _id: user._id,
          username: user.username,
          email: user.email,
          profilePicture: user.profilePicture,
          bio: user.bio,
          token
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  getProfile: async (req, res) => {
    try {
      // Fix the populate issue - check if the videos field exists
      const user = await User.findById(req.user._id).select('-password');
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      res.status(200).json({
        success: true,
        user
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  updateProfile: async (req, res) => {
    try {
      const updateData = {};
      
      // Only update fields that were sent
      if (req.body.username) updateData.username = req.body.username.trim();
      if (req.body.bio !== undefined) updateData.bio = req.body.bio.trim();

      // Handle profile picture upload
      if (req.file) {
        try {
          console.log('Uploading file to Cloudinary:', req.file.path);
          
          const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'profile-pictures',
            transformation: [{ width: 500, height: 500, crop: 'fill' }]
          });
          
          // Clean up the temporary file
          fs.unlinkSync(req.file.path);
          
          updateData.profilePicture = result.secure_url;

          // If user already has a profile picture, delete the old one from Cloudinary
          if (req.user.profilePicture) {
            try {
              const publicId = req.user.profilePicture.split('/').pop().split('.')[0];
              if (publicId) {
                await cloudinary.uploader.destroy(`profile-pictures/${publicId}`);
              }
            } catch (deleteError) {
              console.error('Error deleting old profile picture:', deleteError);
              // Continue with the update even if deletion fails
            }
          }
        } catch (uploadError) {
          console.error('Cloudinary upload error:', uploadError);
          
          // Clean up the temporary file in case of error
          if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
          }
          
          return res.status(500).json({
            success: false,
            message: 'Error uploading profile picture'
          });
        }
      }

      // Only update if there's something to update
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No data provided for update'
        });
      }

      const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updateData },
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user
      });
    } catch (error) {
      console.error('Update profile error:', error);
      
      // Clean up the temporary file in case of error
      if (req.file && req.file.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  getUserProfile: async (req, res) => {
    try {
      const user = await User.findById(req.params.userId)
        .select('-password')
        .populate({
          path: 'videos',
          select: 'title description videoUrl thumbnailUrl views likes comments createdAt'
        });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.status(200).json({
        success: true,
        user
      });
    } catch (error) {
      console.error('Get user profile error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
};

module.exports = { userController };