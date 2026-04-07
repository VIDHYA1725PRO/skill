import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { useAuth } from '../../context/AuthContext';
import { courses as coursesApi, assignments as assignApi, todos as todosApi, studyLogs } from '../../utils/api';

function HeatMap({ logs }) {
  const today = new Date();
  const cells = [];
  for (let i = 89; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    const log = logs.find(l => l.date === key);
    const mins = log?.minutes || 0;
    const level = mins === 0 ? 0 : mins < 60 ? 1 : mins < 120 ? 2 : mins < 180 ? 3 : 4;
    cells.push(<div key={key} className={`heatmap-cell heat-${level}`} title={`${key}: ${mins} min`} />);
  }
  return (
    <div>
      <div className="heatmap">{cells}</div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 8, fontSize: 11, color: 'var(--text2)' }}>
        <span>Less</span>
        {[0,1,2,3,4].map(l => <div key={l} className={`heatmap-cell heat-${l}`} />)}
        <span>More</span>
      </div>
    </div>
  );
}

function TodoItem({ todo, onToggle, onDelete }) {
  const colors = { high: 'var(--rose)', medium: 'var(--accent)', low: 'var(--green)' };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
      <input type="checkbox" checked={todo.completed} onChange={() => onToggle(todo)}
        style={{ width: 16, height: 16, accentColor: 'var(--primary)', cursor: 'pointer' }} />
      <span style={{ flex: 1, fontSize: 14, textDecoration: todo.completed ? 'line-through' : 'none', color: todo.completed ? 'var(--text3)' : 'var(--text)' }}>{todo.title}</span>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: colors[todo.priority], flexShrink: 0 }} title={todo.priority} />
      <button onClick={() => onDelete(todo.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text3)', fontSize: 16 }}>×</button>
    </div>
  );
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [myCourses, setMyCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [todos, setTodos] = useState([]);
  const [logs, setLogs] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      coursesApi.myEnrolled(),
      assignApi.getAll(),
      todosApi.getAll(),
      studyLogs.getAll(),
    ]).then(([c, a, t, l]) => {
      setMyCourses(c.data);
      setAssignments(a.data);
      setTodos(t.data);
      setLogs(l.data);
    }).finally(() => setLoading(false));
  }, []);

  const addTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    const r = await todosApi.create({ title: newTodo, priority: 'medium' });
    setTodos(prev => [...prev, r.data]);
    setNewTodo('');
  };

  const toggleTodo = async (todo) => {
    const r = await todosApi.update(todo.id, { completed: !todo.completed });
    setTodos(prev => prev.map(t => t.id === todo.id ? r.data : t));
  };

  const deleteTodo = async (id) => {
    await todosApi.delete(id);
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  const logStudy = async () => {
    const r = await studyLogs.log({ minutes: 30 });
    setLogs(prev => {
      const existing = prev.find(l => l.date === r.data.date);
      if (existing) return prev.map(l => l.date === r.data.date ? r.data : l);
      return [...prev, r.data];
    });
  };

  const pendingAssignments = assignments.filter(a => !a.submission);
  const upcoming = assignments.filter(a => {
    const dl = new Date(a.deadline);
    const now = new Date();
    const diff = (dl - now) / (1000 * 60 * 60 * 24);
    return diff > 0 && diff < 7 && !a.submission;
  });

  const getDeadlineClass = (dl) => {
    const diff = (new Date(dl) - new Date()) / (1000 * 60 * 60 * 24);
    if (diff < 0) return 'deadline-urgent';
    if (diff < 2) return 'deadline-urgent';
    if (diff < 5) return 'deadline-soon';
    return 'deadline-ok';
  };

  const avgProgress = myCourses.length ? Math.round(myCourses.reduce((s, c) => s + (c.progress || 0), 0) / myCourses.length) : 0;

  if (loading) return <Layout title="Dashboard"><div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" /></div></Layout>;

  return (
    <Layout title={`Welcome back, ${user?.name?.split(' ')[0]}! 👋`} subtitle="Here's your learning overview for today">
      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--primary-light)' }}>📚</div>
          <div className="stat-info">
            <h3>{myCourses.length}</h3>
            <p>Active Courses</p>
            <div className="trend">↑ Enrolled</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--rose-light)' }}>📝</div>
          <div className="stat-info">
            <h3>{pendingAssignments.length}</h3>
            <p>Pending Assignments</p>
            <div className="trend" style={{ color: pendingAssignments.length > 0 ? 'var(--rose)' : 'var(--green)' }}>
              {pendingAssignments.length > 0 ? '⚠ Due Soon' : '✓ All Done'}
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--green-light)' }}>📈</div>
          <div className="stat-info">
            <h3>{avgProgress}%</h3>
            <p>Avg. Progress</p>
            <div className="trend">Across all courses</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--accent-light)' }}>🔥</div>
          <div className="stat-info">
            <h3>{logs.filter(l => {
              const d = new Date(l.date);
              const now = new Date();
              return d >= new Date(now.setDate(now.getDate() - 7));
            }).length}</h3>
            <p>Study Days (Week)</p>
            <div className="trend">Keep it up!</div>
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Study Heatmap */}
        <div className="card">
          <div className="section-header">
            <h2>📅 Study Progress Heatmap</h2>
            <button className="btn btn-sm btn-secondary" onClick={logStudy}>+ Log 30 min</button>
          </div>
          <HeatMap logs={logs} />
          <p style={{ fontSize: 12, color: 'var(--text2)', marginTop: 10 }}>Last 90 days of study activity</p>
        </div>

        {/* To-Do List */}
        <div className="card">
          <div className="section-header"><h2>✅ To-Do List</h2></div>
          <form onSubmit={addTodo} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <input className="form-input" placeholder="Add a new task..." value={newTodo} onChange={e => setNewTodo(e.target.value)} style={{ margin: 0 }} />
            <button className="btn btn-primary btn-sm" type="submit">+</button>
          </form>
          <div style={{ maxHeight: 220, overflowY: 'auto' }}>
            {todos.length === 0 ? <p className="text-muted text-sm">No tasks yet. Add one above!</p> :
              todos.map(t => <TodoItem key={t.id} todo={t} onToggle={toggleTodo} onDelete={deleteTodo} />)}
          </div>
          <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text2)' }}>
            {todos.filter(t => t.completed).length}/{todos.length} completed
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Active Courses */}
        <div className="card">
          <div className="section-header"><h2>🎯 Active Courses</h2></div>
          {myCourses.length === 0 ? (
            <div className="empty-state"><div className="emoji">📚</div><h3>No courses yet</h3><p>Enroll in a course to get started</p></div>
          ) : (
            myCourses.map(c => (
              <div key={c.id} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div>
                    <span style={{ fontSize: 16 }}>{c.thumbnail}</span>
                    <span style={{ marginLeft: 8, fontWeight: 600, fontSize: 14 }}>{c.title}</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>{c.progress}%</span>
                </div>
                <div className="progress-bar-wrap">
                  <div className="progress-bar" style={{ width: `${c.progress}%` }} />
                </div>
                <p style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>by {c.teacherName}</p>
              </div>
            ))
          )}
        </div>

        {/* Upcoming Deadlines */}
        <div className="card">
          <div className="section-header"><h2>⏰ Assignment Deadlines</h2></div>
          {assignments.length === 0 ? (
            <div className="empty-state"><div className="emoji">🎉</div><h3>No assignments</h3><p>You're all caught up!</p></div>
          ) : (
            assignments.slice(0, 6).map(a => (
              <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{a.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)' }}>{a.courseName}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className={`text-sm ${getDeadlineClass(a.deadline)}`}>
                    {new Date(a.deadline) < new Date() ? '⚠ Overdue' : `📅 ${new Date(a.deadline).toLocaleDateString()}`}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>
                    {a.submission ? <span style={{ color: 'var(--green)' }}>✓ Submitted</span> : <span style={{ color: 'var(--rose)' }}>Pending</span>}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
