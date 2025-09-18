/**
 * Room Controller
 * Handles room creation, management, reactions, and reservations
 */
const asyncHandler = require("../utils/asyncHandler");
const roomService = require("../services/roomService");
const { ForbiddenError, NotFoundError, BadRequestError } = require("../utils/errors");

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
  success: (data = null, message = null, statusCode = 200) => ({
    success: true,
    ...(message && { message }),
    ...(data && { data }),
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
 * Room controller methods
 */
const roomController = {
  /**
   * Create a new room
   * @route POST /rooms
   */
  createRoom: asyncHandler(async (req, res) => {
    const { userId } = req.user;
    const roomData = req.body;
    
    const room = await roomService.createRoom(roomData, userId);
    
    const response = responseFormatter.success(
      { room }, 
      "Room created!", 
      201
    );
    
    return res.status(response.statusCode).json(response);
  }),

  /**
   * Get all available rooms
   * @route GET /rooms
   */
  getAllRooms: asyncHandler(async (req, res) => {
    const rooms = await roomService.getAllRooms();
    
    if (!rooms || rooms.length === 0) {
      const response = responseFormatter.error("No rooms found.", 404);
      return res.status(response.statusCode).json(response);
    }
    
    const response = responseFormatter.success({ rooms });
    return res.status(response.statusCode).json(response);
  }),

  /**
   * Get a room by its ID
   * @route GET /rooms/:id
   */
  getRoomById: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const room = await roomService.getRoomById(id);
    
    if (!room) {
      throw new NotFoundError("Room not found");
    }
    
    const response = responseFormatter.success({ room });
    return res.status(response.statusCode).json(response);
  }),

  /**
   * Update a room's details
   * @route PUT /rooms/:id
   */
  updateRoom: asyncHandler(async (req, res) => {
    const { room } = req;
    const updateData = req.body;
    
    const updated = await roomService.updateRoom(room, updateData);
    
    const response = responseFormatter.success(
      { room: updated }, 
      "Room updated!"
    );
    
    return res.status(response.statusCode).json(response);
  }),

  /**
   * Delete a room
   * @route DELETE /rooms/:id
   */
  deleteRoom: asyncHandler(async (req, res) => {
    const { room } = req;
    
    await roomService.deleteRoom(room);
    
    const response = responseFormatter.success(null, "Room deleted!");
    return res.status(response.statusCode).json(response);
  }),

  /**
   * Handle room reactions (like/dislike)
   * @param {string} reactionType - Type of reaction ("like" or "dislike")
   * @returns {Function} Route handler for the specific reaction
   */
  handleReaction: (reactionType) => asyncHandler(async (req, res) => {
    const { userId } = req.user;
    const roomId = req.params.id;
    
    // Use room from middleware if available, otherwise fetch it
    const room = req.room || await roomService.getRoomById(roomId);
    
    if (!room) {
      throw new NotFoundError("Room not found");
    }
    
    const updatedRoom = await roomService.handleReaction(
      room,
      userId,
      reactionType
    );
    
    const message = reactionType === "like" ? "Room liked!" : "Room disliked!";
    const response = responseFormatter.success({ room: updatedRoom }, message);
    
    return res.status(response.statusCode).json(response);
  }),

  /**
   * Reserve a room
   * @route POST /rooms/:id/reserve
   */
  reserveRoom: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { userId } = req.user;
    
    const room = await roomService.getRoomById(id);
    
    if (!room) {
      throw new NotFoundError("Room not found");
    }
    
    // Prevent users from reserving their own rooms
    if (String(room.createdBy) === userId) {
      throw new ForbiddenError("You cannot reserve your own room");
    }
    
    // Check if room is already reserved
    if (room.reserved) {
      throw new BadRequestError("Room already reserved.");
    }
    
    const updatedRoom = await roomService.reserveRoom(room, userId);
    
    const response = responseFormatter.success(
      { room: updatedRoom }, 
      "Room reserved!"
    );
    
    return res.status(response.statusCode).json(response);
  })
};

// Create specific reaction handlers using the generic handler
roomController.likeRoom = roomController.handleReaction("like");
roomController.dislikeRoom = roomController.handleReaction("dislike");

module.exports = roomController;
