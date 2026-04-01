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

router.post('/signup',
  uploadProfile.single('profileImage'),
  validate(registerUserSchema),
  registerUser
);

router.post('/signup/agent',
  uploadProfile.single('profileImage'),
  validate(registerAgentSchema),
  registerAgent
);

router.post('/verify-email', validate(verifyEmailSchema), verifyEmailCode);
router.post('/resend-verification', resendVerificationCode);

router.post('/login', validate(loginUserSchema), loginUser);

router.post('/refresh', refreshToken);
router.post('/logout', logoutUser);

module.exports = router;