
const express = require('express')
const router = express.Router()
const verifyJWT = require('../../middlewares/verifyJWT')
const { getMyProfile , deleteMyAccount , updateMyProfile  } = require('../../controllers/accountController')
const { updateProfileSchema } = require('../../schemas/profileSchemas')
const validate = require('../../middlewares/validate')
router.route('/me')
    .get(verifyJWT , getMyProfile)
    .delete(verifyJWT , deleteMyAccount)
    .put(verifyJWT, validate(updateProfileSchema) , updateMyProfile)

module.exports = router