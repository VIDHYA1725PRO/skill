import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { courses as coursesApi, certificates as certApi, messages as msgApi, notifications as notifApi, teachers } from '../../utils/api';
import { auth as authApi } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

// ---- TEACHER STUDENTS ----
export function TeacherStudents() {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { coursesApi.teacherCourses().then(r => { setCourses(r.data); if (r.data.length) { setSelectedCourse(r.data[0].id); loadStudents(r.data[0].id); } }).finally(() => setLoading(false)); }, []);

  const loadStudents = async (courseId) => {
    const r = await coursesApi.students(courseId);
    setStudents(r.data);
  };

  const handleCourseChange = (id) => { setSelectedCourse(id); loadStudents(id); };

  return (
    <Layout title="My Students" subtitle="View students enrolled in your courses">
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        {courses.map(c => (
          <button key={c.id} onClick={() => handleCourseChange(c.id)}
            className={`btn btn-sm ${selectedCourse === c.id ? 'btn-primary' : 'btn-outline'}`}>
            {c.thumbnail} {c.title}
          </button>
        ))}
      </div>
      {loading ? <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" /></div> :
        students.length === 0 ? <div className="empty-state"><div className="emoji">👥</div><h3>No students enrolled</h3></div> : (
          <div className="grid-auto">
            {students.map(s => (
              <div key={s.id} className="card" style={{ textAlign: 'center' }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 22, fontWeight: 800, margin: '0 auto 12px' }}>{s.name?.[0]}</div>
                <h3 style={{ fontSize: 15, fontWeight: 700 }}>{s.name}</h3>
                <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 4 }}>{s.email}</p>
                <div style={{ marginTop: 10, display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
                  {s.grade && <span className="badge badge-purple">{s.grade}</span>}
                  <span className="badge badge-cyan">{s.progress}% progress</span>
                </div>
                <div style={{ marginTop: 12 }}>
                  <div className="progress-bar-wrap"><div className="progress-bar" style={{ width: `${s.progress}%` }} /></div>
                </div>
                <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 8 }}>Enrolled: {new Date(s.enrolledAt).toLocaleDateString()}</p>
                {s.certificates && s.certificates.length > 0 && (
                  <div style={{ marginTop: 8 }}><span className="badge badge-green">🏆 {s.certificates.length} certificate(s)</span></div>
                )}
              </div>
            ))}
          </div>
        )
      }
    </Layout>
  );
}

// ---- TEACHER CERTIFICATES ----
export function TeacherCertificates() {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => { certApi.getAll().then(r => setCerts(r.data)).finally(() => setLoading(false)); }, []);

  const verify = async (id) => {
    await certApi.verify(id);
    setCerts(prev => prev.map(c => c.id === id ? { ...c, verified: true } : c));
    setMsg('Certificate verified!'); setTimeout(() => setMsg(''), 3000);
  };

  return (
    <Layout title="Student Certificates" subtitle="Review and verify student-uploaded certificates">
      {msg && <div className="alert alert-success">{msg}</div>}
      {loading ? <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" /></div> :
        certs.length === 0 ? <div className="empty-state"><div className="emoji">🏆</div><h3>No certificates to review</h3></div> : (
          <div className="grid-auto">
            {certs.map(c => (
              <div key={c.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ fontSize: 36 }}>🏆</div>
                  {c.verified ? <span className="badge badge-green">✓ Verified</span> : <span className="badge badge-amber">Pending</span>}
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700 }}>{c.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 4 }}>By: {c.issuer}</p>
                <div style={{ marginTop: 10, padding: '8px 12px', background: 'var(--bg)', borderRadius: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>👩‍🎓 {c.studentName}</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>📄 {c.fileName}</div>
                </div>
                <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 8 }}>Uploaded: {new Date(c.uploadedAt).toLocaleDateString()}</p>
                {!c.verified && (
                  <button className="btn btn-green btn-sm w-full" style={{ marginTop: 12 }} onClick={() => verify(c.id)}>✅ Verify Certificate</button>
                )}
              </div>
            ))}
          </div>
        )
      }
    </Layout>
  );
}

