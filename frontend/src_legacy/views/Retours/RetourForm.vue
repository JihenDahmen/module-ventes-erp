<template>
  <div class="retour-form-page">
    <!-- En-tête -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="h3 mb-0">Nouveau Retour</h1>
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-0">
            <li class="breadcrumb-item">
              <router-link to="/retours">Retours</router-link>
            </li>
            <li class="breadcrumb-item active" aria-current="page">Nouveau</li>
          </ol>
        </nav>
      </div>
      <div class="btn-group">
        <router-link to="/retours" class="btn btn-outline-secondary">
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
                v-model="retour.facture_id"
                @change="loadFacture"
                required
              >
                <option value="">Choisir une facture...</option>
                <option 
                  v-for="facture in factures" 
                  :key="facture.id" 
                  :value="facture.id"
                >
                  {{ facture.numero }} - {{ facture.client_nom }} 
                  ({{ formatDate(facture.date_facture) }})
                </option>
              </select>
            </div>
            
            <div v-if="selectedFacture" class="border rounded p-3 bg-light">
              <h6 class="mb-2">Facture {{ selectedFacture.numero }}</h6>
              <div class="small text-muted mb-2">
                Client: {{ selectedFacture.client_nom }}
              </div>
              <div class="small text-muted mb-2">
                Date: {{ formatDate(selectedFacture.date_facture) }}
              </div>
              <div class="small text-muted mb-3">
                Total: {{ formatCurrency(selectedFacture.montant_ttc) }}
              </div>
              
              <div class="alert alert-info">
                <i class="bi bi-info-circle"></i>
                {{ selectedFacture.lignes?.length || 0 }} produit(s) sur cette facture
              </div>
            </div>
          </div>
        </div>

        <!-- Informations retour -->
        <div class="card" v-if="selectedFacture">
          <div class="card-header">
            <h5 class="mb-0">Informations du retour</h5>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <label class="form-label">Motif *</label>
              <select class="form-select" v-model="retour.motif" required>
                <option value="">Choisir un motif...</option>
                <option value="défectueux">Produit défectueux</option>
                <option value="non_conforme">Produit non conforme</option>
                <option value="erreur_commande">Erreur de commande</option>
                <option value="autre">Autre motif</option>
              </select>
            </div>
            
            <div class="mb-3">
              <label class="form-label">Notes</label>
              <textarea 
                class="form-control" 
                v-model="retour.notes"
                rows="3"
                placeholder="Détails sur le problème, observations..."
              ></textarea>
            </div>
          </div>
        </div>
      </div>

      <!-- Lignes de retour -->
      <div class="col-md-8">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Produits à retourner</h5>
            <button 
              type="button" 
              class="btn btn-sm btn-primary"
              @click="addLigne"
              :disabled="!selectedFacture"
            >
              <i class="bi bi-plus-circle"></i> Ajouter un produit
            </button>
          </div>
          <div class="card-body">
            <div v-if="!selectedFacture" class="text-center py-5 text-muted">
              <i class="bi bi-cart display-1"></i>
              <p class="mt-3">Sélectionnez d'abord une facture</p>
            </div>
            
            <div v-else-if="retour.lignes.length === 0" class="text-center py-5 text-muted">
              <i class="bi bi-box display-1"></i>
              <p class="mt-3">Aucun produit ajouté</p>
              <p class="small">Ajoutez les produits à retourner depuis la facture</p>
            </div>
            
            <div v-else>
              <div class="table-responsive">
                <table class="table table-sm">
                  <thead>
                    <tr>
                      <th>Produit</th>
                      <th class="text-center">Quantité facturée</th>
                      <th class="text-center">Quantité à retourner</th>
                      <th>Raison</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(ligne, index) in retour.lignes" :key="index">
                      <td style="width: 40%;">
                        <select 
                          class="form-select form-select-sm" 
                          v-model="ligne.ligne_facture_id"
                          @change="updateLigne(index)"
                        >
                          <option value="">Sélectionner un produit...</option>
                          <option 
                            v-for="ligneFacture in lignesFactureDisponibles" 
                            :key="ligneFacture.id" 
                            :value="ligneFacture.id"
                            :disabled="isLigneAlreadySelected(ligneFacture.id, index)"
                          >
                            {{ ligneFacture.produit_nom }} 
                            (Quantité: {{ ligneFacture.quantite }})
                          </option>
                        </select>
                        <div v-if="ligne.produit" class="mt-1 small text-muted">
                          {{ ligne.produit.reference }}
                        </div>
                      </td>
                      <td style="width: 15%;" class="text-center">
                        <div v-if="ligne.ligne_facture_id" class="form-control-plaintext">
                          {{ ligne.quantite_max }}
                        </div>
                        <div v-else class="text-muted">-</div>
                      </td>
                      <td style="width: 15%;">
                        <input 
                          type="number" 
                          class="form-control form-control-sm text-center" 
                          v-model.number="ligne.quantite_retournee"
                          :min="1"
                          :max="ligne.quantite_max"
                          @input="validateQuantite(index)"
                        />
                      </td>
                      <td style="width: 25%;">
                        <input 
                          type="text" 
                          class="form-control form-control-sm" 
                          v-model="ligne.raison"
                          placeholder="Détail du problème..."
                        />
                      </td>
                      <td style="width: 5%;">
                        <button 
                          type="button" 
                          class="btn btn-sm btn-outline-danger"
                          @click="removeLigne(index)"
                        >
                          <i class="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <!-- Récapitulatif -->
              <div v-if="retour.lignes.length > 0" class="mt-4 pt-3 border-top">
                <div class="alert" :class="validationClass">
                  <i :class="validationIcon"></i>
                  {{ validationMessage }}
                </div>
                
                <div class="row">
                  <div class="col-md-12">
                    <div class="d-flex justify-content-between">
                      <div>
                        <strong>{{ retour.lignes.length }} produit(s) à retourner</strong>
                      </div>
                      <div>
                        <button 
                          type="button" 
                          class="btn btn-primary"
                          @click="submitRetour"
                          :disabled="!canSubmit || submitting"
                        >
                          <span v-if="submitting">
                            <span class="spinner-border spinner-border-sm me-2"></span>
                            Enregistrement...
                          </span>
                          <span v-else>
                            <i class="bi bi-check-circle me-2"></i>
                            Enregistrer le retour
                          </span>
                        </button>
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
  </div>
