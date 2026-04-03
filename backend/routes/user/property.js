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
const softAuth = require('../../middlewares/softAuth')
const { uploadProperty } = require('../../middlewares/upload');
const validate = require('../../middlewares/validate');
const {
  createPropertySchema,
  updatePropertySchema
} = require('../../schemas/propertySchemas');

router.post('/',
  verifyJWT,
  uploadProperty.array('images', 20),
  validate(createPropertySchema),
  createProperty
);

router.get('/', softAuth, getAllProperties);

router.get('/my', verifyJWT, getMyProperties);
router.get('/my/:id', verifyJWT, getMyPropertyById);

router.get('/:id', softAuth, getPropertyById);

router.post('/:id/contact',
  verifyJWT,
  contactListing
);

router.put('/:id',
  verifyJWT,
  validate(updatePropertySchema),
  updateProperty
);

router.delete('/:id', verifyJWT, permanentDeleteProperty);

module.exports = router;