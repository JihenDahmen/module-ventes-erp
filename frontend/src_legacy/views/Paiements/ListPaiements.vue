<template>
  <div class="paiements-page">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="h3">Gestion des Paiements</h1>
      <router-link to="/paiements/nouveau" class="btn btn-primary">
        <i class="bi bi-plus-circle"></i> Nouveau Paiement
      </router-link>
    </div>

    <!-- Filtres -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-3">
            <label class="form-label">Mode de paiement</label>
            <select class="form-select" v-model="filter.mode_paiement">
              <option value="all">Tous les modes</option>
              <option value="espèces">Espèces</option>
              <option value="carte">Carte bancaire</option>
              <option value="virement">Virement</option>
              <option value="chèque">Chèque</option>
              <option value="avoir">Avoir</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Statut</label>
            <select class="form-select" v-model="filter.statut">
              <option value="all">Tous les statuts</option>
              <option value="reçu">Reçu</option>
              <option value="en_attente">En attente</option>
              <option value="annulé">Annulé</option>
              <option value="rejeté">Rejeté</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Date de début</label>
            <input type="date" class="form-control" v-model="filter.date_debut">
          </div>
          <div class="col-md-3">
            <label class="form-label">Date de fin</label>
            <input type="date" class="form-control" v-model="filter.date_fin">
          </div>
        </div>
        <div class="row mt-3">
          <div class="col-md-9">
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-search"></i></span>
              <input 
                type="text" 
                class="form-control" 
                placeholder="Rechercher par référence, client, facture..."
                v-model="filter.search"
                @input="applyFilters"
              />
            </div>
          </div>
          <div class="col-md-3">
            <button class="btn btn-outline-secondary w-100" @click="clearFilters">
              <i class="bi bi-x-circle"></i> Réinitialiser
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Statistiques -->
    <div class="row mb-4">
      <div class="col-md-3">
        <div class="card bg-primary text-white">
          <div class="card-body text-center">
            <h6 class="card-title mb-0">Total Paiements</h6>
            <h3 class="mt-2">{{ stats.total }}</h3>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-success text-white">
          <div class="card-body text-center">
            <h6 class="card-title mb-0">Montant Total</h6>
            <h3 class="mt-2">{{ formatCurrency(stats.montantTotal) }}</h3>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-info text-white">
          <div class="card-body text-center">
            <h6 class="card-title mb-0">Paiements reçus</h6>
            <h3 class="mt-2">{{ stats.paiementsRecus }}</h3>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-warning text-white">
          <div class="card-body text-center">
            <h6 class="card-title mb-0">En attente</h6>
            <h3 class="mt-2">{{ stats.paiementsEnAttente }}</h3>
          </div>
        </div>
      </div>
    </div>

    <!-- Tableau des paiements -->
    <div class="card">
      <div class="card-body">
        <div v-if="loading" class="text-center py-5">
          <LoadingSpinner message="Chargement des paiements..." />
        </div>
        
        <div v-else-if="filteredPaiements.length === 0" class="text-center py-5 text-muted">
          <i class="bi bi-credit-card display-1"></i>
          <p class="mt-3">Aucun paiement trouvé</p>
        </div>
        
        <div v-else class="table-responsive">
          <table class="table table-hover align-middle">
            <thead class="table-light">
              <tr>
                <th>Référence</th>
                <th>Facture</th>
                <th>Client</th>
                <th>Montant</th>
                <th>Mode</th>
                <th>Date</th>
                <th>Statut</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="paiement in filteredPaiements" :key="paiement.id">
                <td>
                  <strong>{{ paiement.reference }}</strong>
                  <div v-if="paiement.notes" class="text-muted small">
                    <i class="bi bi-chat-left-text"></i> {{ truncate(paiement.notes, 30) }}
                  </div>
                </td>
                <td>
                  <router-link :to="`/factures/${paiement.facture_id}`" class="text-decoration-none">
                    {{ paiement.facture_numero }}
                  </router-link>
                </td>
                <td>
                  <div>{{ paiement.client_nom }}</div>
                  <div class="text-muted small">{{ paiement.client_email }}</div>
                </td>
                <td>
                  <strong>{{ formatCurrency(paiement.montant) }}</strong>
                </td>
                <td>
                  <span :class="getModeBadgeClass(paiement.mode_paiement)" class="badge">
                    {{ paiement.mode_paiement }}
                  </span>
                </td>
                <td>
                  <small>{{ formatDate(paiement.date_paiement) }}</small>
                </td>
                <td>
                  <span :class="getStatutBadgeClass(paiement.statut)" class="badge">
                    {{ paiement.statut }}
                  </span>
                </td>
                <td class="text-end">
                  <div class="btn-group btn-group-sm">
                    <button 
                      class="btn btn-outline-info"
                      @click="viewDetails(paiement)"
                      title="Voir détails"
                    >
                      <i class="bi bi-eye"></i>
                    </button>
                    <button 
                      v-if="paiement.statut === 'en_attente'"
                      class="btn btn-outline-success"
                      @click="confirmerPaiement(paiement)"
                      title="Confirmer réception"
                    >
                      <i class="bi bi-check-lg"></i>
                    </button>
                    <button 
                      v-if="paiement.statut === 'reçu'"
                      class="btn btn-outline-danger"
                      @click="annulerPaiement(paiement)"
                      title="Annuler"
                    >
                      <i class="bi bi-x-circle"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { paiementsService } from '@/services/paiementsService';
