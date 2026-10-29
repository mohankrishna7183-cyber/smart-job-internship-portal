import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { config } from "../config/env.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const authenticate = asyncHandler(async (req, _res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith("Bearer ")) {
    throw new ApiError(401, "Authentication required.");
  }

  let payload;
  try {
    payload = jwt.verify(authorization.slice(7), config.jwtSecret);
  } catch {
    throw new ApiError(401, "Your session is invalid or has expired. Please sign in again.");
  }

  const user = await User.findById(payload.sub);
  if (!user) throw new ApiError(401, "Account no longer exists.");
  req.user = user;
  next();
});

export function authorize(...roles) {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, "You do not have permission to perform this action."));
    }
    return next();
  };
}
