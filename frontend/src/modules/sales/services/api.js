// src/services/api.js - version de test
import axios from 'axios';

const api = axios.create({
    baseURL: '/api', // Utilisation du proxy Vite
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
