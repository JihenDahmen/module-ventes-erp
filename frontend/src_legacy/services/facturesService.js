import api from './api';

export const facturesService = {
  getAll() {
    return api.get('/factures');
  },
  
  getById(id) {
    return api.get(`/factures/${id}`);
  },
  
  create(factureData) {
    return api.post('/factures', factureData);
  },
  
  validate(id) {
    return api.put(`/factures/${id}/valider`);
  },
  
  getStatus(id) {
    return api.get(`/factures/${id}/statut`);
  },
  
  getPayments(id) {
    return api.get(`/paiements/facture/${id}`);
  },
  annuler(id) {
    return api.put(`/factures/${id}/annuler`);
  },
   getRetoursByFacture(factureId) {
    return api.get(`/factures/${factureId}/retours`);
  }
};