import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { courses as coursesApi } from '../../utils/api';

export default function TeacherCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: '', duration: '', level: 'Beginner', tags: '' });
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState('');
  const [selectedStudents, setSelectedStudents] = useState(null);
  const [students, setStudents] = useState([]);

  useEffect(() => { coursesApi.teacherCourses().then(r => setCourses(r.data)).finally(() => setLoading(false)); }, []);

  const create = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const r = await coursesApi.create({ ...form, tags: form.tags.split(',').map(t => t.trim()) });
      setCourses(prev => [...prev, r.data]);
      setShowCreate(false); setForm({ title: '', description: '', category: '', duration: '', level: 'Beginner', tags: '' });
      setMsg('Course created!'); setTimeout(() => setMsg(''), 3000);
    } catch (e) { setMsg('Failed to create'); setTimeout(() => setMsg(''), 3000); }
    finally { setCreating(false); }
  };

  const deleteCourse = async (id) => {
    if (!window.confirm('Delete this course?')) return;
    await coursesApi.delete(id);
    setCourses(prev => prev.filter(c => c.id !== id));
  };

  const viewStudents = async (course) => {
    setSelectedStudents(course);
    const r = await coursesApi.students(course.id);
    setStudents(r.data);
  };

  return (
    <Layout title="My Courses" subtitle="Create and manage your courses">
      {msg && <div className={`alert ${msg.includes('created') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Create Course</button>
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" /></div> :
        courses.length === 0 ? <div className="empty-state"><div className="emoji">📚</div><h3>No courses yet</h3><p>Create your first course!</p></div> : (
          <div className="grid-auto">
            {courses.map(c => (
              <div key={c.id} className="course-card">
                <div className="course-card-header">
                  <div className="course-emoji">{c.thumbnail}</div>
                  <div style={{ marginTop: 8 }}><span className={`badge ${c.level === 'Beginner' ? 'badge-green' : c.level === 'Intermediate' ? 'badge-amber' : 'badge-rose'}`}>{c.level}</span></div>
                </div>
                <div className="course-card-body">
                  <h3>{c.title}</h3>
                  <p>{c.description}</p>
                  <div style={{ marginTop: 10, fontSize: 13, color: 'var(--text2)' }}>
                    <div>📁 {c.category} &nbsp;•&nbsp; ⏱ {c.duration}</div>
                    <div style={{ marginTop: 4 }}>👥 {c.studentsCount} students enrolled</div>
                  </div>
                </div>
                <div className="course-card-footer" style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => viewStudents(c)}>👥 Students</button>
                  <button className="btn btn-danger btn-sm" onClick={() => deleteCourse(c.id)}>🗑</button>
                </div>
              </div>
            ))}
          </div>
        )
      }

      {/* Create Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowCreate(false)}>
          <div className="modal modal-lg">
            <div className="modal-header"><h2>Create New Course</h2><button className="modal-close" onClick={() => setShowCreate(false)}>×</button></div>
            <form onSubmit={create}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Course Title</label>
                  <input className="form-input" placeholder="e.g. Advanced Python" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <input className="form-input" placeholder="e.g. Computer Science" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" placeholder="Describe what students will learn..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} required />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Duration</label>
                  <input className="form-input" placeholder="e.g. 8 weeks" value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Level</label>
                  <select className="form-select" value={form.level} onChange={e => setForm(p => ({ ...p, level: e.target.value }))}>
                    <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Tags (comma-separated)</label>
                <input className="form-input" placeholder="e.g. python, programming, data" value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-primary" type="submit" disabled={creating} style={{ flex: 1 }}>{creating ? '⏳ Creating...' : '✨ Create Course'}</button>
                <button className="btn btn-outline" type="button" onClick={() => setShowCreate(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Students Modal */}
      {selectedStudents && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setSelectedStudents(null)}>
          <div className="modal modal-lg">
            <div className="modal-header">
              <h2>Students in {selectedStudents.title}</h2>
              <button className="modal-close" onClick={() => setSelectedStudents(null)}>×</button>
            </div>
            {students.length === 0 ? <div className="empty-state"><div className="emoji">👥</div><h3>No students enrolled</h3></div> :
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Student</th><th>Email</th><th>Grade</th><th>Progress</th><th>Enrolled</th></tr></thead>
                  <tbody>
                    {students.map(s => (
                      <tr key={s.id}>
                        <td><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 700 }}>{s.name?.[0]}</div>{s.name}</div></td>
                        <td>{s.email}</td>
                        <td>{s.grade || '-'}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div className="progress-bar-wrap" style={{ width: 80 }}><div className="progress-bar" style={{ width: `${s.progress}%` }} /></div>
                            <span style={{ fontSize: 12, fontWeight: 600 }}>{s.progress}%</span>
                          </div>
                        </td>
                        <td>{new Date(s.enrolledAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            }
          </div>
        </div>
      )}
    </Layout>
  );
}
