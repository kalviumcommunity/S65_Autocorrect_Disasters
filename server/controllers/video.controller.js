const Video = require('../models/video.model');
const fs = require('fs');
const path = require('path');

// Controller for uploading a video
const uploadVideo = async (req, res) => {
  try {
    // Get video data from the request
    const { title, description } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'No video file uploaded' });
    }

    console.log('File uploaded successfully:', {
      cloudinaryPath: req.file.path,
      thumbnailUrl: req.file.thumbnailUrl,
      originalName: req.file.originalname
    });

    // Create a new video
    const newVideo = new Video({
      title: title || 'Untitled Video',
      description: description || '',
      videoUrl: req.file.path, // Cloudinary URL
      thumbnailUrl: req.file.thumbnailUrl,
      user: req.user._id // User ID from auth middleware
    });

    // Save the video
    await newVideo.save();
    
    // Clean up local file if it exists
    if (req.file.filename && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.warn('Could not delete local file:', cleanupError);
      }
    }

    // Return success response
    return res.status(201).json({
      success: true,
      message: 'Video uploaded successfully',
      video: newVideo
    });
  } catch (error) {
    console.error('Error uploading video:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload video',
      error: error.message
    });
  }
};

// Get all videos
const getVideos = async (req, res) => {
  try {
    const videos = await Video.find()
      .sort({ createdAt: -1 })
      .populate('user', 'username profilePicture')
      .populate({
        path: 'comments',
        populate: {
          path: 'user',
          select: 'username profilePicture'
        }
      })
      .limit(20);

    return res.status(200).json({
      success: true,
      count: videos.length,
      videos
    });
  } catch (error) {
    console.error('Error fetching videos:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch videos',
      error: error.message
    });
  }
};

// Get video by ID
const getVideoById = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id)
      .populate('user', 'name avatar')
      .populate('comments.user', 'name avatar');

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Increment view count
    video.views += 1;
    await video.save();

    return res.status(200).json({
      success: true,
      video
    });
  } catch (error) {
    console.error('Error fetching video:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch video',
      error: error.message
    });
  }
};

// Update video
const updateVideo = async (req, res) => {
  try {
    const { title, description } = req.body;
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Check if the user is the owner
    if (video.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this video'
      });
    }

    video.title = title || video.title;
    video.description = description || video.description;

    await video.save();

    return res.status(200).json({
      success: true,
      message: 'Video updated successfully',
      video
    });
  } catch (error) {
    console.error('Error updating video:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update video',
      error: error.message
    });
  }
};

// Delete video
const deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Check if the user is the owner
    if (video.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this video'
      });
    }

    await Video.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Video deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting video:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete video',
      error: error.message
    });
  }
};

// Like/unlike video
const likeVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Use findOneAndUpdate instead of save to avoid version conflicts
    const result = await Video.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          likes: video.likes.includes(req.user._id)
            ? video.likes.filter(like => like.toString() !== req.user._id.toString())
            : [...video.likes, req.user._id]
        }
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      likes: result.likes,
      message: video.likes.includes(req.user._id) ? 'Video unliked' : 'Video liked'
    });
  } catch (error) {
    console.error('Error liking video:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to like/unlike video',
      error: error.message
    });
  }
};

// Add comment
const addComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required'
      });
    }

    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Add comment
    const comment = {
      user: req.user._id,
      text,
      createdAt: Date.now()
    };

    video.comments.unshift(comment);
    await video.save();

    // Populate user info for the new comment
    const populatedVideo = await Video.findById(req.params.id)
      .populate('comments.user', 'name avatar');

    return res.status(201).json({
      success: true,
      comments: populatedVideo.comments
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add comment',
      error: error.message
    });
  }
};

// Get videos from a specific user
const getUserVideos = async (req, res) => {
  try {
    const videos = await Video.find({ user: req.params.userId })
      .sort({ createdAt: -1 })
      .populate('user', 'name avatar');

    return res.status(200).json({
      success: true,
      count: videos.length,
      videos
    });
  } catch (error) {
    console.error('Error fetching user videos:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user videos',
      error: error.message
    });
  }
};

// Get videos from the logged-in user
const fetchUserVideos = async (req, res) => {
  try {
    const videos = await Video.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('user', 'name avatar');

    return res.status(200).json({
      success: true,
      count: videos.length,
      videos
    });
  } catch (error) {
    console.error('Error fetching user videos:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user videos',
      error: error.message
    });
  }
};

module.exports = {
  uploadVideo,
  getVideos,
  getVideoById,
  updateVideo,
  deleteVideo,
  likeVideo,
  addComment,
  getUserVideos,
  fetchUserVideos
}