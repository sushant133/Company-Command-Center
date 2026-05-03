export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  })
}

export const errorHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode || 500

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(err.details ? { details: err.details } : {}),
    ...(process.env.NODE_ENV !== 'production' && err.stack ? { stack: err.stack } : {}),
  })
}
