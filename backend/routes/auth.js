const express = require('express')
const router = express.Router()
const { 
    registerUser , 
    verifyEmailCode , 
    loginUser , 
    refreshToken , 
    logoutUser } = require('../controllers/authController')



router.route('/register')
    .post(registerUser);
router.route('/verify-email')
    .post(verifyEmailCode);
router.route('/login')
    .post(loginUser)

router.route('/refresh')
    .post(refreshToken)
router.route('/logout')
    .post(logoutUser)
    


module.exports = router