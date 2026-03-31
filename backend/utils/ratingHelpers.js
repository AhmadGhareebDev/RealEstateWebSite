const User = require('../models/User');
const Property = require('../models/Property');
const Review = require('../models/Review');

const getUserWithRatings = async (userId) => {
  return await User.findById(userId)
    .populate('reviews')
    .lean();
};

const getPropertyWithRatings = async (propertyId) => {
  return await Property.findById(propertyId)
    .populate('reviews')
    .lean();
};

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