</template>

<script>
import { facturesService } from '@/services/facturesService';
import { retoursService } from '@/services/retoursService';
import { produitsService } from '@/services/produitsService';
import { formatters } from '@/utils';
import Swal from 'sweetalert2';

export default {
  name: 'RetourForm',
  data() {
    return {
      submitting: false,
      factures: [],
      produits: [],
      selectedFacture: null,
      retour: {
        facture_id: '',
        client_id: '',
        motif: '',
        notes: '',
        lignes: []
      }
    };
  },
  
  computed: {
    lignesFactureDisponibles() {
      if (!this.selectedFacture || !this.selectedFacture.lignes) return [];
      return this.selectedFacture.lignes;
    },
    canSubmit() {
      return this.retour.facture_id &&
             this.retour.motif &&
             this.retour.lignes.length > 0 &&
             this.retour.lignes.every(l => 
               l.ligne_facture_id && 
               l.quantite_retournee > 0 && 
               l.quantite_retournee <= l.quantite_max
             );
    },
    validationMessage() {
      const totalLignes = this.retour.lignes.length;
      const lignesValides = this.retour.lignes.filter(l => 
        l.ligne_facture_id && l.quantite_retournee > 0
      ).length;
      
      if (totalLignes === 0) return 'Ajoutez au moins un produit à retourner';
      if (lignesValides < totalLignes) return 'Complétez toutes les lignes de retour';
      return 'Le retour peut être enregistré';
    },
    validationClass() {
      if (!this.canSubmit) return 'alert-warning';
      return 'alert-success';
    },
    validationIcon() {
      if (!this.canSubmit) return 'bi bi-exclamation-triangle';
      return 'bi bi-check-circle';
    }
  },
  
  async mounted() {
    await this.loadFactures();
    await this.loadProduits();
  },
  
  methods: {
    async loadFactures() {
      try {
        const response = await facturesService.getAll();
        this.factures = response.factures || [];
      } catch (error) {
        console.error('Erreur chargement factures:', error);
        this.factures = this.getMockFactures();
      }
    },
    
    async loadProduits() {
      try {
        const response = await produitsService.getAll();
        this.produits = response.produits || [];
      } catch (error) {
        console.error('Erreur chargement produits:', error);
      }
    },
    
    async loadFacture() {
      if (!this.retour.facture_id) {
        this.selectedFacture = null;
        this.retour.lignes = [];
        return;
      }
      
      try {
        const response = await facturesService.getById(this.retour.facture_id);
        this.selectedFacture = response.facture;
        this.retour.client_id = this.selectedFacture.client_id;
        this.retour.lignes = [];
      } catch (error) {
        console.error('Erreur chargement facture:', error);
        Swal.fire('Erreur', 'Impossible de charger la facture', 'error');
      }
    },
    
    addLigne() {
      this.retour.lignes.push({
        ligne_facture_id: '',
        produit_id: '',
        produit: null,
        quantite_max: 0,
        quantite_retournee: 1,
        raison: ''
      });
    },
    
    removeLigne(index) {
      this.retour.lignes.splice(index, 1);
    },
    
    updateLigne(index) {
      const ligne = this.retour.lignes[index];
      const ligneFacture = this.lignesFactureDisponibles.find(
        lf => lf.id == ligne.ligne_facture_id
      );
      
      if (ligneFacture) {
        ligne.produit_id = ligneFacture.produit_id;
        ligne.produit = ligneFacture;
        ligne.quantite_max = ligneFacture.quantite;
        // Par défaut, on retourne toute la quantité
        ligne.quantite_retournee = ligneFacture.quantite;
      } else {
        ligne.produit = null;
        ligne.quantite_max = 0;
        ligne.quantite_retournee = 0;
      }
    },
    
    validateQuantite(index) {
      const ligne = this.retour.lignes[index];
      if (ligne.quantite_retournee > ligne.quantite_max) {
        ligne.quantite_retournee = ligne.quantite_max;
      }
      if (ligne.quantite_retournee < 1) {
        ligne.quantite_retournee = 1;
      }
    },
    
    isLigneAlreadySelected(ligneFactureId, currentIndex) {
      return this.retour.lignes.some((l, index) => 
        index !== currentIndex && l.ligne_facture_id == ligneFactureId
      );
    },
    
    async submitRetour() {
      if (!this.canSubmit) return;
      
      this.submitting = true;
      
      try {
        const retourData = {
          facture_id: this.retour.facture_id,
          client_id: this.retour.client_id,
          motif: this.retour.motif,
          notes: this.retour.notes,
          lignes: this.retour.lignes.map(l => ({
            ligne_facture_id: l.ligne_facture_id,
            produit_id: l.produit_id,
            quantite_retournee: l.quantite_retournee,
            raison: l.raison
          }))
        };
        
        const response = await retoursService.create(retourData);
        
        Swal.fire({
          icon: 'success',
          title: 'Retour initié !',
          html: `
            <p>La demande de retour a été enregistrée avec succès.</p>
            <p><strong>Référence:</strong> ${response.retour.reference}</p>
            <p><strong>Produits:</strong> ${response.retour.lignes_count} produit(s)</p>
          `,
          showCancelButton: true,
          confirmButtonText: 'Suivre le retour',
          cancelButtonText: 'Retour à la liste'
        }).then(result => {
          if (result.isConfirmed) {
            this.$router.push(`/retours/${response.retour.id}`);
          } else {
            this.$router.push('/retours');
          }
        });
        
      } catch (error) {
        console.error('Erreur création retour:', error);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: error.response?.data?.error || 'Erreur lors de la création du retour'
        });
      } finally {
        this.submitting = false;
      }
    },
    
    formatDate: formatters.date,
    formatCurrency: formatters.currency,
    
    getMockFactures() {
      return [
        {
          id: 1,
          numero: 'FACT-2024-0125',
          client_nom: 'Entreprise ABC',
          date_facture: '2024-01-25',
          montant_ttc: 1497.52,
          statut: 'validée',
          lignes: [
            {
              id: 1,
              produit_id: 1,
              produit_nom: 'Ordinateur Portable Pro',
              quantite: 2
            }
          ]
        }
      ];
    }
  }
};
</script>

<style scoped>
.retour-form-page {
  padding: 20px 0;
}

.breadcrumb {
  background: transparent;
  padding: 0;
  margin-bottom: 0;
}

.table-sm th, .table-sm td {
  padding: 0.5rem;
}
</style>