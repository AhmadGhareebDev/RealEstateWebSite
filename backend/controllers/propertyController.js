const Property = require('../models/Property');

const createProperty = async (req, res) => {
  const { 
    title, price, location, bedrooms, bathrooms, 
    area, images, description, type 
  } = req.body;

  if (!title || !price || !location || !bedrooms || !bathrooms || !area || !images || !description || !type) {
    return res.status(400).json({
      success: false,
      errorCode: 'MISSING_FIELDS',
      message: 'All fields are required.'
    });
  }

  try {
    const seller = req.user.id;

    const property = await Property.create({
      title,
      price,
      location,
      bedrooms,
      bathrooms,
      area,
      images,
      description,
      type,
      seller
    });

    res.status(201).json({
      success: true,
      message: 'Property created.',
      data: { property }
    });

  } catch (error) {
    console.error('createProperty error:', error);
    res.status(500).json({
      success: false,
      errorCode: 'SERVER_ERROR'
    });
  }
};


// GET ALL - Public (buyers see active)
const getAllProperties = async (req, res) => {
  try {
    const properties = await Property.find({ isActive: true })
      .populate('seller', 'username phone profileImage')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { properties, count: properties.length }
    });
  } catch (error) {
    res.status(500).json({ success: false, errorCode: 'SERVER_ERROR' });
  }
};

// GET ONE - Public
const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('seller', 'username phone profileImage location');

    if (!property || !property.isActive) {
      return res.status(404).json({
        success: false,
        errorCode: 'NOT_FOUND',
        message: 'Property not found.'
      });
    }

    res.json({ success: true, data: { property } });
  } catch (error) {
    res.status(500).json({ success: false, errorCode: 'SERVER_ERROR' });
  }
};

// GET MY PROPERTIES - Seller only
const getMyProperties = async (req, res) => {
  try {
    const properties = await Property.find({ seller: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { properties, count: properties.length }
    });
  } catch (error) {
    res.status(500).json({ success: false, errorCode: 'SERVER_ERROR' });
  }
};


// UPDATE - agent only
const updateProperty = async (req, res) => {
  try {
    const property = await Property.findOne({
      _id: req.params.id,
      seller: req.user.id
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        errorCode: 'NOT_FOUND',
        message: 'Property not found or not yours.'
      });
    }

    Object.assign(property, req.body);
    await property.save();

    res.json({
      success: true,
      message: 'Property updated.',
      data: { property }
    });
  } catch (error) {
    res.status(500).json({ success: false, errorCode: 'SERVER_ERROR' });
  }
};

// DELETE (Soft) - seller only :)
const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findOne({
      _id: req.params.id,
      seller: req.user.id
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        errorCode: 'NOT_FOUND',
        message: 'Property not found or not yours.'
      });
    }

    property.isActive = false;
    await property.save();

    res.json({
      success: true,
      message: 'Property deleted (hidden).'
    });
  } catch (error) {
    res.status(500).json({ success: false, errorCode: 'SERVER_ERROR' });
  }
};

module.exports = { 
  createProperty,
  getAllProperties,
  getPropertyById,
  getMyProperties,
  updateProperty,
  deleteProperty
 };