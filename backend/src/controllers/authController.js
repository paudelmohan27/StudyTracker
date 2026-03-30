const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

/** Generate a signed JWT token */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * POST /api/auth/register
 * Register a new user account
 */
const register = async (req, res, next) => {
  try {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Create user (password hashed by pre-save hook in model)
    const user = await User.create({ name, email, password });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        darkMode: user.darkMode,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 * Login with email and password, receive JWT
 */
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user and explicitly select password (it has select:false in schema)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Compare provided password to stored hash
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        darkMode: user.darkMode,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me
 * Get current authenticated user profile
 */
const getMe = async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      darkMode: req.user.darkMode,
    },
  });
};

/**
 * PUT /api/auth/preferences
 * Update user preferences (dark mode, name)
 */
const updatePreferences = async (req, res, next) => {
  try {
    const { darkMode, name } = req.body;
    const updateFields = {};
    if (typeof darkMode === 'boolean') updateFields.darkMode = darkMode;
    if (name) updateFields.name = name;

    const user = await User.findByIdAndUpdate(req.user._id, updateFields, { new: true });
    res.json({ success: true, user: { id: user._id, name: user.name, email: user.email, darkMode: user.darkMode } });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, updatePreferences };
