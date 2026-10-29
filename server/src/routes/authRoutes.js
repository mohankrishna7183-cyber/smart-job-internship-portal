import { Router } from "express";
import { body } from "express-validator";
import { getCurrentUser, login, register, updateProfile } from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.post(
  "/register",
  [
    body("name").trim().isLength({ min: 2, max: 100 }).withMessage("Name must be 2–100 characters."),
    body("email").isEmail().normalizeEmail().withMessage("Enter a valid email address."),
    body("password").isLength({ min: 8, max: 128 }).withMessage("Password must be at least 8 characters."),
    body("role").optional().isIn(["candidate", "recruiter"]).withMessage("Choose candidate or recruiter.")
  ],
  validate,
  asyncHandler(register)
);
router.post(
  "/login",
  [
    body("email").isEmail().normalizeEmail().withMessage("Enter a valid email address."),
    body("password").notEmpty().withMessage("Password is required.")
  ],
  validate,
  asyncHandler(login)
);
router.get("/me", authenticate, asyncHandler(getCurrentUser));
router.patch(
  "/profile",
  authenticate,
  [
    body("name").optional().trim().isLength({ min: 2, max: 100 }).withMessage("Name must be 2–100 characters."),
    body("headline").optional().trim().isLength({ max: 120 }),
    body("location").optional().trim().isLength({ max: 120 }),
    body("skills").optional().isArray({ max: 30 }),
    body("skills.*").optional().isString().trim().isLength({ min: 1, max: 50 }),
    body("company").optional().trim().isLength({ max: 120 })
  ],
  validate,
  asyncHandler(updateProfile)
);

export default router;
