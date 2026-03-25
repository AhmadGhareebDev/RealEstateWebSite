const User = require('../models/User');

const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        errorCode: "NO_FILE",
        message: "No file uploaded" 
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        errorCode: "USER_NOT_FOUND",
        message: "User not found"
      });
    }

    user.profileImage = req.file.path;
    await user.save();

    res.json({
      success: true,
      message: "Profile image updated successfully",
      data: { profileImage: req.file.path }
    });
  } catch (error) {
    console.error('Upload profile image error:', error);
    res.status(500).json({ 
      success: false, 
      errorCode: "SERVER_ERROR",
      message: "Server error"
    });
  }
};

const uploadPropertyImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        success: false, 
        errorCode: "NO_FILES",
        message: "No images uploaded" 
      });
    }

    const imageUrls = req.files.map(file => file.path);

    res.json({
      success: true,
      message: "Images uploaded successfully",
      data: { images: imageUrls }
    });
  } catch (error) {
    console.error('Upload property images error:', error);
    res.status(500).json({ 
      success: false, 
      errorCode: "SERVER_ERROR",
      message: "Server error"
    });
  }
};

module.exports = { uploadProfileImage, uploadPropertyImages };