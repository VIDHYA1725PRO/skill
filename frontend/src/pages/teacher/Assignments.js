import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { assignments as assignApi, courses as coursesApi } from '../../utils/api';

export default function TeacherAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', courseId: '', deadline: '', maxScore: 100 });
  const [submissionsModal, setSubmissionsModal] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [grading, setGrading] = useState(null);
  const [gradeForm, setGradeForm] = useState({ grade: '', feedback: '' });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    Promise.all([assignApi.getAll(), coursesApi.teacherCourses()])
      .then(([a, c]) => { setAssignments(a.data); setCourses(c.data); })
      .finally(() => setLoading(false));
  }, []);

  const create = async (e) => {
    e.preventDefault();
    const r = await assignApi.create(form);
    setAssignments(prev => [...prev, { ...r.data, courseName: courses.find(c => c.id === form.courseId)?.title, submissionCount: 0 }]);
    setShowCreate(false); setForm({ title: '', description: '', courseId: '', deadline: '', maxScore: 100 });
    setMsg('Assignment created!'); setTimeout(() => setMsg(''), 3000);
  };

  const viewSubmissions = async (a) => {
    setSubmissionsModal(a);
    const r = await assignApi.submissions(a.id);
    setSubmissions(r.data);
  };

  const submitGrade = async (e) => {
    e.preventDefault();
    await assignApi.grade(grading.id, gradeForm);
    setSubmissions(prev => prev.map(s => s.id === grading.id ? { ...s, grade: gradeForm.grade, feedback: gradeForm.feedback } : s));
    setGrading(null); setGradeForm({ grade: '', feedback: '' });
    setMsg('Graded!'); setTimeout(() => setMsg(''), 3000);
  };

  const deleteAssign = async (id) => {
    if (!window.confirm('Delete this assignment?')) return;
    await assignApi.delete(id);
    setAssignments(prev => prev.filter(a => a.id !== id));
  };

  const getDiff = (dl) => {
    const diff = Math.ceil((new Date(dl) - new Date()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return { label: 'Overdue', color: 'var(--rose)' };
    if (diff === 0) return { label: 'Due Today', color: 'var(--rose)' };
    if (diff <= 3) return { label: `${diff}d left`, color: 'var(--accent)' };
    return { label: `${diff}d left`, color: 'var(--green)' };
  };

  return (
    <Layout title="Assignments" subtitle="Create assignments and review student submissions">
      {msg && <div className="alert alert-success">{msg}</div>}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New Assignment</button>
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" /></div> :
        assignments.length === 0 ? <div className="empty-state"><div className="emoji">📝</div><h3>No assignments yet</h3></div> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {assignments.map(a => {
              const diff = getDiff(a.deadline);
              return (
                <div key={a.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>📝</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                      <div>
                        <h3 style={{ fontSize: 16, fontWeight: 700 }}>{a.title}</h3>
                        <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2 }}>📚 {a.courseName} &nbsp;•&nbsp; Max: {a.maxScore} pts</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontWeight: 700, color: diff.color, fontSize: 14 }}>{diff.label}</span>
                        <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>{new Date(a.deadline).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text)', marginTop: 8 }}>{a.description}</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => viewSubmissions(a)}>
                      📄 {a.submissionCount || 0} Submissions
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteAssign(a.id)}>🗑 Delete</button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      }

      {/* Create Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowCreate(false)}>
          <div className="modal modal-lg">
            <div className="modal-header"><h2>Create Assignment</h2><button className="modal-close" onClick={() => setShowCreate(false)}>×</button></div>
            <form onSubmit={create}>
              <div className="form-group">
                <label className="form-label">Course</label>
                <select className="form-select" value={form.courseId} onChange={e => setForm(p => ({ ...p, courseId: e.target.value }))} required>
                  <option value="">Select course...</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Assignment Title</label>
                <input className="form-input" placeholder="e.g. Chapter 3 Problem Set" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" placeholder="Describe the assignment..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} required />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Deadline</label>
                  <input className="form-input" type="datetime-local" value={form.deadline} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Maximum Score</label>
                  <input className="form-input" type="number" value={form.maxScore} onChange={e => setForm(p => ({ ...p, maxScore: e.target.value }))} min="1" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-primary" type="submit" style={{ flex: 1 }}>✨ Create Assignment</button>
                <button className="btn btn-outline" type="button" onClick={() => setShowCreate(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submissions Modal */}
      {submissionsModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setSubmissionsModal(null)}>
          <div className="modal modal-xl">
            <div className="modal-header">
              <h2>Submissions — {submissionsModal.title}</h2>
              <button className="modal-close" onClick={() => setSubmissionsModal(null)}>×</button>
            </div>
            {submissions.length === 0 ? <div className="empty-state"><div className="emoji">📭</div><h3>No submissions yet</h3></div> :
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Student</th><th>File</th><th>Submitted</th><th>Grade</th><th>Action</th></tr></thead>
                  <tbody>
                    {submissions.map(s => (
                      <tr key={s.id}>
                        <td><strong>{s.studentName}</strong></td>
                        <td>
                          <div style={{ fontSize: 13 }}>📄 {s.fileName}</div>
                          {s.note && <div style={{ fontSize: 12, color: 'var(--text2)' }}>Note: {s.note}</div>}
                        </td>
                        <td>{new Date(s.submittedAt).toLocaleDateString()}</td>
                        <td>
                          {s.grade !== null ? (
                            <div>
                              <span className="badge badge-green">{s.grade}/{submissionsModal.maxScore}</span>
                              {s.feedback && <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>{s.feedback}</div>}
                            </div>
                          ) : <span className="badge badge-amber">Not graded</span>}
                        </td>
                        <td>
                          <button className="btn btn-sm btn-secondary" onClick={() => { setGrading(s); setGradeForm({ grade: s.grade || '', feedback: s.feedback || '' }); }}>
                            ✏️ {s.grade !== null ? 'Re-grade' : 'Grade'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            }
          </div>
        </div>
      )}

      {/* Grade Modal */}
      {grading && (
        <div className="modal-overlay" style={{ zIndex: 1100 }} onClick={e => e.target === e.currentTarget && setGrading(null)}>
          <div className="modal">
            <div className="modal-header"><h2>Grade Submission</h2><button className="modal-close" onClick={() => setGrading(null)}>×</button></div>
            <div style={{ marginBottom: 16, padding: 14, background: 'var(--bg)', borderRadius: 10 }}>
              <div style={{ fontWeight: 600 }}>{grading.studentName}</div>
              <div style={{ fontSize: 13, color: 'var(--text2)' }}>📄 {grading.fileName}</div>
              {grading.note && <div style={{ fontSize: 13, marginTop: 6 }}>Note: {grading.note}</div>}
            </div>
            <form onSubmit={submitGrade}>
              <div className="form-group">
                <label className="form-label">Grade (out of {submissionsModal?.maxScore})</label>
                <input className="form-input" type="number" min="0" max={submissionsModal?.maxScore} value={gradeForm.grade} onChange={e => setGradeForm(p => ({ ...p, grade: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Feedback</label>
                <textarea className="form-textarea" placeholder="Provide feedback to the student..." value={gradeForm.feedback} onChange={e => setGradeForm(p => ({ ...p, feedback: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-primary" type="submit" style={{ flex: 1 }}>✅ Submit Grade</button>
                <button className="btn btn-outline" type="button" onClick={() => setGrading(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
