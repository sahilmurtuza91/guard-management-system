const ApiError = require("../utils/ApiError");

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server Error";
  let errors = err.errors || null;

  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for field: ${err.path}`;
  }

  if (err.name === "ValidationError") {
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((e) => e.message);
  }

  if (err.code === 11000) { 
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0];
    message = `${field} already exists, try another.`
  }

  if (process.env.NODE_ENV !== 'production' && !(err instanceof ApiError)) {
    console.error("Unexpected Error: ", err);
  }
  res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

module.exports = errorHandler;