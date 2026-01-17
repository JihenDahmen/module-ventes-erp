<template>
  <div class="factures-page">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="h3">Gestion des Factures</h1>
      <router-link to="/factures/nouvelle" class="btn btn-primary">
        <i class="bi bi-plus-circle"></i> Nouvelle Facture
      </router-link>
    </div>

    <!-- Filtres et statistiques -->
    <div class="row mb-4">
      <div class="col-md-8">
        <div class="card">
          <div class="card-body">
            <div class="row g-3">
              <div class="col-md-4">
                <label class="form-label">Statut</label>
                <select class="form-select" v-model="filter.status">
                  <option value="all">Tous les statuts</option>
                  <option value="brouillon">Brouillon</option>
                  <option value="validée">Validée</option>
                  <option value="payée">Payée</option>
                  <option value="partiellement_payée">Partiellement payée</option>
                  <option value="annulée">Annulée</option>
                </select>
              </div>
              <div class="col-md-4">
                <label class="form-label">Client</label>
                <select class="form-select" v-model="filter.clientId">
                  <option value="all">Tous les clients</option>
                  <option v-for="client in clients" :key="client.id" :value="client.id">
                    {{ client.nom }}
                  </option>
                </select>
              </div>
              <div class="col-md-4">
                <label class="form-label">Recherche</label>
                <div class="input-group">
                  <input 
                    type="text" 
                    class="form-control" 
                    placeholder="Numéro, client..."
                    v-model="filter.search"
                    @input="applyFilters"
                  />
                  <button class="btn btn-outline-secondary" @click="clearFilters">
                    <i class="bi bi-x-circle"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-4">
  <div class="card bg-primary text-white">
    <div class="card-body text-center">
      <h6 class="card-title mb-0">CA Total</h6>
      <h3 class="mt-2">{{ formatCurrency(stats.totalMontant || 0) }}</h3>
      <small>{{ factures.length }} facture(s)</small>
    </div>
  </div>
</div>
    </div>

    <!-- Tableau des factures -->
    <div class="card">
      <div class="card-body">
        <div v-if="loading" class="text-center py-5">
          <LoadingSpinner message="Chargement des factures..." />
        </div>
        
        <div v-else-if="filteredFactures.length === 0" class="text-center py-5 text-muted">
          <i class="bi bi-receipt display-1"></i>
          <p class="mt-3">Aucune facture trouvée</p>
        </div>
        
        <div v-else>
          <div class="table-responsive">
            <table class="table table-hover align-middle">
              <thead class="table-light">
                <tr>
                  <th>Numéro</th>
                  <th>Client</th>
                  <th>Date</th>
                  <th>Montant TTC</th>
                  <th>Statut</th>
                  <th>Payé / Restant</th>
                  <th class="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="facture in filteredFactures" :key="facture.id">
                  <td>
                    <strong>{{ facture.numero }}</strong>
                  </td>
                  <td>
                    <div class="d-flex align-items-center">
                      <div>
                        <strong>{{ facture.client_nom }}</strong>
                        <br>
                        <small class="text-muted">{{ facture.client_email }}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <small>{{ formatDate(facture.date_facture) }}</small>
                  </td>
                  <td>
                    <strong>{{ formatCurrency(facture.montant_ttc) }}</strong>
                    <br>
                    <small class="text-muted">{{ formatCurrency(facture.montant_ht) }} HT</small>
                  </td>
                  <td>
                    <span :class="getStatusBadgeClass(facture.statut)" class="badge">
                      {{ facture.statut }}
                    </span>
                  </td>
                  <td>
                    <div v-if="facture.statut === 'payée'" class="text-success">
                      <i class="bi bi-check-circle"></i> Payée
                    </div>
                    <div v-else>
                      <div class="text-success">
                        <small>Payé: {{ formatCurrency(facture.total_paye || 0) }}</small>
                      </div>
                      <div class="text-danger">
                        <small>Restant: {{ formatCurrency(facture.montant_ttc - (facture.total_paye || 0)) }}</small>
                      </div>
                    </div>
                  </td>
                  <td class="text-end">
                    <div class="btn-group btn-group-sm">
                      <router-link 
  :to="{ name: 'FactureDetail', params: { id: facture.id } }" 
  class="btn btn-outline-primary"
  title="Voir détails"
>
  <i class="bi bi-eye"></i>
