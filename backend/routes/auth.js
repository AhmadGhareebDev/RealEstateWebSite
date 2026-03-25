const express = require('express');
const router = express.Router();
const {
  registerUser,
  verifyEmailCode,
  loginUser,
  refreshToken,
  logoutUser,
  registerAgent,
  resendVerificationCode
} = require('../controllers/authController');

const { uploadProfile } = require('../middlewares/upload');
const validate = require('../middlewares/validate');
const {
  registerUserSchema,
  registerAgentSchema,
  loginUserSchema,
  verifyEmailSchema
} = require('../schemas/authSchemas');

// User signup
router.post('/signup',
  uploadProfile.single('profileImage'),
  validate(registerUserSchema),
  registerUser
);

// Agent signup
router.post('/signup/agent',
  uploadProfile.single('profileImage'),
  validate(registerAgentSchema),
  registerAgent
);

// Email verification
router.post('/verify-email', validate(verifyEmailSchema), verifyEmailCode);
router.post('/resend-verification', resendVerificationCode);

// Login
router.post('/login', validate(loginUserSchema), loginUser);

// Token management
router.post('/refresh', refreshToken);
router.post('/logout', logoutUser);

module.exports = router;