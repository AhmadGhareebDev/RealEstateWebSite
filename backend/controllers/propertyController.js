const ViewEvent = require('../models/ViewEvent');
const Property = require('../models/Property');
const Favorite = require('../models/Favorite')
const hashAnonKey = require('../utils/hashAnonKey');

const createProperty = async (req, res) => {
  const {
    title, price, location, bedrooms, bathrooms, area,
    description, type, listingType, isShowcase
  } = req.body;

  const user = req.user;
  const uploadedImages = req.files ? req.files.map(file => file.path) : [];

  try {

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

const getAllProperties = async (req, res) => {
  try {
    const viewerId = req.user?.id ? String(req.user.id) : null;
    const {
      page = 1,
      limit = 20,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      type,
      saleType,
      location,
      sortBy = 'newest'
    } = req.query;

    const filter = { status: 'active' };

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (bedrooms) filter.bedrooms = { $gte: Number(bedrooms) };
    if (bathrooms) filter.bathrooms = { $gte: Number(bathrooms) };

    if (type) filter.listingType = type;

    if (saleType) filter.type = saleType;

    const countFilter = { ...filter };

    if (location) {
      countFilter.$text = { $search: location };
    }

    const normalizedSortBy = String(sortBy || 'newest').toLowerCase();
    const total = await Property.countDocuments(countFilter);

    let properties;

    if (normalizedSortBy === 'rating') {
      const pipeline = [
        { $match: countFilter },
        {
          $lookup: {
            from: 'reviews',
            localField: '_id',
            foreignField: 'property',
            as: 'reviews'
          }
        },
        {
          $addFields: {
            averageRating: {
              $ifNull: [{ $avg: '$reviews.rating' }, 0]
            },
            reviewCount: { $size: '$reviews' }
          }
        },
        {
          $sort: {
            averageRating: -1,
            reviewCount: -1,
            createdAt: -1
          }
        },
        { $skip: (Number(page) - 1) * Number(limit) },
        { $limit: Number(limit) },
        {
          $lookup: {
            from: 'users',
            localField: 'listedBy',
            foreignField: '_id',
            as: 'listedByDoc'
          }
        },
        {
          $unwind: {
            path: '$listedByDoc',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $addFields: {
            listedBy: {
              _id: '$listedByDoc._id',
              username: '$listedByDoc.username',
              role: '$listedByDoc.role',
              isVerified: '$listedByDoc.isVerified',
              profileImage: '$listedByDoc.profileImage',
              location: '$listedByDoc.location',
              brokerage: '$listedByDoc.brokerage'
            }
          }
        },
        {
          $project: {
            listedByDoc: 0,
            reviews: 0
          }
        }
      ];

      properties = await Property.aggregate(pipeline);
    } else {
      const query = Property.find(countFilter);
      const sort = normalizedSortBy === 'views'
        ? {
            viewsTotal: -1,
            viewsUnique30d: -1,
            lastViewedAt: -1,
            createdAt: -1
          }
        : { createdAt: -1 };

      properties = await query
        .sort(sort)
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .populate('listedBy', 'username role isVerified profileImage location brokerage')
        .populate('reviews', 'rating');
    }



      let favoritedIds =  new Set();

      if (req.user) {
        const favorites = await Favorite.find({user: req.user.id}).select('property');
        favoritedIds = new Set(favorites.map(fav => fav.property.toString()));
      }

      const enriched = properties.map((p) => {
        const base = typeof p.toObject === 'function' ? p.toObject() : p;
        const propertyId = String(base._id);
        const listedById = base?.listedBy?._id ? String(base.listedBy._id) : null;

        return {
          ...base,
          isFav: favoritedIds.has(propertyId),
          isOwner: !!viewerId && !!listedById && listedById === viewerId
        };
      });

    res.json({
      success: true,
      message: "Listings retrieved successfully",
      data: {
        properties: enriched,
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
const trackPropertyView = async (req, property) => {                     
  const targetId = property._id;                                            
  const viewerUserId = req.user?.id ? String(req.user.id) : null;          

  if (viewerUserId && String(property.listedBy?._id || property.listedBy) === viewerUserId) {
    return { changed: false };                                                                  
  }

  const now = new Date();                                                    

  const totalWindowMs = 60 * 60 * 1000;                                     
  const unique30dWindowMs = 30 * 24 * 60 * 60 * 1000;                       

  const totalWindowStart = new Date(now.getTime() - totalWindowMs);       
  const uniqueWindowStart = new Date(now.getTime() - unique30dWindowMs);   

  const anonKeyHash = viewerUserId ? null : hashAnonKey(req);            

  const identityFilter = viewerUserId                                     
    ? { viewerUserId }
    : { anonKeyHash };

  const recentView = await ViewEvent.findOne({                               
    targetType: 'property',
    targetId,
    ...identityFilter,
    viewedAt: { $gte: totalWindowStart }
  }).select('_id');

  const recentUnique30d = await ViewEvent.findOne({                          
    targetType: 'property',
    targetId,
    ...identityFilter,
    viewedAt: { $gte: uniqueWindowStart }
  }).select('_id');

  if (recentView) {
    return { changed: false };
  }

  await ViewEvent.create({                                                
    targetType: 'property',
    targetId,
    viewerUserId: viewerUserId || null,
    anonKeyHash: anonKeyHash || null,
    source: 'web',
    viewedAt: now
  });

  const inc = { viewsTotal: 1 };                                           
  if (!recentUnique30d) {
    inc.viewsUnique30d = 1;                                               
  }

  const updatedCounters = await Property.findByIdAndUpdate(targetId, {                            
    $inc: inc,
    $set: { lastViewedAt: now }
  }, { new: true })
    .select('viewsTotal viewsUnique30d lastViewedAt')
    .lean();

  return {
    changed: true,
    counters: updatedCounters
  };
};
const getPropertyById = async (req, res) => {
  try {
    const viewerId = req.user?.id ? String(req.user.id) : null;
    const property = await Property.findById(req.params.id)
      .populate("listedBy", "username role isVerified profileImage location");

    if (!property || !['active', 'sold'].includes(property.status)) {
      return res.status(404).json({
        success: false,
        errorCode: 'NOT_FOUND',
        message: 'Listing not found'
      });
    }

    const isFav = req.user ? !!(await Favorite.findOne({ user: req.user.id, property: property._id })) : false;

    const trackResult = await trackPropertyView(req, property);
    const counters = trackResult?.changed
      ? trackResult.counters
      : {
          viewsTotal: property.viewsTotal || 0,
          viewsUnique30d: property.viewsUnique30d || 0,
          lastViewedAt: property.lastViewedAt || null
        };

    res.json({
      success: true,
      message: "Listing retrieved successfully",
      data: {
        ...property.toObject(),
        isFav,
        isOwner: !!viewerId && !!property.listedBy?._id && String(property.listedBy._id) === viewerId,
        viewsTotal: counters.viewsTotal || 0,
        viewsUnique30d: counters.viewsUnique30d || 0,
        lastViewedAt: counters.lastViewedAt || null
      }
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

    if (updates.isShowcase === true && req.user.role !== 'agent') {
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

const getMyPropertyById = async (req, res) => {
  try {
    const property = await Property.findOne({
      _id: req.params.id,
      listedBy: req.user.id
    }).populate("listedBy", "-password -refreshToken");

    if (!property || !['active', 'sold', 'pending'].includes(property.status)) {
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

const getMyProperties = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const filter = {
      listedBy: req.user.id,
      status: { $in: ['active', 'sold', 'pending'] }
    };

    const total = await Property.countDocuments(filter);

    const properties = await Property.find(filter)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate('listedBy', 'username role isVerified profileImage')
      .populate('reviews', 'rating');

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