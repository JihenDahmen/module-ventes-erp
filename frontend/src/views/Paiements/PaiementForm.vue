<template>
  <div class="paiement-form-page">
    <!-- En-tête -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="h3 mb-0">Nouveau Paiement</h1>
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-0">
            <li class="breadcrumb-item">
              <router-link to="/paiements">Paiements</router-link>
            </li>
            <li class="breadcrumb-item active" aria-current="page">Nouveau</li>
          </ol>
        </nav>
      </div>
      <div class="btn-group">
        <router-link to="/paiements" class="btn btn-outline-secondary">
          <i class="bi bi-arrow-left"></i> Annuler
        </router-link>
      </div>
    </div>

    <div class="row">
      <!-- Sélection facture -->
      <div class="col-md-4">
        <div class="card mb-4">
          <div class="card-header">
            <h5 class="mb-0">Sélection de la facture</h5>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <label class="form-label">Facture *</label>
              <select 
                class="form-select" 
                v-model="paiement.facture_id"
                @change="loadFacture"
                required
              >
                <option value="">Choisir une facture...</option>
                <option 
                  v-for="facture in facturesPayables" 
                  :key="facture.id" 
                  :value="facture.id"
                >
                  {{ facture.numero }} - {{ facture.client_nom }} 
                  ({{ formatCurrency(facture.montant_ttc) }})
                </option>
              </select>
            </div>
            
            <div v-if="selectedFacture" class="border rounded p-3 bg-light">
              <h6 class="mb-2">Facture {{ selectedFacture.numero }}</h6>
              <div class="small text-muted mb-2">
                Client: {{ selectedFacture.client_nom }}
              </div>
              <table class="table table-sm mb-2">
                <tbody>
                  <tr>
                    <td>Total TTC:</td>
                    <td class="text-end">{{ formatCurrency(selectedFacture.montant_ttc) }}</td>
                  </tr>
                  <tr>
                    <td>Déjà payé:</td>
                    <td class="text-end text-success">{{ formatCurrency(selectedFacture.total_paye || 0) }}</td>
                  </tr>
                  <tr class="table-active">
                    <td><strong>Reste à payer:</strong></td>
                    <td class="text-end"><strong>{{ formatCurrency(resteAPayer) }}</strong></td>
                  </tr>
                </tbody>
              </table>
              
              <div class="progress" style="height: 10px;">
                <div 
                  class="progress-bar bg-success" 
                  role="progressbar"
                  :style="{ width: pourcentagePaye + '%' }"
                ></div>
              </div>
              <div class="small text-center mt-1">
                {{ pourcentagePaye.toFixed(0) }}% payé
              </div>
            </div>
          </div>
        </div>

        <!-- Utilisation d'avoir -->
        <div class="card" v-if="selectedFacture && avoirsDisponibles.length > 0">
          <div class="card-header">
            <h5 class="mb-0">Avoirs disponibles</h5>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <label class="form-check-label">Utiliser un avoir ?</label>
              <div class="form-check form-switch">
                <input 
                  class="form-check-input" 
                  type="checkbox" 
                  role="switch" 
                  v-model="utiliserAvoir"
                />
              </div>
            </div>
            
            <div v-if="utiliserAvoir" class="border rounded p-3 bg-light">
              <div class="mb-3">
                <label class="form-label">Sélectionner un avoir</label>
                <select class="form-select" v-model="avoirSelectionne">
                  <option value="">Choisir un avoir...</option>
                  <option 
                    v-for="avoir in avoirsDisponibles" 
                    :key="avoir.id" 
                    :value="avoir.id"
                  >
                    {{ avoir.numero }} - {{ formatCurrency(avoir.montant) }}
                  </option>
                </select>
              </div>
              
              <div v-if="avoirSelectionne" class="alert alert-info">
                <i class="bi bi-info-circle"></i>
                L'avoir sera appliqué sur cette facture
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Informations paiement -->
      <div class="col-md-8">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Informations du paiement</h5>
          </div>
          <div class="card-body">
            <div v-if="!selectedFacture" class="text-center py-5 text-muted">
              <i class="bi bi-credit-card display-1"></i>
              <p class="mt-3">Sélectionnez d'abord une facture</p>
            </div>
            
            <div v-else>
              <form @submit.prevent="submitPaiement">
                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Montant *</label>
                      <div class="input-group">
                        <input 
                          type="number" 
                          class="form-control" 
                          v-model.number="paiement.montant"
                          :max="montantMax"
                          step="0.01"
                          required
                        />
                        <span class="input-group-text">TND</span>
                      </div>
                      <div class="form-text">
                        Montant maximum: {{ formatCurrency(montantMax) }}
                      </div>
                    </div>
                    
                    <div class="mb-3">
                      <label class="form-label">Mode de paiement *</label>
                      <select class="form-select" v-model="paiement.mode_paiement" required>
                        <option value="">Choisir un mode...</option>
                        <option value="espèces">Espèces</option>
                        <option value="carte">Carte bancaire</option>
                        <option value="virement">Virement</option>
                        <option value="chèque">Chèque</option>
                        <option value="avoir" :disabled="!utiliserAvoir">Avoir</option>
                      </select>
                    </div>
                  </div>
                  
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Date du paiement</label>
                      <input 
                        type="date" 
                        class="form-control" 
                        v-model="paiement.date_paiement"
                        :max="today"
                      />
                    </div>
                    
                    <div class="mb-3">
                      <label class="form-label">Notes</label>
                      <textarea 
                        class="form-control" 
                        v-model="paiement.notes"
                        rows="3"
                        placeholder="Référence de virement, numéro de chèque..."
                      ></textarea>
                    </div>
                  </div>
                </div>
                
                <!-- Récapitulatif -->
                <div class="row mt-4">
                  <div class="col-md-12">
                    <div class="card bg-light">
                      <div class="card-body">
                        <h6 class="card-title mb-3">Récapitulatif</h6>
                        <table class="table table-sm">
                          <tbody>
                            <tr>
                              <td>Facture:</td>
                              <td class="text-end">{{ selectedFacture.numero }}</td>
                            </tr>
                            <tr>
                              <td>Client:</td>
                              <td class="text-end">{{ selectedFacture.client_nom }}</td>
                            </tr>
                            <tr>
                              <td>Total facture:</td>
                              <td class="text-end">{{ formatCurrency(selectedFacture.montant_ttc) }}</td>
                            </tr>
                            <tr>
                              <td>Déjà payé:</td>
                              <td class="text-end">{{ formatCurrency(selectedFacture.total_paye || 0) }}</td>
                            </tr>
                            <tr>
                              <td>Montant du paiement:</td>
                              <td class="text-end">{{ formatCurrency(paiement.montant) }}</td>
                            </tr>
                            <tr v-if="utiliserAvoir && avoirSelectionne">
                              <td>Avoir utilisé:</td>
                              <td class="text-end text-success">
                                -{{ formatCurrency(montantAvoir) }}
                              </td>
                            </tr>
                            <tr class="table-active">
                              <td><strong>Nouveau solde:</strong></td>
                              <td class="text-end">
                                <strong>{{ formatCurrency(nouveauSolde) }}</strong>
                              </td>
                            </tr>
                            <tr v-if="nouveauSolde === 0" class="table-success">
                              <td colspan="2" class="text-center">
                                <i class="bi bi-check-circle"></i> La facture sera totalement payée
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Actions -->
                <div class="row mt-4">
                  <div class="col-md-12">
                    <div class="d-flex justify-content-between">
                      <button 
                        type="button" 
                        class="btn btn-outline-secondary" 
                        @click="$router.push('/paiements')"
                      >
                        Annuler
                      </button>
                      <button 
                        type="submit" 
                        class="btn btn-primary"
                        :disabled="!canSubmit || submitting"
                      >
                        <span v-if="submitting">
                          <span class="spinner-border spinner-border-sm me-2"></span>
                          Enregistrement...
                        </span>
                        <span v-else>
                          <i class="bi bi-check-circle me-2"></i>
                          Enregistrer le paiement
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { facturesService } from '@/services/facturesService';
import { paiementsService } from '@/services/paiementsService';
import { avoirsService } from '@/services/avoirsService';
import { formatters } from '@/utils';
import Swal from 'sweetalert2';

