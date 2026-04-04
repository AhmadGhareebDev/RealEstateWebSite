const User = require('../models/User');
const Property = require('../models/Property');
const AgentRating = require('../models/AgentRating');

const RATING_PRIOR_MEAN = 4;
const RATING_PRIOR_WEIGHT = 10;

const maskLicenseNumber = (licenseNumber = '') => {
  const value = String(licenseNumber || '');
  if (!value) return 'N/A';
  if (value.length <= 4) return `****${value}`;
  return `${'*'.repeat(Math.max(value.length - 4, 4))}${value.slice(-4)}`;
};

const recalculateAgentProfileRatingStats = async (agentId) => {
  const [stats] = await AgentRating.aggregate([
    { $match: { agent: agentId } },
    {
      $group: {
        _id: '$agent',
        count: { $sum: 1 },
        sum: { $sum: '$rating' },
        average: { $avg: '$rating' }
      }
    }
  ]);

  const profileRatingCount = stats?.count || 0;
  const profileRatingScoreSum = stats?.sum || 0;
  const profileRatingAverage = profileRatingCount > 0
    ? Number((profileRatingScoreSum / profileRatingCount).toFixed(2))
    : 0;

  await User.findByIdAndUpdate(agentId, {
    profileRatingCount,
    profileRatingScoreSum,
    profileRatingAverage
  });

  return {
    profileRatingCount,
    profileRatingScoreSum,
    profileRatingAverage,
    bayesianScore: Number(
      (((profileRatingCount * profileRatingAverage) + (RATING_PRIOR_WEIGHT * RATING_PRIOR_MEAN))
        / (profileRatingCount + RATING_PRIOR_WEIGHT)).toFixed(3)
    )
  };
};

