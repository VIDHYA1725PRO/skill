const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { store, uuidv4 } = require('../store');
const { auth, requireRole } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: './uploads/assignments',
  filename: (req, file, cb) => cb(null, `${uuidv4()}-${file.originalname}`)
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// Get all assignments (filtered by role)
router.get('/', auth, (req, res) => {
  let assignments;
  if (req.user.role === 'teacher') {
    assignments = store.assignments.filter(a => a.teacherId === req.user.id);
  } else if (req.user.role === 'admin') {
    assignments = store.assignments;
  } else {
    // Student: get assignments for enrolled courses
    const enrolled = store.enrollments.filter(e => e.studentId === req.user.id).map(e => e.courseId);
    assignments = store.assignments.filter(a => enrolled.includes(a.courseId));
  }
  const result = assignments.map(a => {
    const course = store.courses.find(c => c.id === a.courseId);
    const submission = store.submissions.find(s => s.assignmentId === a.id && s.studentId === req.user.id);
    const submissionCount = store.submissions.filter(s => s.assignmentId === a.id).length;
    return { ...a, courseName: course?.title, submission, submissionCount };
  });
  res.json(result);
});

// Create assignment (teacher)
router.post('/', auth, requireRole('teacher', 'admin'), (req, res) => {
  const { title, description, courseId, deadline, maxScore } = req.body;
  const assignment = { id: uuidv4(), title, description, courseId, teacherId: req.user.id, deadline, maxScore: maxScore || 100, createdAt: new Date().toISOString(), status: 'active' };
  store.assignments.push(assignment);

  // Notify enrolled students
  const enrolled = store.enrollments.filter(e => e.courseId === courseId);
  const course = store.courses.find(c => c.id === courseId);
  enrolled.forEach(e => {
    store.notifications.push({
      id: uuidv4(), userId: e.studentId,
      title: 'New Assignment', message: `New assignment posted in ${course?.title}: ${title}`,
      type: 'assignment', read: false, createdAt: new Date().toISOString(), from: req.user.name
    });
  });

  res.status(201).json(assignment);
});

// Delete assignment
router.delete('/:id', auth, requireRole('teacher', 'admin'), (req, res) => {
  const idx = store.assignments.findIndex(a => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Not found' });
  store.assignments.splice(idx, 1);
  res.json({ message: 'Deleted' });
});

// Submit assignment (student)
router.post('/:id/submit', auth, requireRole('student'), upload.single('file'), (req, res) => {
  const assignment = store.assignments.find(a => a.id === req.params.id);
  if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

  const existing = store.submissions.findIndex(s => s.assignmentId === req.params.id && s.studentId === req.user.id);
  const submission = {
    id: uuidv4(), assignmentId: req.params.id, studentId: req.user.id, studentName: req.user.name,
    fileName: req.file?.originalname || 'submission.txt',
    filePath: req.file?.path || null,
    note: req.body.note || '',
    submittedAt: new Date().toISOString(), grade: null, feedback: ''
  };

  if (existing !== -1) store.submissions[existing] = submission;
  else store.submissions.push(submission);

  // Notify teacher
  store.notifications.push({
    id: uuidv4(), userId: assignment.teacherId,
    title: 'Assignment Submitted', message: `${req.user.name} submitted ${assignment.title}`,
    type: 'submission', read: false, createdAt: new Date().toISOString(), from: req.user.name
  });

  res.status(201).json(submission);
});

// Get submissions for an assignment (teacher)
router.get('/:id/submissions', auth, requireRole('teacher', 'admin'), (req, res) => {
  const submissions = store.submissions.filter(s => s.assignmentId === req.params.id);
  res.json(submissions);
});

// Grade submission (teacher)
router.put('/submissions/:subId/grade', auth, requireRole('teacher'), (req, res) => {
  const idx = store.submissions.findIndex(s => s.id === req.params.subId);
  if (idx === -1) return res.status(404).json({ message: 'Submission not found' });
  store.submissions[idx].grade = req.body.grade;
  store.submissions[idx].feedback = req.body.feedback || '';
  const sub = store.submissions[idx];

  // Notify student
  const assignment = store.assignments.find(a => a.id === sub.assignmentId);
  store.notifications.push({
    id: uuidv4(), userId: sub.studentId,
    title: 'Assignment Graded', message: `Your submission for "${assignment?.title}" was graded: ${req.body.grade} points`,
    type: 'grade', read: false, createdAt: new Date().toISOString(), from: req.user.name
  });

  res.json(store.submissions[idx]);
});

module.exports = router;
