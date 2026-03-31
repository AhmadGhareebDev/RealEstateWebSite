const express = require('express');
const router = express.Router();
const {
  createProperty,
  getAllProperties,
  getPropertyById,
  updateProperty,
  permanentDeleteProperty,
  getMyPropertyById,
  getMyProperties,
  contactListing
} = require('../../controllers/propertyController');
const verifyJWT = require('../../middlewares/verifyJWT');
const { uploadProperty } = require('../../middlewares/upload');
const validate = require('../../middlewares/validate');
const {
  createPropertySchema,
  updatePropertySchema,
  contactListingSchema
} = require('../../schemas/propertySchemas');

router.post('/',
  verifyJWT,
  uploadProperty.array('images', 20),
  validate(createPropertySchema),
  createProperty
);

// Get all listings (public)
router.get('/', getAllProperties);

// Get current user's listings
router.get('/my', verifyJWT, getMyProperties);
router.get('/my/:id', verifyJWT, getMyPropertyById);

// Get single listing (public)
router.get('/:id', getPropertyById);

// Contact lister
router.post('/:id/contact',
  verifyJWT,
  validate(contactListingSchema),
  contactListing
);

// Update listing
router.put('/:id',
  verifyJWT,
  validate(updatePropertySchema),
  updateProperty
);

// Delete listing
router.delete('/:id', verifyJWT, permanentDeleteProperty);

module.exports = router;