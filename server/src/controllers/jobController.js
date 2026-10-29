import mongoose from "mongoose";
import { Job } from "../models/Job.js";
import { ApiError } from "../utils/apiError.js";
import { getPagination, paginatedResponse } from "../utils/pagination.js";

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function listJobs(req, res) {
  const { page, limit, skip } = getPagination(req.query);
  const filter = { status: "open" };
  const text = req.query.search?.trim();
  if (text) {
    const term = new RegExp(escapeRegex(text), "i");
    filter.$or = [{ title: term }, { company: term }, { location: term }, { skills: term }];
  }
  if (req.query.type) filter.type = req.query.type;
  if (req.query.experience) {
    filter.experience = new RegExp(escapeRegex(req.query.experience.trim()), "i");
  }
  if (req.query.location) filter.location = new RegExp(escapeRegex(req.query.location.trim()), "i");
  if (req.query.company) filter.company = new RegExp(escapeRegex(req.query.company.trim()), "i");
  if (req.query.skill) filter.skills = new RegExp(escapeRegex(req.query.skill.trim()), "i");
  if (req.query.salaryMin !== undefined) {
    filter.$and = [...(filter.$and || []), { salaryMax: { $gte: Number(req.query.salaryMin) } }];
  }
  if (req.query.salaryMax !== undefined) {
    filter.$and = [...(filter.$and || []), { salaryMin: { $lte: Number(req.query.salaryMax) } }];
  }

  const sortOptions = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    salary_high: { salaryMax: -1, createdAt: -1 },
    salary_low: { salaryMin: 1, createdAt: -1 }
  };
  const sort = sortOptions[req.query.sort] || sortOptions.newest;
  const [jobs, total] = await Promise.all([
    Job.find(filter).populate("recruiter", "name company").sort(sort).skip(skip).limit(limit),
    Job.countDocuments(filter)
  ]);
  res.json({ success: true, data: paginatedResponse(jobs, total, page, limit) });
}

export async function getJob(req, res) {
  const job = await Job.findOne({ _id: req.params.id, status: "open" })
    .populate("recruiter", "name company");
  if (!job) throw new ApiError(404, "This job is no longer available.");
  res.json({ success: true, data: { job } });
}

export async function listMyJobs(req, res) {
  const { page, limit, skip } = getPagination(req.query);
  const filter = req.user.role === "admin" ? {} : { recruiter: req.user.id };
  const [jobs, total] = await Promise.all([
    Job.find(filter).populate("recruiter", "name company").sort({ createdAt: -1 }).skip(skip).limit(limit),
    Job.countDocuments(filter)
  ]);
  res.json({ success: true, data: paginatedResponse(jobs, total, page, limit) });
}

export async function createJob(req, res) {
  const job = await Job.create({ ...req.body, recruiter: req.user.id });
  res.status(201).json({ success: true, data: { job } });
}

async function findEditableJob(jobId, user) {
  if (!mongoose.isValidObjectId(jobId)) throw new ApiError(400, "Invalid job identifier.");
  const job = await Job.findById(jobId);
  if (!job) throw new ApiError(404, "Job not found.");
  if (user.role !== "admin" && job.recruiter.toString() !== user.id) {
    throw new ApiError(403, "You can only manage your own job listings.");
  }
  return job;
}

export async function updateJob(req, res) {
  const job = await findEditableJob(req.params.id, req.user);
  const allowedFields = [
    "title", "company", "location", "type", "experience", "salaryMin",
    "salaryMax", "description", "requirements", "skills", "deadline", "status"
  ];
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) job[field] = req.body[field];
  }
  await job.save();
  res.json({ success: true, data: { job } });
}

export async function deleteJob(req, res) {
  const job = await findEditableJob(req.params.id, req.user);
  job.status = "archived";
  await job.save();
  res.json({ success: true, data: { message: "Job listing archived; existing applications are preserved." } });
}
