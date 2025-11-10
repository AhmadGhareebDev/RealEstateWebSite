const express = require('express')
const router = express.Router()
const { registerUser , verifyEmailCode , loginUser } = require('../controllers/authController')



router.route('/register')
    .post(registerUser);
router.route('/verify-email')
    .post(verifyEmailCode);
router.route('/login')
    .post(loginUser)
    


module.exports = router