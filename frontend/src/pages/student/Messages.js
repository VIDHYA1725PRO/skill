import React, { useState, useEffect, useRef } from 'react';
import Layout from '../../components/layout/Layout';
import { messages as msgApi, teachers } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function StudentMessages() {
  const { user } = useAuth();
  const [msgs, setMsgs] = useState([]);
  const [teacherList, setTeacherList] = useState([]);
  const [selected, setSelected] = useState(null);
  const [compose, setCompose] = useState(false);
  const [reply, setReply] = useState('');
  const [form, setForm] = useState({ receiverId: '', subject: '', content: '' });
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    Promise.all([msgApi.getAll(), teachers.getAll()])
      .then(([m, t]) => { setMsgs(m.data); setTeacherList(t.data); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [selected]);

  const sendMsg = async (e) => {
    e.preventDefault();
    const r = await msgApi.send(form);
    setMsgs(prev => [...prev, r.data]);
    setCompose(false);
    setForm({ receiverId: '', subject: '', content: '' });
    setSelected(r.data);
  };

  const sendReply = async (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    const r = await msgApi.reply(selected.id, { content: reply });
    setMsgs(prev => prev.map(m => m.id === selected.id ? r.data : m));
    setSelected(r.data);
    setReply('');
  };

  const selectMsg = async (msg) => {
    setSelected(msg);
    if (!msg.read && msg.receiverId === user.id) {
      await msgApi.markRead(msg.id);
      setMsgs(prev => prev.map(m => m.id === msg.id ? { ...m, read: true } : m));
    }
  };

  const avatarColors = ['#8b5cf6', '#06b6d4', '#f59e0b', '#10b981', '#f43f5e'];
  const getColor = (name) => avatarColors[name?.charCodeAt(0) % avatarColors.length];

  return (
    <Layout title="Messages" subtitle="Communicate with your teachers for doubt clarification">
      <div style={{ display: 'flex', gap: 20, height: 'calc(100vh - 200px)', minHeight: 500 }}>
        {/* Sidebar */}
        <div style={{ width: 300, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button className="btn btn-primary w-full" onClick={() => setCompose(true)}>✍️ New Message</button>
          <div className="card" style={{ flex: 1, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: 14 }}>Conversations</div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {loading ? <div style={{ padding: 20, textAlign: 'center' }}><div className="spinner" /></div> :
                msgs.length === 0 ? <div style={{ padding: 20, textAlign: 'center', color: 'var(--text2)', fontSize: 13 }}>No messages yet</div> :
                msgs.map(m => {
                  const other = m.senderId === user.id ? m.receiverName : m.senderName;
                  const unread = !m.read && m.receiverId === user.id;
                  return (
                    <div key={m.id} onClick={() => selectMsg(m)}
                      style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', cursor: 'pointer', background: selected?.id === m.id ? 'var(--primary-light)' : unread ? '#fdf4ff' : 'white', transition: 'background 0.2s' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: getColor(other), display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{other?.[0]}</div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                          <div style={{ fontWeight: unread ? 700 : 500, fontSize: 13, display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{other}</span>
                            {unread && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0, marginLeft: 4 }} />}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--text2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.subject}</div>
                        </div>
                      </div>
                    </div>
                  );
                })
              }
            </div>
          </div>
        </div>

        {/* Chat area */}
        <div className="card" style={{ flex: 1, padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {!selected ? (
            <div className="empty-state" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div className="emoji">💬</div>
              <h3>Select a conversation</h3>
              <p>or compose a new message to your teacher</p>
            </div>
          ) : (
            <>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg)' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: getColor(selected.senderId === user.id ? selected.receiverName : selected.senderName), display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>
                  {(selected.senderId === user.id ? selected.receiverName : selected.senderName)?.[0]}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{selected.senderId === user.id ? selected.receiverName : selected.senderName}</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)' }}>Re: {selected.subject}</div>
                </div>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Original message */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: selected.senderId === user.id ? 'flex-end' : 'flex-start' }}>
                  <div className={`msg-bubble ${selected.senderId === user.id ? 'msg-sent' : 'msg-received'}`}>{selected.content}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>{new Date(selected.createdAt).toLocaleString()}</div>
                </div>
                {/* Replies */}
                {(selected.replies || []).map(r => (
                  <div key={r.id} style={{ display: 'flex', flexDirection: 'column', alignItems: r.senderId === user.id ? 'flex-end' : 'flex-start' }}>
                    <div className={`msg-bubble ${r.senderId === user.id ? 'msg-sent' : 'msg-received'}`}>{r.content}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>{r.senderName} • {new Date(r.createdAt).toLocaleString()}</div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <form onSubmit={sendReply} style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
                <input className="form-input" placeholder="Type your reply..." value={reply} onChange={e => setReply(e.target.value)} style={{ margin: 0, flex: 1 }} />
                <button className="btn btn-primary" type="submit">Send</button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      {compose && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setCompose(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2>New Message</h2>
              <button className="modal-close" onClick={() => setCompose(false)}>×</button>
            </div>
            <form onSubmit={sendMsg}>
              <div className="form-group">
                <label className="form-label">Send To (Teacher)</label>
                <select className="form-select" value={form.receiverId} onChange={e => setForm(p => ({ ...p, receiverId: e.target.value }))} required>
                  <option value="">Select teacher...</option>
                  {teacherList.map(t => <option key={t.id} value={t.id}>{t.name} — {t.subject}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Subject</label>
                <input className="form-input" placeholder="e.g. Question about Chapter 5" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea className="form-textarea" placeholder="Write your question here..." value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} required style={{ minHeight: 120 }} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-primary" type="submit" style={{ flex: 1 }}>📤 Send Message</button>
                <button className="btn btn-outline" type="button" onClick={() => setCompose(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
