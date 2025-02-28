import express from 'express';
import { createPost, getAllPosts, getPostById, updatePost, deletePost, likePost, unlikePost, addComment, deleteComment } from '../controllers/post-controller.js';
import { verifyToken } from '../middlewares/auth-middleware.js';
import { uploadMiddleware } from '../config/multer-config.js';

const router = express.Router();

router.post('/', verifyToken, uploadMiddleware.single('image'), createPost);
router.put('/:id', verifyToken, uploadMiddleware.single('image'), updatePost);
router.get('/', getAllPosts);
router.get('/:id', getPostById);
router.delete('/:id', verifyToken, deletePost);
router.post('/:id/like', verifyToken, likePost);
router.post('/:id/unlike', verifyToken, unlikePost);
router.post('/:id/comment', verifyToken, addComment);
router.delete('/:id/comment/:commentId', verifyToken, deleteComment);

export default router;