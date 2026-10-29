import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { config } from "../config/env.js";
import { ApiError } from "../utils/apiError.js";

function createToken(user) {
  return jwt.sign({ sub: user.id }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
}

function userView(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    headline: user.headline,
    location: user.location,
    skills: user.skills,
    company: user.company
  };
}

export async function register(req, res) {
  const { name, email, password, role } = req.body;
  const user = await User.create({
    name,
    email,
    password,
    role: role === "recruiter" ? "recruiter" : "candidate"
  });
  res.status(201).json({
    success: true,
    data: { user: userView(user), token: createToken(user) }
  });
}

export async function login(req, res) {
  const user = await User.findOne({ email: req.body.email }).select("+password");
  if (!user || !(await user.comparePassword(req.body.password))) {
    throw new ApiError(401, "Email or password is incorrect.");
  }
  res.json({ success: true, data: { user: userView(user), token: createToken(user) } });
}

export function getCurrentUser(req, res) {
  res.json({ success: true, data: { user: userView(req.user) } });
}

export async function updateProfile(req, res) {
  const allowedFields = ["name", "headline", "location", "skills", "company"];
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) req.user[field] = req.body[field];
  }
  await req.user.save();
  res.json({ success: true, data: { user: userView(req.user) } });
}
