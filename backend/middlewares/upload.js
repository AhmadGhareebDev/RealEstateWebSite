const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../configs/cloudinary');

const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'real_estate_app/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
    upload_preset: process.env.CLOUDINARY_PROFILE_PRESET,
  },
});

const propertyStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'real_estate_app/properties',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, height: 800, crop: 'limit' }],
    upload_preset: process.env.CLOUDINARY_PROPERTY_PRESET,
  },
});

const uploadProfile = multer({ storage: profileStorage });

const uploadProperty = multer({
  storage: propertyStorage,
  limits: { files: 20 },
});

module.exports = { uploadProfile, uploadProperty };