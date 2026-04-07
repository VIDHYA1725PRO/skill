const express = require('express');
const router = express.Router();
const { store, uuidv4 } = require('../store');
const { auth, requireRole } = require('../middleware/auth');

// MESSAGES
router.get('/messages', auth, (req, res) => {
  const msgs = store.messages.filter(m => m.senderId === req.user.id || m.receiverId === req.user.id);
  res.json(msgs);
});

router.post('/messages', auth, (req, res) => {
  const { receiverId, subject, content } = req.body;
  const receiver = store.users.find(u => u.id === receiverId);
  if (!receiver) return res.status(404).json({ message: 'Receiver not found' });
  const msg = { id: uuidv4(), senderId: req.user.id, receiverId, senderName: req.user.name, receiverName: receiver.name, subject, content, read: false, createdAt: new Date().toISOString(), replies: [] };
  store.messages.push(msg);
  store.notifications.push({ id: uuidv4(), userId: receiverId, title: 'New Message', message: `${req.user.name}: ${subject}`, type: 'message', read: false, createdAt: new Date().toISOString(), from: req.user.name });
  res.status(201).json(msg);
});

router.post('/messages/:id/reply', auth, (req, res) => {
  const msg = store.messages.find(m => m.id === req.params.id);
  if (!msg) return res.status(404).json({ message: 'Not found' });
  const reply = { id: uuidv4(), senderId: req.user.id, senderName: req.user.name, content: req.body.content, createdAt: new Date().toISOString() };
  if (!msg.replies) msg.replies = [];
  msg.replies.push(reply);
  const notifyId = msg.senderId === req.user.id ? msg.receiverId : msg.senderId;
  store.notifications.push({ id: uuidv4(), userId: notifyId, title: 'New Reply', message: `${req.user.name} replied: ${req.body.content.substring(0, 50)}`, type: 'message', read: false, createdAt: new Date().toISOString(), from: req.user.name });
  res.json(msg);
});

router.put('/messages/:id/read', auth, (req, res) => {
  const msg = store.messages.find(m => m.id === req.params.id);
  if (msg) msg.read = true;
  res.json({ success: true });
});

// NOTIFICATIONS
router.get('/notifications', auth, (req, res) => {
  const notifs = store.notifications.filter(n => n.userId === req.user.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(notifs);
});

router.put('/notifications/:id/read', auth, (req, res) => {
  const notif = store.notifications.find(n => n.id === req.params.id && n.userId === req.user.id);
  if (notif) notif.read = true;
  res.json({ success: true });
});

router.put('/notifications/read-all', auth, (req, res) => {
  store.notifications.filter(n => n.userId === req.user.id).forEach(n => n.read = true);
  res.json({ success: true });
});

// Send notification (teacher/admin to students)
router.post('/notifications/send', auth, requireRole('teacher', 'admin'), (req, res) => {
  const { userIds, title, message } = req.body;
  const targets = userIds || store.users.filter(u => u.role === 'student').map(u => u.id);
  targets.forEach(userId => {
    store.notifications.push({ id: uuidv4(), userId, title, message, type: 'announcement', read: false, createdAt: new Date().toISOString(), from: req.user.name });
  });
  res.json({ sent: targets.length });
});

// TODOS
router.get('/todos', auth, (req, res) => {
  res.json(store.todos.filter(t => t.userId === req.user.id));
});

router.post('/todos', auth, (req, res) => {
  const todo = { id: uuidv4(), userId: req.user.id, title: req.body.title, completed: false, priority: req.body.priority || 'medium', createdAt: new Date().toISOString() };
  store.todos.push(todo);
  res.status(201).json(todo);
});

router.put('/todos/:id', auth, (req, res) => {
  const idx = store.todos.findIndex(t => t.id === req.params.id && t.userId === req.user.id);
  if (idx === -1) return res.status(404).json({ message: 'Not found' });
  store.todos[idx] = { ...store.todos[idx], ...req.body };
  res.json(store.todos[idx]);
});

router.delete('/todos/:id', auth, (req, res) => {
  const idx = store.todos.findIndex(t => t.id === req.params.id && t.userId === req.user.id);
  if (idx !== -1) store.todos.splice(idx, 1);
  res.json({ success: true });
});

// STUDY LOGS (heatmap data)
router.get('/study-logs', auth, (req, res) => {
  const logs = store.studyLogs.filter(l => l.userId === req.user.id);
  res.json(logs);
});

router.post('/study-logs', auth, (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const existing = store.studyLogs.find(l => l.userId === req.user.id && l.date === today);
  if (existing) {
    existing.minutes += req.body.minutes || 30;
    return res.json(existing);
  }
  const log = { id: uuidv4(), userId: req.user.id, date: today, minutes: req.body.minutes || 30 };
  store.studyLogs.push(log);
  res.status(201).json(log);
});

// USERS (admin)
router.get('/users', auth, requireRole('admin'), (req, res) => {
  const users = store.users.map(({ password: _, ...u }) => u);
  res.json(users);
});

router.get('/users/:id', auth, requireRole('admin', 'teacher'), (req, res) => {
  const user = store.users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ message: 'Not found' });
  const { password: _, ...safe } = user;
  const enrollments = store.enrollments.filter(e => e.studentId === req.params.id);
  const courses = enrollments.map(e => store.courses.find(c => c.id === e.courseId)).filter(Boolean);
  const certs = store.certificates.filter(c => c.studentId === req.params.id);
  res.json({ ...safe, enrolledCourses: courses, certificates: certs });
});

