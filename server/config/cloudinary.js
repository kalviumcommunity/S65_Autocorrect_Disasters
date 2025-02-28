import cloudinary from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const cloudinaryInstance = cloudinary.v2;

export const uploadToCloudinary = async (filePath) => {
  try {
    const result = await cloudinaryInstance.uploader.upload(filePath, {
      folder: 'autocorrect-disasters',
      use_filename: true
    });
    
    fs.unlinkSync(filePath);
    
    return result;
  } catch (error) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw error;
  }
};

export default uploadToCloudinary;