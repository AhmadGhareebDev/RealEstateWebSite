const User = require('../models/User');
const Property = require('../models/Property');

const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password -refreshToken -emailVerificationCode -emailVerificationExpires")
      .populate({
        path: 'reviews',
        populate: {
          path: 'reviewer',
          select: 'username profileImage'
        }
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        errorCode: "USER_NOT_FOUND",
        message: "User profile not found"
      });
    }

    res.json({
      success: true,
      message: "Profile retrieved successfully",
      data: user
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      errorCode: "SERVER_ERROR",
      message: "Server error"
    });
  }
};

const updateMyProfile = async (req, res) => {
  try {
    const updates = req.body;

    const foundUser = await User.findById(req.user.id)
      .select("-password -refreshToken -emailVerificationCode -emailVerificationExpires");

    if (!foundUser) {
      return res.status(401).json({
        success: false,
        errorCode: "USER_NOT_FOUND",
        message: "User not found or unauthorized"
      });
    }

    const allowed = ["username", "phone", "location"];
    const updateKeys = Object.keys(updates);

    if (updateKeys.length === 0) {
      return res.status(400).json({
        success: false,
        errorCode: "NO_UPDATES",
        message: "No data to update"
      });
    }

    const isValid = updateKeys.every(key => allowed.includes(key));
    if (!isValid) {
      return res.status(400).json({
        success: false,
        errorCode: "INVALID_FIELDS",
        message: "Some fields are not allowed to be updated"
      });
    }

    updateKeys.forEach(field => {
      foundUser[field] = updates[field];
    });

    await foundUser.save();

    res.status(200).json({
      success: true,
      message: "User info updated successfully",
      data: foundUser
    });

  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({
      success: false,
      errorCode: "SERVER_ERROR",
      message: "Server error"
    });
  }
};

const deleteMyAccount = async (req, res) => {
  try {
    await Property.deleteMany({ listedBy: req.user.id });
    await User.findByIdAndDelete(req.user.id);

    res.clearCookie('refreshToken');
    res.json({
      success: true,
      message: 'Account and all data deleted permanently'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ 
      success: false, 
      errorCode: 'SERVER_ERROR',
      message: "Server error"
    });
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  deleteMyAccount
};