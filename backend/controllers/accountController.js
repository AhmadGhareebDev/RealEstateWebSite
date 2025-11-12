const User = require('../models/User');

const getUserInfo = async (req, res) => {
  const user = req.user;

  if (!user || !user.id) {
    return res.status(401).json({
      success: false,
      errorCode: 'UNAUTHORIZED',
      message: 'Unauthorized: Invalid token.'
    });
  }

  try {
    const foundUser = await User.findById(user.id).select('-password -refreshToken').lean();

    if (!foundUser) {
      return res.status(404).json({
        success: false,
        errorCode: 'USER_NOT_FOUND',
        message: 'User not found.'
      });
    }

    res.json({
      success: true,
      message: 'User data retrieved.',
      data: {
        username: foundUser.username,
        email: foundUser.email,
        location: foundUser.location || null,
        phone: foundUser.phone || null,
        profileImage: foundUser.profileImage || null,
        role: foundUser.role
      }
    });
  } catch (error) {
    console.error('getUserInfo error:', error);
    res.status(500).json({
      success: false,
      errorCode: 'SERVER_ERROR'
    });
  }
};

module.exports = { getUserInfo };