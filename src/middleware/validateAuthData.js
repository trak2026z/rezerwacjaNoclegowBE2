const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateRegister(req, res, next) {
  const { email, username, password } = req.body;

  // Email validation
  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required',
    });
  }
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email format',
    });
  }

  // Username validation
  if (!username) {
    return res.status(400).json({
      success: false,
      message: 'Username is required',
    });
  }
  if (username.length < 3) {
    return res.status(400).json({
      success: false,
      message: 'Username must be at least 3 characters long',
    });
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return res.status(400).json({
      success: false,
      message: 'Username can only contain letters, numbers, and underscores',
    });
  }

  // Password validation
  if (!password) {
    return res.status(400).json({
      success: false,
      message: 'Password is required',
    });
  }
  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 8 characters long',
    });
  }
  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
    return res.status(400).json({
      success: false,
      message:
        'Password must include at least one uppercase letter, one lowercase letter, and one number',
    });
  }

  next();
}

function validateLogin(req, res, next) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username and password are required',
    });
  }

  next();
}

module.exports = { validateRegister, validateLogin };
