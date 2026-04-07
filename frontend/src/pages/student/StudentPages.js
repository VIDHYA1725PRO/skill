import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { notifications as notifApi, certificates as certApi, courses as coursesApi, studyLogs } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { auth as authApi } from '../../utils/api';

// ---- NOTIFICATIONS ----
export function StudentNotifications() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { notifApi.getAll().then(r => setNotifs(r.data)).finally(() => setLoading(false)); }, []);

  const markRead = async (id) => {
    await notifApi.markRead(id);
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };
  const markAll = async () => {
    await notifApi.markAllRead();
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  };

  const icons = { assignment: '📝', quiz: '🧠', grade: '⭐', enrollment: '📚', message: '💬', certificate: '🏆', announcement: '📢' };
  const colors = { assignment: 'var(--primary-light)', quiz: 'var(--secondary-light)', grade: 'var(--accent-light)', message: 'var(--green-light)', certificate: 'var(--accent-light)', announcement: 'var(--rose-light)' };

  return (
    <Layout title="Notifications" subtitle="Stay updated with all your notifications and announcements">
      <div className="card" style={{ maxWidth: 700, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>All Notifications</h2>
            <p style={{ fontSize: 13, color: 'var(--text2)' }}>{notifs.filter(n => !n.read).length} unread</p>
          </div>
          {notifs.some(n => !n.read) && <button className="btn btn-sm btn-secondary" onClick={markAll}>Mark all read</button>}
        </div>
        {loading ? <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" /></div> :
          notifs.length === 0 ? <div className="empty-state"><div className="emoji">🔔</div><h3>No notifications</h3></div> :
          notifs.map(n => (
            <div key={n.id} className={`notif-item ${!n.read ? 'unread' : ''}`} onClick={() => !n.read && markRead(n.id)}
              style={{ borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: colors[n.type] || 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                {icons[n.type] || '📢'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: n.read ? 500 : 700, fontSize: 14 }}>{n.title}</div>
                <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2 }}>{n.message}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>
                  From: {n.from} • {new Date(n.createdAt).toLocaleString()}
                </div>
              </div>
              {!n.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0, marginTop: 4 }} />}
            </div>
          ))
        }
      </div>
    </Layout>
  );
}

