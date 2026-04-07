import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { useAuth } from '../../context/AuthContext';
import { courses as coursesApi, assignments as assignApi, quizzes as quizApi, messages as msgApi } from '../../utils/api';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      coursesApi.teacherCourses(),
      assignApi.getAll(),
      quizApi.getAll(),
      msgApi.getAll(),
    ]).then(([c, a, q, m]) => {
      setCourses(c.data); setAssignments(a.data); setQuizzes(q.data); setMessages(m.data);
    }).finally(() => setLoading(false));
  }, []);

  const totalStudents = courses.reduce((s, c) => s + (c.studentsCount || 0), 0);
  const pendingSubmissions = assignments.reduce((s, a) => s + (a.submissionCount || 0), 0);
  const unreadMsgs = messages.filter(m => !m.read && m.receiverId === user.id).length;

  if (loading) return <Layout title="Dashboard"><div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" /></div></Layout>;

  return (
    <Layout title={`Hello, ${user?.name?.split(' ')[0]}! 👋`} subtitle="Your teaching overview at a glance">
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--primary-light)' }}>📚</div>
          <div className="stat-info"><h3>{courses.length}</h3><p>My Courses</p><div className="trend">Active</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--secondary-light)' }}>👥</div>
          <div className="stat-info"><h3>{totalStudents}</h3><p>Total Students</p><div className="trend">Enrolled</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--accent-light)' }}>📝</div>
          <div className="stat-info"><h3>{pendingSubmissions}</h3><p>Submissions</p><div className="trend">To Review</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--rose-light)' }}>💬</div>
          <div className="stat-info"><h3>{unreadMsgs}</h3><p>Unread Messages</p><div className="trend" style={{ color: unreadMsgs > 0 ? 'var(--rose)' : 'var(--green)' }}>{unreadMsgs > 0 ? 'Needs Reply' : 'All Caught Up'}</div></div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="section-header"><h2>📚 My Courses</h2></div>
          {courses.length === 0 ? <div className="empty-state"><div className="emoji">📚</div><h3>No courses yet</h3></div> :
            courses.map(c => (
              <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 24 }}>{c.thumbnail}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{c.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text2)' }}>{c.category} • {c.level}</div>
                  </div>
                </div>
                <span className="badge badge-purple">{c.studentsCount} students</span>
              </div>
            ))
          }
        </div>

        <div className="card">
          <div className="section-header"><h2>📝 Recent Assignments</h2></div>
          {assignments.length === 0 ? <div className="empty-state"><div className="emoji">📝</div><h3>No assignments yet</h3></div> :
            assignments.slice(0, 5).map(a => (
              <div key={a.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{a.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 3, display: 'flex', justifyContent: 'space-between' }}>
                  <span>{a.courseName}</span>
                  <span style={{ color: 'var(--primary)' }}>{a.submissionCount || 0} submissions</span>
                </div>
              </div>
            ))
          }
        </div>

        <div className="card">
          <div className="section-header"><h2>🧠 My Quizzes</h2></div>
          {quizzes.length === 0 ? <div className="empty-state"><div className="emoji">🧠</div><h3>No quizzes yet</h3></div> :
            quizzes.slice(0, 5).map(q => (
              <div key={q.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{q.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)' }}>{q.courseName} • {q.duration} min</div>
                </div>
                <span className="badge badge-cyan">{q.questionsCount} Q</span>
              </div>
            ))
          }
        </div>

        <div className="card">
          <div className="section-header"><h2>💬 Recent Messages</h2></div>
          {messages.length === 0 ? <div className="empty-state"><div className="emoji">💬</div><h3>No messages</h3></div> :
            messages.filter(m => m.receiverId === user.id).slice(0, 5).map(m => (
              <div key={m.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{m.senderName?.[0]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: m.read ? 500 : 700, fontSize: 14 }}>{m.senderName}</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)' }}>{m.subject}</div>
                </div>
                {!m.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0, marginTop: 6 }} />}
              </div>
            ))
          }
        </div>
      </div>
    </Layout>
  );
}
