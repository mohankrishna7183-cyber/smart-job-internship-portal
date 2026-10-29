import { useCallback, useEffect, useState } from "react";
import {
  Archive, ArrowUpRight, BriefcaseBusiness, CheckCircle2, ChevronDown, CircleDollarSign,
  FilePlus2, FileText, RotateCcw, Search, ShieldCheck, Users, X
} from "lucide-react";
import { Link } from "react-router-dom";
import { api, getErrorMessage } from "../api.js";
import { useAuth } from "../AuthContext.jsx";

const statusLabels = {
  submitted: "Submitted",
  reviewing: "In review",
  shortlisted: "Shortlisted",
  rejected: "Not selected",
  hired: "Hired"
};
const applicationStatuses = ["reviewing", "shortlisted", "rejected", "hired"];

function StatCard({ icon: _Icon, label, value, note, tone = "blue" }) {
  return <article className="stat-card"><span className={`stat-icon ${tone}`}><_Icon size={19} /></span><span className="stat-label">{label}</span><strong>{value}</strong><small>{note}</small></article>;
}

function CandidateDashboard({ user }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setError("");
      const { data } = await api.get("/applications", { params: { limit: 50 } });
      setApplications(data.data.items);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Your applications couldn't be loaded."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  const active = applications.filter((application) => !["rejected", "hired"].includes(application.status)).length;
  const shortlisted = applications.filter((application) => application.status === "shortlisted").length;

  return <>
    <DashboardHeading eyebrow="CANDIDATE SPACE" title={`Good to have you here, ${user.name.split(" ")[0]}.`} description="Here’s where your next chapter is taking shape." />
    <div className="stats-grid">
      <StatCard icon={FileText} label="Applications sent" value={applications.length} note="Your career is in motion" />
      <StatCard icon={BriefcaseBusiness} label="In progress" value={active} note="Awaiting the next step" tone="orange" />
      <StatCard icon={CheckCircle2} label="Shortlisted" value={shortlisted} note="You’re on their radar" tone="green" />
    </div>
    <section className="dashboard-panel">
      <div className="panel-heading"><div><h2>Your applications</h2><p>Keep an eye on every opportunity you’ve pursued.</p></div><Link className="text-link" to="/">Explore roles <ArrowUpRight size={16} /></Link></div>
      {error && <div className="notice notice-error">{error}</div>}
      {loading ? <div className="table-loading"><span className="spinner" /> Loading applications…</div>
        : applications.length ? <div className="application-list">{applications.map((application) => <ApplicationRow key={application._id} application={application} />)}</div>
          : <div className="empty-state compact"><FileText size={27} /><h3>Your next move starts here</h3><p>You haven’t applied to a role yet. Find one that feels right.</p><Link className="button button-primary" to="/">Browse opportunities</Link></div>}
    </section>
  </>;
}

