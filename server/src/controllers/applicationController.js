import mongoose from "mongoose";
import { Application } from "../models/Application.js";
import { Job } from "../models/Job.js";
import { ApiError } from "../utils/apiError.js";
import { getPagination, paginatedResponse } from "../utils/pagination.js";

export async function applyForJob(req, res) {
  const job = await Job.findOne({ _id: req.body.jobId, status: "open" });
  if (!job) throw new ApiError(404, "This job is no longer accepting applications.");
  const application = await Application.create({
    job: job.id,
    candidate: req.user.id,
    coverLetter: req.body.coverLetter || "",
    resumeUrl: req.body.resumeUrl || ""
  });
  res.status(201).json({ success: true, data: { application } });
}

export async function listApplications(req, res) {
  const { page, limit, skip } = getPagination(req.query);
  let filter = {};
  if (req.user.role === "candidate") filter.candidate = req.user.id;
  if (req.user.role === "recruiter") {
    const jobs = await Job.find({ recruiter: req.user.id }).select("_id");
    filter.job = { $in: jobs.map((job) => job.id) };
  }
  if (req.user.role === "admin" && req.query.status) filter.status = req.query.status;
  if (req.user.role !== "admin" && req.query.status) filter.status = req.query.status;

  const [applications, total] = await Promise.all([
    Application.find(filter)
      .populate("job", "title company location type")
      .populate("candidate", "name email headline location skills")
      .sort({ createdAt: -1 }).skip(skip).limit(limit),
    Application.countDocuments(filter)
  ]);
  res.json({ success: true, data: paginatedResponse(applications, total, page, limit) });
}

export async function updateApplicationStatus(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(400, "Invalid application identifier.");
  const application = await Application.findById(req.params.id).populate("job", "recruiter");
  if (!application) throw new ApiError(404, "Application not found.");
  if (req.user.role !== "admin" && application.job.recruiter.toString() !== req.user.id) {
    throw new ApiError(403, "You can only manage applications for your job listings.");
  }
  application.status = req.body.status;
  await application.save();
  res.json({ success: true, data: { application } });
}
