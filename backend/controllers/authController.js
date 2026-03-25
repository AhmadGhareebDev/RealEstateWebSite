const User = require('../models/User');
const { generateTokens } = require('../utils/generateTokens');
const isProd = process.env.NODE_ENV === 'production';
const jwt = require('jsonwebtoken');
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const { sendVerificationCode } = require('../services/email/sendVerificationCode');
const AgentVerification = require('../models/AgentVerification');

// Register new user
const registerUser = async (req, res) => {
  const { username, email, password, phone, location } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      errorCode: 'MISSING_FIELDS',
      message: 'Username, email, and password are required.'
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
    const profileImageUrl = req.file ? req.file.path : '';

    // Role is always "user" for this endpoint
    const user = new User({
      username,
      email: email.toLowerCase(),
      password,
      phone,
      location,
      profileImage: profileImageUrl,
      role: 'user',
      emailVerificationCode: verificationCode,
      emailVerificationExpires: Date.now() + 15 * 60 * 1000,
      isEmailVerified: false
    });

    await user.save();
    await sendVerificationCode(user.email, user.username, verificationCode);

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

// Register new agent
const registerAgent = async (req, res) => {
  const { username, email, password, phone, licenseNumber, licenseState, fullName, location, brokerage } = req.body;

  if (!username || !email || !password || !phone || !licenseNumber || !licenseState || !fullName || !location) {
    return res.status(400).json({
      success: false,
      errorCode: 'MISSING_FIELDS',
      message: 'All fields are required, including license details.'
    });
  }

  try {
    const exists = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }]
    });
    if (exists) {
      return res.status(409).json({
        success: false,
        errorCode: 'USER_EXISTS',
        message: 'Username or email is already taken.'
      });
    }

    // Check the license against the fake licenses collection
    const license = await AgentVerification.findOne({
      licenseNumber: licenseNumber.trim(),
      state: licenseState.trim().toUpperCase(),
      agentName: { $regex: new RegExp(`^${fullName.trim()}$`, 'i') },
      status: 'active'
    });

    // If no matching license → reject with a clear error message
    if (!license) {
      return res.status(400).json({
        success: false,
        errorCode: 'INVALID_LICENSE',
        message: 'License number not found. Only verified licensed agents can register.'
      });
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const profileImageUrl = req.file ? req.file.path : '';

    const agent = new User({
      username,
      email: email.toLowerCase(),
      password,
      phone,
      profileImage: profileImageUrl,
      role: 'agent',
      location,
      licenseNumber: licenseNumber.trim(),
      licenseState: licenseState.trim().toUpperCase(),
      brokerage: brokerage?.trim() || '',
      isVerified: true,
      emailVerificationCode: verificationCode,
      emailVerificationExpires: Date.now() + 15 * 60 * 1000
    });

    await agent.save();
    await sendVerificationCode(agent.email, agent.username, verificationCode);

    return res.status(201).json({
      success: true,
      message: 'Agent registered successfully! Check your email for verification code.',
      data: {
        userId: agent._id,
        username: agent.username,
        role: agent.role,
        isVerified: true
      }
    });

  } catch (err) {
    console.error('Agent register error:', err);
    return res.status(500).json({
      success: false,
      errorCode: 'SERVER_ERROR',
      message: 'Something went wrong. Please try again later.'
    });
  }
};

// Verify email code
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

// Resend verification code
const resendVerificationCode = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      errorCode: 'MISSING_EMAIL',
      message: 'Email is required.'
    });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        errorCode: 'USER_NOT_FOUND',
        message: 'User with this email does not exist.'
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        errorCode: 'ALREADY_VERIFIED',
        message: 'This email is already verified.'
      });
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.emailVerificationCode = verificationCode;
    user.emailVerificationExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    await sendVerificationCode(user.email, user.username, verificationCode);

    res.json({
      success: true,
      message: 'Verification code sent. Please check your email.'
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    return res.status(500).json({
      success: false,
      errorCode: 'SERVER_ERROR',
      message: 'Server error. Please try again later.'
    });
  }
};

// Login user
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
        errorCode: 'EMAIL_NOT_FOUND',
        message: 'Email does not exist.'
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
        errorCode: 'WRONG_PASSWORD',
        message: 'Incorrect password.'
      });
    }

    // Generate tokens — accessToken includes role for permission checks
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

// Refresh access token
const refreshToken = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      errorCode: 'NO_TOKEN',
      message: 'Unauthorized: No refresh token.'
    });
  }

  try {
    const user = await User.findOne({ refreshToken });
    if (!user) {
      return res.status(403).json({
        success: false,
        errorCode: 'INVALID_REFRESH',
        message: 'Forbidden: Invalid refresh token.'
      });
    }

    jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (error, decoded) => {
      if (error || decoded.id !== user._id.toString()) {
        return res.status(403).json({
          success: false,
          errorCode: 'INVALID_REFRESH',
          message: 'Forbidden: Invalid refresh token.'
        });
      }

      const { accessToken } = generateTokens(user);
      res.json({
        success: true,
        message: 'Token refreshed.',
        data: {
          accessToken,
          user: {
            id: user._id,
            email: user.email,
            role: user.role,
            username: user.username
          }
        }
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      errorCode: 'SERVER_ERROR'
    });
  }
};

// Logout user
const logoutUser = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (refreshToken) {
    const user = await User.findOne({ refreshToken });
    if (user) {
      user.refreshToken = undefined;
      await user.save();
    }
  }

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'None' : 'Lax',
    path: '/'
  });

  res.status(204).send();
};

module.exports = {
  registerUser,
  verifyEmailCode,
  loginUser,
  logoutUser,
  refreshToken,
  registerAgent,
  resendVerificationCode
};