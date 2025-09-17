const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config');
const asyncHandler = require('../utils/asyncHandler');

// ✅ helper do generowania JWT
function generateToken(userId) {
  return jwt.sign({ userId }, config.jwtSecret, { expiresIn: '24h' });
}

exports.register = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  const user = new User({
    email: email.toLowerCase(),
    username: username.toLowerCase(),
    password,
  });

  try {
    await user.save();
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ success: false, message: 'Username or e-mail already exists' });
    }
    throw err; // złapie globalny error handler
  }

  const token = generateToken(user._id);

  return res.status(201).json({
    success: true,
    message: 'Account registered!',
    token,
    user: { _id: user._id, username: user.username, email: user.email },
  });
});

exports.checkEmail = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.params.email });
  if (user) {
    return res
      .status(409)
      .json({ success: false, message: 'E-mail is already taken' });
  }
  return res.json({ success: true, message: 'E-mail is available' });
});

exports.checkUsername = asyncHandler(async (req, res) => {
  const user = await User.findOne({ username: req.params.username });
  if (user) {
    return res
      .status(409)
      .json({ success: false, message: 'Username is already taken' });
  }
  return res.json({ success: true, message: 'Username is available' });
});

exports.login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username: username.toLowerCase() });
  if (!user) {
    return res
      .status(404)
      .json({ success: false, message: 'Username not found' });
  }

  const validPassword = await user.comparePassword(password);
  if (!validPassword) {
    return res
      .status(401)
      .json({ success: false, message: 'Password invalid' });
  }

  const token = generateToken(user._id);

  return res.json({
    success: true,
    message: 'Login successful!',
    token,
    user: { _id: user._id, username: user.username, email: user.email },
  });
});

exports.publicProfile = asyncHandler(async (req, res) => {
  const user = await User.findOne({ username: req.params.username }).select(
    'username email'
  );
  if (!user) {
    return res
      .status(404)
      .json({ success: false, message: 'Username not found.' });
  }
  return res.json({ success: true, user });
});

exports.profile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.userId).select('username email');
  if (!user) {
    return res
      .status(404)
      .json({ success: false, message: 'User not found' });
  }
  return res.json({ success: true, user });
});
