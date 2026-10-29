import { Router } from "express";
import { body } from "express-validator";
import { getOverview, listUsers, updateUserRole } from "../controllers/adminController.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(authenticate, authorize("admin"));
router.get("/overview", asyncHandler(getOverview));
router.get("/users", asyncHandler(listUsers));
router.patch(
  "/users/:id/role",
  body("role").isIn(["candidate", "recruiter", "admin"]).withMessage("Choose a valid user role."),
  validate,
  asyncHandler(updateUserRole)
);

export default router;