const getAgentProfile = async (req, res) => {
  try {
    const viewerId = req.user?.id ? String(req.user.id) : null;
    const agent = await User.findOne({
      _id: req.params.agentId,
      role: 'agent'
    })
      .select('username profileImage location role isVerified createdAt profileRatingAverage profileRatingCount licenseNumber licenseState brokerage')
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
        isSelf: !!viewerId && String(agent._id) === viewerId,
        username: agent.username,
        profileImage: agent.profileImage,
        location: agent.location,
        role: agent.role,
        isVerified: agent.isVerified,
        licenseNumber: undefined,
        maskedLicenseNumber: maskLicenseNumber(agent.licenseNumber),
        licenseState: agent.licenseState,
        brokerage: agent.brokerage,
        createdAt: agent.createdAt,
        listingCount,
        averageRating: agent.profileRatingAverage,
        reviewCount: agent.profileRatingCount,
        profileRatingAverage: agent.profileRatingAverage,
        profileRatingCount: agent.profileRatingCount,
        bayesianScore: Number(
          (((agent.profileRatingCount * agent.profileRatingAverage) + (RATING_PRIOR_WEIGHT * RATING_PRIOR_MEAN))
            / (agent.profileRatingCount + RATING_PRIOR_WEIGHT)).toFixed(3)
        ),
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

const getAllAgents = async (req, res) => {
  try {
    const viewerId = req.user?.id ? String(req.user.id) : null;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 8, 1), 50);
    const skip = (page - 1) * limit;
    const q = (req.query.q || '').trim();
    const sortBy = (req.query.sortBy || 'newest').toLowerCase();

    const filter = {
      role: 'agent',
      ...(q
        ? {
            $or: [
              { username: { $regex: q, $options: 'i' } },
              { location: { $regex: q, $options: 'i' } },
              { brokerage: { $regex: q, $options: 'i' } }
            ]
          }
        : {})
    };

    const total = await User.countDocuments(filter);

    let agents;

    if (sortBy === 'rating') {
      agents = await User.aggregate([
        { $match: filter },
        {
          $addFields: {
            bayesianScore: {
              $divide: [
                {
                  $add: [
                    { $multiply: ['$profileRatingCount', '$profileRatingAverage'] },
                    RATING_PRIOR_WEIGHT * RATING_PRIOR_MEAN
                  ]
                },
                { $add: ['$profileRatingCount', RATING_PRIOR_WEIGHT] }
              ]
            }
          }
        },
        {
          $sort: {
            bayesianScore: -1,
            profileRatingCount: -1,
            profileRatingAverage: -1,
            createdAt: -1
          }
        },
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            _id: 1,
            username: 1,
            profileImage: 1,
            location: 1,
            role: 1,
            isVerified: 1,
            createdAt: 1,
            brokerage: 1,
            licenseState: 1,
            profileRatingAverage: 1,
            profileRatingCount: 1,
            bayesianScore: { $round: ['$bayesianScore', 3] },
            maskedLicenseNumber: {
              $let: {
                vars: {
                  ln: { $ifNull: ['$licenseNumber', ''] }
                },
                in: {
                  $cond: [
                    { $eq: [{ $strLenCP: '$$ln' }, 0] },
                    'N/A',
                    {
                      $concat: [
                        '****',
                        {
                          $substrCP: [
                            '$$ln',
                            { $max: [{ $subtract: [{ $strLenCP: '$$ln' }, 4] }, 0] },
                            4
                          ]
                        }
                      ]
                    }
                  ]
                }
              }
            }
          }
        }
      ]);

      agents = agents.map((agent) => ({
        ...agent,
        isSelf: !!viewerId && String(agent._id) === viewerId
      }));
    } else {
      const sort = { createdAt: -1 };
      agents = await User.find(filter)
        .select('username profileImage location role isVerified createdAt brokerage licenseNumber licenseState profileRatingAverage profileRatingCount')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean();

      agents = agents.map((agent) => ({
        ...agent,
        licenseNumber: undefined,
        maskedLicenseNumber: maskLicenseNumber(agent.licenseNumber),
        isSelf: !!viewerId && String(agent._id) === viewerId,
        bayesianScore: Number(
          (((agent.profileRatingCount * agent.profileRatingAverage) + (RATING_PRIOR_WEIGHT * RATING_PRIOR_MEAN))
            / (agent.profileRatingCount + RATING_PRIOR_WEIGHT)).toFixed(3)
        )
      }));
    }

    res.json({
      success: true,
      message: 'Agents retrieved successfully',
      data: {
        agents,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalAgents: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
          limit
        }
      }
    });

  } catch (error) {
    console.error('Get all agents error:', error);
    res.status(500).json({
      success: false,
      errorCode: 'SERVER_ERROR',
      message: 'Server error'
    });
  }
};

const rateAgentProfile = async (req, res) => {
  try {
    const reviewerId = req.user.id;
    const { agentId } = req.params;
    const { rating } = req.body;

    const targetAgent = await User.findOne({ _id: agentId, role: 'agent' });

    if (!targetAgent) {
      return res.status(404).json({
        success: false,
        errorCode: 'NOT_FOUND',
        message: 'Agent not found'
      });
    }

    if (String(targetAgent._id) === String(reviewerId)) {
      return res.status(403).json({
        success: false,
        errorCode: 'FORBIDDEN',
        message: 'You cannot rate your own profile'
      });
    }

    const existingRating = await AgentRating.findOne({ reviewer: reviewerId, agent: agentId });

    if (existingRating) {
      existingRating.rating = rating;
      await existingRating.save();
    } else {
      await AgentRating.create({
        reviewer: reviewerId,
        agent: agentId,
        rating
      });
    }

    const updatedStats = await recalculateAgentProfileRatingStats(targetAgent._id);

    return res.json({
      success: true,
      message: existingRating ? 'Agent rating updated successfully' : 'Agent rated successfully',
      data: {
        agentId: targetAgent._id,
        myRating: rating,
        averageRating: updatedStats.profileRatingAverage,
        ratingCount: updatedStats.profileRatingCount,
        bayesianScore: updatedStats.bayesianScore
      }
    });
  } catch (error) {
    console.error('Rate agent profile error:', error);
    res.status(500).json({
      success: false,
      errorCode: 'SERVER_ERROR',
      message: 'Server error'
    });
  }
};

module.exports = {
  getAgentProfile,
  getAllAgents,
  rateAgentProfile
};
