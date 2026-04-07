import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { courses as coursesApi } from '../../utils/api';

export default function AllCourses() {
  const [courses, setCourses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    coursesApi.getAll().then(r => { setCourses(r.data); setFiltered(r.data); }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let res = courses;
    if (search) res = res.filter(c => c.title.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase()));
    if (category !== 'All') res = res.filter(c => c.category === category);
    setFiltered(res);
  }, [search, category, courses]);

  const enroll = async (id) => {
    setEnrolling(id);
    try {
      await coursesApi.enroll(id);
      setCourses(prev => prev.map(c => c.id === id ? { ...c, isEnrolled: true, studentsCount: c.studentsCount + 1 } : c));
      setMsg('Successfully enrolled!');
      setTimeout(() => setMsg(''), 3000);
    } catch (e) {
      setMsg(e.response?.data?.message || 'Error enrolling');
      setTimeout(() => setMsg(''), 3000);
    } finally { setEnrolling(null); }
  };

  const categories = ['All', ...new Set(courses.map(c => c.category).filter(Boolean))];

  const levelColors = { Beginner: 'badge-green', Intermediate: 'badge-amber', Advanced: 'badge-rose' };

  return (
    <Layout title="All Courses" subtitle="Discover and enroll in courses to expand your knowledge">
      {msg && <div className={`alert ${msg.includes('Success') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}
      
      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <input className="form-input" placeholder="🔍 Search courses..." value={search}
          onChange={e => setSearch(e.target.value)} style={{ maxWidth: 300, margin: 0 }} />
        <div style={{ display: 'flex', gap: 8 }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={`btn btn-sm ${category === cat ? 'btn-primary' : 'btn-outline'}`}>{cat}</button>
          ))}
        </div>
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" /></div> :
        filtered.length === 0 ? (
          <div className="empty-state"><div className="emoji">🔍</div><h3>No courses found</h3><p>Try a different search term</p></div>
        ) : (
          <div className="grid-auto">
            {filtered.map(c => (
              <div key={c.id} className="course-card">
                <div className="course-card-header">
                  <div className="course-emoji">{c.thumbnail}</div>
                  <div style={{ marginTop: 8, display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <span className={`badge ${levelColors[c.level] || 'badge-purple'}`}>{c.level}</span>
                    <span className="badge badge-cyan">{c.category}</span>
                  </div>
                </div>
                <div className="course-card-body">
                  <h3>{c.title}</h3>
                  <p>{c.description}</p>
                  <div style={{ marginTop: 12, fontSize: 13, color: 'var(--text2)' }}>
                    <div>👨‍🏫 {c.teacherName}</div>
                    <div style={{ marginTop: 4 }}>⏱ {c.duration} &nbsp;•&nbsp; 👥 {c.studentsCount} students</div>
                  </div>
                </div>
                <div className="course-card-footer">
                  {c.isEnrolled ? (
                    <div style={{ textAlign: 'center', padding: '8px 0', color: 'var(--green)', fontWeight: 600, fontSize: 14 }}>✓ Enrolled</div>
                  ) : (
                    <button className="btn btn-primary w-full" onClick={() => enroll(c.id)} disabled={enrolling === c.id}>
                      {enrolling === c.id ? '⏳ Enrolling...' : '🚀 Enroll Now'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      }
    </Layout>
  );
}
