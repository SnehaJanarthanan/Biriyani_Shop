function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  if (process.env.NODE_ENV !== 'production' && status >= 500) {
    console.error(err);
  }
  res.status(status).json({ message });
}

module.exports = { errorHandler };
