const User = require('../models/User');
const Property = require('../models/Property');


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

    const listings = await Property.find({
      listedBy: agent._id,
      status: { $in: ['active', 'sold'] }
    })
      .sort({ createdAt: -1 })
      .select('title price location images status type bedrooms bathrooms area')
      .populate('reviews', 'rating');

    const listingCount = listings.length;

    const listingsForResponse = listings.map((p) => ({
      id: p._id,
      title: p.title,
      location: p.location,
      price: p.price,
      status: p.status,
      type: p.type,
      images: p.images,
      averageRating: p.averageRating,
      reviewCount: p.reviewCount
    }));

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
        reviews: agent.reviews,
        listings: listingsForResponse
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
