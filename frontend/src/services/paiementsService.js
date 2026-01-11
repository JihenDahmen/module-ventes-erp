import api from './api';

export const paiementsService = {
  getAll() {
    return api.get('/paiements');
  },
  
  create(paiementData) {
    return api.post('/paiements', paiementData);
  },
  
  getByFacture(factureId) {
    return api.get(`/paiements/facture/${factureId}`);
  },
  
  associateManually(data) {
    return api.post('/paiements/association-manuelle', data);
  },
   annuler(id) {
    return api.put(`/paiements/${id}/annuler`);
  }
};