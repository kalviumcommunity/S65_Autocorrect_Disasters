const express = require('express');
const router = express.Router();
const { userController } = require('../controllers/user.controller');
const { protect } = require('../middlewares/auth');
const { uploadProfile } = require('../database/multer');

// Auth routes
router.post('/register', userController.register);
router.post('/login', userController.login);

// Profile routes
router.get('/profile', protect, userController.getProfile);
router.patch(
  '/profile',
  protect,
  uploadProfile.single('profilePicture'),
  userController.updateProfile
);

// Add this new route for getting other users' profiles
router.get('/profile/:userId', protect, userController.getUserProfile);

module.exports = router;