const Review = require('../models/Review');
const Property = require('../models/Property');
const User = require('../models/User');

const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewer: req.user.id })
      .populate('property', 'title location')
      .populate('agent', 'username profileImage')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      message: 'My reviews retrieved successfully',
      data: reviews
    });
  } catch (error) {
    console.error('Get my reviews error:', error);
    res.status(500).json({
      success: false,
      errorCode: "SERVER_ERROR",
      message: "Server error"
    });
  }
};

const getPropertyReviews = async (req, res) => {
  const { propertyId } = req.params;
  
  try {
    const reviews = await Review.find({ property: propertyId })
      .populate('reviewer', 'username profileImage')
      .sort({ createdAt: -1 });
      
    const reviewCount = reviews.length;
    const averageRating = reviewCount > 0 
      ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount).toFixed(1))
      : 0;

    res.json({
      success: true,
      data: {
        reviews,
        reviewCount,
        averageRating
      }
    });
  } catch (error) {
    console.error('Get property reviews error:', error);
    res.status(500).json({
      success: false,
      errorCode: "SERVER_ERROR",
      message: "Server error"
    });
  }
};




const createPropertyReview = async (req, res) => {
  const { rating, comment } = req.body;
  const propertyId = req.params.propertyId;
  const reviewerId = req.user.id;

  try {
    const property = await Property.findById(propertyId);
    if (!property || property.status !== 'active') {
      return res.status(404).json({ 
        success: false, 
        errorCode: "NOT_FOUND",
        message: "Property not found"
      });
    }

    if (property.listedBy?.toString?.() === reviewerId?.toString?.()) {
      return res.status(403).json({
        success: false,
        errorCode: "FORBIDDEN",
        message: "You cannot review your own listing"
      });
    }

    const alreadyReviewed = await Review.findOne({ reviewer: reviewerId, property: propertyId });
    if (alreadyReviewed) {
      return res.status(400).json({ 
        success: false, 
        errorCode: "ALREADY_REVIEWED",
        message: "You already reviewed this property" 
      });
    }

    const review = new Review({
      rating,
      comment: comment?.trim(),
      reviewer: reviewerId,
      property: propertyId
    });

    await review.save();
    
    await review.populate('reviewer', 'username profileImage');

    res.status(201).json({ 
      success: true, 
      message: "Property reviewed successfully", 
      data: review 
    });
  } catch (error) {
    console.error('Create property review error:', error);
    res.status(500).json({ 
      success: false, 
      errorCode: "SERVER_ERROR",
      message: "Server error"
    });
  }
};

const createAgentReview = async (req, res) => {
  const { rating, comment } = req.body;
  const agentId = req.params.agentId;
  const reviewerId = req.user.id;

  try {
    const agent = await User.findById(agentId);
    if (!agent || agent.role !== 'agent') {
      return res.status(404).json({ 
        success: false, 
        errorCode: "NOT_FOUND",
        message: "Agent not found" 
      });
    }

    const alreadyReviewed = await Review.findOne({ reviewer: reviewerId, agent: agentId });
    if (alreadyReviewed) {
      return res.status(400).json({ 
        success: false, 
        errorCode: "ALREADY_REVIEWED",
        message: "You already reviewed this agent" 
      });
    }

    const review = new Review({
      rating,
      comment: comment?.trim(),
      reviewer: reviewerId,
      agent: agentId
    });

    await review.save();

    res.status(201).json({ 
      success: true, 
      message: "Agent reviewed successfully", 
      data: review 
    });
  } catch (error) {
    console.error('Create agent review error:', error);
    res.status(500).json({ 
      success: false, 
      errorCode: "SERVER_ERROR",
      message: "Server error"
    });
  }
};

const updateReview = async (req, res) => {
  const { reviewId } = req.params;
  const updates = req.body;
  const userId = req.user.id;

  try {
    const review = await Review.findOne({ _id: reviewId, reviewer: userId });
    if (!review) {
      return res.status(404).json({
        success: false,
        errorCode: "NOT_FOUND",
        message: "Review not found or not yours"
      });
    }

    if (updates.rating !== undefined) review.rating = updates.rating;
    if (updates.comment !== undefined) review.comment = updates.comment.trim() || null;

    await review.save();

    res.json({
      success: true,
      message: "Review updated successfully",
      data: review
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ 
      success: false, 
      errorCode: "SERVER_ERROR",
      message: "Server error"
    });
  }
};

const deleteReview = async (req, res) => {
  const { reviewId } = req.params;
  const userId = req.user.id;

  try {
    const review = await Review.findOneAndDelete({
      _id: reviewId,
      reviewer: userId
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        errorCode: "NOT_FOUND",
        message: "Review not found or not yours"
      });
    }

    res.json({
      success: true,
      message: "Review deleted successfully"
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ 
      success: false, 
      errorCode: "SERVER_ERROR",
      message: "Server error"
    });
  }
};

module.exports = {
  createPropertyReview,
  createAgentReview,
  updateReview,
  deleteReview,
  getPropertyReviews,
  getMyReviews
};