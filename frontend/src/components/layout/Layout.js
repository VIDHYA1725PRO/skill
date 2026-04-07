import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { notifications as notifApi } from '../../utils/api';
import { useNavigate } from 'react-router-dom';

export default function Layout({ children, title, subtitle }) {
  const { user } = useAuth();
  const [notifs, setNotifs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    notifApi.getAll().then(r => setNotifs(r.data)).catch(() => {});
    const interval = setInterval(() => {
      notifApi.getAll().then(r => setNotifs(r.data)).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const unread = notifs.filter(n => !n.read).length;
  const notifPath = `/${user?.role}/notifications`;

  return (
    <div className="layout">
      <Sidebar unreadCount={unread} />
      <main className="main">
        <div className="topbar">
          <div className="topbar-title">
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <div className="topbar-actions">
            <button className="notif-btn" onClick={() => navigate(notifPath)} title="Notifications">
              🔔
              {unread > 0 && <span className="notif-dot" />}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--primary-light)', padding: '8px 14px', borderRadius: 12 }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 13, fontWeight: 700 }}>
                {user?.name?.[0]}
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary)' }}>{user?.name?.split(' ')[0]}</span>
            </div>
          </div>
        </div>
        <div className="page">{children}</div>
      </main>
    </div>
  );
}
