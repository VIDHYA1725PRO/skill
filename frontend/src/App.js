import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import './index.css';

// Auth
import LoginPage from './pages/LoginPage';

// Student
import StudentDashboard from './pages/student/Dashboard';
import AllCourses from './pages/student/AllCourses';
import MyCourses from './pages/student/MyCourses';
import StudentAssignments from './pages/student/Assignments';
import StudentQuizzes from './pages/student/Quizzes';
import StudentMessages from './pages/student/Messages';
import {
  StudentNotifications,
  StudentProgress,
  StudentCertificates,
  StudentProfile
} from './pages/student/StudentPages';

// Teacher
import TeacherDashboard from './pages/teacher/Dashboard';
import TeacherCourses from './pages/teacher/Courses';
import TeacherAssignments from './pages/teacher/Assignments';
import TeacherQuizzes from './pages/teacher/Quizzes';
import {
  TeacherStudents,
  TeacherCertificates,
  TeacherMessages,
  TeacherNotifications,
  TeacherProfile
} from './pages/teacher/TeacherPages';

// Admin
import AdminDashboard from './pages/admin/Dashboard';
import {
  AdminStudents,
  AdminTeachers,
  AdminCourses,
  AdminEnrollments,
  AdminNotifications,
  AdminAdmins,
  AdminProfile
} from './pages/admin/AdminPages';

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to={`/${user.role}/dashboard`} />;
  return children;
}

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" />;
  return <Navigate to={`/${user.role}/dashboard`} />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Student Routes */}
          <Route path="/student/dashboard" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
          <Route path="/student/courses" element={<ProtectedRoute role="student"><AllCourses /></ProtectedRoute>} />
          <Route path="/student/my-courses" element={<ProtectedRoute role="student"><MyCourses /></ProtectedRoute>} />
          <Route path="/student/assignments" element={<ProtectedRoute role="student"><StudentAssignments /></ProtectedRoute>} />
          <Route path="/student/quizzes" element={<ProtectedRoute role="student"><StudentQuizzes /></ProtectedRoute>} />
          <Route path="/student/progress" element={<ProtectedRoute role="student"><StudentProgress /></ProtectedRoute>} />
          <Route path="/student/certificates" element={<ProtectedRoute role="student"><StudentCertificates /></ProtectedRoute>} />
          <Route path="/student/messages" element={<ProtectedRoute role="student"><StudentMessages /></ProtectedRoute>} />
          <Route path="/student/notifications" element={<ProtectedRoute role="student"><StudentNotifications /></ProtectedRoute>} />
          <Route path="/student/profile" element={<ProtectedRoute role="student"><StudentProfile /></ProtectedRoute>} />

          {/* Teacher Routes */}
          <Route path="/teacher/dashboard" element={<ProtectedRoute role="teacher"><TeacherDashboard /></ProtectedRoute>} />
          <Route path="/teacher/courses" element={<ProtectedRoute role="teacher"><TeacherCourses /></ProtectedRoute>} />
          <Route path="/teacher/students" element={<ProtectedRoute role="teacher"><TeacherStudents /></ProtectedRoute>} />
          <Route path="/teacher/assignments" element={<ProtectedRoute role="teacher"><TeacherAssignments /></ProtectedRoute>} />
          <Route path="/teacher/quizzes" element={<ProtectedRoute role="teacher"><TeacherQuizzes /></ProtectedRoute>} />
          <Route path="/teacher/certificates" element={<ProtectedRoute role="teacher"><TeacherCertificates /></ProtectedRoute>} />
          <Route path="/teacher/messages" element={<ProtectedRoute role="teacher"><TeacherMessages /></ProtectedRoute>} />
          <Route path="/teacher/notifications" element={<ProtectedRoute role="teacher"><TeacherNotifications /></ProtectedRoute>} />
          <Route path="/teacher/profile" element={<ProtectedRoute role="teacher"><TeacherProfile /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/students" element={<ProtectedRoute role="admin"><AdminStudents /></ProtectedRoute>} />
          <Route path="/admin/teachers" element={<ProtectedRoute role="admin"><AdminTeachers /></ProtectedRoute>} />
          <Route path="/admin/courses" element={<ProtectedRoute role="admin"><AdminCourses /></ProtectedRoute>} />
          <Route path="/admin/enrollments" element={<ProtectedRoute role="admin"><AdminEnrollments /></ProtectedRoute>} />
          <Route path="/admin/notifications" element={<ProtectedRoute role="admin"><AdminNotifications /></ProtectedRoute>} />
          <Route path="/admin/admins" element={<ProtectedRoute role="admin"><AdminAdmins /></ProtectedRoute>} />
          <Route path="/admin/profile" element={<ProtectedRoute role="admin"><AdminProfile /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
