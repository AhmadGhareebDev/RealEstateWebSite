const User = require('../models/User');
const Property = require('../models/Property');
const Review = require('../models/Review');

// Get user with reviews and ratings
const getUserWithRatings = async (userId) => {
  return await User.findById(userId)
    .populate('reviews')
    .lean();
};

// Get property with reviews and ratings
const getPropertyWithRatings = async (propertyId) => {
  return await Property.findById(propertyId)
    .populate('reviews')
    .lean();
};

// Calculate user rating using aggregation
const calculateUserRating = async (userId) => {
  const result = await Review.aggregate([
    { $match: { agent: userId } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 }
      }
    }
  ]);

  return {
    averageRating: result[0] ? Number(result[0].averageRating.toFixed(1)) : 0,
    reviewCount: result[0] ? result[0].reviewCount : 0
  };
};

// Calculate property rating using aggregation
const calculatePropertyRating = async (propertyId) => {
  const result = await Review.aggregate([
    { $match: { property: propertyId } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 }
      }
    }
  ]);

  return {
    averageRating: result[0] ? Number(result[0].averageRating.toFixed(1)) : 0,
    reviewCount: result[0] ? result[0].reviewCount : 0
  };
};

module.exports = {
  getUserWithRatings,
  getPropertyWithRatings,
  calculateUserRating,
  calculatePropertyRating
};
