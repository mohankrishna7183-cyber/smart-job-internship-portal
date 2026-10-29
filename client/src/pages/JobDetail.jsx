import { useEffect, useState } from "react";
import { ArrowLeft, ArrowUpRight, BriefcaseBusiness, CalendarDays, CheckCircle2, Clock3, MapPin, Send } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { api, getErrorMessage } from "../api.js";
import { useAuth } from "../AuthContext.jsx";

function JobDetailContent() {
  const { id } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    api.get(`/jobs/${id}`)
      .then(({ data }) => setJob(data.data.job))
      .catch((requestError) => setError(getErrorMessage(requestError, "This opportunity may have closed.")))
      .finally(() => setLoading(false));
  }, [id]);

  async function apply(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      await api.post("/applications", { jobId: id, coverLetter, resumeUrl });
      setSuccess("Application submitted. You can track its progress from your dashboard.");
      setCoverLetter("");
      setResumeUrl("");
    } catch (requestError) {
      setError(getErrorMessage(requestError, "We couldn't submit your application."));
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div className="page-loading"><span className="spinner" /> Loading opportunity</div>;
  if (!job) return <div className="detail-page"><div className="notice notice-error">{error || "Opportunity not found."}</div><Link to="/" className="button button-outline"><ArrowLeft size={16} /> Back to jobs</Link></div>;

  return (
    <div className="detail-page">
      <Link to="/" className="back-link"><ArrowLeft size={16} /> Back to opportunities</Link>
      <div className="detail-layout">
        <section>
          <div className="detail-header">
            <div className="company-logo company-logo-large">{job.company?.slice(0, 1).toUpperCase()}</div>
            <div><span className="job-type">{job.type}</span><h1>{job.title}</h1><p>{job.company} <span className="muted-dot">·</span> {job.location}</p></div>
          </div>
          <div className="detail-facts"><span><MapPin size={16} />{job.location}</span><span><BriefcaseBusiness size={16} />{job.experience}</span><span><CalendarDays size={16} />{job.deadline ? new Date(job.deadline).toLocaleDateString() : "Open until filled"}</span></div>
          <div className="detail-section"><h2>About the role</h2><p className="detail-copy">{job.description}</p></div>
          {job.requirements?.length > 0 && <div className="detail-section"><h2>What you’ll bring</h2><ul className="requirements-list">{job.requirements.map((requirement) => <li key={requirement}><CheckCircle2 size={17} />{requirement}</li>)}</ul></div>}
          {job.skills?.length > 0 && <div className="detail-section"><h2>Skills & expertise</h2><div className="skill-list">{job.skills.map((skill) => <span className="skill-chip" key={skill}>{skill}</span>)}</div></div>}
        </section>
        <aside className="apply-card">
          <span className="section-kicker">MAKE YOUR MOVE</span><h2>Interested?</h2>
          <div className="apply-salary">{job.salaryMin || job.salaryMax ? `$${Number(job.salaryMin || 0).toLocaleString()} – $${Number(job.salaryMax || job.salaryMin).toLocaleString()}` : "Compensation"}<small> annual salary</small></div>
          {success && <div className="notice notice-success">{success}</div>}
          {error && <div className="notice notice-error">{error}</div>}
          {user?.role === "candidate" ? <form onSubmit={apply} className="form-stack">
            <label className="form-label">Why are you a great fit?<textarea className="form-control textarea" value={coverLetter} onChange={(event) => setCoverLetter(event.target.value)} placeholder="Introduce yourself and share what excites you about this role…" maxLength={5000} /></label>
            <label className="form-label">Resume link <span className="optional">(optional)</span><input className="form-control" type="url" value={resumeUrl} onChange={(event) => setResumeUrl(event.target.value)} placeholder="https://…" /></label>
            <button className="button button-primary auth-submit" disabled={busy}>{busy ? "Submitting…" : "Apply for this role"} <Send size={16} /></button>
          </form> : user ? <div className="notice">Recruiter and admin accounts can’t apply for jobs.</div>
            : <Link className="button button-primary auth-submit" to="/login" state={{ from: { pathname: `/jobs/${id}` } }}>Sign in to apply <ArrowUpRight size={16} /></Link>}
          <div className="apply-note"><Clock3 size={15} /> Usually takes less than 2 minutes</div>
        </aside>
      </div>
    </div>
  );
}

export default function JobDetail() {
  return <JobDetailContent />;
}
