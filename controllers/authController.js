const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config'); // ✅ zamiast '../config/database'

exports.register = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ success: false, message: 'Email, username and password are required' });
    }

    const user = new User({
      email: email.toLowerCase(),
      username: username.toLowerCase(),
      password
    });

    await user.save();

    const token = jwt.sign({ userId: user._id }, config.jwtSecret, { expiresIn: '24h' }); // ✅

    return res.status(201).json({
      success: true,
      message: 'Account registered!',
      token,
      user: { _id: user._id, username: user.username, email: user.email }
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Username or e-mail already exists' });
    }
    return res.status(500).json({ success: false, message: 'Could not save user', error: err.message });
  }
};

exports.checkEmail = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (user) {
      return res.status(409).json({ success: false, message: 'E-mail is already taken' });
    }
    return res.json({ success: true, message: 'E-mail is available' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.checkUsername = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (user) {
      return res.status(409).json({ success: false, message: 'Username is already taken' });
    }
    return res.json({ success: true, message: 'Username is available' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Username not found' });
    }

    const validPassword = await user.comparePassword(password);
    if (!validPassword) {
      return res.status(401).json({ success: false, message: 'Password invalid' });
    }

    const token = jwt.sign({ userId: user._id }, config.jwtSecret, { expiresIn: '24h' }); // ✅

    return res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: { _id: user._id, username: user.username, email: user.email }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.publicProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select('username email');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Username not found.' });
    }
    return res.json({ success: true, user });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.profile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('username email');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.json({ success: true, user });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

