// Catches anything thrown or passed to next(err) and returns the same
// error envelope every other error path uses, instead of Express's
// default HTML stack trace page.
module.exports = function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    error: {
      code: err.code || "INTERNAL_ERROR",
      message: status === 500 ? "Something went wrong." : err.message,
    },
  });
};
