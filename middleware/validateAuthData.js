function validateRegister(req, res, next) {
  const { email, username, password } = req.body;
  if (!email || !username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email, username and password are required',
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
