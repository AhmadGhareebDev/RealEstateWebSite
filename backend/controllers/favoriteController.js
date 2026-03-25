const Favorite = require('../models/Favorite');
const Property = require('../models/Property');

const toggleFavorite = async (req, res) => {
  const userId = req.user.id;
  const propertyId = req.params.propertyId;

  try {
    // Check if property exists and is active
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
    const favorites = await Favorite.find({ user: req.user.id })
      .populate({
        path: 'property',
        match: { status: 'active' },
        populate: { 
          path: 'listedBy', 
          select: 'username role isVerified profileImage'
        }
      });

    // Filter out favorites where property is null (deleted or inactive)
    const validFavorites = favorites.filter(f => f.property !== null);

    res.json({
      success: true,
      message: "Favorites retrieved successfully",
      data: validFavorites  // Return favorites with {property: ...} structure
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