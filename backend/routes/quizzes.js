const express = require('express');
const router = express.Router();
const { store, uuidv4 } = require('../store');
const { auth, requireRole } = require('../middleware/auth');

// Get quizzes
router.get('/', auth, (req, res) => {
  let quizzes;
  if (req.user.role === 'teacher') {
    quizzes = store.quizzes.filter(q => q.teacherId === req.user.id);
  } else if (req.user.role === 'admin') {
    quizzes = store.quizzes;
  } else {
    const enrolled = store.enrollments.filter(e => e.studentId === req.user.id).map(e => e.courseId);
    quizzes = store.quizzes.filter(q => enrolled.includes(q.courseId));
  }
  const result = quizzes.map(q => {
    const course = store.courses.find(c => c.id === q.courseId);
    const attempt = store.quizAttempts.find(a => a.quizId === q.id && a.studentId === req.user.id);
    return { ...q, courseName: course?.title, attempt, questionsCount: q.questions?.length || 0 };
  });
  res.json(result);
});

// Get single quiz (hide correct answers for students unless attempted)
router.get('/:id', auth, (req, res) => {
  const quiz = store.quizzes.find(q => q.id === req.params.id);
  if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
  const attempt = store.quizAttempts.find(a => a.quizId === req.params.id && a.studentId === req.user.id);

  if (req.user.role === 'student' && !attempt) {
    // Hide correct answers
    const sanitized = { ...quiz, questions: quiz.questions.map(({ correct, ...q }) => q) };
    return res.json(sanitized);
  }
  res.json({ ...quiz, attempt });
});

// Create quiz (teacher)
router.post('/', auth, requireRole('teacher', 'admin'), (req, res) => {
  const { title, courseId, duration, questions, startTime } = req.body;
  const quiz = { id: uuidv4(), title, courseId, teacherId: req.user.id, duration, questions, startTime, status: 'active', createdAt: new Date().toISOString() };
  store.quizzes.push(quiz);

  // Notify students
  const enrolled = store.enrollments.filter(e => e.courseId === courseId);
  const course = store.courses.find(c => c.id === courseId);
  enrolled.forEach(e => {
    store.notifications.push({
      id: uuidv4(), userId: e.studentId,
      title: 'New Quiz Available', message: `New quiz in ${course?.title}: ${title}. Duration: ${duration} minutes.`,
      type: 'quiz', read: false, createdAt: new Date().toISOString(), from: req.user.name
    });
  });

  res.status(201).json(quiz);
});

// Update quiz
router.put('/:id', auth, requireRole('teacher', 'admin'), (req, res) => {
  const idx = store.quizzes.findIndex(q => q.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Not found' });
  store.quizzes[idx] = { ...store.quizzes[idx], ...req.body };
  res.json(store.quizzes[idx]);
});

// Delete quiz
router.delete('/:id', auth, requireRole('teacher', 'admin'), (req, res) => {
  const idx = store.quizzes.findIndex(q => q.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Not found' });
  store.quizzes.splice(idx, 1);
  res.json({ message: 'Deleted' });
});

// Submit quiz attempt (student)
router.post('/:id/attempt', auth, requireRole('student'), (req, res) => {
  const quiz = store.quizzes.find(q => q.id === req.params.id);
  if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

  const existing = store.quizAttempts.find(a => a.quizId === req.params.id && a.studentId === req.user.id);
  if (existing) return res.status(400).json({ message: 'Already attempted' });

  const { answers, timeTaken } = req.body;
  let score = 0;
  const detailed = quiz.questions.map((q, i) => {
    const isCorrect = answers[i] === q.correct;
    if (isCorrect) score += q.points || 10;
    return { question: q.question, selected: answers[i], correct: q.correct, isCorrect, points: q.points || 10 };
  });

  const total = quiz.questions.reduce((sum, q) => sum + (q.points || 10), 0);
  const attempt = { id: uuidv4(), quizId: req.params.id, studentId: req.user.id, studentName: req.user.name, answers, detailed, score, total, percentage: Math.round((score / total) * 100), timeTaken, submittedAt: new Date().toISOString() };
  store.quizAttempts.push(attempt);

  // Notify teacher
  store.notifications.push({
    id: uuidv4(), userId: quiz.teacherId,
    title: 'Quiz Submitted', message: `${req.user.name} completed ${quiz.title}. Score: ${score}/${total}`,
    type: 'quiz', read: false, createdAt: new Date().toISOString(), from: req.user.name
  });

  res.status(201).json(attempt);
});

// Get quiz results/attempts (teacher)
router.get('/:id/attempts', auth, requireRole('teacher', 'admin'), (req, res) => {
  const attempts = store.quizAttempts.filter(a => a.quizId === req.params.id);
  res.json(attempts);
});

module.exports = router;
