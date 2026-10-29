import { ArrowUpRight, MapPin, Clock3 } from "lucide-react";
import { Link } from "react-router-dom";

const companyColors = ["#d9e8ff", "#fce5d4", "#e7e1ff", "#d9f2e7", "#fde4ed"];

export function JobCard({ job, index = 0 }) {
  const initials = job.company?.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  return (
    <article className="job-card">
      <div className="job-card-top">
        <span className="company-logo" style={{ backgroundColor: companyColors[index % companyColors.length] }}>{initials}</span>
        <span className="job-type job-type-open">Open role</span>
      </div>
      <div className="job-title-wrap">
        <span className="job-type">{job.type}</span>
        <h3><Link to={`/jobs/${job._id}`}>{job.title}</Link></h3>
        <p className="company-name">{job.company}</p>
      </div>
      <div className="job-meta">
        <span><MapPin size={14} />{job.location}</span>
        <span><Clock3 size={14} />{job.experience || "Any level"}</span>
      </div>
      <div className="job-card-bottom">
        <div className="salary">
          {job.salaryMin || job.salaryMax
            ? `$${Number(job.salaryMin || 0).toLocaleString()} – $${Number(job.salaryMax || job.salaryMin).toLocaleString()}`
            : "Salary not listed"}
          <small>/ year</small>
        </div>
        <Link className="arrow-link" to={`/jobs/${job._id}`} aria-label={`View ${job.title}`}><ArrowUpRight size={18} /></Link>
      </div>
    </article>
  );
}
