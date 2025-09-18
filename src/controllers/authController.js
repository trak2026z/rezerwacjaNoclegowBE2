/**
 * Authentication Controller
 * Handles user authentication, registration, and profile management
 */
const asyncHandler = require("../utils/asyncHandler");
const authService = require("../services/authService");
const { NotFoundError } = require("../utils/errors");

/**
 * Response formatter utility
 * Creates standardized response objects
 */
const responseFormatter = {
  /**
   * Format a success response
   * @param {Object} data - Response data
   * @param {string} message - Success message
   * @param {number} statusCode - HTTP status code (default: 200)
   * @returns {Object} Formatted response object
   */
  success: (data = null, message = "Success", statusCode = 200) => ({
    success: true,
    message,
    data,
    statusCode
  }),

  /**
   * Format an error response
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code (default: 400)
   * @returns {Object} Formatted error response object
   */
  error: (message = "Error occurred", statusCode = 400) => ({
    success: false,
    message,
    statusCode
  })
};

/**
 * Authentication controller methods
 */
const authController = {
  /**
   * Register a new user
   * @route POST /auth/register
   */
  register: asyncHandler(async (req, res) => {
    const { user, token } = await authService.registerUser(req.body);
    
    const response = responseFormatter.success(
      { user, token }, 
      "Account registered!", 
      201
    );
    
    return res.status(response.statusCode).json(response);
  }),

  /**
   * Login an existing user
   * @route POST /auth/login
   */
  login: asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    const { user, token } = await authService.loginUser(username, password);
    
    const response = responseFormatter.success(
      { user, token }, 
      "Login successful!"
    );
    
    return res.status(response.statusCode).json(response);
  }),

  /**
   * Check if an email is already taken
   * @route GET /auth/check-email/:email
   */
  checkEmail: asyncHandler(async (req, res) => {
    const { email } = req.params;
    const taken = await authService.isEmailTaken(email);
    
    if (taken) {
      const response = responseFormatter.error("Email is already taken", 409);
      return res.status(response.statusCode).json(response);
    }
    
    const response = responseFormatter.success(null, "Email is available");
    return res.status(response.statusCode).json(response);
  }),

  /**
   * Check if a username is already taken
   * @route GET /auth/check-username/:username
   */
  checkUsername: asyncHandler(async (req, res) => {
    const { username } = req.params;
    const taken = await authService.isUsernameTaken(username);
    
    if (taken) {
      const response = responseFormatter.error("Username is already taken", 409);
      return res.status(response.statusCode).json(response);
    }
    
    const response = responseFormatter.success(null, "Username is available");
    return res.status(response.statusCode).json(response);
  }),

  /**
   * Get public profile for a user by username
   * @route GET /auth/profile/public/:username
   */
  publicProfile: asyncHandler(async (req, res) => {
    const { username } = req.params;
    const user = await authService.getPublicProfile(username);
    
    if (!user) {
      throw new NotFoundError("User not found");
    }
    
    const response = responseFormatter.success({ user });
    return res.status(response.statusCode).json(response);
  }),

  /**
   * Get current user's profile
   * @route GET /auth/profile
   */
  profile: asyncHandler(async (req, res) => {
    const { userId } = req.user;
    const user = await authService.getProfileById(userId);
    
    if (!user) {
      throw new NotFoundError("User not found");
    }
    
    const response = responseFormatter.success({ user });
    return res.status(response.statusCode).json(response);
  })
};

module.exports = authController;
