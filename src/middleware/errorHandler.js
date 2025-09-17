function errorHandler(err, req, res, next) {
  console.error('❌ Error:', err);

  // Jeśli odpowiedź już została wysłana, przekaż dalej
  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
}

module.exports = errorHandler;
