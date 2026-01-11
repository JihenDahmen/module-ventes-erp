import api from './api';

export const avoirsService = {
  getAll() {
    return api.get('/avoirs');
  },
  
  create(avoirData) {
    return api.post('/avoirs', avoirData);
  },
  
  apply(avoirId, factureId) {
    return api.post('/avoirs/appliquer', { avoirId, factureId });
  },
  
  getByClient(clientId) {
    return api.get(`/avoirs/client/${clientId}`);
  },
   annuler(id) {
    return api.put(`/avoirs/${id}/annuler`);
  },
   effectuerRemboursement(id, remboursementData) {
    return api.post(`/avoirs/${id}/rembourser`, remboursementData);
  },
  
  demarrerEchange(id) {
    return api.post(`/avoirs/${id}/echange/processus`);
  }
};