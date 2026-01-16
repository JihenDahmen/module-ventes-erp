import api from './api';

export const clientsService = {
  getAll() {
    return api.get('/clients');
  },
  
  getById(id) {
    return api.get(`/clients/${id}`);
  },
  
  getBalance(id) {
    return api.get(`/clients/${id}/solde`);
  },
  
    canDelete(id) {
    return api.get(`/clients/${id}/can-delete`);
  },

  create(clientData) {
    return api.post('/clients', clientData);
  },
  
  update(id, clientData) {
    return api.put(`/clients/${id}`, clientData);
  },
  
  delete(id) {
    return api.delete(`/clients/${id}`);
  }
};