
const express = require('express');
const router = express.Router();
const verifyJWT = require('../../middlewares/verifyJWT');
const { uploadProfile, uploadProperty } = require('../../middlewares/upload');
const { uploadProfileImage, uploadPropertyImages } = require('../../controllers/uploadController');
router.post('/profile', verifyJWT, uploadProfile.single('image'), uploadProfileImage);
router.post('/property', verifyJWT, uploadProperty.array('images', 20), uploadPropertyImages);

module.exports = router;