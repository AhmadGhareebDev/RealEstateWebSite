const express = require('express')
const router = express.Router()
const { createProperty , getAllProperties, getMyProperties , getPropertyById , deleteProperty } = require('../../controllers/propertyController')
const  roleCheck  = require('../../middlewares/roleCheck')


router.route('/create-property')
    .post(roleCheck(['agent']), createProperty);

router.route('/')
    .get(getAllProperties)

router.route('/my')
    .get(roleCheck(['agent']),getMyProperties)
router.route('/:id')
    .get(getPropertyById)
    .delete(roleCheck(['agent']) ,deleteProperty)


module.exports = router