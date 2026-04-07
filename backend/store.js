// In-memory data store (replaces database for zero-dependency setup)
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

const store = {
  users: [],
  courses: [],
  enrollments: [],
  assignments: [],
  submissions: [],
  quizzes: [],
  quizAttempts: [],
  messages: [],
  notifications: [],
  certificates: [],
  todos: [],
  studyLogs: [],
};

// Seed initial data
async function seedData() {
  const adminPass = await bcrypt.hash('admin123', 10);
  const teacherPass = await bcrypt.hash('teacher123', 10);
  const studentPass = await bcrypt.hash('student123', 10);

  const adminId = uuidv4();
  const teacher1Id = uuidv4();
  const teacher2Id = uuidv4();
  const student1Id = uuidv4();
  const student2Id = uuidv4();
  const student3Id = uuidv4();

  store.users = [
    {
      id: adminId, name: 'Admin User', email: 'admin@skillbridge.com',
      password: adminPass, role: 'admin', avatar: 'A',
      createdAt: new Date().toISOString(), department: 'Administration', phone: '+1-555-0100'
    },
    {
      id: teacher1Id, name: 'Dr. Sarah Johnson', email: 'sarah@skillbridge.com',
      password: teacherPass, role: 'teacher', avatar: 'S',
      subject: 'Mathematics', createdAt: new Date().toISOString(),
      bio: 'PhD in Mathematics with 10 years of teaching experience.', phone: '+1-555-0101'
    },
    {
      id: teacher2Id, name: 'Prof. Michael Chen', email: 'michael@skillbridge.com',
      password: teacherPass, role: 'teacher', avatar: 'M',
      subject: 'Computer Science', createdAt: new Date().toISOString(),
      bio: 'Expert in AI and Machine Learning.', phone: '+1-555-0102'
    },
    {
      id: student1Id, name: 'Alice Williams', email: 'alice@skillbridge.com',
      password: studentPass, role: 'student', avatar: 'A',
      grade: '10th', createdAt: new Date().toISOString(), phone: '+1-555-0103',
      certificates: []
    },
    {
      id: student2Id, name: 'Bob Martinez', email: 'bob@skillbridge.com',
      password: studentPass, role: 'student', avatar: 'B',
      grade: '11th', createdAt: new Date().toISOString(), phone: '+1-555-0104',
      certificates: []
    },
    {
      id: student3Id, name: 'Carol Davis', email: 'carol@skillbridge.com',
      password: studentPass, role: 'student', avatar: 'C',
      grade: '10th', createdAt: new Date().toISOString(), phone: '+1-555-0105',
      certificates: []
    },
  ];

  const course1Id = uuidv4();
  const course2Id = uuidv4();
  const course3Id = uuidv4();
  const course4Id = uuidv4();

  store.courses = [
    {
      id: course1Id, title: 'Advanced Calculus', description: 'Deep dive into differential and integral calculus with real-world applications.',
      teacherId: teacher1Id, teacherName: 'Dr. Sarah Johnson', category: 'Mathematics',
      duration: '12 weeks', level: 'Advanced', thumbnail: '📐', studentsCount: 0,
      createdAt: new Date().toISOString(), status: 'active', tags: ['calculus', 'math', 'advanced']
    },
    {
      id: course2Id, title: 'Linear Algebra Fundamentals', description: 'Vectors, matrices, and linear transformations explained clearly.',
      teacherId: teacher1Id, teacherName: 'Dr. Sarah Johnson', category: 'Mathematics',
      duration: '8 weeks', level: 'Intermediate', thumbnail: '🔢', studentsCount: 0,
      createdAt: new Date().toISOString(), status: 'active', tags: ['algebra', 'math', 'matrices']
    },
    {
      id: course3Id, title: 'Python for Data Science', description: 'Complete Python programming course with focus on data analysis and visualization.',
      teacherId: teacher2Id, teacherName: 'Prof. Michael Chen', category: 'Computer Science',
      duration: '10 weeks', level: 'Beginner', thumbnail: '🐍', studentsCount: 0,
      createdAt: new Date().toISOString(), status: 'active', tags: ['python', 'data science', 'programming']
    },
    {
      id: course4Id, title: 'Machine Learning Essentials', description: 'Introduction to ML algorithms, neural networks and practical applications.',
      teacherId: teacher2Id, teacherName: 'Prof. Michael Chen', category: 'Computer Science',
      duration: '14 weeks', level: 'Advanced', thumbnail: '🤖', studentsCount: 0,
      createdAt: new Date().toISOString(), status: 'active', tags: ['ml', 'ai', 'deep learning']
    },
  ];

  // Seed enrollments
  const enr1 = uuidv4(); const enr2 = uuidv4(); const enr3 = uuidv4();
  store.enrollments = [
    { id: enr1, studentId: student1Id, courseId: course1Id, enrolledAt: new Date().toISOString(), progress: 65 },
    { id: enr2, studentId: student1Id, courseId: course3Id, enrolledAt: new Date().toISOString(), progress: 30 },
    { id: enr3, studentId: student2Id, courseId: course3Id, enrolledAt: new Date().toISOString(), progress: 80 },
  ];
  store.courses[0].studentsCount = 1;
  store.courses[2].studentsCount = 2;

  // Seed assignments
  const asgn1 = uuidv4(); const asgn2 = uuidv4(); const asgn3 = uuidv4();
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 2);
  const nextWeek = new Date(); nextWeek.setDate(nextWeek.getDate() + 7);
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);

  store.assignments = [
    {
      id: asgn1, title: 'Derivative Problems Set 1', description: 'Solve 20 derivative problems covering chain rule and product rule.',
      courseId: course1Id, teacherId: teacher1Id, deadline: tomorrow.toISOString(),
      maxScore: 100, createdAt: new Date().toISOString(), status: 'active'
    },
    {
      id: asgn2, title: 'Python Data Analysis Project', description: 'Analyze a dataset using pandas and create visualizations.',
      courseId: course3Id, teacherId: teacher2Id, deadline: nextWeek.toISOString(),
      maxScore: 100, createdAt: new Date().toISOString(), status: 'active'
    },
    {
      id: asgn3, title: 'Matrix Operations Homework', description: 'Complete matrix multiplication and inversion exercises.',
      courseId: course2Id, teacherId: teacher1Id, deadline: yesterday.toISOString(),
      maxScore: 50, createdAt: new Date().toISOString(), status: 'active'
    },
  ];

  // Seed quizzes
  const quiz1Id = uuidv4();
  store.quizzes = [
    {
      id: quiz1Id, title: 'Calculus Mid-Term Quiz', courseId: course1Id,
      teacherId: teacher1Id, duration: 30, status: 'active',
      startTime: new Date().toISOString(),
      questions: [
        { id: uuidv4(), question: 'What is the derivative of x²?', options: ['x', '2x', '2x²', 'x/2'], correct: 1, points: 10 },
        { id: uuidv4(), question: 'What is ∫2x dx?', options: ['x²', 'x² + C', '2x²', '2'], correct: 1, points: 10 },
        { id: uuidv4(), question: 'What is the limit of (sin x)/x as x→0?', options: ['0', '∞', '1', 'undefined'], correct: 2, points: 10 },
        { id: uuidv4(), question: "What is d/dx(e^x)?", options: ['e^x', 'xe^(x-1)', 'e^(x-1)', '1'], correct: 0, points: 10 },
        { id: uuidv4(), question: 'Chain rule: d/dx[f(g(x))] = ?', options: ["f'(x)g'(x)", "f'(g(x))·g'(x)", "f(g'(x))", "f'(x)+g'(x)"], correct: 1, points: 10 },
      ],
      createdAt: new Date().toISOString()
    }
  ];

  // Seed study logs for heatmap
  const now = new Date();
  for (let i = 0; i < 90; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    if (Math.random() > 0.4) {
      store.studyLogs.push({
        id: uuidv4(), userId: student1Id,
        date: d.toISOString().split('T')[0],
        minutes: Math.floor(Math.random() * 180) + 30
      });
    }
  }

  // Seed notifications
  store.notifications = [
    { id: uuidv4(), userId: student1Id, title: 'New Assignment Posted', message: 'Dr. Sarah Johnson posted a new assignment: Derivative Problems Set 1', type: 'assignment', read: false, createdAt: new Date().toISOString(), from: 'Dr. Sarah Johnson' },
    { id: uuidv4(), userId: student1Id, title: 'Quiz Starting Soon', message: 'Calculus Mid-Term Quiz starts in 30 minutes!', type: 'quiz', read: false, createdAt: new Date().toISOString(), from: 'System' },
    { id: uuidv4(), userId: student2Id, title: 'Assignment Graded', message: 'Your Python project has been graded. Score: 85/100', type: 'grade', read: true, createdAt: new Date().toISOString(), from: 'Prof. Michael Chen' },
  ];

  // Seed messages
  store.messages = [
    { id: uuidv4(), senderId: student1Id, receiverId: teacher1Id, senderName: 'Alice Williams', receiverName: 'Dr. Sarah Johnson', subject: 'Question about derivatives', content: 'I am having trouble understanding the chain rule. Could you explain it with an example?', read: false, createdAt: new Date().toISOString() },
  ];

  // Seed todos
  store.todos = [
    { id: uuidv4(), userId: student1Id, title: 'Review Chapter 5 notes', completed: false, priority: 'high', createdAt: new Date().toISOString() },
    { id: uuidv4(), userId: student1Id, title: 'Submit Python assignment', completed: false, priority: 'medium', createdAt: new Date().toISOString() },
    { id: uuidv4(), userId: student1Id, title: 'Read Linear Algebra textbook', completed: true, priority: 'low', createdAt: new Date().toISOString() },
  ];

  console.log('✅ Data seeded successfully');
}

module.exports = { store, seedData, uuidv4 };
