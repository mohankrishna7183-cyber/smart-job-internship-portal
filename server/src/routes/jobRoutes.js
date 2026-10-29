import { Router } from "express";
import { body, query } from "express-validator";
import {
  createJob,
  deleteJob,
  getJob,
  listJobs,
  listMyJobs,
  updateJob
} from "../controllers/jobController.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
const jobValidation = [
  body("title").trim().isLength({ min: 3, max: 120 }).withMessage("Job title must be 3–120 characters."),
  body("company").trim().isLength({ min: 2, max: 120 }).withMessage("Company is required."),
  body("location").trim().isLength({ min: 2, max: 120 }).withMessage("Location is required."),
  body("type").isIn(["Full-time", "Part-time", "Internship", "Contract", "Remote"]).withMessage("Choose a valid job type."),
  body("description").trim().isLength({ min: 20, max: 10000 }).withMessage("Description must be at least 20 characters."),
  body("salaryMin").optional({ nullable: true }).isFloat({ min: 0 }).withMessage("Minimum salary must be positive."),
  body("salaryMax").optional({ nullable: true }).isFloat({ min: 0 }).withMessage("Maximum salary must be positive."),
  body("skills").optional().isArray({ max: 30 }),
  body("requirements").optional().isArray({ max: 30 })
];
const jobUpdateValidation = [
  body("title").optional().trim().isLength({ min: 3, max: 120 }),
  body("company").optional().trim().isLength({ min: 2, max: 120 }),
  body("location").optional().trim().isLength({ min: 2, max: 120 }),
  body("type").optional().isIn(["Full-time", "Part-time", "Internship", "Contract", "Remote"]),
  body("experience").optional().trim().isLength({ max: 100 }),
  body("description").optional().trim().isLength({ min: 20, max: 10000 }),
  body("salaryMin").optional({ nullable: true }).isFloat({ min: 0 }),
  body("salaryMax").optional({ nullable: true }).isFloat({ min: 0 }),
  body("skills").optional().isArray({ max: 30 }),
  body("requirements").optional().isArray({ max: 30 }),
  body("status").optional().isIn(["open", "closed", "archived"]),
  body("deadline").optional({ nullable: true }).isISO8601()
];
const jobQueryValidation = [
  query("search").optional().isString().isLength({ max: 120 }),
  query("location").optional().isString().isLength({ max: 120 }),
  query("company").optional().isString().isLength({ max: 120 }),
  query("skill").optional().isString().isLength({ max: 50 }),
  query("experience").optional().isString().isLength({ max: 100 }),
  query("type").optional().isIn(["Full-time", "Part-time", "Internship", "Contract", "Remote"]),
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 50 }),
  query("salaryMin").optional({ values: "falsy" }).isFloat({ min: 0 }),
  query("salaryMax").optional({ values: "falsy" }).isFloat({ min: 0 }),
  query("sort").optional().isIn(["newest", "oldest", "salary_high", "salary_low"])
];

router.get("/", jobQueryValidation, validate, asyncHandler(listJobs));
router.get("/mine", authenticate, authorize("recruiter", "admin"), asyncHandler(listMyJobs));
router.get("/:id", asyncHandler(getJob));
router.post("/", authenticate, authorize("recruiter", "admin"), jobValidation, validate, asyncHandler(createJob));
router.patch("/:id", authenticate, authorize("recruiter", "admin"), jobUpdateValidation, validate, asyncHandler(updateJob));
router.delete("/:id", authenticate, authorize("recruiter", "admin"), asyncHandler(deleteJob));

export default router;
