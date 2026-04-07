import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

API.interceptors.request.use(cfg => {
  const token = localStorage.getItem('sb_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

API.interceptors.response.use(r => r, e => {
  if (e.response?.status === 401) {
    localStorage.removeItem('sb_token');
    localStorage.removeItem('sb_user');
    window.location.href = '/login';
  }
  return Promise.reject(e);
});

export const auth = {
  login: (d) => API.post('/auth/login', d),
  register: (d) => API.post('/auth/register', d),
  me: () => API.get('/auth/me'),
  updateProfile: (d) => API.put('/auth/profile', d),
};

export const courses = {
  getAll: () => API.get('/courses'),
  getOne: (id) => API.get(`/courses/${id}`),
  create: (d) => API.post('/courses', d),
  update: (id, d) => API.put(`/courses/${id}`, d),
  delete: (id) => API.delete(`/courses/${id}`),
  enroll: (id) => API.post(`/courses/${id}/enroll`),
  myEnrolled: () => API.get('/courses/my/enrolled'),
  teacherCourses: () => API.get('/courses/teacher/mine'),
  students: (id) => API.get(`/courses/${id}/students`),
  updateProgress: (id, p) => API.put(`/courses/${id}/progress`, { progress: p }),
};

export const assignments = {
  getAll: () => API.get('/assignments'),
  create: (d) => API.post('/assignments', d),
  delete: (id) => API.delete(`/assignments/${id}`),
  submit: (id, d) => API.post(`/assignments/${id}/submit`, d),
  submissions: (id) => API.get(`/assignments/${id}/submissions`),
  grade: (subId, d) => API.put(`/assignments/submissions/${subId}/grade`, d),
};

export const quizzes = {
  getAll: () => API.get('/quizzes'),
  getOne: (id) => API.get(`/quizzes/${id}`),
  create: (d) => API.post('/quizzes', d),
  update: (id, d) => API.put(`/quizzes/${id}`, d),
  delete: (id) => API.delete(`/quizzes/${id}`),
  attempt: (id, d) => API.post(`/quizzes/${id}/attempt`, d),
  attempts: (id) => API.get(`/quizzes/${id}/attempts`),
};

export const messages = {
  getAll: () => API.get('/messages'),
  send: (d) => API.post('/messages', d),
  reply: (id, d) => API.post(`/messages/${id}/reply`, d),
  markRead: (id) => API.put(`/messages/${id}/read`),
};

export const notifications = {
  getAll: () => API.get('/notifications'),
  markRead: (id) => API.put(`/notifications/${id}/read`),
  markAllRead: () => API.put('/notifications/read-all'),
  send: (d) => API.post('/notifications/send', d),
};

export const todos = {
  getAll: () => API.get('/todos'),
  create: (d) => API.post('/todos', d),
  update: (id, d) => API.put(`/todos/${id}`, d),
  delete: (id) => API.delete(`/todos/${id}`),
};

export const studyLogs = {
  getAll: () => API.get('/study-logs'),
  log: (d) => API.post('/study-logs', d),
};

export const certificates = {
  getAll: () => API.get('/certificates'),
  upload: (d) => API.post('/certificates/upload', d, { headers: { 'Content-Type': 'multipart/form-data' } }),
  verify: (id) => API.put(`/certificates/${id}/verify`),
};

export const admin = {
  stats: () => API.get('/admin/stats'),
  users: () => API.get('/users'),
  userDetail: (id) => API.get(`/users/${id}`),
  deleteUser: (id) => API.delete(`/users/${id}`),
};

export const teachers = {
  getAll: () => API.get('/teachers'),
};

export default API;
