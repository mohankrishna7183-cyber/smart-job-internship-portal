import { useEffect, useState } from "react";
import { ArrowRight, BriefcaseBusiness, ChevronLeft, ChevronRight, MapPin, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { Link } from "react-router-dom";
import { api, getErrorMessage } from "../api.js";
import { JobCard } from "../components/JobCard.jsx";

const initialFilters = {
  search: "", location: "", company: "", skill: "", experience: "",
  type: "", salaryMin: "", salaryMax: "", sort: "newest"
};

export default function Marketplace() {
  const [filters, setFilters] = useState(initialFilters);
  const [query, setQuery] = useState(initialFilters);
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const activeFilterCount = ["company", "skill", "experience", "salaryMin", "salaryMax"]
    .filter((key) => filters[key]).length;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(1);
      setQuery(filters);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [filters]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    const params = Object.fromEntries(
      Object.entries({ ...query, page, limit: 6 }).filter(([, value]) => value !== "" && value != null)
    );
    api.get("/jobs", { params })
      .then(({ data }) => {
        if (!active) return;
        setJobs(data.data.items);
        setPagination(data.data.pagination);
      })
      .catch((requestError) => {
        if (active) setError(getErrorMessage(requestError, "We couldn't load jobs right now."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [query, page]);

  function updateFilter(event) {
    setFilters((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  return (
    <div className="marketplace">
      <section className="hero">
        <div className="hero-content">
          <div className="eyebrow"><span className="eyebrow-dot" /> YOUR NEXT CHAPTER STARTS HERE</div>
          <h1>Find work that<br />moves <span>you forward.</span></h1>
          <p>Discover opportunities that match your ambition. From your first internship to your next big move.</p>
          <div className="hero-actions">
            <a className="button button-dark" href="#opportunities">Explore opportunities <ArrowRight size={17} /></a>
            <span className="community-copy">Built for candidates, recruiters, and admins.</span>
          </div>
          <div className="hero-stats">
            <div><strong>{pagination.total.toLocaleString()}</strong><small>Matching opportunities</small></div>
            <div><strong>3</strong><small>role-based workspaces</small></div>
            <div><strong>Smart</strong><small>filters, sort & pagination</small></div>
          </div>
        </div>
        <div className="hero-art" aria-label="Career opportunity illustration">
          <div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" />
          <div className="art-sun" />
          <div className="art-card art-card-main">
            <span className="art-card-kicker"><Sparkles size={14} /> SAMPLE OPPORTUNITY</span>
            <div className="art-company-mark">N</div>
            <strong>Product Designer</strong>
            <span className="art-company-name">Northstar Studio · Remote</span>
            <div className="art-tags"><span>Design</span><span>Full-time</span><span>$92k–$120k</span></div>
            <div className="art-match"><div><span>Great match</span><b>94%</b></div><i><em /></i></div>
          </div>
          <div className="art-floating floating-top"><span className="float-icon">✦</span><span><b>Application tracking</b><small>Stay in the loop at every step</small></span></div>
          <div className="art-floating floating-bottom"><div className="mini-avatar">O</div><span><b>Made for every next move</b><small>Candidate · recruiter · admin</small></span></div>
          <div className="art-plant"><i /><i /><i /><span /></div>
        </div>
      </section>

      <section className="opportunity-section" id="opportunities">
        <div className="section-heading">
          <div><span className="section-kicker">THE RIGHT OPPORTUNITY IS OUT THERE</span><h2>Make your next move</h2></div>
          <Link className="text-link" to="/register">Create your free profile <ArrowRight size={16} /></Link>
        </div>
        <div className="search-panel">
          <label className="search-field"><Search size={19} /><input name="search" value={filters.search} onChange={updateFilter} placeholder="Job title, skill, or company" aria-label="Search jobs" /></label>
          <span className="search-divider" />
          <label className="search-field"><MapPin size={19} /><input name="location" value={filters.location} onChange={updateFilter} placeholder="City or remote" aria-label="Filter by location" /></label>
          <select name="type" value={filters.type} onChange={updateFilter} aria-label="Filter by job type">
            <option value="">All job types</option><option>Full-time</option><option>Part-time</option><option>Internship</option><option>Contract</option><option>Remote</option>
          </select>
          <button className={`button button-outline filter-toggle ${filtersOpen ? "filter-active" : ""}`} onClick={() => setFiltersOpen(!filtersOpen)} aria-expanded={filtersOpen}>
            {filtersOpen ? <X size={15} /> : <SlidersHorizontal size={15} />} Filters{activeFilterCount > 0 && <span className="filter-count">{activeFilterCount}</span>}
          </button>
          <button className="button button-primary search-submit" onClick={() => { setPage(1); setQuery(filters); }}>Search jobs <Search size={16} /></button>
        </div>
        {filtersOpen && <div className="advanced-filters">
          <label>Company<input name="company" value={filters.company} onChange={updateFilter} placeholder="Company name" /></label>
          <label>Skill<input name="skill" value={filters.skill} onChange={updateFilter} placeholder="e.g. React" /></label>
          <label>Experience<input name="experience" value={filters.experience} onChange={updateFilter} placeholder="e.g. Entry-level" /></label>
          <label>Min. salary<input name="salaryMin" type="number" min="0" value={filters.salaryMin} onChange={updateFilter} placeholder="Any" /></label>
          <label>Max. salary<input name="salaryMax" type="number" min="0" value={filters.salaryMax} onChange={updateFilter} placeholder="Any" /></label>
          <button className="clear-filter-button" onClick={() => { setFilters(initialFilters); setQuery(initialFilters); setPage(1); }}>Clear all filters</button>
        </div>}
        <div className="results-toolbar">
          <p><strong>{pagination.total.toLocaleString()}</strong> opportunities <span>curated for your next chapter</span></p>
          <label>Sort by <select value={filters.sort} name="sort" onChange={updateFilter}><option value="newest">Most recent</option><option value="oldest">Oldest</option><option value="salary_high">Highest salary</option><option value="salary_low">Lowest salary</option></select></label>
        </div>
        {error && <div className="notice notice-error">{error}</div>}
        {loading ? <div className="jobs-grid">{Array.from({ length: 6 }, (_, index) => <div className="skeleton job-skeleton" key={index} />)}</div>
          : error ? null
            : jobs.length > 0 ? <div className="jobs-grid">{jobs.map((job, index) => <JobCard key={job._id} job={job} index={index} />)}</div>
              : <div className="empty-state"><BriefcaseBusiness size={30} /><h3>No opportunities found</h3><p>Try a different title, location, or job type.</p><button className="button button-outline" onClick={() => { setFilters(initialFilters); setQuery(initialFilters); }}>Clear filters</button></div>}
        {pagination.pages > 1 && <div className="pagination">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} aria-label="Previous page"><ChevronLeft size={17} /> Previous</button>
          <span>Page <b>{page}</b> of {pagination.pages}</span>
          <button disabled={page >= pagination.pages} onClick={() => setPage(page + 1)}>Next <ChevronRight size={17} /></button>
        </div>}
      </section>
      <section className="closing-cta">
        <div><span className="section-kicker">READY WHEN YOU ARE</span><h2>Your next chapter<br />is one click away.</h2><p>Join a community building careers with intention.</p></div>
        <Link className="button button-light" to="/register">Get started for free <ArrowRight size={17} /></Link>
      </section>
    </div>
  );
}
