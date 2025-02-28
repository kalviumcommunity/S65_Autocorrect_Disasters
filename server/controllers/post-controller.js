import Post from '../models/post-model.js';
import User from '../models/user-model.js';
import { uploadToCloudinary } from '../config/cloudinary.js';

const createPost = async (req, res, next) => {
  try {
    const { title, description } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Please upload an image' });
    }

    const result = await uploadToCloudinary(req.file.path);

    if (!result || !result.secure_url) {
      return res.status(500).json({ error: 'Error uploading image' });
    }

    const newPost = new Post({
      user: req.user.id,
      image: result.secure_url,
      title,
      description
    });

    const savedPost = await newPost.save();
    await savedPost.populate('user', 'name avatar');

    res.status(201).json({
      success: true,
      data: savedPost
    });
  } catch (err) {
    next(err);
  }
};

const getAllPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit)
      .populate('user', 'name avatar')
      .populate('likes', 'name avatar')
      .populate('comments.user', 'name avatar');

    const totalPosts = await Post.countDocuments();

    res.status(200).json({
      success: true,
      count: posts.length,
      pagination: {
        total: totalPosts,
        pages: Math.ceil(totalPosts / limit),
        currentPage: page
      },
      data: posts
    });
  } catch (err) {
    next(err);
  }
};

const getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', 'name avatar')
      .populate('likes', 'name avatar')
      .populate('comments.user', 'name avatar');

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.status(200).json({
      success: true,
      data: post
    });
  } catch (err) {
    next(err);
  }
};

const updatePost = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    let post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this post' });
    }

    post.title = title || post.title;
    post.description = description || post.description;

    if (req.file) {
      const result = await uploadToCloudinary(req.file.path);
      if (result && result.secure_url) {
        post.image = result.secure_url;
      }
    }

    await post.save();

    res.status(200).json({
      success: true,
      data: post
    });
  } catch (err) {
    next(err);
  }
};

const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }

    await post.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

const likePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.likes.includes(req.user.id)) {
      return res.status(400).json({ error: 'Post already liked' });
    }

    post.likes.push(req.user.id);
    await post.save();

    res.status(200).json({
      success: true,
      data: post.likes
    });
  } catch (err) {
    next(err);
  }
};

const unlikePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const removeIndex = post.likes.indexOf(req.user.id);

    if (removeIndex === -1) {
      return res.status(400).json({ error: 'Post has not been liked yet' });
    }

    post.likes.splice(removeIndex, 1);
    await post.save();

    res.status(200).json({
      success: true,
      data: post.likes
    });
  } catch (err) {
    next(err);
  }
};

const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const user = await User.findById(req.user.id).select('name avatar');

    const newComment = {
      user: req.user.id,
      text,
      name: user.name,
      avatar: user.avatar
    };

    post.comments.push(newComment);
    await post.save();

    res.status(201).json({
      success: true,
      data: post.comments
    });
  } catch (err) {
    next(err);
  }
};

const deleteComment = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const comment = post.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }

    comment.remove();
    await post.save();

    res.status(200).json({
      success: true,
      data: post.comments
    });
  } catch (err) {
    next(err);
  }
};

export { createPost, getAllPosts, getPostById, updatePost, deletePost, likePost, unlikePost, addComment, deleteComment };