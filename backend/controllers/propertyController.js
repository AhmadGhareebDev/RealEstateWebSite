const Property = require('../models/Property');
const User = require('../models/User');

/**
 * createProperty — POST /api/listings
 * ------------------------------------
 * Permission rules enforced here:
 * - Users (role=user) can ONLY create listingType: "fsbo"
 * - Agents (role=agent) can ONLY create listingType: "agent"
 * - Only agents can set isShowcase: true
 * - listedBy is always set from the authenticated user's ID
 */
const createProperty = async (req, res) => {
  const {
    title, price, location, bedrooms, bathrooms, area,
    description, type, listingType, isShowcase
  } = req.body;

  const user = req.user;
  const uploadedImages = req.files ? req.files.map(file => file.path) : [];

  try {
    // Enforce listingType rules based on role
    if (user.role === 'user' && listingType !== 'fsbo') {
      return res.status(403).json({
        success: false,
        errorCode: 'FORBIDDEN',
        message: 'Users can only create FSBO listings (listingType: "fsbo").'
      });
    }

    if (user.role === 'agent' && listingType !== 'agent') {
      return res.status(403).json({
        success: false,
        errorCode: 'FORBIDDEN',
        message: 'Agents can only create agent listings (listingType: "agent").'
      });
    }

    // Only agents can set isShowcase to true
    const showcaseValue = (user.role === 'agent' && isShowcase === true) ? true : false;

    const propertyData = {
      title,
      price: Number(price),
      location,
      bedrooms: Number(bedrooms),
      bathrooms: Number(bathrooms),
      area: Number(area),
      description,
      type,
      listingType,
      isShowcase: showcaseValue,
      images: uploadedImages,
      listedBy: user.id
    };

    const property = new Property(propertyData);
    await property.save();

    res.status(201).json({
      success: true,
      message: 'Listing created successfully',
      data: property
    });

  } catch (err) {
    console.error('Create property error:', err);
    res.status(500).json({
      success: false,
      errorCode: "SERVER_ERROR",
      message: "Server error"
    });
  }
};

/**
 * getAllProperties — GET /api/listings
 * -------------------------------------
 * Public endpoint — no auth required.
 * NEVER returns phone or email of the lister (privacy).
 * Supports query filters: ?type=fsbo|agent, ?minPrice, ?maxPrice, etc.
 */
const getAllProperties = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      type,        // listingType filter: "fsbo" or "agent"
      saleType,    // sale/rent filter
      location
    } = req.query;

    // Only show active listings publicly
    const filter = { status: 'active' };

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (bedrooms) filter.bedrooms = Number(bedrooms);
    if (bathrooms) filter.bathrooms = Number(bathrooms);

    // Filter by listingType (fsbo or agent)
    if (type) filter.listingType = type;

    // Filter by sale/rent
    if (saleType) filter.type = saleType;

    let query = Property.find(filter);

    if (location) {
      query = query.find({ $text: { $search: location } });
    }

    const total = await Property.countDocuments(filter);

    // Populate lister info but EXCLUDE phone and email (privacy)
    const properties = await query
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate('listedBy', 'username role isVerified profileImage location')
      .lean();

    res.json({
      success: true,
      message: "Listings retrieved successfully",
      data: {
        properties,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
          totalProperties: total,
          hasNext: Number(page) < Math.ceil(total / Number(limit)),
          hasPrev: Number(page) > 1
        }
      }
    });

  } catch (err) {
    console.error('Get properties error:', err);
    res.status(500).json({
      success: false,
      errorCode: 'SERVER_ERROR',
      message: "Server error"
    });
  }
};

/**
 * getPropertyById — GET /api/listings/:id
 * -----------------------------------------
 * Public endpoint — no auth required.
 * Returns listing details but NEVER includes phone or email (privacy).
 */
const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate("listedBy", "username role isVerified profileImage location")
      .populate({
        path: 'reviews',
        populate: {
          path: 'reviewer',
          select: 'username profileImage'
        }
      });

    if (!property || property.status !== 'active') {
      return res.status(404).json({
        success: false,
        errorCode: 'NOT_FOUND',
        message: 'Listing not found'
      });
    }

    res.json({
      success: true,
      message: "Listing retrieved successfully",
      data: property
    });

  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({
      success: false,
      errorCode: "SERVER_ERROR",
      message: "Server error"
    });
  }
};

/**
 * updateProperty — PUT /api/listings/:id
 * ----------------------------------------
 * Protected — requires JWT. Only the listing owner can update.
 * isShowcase can only be toggled by agents on their own listings.
 */
