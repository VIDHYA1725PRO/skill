import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { quizzes as quizApi, courses as coursesApi } from '../../utils/api';

const emptyQ = () => ({ question: '', options: ['', '', '', ''], correct: 0, points: 10 });

export default function TeacherQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', courseId: '', duration: 30, startTime: '' });
  const [questions, setQuestions] = useState([emptyQ()]);
  const [attemptsModal, setAttemptsModal] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    Promise.all([quizApi.getAll(), coursesApi.teacherCourses()])
      .then(([q, c]) => { setQuizzes(q.data); setCourses(c.data); })
      .finally(() => setLoading(false));
  }, []);

  const addQ = () => setQuestions(prev => [...prev, emptyQ()]);
  const removeQ = (i) => setQuestions(prev => prev.filter((_, idx) => idx !== i));
  const updateQ = (i, field, val) => setQuestions(prev => prev.map((q, idx) => idx === i ? { ...q, [field]: val } : q));
  const updateOpt = (qi, oi, val) => setQuestions(prev => prev.map((q, idx) => idx === qi ? { ...q, options: q.options.map((o, i) => i === oi ? val : o) } : q));

  const create = async (e) => {
    e.preventDefault();
    if (questions.some(q => !q.question || q.options.some(o => !o))) return setMsg('Please fill all question fields');
    const r = await quizApi.create({ ...form, questions });
    setQuizzes(prev => [...prev, { ...r.data, courseName: courses.find(c => c.id === form.courseId)?.title, questionsCount: questions.length }]);
    setShowCreate(false); setForm({ title: '', courseId: '', duration: 30, startTime: '' }); setQuestions([emptyQ()]);
    setMsg('Quiz created!'); setTimeout(() => setMsg(''), 3000);
  };

  const deleteQuiz = async (id) => {
    if (!window.confirm('Delete this quiz?')) return;
    await quizApi.delete(id);
    setQuizzes(prev => prev.filter(q => q.id !== id));
  };

  const viewAttempts = async (quiz) => {
    setAttemptsModal(quiz);
    const r = await quizApi.attempts(quiz.id);
    setAttempts(r.data);
  };

  return (
    <Layout title="Quizzes" subtitle="Create quizzes and view student performance">
      {msg && <div className={`alert ${msg.includes('created') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Create Quiz</button>
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" /></div> :
        quizzes.length === 0 ? <div className="empty-state"><div className="emoji">🧠</div><h3>No quizzes yet</h3></div> : (
          <div className="grid-auto">
            {quizzes.map(q => (
              <div key={q.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🧠</div>
                  <span className="badge badge-cyan">{q.questionsCount} Questions</span>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{q.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 12 }}>📚 {q.courseName}</p>
                <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16 }}>
                  <div>⏱ {q.duration} minutes</div>
                  {q.startTime && <div style={{ marginTop: 4 }}>📅 {new Date(q.startTime).toLocaleString()}</div>}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => viewAttempts(q)}>📊 Results</button>
                  <button className="btn btn-danger btn-sm" onClick={() => deleteQuiz(q.id)}>🗑</button>
                </div>
              </div>
            ))}
          </div>
        )
      }

      {/* Create Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowCreate(false)}>
          <div className="modal modal-xl" style={{ maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header" style={{ flexShrink: 0 }}>
              <h2>Create Quiz</h2>
              <button className="modal-close" onClick={() => setShowCreate(false)}>×</button>
            </div>
            <form onSubmit={create} style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 0 }}>
              <div style={{ padding: '0 0 16px' }}>
                <div className="grid-2" style={{ marginBottom: 0 }}>
                  <div className="form-group">
                    <label className="form-label">Quiz Title</label>
                    <input className="form-input" placeholder="e.g. Midterm Quiz" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Course</label>
                    <select className="form-select" value={form.courseId} onChange={e => setForm(p => ({ ...p, courseId: e.target.value }))} required>
                      <option value="">Select...</option>
                      {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Duration (minutes)</label>
                    <input className="form-input" type="number" min="1" value={form.duration} onChange={e => setForm(p => ({ ...p, duration: Number(e.target.value) }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Start Time</label>
                    <input className="form-input" type="datetime-local" value={form.startTime} onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))} />
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '2px solid var(--border)', paddingTop: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ fontWeight: 700 }}>Questions ({questions.length})</h3>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={addQ}>+ Add Question</button>
                </div>
                {questions.map((q, qi) => (
                  <div key={qi} style={{ marginBottom: 20, padding: 18, background: 'var(--bg)', borderRadius: 14, border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                      <span style={{ fontWeight: 700, color: 'var(--primary)' }}>Q{qi + 1}</span>
                      {questions.length > 1 && <button type="button" onClick={() => removeQ(qi)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--rose)', fontSize: 18 }}>×</button>}
                    </div>
                    <input className="form-input" placeholder="Question text" value={q.question} onChange={e => updateQ(qi, 'question', e.target.value)} required style={{ marginBottom: 10 }} />
                    <div className="grid-2">
                      {q.options.map((opt, oi) => (
                        <div key={oi} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                          <input type="radio" name={`correct-${qi}`} checked={q.correct === oi} onChange={() => updateQ(qi, 'correct', oi)} style={{ accentColor: 'var(--primary)', flexShrink: 0 }} />
                          <input className="form-input" placeholder={`Option ${String.fromCharCode(65 + oi)}`} value={opt} onChange={e => updateOpt(qi, oi, e.target.value)} required style={{ margin: 0 }} />
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 6 }}>
                      <label className="form-label" style={{ margin: 0 }}>Points:</label>
                      <input className="form-input" type="number" min="1" value={q.points} onChange={e => updateQ(qi, 'points', Number(e.target.value))} style={{ width: 80, margin: 0 }} />
                      <span style={{ fontSize: 12, color: 'var(--text2)' }}>✓ = correct answer (select radio)</span>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10, paddingTop: 16 }}>
                <button className="btn btn-primary" type="submit" style={{ flex: 1 }}>✨ Create Quiz</button>
                <button className="btn btn-outline" type="button" onClick={() => setShowCreate(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Attempts Modal */}
      {attemptsModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setAttemptsModal(null)}>
          <div className="modal modal-lg">
            <div className="modal-header">
              <h2>Results — {attemptsModal.title}</h2>
              <button className="modal-close" onClick={() => setAttemptsModal(null)}>×</button>
            </div>
            {attempts.length === 0 ? <div className="empty-state"><div className="emoji">📊</div><h3>No attempts yet</h3></div> : (
              <>
                <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                  <div className="stat-card" style={{ flex: 1 }}>
                    <div className="stat-icon" style={{ background: 'var(--primary-light)' }}>👥</div>
                    <div className="stat-info"><h3>{attempts.length}</h3><p>Attempts</p></div>
                  </div>
                  <div className="stat-card" style={{ flex: 1 }}>
                    <div className="stat-icon" style={{ background: 'var(--green-light)' }}>⭐</div>
                    <div className="stat-info"><h3>{Math.round(attempts.reduce((s, a) => s + a.percentage, 0) / attempts.length)}%</h3><p>Avg Score</p></div>
                  </div>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Student</th><th>Score</th><th>Percentage</th><th>Time</th><th>Submitted</th></tr></thead>
                    <tbody>
                      {attempts.map(a => (
                        <tr key={a.id}>
                          <td><strong>{a.studentName}</strong></td>
                          <td>{a.score}/{a.total}</td>
                          <td><span className={`badge ${a.percentage >= 70 ? 'badge-green' : a.percentage >= 50 ? 'badge-amber' : 'badge-rose'}`}>{a.percentage}%</span></td>
                          <td>{Math.floor(a.timeTaken / 60)}m {a.timeTaken % 60}s</td>
                          <td>{new Date(a.submittedAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}
