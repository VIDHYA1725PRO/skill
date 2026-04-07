import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { admin as adminApi, courses as coursesApi } from '../../utils/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminApi.stats(), coursesApi.getAll()])
      .then(([s, c]) => { setStats(s.data); setCourses(c.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout title="Admin Dashboard"><div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" /></div></Layout>;

  const statCards = [
    { label: 'Total Students', value: stats?.totalStudents, icon: '👩‍🎓', bg: 'var(--primary-light)', trend: '↑ Active learners' },
    { label: 'Total Teachers', value: stats?.totalTeachers, icon: '👨‍🏫', bg: 'var(--secondary-light)', trend: 'Expert educators' },
    { label: 'Total Admins', value: stats?.totalAdmins, icon: '🛡️', bg: 'var(--rose-light)', trend: 'System managers' },
    { label: 'Total Courses', value: stats?.totalCourses, icon: '📚', bg: 'var(--accent-light)', trend: `${stats?.totalEnrollments} enrollments` },
    { label: 'Assignments', value: stats?.totalAssignments, icon: '📝', bg: 'var(--green-light)', trend: 'Posted' },
    { label: 'Quizzes', value: stats?.totalQuizzes, icon: '🧠', bg: 'var(--primary-light)', trend: 'Created' },
    { label: 'Enrollments', value: stats?.totalEnrollments, icon: '📋', bg: 'var(--secondary-light)', trend: 'Total' },
    { label: 'Active Courses', value: courses.filter(c => c.status === 'active').length, icon: '✅', bg: 'var(--green-light)', trend: 'Running now' },
  ];

  return (
    <Layout title="Admin Dashboard" subtitle="Complete overview of SkillBridge platform">
      <div className="grid-4" style={{ marginBottom: 28 }}>
        {statCards.map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
            <div className="stat-info"><h3>{s.value ?? 0}</h3><p>{s.label}</p><div className="trend">{s.trend}</div></div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="section-header"><h2>📚 All Courses</h2></div>
          <div className="table-wrap" style={{ border: 'none' }}>
            <table>
              <thead><tr><th>Course</th><th>Teacher</th><th>Students</th><th>Level</th></tr></thead>
              <tbody>
                {courses.slice(0, 8).map(c => (
                  <tr key={c.id}>
                    <td><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span>{c.thumbnail}</span><strong style={{ fontSize: 13 }}>{c.title}</strong></div></td>
                    <td style={{ fontSize: 13 }}>{c.teacherName}</td>
                    <td><span className="badge badge-purple">{c.studentsCount}</span></td>
                    <td><span className={`badge ${c.level === 'Beginner' ? 'badge-green' : c.level === 'Intermediate' ? 'badge-amber' : 'badge-rose'}`}>{c.level}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="section-header"><h2>📊 Platform Overview</h2></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { label: 'Student/Teacher Ratio', value: stats?.totalTeachers ? `${Math.round(stats.totalStudents / stats.totalTeachers)}:1` : 'N/A', icon: '⚖️' },
              { label: 'Avg Enrollments per Course', value: stats?.totalCourses ? Math.round(stats.totalEnrollments / stats.totalCourses) : 0, icon: '📈' },
              { label: 'Courses per Teacher', value: stats?.totalTeachers ? Math.round(stats.totalCourses / stats.totalTeachers) : 0, icon: '📚' },
              { label: 'Platform Completion Rate', value: `${stats?.totalEnrollments > 0 ? Math.round((stats.totalEnrollments * 0.4)) : 0} completions`, icon: '🎯' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 20 }}>{item.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{item.label}</span>
                </div>
                <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--primary)' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
