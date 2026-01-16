<template>
  <div class="produit-form-page">
    <!-- En-tête dynamique -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="h3 mb-0">{{ isEditing ? 'Modifier le produit' : 'Nouveau produit' }}</h1>
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-0">
            <li class="breadcrumb-item">
              <router-link to="/produits">Produits</router-link>
            </li>
            <li class="breadcrumb-item active" aria-current="page">
              {{ isEditing ? 'Modification' : 'Création' }}
            </li>
          </ol>
        </nav>
      </div>
      <div class="btn-group">
        <router-link to="/produits" class="btn btn-outline-secondary">
          <i class="bi bi-arrow-left"></i> Retour
        </router-link>
      </div>
    </div>

    <div class="row">
      <!-- Formulaire produit -->
      <div class="col-md-8">
        <div class="card">
          <div class="card-body">
            <form @submit.prevent="submitProduit">
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label for="reference" class="form-label">Référence *</label>
                    <input 
                      type="text" 
                      class="form-control" 
                      id="reference" 
                      v-model="produit.reference"
                      required
                      placeholder="Ex: PROD-001"
                    />
                    <div class="form-text">
                      Identifiant unique du produit
                    </div>
                  </div>
                  
                  <div class="mb-3">
                    <label for="nom" class="form-label">Nom *</label>
                    <input 
                      type="text" 
                      class="form-control" 
                      id="nom" 
                      v-model="produit.nom"
                      required
                      placeholder="Nom du produit"
                    />
                  </div>
                  
                  <div class="mb-3">
                    <label for="prix_ht" class="form-label">Prix HT *</label>
                    <div class="input-group">
                      <input 
                        type="number" 
                        class="form-control" 
                        id="prix_ht" 
                        v-model.number="produit.prix_ht"
                        step="0.01"
                        min="0"
                        required
                      />
                      <span class="input-group-text">TND</span>
                    </div>
                  </div>
                </div>
                
                <div class="col-md-6">
                  <div class="mb-3">
                    <label for="tva" class="form-label">Taux de TVA (%)</label>
                    <div class="input-group">
                      <input 
                        type="number" 
                        class="form-control" 
                        id="tva" 
                        v-model.number="produit.tva"
                        step="0.1"
                        min="0"
                        max="100"
                      />
                      <span class="input-group-text">%</span>
                    </div>
                    <div class="form-text">
                      Par défaut: 20%
                    </div>
                  </div>
                  
                  <div class="mb-3">
                    <label for="stock" class="form-label">Stock initial</label>
                    <input 
                      type="number" 
                      class="form-control" 
                      id="stock" 
                      v-model.number="produit.stock"
                      min="0"
                      step="1"
                    />
                  </div>
                  
                  <div class="mb-3">
                    <label class="form-label">Prix TTC calculé</label>
                    <div class="form-control bg-light">
                      <strong>{{ formatCurrency(prixTTC) }}</strong>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="row">
                <div class="col-md-12">
                  <div class="mb-3">
                    <label for="description" class="form-label">Description</label>
                    <textarea 
                      class="form-control" 
                      id="description" 
                      v-model="produit.description"
                      rows="4"
                      placeholder="Description détaillée du produit..."
                    ></textarea>
                  </div>
                </div>
              </div>
              
              <!-- Aperçu -->
              <div class="row mt-4" v-if="produit.nom">
                <div class="col-md-12">
                  <div class="card bg-light">
                    <div class="card-body">
                      <h6 class="card-title mb-3">Aperçu du produit</h6>
                      <div class="row">
                        <div class="col-md-3">
                          <div class="text-muted small">Référence:</div>
                          <strong>{{ produit.reference || '-' }}</strong>
                        </div>
                        <div class="col-md-3">
                          <div class="text-muted small">Nom:</div>
                          <strong>{{ produit.nom }}</strong>
                        </div>
                        <div class="col-md-3">
                          <div class="text-muted small">Prix HT:</div>
                          <strong>{{ formatCurrency(produit.prix_ht) }}</strong>
                        </div>
                        <div class="col-md-3">
                          <div class="text-muted small">Prix TTC:</div>
                          <strong>{{ formatCurrency(prixTTC) }}</strong>
                        </div>
                      </div>
                      <div class="row mt-3">
                        <div class="col-md-3">
                          <div class="text-muted small">TVA:</div>
                          <strong>{{ produit.tva || 20 }}%</strong>
                        </div>
                        <div class="col-md-3">
                          <div class="text-muted small">Stock:</div>
                          <strong>{{ produit.stock || 0 }}</strong>
                        </div>
                        <div class="col-md-6">
                          <div class="text-muted small">Niveau de stock:</div>
                          <span :class="getNiveauStockBadgeClass(niveauStock)" class="badge">
                            {{ niveauStock }}
                          </span>
                        </div>
                      </div>
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
                      @click="$router.push('/produits')"
                    >
                      Annuler
                    </button>
                    <button 
                      type="submit" 
                      class="btn btn-primary"
                      :disabled="submitting"
                    >
                      <span v-if="submitting">
                        <span class="spinner-border spinner-border-sm me-2"></span>
                        Enregistrement...
                      </span>
                      <span v-else>
                        <i class="bi bi-check-circle me-2"></i>
                        {{ isEditing ? 'Mettre à jour' : 'Créer le produit' }}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <!-- Aide et informations -->
      <div class="col-md-4">
        <div class="card mb-4">
          <div class="card-header">
            <h5 class="mb-0"><i class="bi bi-info-circle"></i> Informations</h5>
          </div>
          <div class="card-body">
            <div class="alert alert-info">
              <strong>Conseils pour les références:</strong>
              <ul class="mb-0 mt-2">
                <li>Utilisez un format cohérent (ex: PROD-001)</li>
                <li>Évitez les espaces et caractères spéciaux</li>
                <li>La référence doit être unique</li>
              </ul>
            </div>
            
            <div class="alert alert-warning">
              <strong>Niveaux de stock:</strong>
              <ul class="mb-0 mt-2">
                <li><span class="badge bg-danger">Faible</span>: Stock &lt; 10</li>
                <li><span class="badge bg-warning">Moyen</span>: Stock 10-49</li>
                <li><span class="badge bg-success">Bon</span>: Stock ≥ 50</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { produitsService } from '@/services/produitsService';