function ApplicationRow({ application, recruiterView = false, onStatusChange }) {
  const candidate = application.candidate;
  const job = application.job;
  return <div className="application-row">
    <div className="company-logo row-logo">{(recruiterView ? candidate?.name : job?.company)?.slice(0, 1).toUpperCase() || "O"}</div>
    <div className="application-main">
      <strong>{recruiterView ? candidate?.name : job?.title}</strong>
      <span>{recruiterView ? `${job?.title || "Role"} · ${candidate?.email || ""}` : `${job?.company || "Company"} · ${job?.location || ""}`}</span>
    </div>
    <span className={`status-pill status-${application.status}`}>{statusLabels[application.status] || application.status}</span>
    <time>{new Date(application.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</time>
    {recruiterView && <label className="status-select-label"><span className="sr-only">Update application status</span><select value={application.status} onChange={(event) => onStatusChange(application._id, event.target.value)}><option value="submitted" disabled>Submitted</option>{applicationStatuses.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}</select><ChevronDown size={14} /></label>}
  </div>;
}

const emptyJob = {
  title: "", company: "", location: "", type: "Full-time", experience: "Any level",
  salaryMin: "", salaryMax: "", description: "", skills: "", requirements: ""
};

function RecruiterDashboard({ user }) {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [form, setForm] = useState(emptyJob);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    try {
      setError("");
      const [jobResponse, applicationResponse] = await Promise.all([
        api.get("/jobs/mine", { params: { limit: 50 } }),
        api.get("/applications", { params: { limit: 50 } })
      ]);
      setJobs(jobResponse.data.data.items);
      setApplications(applicationResponse.data.data.items);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Recruitment data couldn't be loaded."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  async function createJob(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    const payload = {
      ...form,
      salaryMin: form.salaryMin ? Number(form.salaryMin) : null,
      salaryMax: form.salaryMax ? Number(form.salaryMax) : null,
      skills: form.skills.split(",").map((item) => item.trim()).filter(Boolean),
      requirements: form.requirements.split("\n").map((item) => item.trim()).filter(Boolean)
    };
    try {
      await api.post("/jobs", payload);
      setForm(emptyJob);
      setShowForm(false);
      setNotice("Your opportunity is live. Great people are going to find it.");
      await load();
    } catch (requestError) {
      setError(getErrorMessage(requestError, "The listing couldn't be published."));
    } finally {
      setBusy(false);
    }
  }
  async function updateStatus(applicationId, status) {
    try {
      await api.patch(`/applications/${applicationId}/status`, { status });
      setNotice("Application status updated.");
      await load();
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Status couldn't be updated."));
    }
  }
  async function setJobStatus(job, status) {
    try {
      await api.patch(`/jobs/${job._id}`, { status });
      setNotice(status === "open" ? "Opportunity reopened." : "Opportunity closed.");
      await load();
    } catch (requestError) {
      setError(getErrorMessage(requestError, "The listing status couldn't be updated."));
    }
  }
  async function archiveJob(job) {
    if (!window.confirm(`Archive "${job.title}"? Existing applications will be preserved.`)) return;
    try {
      await api.delete(`/jobs/${job._id}`);
      setNotice("Opportunity archived. Existing applications are preserved.");
      await load();
    } catch (requestError) {
      setError(getErrorMessage(requestError, "The listing couldn't be archived."));
    }
  }

  return <>
    <DashboardHeading eyebrow="RECRUITER SPACE" title={`Build your next great team, ${user.name.split(" ")[0]}.`} description="Your hiring pipeline, applicants, and open roles — all in one place." action={<button className="button button-primary" onClick={() => setShowForm(!showForm)}>{showForm ? <X size={17} /> : <FilePlus2 size={17} />}{showForm ? "Close form" : "Post a role"}</button>} />
    {(error || notice) && <div className={`notice ${error ? "notice-error" : "notice-success"}`}>{error || notice}</div>}
    {showForm && <section className="dashboard-panel job-form-panel"><div className="panel-heading"><div><h2>Share a new opportunity</h2><p>Give great candidates a reason to take a closer look.</p></div></div>
      <form className="job-form" onSubmit={createJob}>
        <label className="form-label">Role title<input className="form-control" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required minLength={3} /></label>
        <label className="form-label">Company<input className="form-control" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} required /></label>
        <label className="form-label">Location<input className="form-control" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Remote, New York…" required /></label>
        <label className="form-label">Job type<select className="form-control" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option>Full-time</option><option>Part-time</option><option>Internship</option><option>Contract</option><option>Remote</option></select></label>
        <label className="form-label">Experience level<input className="form-control" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} /></label>
        <label className="form-label">Minimum salary<input className="form-control" type="number" min="0" value={form.salaryMin} onChange={(e) => setForm({ ...form, salaryMin: e.target.value })} /></label>
        <label className="form-label">Maximum salary<input className="form-control" type="number" min="0" value={form.salaryMax} onChange={(e) => setForm({ ...form, salaryMax: e.target.value })} /></label>
        <label className="form-label form-wide">Description<textarea className="form-control textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required minLength={20} maxLength={10000} /></label>
        <label className="form-label">Skills <span className="optional">(comma separated)</span><input className="form-control" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="React, Product design…" /></label>
        <label className="form-label">Requirements <span className="optional">(one per line)</span><textarea className="form-control textarea" value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} /></label>
        <div className="form-wide"><button className="button button-primary" disabled={busy}>{busy ? "Publishing…" : "Publish opportunity"} <ArrowUpRight size={16} /></button></div>
      </form>
    </section>}
    <div className="stats-grid">
      <StatCard icon={BriefcaseBusiness} label="Open roles" value={jobs.filter((job) => job.status === "open").length} note="Currently welcoming applicants" />
      <StatCard icon={Users} label="Total applicants" value={applications.length} note="Across all your opportunities" tone="orange" />
      <StatCard icon={CheckCircle2} label="Shortlisted" value={applications.filter((application) => application.status === "shortlisted").length} note="Potential next teammates" tone="green" />
    </div>
    <section className="dashboard-panel">
      <div className="panel-heading"><div><h2>Applicant pipeline</h2><p>Get to know the people behind each application.</p></div><span className="panel-count">{applications.length} total</span></div>
      {loading ? <div className="table-loading"><span className="spinner" /> Loading applications…</div>
        : applications.length ? <div className="application-list">{applications.map((application) => <ApplicationRow key={application._id} application={application} recruiterView onStatusChange={updateStatus} />)}</div>
          : <div className="empty-state compact"><Users size={27} /><h3>Your next teammate is out there</h3><p>Publish a role to start meeting great candidates.</p><button className="button button-outline" onClick={() => setShowForm(true)}>Post your first role</button></div>}
    </section>
    <section className="dashboard-panel">
      <div className="panel-heading"><div><h2>Your opportunities</h2><p>The roles you’re sharing with the world.</p></div><span className="panel-count">{jobs.length} roles</span></div>
      <div className="compact-job-list">{jobs.map((job) => <div className="compact-job-row" key={job._id}><span className="company-logo row-logo">{job.company.slice(0, 1)}</span><div><strong>{job.title}</strong><span>{job.company} · {job.location}</span></div><span className={`status-pill ${job.status === "open" ? "status-hired" : "status-rejected"}`}>{job.status}</span>{job.status !== "archived" && <button className="icon-button listing-action" onClick={() => setJobStatus(job, job.status === "open" ? "closed" : "open")} aria-label={job.status === "open" ? "Close listing" : "Reopen listing"} title={job.status === "open" ? "Close listing" : "Reopen listing"}>{job.status === "open" ? <Archive size={16} /> : <RotateCcw size={16} />}</button>}{job.status !== "archived" && <button className="icon-button listing-action archive-action" onClick={() => archiveJob(job)} aria-label="Archive listing" title="Archive listing"><X size={16} /></button>}{job.status === "open" && <Link to={`/jobs/${job._id}`} aria-label={`View ${job.title}`}><ArrowUpRight size={17} /></Link>}</div>)}
      {!jobs.length && !loading && <div className="empty-inline">No roles yet. Your first listing is just around the corner.</div>}
      </div>
    </section>
  </>;
}

