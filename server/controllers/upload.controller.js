const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET
});

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'pawplay_photos',
    resource_type: 'image',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 1280, height: 720, crop: 'limit' }]
  }
});

// Configure upload for image files
const uploadPhoto = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    const filetypes = /jpg|jpeg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed (JPG, JPEG, PNG)'));
  }
});

// Handle file upload
const uploadFile = async (req, res, next) => {
  const upload = uploadPhoto.single('photo');
  
  upload(req, res, async function(err) {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({ message: err.message });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image file' });
    }
    
    try {
      // Add image URL to the request
      req.file.imageUrl = req.file.path;
      
      next();
    } catch (error) {
      console.error('Error in upload middleware:', error);
      return res.status(500).json({ message: 'Failed to process image' });
    }
  });
};

module.exports = { uploadFile };