import { formatters, helpers } from '@/utils';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import Swal from 'sweetalert2';

export default {
  name: 'ListPaiements',
  components: {
    LoadingSpinner
  },
  data() {
    return {
      loading: true,
      paiements: [],
      filteredPaiements: [],
      filter: {
        mode_paiement: 'all',
        statut: 'all',
        date_debut: '',
        date_fin: '',
        search: ''
      },
      stats: {
        total: 0,
        montantTotal: 0,
        paiementsRecus: 0,
        paiementsEnAttente: 0
      }
    };
  },
  async mounted() {
    await this.loadPaiements();
  },
  watch: {
    'filter.mode_paiement': 'applyFilters',
    'filter.statut': 'applyFilters',
    'filter.date_debut': 'applyFilters',
    'filter.date_fin': 'applyFilters'
  },
  methods: {
    async loadPaiements() {
    try {
      this.loading = true;
      const response = await paiementsService.getAll();
      this.paiements = response.paiements || [];
      this.filteredPaiements = [...this.paiements];
      this.calculateStats();
      
      // Debug: afficher les statuts
      console.log('Paiements chargés:');
      this.paiements.forEach(p => {
        console.log(`- ${p.reference}: ${p.statut} (${p.montant} €)`);
      });
      
    } catch (error) {
      console.error('Erreur chargement paiements:', error);
      this.paiements = this.getMockPaiements();
      this.filteredPaiements = [...this.paiements];
      this.calculateStats();
    } finally {
      this.loading = false;
    }
  },
    
    applyFilters() {
      let filtered = [...this.paiements];
      
      // Filtre par mode de paiement
      if (this.filter.mode_paiement !== 'all') {
        filtered = filtered.filter(p => p.mode_paiement === this.filter.mode_paiement);
      }
      
      // Filtre par statut
      if (this.filter.statut !== 'all') {
        filtered = filtered.filter(p => p.statut === this.filter.statut);
      }
      
      // Filtre par date
      if (this.filter.date_debut) {
        const dateDebut = new Date(this.filter.date_debut);
        filtered = filtered.filter(p => new Date(p.date_paiement) >= dateDebut);
      }
      
      if (this.filter.date_fin) {
        const dateFin = new Date(this.filter.date_fin);
        dateFin.setHours(23, 59, 59);
        filtered = filtered.filter(p => new Date(p.date_paiement) <= dateFin);
      }
      
      // Filtre par recherche
      if (this.filter.search) {
        const term = this.filter.search.toLowerCase();
        filtered = filtered.filter(p =>
          p.reference.toLowerCase().includes(term) ||
          p.facture_numero.toLowerCase().includes(term) ||
          p.client_nom.toLowerCase().includes(term) ||
          p.client_email.toLowerCase().includes(term) ||
          (p.notes && p.notes.toLowerCase().includes(term))
        );
      }
      
      this.filteredPaiements = filtered;
    },
    
    clearFilters() {
      this.filter = {
        mode_paiement: 'all',
        statut: 'all',
        date_debut: '',
        date_fin: '',
        search: ''
      };
      this.filteredPaiements = [...this.paiements];
    },
    
    calculateStats() {
      const paiementsRecus = this.paiements.filter(p => p.statut === 'reçu');
      const paiementsEnAttente = this.paiements.filter(p => p.statut === 'en_attente');
      
      this.stats = {
        total: this.paiements.length,
        montantTotal: paiementsRecus.reduce((sum, p) => sum + parseFloat(p.montant), 0),
        paiementsRecus: paiementsRecus.length,
        paiementsEnAttente: paiementsEnAttente.length
      };
    },
    
    getModeBadgeClass(mode) {
      const classes = {
        'espèces': 'bg-success',
        'carte': 'bg-primary',
        'virement': 'bg-info',
        'chèque': 'bg-warning',
        'avoir': 'bg-secondary'
      };
      return classes[mode] || 'bg-secondary';
    },
    
    getStatutBadgeClass(statut) {
      const classes = {
        'reçu': 'bg-success',
        'en_attente': 'bg-warning',
        'annulé': 'bg-danger',
        'rejeté': 'bg-secondary'
      };
      return classes[statut] || 'bg-secondary';
    },
    
    viewDetails(paiement) {
      Swal.fire({
        title: 'Détails du paiement',
        html: `
          <div class="text-start">
            <p><strong>Référence:</strong> ${paiement.reference}</p>
            <p><strong>Facture:</strong> ${paiement.facture_numero}</p>
            <p><strong>Client:</strong> ${paiement.client_nom}</p>
            <p><strong>Montant:</strong> ${this.formatCurrency(paiement.montant)}</p>
            <p><strong>Mode:</strong> ${paiement.mode_paiement}</p>
            <p><strong>Date:</strong> ${this.formatDate(paiement.date_paiement)}</p>
            <p><strong>Statut:</strong> ${paiement.statut}</p>
            ${paiement.notes ? `<p><strong>Notes:</strong> ${paiement.notes}</p>` : ''}
          </div>
        `,
        showCloseButton: true,
        showConfirmButton: false
      });
    },
    
    async confirmerPaiement(paiement) {
      const result = await Swal.fire({
        title: 'Confirmer la réception ?',
        text: `Le paiement ${paiement.reference} sera marqué comme reçu.`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Oui, confirmer',
        cancelButtonText: 'Annuler'
      });
      
      if (result.isConfirmed) {
        try {
          // À implémenter: API de confirmation
          paiement.statut = 'reçu';
          this.calculateStats();
          
          Swal.fire({
            icon: 'success',
            title: 'Confirmé !',
            text: 'Le paiement a été confirmé.',
            timer: 2000,
            showConfirmButton: false
          });
        } catch (error) {
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Impossible de confirmer le paiement'
          });
        }
      }
    },
    
     async annulerPaiement(paiement) {
    const result = await Swal.fire({
      title: 'Annuler ce paiement ?',
      html: `
        <p>Le paiement <strong>${paiement.reference}</strong> sera annulé.</p>
        <p><strong>Montant:</strong> ${this.formatCurrency(paiement.montant)}</p>
        <p><strong>Facture:</strong> ${paiement.facture_numero}</p>
        <p class="text-danger"><i class="bi bi-exclamation-triangle"></i> Cette action est irréversible !</p>
        <p class="text-info">Le statut de la facture et le solde du client seront mis à jour.</p>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Oui, annuler',
      cancelButtonText: 'Annuler'
    });
    
    if (result.isConfirmed) {
      try {
        // Appel à l'API pour annuler
        const response = await paiementsService.annuler(paiement.id);
        
        if (response.success) {
          Swal.fire({
            icon: 'success',
            title: 'Annulé !',
            html: `
              <p>Le paiement a été annulé avec succès.</p>
              <p>Le statut de la facture a été mis à jour.</p>
              <p><strong>Nouveau statut:</strong> annulé</p>
            `,
            timer: 3000,
            showConfirmButton: false
          });
          
          // 🔥 IMPORTANT : Recharger les données depuis le serveur
          await this.loadPaiements();
          
        } else {
          throw new Error(response.error || 'Échec de l\'annulation');
        }
        
      } catch (error) {
        console.error('Erreur annulation paiement:', error);
        
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: error.response?.data?.error || 'Impossible d\'annuler le paiement',
          footer: 'Vérifiez que le paiement peut être annulé'
        });
      }
    }
  },
    
    formatCurrency: formatters.currency,
    formatDate: formatters.date,
    truncate: helpers.truncate,
    
    getMockPaiements() {
      return [
        {
          id: 1,
          reference: 'PAY-20240125-001',
          facture_id: 1,
          facture_numero: 'FACT-2024-0125',
          client_nom: 'Entreprise ABC',
          client_email: 'contact@abc.com',
          montant: 1497.52,
          mode_paiement: 'virement',
          date_paiement: '2024-01-25',
          statut: 'reçu',
          notes: 'Paiement reçu par virement bancaire'
        },
        {
          id: 2,
          reference: 'PAY-20240124-001',
          facture_id: 2,
          facture_numero: 'FACT-2024-0124',
          client_nom: 'SARL XYZ',
          client_email: 'info@xyz.com',
          montant: 2500.00,
          mode_paiement: 'chèque',
          date_paiement: '2024-01-24',
          statut: 'en_attente',
          notes: 'Chèque à encaisser'
        }
      ];
    }
  }
};
</script>

<style scoped>
.paiements-page {
  padding: 20px 0;
}
</style>