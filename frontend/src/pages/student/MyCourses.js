import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { courses as coursesApi } from '../../utils/api';

export default function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    coursesApi.myEnrolled().then(r => setCourses(r.data)).finally(() => setLoading(false));
  }, []);

  const updateProgress = async (id, val) => {
    setUpdating(id);
    try {
      await coursesApi.updateProgress(id, val);
      setCourses(prev => prev.map(c => c.id === id ? { ...c, progress: val } : c));
    } finally { setUpdating(null); }
  };

  const levelColor = { Beginner: '#059669', Intermediate: '#d97706', Advanced: '#e11d48' };

  return (
    <Layout title="My Courses" subtitle="Track your enrolled courses and learning progress">
      {loading ? <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" /></div> :
        courses.length === 0 ? (
          <div className="empty-state"><div className="emoji">📚</div><h3>No enrolled courses</h3><p>Go to All Courses and enroll in something!</p></div>
        ) : (
          <div className="grid-auto">
            {courses.map(c => (
              <div key={c.id} className="course-card">
                <div className="course-card-header" style={{ background: `linear-gradient(135deg, #ede9fe 0%, #cffafe 100%)` }}>
                  <div className="course-emoji">{c.thumbnail}</div>
                  <div style={{ marginTop: 8 }}>
                    <span className="badge badge-purple">{c.level}</span>
                  </div>
                </div>
                <div className="course-card-body">
                  <h3>{c.title}</h3>
                  <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 8 }}>by {c.teacherName}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)' }}>Progress</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)' }}>{c.progress}%</span>
                  </div>
                  <div className="progress-bar-wrap">
                    <div className="progress-bar" style={{ width: `${c.progress}%` }} />
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 4 }}>Update Progress:</label>
                    <input type="range" min="0" max="100" value={c.progress}
                      onChange={e => updateProgress(c.id, Number(e.target.value))}
                      style={{ width: '100%', accentColor: 'var(--primary)' }} disabled={updating === c.id} />
                  </div>
                </div>
                <div className="course-card-footer">
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text2)' }}>
                    <span>⏱ {c.duration}</span>
                    <span>📅 Enrolled: {new Date(c.enrolledAt).toLocaleDateString()}</span>
                  </div>
                  {c.progress === 100 && (
                    <div style={{ marginTop: 10, textAlign: 'center', color: 'var(--green)', fontWeight: 700, fontSize: 14 }}>🎉 Completed!</div>
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
