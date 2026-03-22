const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'hustle-hub',
      resource_type: 'auto', // Auto allows files like .glb or images
      public_id: Date.now() + '-' + file.originalname.replace(/\\.[^/.]+$/, "").replace(/\\s+/g, '-'),
    };
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB capacity for 3D models
});

module.exports = upload;
