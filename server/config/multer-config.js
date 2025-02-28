import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { cloudinaryInstance } from './cloudinary.js';

const storage = new CloudinaryStorage({
  cloudinary: cloudinaryInstance,
  params: {
    folder: 'auto',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    use_filename: true,
    unique_filename: true
  }
});

export const uploadMiddleware = multer({ storage });