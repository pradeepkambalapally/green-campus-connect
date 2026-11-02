import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
});

// Request interceptor to add token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Only redirect if not already on login or register
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
};

// Modules & Learning Map
export const modulesAPI = {
  getAll: () => API.get('/modules'),
  getOne: (id) => API.get(`/modules/${id}`),
  getProgress: (id) => API.get(`/modules/${id}/progress`),
  updateProgress: (id, data) => API.patch(`/modules/${id}/progress`, data),
  complete: (id) => API.post(`/modules/${id}/complete`),
  getLearningProgress: () => API.get('/users/me/learning-progress'),
};

// Quizzes
export const quizzesAPI = {
  getQuestions: (moduleId) => API.get(`/quizzes/${moduleId}`),
  submit: (moduleId, answers) => API.post(`/quizzes/${moduleId}/submit`, { answers }),
};

// Challenges
export const challengesAPI = {
  getAll: () => API.get('/challenges'),
  getOne: (id) => API.get(`/challenges/${id}`),
  join: (id) => API.post(`/challenges/${id}/join`),
  submitEvidence: (data) => API.post('/submissions', data),
};

// Users & Dashboard
export const usersAPI = {
  getProgress: () => API.get('/users/me/progress'),
  getBadges: () => API.get('/users/me/badges'),
  getDashboard: () => API.get('/users/me/dashboard'),
  getLearningProgress: () => API.get('/users/me/learning-progress'),
};

export const dashboardAPI = {
  getStudentDashboard: () => API.get('/users/me/dashboard'),
};

// Leaderboard
export const leaderboardAPI = {
  get: (limit) => API.get(`/leaderboard?limit=${limit || 20}`),
};

// Admin
export const adminAPI = {
  getAnalytics: () => API.get('/admin/analytics'),
  getSubmissions: (status) => API.get(`/admin/submissions${status ? `?status=${status}` : ''}`),
  approveSubmission: (id) => API.patch(`/admin/submissions/${id}/approve`),
  rejectSubmission: (id, reason) => API.patch(`/admin/submissions/${id}/reject`, { reason }),
  createChallenge: (data) => API.post('/admin/challenges', data),
  updateChallenge: (id, data) => API.put(`/admin/challenges/${id}`, data),
  deleteChallenge: (id) => API.delete(`/admin/challenges/${id}`),
  createModule: (data) => API.post('/admin/modules', data),
  updateModule: (id, data) => API.put(`/admin/modules/${id}`, data),
};

export default API;