const updateProperty = async (req, res) => {
  try {
    const updates = req.body;

    const property = await Property.findOne({
      _id: req.params.id,
      listedBy: req.user.id
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        errorCode: 'NOT_FOUND',
        message: 'Listing not found or not yours'
      });
    }

    // Only agents can toggle isShowcase on their own listings
    if (updates.isShowcase !== undefined && req.user.role !== 'agent') {
      return res.status(403).json({
        success: false,
        errorCode: 'FORBIDDEN',
        message: 'Only agents can toggle showcase status.'
      });
    }

    const allowedUpdates = [
      'title', 'price', 'location', 'bedrooms', 'bathrooms', 'area',
      'images', 'description', 'type', 'isShowcase', 'status'
    ];

    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        property[field] = updates[field];
      }
    });

    await property.save();

    res.json({
      success: true,
      message: 'Listing updated successfully',
      data: property
    });

  } catch (error) {
    console.error('Update property error:', error);
    res.status(500).json({
      success: false,
      errorCode: 'SERVER_ERROR',
      message: "Server error"
    });
  }
};

/**
 * permanentDeleteProperty — DELETE /api/listings/:id
 * Protected — requires JWT. Only the listing owner can delete.
 */
const permanentDeleteProperty = async (req, res) => {
  try {
    const property = await Property.findOneAndDelete({
      _id: req.params.id,
      listedBy: req.user.id
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        errorCode: 'NOT_FOUND',
        message: 'Listing not found or not yours'
      });
    }

    res.json({
      success: true,
      message: 'Listing permanently deleted'
    });

  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({
      success: false,
      errorCode: 'SERVER_ERROR',
      message: "Server error"
    });
  }
};

/**
 * getMyPropertyById — GET /api/listings/my/:id
 * Protected — requires JWT. Returns the user's own listing by ID.
 */
const getMyPropertyById = async (req, res) => {
  try {
    const property = await Property.findOne({
      _id: req.params.id,
      listedBy: req.user.id
    }).populate("listedBy", "-password -refreshToken");

    if (!property || property.status !== 'active') {
      return res.status(404).json({
        success: false,
        errorCode: 'NOT_FOUND',
        message: 'Listing not found'
      });
    }

    res.json({
      success: true,
      message: "Listing retrieved successfully",
      data: property
    });

  } catch (error) {
    console.error('Get my property error:', error);
    res.status(500).json({
      success: false,
      errorCode: "SERVER_ERROR",
      message: "Server error"
    });
  }
};

/**
 * getMyProperties — GET /api/listings/my
 * Protected — requires JWT. Returns all listings by the current user.
 */
const getMyProperties = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const filter = {
      listedBy: req.user.id,
      status: 'active'
    };

    const total = await Property.countDocuments(filter);

    const properties = await Property.find(filter)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate('listedBy', 'username role isVerified profileImage')
      .lean();

    res.json({
      success: true,
      message: "Listings retrieved successfully",
      data: {
        properties,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
          totalProperties: total,
          hasNext: Number(page) < Math.ceil(total / Number(limit)),
          hasPrev: Number(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get my properties error:', error);
    res.status(500).json({
      success: false,
      errorCode: "SERVER_ERROR",
      message: "Server error"
    });
  }
};

/**
 * contactListing — POST /api/listings/:id/contact
 * --------------------------------------------------
 * THE ONLY WAY to get the lister's phone and email.
 * Requires a valid JWT token (user or agent).
 * Guests (no token) get 401: "Please log in to view contact information".
 *
 * Body: { name, email, phone, message? }
 * Response: { success: true, contact: { phone, email }, message: "Contact info retrieved" }
 */
const contactListing = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('listedBy', 'phone email');

    if (!property || property.status !== 'active') {
      return res.status(404).json({
        success: false,
        errorCode: 'NOT_FOUND',
        message: 'Listing not found'
      });
    }

    // Return the lister's phone and email
    res.json({
      success: true,
      contact: {
        phone: property.listedBy.phone,
        email: property.listedBy.email
      },
      message: 'Contact info retrieved'
    });

  } catch (error) {
    console.error('Contact listing error:', error);
    res.status(500).json({
      success: false,
      errorCode: 'SERVER_ERROR',
      message: 'Server error'
    });
  }
};

module.exports = {
  createProperty,
  getAllProperties,
  getPropertyById,
  updateProperty,
  permanentDeleteProperty,
  getMyPropertyById,
  getMyProperties,
  contactListing
};