import express from 'express';
import { registerUser, loginUser, getUserProfile, updateUserProfile, authStatus } from '../controllers/user-controller.js';
import { verifyToken } from '../middlewares/auth-middleware.js';
import { uploadMiddleware } from '../config/multer-config.js';

const router = express.Router();

router.post('/signup', uploadMiddleware.single('avatar'), registerUser);
router.post('/login', loginUser);
router.get('/profile', verifyToken, getUserProfile);
router.put('/profile', verifyToken, uploadMiddleware.single('avatar'), updateUserProfile);

router.get('/status', verifyToken, authStatus);

export default router;