import { formatters, helpers } from '@/utils';
import Swal from 'sweetalert2';

export default {
  name: 'ProduitForm',
  props: {
    id: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      isEditing: false,
      submitting: false,
      produit: {
        reference: '',
        nom: '',
        description: '',
        prix_ht: 0,
        tva: 20,
        stock: 0
      }
    };
  },
  computed: {
    prixTTC() {
      const prixHT = parseFloat(this.produit.prix_ht) || 0;
      const tva = parseFloat(this.produit.tva) || 20;
      return prixHT * (1 + tva / 100);
    },
    niveauStock() {
      const stock = this.produit.stock || 0;
      if (stock < 10) return 'faible';
      if (stock < 50) return 'moyen';
      return 'bon';
    }
  },
  async mounted() {
    if (this.id) {
      this.isEditing = true;
      await this.loadProduit();
    }
  },
  methods: {
    async loadProduit() {
      try {
        const response = await produitsService.getById(this.id);
        this.produit = {
          reference: response.produit.reference || '',
          nom: response.produit.nom || '',
          description: response.produit.description || '',
          prix_ht: response.produit.prix_ht || 0,
          tva: response.produit.tva || 20,
          stock: response.produit.stock || 0
        };
      } catch (error) {
        console.error('Erreur chargement produit:', error);
        Swal.fire('Erreur', 'Impossible de charger le produit', 'error');
        this.$router.push('/produits');
      }
    },
    
    getNiveauStockBadgeClass(niveau) {
      const classes = {
        'faible': 'bg-danger',
        'moyen': 'bg-warning',
        'bon': 'bg-success'
      };
      return classes[niveau] || 'bg-secondary';
    },
    
    async submitProduit() {
      this.submitting = true;
      
      try {
        if (this.isEditing) {
          await produitsService.update(this.id, this.produit);
          Swal.fire({
            icon: 'success',
            title: 'Mis à jour !',
            text: 'Le produit a été mis à jour avec succès.',
            timer: 2000,
            showConfirmButton: false
          });
        } else {
          await produitsService.create(this.produit);
          Swal.fire({
            icon: 'success',
            title: 'Créé !',
            text: 'Le produit a été créé avec succès.',
            timer: 2000,
            showConfirmButton: false
          });
        }
        
        this.$router.push('/produits');
      } catch (error) {
        console.error('Erreur enregistrement produit:', error);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: error.response?.data?.error || 'Erreur lors de l\'enregistrement'
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
.produit-form-page {
  padding: 20px 0;
}

.breadcrumb {
  background: transparent;
  padding: 0;
  margin-bottom: 0;
}
</style>