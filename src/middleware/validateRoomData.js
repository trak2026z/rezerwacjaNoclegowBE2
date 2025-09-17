function validateRoomData(req, res, next) {
  const { title, body } = req.body;
  const userId = req.user?.userId;

  if (!title || !body || !userId) {
    return res.status(400).json({
      success: false,
      message: 'Title, body and creator are required',
    });
  }

  next();
}

module.exports = validateRoomData;
