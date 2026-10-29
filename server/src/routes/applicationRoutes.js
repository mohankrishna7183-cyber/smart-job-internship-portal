import { Router } from "express";
import { body, query } from "express-validator";
import {
  applyForJob,
  listApplications,
  updateApplicationStatus
} from "../controllers/applicationController.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(authenticate);
router.post(
  "/",
  authorize("candidate"),
  [
    body("jobId").isMongoId().withMessage("A valid job is required."),
    body("coverLetter").optional().trim().isLength({ max: 5000 }),
    body("resumeUrl").optional().isURL({ require_protocol: true }).withMessage("Enter a valid resume URL.")
  ],
  validate,
  asyncHandler(applyForJob)
);
router.get(
  "/",
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 50 }),
    query("status").optional().isIn(["submitted", "reviewing", "shortlisted", "rejected", "hired"])
  ],
  validate,
  asyncHandler(listApplications)
);
router.patch(
  "/:id/status",
  authorize("recruiter", "admin"),
  [
    body("status").isIn(["reviewing", "shortlisted", "rejected", "hired"])
      .withMessage("Choose a valid application status.")
  ],
  validate,
  asyncHandler(updateApplicationStatus)
);

export default router;
