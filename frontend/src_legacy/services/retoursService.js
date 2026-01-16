import api from './api';

export const retoursService = {
  getAll() {
    return api.get('/retours');
  },
  
  getById(id) {
    return api.get(`/retours/${id}`);
  },
  
  create(retourData) {
    return api.post('/retours', retourData);
  },
  
  validate(id) {
    console.log('Service validate appelé avec ID:', id);
    
    // Validation frontend
    if (!id || id === 'undefined' || id === 'null') {
      return Promise.reject(new Error('ID de retour invalide'));
    }
    
    // Convertir en nombre si nécessaire
    const numericId = parseInt(id);
    if (isNaN(numericId)) {
      return Promise.reject(new Error('ID doit être un nombre'));
    }
    
    return api.put(`/retours/${numericId}/valider`);
  },
  
    receive(id) {
    return api.put(`/retours/${id}/receptionner`);
  },

  
  createAvoir(id, avoirData) {
    return api.post(`/retours/${id}/avoir`, avoirData);
  },
  
  processComplete(data) {
    return api.post('/retours/complet', data);
  },
  
   reject(id, raison) {
    return api.put(`/retours/${id}/rejeter`, { raison });
  }
};