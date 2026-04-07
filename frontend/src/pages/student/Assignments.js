import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { assignments as assignApi } from '../../utils/api';

export default function StudentAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [file, setFile] = useState(null);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
  assignApi.getAll()
    .then(r => {
      console.log("API DATA:", r.data); // 👈 ADD THIS
      setAssignments(r.data);
    })
    .finally(() => setLoading(false));
}, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!file && !note) return setMsg('Please attach a file or add a note.');
    setSubmitting(true);
    try {
      const fd = new FormData();
      if (file) fd.append('file', file);
      fd.append('note', note);
      const r = await assignApi.submit(selected.id, fd);
      setAssignments(prev => prev.map(a => a.id === selected.id ? { ...a, submission: r.data } : a));
      setMsg('Assignment submitted successfully!');
      setSelected(null); setFile(null); setNote('');
    } catch (e) {
      setMsg(e.response?.data?.message || 'Submission failed');
    } finally { setSubmitting(false); setTimeout(() => setMsg(''), 3000); }
  };

  const getDiff = (dl) => {
    const diff = Math.ceil((new Date(dl) - new Date()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return { label: `${Math.abs(diff)}d overdue`, cls: 'deadline-urgent' };
    if (diff === 0) return { label: 'Due today!', cls: 'deadline-urgent' };
    if (diff <= 2) return { label: `${diff}d left`, cls: 'deadline-soon' };
    return { label: `${diff}d left`, cls: 'deadline-ok' };
  };

  const pending = assignments.filter(a => !a.submission);
  const submitted = assignments.filter(a => a.submission);

  return (
    <Layout title="Assignments" subtitle="View, manage, and submit your assignments">
      {msg && <div className={`alert ${msg.includes('success') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}

      {/* Summary */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--rose-light)' }}>📝</div>
          <div className="stat-info"><h3>{pending.length}</h3><p>Pending</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--green-light)' }}>✅</div>
          <div className="stat-info"><h3>{submitted.length}</h3><p>Submitted</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--amber-light)' }}>🏆</div>
          <div className="stat-info">
            <h3>{submitted.filter(a => a.submission?.grade !== null).length}</h3>
            <p>Graded</p>
          </div>
        </div>
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" /></div> :
        assignments.length === 0 ? (
          <div className="empty-state"><div className="emoji">🎉</div><h3>No assignments yet</h3><p>Enroll in courses to receive assignments</p></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {assignments.map(a => {
              const diff = getDiff(a.deadline);
              return (
                <div key={a.id} className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: a.submission ? 'var(--green-light)' : 'var(--rose-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                    {a.submission ? '✅' : '📝'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                      <div>
                        <h3 style={{ fontSize: 16, fontWeight: 700 }}>{a.title}</h3>
                        <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2 }}>📚 {a.courseName} &nbsp;•&nbsp; Max Score: {a.maxScore}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span className={`text-sm font-semibold ${diff.cls}`}>{diff.label}</span>
                        <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>{new Date(a.deadline).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <p style={{ fontSize: 14, color: 'var(--text)', marginTop: 8, lineHeight: 1.5 }}>{a.description}</p>

                    {a.submission ? (
                      <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--green-light)', borderRadius: 10 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#065f46' }}>
                          ✓ Submitted: {a.submission.fileName}
                          {a.submission.grade !== null && <span style={{ marginLeft: 12 }}>| Grade: {a.submission.grade}/{a.maxScore}</span>}
                        </div>
                        {a.submission.feedback && <div style={{ fontSize: 12, marginTop: 4, color: '#065f46' }}>Feedback: {a.submission.feedback}</div>}
                      </div>
                    ) : (
                      <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={() => setSelected(a)}>
                        📤 Submit Assignment
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      }

      {/* Submit Modal */}
      {selected && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div className="modal">
            <div className="modal-header">
              <h2>Submit Assignment</h2>
              <button className="modal-close" onClick={() => setSelected(null)}>×</button>
            </div>
            <div style={{ marginBottom: 16, padding: 14, background: 'var(--bg)', borderRadius: 10 }}>
              <div style={{ fontWeight: 600 }}>{selected.title}</div>
              <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 4 }}>{selected.courseName} • Due: {new Date(selected.deadline).toLocaleDateString()}</div>
            </div>
            <form onSubmit={submit}>
              <div className="form-group">
                <label className="form-label">Upload File (PDF, DOC, ZIP)</label>
                <div className="file-drop" onClick={() => document.getElementById('submit-file').click()}
                  style={{ background: file ? 'var(--green-light)' : undefined }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📎</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{file ? file.name : 'Click to upload file'}</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>Max 10MB</div>
                </div>
                <input id="submit-file" type="file" hidden onChange={e => setFile(e.target.files[0])} />
              </div>
              <div className="form-group">
                <label className="form-label">Additional Notes (optional)</label>
                <textarea className="form-textarea" placeholder="Any notes for your teacher..." value={note} onChange={e => setNote(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-primary" type="submit" disabled={submitting} style={{ flex: 1 }}>
                  {submitting ? '⏳ Submitting...' : '📤 Submit Now'}
                </button>
                <button className="btn btn-outline" type="button" onClick={() => setSelected(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
