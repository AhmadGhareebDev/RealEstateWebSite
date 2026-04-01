const Favorite = require('../models/Favorite');
const Property = require('../models/Property');

const toggleFavorite = async (req, res) => {
  const userId = req.user.id;
  const propertyId = req.params.propertyId;

  try {
    const property = await Property.findById(propertyId);
    if (!property || property.status !== 'active') {
      return res.status(404).json({ 
        success: false, 
        errorCode: "PROPERTY_NOT_FOUND",
        message: "Property not found or not available"
      });
    }

    const existing = await Favorite.findOne({ property: propertyId, user: userId });
    
    if (existing) {
      await Favorite.deleteOne({ _id: existing._id });
    } else {
      const favorite = new Favorite({ user: userId, property: propertyId });
      await favorite.save();
    }

    const updatedFavorites = await Favorite.find({ user: userId })
      .populate({
        path: 'property',
        match: { status: 'active' },
        populate: { 
          path: 'listedBy', 
          select: "username role isVerified profileImage"
        }
      });

    const validProperties = updatedFavorites
      .filter(f => f.property !== null)
      .map(f => f.property);

    res.json({
      success: true,
      message: existing ? "Removed from favorites" : "Added to favorites",
      data: {
        isFavorite: !existing,
        favorites: validProperties,
        total: validProperties.length
      }
    });

  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({ 
      success: false, 
      errorCode: "SERVER_ERROR",
      message: "Server error"
    });
  }
};

const getMyFavorites = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = Number(page);
    const limitNum = Number(limit);

    const favorites = await Favorite.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .populate({
        path: 'property',
        match: { status: 'active' },
        populate: [
          { 
            path: 'listedBy', 
            select: 'username role isVerified profileImage'
          },
          {
            path: 'reviews',
            select: 'rating'
          }
        ]
      });

    const validFavorites = favorites.filter(f => f.property !== null);
    const total = await Favorite.countDocuments({ user: req.user.id });

    res.json({
      success: true,
      message: "Favorites retrieved successfully",
      data: {
        favorites: validFavorites,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalFavorites: total,
          hasNext: pageNum < Math.ceil(total / limitNum),
          hasPrev: pageNum > 1
        }
      }
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ 
      success: false, 
      errorCode: "SERVER_ERROR",
      message: "Server error"
    });
  }
};

module.exports = {
  toggleFavorite,
  getMyFavorites
};