export default {
  name: 'PaiementForm',
  data() {
    const today = new Date().toISOString().split('T')[0];
    
    return {
      today,
      submitting: false,
      factures: [],
      avoirsDisponibles: [],
      selectedFacture: null,
      utiliserAvoir: false,
      avoirSelectionne: '',
      paiement: {
        facture_id: '',
        montant: 0,
        mode_paiement: '',
        date_paiement: today,
        notes: ''
      }
    };
  },
  computed: {
    facturesPayables() {
      return this.factures.filter(f => 
        f.statut === 'validée' || f.statut === 'partiellement_payée'
      );
    },
    resteAPayer() {
      if (!this.selectedFacture) return 0;
      const totalPaye = this.selectedFacture.total_paye || 0;
      return this.selectedFacture.montant_ttc - totalPaye;
    },
    pourcentagePaye() {
      if (!this.selectedFacture || !this.selectedFacture.montant_ttc) return 0;
      const totalPaye = this.selectedFacture.total_paye || 0;
      return (totalPaye / this.selectedFacture.montant_ttc) * 100;
    },
    montantMax() {
      if (this.utiliserAvoir && this.avoirSelectionne) {
        const avoir = this.avoirsDisponibles.find(a => a.id == this.avoirSelectionne);
        if (avoir) {
          return this.resteAPayer + parseFloat(avoir.montant);
        }
      }
      return this.resteAPayer;
    },
    montantAvoir() {
      if (!this.utiliserAvoir || !this.avoirSelectionne) return 0;
      const avoir = this.avoirsDisponibles.find(a => a.id == this.avoirSelectionne);
      return avoir ? parseFloat(avoir.montant) : 0;
    },
    nouveauSolde() {
      const montantPaiement = parseFloat(this.paiement.montant) || 0;
      const montantAvoirUtilise = this.utiliserAvoir ? this.montantAvoir : 0;
      return this.resteAPayer - montantPaiement - montantAvoirUtilise;
    },
    canSubmit() {
      return this.selectedFacture && 
             this.paiement.montant > 0 &&
             this.paiement.montant <= this.montantMax &&
             this.paiement.mode_paiement &&
             this.paiement.date_paiement;
    }
  },
  async mounted() {
    await this.loadFactures();
    
    // Vérifier s'il y a une facture dans les paramètres
    const factureId = this.$route.query.factureId;
    if (factureId) {
      this.paiement.facture_id = factureId;
      await this.loadFacture(factureId);
    }
  },
  watch: {
    utiliserAvoir(newValue) {
      if (newValue && this.selectedFacture) {
        this.loadAvoirs();
      } else {
        this.avoirsDisponibles = [];
        this.avoirSelectionne = '';
      }
    },
    'paiement.montant'(newValue) {
      if (newValue > this.montantMax) {
        this.paiement.montant = this.montantMax;
      }
    }
  },
  methods: {
    async loadFactures() {
      try {
        const response = await facturesService.getAll();
        this.factures = response.factures || [];
      } catch (error) {
        console.error('Erreur chargement factures:', error);
      }
    },
    
    async loadFacture(id) {
      try {
        const response = await facturesService.getById(id);
        this.selectedFacture = response.facture;
        this.paiement.montant = this.resteAPayer;
      } catch (error) {
        console.error('Erreur chargement facture:', error);
        Swal.fire('Erreur', 'Impossible de charger la facture', 'error');
      }
    },
    
    async loadAvoirs() {
      try {
        const response = await avoirsService.getByClient(this.selectedFacture.client_id);
        this.avoirsDisponibles = response.avoirs || [];
      } catch (error) {
        console.error('Erreur chargement avoirs:', error);
      }
    },
    
    async submitPaiement() {
      if (!this.canSubmit) return;
      
      this.submitting = true;
      
      try {
        let paiementData = { ...this.paiement };
        
        // Si on utilise un avoir, on doit d'abord l'appliquer
        if (this.utiliserAvoir && this.avoirSelectionne) {
          try {
            await avoirsService.apply(this.avoirSelectionne, this.selectedFacture.id);
            
            Swal.fire({
              icon: 'success',
              title: 'Avoir appliqué !',
              text: `L'avoir a été appliqué sur la facture ${this.selectedFacture.numero}`,
              timer: 2000,
              showConfirmButton: false
            });
          } catch (error) {
            console.error('Erreur application avoir:', error);
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: 'Impossible d\'appliquer l\'avoir'
            });
            return;
          }
        }
        
        // Enregistrer le paiement
        const response = await paiementsService.create(paiementData);
        
        Swal.fire({
          icon: 'success',
          title: 'Paiement enregistré !',
          html: `
            <p>Le paiement a été enregistré avec succès.</p>
            <p><strong>Référence:</strong> ${response.paiement.reference}</p>
            <p><strong>Montant:</strong> ${this.formatCurrency(response.paiement.montant)}</p>
          `,
          showCancelButton: true,
          confirmButtonText: 'Voir la facture',
          cancelButtonText: 'Continuer'
        }).then(result => {
          if (result.isConfirmed) {
            this.$router.push(`/factures/${this.selectedFacture.id}`);
          } else {
            this.$router.push('/paiements');
          }
        });
        
      } catch (error) {
        console.error('Erreur enregistrement paiement:', error);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: error.response?.data?.error || 'Erreur lors de l\'enregistrement du paiement'
        });
      } finally {
        this.submitting = false;
      }
    },
    
    formatCurrency: formatters.currency
  }
};
</script>

<style scoped>
.paiement-form-page {
  padding: 20px 0;
}

.breadcrumb {
  background: transparent;
  padding: 0;
  margin-bottom: 0;
}
</style>