import axios from 'axios';
import router from '@/router';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Intercepteur requêtes
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Intercepteur réponses
api.interceptors.response.use(
  response => response.data,
  error => {
    console.error('API Error:', error.response || error.message);
    
    if (error.response) {
      switch (error.response.status) {
        case 401:
          localStorage.removeItem('token');
          router.push('/login');
          break;
        case 403:
          alert('Accès refusé');
          break;
        case 404:
          console.warn('Resource not found');
          break;
        case 500:
          alert('Erreur serveur. Veuillez réessayer plus tard.');
          break;
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;