// ---- PROGRESS ----
export function StudentProgress() {
  const [courses, setCourses] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([coursesApi.myEnrolled(), studyLogs.getAll()])
      .then(([c, l]) => { setCourses(c.data); setLogs(l.data); })
      .finally(() => setLoading(false));
  }, []);

  const totalMinutes = logs.reduce((s, l) => s + l.minutes, 0);
  const avgProgress = courses.length ? Math.round(courses.reduce((s, c) => s + (c.progress || 0), 0) / courses.length) : 0;
  const completed = courses.filter(c => c.progress === 100).length;

  return (
    <Layout title="My Progress" subtitle="Track your learning journey and achievements">
      {loading ? <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" /></div> : (
        <>
          <div className="grid-4" style={{ marginBottom: 24 }}>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'var(--primary-light)' }}>📚</div>
              <div className="stat-info"><h3>{courses.length}</h3><p>Enrolled Courses</p></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'var(--green-light)' }}>✅</div>
              <div className="stat-info"><h3>{completed}</h3><p>Completed</p></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'var(--secondary-light)' }}>⏱</div>
              <div className="stat-info"><h3>{Math.round(totalMinutes / 60)}h</h3><p>Study Time</p></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'var(--accent-light)' }}>📈</div>
              <div className="stat-info"><h3>{avgProgress}%</h3><p>Avg Progress</p></div>
            </div>
          </div>

          <div className="grid-2">
            <div className="card">
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Course Progress</h2>
              {courses.length === 0 ? <div className="empty-state"><div className="emoji">📚</div><h3>No courses enrolled</h3></div> :
                courses.map(c => (
                  <div key={c.id} style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <div>
                        <span style={{ fontWeight: 600, fontSize: 14 }}>{c.thumbnail} {c.title}</span>
                        <div style={{ fontSize: 12, color: 'var(--text2)' }}>{c.teacherName}</div>
                      </div>
                      <span style={{ fontWeight: 800, fontSize: 16, color: c.progress === 100 ? 'var(--green)' : 'var(--primary)' }}>{c.progress}%</span>
                    </div>
                    <div className="progress-bar-wrap" style={{ height: 8 }}>
                      <div className="progress-bar" style={{ width: `${c.progress}%` }} />
                    </div>
                  </div>
                ))
              }
            </div>

            <div className="card">
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Weekly Study Activity</h2>
              {[...Array(7)].map((_, i) => {
                const d = new Date(); d.setDate(d.getDate() - (6 - i));
                const key = d.toISOString().split('T')[0];
                const log = logs.find(l => l.date === key);
                const mins = log?.minutes || 0;
                const maxH = 120;
                const barH = Math.min((mins / 240) * maxH, maxH);
                const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                return (
                  <div key={i} style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 6, marginRight: 12 }}>
                    <span style={{ fontSize: 11, color: 'var(--text2)' }}>{mins}m</span>
                    <div style={{ width: 32, height: maxH, background: 'var(--bg2)', borderRadius: 8, display: 'flex', alignItems: 'flex-end', overflow: 'hidden' }}>
                      <div style={{ width: '100%', height: barH, background: 'linear-gradient(to top, var(--primary), var(--primary-soft))', borderRadius: 8, transition: 'height 0.5s' }} />
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--text2)' }}>{days[d.getDay()]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}

// ---- CERTIFICATES ----
export function StudentCertificates() {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [form, setForm] = useState({ title: '', issuer: '' });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => { certApi.getAll().then(r => setCerts(r.data)).finally(() => setLoading(false)); }, []);

  const upload = async (e) => {
    e.preventDefault();
    if (!file) return setMsg('Please select a file');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file); fd.append('title', form.title); fd.append('issuer', form.issuer);
      const r = await certApi.upload(fd);
      setCerts(prev => [...prev, r.data]);
      setShowUpload(false); setForm({ title: '', issuer: '' }); setFile(null);
      setMsg('Certificate uploaded!'); setTimeout(() => setMsg(''), 3000);
    } catch { setMsg('Upload failed'); setTimeout(() => setMsg(''), 3000); }
    finally { setUploading(false); }
  };

  return (
    <Layout title="Certificates" subtitle="Upload and manage your achievement certificates">
      {msg && <div className={`alert ${msg.includes('upload') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
        <button className="btn btn-primary" onClick={() => setShowUpload(true)}>+ Upload Certificate</button>
      </div>
      {loading ? <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" /></div> :
        certs.length === 0 ? (
          <div className="empty-state"><div className="emoji">🏆</div><h3>No certificates yet</h3><p>Upload your achievement certificates</p></div>
        ) : (
          <div className="grid-auto">
            {certs.map(c => (
              <div key={c.id} className="card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🏆</div>
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>{c.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 4 }}>Issued by: {c.issuer}</p>
                <div style={{ marginTop: 12 }}>
                  {c.verified ? (
                    <span className="badge badge-green">✓ Verified by {c.verifiedBy}</span>
                  ) : (
                    <span className="badge badge-amber">⏳ Pending Verification</span>
                  )}
                </div>
                <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 8 }}>Uploaded: {new Date(c.uploadedAt).toLocaleDateString()}</p>
                <p style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>📄 {c.fileName}</p>
              </div>
            ))}
          </div>
        )
      }

      {showUpload && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowUpload(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2>Upload Certificate</h2>
              <button className="modal-close" onClick={() => setShowUpload(false)}>×</button>
            </div>
            <form onSubmit={upload}>
              <div className="form-group">
                <label className="form-label">Certificate Title</label>
                <input className="form-input" placeholder="e.g. AWS Cloud Practitioner" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Issuing Organization</label>
                <input className="form-input" placeholder="e.g. Amazon Web Services" value={form.issuer} onChange={e => setForm(p => ({ ...p, issuer: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Certificate File</label>
                <div className="file-drop" onClick={() => document.getElementById('cert-file').click()}
                  style={{ background: file ? 'var(--green-light)' : undefined }}>
                  <div style={{ fontSize: 32 }}>📄</div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginTop: 8 }}>{file ? file.name : 'Click to upload (PDF/Image)'}</div>
                </div>
                <input id="cert-file" type="file" hidden accept=".pdf,.png,.jpg,.jpeg" onChange={e => setFile(e.target.files[0])} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-primary" type="submit" disabled={uploading} style={{ flex: 1 }}>
                  {uploading ? '⏳ Uploading...' : '📤 Upload'}
                </button>
                <button className="btn btn-outline" type="button" onClick={() => setShowUpload(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

// ---- PROFILE ----
export function StudentProfile() {
  const { user, updateUser, logout } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', grade: user?.grade || '', bio: user?.bio || '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await authApi.updateProfile(form);
      updateUser(r.data);
      setMsg('Profile updated!'); setTimeout(() => setMsg(''), 3000);
    } catch { setMsg('Update failed'); setTimeout(() => setMsg(''), 3000); }
    finally { setSaving(false); }
  };

  return (
    <Layout title="My Profile" subtitle="Manage your personal information and account settings">
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        {msg && <div className={`alert ${msg.includes('updated') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}
        <div className="card" style={{ marginBottom: 20, textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, color: 'white', fontWeight: 800, margin: '0 auto 16px' }}>{user?.name?.[0]}</div>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>{user?.name}</h2>
          <p style={{ color: 'var(--text2)', marginTop: 4 }}>{user?.email}</p>
          <span className="badge badge-purple" style={{ marginTop: 8 }}>Student</span>
        </div>

        <div className="card">
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Edit Profile</h2>
          <form onSubmit={save}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Grade/Year</label>
              <input className="form-input" value={form.grade} onChange={e => setForm(p => ({ ...p, grade: e.target.value }))} placeholder="e.g. 10th grade" />
            </div>
            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea className="form-textarea" value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} placeholder="Tell us about yourself..." />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" value={user?.email} disabled style={{ opacity: 0.6 }} />
            </div>
            <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? '⏳ Saving...' : '💾 Save Changes'}</button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
