import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const studentNav = [
  { label: 'Dashboard', icon: '🏠', path: '/student/dashboard' },
  { label: 'All Courses', icon: '📚', path: '/student/courses' },
  { label: 'My Courses', icon: '🎯', path: '/student/my-courses' },
  { label: 'Assignments', icon: '📝', path: '/student/assignments' },
  { label: 'Quizzes', icon: '🧠', path: '/student/quizzes' },
  { label: 'Progress', icon: '📈', path: '/student/progress' },
  { label: 'Certificates', icon: '🏆', path: '/student/certificates' },
  { label: 'Messages', icon: '💬', path: '/student/messages' },
  { label: 'Notifications', icon: '🔔', path: '/student/notifications' },
  { label: 'Profile', icon: '👤', path: '/student/profile' },
];

const teacherNav = [
  { label: 'Dashboard', icon: '🏠', path: '/teacher/dashboard' },
  { label: 'My Courses', icon: '📚', path: '/teacher/courses' },
  { label: 'Students', icon: '👥', path: '/teacher/students' },
  { label: 'Assignments', icon: '📝', path: '/teacher/assignments' },
  { label: 'Quizzes', icon: '🧠', path: '/teacher/quizzes' },
  { label: 'Certificates', icon: '🏆', path: '/teacher/certificates' },
  { label: 'Messages', icon: '💬', path: '/teacher/messages' },
  { label: 'Notifications', icon: '🔔', path: '/teacher/notifications' },
  { label: 'Profile', icon: '👤', path: '/teacher/profile' },
];

const adminNav = [
  { label: 'Dashboard', icon: '🏠', path: '/admin/dashboard' },
  { label: 'All Students', icon: '👩‍🎓', path: '/admin/students' },
  { label: 'All Teachers', icon: '👨‍🏫', path: '/admin/teachers' },
  { label: 'Courses', icon: '📚', path: '/admin/courses' },
  { label: 'Enrollments', icon: '📋', path: '/admin/enrollments' },
  { label: 'Notifications', icon: '🔔', path: '/admin/notifications' },
  { label: 'Admin Details', icon: '🛡️', path: '/admin/admins' },
  { label: 'Profile', icon: '👤', path: '/admin/profile' },
];

const navMap = { student: studentNav, teacher: teacherNav, admin: adminNav };

export default function Sidebar({ unreadCount = 0 }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const nav = navMap[user?.role] || [];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🎓</div>
        <div className="sidebar-logo-text">
          <h2>SkillBridge</h2>
          <span>Learning Platform</span>
        </div>
      </div>

      <div className="sidebar-user">
        <div className="sidebar-user-avatar">{user?.avatar || user?.name?.[0]}</div>
        <div className="sidebar-user-info">
          <h4>{user?.name}</h4>
          <span>{user?.role}</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Navigation</div>
        {nav.map(item => (
          <div
            key={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="icon">{item.icon}</span>
            <span>{item.label}</span>
            {(item.label === 'Notifications' || item.label === 'Messages') && unreadCount > 0 && (
              <span className="nav-badge">{unreadCount}</span>
            )}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={() => { logout(); navigate('/login'); }}>
          <span>🚪</span> Sign Out
        </button>
      </div>
    </aside>
  );
}
