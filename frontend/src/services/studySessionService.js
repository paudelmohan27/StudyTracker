import api from './api';

const StudySessionService = {
  create: async (data) => {
    return api.post('/api/study-sessions', data);
  },
  getHistory: async () => {
    return api.get('/api/study-sessions/history');
  },
  getStats: async () => {
    return api.get('/api/study-sessions/stats');
  },
};

export default StudySessionService;
