import { useEffect, useMemo, useState } from "react";
import PageHero from "../components/PageHero";

const STORAGE_KEY = "resumeForgeJobTracker";

const statuses = ["Wishlist", "Applied", "Interview", "Offer", "Rejected"];

const emptyJob = {
  company: "",
  role: "",
  status: "Wishlist",
  link: "",
  appliedDate: "",
  nextFollowUp: "",
  notes: "",
};

function JobTrackerPage() {
  const [jobs, setJobs] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [form, setForm] = useState(emptyJob);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    const latestTarget = localStorage.getItem("latestJobTarget");
    if (latestTarget && !form.company && !form.role) {
      const parsed = JSON.parse(latestTarget);
      setForm((current) => ({
        ...current,
        company: parsed.company || "",
        role: parsed.role || "",
        notes: parsed.notes || "",
      }));
    }
  }, [form.company, form.role]);

  const visibleJobs = useMemo(() => {
    if (filter === "All") {
      return jobs;
    }
    return jobs.filter((job) => job.status === filter);
  }, [filter, jobs]);

  const totals = useMemo(
    () =>
      statuses.reduce((accumulator, status) => {
        accumulator[status] = jobs.filter((job) => job.status === status).length;
        return accumulator;
      }, {}),
    [jobs]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.company.trim() || !form.role.trim()) {
      return;
    }

    setJobs((current) => [
      {
        id: crypto.randomUUID(),
        ...form,
        createdAt: new Date().toISOString(),
      },
      ...current,
    ]);
    setForm(emptyJob);
  };

  const updateStatus = (jobId, status) => {
    setJobs((current) =>
      current.map((job) => (job.id === jobId ? { ...job, status } : job))
    );
  };

  const removeJob = (jobId) => {
    setJobs((current) => current.filter((job) => job.id !== jobId));
  };

  return (
    <div className="stack page-stack">
      <PageHero
        eyebrow="Job Tracker"
        title="Track every application, follow-up, and interview stage in one place."
        description="The tracker helps you stay organized after you tailor a resume for different companies. Keep the role, status, links, notes, and next follow-up date together so nothing slips through."
        stats={[
          { value: jobs.length, label: "Total applications" },
          { value: totals.Interview || 0, label: "Interviews" },
          { value: totals.Offer || 0, label: "Offers" },
        ]}
      />

      <section className="workspace-grid">
        <form className="surface-card workspace-panel" onSubmit={handleSubmit}>
          <div className="section-heading">
            <div>
              <p className="eyebrow">Add Opportunity</p>
              <h2>Create a new tracked job</h2>
            </div>
          </div>
          <div className="form-grid">
            <label className="field">
              <span>Company</span>
              <input name="company" value={form.company} onChange={handleChange} />
            </label>
            <label className="field">
              <span>Role</span>
              <input name="role" value={form.role} onChange={handleChange} />
            </label>
          </div>
          <div className="form-grid">
            <label className="field">
              <span>Status</span>
              <select name="status" value={form.status} onChange={handleChange} className="field-select">
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Job Link</span>
              <input name="link" value={form.link} onChange={handleChange} />
            </label>
          </div>
          <div className="form-grid">
            <label className="field">
              <span>Applied Date</span>
              <input type="date" name="appliedDate" value={form.appliedDate} onChange={handleChange} />
            </label>
            <label className="field">
              <span>Next Follow-up</span>
              <input type="date" name="nextFollowUp" value={form.nextFollowUp} onChange={handleChange} />
            </label>
          </div>
          <label className="field">
            <span>Notes</span>
            <textarea
              name="notes"
              rows="4"
              value={form.notes}
              onChange={handleChange}
              placeholder="Hiring manager notes, interview prep reminders, resume version used, referral details..."
            />
          </label>
          <button className="primary-button" type="submit">
            Save Job
          </button>
        </form>

        <section className="surface-card workspace-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Overview</p>
              <h2>Application pipeline snapshot</h2>
            </div>
          </div>
          <div className="job-stats-grid">
            {statuses.map((status) => (
              <article key={status} className="job-stat-card">
                <strong>{totals[status] || 0}</strong>
                <span>{status}</span>
              </article>
            ))}
          </div>
          <div className="filter-row">
            <button
              type="button"
              className={`filter-chip ${filter === "All" ? "filter-chip--active" : ""}`}
              onClick={() => setFilter("All")}
            >
              All
            </button>
            {statuses.map((status) => (
              <button
                key={status}
                type="button"
                className={`filter-chip ${filter === status ? "filter-chip--active" : ""}`}
                onClick={() => setFilter(status)}
              >
                {status}
              </button>
            ))}
          </div>
        </section>
      </section>

      <section className="job-board">
        {statuses.map((status) => (
          <article key={status} className="surface-card job-column">
            <div className="section-heading">
              <div>
                <p className="eyebrow">{status}</p>
                <h3>{jobs.filter((job) => job.status === status).length} roles</h3>
              </div>
            </div>
            <div className="job-list">
              {visibleJobs.filter((job) => job.status === status).length ? (
                visibleJobs
                  .filter((job) => job.status === status)
                  .map((job) => (
                    <article key={job.id} className="job-card">
                      <div className="builder-card__header">
                        <div>
                          <strong>{job.company}</strong>
                          <p className="muted">{job.role}</p>
                        </div>
                        <button type="button" className="ghost-button" onClick={() => removeJob(job.id)}>
                          Remove
                        </button>
                      </div>
                      <p className="helper-text">{job.notes || "No notes yet."}</p>
                      <div className="job-card__meta">
                        {job.appliedDate ? <span>Applied: {job.appliedDate}</span> : null}
                        {job.nextFollowUp ? <span>Follow-up: {job.nextFollowUp}</span> : null}
                      </div>
                      <div className="filter-row">
                        {statuses.map((nextStatus) => (
                          <button
                            key={nextStatus}
                            type="button"
                            className={`filter-chip ${job.status === nextStatus ? "filter-chip--active" : ""}`}
                            onClick={() => updateStatus(job.id, nextStatus)}
                          >
                            {nextStatus}
                          </button>
                        ))}
                      </div>
                    </article>
                  ))
              ) : (
                <p className="muted">No roles in this stage yet.</p>
              )}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

export default JobTrackerPage;
