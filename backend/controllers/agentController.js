const User = require('../models/User');
const Property = require('../models/Property');

/**
 * getAgentProfile — GET /api/agents/:agentId
 * --------------------------------------------
 * Public endpoint — returns agent's public profile info.
 * NEVER returns: licenseNumber, phone, email, password, refreshToken.
 * Returns: username, profileImage, location, role, listing count, reviews, ratings.
 */
const getAgentProfile = async (req, res) => {
  try {
    const agent = await User.findOne({
      _id: req.params.agentId,
      role: 'agent'
    })
      .select('username profileImage location role isVerified createdAt')
      .populate({
        path: 'reviews',
        populate: {
          path: 'reviewer',
          select: 'username profileImage'
        }
      });

    if (!agent) {
      return res.status(404).json({
        success: false,
        errorCode: 'NOT_FOUND',
        message: 'Agent not found'
      });
    }

    // Count the agent's active listings
    const listingCount = await Property.countDocuments({
      listedBy: agent._id,
      status: 'active'
    });

    res.json({
      success: true,
      message: 'Agent profile retrieved successfully',
      data: {
        id: agent._id,
        username: agent.username,
        profileImage: agent.profileImage,
        location: agent.location,
        role: agent.role,
        isVerified: agent.isVerified,
        createdAt: agent.createdAt,
        listingCount,
        averageRating: agent.averageRating,
        reviewCount: agent.reviewCount,
        reviews: agent.reviews
      }
    });

  } catch (error) {
    console.error('Get agent profile error:', error);
    res.status(500).json({
      success: false,
      errorCode: 'SERVER_ERROR',
      message: 'Server error'
    });
  }
};

module.exports = {
  getAgentProfile
};
