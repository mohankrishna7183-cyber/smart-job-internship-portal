import { ApiError } from "../utils/apiError.js";
import { config } from "../config/env.js";

export function notFound(_req, _res, next) {
  next(new ApiError(404, "The requested resource was not found."));
}

export function errorHandler(error, _req, res, _next) {
  if (error?.code === 11000) {
    const duplicatedField = Object.keys(error.keyPattern || {})[0];
    const message = duplicatedField === "email"
      ? "An account with this email already exists."
      : "This record already exists.";
    return res.status(409).json({ success: false, message });
  }
  if (error?.name === "ValidationError") {
    return res.status(400).json({ success: false, message: error.message });
  }
  if (error?.name === "CastError") {
    return res.status(400).json({ success: false, message: "Invalid resource identifier." });
  }

  const statusCode = error instanceof ApiError ? error.statusCode : 500;
  if (statusCode >= 500) console.error(error);
  return res.status(statusCode).json({
    success: false,
    message: statusCode >= 500 && config.nodeEnv === "production"
      ? "An unexpected server error occurred."
      : error.message
  });
}
