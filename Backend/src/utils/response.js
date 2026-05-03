/**
 * Standardized API Response Utilities
 * Consistent format for success and paginated responses
 */
export const sendSuccess = (res, options = {}) => {
  const {
    statusCode = 200,
    message = null,
    data = null,
    meta = null,
  } = options;

  const response = {
    status: 'success',
    ...(message && { message }),
    ...(data !== undefined && { data }),
    ...(meta && { meta }),
  };

  res.status(statusCode).json(response);
};

/**
 * Send paginated response
 */
export const sendPaginated = (res, data, meta) => {
  sendSuccess(res, {
    data,
    meta,
  });
};

export default {
  sendSuccess,
  sendPaginated,
};

