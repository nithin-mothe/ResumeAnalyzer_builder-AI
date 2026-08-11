import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BriefcaseBusiness, Cloud, Plus, Trash2 } from "lucide-react";
import { itemVariants, listVariants, motionTokens } from "../components/MotionSystem";
import PageHero from "../components/PageHero";
import { supabase } from "../lib/supabase";
import {
  createApplication,
  deleteApplication,
  listApplications,
  updateApplication,
} from "../services/api";

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

const toClientJob = (application) => ({
  id: application.id,
  company: application.company || "",
  role: application.role || "",
  status: application.status || "Wishlist",
  link: application.link || "",
  appliedDate: application.applied_date || "",
  nextFollowUp: application.next_follow_up || "",
  notes: application.notes || "",
  createdAt: application.created_at,
  synced: true,
});

const toApiApplication = (job) => ({
  company: job.company,
  role: job.role,
  status: job.status,
  link: job.link || null,
  applied_date: job.appliedDate || null,
  next_follow_up: job.nextFollowUp || null,
  notes: job.notes || null,
});

function JobTrackerPage() {
  const [jobs, setJobs] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [form, setForm] = useState(emptyJob);
  const [filter, setFilter] = useState("All");
  const [serverSync, setServerSync] = useState(false);
  const [syncStatus, setSyncStatus] = useState("Local workspace");
  const [error, setError] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    let active = true;

    const loadApplications = async () => {
      if (!supabase) {
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        return;
      }

      setSyncStatus("Syncing applications...");
      try {
        const applications = await listApplications();
        if (!active) {
          return;
        }
        setJobs(applications.map(toClientJob));
        setServerSync(true);
        setSyncStatus("Synced to your account");
      } catch (loadError) {
        if (!active) {
          return;
        }
        setServerSync(false);
        setSyncStatus("Using local fallback");
        setError(loadError.message);
      }
    };

    loadApplications();

    return () => {
      active = false;
    };
  }, []);

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.company.trim() || !form.role.trim()) {
      return;
    }

    const localJob = {
      id: crypto.randomUUID(),
      ...form,
      createdAt: new Date().toISOString(),
      synced: false,
    };

    try {
      if (serverSync) {
        const saved = await createApplication(toApiApplication(form));
        setJobs((current) => [toClientJob(saved), ...current]);
      } else {
        setJobs((current) => [localJob, ...current]);
      }
      setForm(emptyJob);
      setError("");
    } catch (saveError) {
      setJobs((current) => [localJob, ...current]);
      setServerSync(false);
      setSyncStatus("Using local fallback");
      setError(saveError.message);
      setForm(emptyJob);
    }
  };

  const updateStatus = async (jobId, status) => {
    const previousJobs = jobs;
    setJobs((current) =>
      current.map((job) => (job.id === jobId ? { ...job, status } : job))
    );

    if (!serverSync) {
      return;
    }

    try {
      const saved = await updateApplication(jobId, { status });
      setJobs((current) => current.map((job) => (job.id === jobId ? toClientJob(saved) : job)));
      setError("");
    } catch (updateError) {
      setJobs(previousJobs);
      setError(updateError.message);
    }
  };

  const removeJob = async (jobId) => {
    const previousJobs = jobs;
    setJobs((current) => current.filter((job) => job.id !== jobId));

    if (!serverSync) {
      return;
    }

    try {
      await deleteApplication(jobId);
      setError("");
    } catch (deleteError) {
      setJobs(previousJobs);
      setError(deleteError.message);
    }
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
          { value: serverSync ? "Cloud" : "Local", label: "Storage" },
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
            <Plus size={18} aria-hidden="true" />
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
          <p className="sync-pill" aria-live="polite">
            <Cloud size={15} aria-hidden="true" />
            {syncStatus}
          </p>
          {error ? <p className="error-text">{error}</p> : null}
          <motion.div className="job-stats-grid" variants={listVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            {statuses.map((status) => (
              <motion.article key={status} className="job-stat-card" variants={itemVariants} whileHover={{ y: -3 }}>
                <strong>{totals[status] || 0}</strong>
                <span>{status}</span>
              </motion.article>
            ))}
          </motion.div>
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

      <motion.section className="job-board" layout>
        {statuses.map((status) => (
          <motion.article key={status} className="surface-card job-column" layout transition={motionTokens.spring}>
            <div className="section-heading">
              <div>
                <p className="eyebrow">{status}</p>
                <h3>{jobs.filter((job) => job.status === status).length} roles</h3>
              </div>
            </div>
            <motion.div className="job-list" layout>
              {visibleJobs.filter((job) => job.status === status).length ? (
                <AnimatePresence mode="popLayout">
                  {visibleJobs
                    .filter((job) => job.status === status)
                    .map((job) => (
                    <motion.article
                      key={job.id}
                      className="job-card"
                      layout
                      initial={{ opacity: 0, y: 18, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -14, scale: 0.97 }}
                      whileHover={{ y: -4 }}
                      transition={motionTokens.spring}
                    >
                      <div className="builder-card__header">
                        <div>
                          <strong>{job.company}</strong>
                          <p className="muted">{job.role}</p>
                        </div>
                        <button type="button" className="ghost-button" onClick={() => removeJob(job.id)}>
                          <Trash2 size={16} aria-hidden="true" />
                          Remove
                        </button>
                      </div>
                      <p className="helper-text">{job.notes || "No notes yet."}</p>
                      <div className="job-timeline" aria-hidden="true">
                        <motion.span
                          animate={{
                            width: `${((statuses.indexOf(job.status) + 1) / statuses.length) * 100}%`,
                          }}
                          transition={motionTokens.spring}
                        />
                      </div>
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
                    </motion.article>
                  ))}
                </AnimatePresence>
              ) : (
                <motion.p
                  className="muted empty-stage"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={motionTokens.spring}
                >
                  <BriefcaseBusiness size={17} aria-hidden="true" />
                  No roles in this stage yet.
                </motion.p>
              )}
            </motion.div>
          </motion.article>
        ))}
      </motion.section>
    </div>
  );
}

export default JobTrackerPage;
