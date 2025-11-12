const express = require('express')
const router = express.Router()
const { getUserInfo } = require('../../controllers/accountController')


router.route('/me')
    .get(getUserInfo)


module.exports = router