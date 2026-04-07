# 🎓 SkillBridge — Academic Learning Effectiveness Platform

A full-stack academic learning platform with **role-based access** for Students, Teachers, and Admins.

---

## 📁 Project Structure

```
skillbridge/
├── backend/          ← Node.js + Express API (no database required)
│   ├── server.js
│   ├── store.js      ← In-memory data store with seed data
│   ├── middleware/
│   │   └── auth.js
│   └── routes/
│       ├── auth.js
│       ├── courses.js
│       ├── assignments.js
│       ├── quizzes.js
│       └── misc.js   ← messages, notifications, todos, certificates, admin
└── frontend/         ← React 18 + React Router v6
    ├── public/
    └── src/
        ├── App.js
        ├── index.css  ← Full pastel design system
        ├── context/
        │   └── AuthContext.js
        ├── utils/
        │   └── api.js
        ├── components/layout/
        │   ├── Sidebar.js
        │   └── Layout.js
        └── pages/
            ├── LoginPage.js
            ├── student/   ← Dashboard, Courses, Assignments, Quizzes, Messages, etc.
            ├── teacher/   ← Dashboard, Courses, Assignments, Quizzes, Students, etc.
            └── admin/     ← Dashboard, Students, Teachers, Courses, Enrollments, etc.
```

---

## 🚀 Quick Start

### 1. Start the Backend

```bash
cd skillbridge/backend
npm install
npm start
# Server runs on http://localhost:5000
```

### 2. Start the Frontend

```bash
cd skillbridge/frontend
npm install
npm start
# App opens at http://localhost:3000
```

---

## 🔐 Demo Credentials

| Role    | Email                       | Password    |
|---------|-----------------------------|-------------|
| Admin   | admin@skillbridge.com       | admin123    |
| Teacher | sarah@skillbridge.com       | teacher123  |
| Teacher | michael@skillbridge.com     | teacher123  |
| Student | alice@skillbridge.com       | student123  |
| Student | bob@skillbridge.com         | student123  |

---

## ✨ Features by Role

### 👩‍🎓 Student
- **Dashboard** — Welcome message, To-Do list, active course count, study heatmap, assignment deadlines
- **All Courses** — Browse and enroll in courses (filter by category/level/search)
- **My Courses** — View enrolled courses, update progress via slider
- **Assignments** — View/submit assignments (file upload + notes), see grades & feedback
- **Quizzes** — Timed quiz engine with countdown, instant scoring after teacher's deadline
- **Progress** — Heatmap of 90 days, bar chart of weekly activity, per-course progress
- **Certificates** — Upload achievement certificates (PDF/image) for teacher verification
- **Messages** — Send questions to specific teachers, threaded replies
- **Notifications** — All notifications with history (assignments, quizzes, grades, announcements)
- **Profile** — Edit personal info, grade, phone, bio

### 👨‍🏫 Teacher
- **Dashboard** — Course count, total students, submission count, unread messages
- **My Courses** — Create/delete courses, view enrolled students per course with details
- **Assignments** — Create assignments with deadline, view all submissions, grade with feedback
- **Quizzes** — Create quizzes with multiple questions/options/correct answers, set duration & time, view all attempts with scores
- **Students** — Browse students per course, see their progress, certificates
- **Certificates** — View student-uploaded certificates, verify them (adds to student record)
- **Messages** — Reply to student questions with threaded conversation
- **Notifications** — Receive notifications, send announcements to all students
- **Profile** — Edit profile

### 🛡️ Admin
- **Dashboard** — Full platform stats: student/teacher/admin/course/enrollment/assignment/quiz counts
- **All Students** — View, add, remove students; click to see student details (courses, certificates)
- **All Teachers** — View, add, remove teachers with subject info
- **Courses** — View all courses across platform, delete any course
- **Enrollments** — Visual overview of enrollment counts per course
- **Notifications** — Send platform-wide announcements, view own notifications
- **Admin Details** — See all admin accounts (admin-only secure view)
- **Profile** — Edit profile

---

## 🎨 Design System

- **Color Palette**: Pastel purples, soft cyan, warm amber, mint green
- **Font**: Plus Jakarta Sans (body) + Fraunces (headings)
- **Components**: Cards, modals, tables, badges, progress bars, heatmap, form inputs
- **Animations**: Smooth hover lifts, modal slide-up, progress bar transitions

---

## 🛠 Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Frontend  | React 18, React Router v6, Axios        |
| Backend   | Node.js, Express 4                      |
| Auth      | JWT (jsonwebtoken), bcryptjs            |
| Storage   | In-memory store (no database needed)    |
| Files     | Multer (file uploads)                   |
| Styling   | Pure CSS with CSS variables             |

> **Note**: Uses in-memory storage — data resets when the server restarts.
> To persist data, swap `store.js` for MongoDB/PostgreSQL.

---

## 📡 API Endpoints

| Method | Endpoint                          | Description              |
|--------|-----------------------------------|--------------------------|
| POST   | /api/auth/login                   | Login                    |
| POST   | /api/auth/register                | Register                 |
| GET    | /api/courses                      | All courses              |
| POST   | /api/courses/:id/enroll           | Enroll in course         |
| GET    | /api/assignments                  | User's assignments       |
| POST   | /api/assignments/:id/submit       | Submit assignment        |
| GET    | /api/quizzes                      | User's quizzes           |
| POST   | /api/quizzes/:id/attempt          | Submit quiz              |
| GET    | /api/messages                     | Conversations            |
| POST   | /api/messages                     | Send message             |
| GET    | /api/notifications                | User notifications       |
| POST   | /api/certificates/upload          | Upload certificate       |
| GET    | /api/admin/stats                  | Admin statistics         |

---

## 🔧 Customization Tips

1. **Add a database**: Replace `store.js` with Mongoose models or Sequelize
2. **Email notifications**: Add Nodemailer in the routes where notifications are created
3. **Real-time**: Add Socket.io to `server.js` for live chat and notifications
4. **File storage**: Replace local Multer storage with AWS S3 or Cloudinary
5. **Add more roles**: Extend `requireRole()` middleware and add new nav sections

---

Built with ❤️ by SkillBridge Team