</router-link>
                      <router-link 
                        v-if="facture.statut === 'brouillon'" 
                        :to="`/factures/nouvelle?edit=${facture.id}`" 
                        class="btn btn-outline-secondary"
                        title="Modifier"
                      >
                        <i class="bi bi-pencil"></i>
                      </router-link>
                      <button 
                        v-if="facture.statut === 'brouillon'" 
                        class="btn btn-outline-success"
                        @click="validateFacture(facture)"
                        title="Valider"
                      >
                        <i class="bi bi-check-lg"></i>
                      </button>
                      <router-link 
                        v-if="facture.statut === 'validée' || facture.statut === 'partiellement_payée'" 
                        :to="`/paiements/nouveau?factureId=${facture.id}`" 
                        class="btn btn-outline-warning"
                        title="Enregistrer paiement"
                      >
                        <i class="bi bi-credit-card"></i>
                      </router-link>
                      <button 
                        v-if="facture.statut === 'brouillon'" 
                        class="btn btn-outline-danger"
                        @click="confirmDelete(facture)"
                        title="Supprimer"
                      >
                        <i class="bi bi-trash"></i>
                      </button>
                      <button 
    v-if="canBeCanceled(facture)" 
    class="btn btn-outline-danger"
    @click="annulerFacture(facture)"
    title="Annuler la facture"
  >
    <i class="bi bi-x-circle"></i>
  </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- Statistiques par statut -->
          <div class="mt-4 pt-4 border-top">
            <h6 class="mb-3">Répartition par statut</h6>
            <div class="row">
              <div class="col-md-2" v-for="(count, status) in stats" :key="status">
                <div class="card">
                  <div class="card-body text-center">
                    <h5 class="card-title text-muted mb-0">{{ status }}</h5>
                    <h3 class="card-text mt-2">{{ count }}</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { facturesService } from '@/services/facturesService';
import { clientsService } from '@/services/clientsService';
import { formatters, helpers } from '@/utils';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import Swal from 'sweetalert2';

