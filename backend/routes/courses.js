const express = require('express');
const router = express.Router();
const { store, uuidv4 } = require('../store');
const { auth, requireRole } = require('../middleware/auth');

// Get all courses
router.get('/', auth, (req, res) => {
  const courses = store.courses.map(c => ({
    ...c,
    isEnrolled: store.enrollments.some(e => e.studentId === req.user.id && e.courseId === c.id)
  }));
  res.json(courses);
});

// Get single course
router.get('/:id', auth, (req, res) => {
  const course = store.courses.find(c => c.id === req.params.id);
  if (!course) return res.status(404).json({ message: 'Course not found' });
  res.json(course);
});

// Create course (teacher/admin)
router.post('/', auth, requireRole('teacher', 'admin'), (req, res) => {
  const { title, description, category, duration, level, tags } = req.body;
  const teacher = store.users.find(u => u.id === req.user.id);
  const course = {
    id: uuidv4(), title, description, category, duration, level,
    teacherId: req.user.id, teacherName: req.user.name,
    thumbnail: ['📚', '🎯', '💡', '🔬', '🎨', '🌐'][Math.floor(Math.random() * 6)],
    studentsCount: 0, createdAt: new Date().toISOString(), status: 'active',
    tags: tags || []
  };
  store.courses.push(course);
  res.status(201).json(course);
});

// Update course
router.put('/:id', auth, requireRole('teacher', 'admin'), (req, res) => {
  const idx = store.courses.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Course not found' });
  if (req.user.role === 'teacher' && store.courses[idx].teacherId !== req.user.id)
    return res.status(403).json({ message: 'Not your course' });
  store.courses[idx] = { ...store.courses[idx], ...req.body };
  res.json(store.courses[idx]);
});

// Delete course
router.delete('/:id', auth, requireRole('teacher', 'admin'), (req, res) => {
  const idx = store.courses.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Course not found' });
  if (req.user.role === 'teacher' && store.courses[idx].teacherId !== req.user.id)
    return res.status(403).json({ message: 'Not your course' });
  store.courses.splice(idx, 1);
  res.json({ message: 'Course deleted' });
});

// Enroll in course (student)
router.post('/:id/enroll', auth, requireRole('student'), (req, res) => {
  const course = store.courses.find(c => c.id === req.params.id);
  if (!course) return res.status(404).json({ message: 'Course not found' });
  const already = store.enrollments.find(e => e.studentId === req.user.id && e.courseId === req.params.id);
  if (already) return res.status(400).json({ message: 'Already enrolled' });

  const enrollment = { id: uuidv4(), studentId: req.user.id, courseId: req.params.id, enrolledAt: new Date().toISOString(), progress: 0 };
  store.enrollments.push(enrollment);
  course.studentsCount = (course.studentsCount || 0) + 1;

  // Notify teacher
  const teacher = store.users.find(u => u.id === course.teacherId);
  const student = store.users.find(u => u.id === req.user.id);
  store.notifications.push({
    id: uuidv4(), userId: course.teacherId,
    title: 'New Enrollment',
    message: `${student.name} enrolled in your course: ${course.title}`,
    type: 'enrollment', read: false, createdAt: new Date().toISOString(), from: student.name
  });

  res.status(201).json(enrollment);
});

// Get my enrolled courses (student)
router.get('/my/enrolled', auth, requireRole('student'), (req, res) => {
  const enrollments = store.enrollments.filter(e => e.studentId === req.user.id);
  const courses = enrollments.map(e => {
    const course = store.courses.find(c => c.id === e.courseId);
    return { ...course, progress: e.progress, enrolledAt: e.enrolledAt, enrollmentId: e.id };
  }).filter(Boolean);
  res.json(courses);
});

// Get teacher's courses
router.get('/teacher/mine', auth, requireRole('teacher'), (req, res) => {
  const courses = store.courses.filter(c => c.teacherId === req.user.id);
  res.json(courses);
});

// Get students enrolled in a course (teacher)
router.get('/:id/students', auth, requireRole('teacher', 'admin'), (req, res) => {
  const enrollments = store.enrollments.filter(e => e.courseId === req.params.id);
  const students = enrollments.map(e => {
    const student = store.users.find(u => u.id === e.studentId);
    if (!student) return null;
    const { password: _, ...safe } = student;
    return { ...safe, progress: e.progress, enrolledAt: e.enrolledAt };
  }).filter(Boolean);
  res.json(students);
});

// Update progress
router.put('/:id/progress', auth, requireRole('student'), (req, res) => {
  const enrollment = store.enrollments.find(e => e.studentId === req.user.id && e.courseId === req.params.id);
  if (!enrollment) return res.status(404).json({ message: 'Not enrolled' });
  enrollment.progress = req.body.progress;
  res.json(enrollment);
});

module.exports = router;
