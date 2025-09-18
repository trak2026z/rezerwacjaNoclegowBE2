/**
 * Authentication Middleware
 * Validates JWT tokens from request headers and attaches user data to the request
 */
const { UnauthorizedError } = require("../utils/errors");
const tokenService = require("../services/tokenService");

/**
 * Constants for authentication
 */
const AUTH_CONSTANTS = {
  SCHEME: 'Bearer',
  ERROR_MESSAGES: {
    MISSING_HEADER: 'Authorization header missing',
    INVALID_FORMAT: 'Invalid authorization format',
    INVALID_TOKEN: 'Invalid or expired token'
  }
};

/**
 * Authentication middleware
 * Verifies JWT token from Authorization header and attaches user data to request
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
function authMiddleware(req, res, next) {
  try {
    // Get authorization header
    const authHeader = req.headers["authorization"];
    
    // Check if header exists
    if (!authHeader) {
      return next(new UnauthorizedError(AUTH_CONSTANTS.ERROR_MESSAGES.MISSING_HEADER));
    }

    // Validate header format (Bearer <token>)
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== AUTH_CONSTANTS.SCHEME) {
      return next(new UnauthorizedError(AUTH_CONSTANTS.ERROR_MESSAGES.INVALID_FORMAT));
    }

    // Extract token
    const token = parts[1];

    // Verify token
    try {
      const decoded = tokenService.verifyToken(token);
      
      // Attach user data to request
      req.user = decoded; // Contains { userId, iat, exp }
      
      return next();
    } catch (tokenError) {
      // Handle token verification errors
      return next(new UnauthorizedError(AUTH_CONSTANTS.ERROR_MESSAGES.INVALID_TOKEN));
    }
  } catch (error) {
    // Pass any errors to the error handler
    return next(error);
  }
}

module.exports = authMiddleware;