router.delete('/users/:id', auth, requireRole('admin'), (req, res) => {
  const idx = store.users.findIndex(u => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Not found' });
  store.users.splice(idx, 1);
  res.json({ success: true });
});

// CERTIFICATES
const multer = require('multer');
const certStorage = multer.diskStorage({ destination: './uploads/certificates', filename: (req, file, cb) => cb(null, `${uuidv4()}-${file.originalname}`) });
const certUpload = multer({ storage: certStorage });

router.post('/certificates/upload', auth, requireRole('student'), certUpload.single('file'), (req, res) => {
  const cert = { id: uuidv4(), studentId: req.user.id, studentName: req.user.name, title: req.body.title, issuer: req.body.issuer, fileName: req.file?.originalname, filePath: req.file?.path, uploadedAt: new Date().toISOString(), verified: false };
  store.certificates.push(cert);
  res.status(201).json(cert);
});

router.get('/certificates', auth, (req, res) => {
  if (req.user.role === 'student') return res.json(store.certificates.filter(c => c.studentId === req.user.id));
  if (req.user.role === 'teacher') {
    const enrolledStudents = store.enrollments.filter(e => store.courses.some(c => c.teacherId === req.user.id && c.id === e.courseId)).map(e => e.studentId);
    return res.json(store.certificates.filter(c => enrolledStudents.includes(c.studentId)));
  }
  res.json(store.certificates);
});

router.put('/certificates/:id/verify', auth, requireRole('teacher', 'admin'), (req, res) => {
  const cert = store.certificates.find(c => c.id === req.params.id);
  if (!cert) return res.status(404).json({ message: 'Not found' });
  cert.verified = true;
  cert.verifiedBy = req.user.name;
  // Add to student details
  const studentIdx = store.users.findIndex(u => u.id === cert.studentId);
  if (studentIdx !== -1) {
    if (!store.users[studentIdx].certificates) store.users[studentIdx].certificates = [];
    store.users[studentIdx].certificates.push(cert.id);
  }
  store.notifications.push({ id: uuidv4(), userId: cert.studentId, title: 'Certificate Verified', message: `Your certificate "${cert.title}" has been verified by ${req.user.name}`, type: 'certificate', read: false, createdAt: new Date().toISOString(), from: req.user.name });
  res.json(cert);
});

// ADMIN STATS
router.get('/admin/stats', auth, requireRole('admin'), (req, res) => {
  res.json({
    totalStudents: store.users.filter(u => u.role === 'student').length,
    totalTeachers: store.users.filter(u => u.role === 'teacher').length,
    totalAdmins: store.users.filter(u => u.role === 'admin').length,
    totalCourses: store.courses.length,
    totalEnrollments: store.enrollments.length,
    totalAssignments: store.assignments.length,
    totalQuizzes: store.quizzes.length,
    recentEnrollments: store.enrollments.slice(-5).reverse()
  });
});

// Teachers list (for messaging)
router.get('/teachers', auth, (req, res) => {
  const teachers = store.users.filter(u => u.role === 'teacher').map(({ password: _, ...t }) => t);
  res.json(teachers);
});

module.exports = router;
