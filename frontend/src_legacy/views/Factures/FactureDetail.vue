<template>
  <div class="facture-detail-page">
    <!-- En-tête -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="h3 mb-0">Facture {{ facture.numero }}</h1>
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-0">
            <li class="breadcrumb-item">
              <router-link to="/factures">Factures</router-link>
            </li>
            <li class="breadcrumb-item active" aria-current="page">{{ facture.numero }}</li>
          </ol>
        </nav>
      </div>
      <div class="btn-group">
        <button class="btn btn-outline-secondary" @click="printFacture">
          <i class="bi bi-printer"></i> Imprimer
        </button>
        <button 
          v-if="facture.statut === 'brouillon'" 
          class="btn btn-success"
          @click="validateFacture"
        >
          <i class="bi bi-check-lg"></i> Valider
        </button>
        <router-link 
          v-if="facture.statut === 'validée' || facture.statut === 'partiellement_payée'"
          :to="`/paiements/nouveau?factureId=${id}`" 
          class="btn btn-primary"
        >
          <i class="bi bi-credit-card"></i> Enregistrer paiement
        </router-link>
      </div>
    </div>

    <div v-if="loading" class="text-center py-5">
      <LoadingSpinner message="Chargement de la facture..." />
    </div>

    <div v-else class="row">
      <!-- Informations facture -->
      <div class="col-md-4">
        <div class="card mb-4">
          <div class="card-header">
            <h5 class="mb-0">Informations facture</h5>
          </div>
          <div class="card-body">
            <table class="table table-sm">
              <tbody>
                <tr>
                  <td><strong>Numéro:</strong></td>
                  <td>{{ facture.numero }}</td>
                </tr>
                <tr>
                  <td><strong>Date:</strong></td>
                  <td>{{ formatDate(facture.date_facture) }}</td>
                </tr>
                <tr>
                  <td><strong>Statut:</strong></td>
                  <td>
                    <span :class="getStatusBadgeClass(facture.statut)" class="badge">
                      {{ facture.statut }}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td><strong>Créée le:</strong></td>
                  <td>{{ formatDateTime(facture.created_at) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Informations client -->
        <div class="card mb-4">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Client</h5>
            <router-link :to="`/clients/${facture.client_id}`" class="btn btn-sm btn-outline-primary">
              <i class="bi bi-eye"></i>
            </router-link>
          </div>
          <div class="card-body">
            <h6>{{ facture.client_nom }}</h6>
            <div class="text-muted small mb-2">
              {{ facture.client_email || 'Pas d\'email' }}
            </div>
            <div class="text-muted small mb-2">
              {{ facture.client_telephone || 'Pas de téléphone' }}
            </div>
            <div class="text-muted small">
              {{ facture.client_adresse || 'Pas d\'adresse' }}
            </div>
          </div>
        </div>

        <!-- Totaux -->
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Totaux</h5>
          </div>
          <div class="card-body">
            <table class="table table-sm">
              <tbody>
                <tr>
                  <td>Total HT:</td>
                  <td class="text-end">{{ formatCurrency(facture.montant_ht) }}</td>
                </tr>
                <tr>
                  <td>TVA:</td>
                  <td class="text-end">{{ formatCurrency(facture.montant_tva) }}</td>
                </tr>
                <tr class="table-active">
                  <td><strong>Total TTC:</strong></td>
                  <td class="text-end"><strong>{{ formatCurrency(facture.montant_ttc) }}</strong></td>
                </tr>
                <tr v-if="facture.statut !== 'brouillon'">
                  <td>Payé:</td>
                  <td class="text-end text-success">{{ formatCurrency(facture.total_paye || 0) }}</td>
                </tr>
                <tr v-if="facture.statut !== 'brouillon'">
                  <td>Reste à payer:</td>
                  <td class="text-end text-danger">{{ formatCurrency(resteAPayer) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Lignes de facture -->
      <div class="col-md-8">
        <div class="card mb-4">
          <div class="card-header">
            <h5 class="mb-0">Détail de la facture</h5>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead class="table-light">
                  <tr>
                    <th>Produit</th>
                    <th class="text-center">Quantité</th>
                    <th class="text-end">Prix unitaire HT</th>
                    <th class="text-end">Remise %</th>
                    <th class="text-end">Sous-total HT</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="ligne in facture.lignes" :key="ligne.id">
                    <td>
                      <div>
                        <strong>{{ ligne.produit_nom }}</strong>
                        <div class="text-muted small">{{ ligne.produit_reference }}</div>
                      </div>
                    </td>
                    <td class="text-center">{{ ligne.quantite }}</td>
                    <td class="text-end">{{ formatCurrency(ligne.prix_unitaire) }}</td>
                    <td class="text-end">{{ ligne.remise || 0 }}%</td>
                    <td class="text-end">{{ formatCurrency(ligne.sous_total) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Historique des paiements -->
        <div class="card" v-if="facture.statut !== 'brouillon'">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Historique des paiements</h5>
            <span class="badge bg-primary">{{ facture.paiements?.length || 0 }} paiement(s)</span>
          </div>
          <div class="card-body">
            <div v-if="!facture.paiements || facture.paiements.length === 0" 
                 class="text-center py-4 text-muted">
              <i class="bi bi-credit-card display-6 opacity-25"></i>
              <p class="mt-2">Aucun paiement enregistré</p>
            </div>
            
            <div v-else>
              <div class="list-group list-group-flush">
                <div v-for="paiement in facture.paiements" :key="paiement.id" 
                     class="list-group-item">
                  <div class="d-flex justify-content-between align-items-center">
                    <div>
                      <div class="d-flex align-items-center">
                        <strong class="me-3">{{ paiement.reference }}</strong>
                        <span class="badge bg-success">{{ paiement.mode_paiement }}</span>
                      </div>
                      <div class="text-muted small">{{ formatDate(paiement.date_paiement) }}</div>
                      <div class="text-muted small" v-if="paiement.notes">
                        <i class="bi bi-chat-left-text"></i> {{ paiement.notes }}
                      </div>
                    </div>
                    <div class="text-end">
                      <div class="fw-bold text-success">{{ formatCurrency(paiement.montant) }}</div>
                      <div class="small text-muted">{{ paiement.statut }}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="mt-4 pt-3 border-top">
                <div class="row">
                  <div class="col-md-6">
                    <div class="progress" style="height: 20px;">
                      <div 
                        class="progress-bar bg-success" 
                        role="progressbar"
                        :style="{ width: pourcentagePaye + '%' }"
                        :aria-valuenow="pourcentagePaye"
                        aria-valuemin="0"
                        aria-valuemax="100"
                      >
                        {{ pourcentagePaye.toFixed(0) }}%
                      </div>
                    </div>
                    <div class="text-center small mt-1">
                      <span class="text-success">Payé: {{ formatCurrency(facture.total_paye || 0) }}</span>
                      <span class="mx-2">|</span>
                      <span class="text-danger">Restant: {{ formatCurrency(resteAPayer) }}</span>
                    </div>
                  </div>
                  <div class="col-md-6 text-end">
                    <div class="btn-group">
                      <router-link 
                        v-if="resteAPayer > 0"
                        :to="`/paiements/nouveau?factureId=${id}`" 
                        class="btn btn-sm btn-primary"
                      >
                        <i class="bi bi-plus-circle"></i> Ajouter paiement
                      </router-link>
                    </div>
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
import { formatters, helpers } from '@/utils';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import Swal from 'sweetalert2';

export default {
  name: 'FactureDetail',
  components: {
    LoadingSpinner
  },
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      loading: true,
      facture: {}
    };
  },
  computed: {
    resteAPayer() {
      const totalPaye = this.facture.total_paye || 0;
      return this.facture.montant_ttc - totalPaye;
    },
    pourcentagePaye() {
      if (!this.facture.montant_ttc) return 0;
      const totalPaye = this.facture.total_paye || 0;
      return (totalPaye / this.facture.montant_ttc) * 100;
    }
  },
  async mounted() {
    await this.loadFacture();
  },
  methods: {
    async loadFacture() {
    try {
      this.loading = true;
      console.log('Chargement facture ID:', this.id); // Debug
      
      const response = await facturesService.getById(this.id);
      console.log('Réponse API:', response); // Debug
      
      if (response.success && response.facture) {
        this.facture = response.facture;
        
        // Assurer que les montants sont des nombres
        this.facture.montant_ttc = parseFloat(this.facture.montant_ttc) || 0;
        this.facture.montant_ht = parseFloat(this.facture.montant_ht) || 0;
        this.facture.montant_tva = parseFloat(this.facture.montant_tva) || 0;
        this.facture.total_paye = parseFloat(this.facture.total_paye) || 0;
        
        console.log('Facture chargée:', this.facture);
      } else {
        throw new Error('Facture non trouvée dans la réponse');
      }
      
    } catch (error) {
      console.error('Erreur détaillée:', error);
      console.error('Réponse error:', error.response);
      
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: error.response?.data?.error || error.message || 'Impossible de charger la facture',
        footer: `ID: ${this.id}`
      });
      
      this.$router.push('/factures');
    } finally {
      this.loading = false;
    }
  },
    
    async validateFacture() {
      const result = await Swal.fire({
        title: 'Valider cette facture ?',
        text: `La facture ${this.facture.numero} sera validée et deviendra payable.`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Oui, valider',
        cancelButtonText: 'Annuler'
      });
      
      if (result.isConfirmed) {
        try {
          await facturesService.validate(this.id);
          
          Swal.fire({
            icon: 'success',
            title: 'Validée !',
            text: 'La facture a été validée avec succès.',
            timer: 2000,
            showConfirmButton: false
          });
          
          await this.loadFacture();
        } catch (error) {
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: error.response?.data?.error || 'Impossible de valider la facture'
          });
        }
      }
    },
    
    printFacture() {
      window.print();
    },
    
    formatCurrency: formatters.currency,
    formatDate: formatters.date,
    formatDateTime: formatters.datetime,
    getStatusBadgeClass: helpers.getStatusBadgeClass
  }
};
</script>

<style scoped>
.facture-detail-page {
  padding: 20px 0;
}

.breadcrumb {
  background: transparent;
  padding: 0;
  margin-bottom: 0;
}

@media print {
  .breadcrumb, 
  .btn-group,
  .progress {
    display: none !important;
  }
  
  .card {
    border: none !important;
  }
  
  .card-header {
    background: white !important;
    color: black !important;
    border-bottom: 2px solid #333 !important;
  }
}
</style>