
const express = require('express')
const router = express.Router()
const roleCheck = require('../../middlewares/roleCheck')
const verifyJWT = require('../../middlewares/verifyJWT')
const { toggleFavorite , getMyFavorites } = require('../../controllers/favoriteController')

router.route('/toggle/:propertyId')
    .post(verifyJWT , roleCheck('user', 'agent') , toggleFavorite)

router.route('/my')
    .get(verifyJWT , roleCheck('user', 'agent') , getMyFavorites)

module.exports =  router