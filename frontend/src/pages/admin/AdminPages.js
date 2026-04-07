import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { admin as adminApi, courses as coursesApi, notifications as notifApi, auth as authApi } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const API_BASE = '/api';
const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('sb_token')}` });

// ---- ADMIN STUDENTS ----
export function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', grade: '', role: 'student' });
  const [msg, setMsg] = useState('');

  useEffect(() => { adminApi.users().then(r => setStudents(r.data.filter(u => u.role === 'student'))).finally(() => setLoading(false)); }, []);

  const loadDetail = async (id) => {
    const r = await adminApi.userDetail(id);
    setDetail(r.data); setSelected(id);
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Remove this student?')) return;
    await adminApi.deleteUser(id);
    setStudents(prev => prev.filter(s => s.id !== id));
    if (selected === id) { setSelected(null); setDetail(null); }
    setMsg('Student removed'); setTimeout(() => setMsg(''), 3000);
  };

  const addUser = async (e) => {
    e.preventDefault();
    try {
      const r = await axios.post(`${API_BASE}/auth/register`, form, { headers: getHeaders() });
      setStudents(prev => [...prev, r.data.user]);
      setShowAdd(false); setForm({ name: '', email: '', password: '', grade: '', role: 'student' });
      setMsg('Student added!'); setTimeout(() => setMsg(''), 3000);
    } catch (e) { setMsg(e.response?.data?.message || 'Error'); setTimeout(() => setMsg(''), 3000); }
  };

  const filtered = students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <Layout title="All Students" subtitle="Manage student accounts and view their details">
      {msg && <div className={`alert ${msg.includes('added') || msg.includes('removed') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <input className="form-input" placeholder="🔍 Search students..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 300, margin: 0 }} />
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add Student</button>
      </div>

      <div style={{ display: 'flex', gap: 20 }}>
        <div style={{ flex: 1 }}>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Student</th><th>Email</th><th>Grade</th><th>Joined</th><th>Actions</th></tr></thead>
              <tbody>
                {loading ? <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40 }}><div className="spinner" /></td></tr> :
                  filtered.map(s => (
                    <tr key={s.id} style={{ cursor: 'pointer' }} onClick={() => loadDetail(s.id)}>
                      <td><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>{s.name?.[0]}</div><strong>{s.name}</strong></div></td>
                      <td>{s.email}</td>
                      <td>{s.grade || '-'}</td>
                      <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                      <td onClick={e => e.stopPropagation()}>
                        <button className="btn btn-danger btn-sm" onClick={() => deleteUser(s.id)}>🗑 Remove</button>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>

        {detail && (
          <div className="card" style={{ width: 280, flexShrink: 0 }}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, margin: '0 auto 10px' }}>{detail.name?.[0]}</div>
              <h3 style={{ fontWeight: 700 }}>{detail.name}</h3>
              <p style={{ fontSize: 13, color: 'var(--text2)' }}>{detail.email}</p>
              {detail.grade && <span className="badge badge-purple" style={{ marginTop: 6 }}>{detail.grade}</span>}
            </div>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Enrolled Courses ({detail.enrolledCourses?.length || 0})</div>
              {detail.enrolledCourses?.map(c => <div key={c.id} style={{ fontSize: 13, padding: '4px 0', color: 'var(--text2)' }}>{c.thumbnail} {c.title}</div>)}
              <div style={{ fontSize: 13, fontWeight: 700, marginTop: 12, marginBottom: 8 }}>Certificates ({detail.certificates?.length || 0})</div>
              {detail.certificates?.map(c => <div key={c.id} style={{ fontSize: 13, padding: '4px 0', color: 'var(--text2)' }}>🏆 {c.title}</div>)}
            </div>
          </div>
        )}
      </div>

      {showAdd && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <div className="modal">
            <div className="modal-header"><h2>Add Student</h2><button className="modal-close" onClick={() => setShowAdd(false)}>×</button></div>
            <form onSubmit={addUser}>
              <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required /></div>
              <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required /></div>
              <div className="form-group"><label className="form-label">Password</label><input className="form-input" type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required /></div>
              <div className="form-group"><label className="form-label">Grade</label><input className="form-input" placeholder="e.g. 10th grade" value={form.grade} onChange={e => setForm(p => ({ ...p, grade: e.target.value }))} /></div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-primary" type="submit" style={{ flex: 1 }}>➕ Add Student</button>
                <button className="btn btn-outline" type="button" onClick={() => setShowAdd(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

// ---- ADMIN TEACHERS ----
export function AdminTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', subject: '', role: 'teacher' });
  const [msg, setMsg] = useState('');

  useEffect(() => { adminApi.users().then(r => setTeachers(r.data.filter(u => u.role === 'teacher'))).finally(() => setLoading(false)); }, []);

  const addTeacher = async (e) => {
    e.preventDefault();
    try {
      const r = await axios.post(`${API_BASE}/auth/register`, form, { headers: getHeaders() });
      setTeachers(prev => [...prev, r.data.user]);
      setShowAdd(false); setForm({ name: '', email: '', password: '', subject: '', role: 'teacher' });
      setMsg('Teacher added!'); setTimeout(() => setMsg(''), 3000);
    } catch (e) { setMsg(e.response?.data?.message || 'Error'); setTimeout(() => setMsg(''), 3000); }
  };

  const deleteTeacher = async (id) => {
    if (!window.confirm('Remove this teacher?')) return;
    await adminApi.deleteUser(id);
    setTeachers(prev => prev.filter(t => t.id !== id));
    setMsg('Teacher removed'); setTimeout(() => setMsg(''), 3000);
  };

  return (
    <Layout title="All Teachers" subtitle="Manage teacher accounts">
      {msg && <div className="alert alert-success">{msg}</div>}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add Teacher</button>
      </div>
      {loading ? <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" /></div> : (
        <div className="grid-auto">
          {teachers.map(t => (
            <div key={t.id} className="card" style={{ textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #06b6d4, #0891b2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: 'white', fontWeight: 800, margin: '0 auto 12px' }}>{t.name?.[0]}</div>
              <h3 style={{ fontWeight: 700, fontSize: 16 }}>{t.name}</h3>
              <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 4 }}>{t.email}</p>
              {t.subject && <span className="badge badge-cyan" style={{ marginTop: 8 }}>{t.subject}</span>}
              {t.bio && <p style={{ fontSize: 12, color: 'var(--text2)', marginTop: 10, lineHeight: 1.5 }}>{t.bio}</p>}
              <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
                <button className="btn btn-danger btn-sm w-full" onClick={() => deleteTeacher(t.id)}>🗑 Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <div className="modal">
            <div className="modal-header"><h2>Add Teacher</h2><button className="modal-close" onClick={() => setShowAdd(false)}>×</button></div>
            <form onSubmit={addTeacher}>
              <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required /></div>
              <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required /></div>
              <div className="form-group"><label className="form-label">Password</label><input className="form-input" type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required /></div>
              <div className="form-group"><label className="form-label">Subject</label><input className="form-input" placeholder="e.g. Mathematics" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} /></div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-primary" type="submit" style={{ flex: 1 }}>➕ Add Teacher</button>
                <button className="btn btn-outline" type="button" onClick={() => setShowAdd(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

// ---- ADMIN COURSES ----
export function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => { coursesApi.getAll().then(r => setCourses(r.data)).finally(() => setLoading(false)); }, []);

  const deleteCourse = async (id) => {
    if (!window.confirm('Delete this course?')) return;
    await coursesApi.delete(id);
    setCourses(prev => prev.filter(c => c.id !== id));
    setMsg('Course deleted'); setTimeout(() => setMsg(''), 3000);
  };

  return (
    <Layout title="All Courses" subtitle="View and manage all platform courses">
      {msg && <div className="alert alert-success">{msg}</div>}
      {loading ? <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" /></div> : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Course</th><th>Teacher</th><th>Category</th><th>Level</th><th>Students</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {courses.map(c => (
                <tr key={c.id}>
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontSize: 20 }}>{c.thumbnail}</span><div><div style={{ fontWeight: 600, fontSize: 14 }}>{c.title}</div><div style={{ fontSize: 12, color: 'var(--text2)' }}>{c.duration}</div></div></div></td>
                  <td style={{ fontSize: 13 }}>{c.teacherName}</td>
                  <td><span className="badge badge-cyan">{c.category}</span></td>
                  <td><span className={`badge ${c.level === 'Beginner' ? 'badge-green' : c.level === 'Intermediate' ? 'badge-amber' : 'badge-rose'}`}>{c.level}</span></td>
                  <td><span className="badge badge-purple">{c.studentsCount}</span></td>
                  <td><span className="badge badge-green">{c.status}</span></td>
                  <td><button className="btn btn-danger btn-sm" onClick={() => deleteCourse(c.id)}>🗑 Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}

// ---- ADMIN ENROLLMENTS ----
export function AdminEnrollments() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { coursesApi.getAll().then(r => setCourses(r.data)).finally(() => setLoading(false)); }, []);

  return (
    <Layout title="Enrollments" subtitle="View all course enrollments across the platform">
      {loading ? <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" /></div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {courses.map(c => (
            <div key={c.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <span style={{ fontSize: 36, flexShrink: 0 }}>{c.thumbnail}</span>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>{c.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 3 }}>by {c.teacherName} • {c.category} • {c.level}</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--primary)' }}>{c.studentsCount}</div>
                <div style={{ fontSize: 12, color: 'var(--text2)' }}>Students</div>
              </div>
              <div style={{ width: 100 }}>
                <div className="progress-bar-wrap"><div className="progress-bar" style={{ width: `${Math.min((c.studentsCount / 20) * 100, 100)}%` }} /></div>
                <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 4 }}>of 20 cap</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}

// ---- ADMIN NOTIFICATIONS ----
export function AdminNotifications() {
  const [form, setForm] = useState({ title: '', message: '' });
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => { notifApi.getAll().then(r => setNotifs(r.data)).finally(() => setLoading(false)); }, []);

  const send = async (e) => {
    e.preventDefault(); setSending(true);
    try {
      await notifApi.send(form);
      setForm({ title: '', message: '' });
      setMsg('Announcement sent to all users!'); setTimeout(() => setMsg(''), 3000);
    } finally { setSending(false); }
  };

  return (
    <Layout title="Notifications" subtitle="Send platform-wide announcements">
      {msg && <div className="alert alert-success">{msg}</div>}
      <div className="grid-2">
        <div className="card">
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>📢 Send Announcement</h2>
          <form onSubmit={send}>
            <div className="form-group"><label className="form-label">Title</label><input className="form-input" placeholder="Announcement title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required /></div>
            <div className="form-group"><label className="form-label">Message</label><textarea className="form-textarea" placeholder="Write your platform announcement..." value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} required style={{ minHeight: 120 }} /></div>
            <div style={{ padding: 12, background: 'var(--accent-light)', borderRadius: 10, fontSize: 13, marginBottom: 16 }}>📢 This announcement will be sent to all students</div>
            <button className="btn btn-primary w-full" type="submit" disabled={sending}>{sending ? '⏳ Sending...' : '🚀 Send to All Students'}</button>
          </form>
        </div>
        <div className="card">
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>🔔 My Notifications</h2>
          {loading ? <div className="spinner" /> :
            notifs.length === 0 ? <div className="empty-state"><div className="emoji">🔔</div><h3>No notifications</h3></div> :
            notifs.slice(0, 10).map(n => (
              <div key={n.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{n.title}</div>
                <div style={{ fontSize: 13, color: 'var(--text2)' }}>{n.message}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>{new Date(n.createdAt).toLocaleString()}</div>
              </div>
            ))
          }
        </div>
      </div>
    </Layout>
  );
}

// ---- ADMIN ADMINS ----
export function AdminAdmins() {
  const { user } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { adminApi.users().then(r => setAdmins(r.data.filter(u => u.role === 'admin'))).finally(() => setLoading(false)); }, []);

  return (
    <Layout title="Admin Details" subtitle="View all platform administrators (admin-only view)">
      {loading ? <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" /></div> : (
        <>
          <div className="alert alert-info" style={{ marginBottom: 24 }}>🛡️ This section is visible to administrators only. Sensitive admin information is protected.</div>
          <div className="grid-auto">
            {admins.map(a => (
              <div key={a.id} className="card" style={{ textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #6d28d9, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: 'white', fontWeight: 800, margin: '0 auto 12px' }}>{a.name?.[0]}</div>
                <h3 style={{ fontWeight: 700, fontSize: 16 }}>{a.name}</h3>
                <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 4 }}>{a.email}</p>
                <span className="badge badge-purple" style={{ marginTop: 8 }}>Administrator</span>
                {a.department && <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 8 }}>{a.department}</p>}
                <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 8 }}>Joined: {new Date(a.createdAt).toLocaleDateString()}</p>
                {a.id === user.id && <div style={{ marginTop: 10 }}><span className="badge badge-green">You</span></div>}
              </div>
            ))}
          </div>
        </>
      )}
    </Layout>
  );
}

// ---- ADMIN PROFILE ----
export function AdminProfile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', department: user?.department || '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const save = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const r = await authApi.updateProfile(form);
      updateUser(r.data); setMsg('Profile updated!'); setTimeout(() => setMsg(''), 3000);
    } catch { setMsg('Update failed'); } finally { setSaving(false); }
  };

  return (
    <Layout title="Admin Profile">
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        {msg && <div className={`alert ${msg.includes('updated') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}
        <div className="card" style={{ marginBottom: 20, textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #6d28d9, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, color: 'white', fontWeight: 800, margin: '0 auto 16px' }}>{user?.name?.[0]}</div>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>{user?.name}</h2>
          <p style={{ color: 'var(--text2)', marginTop: 4 }}>{user?.email}</p>
          <span className="badge badge-purple" style={{ marginTop: 8 }}>Administrator</span>
        </div>
        <div className="card">
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Edit Profile</h2>
          <form onSubmit={save}>
            <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Department</label><input className="form-input" value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Email (read-only)</label><input className="form-input" value={user?.email} disabled style={{ opacity: 0.6 }} /></div>
            <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? '⏳...' : '💾 Save Changes'}</button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
