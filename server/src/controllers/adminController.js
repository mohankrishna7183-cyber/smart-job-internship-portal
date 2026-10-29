import { Application } from "../models/Application.js";
import { Job } from "../models/Job.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/apiError.js";
import { getPagination, paginatedResponse } from "../utils/pagination.js";

export async function getOverview(_req, res) {
  const [users, candidates, recruiters, jobs, applications, statusCounts] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "candidate" }),
    User.countDocuments({ role: "recruiter" }),
    Job.countDocuments(),
    Application.countDocuments(),
    Application.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }])
  ]);
  res.json({
    success: true,
    data: {
      totals: { users, candidates, recruiters, jobs, applications },
      applicationsByStatus: Object.fromEntries(statusCounts.map(({ _id, count }) => [_id, count]))
    }
  });
}

export async function listUsers(req, res) {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.search?.trim()) {
    const search = req.query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const term = new RegExp(search, "i");
    filter.$or = [{ name: term }, { email: term }, { company: term }];
  }
  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter)
  ]);
  res.json({ success: true, data: paginatedResponse(users, total, page, limit) });
}

export async function updateUserRole(req, res) {
  if (!["candidate", "recruiter", "admin"].includes(req.body.role)) {
    throw new ApiError(400, "A valid user role is required.");
  }
  if (req.params.id === req.user.id && req.body.role !== "admin") {
    throw new ApiError(400, "You cannot remove your own administrator access.");
  }
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role: req.body.role },
    { new: true, runValidators: true }
  );
  if (!user) throw new ApiError(404, "User not found.");
  res.json({ success: true, data: { user } });
}