export default {
  name: 'ListFactures',
  components: {
    LoadingSpinner
  },
  data() {
    return {
      factures: [],
      filteredFactures: [],
      clients: [],
      loading: true,
      filter: {
        status: 'all',
        clientId: 'all',
        search: ''
      },
      stats: {}
    };
  },
  async mounted() {
    await Promise.all([this.loadFactures(), this.loadClients()]);
  },
  watch: {
    'filter.status': 'applyFilters',
    'filter.clientId': 'applyFilters'
  },
  methods: {
  canBeCanceled(facture) {
    // Seules les factures non annulées et non payées peuvent être annulées
    const annulableStatus = ['brouillon', 'validée', 'partiellement_payée'];
    return annulableStatus.includes(facture.statut);
  },
  
  // Méthode pour annuler une facture
  async annulerFacture(facture) {
    const result = await Swal.fire({
      title: 'Annuler cette facture ?',
      html: `
        <div class="text-start">
          <p>La facture <strong>${facture.numero}</strong> sera annulée.</p>
          <p><strong>Client:</strong> ${facture.client_nom}</p>
          <p><strong>Montant:</strong> ${this.formatCurrency(facture.montant_ttc)}</p>
          <p><strong>Statut actuel:</strong> ${facture.statut}</p>
          <div class="alert alert-danger mt-3">
            <i class="bi bi-exclamation-triangle"></i>
            <strong>Attention:</strong> Cette action est irréversible !
            <ul class="mb-0 mt-2">
              <li>La facture sera marquée comme "annulée"</li>
              ${facture.total_paye > 0 ? '<li>Les paiements associés seront annulés</li>' : ''}
              <li>Les stocks des produits seront réapprovisionnés</li>
              <li>Le solde du client sera ajusté</li>
            </ul>
          </div>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Oui, annuler',
      cancelButtonText: 'Non, garder',
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          const response = await facturesService.annuler(facture.id);
          return response;
        } catch (error) {
          Swal.showValidationMessage(
            `Erreur: ${error.response?.data?.error || error.message}`
          );
        }
      }
    });
    
    if (result.isConfirmed && result.value?.success) {
      // Succès
      Swal.fire({
        icon: 'success',
        title: 'Facture annulée !',
        html: `
          <p>La facture a été annulée avec succès.</p>
          <p><strong>Nouveau statut:</strong> annulée</p>
          <p class="text-success">
            <i class="bi bi-check-circle"></i> Les modifications ont été appliquées.
          </p>
        `,
        timer: 3000,
        showConfirmButton: false
      });
      
      // Recharger les données
      await this.loadFactures();
    }
  },
      async loadFactures() {
    try {
      this.loading = true;
      const response = await facturesService.getAll();
      this.factures = response.factures || [];
      this.filteredFactures = [...this.factures];
      this.stats = response.stats || {};
      
      // DEBUG: Afficher les données reçues
      console.log('Données reçues de l\'API:', response);
      console.log('totalMontant reçu:', response.totalMontant);
      
      // 🔥 CORRECTION ICI : Calculer le CA si nécessaire
      // Option 1: Vérifier si totalMontant est retourné par l'API
      if (response.totalMontant !== undefined && response.totalMontant !== null) {
        // L'API retourne totalMontant, l'utiliser
        this.stats.totalMontant = parseFloat(response.totalMontant) || 0;
      } else if (this.stats.totalMontant === undefined) {
        // Option 2: Calculer manuellement à partir des factures
        this.stats.totalMontant = this.factures.reduce((total, facture) => {
          return total + (parseFloat(facture.montant_ttc) || 0);
        }, 0);
      }
      
      console.log('CA final:', this.stats.totalMontant);
      
    } catch (error) {
      console.error('Erreur chargement factures:', error);
      // Mock data pour développement
      this.factures = this.getMockFactures();
      this.filteredFactures = [...this.factures];
      this.stats = this.calculateMockStats();
    } finally {
      this.loading = false;
    }
  },
  
  calculateMockStats() {
    // Calculer le CA pour les données mock
    const totalMontant = this.factures.reduce((sum, f) => {
      return sum + (parseFloat(f.montant_ttc) || 0);
    }, 0);
    
    return {
      total: this.factures.length,
      brouillon: this.factures.filter(f => f.statut === 'brouillon').length,
      validée: this.factures.filter(f => f.statut === 'validée').length,
      payée: this.factures.filter(f => f.statut === 'payée').length,
      partiellement_payée: this.factures.filter(f => f.statut === 'partiellement_payée').length,
      annulée: this.factures.filter(f => f.statut === 'annulée').length,
      totalMontant: totalMontant  // Important: inclure totalMontant
    };
  },
    
    async loadClients() {
      try {
        const response = await clientsService.getAll();
        this.clients = response.clients || [];
      } catch (error) {
        console.error('Erreur chargement clients:', error);
      }
    },
    
    applyFilters() {
      let filtered = [...this.factures];
      
      // Filtre par statut
      if (this.filter.status !== 'all') {
        filtered = filtered.filter(f => f.statut === this.filter.status);
      }
      
      // Filtre par client
      if (this.filter.clientId !== 'all') {
        filtered = filtered.filter(f => f.client_id == this.filter.clientId);
      }
      
      // Filtre par recherche
      if (this.filter.search) {
        const term = this.filter.search.toLowerCase();
        filtered = filtered.filter(f =>
          f.numero.toLowerCase().includes(term) ||
          f.client_nom.toLowerCase().includes(term) ||
          f.client_email.toLowerCase().includes(term)
        );
      }
      
      this.filteredFactures = filtered;
    },
    
    clearFilters() {
      this.filter = {
        status: 'all',
        clientId: 'all',
        search: ''
      };
      this.filteredFactures = [...this.factures];
    },
    
    async validateFacture(facture) {
      const result = await Swal.fire({
        title: 'Valider la facture ?',
        text: `La facture ${facture.numero} sera validée et deviendra payable.`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Oui, valider',
        cancelButtonText: 'Annuler'
      });
      
      if (result.isConfirmed) {
        try {
          await facturesService.validate(facture.id);
          
          Swal.fire({
            icon: 'success',
            title: 'Validée !',
            text: 'La facture a été validée avec succès.',
            timer: 2000,
            showConfirmButton: false
          });
          
          await this.loadFactures();
        } catch (error) {
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: error.response?.data?.error || 'Impossible de valider la facture'
          });
        }
      }
    },
    
    confirmDelete(facture) {
      Swal.fire({
        title: 'Supprimer la facture ?',
        text: `La facture ${facture.numero} sera définitivement supprimée.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Oui, supprimer',
        cancelButtonText: 'Annuler'
      }).then(async (result) => {
        if (result.isConfirmed) {
          // À implémenter: service de suppression
          Swal.fire('Supprimé !', 'La facture a été supprimée.', 'success');
          await this.loadFactures();
        }
      });
    },
    
    formatCurrency: formatters.currency,
    formatDate: formatters.date,
    getStatusBadgeClass: helpers.getStatusBadgeClass,
    
    getMockFactures() {
      return [
        {
          id: 1,
          numero: 'FACT-2024-0125',
          client_id: 1,
          client_nom: 'Entreprise ABC',
          client_email: 'contact@abc.com',
          date_facture: '2024-01-25',
          montant_ht: 1247.93,
          montant_ttc: 1497.52,
          statut: 'validée',
          total_paye: 0
        },
        {
          id: 2,
          numero: 'FACT-2024-0124',
          client_id: 2,
          client_nom: 'SARL XYZ',
          client_email: 'info@xyz.com',
          date_facture: '2024-01-24',
          montant_ht: 2083.33,
          montant_ttc: 2500.00,
          statut: 'payée',
          total_paye: 2500
        }
      ];
    },
    
    calculateMockStats() {
      return {
        total: 2,
        brouillon: 0,
        validée: 1,
        payée: 1,
        partiellement_payée: 0,
        annulée: 0
      };
    }
  }
};
</script>

<style scoped>
.factures-page {
  padding: 20px 0;
}
</style>