// ---- TEACHER MESSAGES ----
export function TeacherMessages() {
  const { user } = useAuth();
  const [msgs, setMsgs] = useState([]);
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);
  const avatarColors = ['#8b5cf6', '#06b6d4', '#f59e0b', '#10b981', '#f43f5e'];
  const getColor = (name) => avatarColors[name?.charCodeAt(0) % avatarColors.length];

  useEffect(() => { msgApi.getAll().then(r => setMsgs(r.data)).finally(() => setLoading(false)); }, []);

  const selectMsg = async (msg) => {
    setSelected(msg);
    if (!msg.read && msg.receiverId === user.id) {
      await msgApi.markRead(msg.id);
      setMsgs(prev => prev.map(m => m.id === msg.id ? { ...m, read: true } : m));
    }
  };

  const sendReply = async (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    const r = await msgApi.reply(selected.id, { content: reply });
    setMsgs(prev => prev.map(m => m.id === selected.id ? r.data : m));
    setSelected(r.data); setReply('');
  };

  const receivedMsgs = msgs.filter(m => m.receiverId === user.id);

  return (
    <Layout title="Messages" subtitle="Student questions and doubt clarifications">
      <div style={{ display: 'flex', gap: 20, height: 'calc(100vh - 200px)', minHeight: 500 }}>
        <div style={{ width: 300, flexShrink: 0 }}>
          <div className="card" style={{ padding: 0, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: 14 }}>Student Messages ({receivedMsgs.filter(m => !m.read).length} unread)</div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {loading ? <div style={{ padding: 20, textAlign: 'center' }}><div className="spinner" /></div> :
                receivedMsgs.length === 0 ? <div style={{ padding: 20, textAlign: 'center', color: 'var(--text2)', fontSize: 13 }}>No messages</div> :
                receivedMsgs.map(m => {
                  const unread = !m.read;
                  return (
                    <div key={m.id} onClick={() => selectMsg(m)}
                      style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', cursor: 'pointer', background: selected?.id === m.id ? 'var(--primary-light)' : unread ? '#fdf4ff' : 'white' }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: getColor(m.senderName), display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 13 }}>{m.senderName?.[0]}</div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                          <div style={{ fontWeight: unread ? 700 : 500, fontSize: 13 }}>{m.senderName}</div>
                          <div style={{ fontSize: 12, color: 'var(--text2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.subject}</div>
                        </div>
                        {unread && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0 }} />}
                      </div>
                    </div>
                  );
                })
              }
            </div>
          </div>
        </div>
        <div className="card" style={{ flex: 1, padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {!selected ? (
            <div className="empty-state" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div className="emoji">💬</div><h3>Select a conversation</h3>
            </div>
          ) : (
            <>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: getColor(selected.senderName), display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>{selected.senderName?.[0]}</div>
                <div><div style={{ fontWeight: 700, fontSize: 15 }}>{selected.senderName}</div><div style={{ fontSize: 12, color: 'var(--text2)' }}>{selected.subject}</div></div>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <div className="msg-bubble msg-received">{selected.content}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>{selected.senderName} • {new Date(selected.createdAt).toLocaleString()}</div>
                </div>
                {(selected.replies || []).map(r => (
                  <div key={r.id} style={{ display: 'flex', flexDirection: 'column', alignItems: r.senderId === user.id ? 'flex-end' : 'flex-start' }}>
                    <div className={`msg-bubble ${r.senderId === user.id ? 'msg-sent' : 'msg-received'}`}>{r.content}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>{r.senderName} • {new Date(r.createdAt).toLocaleString()}</div>
                  </div>
                ))}
              </div>
              <form onSubmit={sendReply} style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
                <input className="form-input" placeholder="Reply to student..." value={reply} onChange={e => setReply(e.target.value)} style={{ margin: 0, flex: 1 }} />
                <button className="btn btn-primary" type="submit">Send Reply</button>
              </form>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}

// ---- TEACHER NOTIFICATIONS ----
export function TeacherNotifications() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSend, setShowSend] = useState(false);
  const [form, setForm] = useState({ title: '', message: '' });

  useEffect(() => { notifApi.getAll().then(r => setNotifs(r.data)).finally(() => setLoading(false)); }, []);

  const markRead = async (id) => { await notifApi.markRead(id); setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n)); };
  const markAll = async () => { await notifApi.markAllRead(); setNotifs(prev => prev.map(n => ({ ...n, read: true }))); };
  const send = async (e) => {
    e.preventDefault();
    await notifApi.send(form);
    setShowSend(false); setForm({ title: '', message: '' });
    alert('Notification sent to all students!');
  };

  const icons = { assignment: '📝', quiz: '🧠', grade: '⭐', enrollment: '📚', message: '💬', submission: '📤', announcement: '📢' };

  return (
    <Layout title="Notifications" subtitle="Your notifications and send announcements to students">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <span style={{ fontWeight: 600 }}>{notifs.filter(n => !n.read).length} unread</span>
          {notifs.some(n => !n.read) && <button className="btn btn-sm btn-secondary" style={{ marginLeft: 12 }} onClick={markAll}>Mark all read</button>}
        </div>
        <button className="btn btn-primary" onClick={() => setShowSend(true)}>📢 Send Announcement</button>
      </div>
      <div className="card" style={{ maxWidth: 700 }}>
        {loading ? <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" /></div> :
          notifs.length === 0 ? <div className="empty-state"><div className="emoji">🔔</div><h3>No notifications</h3></div> :
          notifs.map(n => (
            <div key={n.id} className={`notif-item ${!n.read ? 'unread' : ''}`} onClick={() => !n.read && markRead(n.id)} style={{ borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{icons[n.type] || '🔔'}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: n.read ? 500 : 700, fontSize: 14 }}>{n.title}</div>
                <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2 }}>{n.message}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>From: {n.from} • {new Date(n.createdAt).toLocaleString()}</div>
              </div>
              {!n.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0, marginTop: 4 }} />}
            </div>
          ))
        }
      </div>

      {showSend && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowSend(false)}>
          <div className="modal">
            <div className="modal-header"><h2>Send Announcement</h2><button className="modal-close" onClick={() => setShowSend(false)}>×</button></div>
            <form onSubmit={send}>
              <div className="form-group"><label className="form-label">Title</label><input className="form-input" placeholder="Announcement title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required /></div>
              <div className="form-group"><label className="form-label">Message</label><textarea className="form-textarea" placeholder="Write your announcement..." value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} required /></div>
              <div style={{ marginBottom: 16, padding: 12, background: 'var(--accent-light)', borderRadius: 10, fontSize: 13 }}>📢 This will be sent to all students</div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-primary" type="submit" style={{ flex: 1 }}>Send to All Students</button>
                <button className="btn btn-outline" type="button" onClick={() => setShowSend(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

// ---- TEACHER PROFILE ----
export function TeacherProfile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', subject: user?.subject || '', bio: user?.bio || '' });
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
    <Layout title="My Profile" subtitle="Manage your teacher profile">
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        {msg && <div className={`alert ${msg.includes('updated') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}
        <div className="card" style={{ marginBottom: 20, textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #06b6d4, #0891b2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, color: 'white', fontWeight: 800, margin: '0 auto 16px' }}>{user?.name?.[0]}</div>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>{user?.name}</h2>
          <p style={{ color: 'var(--text2)', marginTop: 4 }}>{user?.email}</p>
          <span className="badge badge-cyan" style={{ marginTop: 8 }}>Teacher • {user?.subject}</span>
        </div>
        <div className="card">
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Edit Profile</h2>
          <form onSubmit={save}>
            <div className="grid-2">
              <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
            </div>
            <div className="form-group"><label className="form-label">Subject</label><input className="form-input" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Bio</label><textarea className="form-textarea" value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Email</label><input className="form-input" value={user?.email} disabled style={{ opacity: 0.6 }} /></div>
            <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? '⏳ Saving...' : '💾 Save Changes'}</button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
