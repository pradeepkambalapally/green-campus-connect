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

// Challenges & Evidence Submissions
export const challengesAPI = {
  getAll: (params) => API.get('/challenges', { params }),
  getOne: (id) => API.get(`/challenges/${id}`),
  join: (id) => API.post(`/challenges/${id}/join`),
  getParticipation: (id) => API.get(`/challenges/${id}/participation`),
  submit: (id, data) => API.post(`/challenges/${id}/submit`, data),
  uploadEvidence: (formData) =>
    API.post('/submissions/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  submitEvidence: (data) => API.post('/submissions', data),
  getMySubmissions: () => API.get('/submissions/me'),
  getMyChallenges: () => API.get('/users/me/challenges'),
};

// Submissions alias
export const submissionsAPI = {
  uploadEvidence: (formData) =>
    API.post('/submissions/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  submit: (data) => API.post('/submissions', data),
  getMySubmissions: () => API.get('/submissions/me'),
};

// Users & Dashboard
export const usersAPI = {
  getProfile: () => API.get('/users/me/profile'),
  updateProfile: (data) => API.put('/users/me/profile', data),
  uploadAvatar: (formData) =>
    API.post('/users/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getProgress: () => API.get('/users/me/progress'),
  getBadges: () => API.get('/users/me/badges'),
  getDashboard: () => API.get('/users/me/dashboard'),
  getLearningProgress: () => API.get('/users/me/learning-progress'),
  getMyChallenges: () => API.get('/users/me/challenges'),
  getMySubmissions: () => API.get('/users/me/submissions'),
};

export const dashboardAPI = {
  getStudentDashboard: () => API.get('/users/me/dashboard'),
};

// Leaderboard
export const leaderboardAPI = {
  get: (params) => {
    if (typeof params === 'number') {
      return API.get(`/leaderboard?limit=${params}`);
    }
    return API.get('/leaderboard', { params });
  },
};

// Admin
export const adminAPI = {
  getAnalytics: () => API.get('/admin/analytics'),
  getSubmissions: (params) => API.get('/admin/submissions', { params }),
  getSubmission: (id) => API.get(`/admin/submissions/${id}`),
  approveSubmission: (id) => API.patch(`/admin/submissions/${id}/approve`),
  rejectSubmission: (id, reason) => API.patch(`/admin/submissions/${id}/reject`, { reason }),
  createChallenge: (data) => API.post('/admin/challenges', data),
  updateChallenge: (id, data) => API.put(`/admin/challenges/${id}`, data),
  deleteChallenge: (id) => API.delete(`/admin/challenges/${id}`),
  createModule: (data) => API.post('/admin/modules', data),
  updateModule: (id, data) => API.put(`/admin/modules/${id}`, data),
};

export default API;
