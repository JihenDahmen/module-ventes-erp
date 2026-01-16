import api from './api';

export const produitsService = {
  getAll() {
    return api.get('/produits');
  },
  
  getById(id) {
    return api.get(`/produits/${id}`);
  },
  
  create(produitData) {
    return api.post('/produits', produitData);
  },
  
  update(id, produitData) {
    return api.put(`/produits/${id}`, produitData);
  },
  
  updateStock(id, quantite) {
    return api.put(`/produits/${id}/stock`, { quantite });
  },
  
  delete(id) {
    return api.delete(`/produits/${id}`);
  }
};