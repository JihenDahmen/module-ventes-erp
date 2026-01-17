// src/services/api.js - version de test
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',  // URL directe
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
