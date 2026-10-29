import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    company: { type: String, required: true, trim: true, maxlength: 120 },
    location: { type: String, required: true, trim: true, maxlength: 120 },
    type: {
      type: String,
      enum: ["Full-time", "Part-time", "Internship", "Contract", "Remote"],
      required: true
    },
    experience: { type: String, trim: true, default: "Any level" },
    salaryMin: { type: Number, min: 0, default: null },
    salaryMax: { type: Number, min: 0, default: null },
    description: { type: String, required: true, trim: true, maxlength: 10000 },
    requirements: [{ type: String, trim: true, maxlength: 200 }],
    skills: [{ type: String, trim: true, maxlength: 50 }],
    deadline: { type: Date, default: null },
    status: { type: String, enum: ["open", "closed", "archived"], default: "open", index: true },
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    }
  },
  { timestamps: true }
);

jobSchema.pre("validate", function validateSalaryRange() {
  if (this.salaryMin != null && this.salaryMax != null && this.salaryMin > this.salaryMax) {
    this.invalidate("salaryMax", "Maximum salary must be greater than or equal to minimum salary.");
  }
});
jobSchema.index({ title: "text", company: "text", description: "text", skills: "text" });
jobSchema.index({ status: 1, type: 1, location: 1, createdAt: -1 });

export const Job = mongoose.model("Job", jobSchema);
