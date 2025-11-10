const User = require('../models/User')
const validRoles = require('../configs/validRoles')
const { generateTokens } = require('../utils/generateTokens')
const isProd = process.env.NODE_ENV === 'production';


const registerUser = async (req, res) => {

  const { username, email, password, phone, location, profileImage, role } = req.body;

  if (!username || !email || !password || !role) {
    return res.status(400).json({
      success: false,
      errorCode: 'MISSING_FIELDS',
      message: 'Username, email, password, and role are required.'
    });
  }

  if (!validRoles.includes(role)) {
    return res.status(400).json({
      success: false,
      errorCode: 'INVALID_ROLE',
      message: 'Role must be buyer, seller, or admin.'
    });
  }

  try {
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }]
    });

    if (existingUser) {
      const field = existingUser.email === email.toLowerCase() ? 'email' : 'username';
      return res.status(409).json({
        success: false,
        errorCode: field === 'email' ? 'EMAIL_EXISTS' : 'USERNAME_EXISTS',
        message: "User already exists under this email or username."
      });
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const user = new User({
      username,
      email: email.toLowerCase(),
      password,
      phone,
      location,
      profileImage,
      role,
      emailVerificationCode: verificationCode,
      emailVerificationExpires: Date.now() + 15 * 60 * 1000,
      isEmailVerified: false
    });

    await user.save();

    //DEV
    console.log(`Verification CODE for ${email}: ${verificationCode}`);

    res.status(201).json({
      success: true,
      message: 'Check your Email for verification code.',
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      errorCode: 'SERVER_ERROR'
    });
  }
};


const verifyEmailCode = async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({
      success: false,
      errorCode: 'MISSING_FIELDS',
      message: 'Email and code are required.'
    });
  }

  try {
    const user = await User.findOne({
      email: email.toLowerCase(),
      emailVerificationCode: code,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        errorCode: 'INVALID_OR_EXPIRED_CODE',
        message: 'Invalid or expired code.'
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationCode = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Email verified successfully.',
    });

  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({
      success: false,
      errorCode: 'SERVER_ERROR',
      message: "Server Error please try again later."
    });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      errorCode: 'MISSING_FIELDS',
      message: 'Email and password required.'
    });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        errorCode: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password.'
      });
    }

    if (!user.isEmailVerified) {
      return res.status(401).json({
        success: false,
        errorCode: 'EMAIL_NOT_VERIFIED',
        message: 'Please verify your email first.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        errorCode: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password.'
      });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'None' : 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/'
    });

    res.json({
      success: true,
      message: 'Login successful.',
      data: {
        accessToken,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      errorCode: 'SERVER_ERROR'
    });
  }
};

module.exports = {
    registerUser,
    verifyEmailCode,
    loginUser
}