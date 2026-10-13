const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_ACCESS_SECRET || 'meghaprayan_super_secret_access_token_key_2026',
    { expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET || 'meghaprayan_super_secret_refresh_token_key_2026',
    { expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d' }
  );
};

const setRefreshCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const user = await User.create({
      name,
      email,
      password
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshTokens.push({ token: refreshToken });
    await user.save();

    setRefreshCookie(res, refreshToken);

    res.status(201).json({
      success: true,
      token: accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        preferredMode: user.preferredMode,
        preferences: user.preferences
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshTokens.push({ token: refreshToken });
    await user.save();

    setRefreshCookie(res, refreshToken);

    res.status(200).json({
      success: true,
      token: accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        preferredMode: user.preferredMode,
        preferences: user.preferences
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh access token silently
// @route   POST /api/auth/refresh
exports.refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(401).json({ success: false, message: 'Refresh token not found' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'meghaprayan_super_secret_refresh_token_key_2026');
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    const tokenExists = user.refreshTokens.some(t => t.token === token);
    if (!tokenExists) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token session' });
    }

    const newAccessToken = generateAccessToken(user);
    res.status(200).json({
      success: true,
      token: newAccessToken
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
exports.logout = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      await User.updateOne(
        { 'refreshTokens.token': token },
        { $pull: { refreshTokens: { token } } }
      );
    }

    res.clearCookie('refreshToken');
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      // Return positive message for security obscurity
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, password reset instructions have been issued.'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
    console.log(`[MeghaPrayan Auth Dev] Password Reset Token: ${resetToken}`);
    console.log(`[MeghaPrayan Auth Dev] Reset URL: ${resetUrl}`);

    res.status(200).json({
      success: true,
      message: 'Reset instructions generated. In development, token has been printed to server console.',
      devResetUrl: process.env.NODE_ENV === 'development' ? resetUrl : undefined
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: 'Token and new password are required' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now()}
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Password reset token is invalid or has expired' });
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.refreshTokens = []; // Log out of all sessions
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful. You can now log in with your new password.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        preferredMode: user.preferredMode,
        preferences: user.preferences,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};
