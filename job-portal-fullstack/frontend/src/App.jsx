import { useEffect, useState } from 'react';
import { Link, Navigate, NavLink, Route, Routes, useNavigate, useParams, useLocation } from 'react-router-dom';
import { api } from './api';

function Header({ user, onLogout }) {
  return (
    <header className="site-header">
      <Link className="brand" to="/">
        <div className="brand-text">
          शुभ <span>JOB PORTAL</span>
        </div>
      </Link>
      <nav className="header-nav">
        <Link to="/" className="nav-link">Find Jobs</Link>
        {user ? (
          <div className="user-nav-dropdown">
            <Link to="/dashboard" className="dashboard-pill">
              <span className="user-avatar-small">{user.name?.[0]?.toUpperCase()}</span>
              <span>{user.name?.split(' ')[0]} (Dashboard)</span>
            </Link>
            <button onClick={onLogout} className="logout-nav-btn" title="Log out">Logout</button>
          </div>
        ) : (
          <div className="auth-nav-buttons">
            <Link to="/login" className="login-link">Sign In</Link>
            <Link to="/login" className="register-link-btn">Post a Job / Register</Link>
          </div>
        )}
      </nav>
    </header>
  );
}

function Jobs() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const load = (targetPage = 1, append = false) => {
    setLoading(true);
    const typeParam = selectedType !== 'All' ? `&type=${encodeURIComponent(selectedType)}` : '';
    const sortParam = `&sort=${sortBy}`;
    return api(`/jobs?search=${encodeURIComponent(search)}&location=${encodeURIComponent(location)}${typeParam}${sortParam}&page=${targetPage}&limit=24`)
      .then(data => {
        setItems(current => append ? [...current, ...(data.items || [])] : (data.items || []));
        setPage(data.page || 1);
        setPages(data.pages || 1);
        setTotal(data.total || 0);
        setError('');
      })
      .catch(err => {
        setError(err.message);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(1, false);
  }, [selectedType, sortBy]);

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    load(1, false);
  };

  return (
    <main className="job-portal-main">
      <section className="hero">
        <div className="hero-badge">✨ 140+ ACTIVE OPPORTUNITIES ACROSS INDIA & REMOTE</div>
        <h1>Find Your Dream Job at <em>शुभ JOB PORTAL</em></h1>
        <p className="hero-subtext">Connecting ambitious talent with leading tech companies, fast-growing startups, and top enterprises.</p>
        
        <form className="search-box" onSubmit={handleSearchSubmit}>
          <div className="search-field">
            <span className="search-icon">🔍</span>
            <input 
              placeholder="Job title, skills (e.g. React, Node, DevOps)..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>
          <div className="search-divider"></div>
          <div className="search-field">
            <span className="search-icon">📍</span>
            <input 
              placeholder="City (Bengaluru, Pune, Mumbai) or Remote..." 
              value={location} 
              onChange={e => setLocation(e.target.value)} 
            />
          </div>
          <button type="submit" className="search-button">
            {loading ? 'Searching…' : 'Search Jobs'}
          </button>
        </form>

        {/* Quick Filter Tags */}
        <div className="type-filters">
          <span className="filter-label">Filter:</span>
          {['All', 'Full-time', 'Part-time', 'Contract', 'Internship'].map(type => (
            <button
              key={type}
              type="button"
              className={`type-pill ${selectedType === type ? 'active' : ''}`}
              onClick={() => setSelectedType(type)}
            >
              {type}
            </button>
          ))}
        </div>
      </section>

      <section className="listing-section">
        <div className="section-head">
          <div>
            <p className="section-tag">VERIFIED OPENINGS</p>
            <h2>Latest Vacancies <span className="counter-badge">{total} Open</span></h2>
          </div>
          <div className="sort-controls">
            <label>Sort by:</label>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="sort-select">
              <option value="newest">Newest First</option>
              <option value="salary">Highest Salary</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="error-banner">
            <p><strong>Notice:</strong> {error}</p>
          </div>
        )}

        <div className="cards-grid">
          {items.map(job => (
            <article className="job-card" key={job._id}>
              <div className="job-card-header">
                <div className="company-logo">
                  {job.company?.[0]?.toUpperCase()}
                </div>
                <div className="job-badges">
                  <span className="job-type-tag">{job.type}</span>
                  {job.status === 'open' && <span className="status-live-tag">Active</span>}
                </div>
              </div>
              
              <h3 className="job-card-title">{job.title}</h3>
              <p className="job-company-name">🏢 {job.company}</p>
              
              <div className="job-meta-row">
                <span className="job-location">📍 {job.location}</span>
                {job.salary ? (
                  <span className="job-salary">💰 ₹{(job.salary / 100000).toFixed(1)} LPA</span>
                ) : null}
              </div>

              <div className="skills-tags-wrap">
                {(job.skills || []).slice(0, 3).map((skill, i) => (
                  <span key={i} className="skill-chip">{skill}</span>
                ))}
                {(job.skills?.length || 0) > 3 && (
                  <span className="skill-chip-more">+{job.skills.length - 3}</span>
                )}
              </div>

              <p className="job-description">
                {job.description?.slice(0, 110)}{job.description?.length > 110 ? '…' : ''}
              </p>

              <div className="card-footer">
                <span className="posted-time">
                  {job.createdAt ? new Date(job.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'Recently'}
                </span>
                <Link className="view-details-btn" to={`/job/${job._id}`}>
                  View Details & Apply <span>→</span>
                </Link>
              </div>
            </article>
          ))}
        </div>

        {items.length > 0 && (
          <div className="pagination-bar">
            <p className="results-count">Showing {items.length} of {total} vacancies</p>
            {page < pages && (
              <button 
                className="load-more-btn" 
                onClick={() => load(page + 1, true)} 
                disabled={loading}
              >
                {loading ? 'Loading more jobs...' : 'Load 24 More Jobs ↓'}
              </button>
            )}
          </div>
        )}

        {!items.length && !loading && !error && (
          <div className="no-jobs-card">
            <h3>No jobs found matching your criteria</h3>
            <p>Try searching for different keywords, locations, or clear the type filter.</p>
            <button className="primary-btn" onClick={() => { setSearch(''); setLocation(''); setSelectedType('All'); }}>
              Reset Filters
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

function Auth() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'candidate' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await api(`/auth/${mode === 'login' ? 'login' : 'register'}`, {
        method: 'POST',
        body: JSON.stringify(form)
      });
      localStorage.setItem('token', data.token);
      navigate('/dashboard');
      window.location.reload();
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-wrapper">
      <div className="auth-container">
        <form className="auth-box" onSubmit={submit}>
          <div className="auth-header">
            <div className="auth-brand-badge">शुभ JOB PORTAL</div>
            <h2>{mode === 'login' ? 'Welcome Back!' : 'Create Your Account'}</h2>
            <p className="auth-subtitle">
              {mode === 'login' 
                ? 'Sign in to access your dashboard, applications, and saved jobs.' 
                : 'Join over 10,000+ job seekers and top employers today.'}
            </p>
          </div>

          {error && <div className="auth-error-banner">{error}</div>}

          {mode === 'register' && (
            <div className="form-group">
              <label>Full Name</label>
              <input 
                required 
                placeholder="e.g. Shubhangi Pawar" 
                value={form.name} 
                onChange={e => setForm({ ...form, name: e.target.value })} 
              />
            </div>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <input 
              required 
              type="email" 
              placeholder="name@example.com" 
              value={form.email} 
              onChange={e => setForm({ ...form, email: e.target.value })} 
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input 
              required 
              minLength="6" 
              type="password" 
              placeholder="•••••••• (at least 6 characters)" 
              value={form.password} 
              onChange={e => setForm({ ...form, password: e.target.value })} 
            />
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label>I am joining as a:</label>
              <div className="role-selector">
                <label className={`role-pill ${form.role === 'candidate' ? 'selected' : ''}`}>
                  <input 
                    type="radio" 
                    name="role" 
                    value="candidate" 
                    checked={form.role === 'candidate'} 
                    onChange={e => setForm({ ...form, role: e.target.value })}
                  />
                  <span>👨‍💼 Job Candidate</span>
                </label>
                <label className={`role-pill ${form.role === 'employer' ? 'selected' : ''}`}>
                  <input 
                    type="radio" 
                    name="role" 
                    value="employer" 
                    checked={form.role === 'employer'} 
                    onChange={e => setForm({ ...form, role: e.target.value })}
                  />
                  <span>🏢 Employer / Recruiter</span>
                </label>
              </div>
            </div>
          )}

          <button className="auth-submit-btn" disabled={loading}>
            {loading ? 'Please wait…' : (mode === 'login' ? 'Sign In' : 'Create Account')}
          </button>

          <div className="auth-footer-switch">
            <span>{mode === 'login' ? "Don't have an account yet?" : "Already registered?"}</span>
            <button 
              type="button" 
              className="switch-mode-btn" 
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
            >
              {mode === 'login' ? 'Create free account' : 'Sign In here'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

function JobDetail() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [message, setMessage] = useState('');
  const [applying, setApplying] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [showApplyModal, setShowApplyModal] = useState(false);

  useEffect(() => { 
    api(`/jobs/${id}`)
      .then(setJob)
      .catch(err => setMessage(err.message)); 
  }, [id]);

  async function handleApply(e) {
    e?.preventDefault();
    setApplying(true);
    try {
      await api(`/jobs/${id}/apply`, { 
        method: 'POST', 
        body: JSON.stringify({ coverLetter }) 
      });
      setMessage('✅ Your application has been submitted successfully!');
      setShowApplyModal(false);
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setApplying(false);
    }
  }

  return (
    <main className="job-detail-page">
      <Link to="/" className="back-link">← Back to all vacancies</Link>
      
      {job ? (
        <article className="job-detail-card">
          <div className="detail-header">
            <div className="detail-logo">{job.company?.[0]?.toUpperCase()}</div>
            <div className="detail-title-group">
              <span className="tag-pill">{job.type}</span>
              <h1>{job.title}</h1>
              <h3>🏢 {job.company} · 📍 {job.location}</h3>
            </div>
            <div className="detail-salary-badge">
              {job.salary ? `₹${(job.salary / 100000).toFixed(1)} LPA` : 'Competitive'}
            </div>
          </div>

          <hr className="divider" />

          {message && <div className="notice-banner">{message}</div>}

          <div className="detail-body">
            <h3>About the Position</h3>
            <p className="detail-description">{job.description}</p>

            <h3>Required Skills & Technologies</h3>
            <div className="detail-skills">
              {(job.skills || []).map((skill, idx) => (
                <span key={idx} className="skill-chip large">{skill}</span>
              ))}
            </div>

            <div className="apply-actions-row">
              <button className="primary-apply-btn" onClick={() => setShowApplyModal(true)}>
                Apply for this Position ↗
              </button>
            </div>
          </div>

          {/* Apply Modal */}
          {showApplyModal && (
            <div className="modal-backdrop">
              <div className="modal-box">
                <h3>Submit Application for {job.title}</h3>
                <p className="modal-sub">at {job.company}</p>
                <form onSubmit={handleApply}>
                  <label>Cover Letter / Brief Intro (Optional)</label>
                  <textarea 
                    rows="4" 
                    placeholder="Tell the recruiter why you're a great fit for this role..." 
                    value={coverLetter} 
                    onChange={e => setCoverLetter(e.target.value)}
                  />
                  <div className="modal-actions">
                    <button type="button" className="secondary-button" onClick={() => setShowApplyModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="primary-btn" disabled={applying}>
                      {applying ? 'Submitting…' : 'Submit Application'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </article>
      ) : (
        <div className="loading-box">{message || 'Loading job opening details…'}</div>
      )}
    </main>
  );
}

function DashboardLayout({ user, onLogout }) {
  const employer = user.role === 'employer';
  const links = employer
    ? [
        ['/dashboard', '📊 Overview'],
        ['/dashboard/vacancies', '💼 140+ Open Jobs'],
        ['/dashboard/jobs', '📁 My Job Postings'],
        ['/dashboard/applicants', '👥 Applicants'],
        ['/dashboard/jobs/new', '➕ Post a Job'],
        ['/dashboard/profile', '👤 My Profile']
      ]
    : [
        ['/dashboard', '📊 Overview'],
        ['/dashboard/vacancies', '💼 140+ Open Jobs'],
        ['/dashboard/applications', '📝 My Applications'],
        ['/dashboard/profile', '👤 My Profile']
      ];

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <Link className="brand" to="/">
          <div className="brand-text">
            शुभ <span>JOB PORTAL</span>
          </div>
        </Link>
        
        <p className="sidebar-label">WORKSPACE MENU</p>
        <nav className="sidebar-nav">
          {links.map(([to, label]) => (
            <NavLink end={to === '/dashboard'} key={to} to={to} className="sidebar-link">
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-user">
          <div className="avatar">{user.name?.[0]?.toUpperCase()}</div>
          <div className="sidebar-user-info">
            <b>{user.name}</b>
            <span>{user.role === 'employer' ? 'Recruiter' : 'Candidate'}</span>
          </div>
          <button className="logout-button" onClick={onLogout} title="Log out">⏻</button>
        </div>
      </aside>

      <div className="dashboard-content">
        <div className="dashboard-topbar">
          <div className="breadcrumbs">
            <span>शुभ JOB PORTAL</span>
            <span className="breadcrumb-separator">/</span>
            <span className="current-crumb">Dashboard Workspace</span>
          </div>
          <Link to="/" className="topbar-live-link">View Public Board ↗</Link>
        </div>

        <Routes>
          <Route index element={<DashboardHome user={user} />} />
          <Route path="applications" element={employer ? <Navigate to="/dashboard/jobs" replace /> : <CandidateApplications />} />
          <Route path="applicants" element={employer ? <EmployerApplicants /> : <Navigate to="/dashboard" replace />} />
          <Route path="vacancies" element={<Jobs />} />
          <Route path="jobs" element={employer ? <EmployerJobs /> : <Navigate to="/dashboard" replace />} />
          <Route path="jobs/new" element={employer ? <JobForm /> : <Navigate to="/dashboard" replace />} />
          <Route path="jobs/:jobId/applicants" element={employer ? <JobApplicants /> : <Navigate to="/dashboard" replace />} />
          <Route path="profile" element={<Profile user={user} />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </div>
  );
}

function DashboardHome({ user }) {
  const [count, setCount] = useState(null);
  const [totalJobs, setTotalJobs] = useState(140);
  const employer = user.role === 'employer';

  useEffect(() => {
    api(employer ? '/jobs/mine' : '/applications/my')
      .then(data => setCount(data.length))
      .catch(() => setCount(0));
    
    api('/jobs?limit=1')
      .then(data => setTotalJobs(data.total || 140))
      .catch(() => {});
  }, [employer]);

  return (
    <main className="dashboard-page">
      <div className="welcome-banner">
        <p className="eyebrow">{employer ? 'EMPLOYER RECRUITING HUB' : 'CANDIDATE CAREER HUB'}</p>
        <h1>Welcome, {user.name} 👋</h1>
        <p className="dashboard-intro">
          {employer 
            ? 'Manage your vacancies, track incoming candidates, and build your dream team.' 
            : 'Track your sent applications, explore 140+ latest curated jobs, and advance your career.'}
        </p>
      </div>

      <div className="stats-grid">
        <article className="stat-card">
          <span className="stat-title">{employer ? 'Your Active Jobs' : 'Applications Submitted'}</span>
          <strong className="stat-number">{count === null ? '…' : count}</strong>
          <span className="stat-meta">{employer ? 'Posted by your account' : 'Tracked in real-time'}</span>
        </article>
        <article className="stat-card">
          <span className="stat-title">Available Vacancies</span>
          <strong className="stat-number">{totalJobs}</strong>
          <span className="stat-meta">Active openings across India</span>
        </article>
        <article className="stat-card">
          <span className="stat-title">Account Type</span>
          <strong className="stat-number role-value">{employer ? 'Employer' : 'Candidate'}</strong>
          <span className="stat-meta">Verified profile</span>
        </article>
      </div>

      <section className="dashboard-shortcuts">
        <h2>Quick Navigation</h2>
        {employer ? (
          <div className="shortcut-grid">
            <Link to="/dashboard/vacancies" className="shortcut-card">
              <span className="shortcut-icon">🔍</span>
              <b>Browse 140+ Open Jobs</b>
              <span>Explore current openings and industry salary benchmarks.</span>
            </Link>
            <Link to="/dashboard/jobs/new" className="shortcut-card">
              <span className="shortcut-icon">➕</span>
              <b>Post a New Vacancy</b>
              <span>Publish a job opening to reach thousands of candidates.</span>
            </Link>
            <Link to="/dashboard/jobs" className="shortcut-card">
              <span className="shortcut-icon">📋</span>
              <b>Manage Posted Jobs</b>
              <span>Review your listings and review applicants.</span>
            </Link>
            <Link to="/dashboard/applicants" className="shortcut-card">
              <span className="shortcut-icon">👥</span>
              <b>Review Candidates</b>
              <span>Shortlist, interview, or hire candidate submissions.</span>
            </Link>
          </div>
        ) : (
          <div className="shortcut-grid">
            <Link to="/dashboard/vacancies" className="shortcut-card">
              <span className="shortcut-icon">🔍</span>
              <b>Explore 140+ Vacancies</b>
              <span>Search tech, design, marketing, and management jobs.</span>
            </Link>
            <Link to="/dashboard/applications" className="shortcut-card">
              <span className="shortcut-icon">📄</span>
              <b>Track My Applications</b>
              <span>Check status: applied, shortlisted, or hired.</span>
            </Link>
            <Link to="/dashboard/profile" className="shortcut-card">
              <span className="shortcut-icon">👤</span>
              <b>Profile & Preferences</b>
              <span>View your candidate registration details.</span>
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}

function CandidateApplications() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = () => api('/applications/my').then(setItems).catch(err => setError(err.message));
  useEffect(() => { load(); }, []);

  async function withdraw(id) {
    try {
      await api(`/applications/${id}`, { method: 'DELETE' });
      setNotice('Application withdrawn.');
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="dashboard-page">
      <p className="eyebrow">YOUR JOB PIPELINE</p>
      <h1>My Applications</h1>
      <p className="dashboard-intro">Track the live progress of all jobs you have applied for.</p>
      
      {error && <p className="error-banner">{error}</p>}
      {notice && <p className="notice-banner">{notice}</p>}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Role / Position</th>
              <th>Company</th>
              <th>Location</th>
              <th>Status</th>
              <th>Date Applied</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map(app => (
              <tr key={app._id}>
                <td>
                  <Link to={`/job/${app.job?._id || app.job}`} className="table-job-link">
                    {app.job?.title || 'Open Position'}
                  </Link>
                </td>
                <td>{app.job?.company || 'Company'}</td>
                <td>{app.job?.location || 'India'}</td>
                <td>
                  <span className={`status-badge status-${app.status}`}>{app.status}</span>
                </td>
                <td>{app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'Recent'}</td>
                <td>
                  {app.status === 'applied' && (
                    <button className="small-button secondary-button" onClick={() => withdraw(app._id)}>
                      Withdraw
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!items.length && !error && (
          <div className="empty-state">
            <p>You haven't applied to any jobs yet.</p>
            <Link to="/dashboard/vacancies" className="primary-link">Browse 140+ Jobs & Apply Now</Link>
          </div>
        )}
      </div>
    </main>
  );
}

function EmployerJobs() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const load = () => api('/jobs/mine').then(setItems).catch(err => setError(err.message));
  useEffect(() => { load(); }, []);

  async function deleteJob(id) {
    if (window.confirm('Delete this job listing?')) {
      try {
        await api(`/jobs/${id}`, { method: 'DELETE' });
        load();
      } catch (err) {
        setError(err.message);
      }
    }
  }

  async function closeJob(id) {
    try {
      await api(`/jobs/${id}/close`, { method: 'PATCH' });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="dashboard-page">
      <div className="page-title-row">
        <div>
          <p className="eyebrow">EMPLOYER WORKSPACE</p>
          <h1>My Job Postings</h1>
        </div>
        <Link className="primary-link" to="/dashboard/jobs/new">➕ Post a New Job</Link>
      </div>

      {error && <p className="error-banner">{error}</p>}

      <div className="employer-job-list">
        {items.map(job => (
          <article className="employer-job-card" key={job._id}>
            <div>
              <span className={`status-badge status-${job.status}`}>{job.status}</span>
              <h3>{job.title}</h3>
              <p>🏢 {job.company} · 📍 {job.location}</p>
              <small>Posted: {new Date(job.createdAt).toLocaleDateString()}</small>
            </div>
            <div className="job-card-actions">
              <Link className="outline-btn" to={`/dashboard/jobs/${job._id}/applicants`}>
                Applicants ↗
              </Link>
              {job.status === 'open' && (
                <button className="secondary-button" onClick={() => closeJob(job._id)}>
                  Close Listing
                </button>
              )}
              <button className="danger-button" onClick={() => deleteJob(job._id)}>
                Delete
              </button>
            </div>
          </article>
        ))}

        {!items.length && !error && (
          <div className="empty-state">
            <p>You haven't posted any jobs yet.</p>
            <Link to="/dashboard/jobs/new" className="primary-link">Publish Your First Job</Link>
          </div>
        )}
      </div>
    </main>
  );
}

function EmployerApplicants() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  
  const load = () => api('/applications/received').then(setItems).catch(err => setError(err.message));
  useEffect(() => { load(); }, []);

  async function updateStatus(id, newStatus) {
    try {
      await api(`/applications/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      setNotice(`Application updated to ${newStatus}.`);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="dashboard-page">
      <p className="eyebrow">RECRUITING PIPELINE</p>
      <h1>Received Applications</h1>
      <p className="dashboard-intro">Review candidate profiles, shortlist high-potential applicants, and update hiring statuses.</p>

      {error && <p className="error-banner">{error}</p>}
      {notice && <p className="notice-banner">{notice}</p>}

      <div className="applicant-list">
        {items.map(app => (
          <article className="applicant-card" key={app._id}>
            <div className="applicant-avatar">
              {app.candidate?.name?.[0]?.toUpperCase() || 'C'}
            </div>
            <div className="applicant-details">
              <b>{app.candidate?.name || 'Applicant'}</b>
              {app.candidate?.email && <a href={`mailto:${app.candidate.email}`}>{app.candidate.email}</a>}
              <span className="applicant-job-title">
                Role: <strong>{app.job?.title}</strong> ({app.job?.company})
              </span>
              <span className={`status-badge status-${app.status}`}>{app.status}</span>
              {app.coverLetter && <p className="applicant-cover-letter">"{app.coverLetter}"</p>}
            </div>
            <div className="applicant-actions">
              {app.status === 'applied' && (
                <>
                  <button className="primary-btn small" onClick={() => updateStatus(app._id, 'shortlisted')}>
                    Shortlist
                  </button>
                  <button className="danger-button small" onClick={() => updateStatus(app._id, 'rejected')}>
                    Reject
                  </button>
                </>
              )}
              {app.status === 'shortlisted' && (
                <>
                  <button className="primary-btn small" onClick={() => updateStatus(app._id, 'hired')}>
                    Mark Hired
                  </button>
                  <button className="danger-button small" onClick={() => updateStatus(app._id, 'rejected')}>
                    Reject
                  </button>
                </>
              )}
            </div>
          </article>
        ))}

        {!items.length && !error && (
          <div className="empty-state">
            <p>No candidates have applied to your vacancies yet.</p>
          </div>
        )}
      </div>
    </main>
  );
}

function JobForm() {
  const [form, setForm] = useState({
    title: '',
    company: '',
    description: '',
    location: '',
    type: 'Full-time',
    skills: '',
    salary: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await api('/jobs', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
          salary: form.salary ? Number(form.salary) : undefined
        })
      });
      navigate('/dashboard/jobs');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="dashboard-page">
      <p className="eyebrow">POST A NEW OPENING</p>
      <h1>Create Job Listing</h1>
      <p className="dashboard-intro">Publish your opportunity across SHUBH JOB PORTAL to connect with top qualified candidates.</p>

      {error && <p className="error-banner">{error}</p>}

      <form className="dashboard-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label>
            Job Title *
            <input 
              required 
              placeholder="e.g. Senior Frontend Engineer" 
              value={form.title} 
              onChange={e => setForm({ ...form, title: e.target.value })} 
            />
          </label>
          <label>
            Company Name *
            <input 
              required 
              placeholder="e.g. Swiggy, Google, Flipkart" 
              value={form.company} 
              onChange={e => setForm({ ...form, company: e.target.value })} 
            />
          </label>
          <label>
            Location *
            <input 
              required 
              placeholder="e.g. Bengaluru, Pune, Mumbai, Remote" 
              value={form.location} 
              onChange={e => setForm({ ...form, location: e.target.value })} 
            />
          </label>
          <label>
            Employment Type *
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Contract</option>
              <option>Internship</option>
            </select>
          </label>
          <label>
            Annual Salary in INR (e.g. 1800000)
            <input 
              type="number" 
              placeholder="e.g. 1500000" 
              value={form.salary} 
              onChange={e => setForm({ ...form, salary: e.target.value })} 
            />
          </label>
          <label>
            Required Skills (comma separated)
            <input 
              placeholder="React, Node.js, TypeScript, Docker" 
              value={form.skills} 
              onChange={e => setForm({ ...form, skills: e.target.value })} 
            />
          </label>
        </div>

        <label className="textarea-label">
          Job Description *
          <textarea 
            required 
            rows="6" 
            placeholder="Describe the role, key responsibilities, qualifications, and company perks..." 
            value={form.description} 
            onChange={e => setForm({ ...form, description: e.target.value })} 
          />
        </label>

        <div className="form-actions">
          <Link to="/dashboard/jobs" className="secondary-button">Cancel</Link>
          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? 'Publishing…' : 'Publish Job Listing'}
          </button>
        </div>
      </form>
    </main>
  );
}

function JobApplicants() {
  const { jobId } = useParams();
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api(`/jobs/${jobId}/applications`)
      .then(setItems)
      .catch(err => setError(err.message));
  }, [jobId]);

  return (
    <main className="dashboard-page">
      <Link to="/dashboard/jobs" className="back-link">← Back to My Jobs</Link>
      <h1>Applicants for this Job</h1>
      {error && <p className="error-banner">{error}</p>}
      
      <div className="applicant-list">
        {items.map(app => (
          <article className="applicant-card" key={app._id}>
            <div className="applicant-avatar">
              {app.candidate?.name?.[0]?.toUpperCase() || 'C'}
            </div>
            <div className="applicant-details">
              <b>{app.candidate?.name}</b>
              <a href={`mailto:${app.candidate?.email}`}>{app.candidate?.email}</a>
              <span className={`status-badge status-${app.status}`}>{app.status}</span>
              {app.coverLetter && <p>"{app.coverLetter}"</p>}
            </div>
          </article>
        ))}
        {!items.length && !error && (
          <div className="empty-state">
            <p>No candidates have applied for this specific job opening yet.</p>
          </div>
        )}
      </div>
    </main>
  );
}

function Profile({ user }) {
  return (
    <main className="dashboard-page">
      <p className="eyebrow">USER PROFILE</p>
      <h1>My Account</h1>
      <p className="dashboard-intro">Your registered शुभ JOB PORTAL profile and credentials.</p>

      <div className="profile-card">
        <div className="profile-avatar-large">
          {user.name?.[0]?.toUpperCase()}
        </div>
        <div className="profile-fields">
          <div className="profile-field">
            <span className="field-name">Full Name</span>
            <b className="field-value">{user.name}</b>
          </div>
          <div className="profile-field">
            <span className="field-name">Registered Email</span>
            <b className="field-value">{user.email}</b>
          </div>
          <div className="profile-field">
            <span className="field-name">Account Role</span>
            <b className="field-value capitalize">{user.role}</b>
          </div>
          <div className="profile-field">
            <span className="field-name">Platform Access</span>
            <b className="field-value status-open">Active & Verified</b>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setAuthChecked(true);
      return;
    }
    api('/auth/me')
      .then(data => setUser(data.user))
      .catch(() => {
        localStorage.removeItem('token');
        setUser(null);
      })
      .finally(() => setAuthChecked(true));
  }, []);

  function handleLogout() {
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/';
  }

  const isDashboardRoute = location.pathname.startsWith('/dashboard');

  return (
    <div className="app-shell">
      <div className="watermark-overlay" aria-hidden="true" />
      {!isDashboardRoute && <Header user={user} onLogout={handleLogout} />}
      
      <Routes>
        <Route path="/" element={<Jobs />} />
        <Route 
          path="/login" 
          element={user ? <Navigate to="/dashboard" replace /> : <Auth />} 
        />
        <Route path="/job/:id" element={<JobDetail />} />
        <Route 
          path="/dashboard/*" 
          element={
            authChecked ? (
              user ? (
                <DashboardLayout user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            ) : (
              <div className="loading-fullscreen">
                <div className="spinner"></div>
                <p>Loading शुभ JOB PORTAL workspace…</p>
              </div>
            )
          } 
        />
        <Route 
          path="*" 
          element={
            <main className="not-found-page">
              <h2>404 - Page Not Found</h2>
              <p>The page you are looking for does not exist.</p>
              <Link to="/" className="primary-btn">Return to Home</Link>
            </main>
          } 
        />
      </Routes>

      {!isDashboardRoute && (
        <footer className="site-footer">
          <div className="footer-content">
            <div className="footer-brand">
              <span className="footer-brand-title">शुभ JOB PORTAL</span>
              <p>India's modern job search & talent acquisition platform. Connecting dreams with opportunities.</p>
            </div>
            <div className="footer-links">
              <span>© {new Date().getFullYear()} शुभ JOB PORTAL. All rights reserved.</span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