function AdminDashboard({ user }) {
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    try {
      setError("");
      const [statsResponse, usersResponse] = await Promise.all([
        api.get("/admin/overview"),
        api.get("/admin/users", { params: { limit: 50, search, role } })
      ]);
      setOverview(statsResponse.data.data);
      setUsers(usersResponse.data.data.items);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Admin data couldn't be loaded."));
    } finally {
      setLoading(false);
    }
  }, [search, role]);

  useEffect(() => {
    const timer = window.setTimeout(load, 250);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function changeRole(userId, nextRole) {
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: nextRole });
      setNotice("Account role updated.");
      await load();
    } catch (requestError) {
      setError(getErrorMessage(requestError, "The account role couldn't be updated."));
    }
  }

  const totals = overview?.totals;
  return <>
    <DashboardHeading eyebrow="ADMIN CONSOLE" title={`A clear view of the bigger picture, ${user.name.split(" ")[0]}.`} description="People, opportunities, and hiring activity — in one place." />
    {(error || notice) && <div className={`notice ${error ? "notice-error" : "notice-success"}`}>{error || notice}</div>}
    <div className="stats-grid">
      <StatCard icon={Users} label="Total members" value={totals?.users ?? "—"} note={`${totals?.candidates ?? 0} candidates`} />
      <StatCard icon={BriefcaseBusiness} label="Recruiters" value={totals?.recruiters ?? "—"} note="Building their teams" tone="orange" />
      <StatCard icon={CircleDollarSign} label="Job listings" value={totals?.jobs ?? "—"} note={`${totals?.applications ?? 0} applications`} tone="green" />
    </div>
    <section className="dashboard-panel">
      <div className="panel-heading"><div><h2>Application activity</h2><p>A live snapshot of hiring progress across the platform.</p></div><span className="admin-chart-icon"><ShieldCheck size={18} /></span></div>
      <div className="activity-stats">{Object.entries(overview?.applicationsByStatus || {}).length ? Object.entries(overview.applicationsByStatus).map(([status, count]) => <div key={status}><span className={`activity-dot dot-${status}`} /><div><strong>{count}</strong><span>{statusLabels[status] || status}</span></div></div>) : <div className="empty-inline">Application activity will appear here as candidates apply.</div>}</div>
    </section>
    <section className="dashboard-panel">
      <div className="panel-heading"><div><h2>People & access</h2><p>Review member accounts and manage platform roles.</p></div><span className="panel-count">{users.length} members</span></div>
      <div className="user-toolbar"><label className="user-search"><Search size={16} /><input placeholder="Search name or email" value={search} onChange={(event) => setSearch(event.target.value)} /></label><select className="form-control role-filter" value={role} onChange={(event) => setRole(event.target.value)}><option value="">All roles</option><option value="candidate">Candidates</option><option value="recruiter">Recruiters</option><option value="admin">Admins</option></select></div>
      {loading ? <div className="table-loading"><span className="spinner" /> Loading members…</div> : <div className="users-list">{users.map((member) => <div className="user-row" key={member._id}><span className="avatar">{member.name.slice(0, 1).toUpperCase()}</span><div className="user-info"><strong>{member.name}</strong><span>{member.email}</span></div><span className={`role-tag role-${member.role}`}>{member.role}</span><select aria-label={`Role for ${member.name}`} value={member.role} disabled={member._id === user.id} onChange={(event) => changeRole(member._id, event.target.value)}><option value="candidate">Candidate</option><option value="recruiter">Recruiter</option><option value="admin">Admin</option></select></div>)}
      {!users.length && <div className="empty-inline">No members match those filters.</div>}</div>}
    </section>
  </>;
}

function DashboardHeading({ eyebrow, title, description, action }) {
  return <div className="dashboard-heading"><div><span className="section-kicker">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{action}</div>;
}

export default function Dashboard() {
  const { user } = useAuth();
  return <div className="dashboard-page">
    {user.role === "candidate" && <CandidateDashboard user={user} />}
    {user.role === "recruiter" && <RecruiterDashboard user={user} />}
    {user.role === "admin" && <AdminDashboard user={user} />}
  </div>;
}
