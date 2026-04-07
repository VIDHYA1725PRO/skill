import React, { useState, useEffect, useRef } from 'react';
import Layout from '../../components/layout/Layout';
import { quizzes as quizApi } from '../../utils/api';

function QuizAttempt({ quiz, onDone }) {
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(quiz.duration * 60);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef(null);
  const startRef = useRef(Date.now());

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); handleSubmit(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const handleSubmit = async (auto = false) => {
    clearInterval(timerRef.current);
    if (submitting || submitted) return;
    setSubmitting(true);
    try {
      const ansArr = quiz.questions.map((_, i) => answers[i] ?? -1);
      const timeTaken = Math.round((Date.now() - startRef.current) / 1000);
      const r = await quizApi.attempt(quiz.id, { answers: ansArr, timeTaken });
      setResult(r.data);
      setSubmitted(true);
    } catch (e) {
      alert(e.response?.data?.message || 'Error submitting');
    } finally { setSubmitting(false); }
  };

  const fmt = (s) => `${Math.floor(s / 60).toString().padStart(2,'0')}:${(s % 60).toString().padStart(2,'0')}`;
  const pct = timeLeft / (quiz.duration * 60);

  if (submitted && result) {
    return (
      <div className="modal-overlay">
        <div className="modal modal-lg">
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 64 }}>{result.percentage >= 70 ? '🎉' : result.percentage >= 50 ? '👍' : '😔'}</div>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginTop: 8 }}>Quiz Complete!</h2>
            <div style={{ fontSize: 48, fontWeight: 900, color: result.percentage >= 70 ? 'var(--green)' : result.percentage >= 50 ? 'var(--accent)' : 'var(--rose)', marginTop: 8 }}>{result.percentage}%</div>
            <div style={{ color: 'var(--text2)', fontSize: 16, marginTop: 4 }}>Score: {result.score}/{result.total}</div>
          </div>
          <div>
            {result.detailed.map((d, i) => (
              <div key={i} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>Q{i + 1}. {d.question}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span className={`badge ${d.isCorrect ? 'badge-green' : 'badge-rose'}`}>{d.isCorrect ? '✓ Correct' : '✗ Wrong'}</span>
                  {!d.isCorrect && <span style={{ fontSize: 13, color: 'var(--text2)' }}>Correct: Option {d.correct + 1}</span>}
                  <span style={{ fontSize: 13, color: 'var(--text2)' }}>+{d.isCorrect ? d.points : 0} pts</span>
                </div>
              </div>
            ))}
          </div>
          <button className="btn btn-primary w-full" style={{ marginTop: 24 }} onClick={onDone}>Done</button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal modal-xl" style={{ maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexShrink: 0 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>{quiz.title}</h2>
            <div style={{ fontSize: 13, color: 'var(--text2)' }}>{quiz.questions.length} questions • {Object.keys(answers).length} answered</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: pct < 0.25 ? 'var(--rose)' : pct < 0.5 ? 'var(--accent)' : 'var(--green)', fontVariantNumeric: 'tabular-nums' }}>{fmt(timeLeft)}</div>
            <div style={{ fontSize: 11, color: 'var(--text2)' }}>Time Left</div>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4 }}>
          {quiz.questions.map((q, qi) => (
            <div key={qi} style={{ marginBottom: 24, padding: 20, background: 'var(--bg)', borderRadius: 14, border: answers[qi] !== undefined ? '2px solid var(--primary)' : '2px solid transparent' }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Q{qi + 1}. {q.question} <span style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 400 }}>({q.points || 10} pts)</span></div>
              {q.options.map((opt, oi) => (
                <div key={oi} className={`quiz-option ${answers[qi] === oi ? 'selected' : ''}`}
                  onClick={() => setAnswers(prev => ({ ...prev, [qi]: oi }))}>
                  <span style={{ fontWeight: 700, marginRight: 10, color: 'var(--primary)' }}>{String.fromCharCode(65 + oi)}.</span>
                  {opt}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ flexShrink: 0, paddingTop: 16, borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => handleSubmit(false)} disabled={submitting}>
            {submitting ? '⏳ Submitting...' : '✅ Submit Quiz'}
          </button>
          <div style={{ fontSize: 13, color: 'var(--text2)', display: 'flex', alignItems: 'center' }}>{Object.keys(answers).length}/{quiz.questions.length} answered</div>
        </div>
      </div>
    </div>
  );
}

export default function StudentQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);
  const [fullQuiz, setFullQuiz] = useState(null);

  useEffect(() => { quizApi.getAll().then(r => setQuizzes(r.data)).finally(() => setLoading(false)); }, []);

  const startQuiz = async (quiz) => {
    const r = await quizApi.getOne(quiz.id);
    setFullQuiz(r.data);
    setActive(quiz);
  };

  const onDone = () => {
    setActive(null); setFullQuiz(null);
    quizApi.getAll().then(r => setQuizzes(r.data));
  };

  return (
    <Layout title="Quizzes" subtitle="Test your knowledge and track your scores">
      {loading ? <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" /></div> :
        quizzes.length === 0 ? (
          <div className="empty-state"><div className="emoji">🧠</div><h3>No quizzes available</h3><p>Enroll in courses to access quizzes</p></div>
        ) : (
          <div className="grid-auto">
            {quizzes.map(q => (
              <div key={q.id} className="card" style={{ transition: 'transform 0.2s, box-shadow 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = ''}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>🧠</div>
                  {q.attempt ? (
                    <span className="badge badge-green" style={{ height: 'fit-content' }}>✓ Completed</span>
                  ) : (
                    <span className="badge badge-purple" style={{ height: 'fit-content' }}>Available</span>
                  )}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{q.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 12 }}>📚 {q.courseName}</p>
                <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--text2)', marginBottom: 16 }}>
                  <span>⏱ {q.duration} min</span>
                  <span>❓ {q.questionsCount} questions</span>
                </div>
                {q.attempt ? (
                  <div style={{ padding: '12px 16px', background: 'var(--green-light)', borderRadius: 10, textAlign: 'center' }}>
                    <div style={{ fontWeight: 800, fontSize: 20, color: '#059669' }}>{q.attempt.percentage}%</div>
                    <div style={{ fontSize: 12, color: '#065f46' }}>{q.attempt.score}/{q.attempt.total} points</div>
                  </div>
                ) : (
                  <button className="btn btn-primary w-full" onClick={() => startQuiz(q)}>🚀 Start Quiz</button>
                )}
              </div>
            ))}
          </div>
        )
      }
      {active && fullQuiz && <QuizAttempt quiz={fullQuiz} onDone={onDone} />}
    </Layout>
  );
}
