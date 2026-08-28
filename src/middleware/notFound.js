module.exports = function notFoundMiddleware(req, res) {
  res.status(404).json({
    error: {
      code: "ROUTE_NOT_FOUND",
      message: `No route matches ${req.method} ${req.originalUrl}. See /v1 for available resources.`,
    },
  });
};
