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

// Configure Cloudinary storage for images
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'pawplay_photos',
    resource_type: 'image',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    transformation: [{ width: 1280, height: 720, crop: 'limit' }]
  }
});

// Configure upload for image files
const uploadImage = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed (JPEG, JPG, PNG, GIF)'));
  }
});

// Generate thumbnail from image
const generateThumbnail = async (imageUrl) => {
  try {
    // Extract public_id from the image URL
    const publicId = imageUrl.split('/').slice(-1)[0].split('.')[0];
    
    // Generate a thumbnail using Cloudinary's image transformation
    const thumbnailUrl = cloudinary.url(publicId, {
      resource_type: 'image',
      format: 'jpg',
      transformation: [
        { width: 640, height: 360, crop: 'fill' },
        { quality: 'auto' }
      ]
    });
    
    return thumbnailUrl;
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    return imageUrl;
  }
};

// Handle file upload - keeping the field name as 'video' for compatibility
const uploadFile = async (req, res, next) => {
  const upload = uploadImage.single('video'); // Keep field name as 'video' for API compatibility
  
  upload(req, res, async function(err) {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({ message: err.message });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: 'Please select an image to upload' });
    }
    
    try {
      // Generate thumbnail
      const thumbnailUrl = await generateThumbnail(req.file.path);
      
      // Add thumbnail URL to the request
      req.file.thumbnailUrl = thumbnailUrl;
      
      next();
    } catch (error) {
      console.error('Error in upload middleware:', error);
      return res.status(500).json({ message: 'Failed to process image' });
    }
  });
};

module.exports = { uploadFile };
