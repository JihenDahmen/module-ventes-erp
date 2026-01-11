<template>
  <div class="produits-page">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="h3">Gestion des Produits</h1>
      <div class="btn-group">
        <router-link to="/produits/nouveau" class="btn btn-primary">
          <i class="bi bi-plus-circle"></i> Nouveau Produit
        </router-link>
      </div>
    </div>

    <!-- Filtres et recherche -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-3">
            <label class="form-label">Niveau de stock</label>
            <select class="form-select" v-model="filter.niveauStock">
              <option value="all">Tous les niveaux</option>
              <option value="faible">Stock faible (&lt; 10)</option>
              <option value="moyen">Stock moyen (10-49)</option>
              <option value="bon">Bon stock (≥ 50)</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Trier par</label>
            <select class="form-select" v-model="sort.field">
              <option value="nom">Nom</option>
              <option value="stock">Stock</option>
              <option value="prix_ht">Prix</option>
              <option value="created_at">Date création</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Ordre</label>
            <select class="form-select" v-model="sort.order">
              <option value="asc">Croissant</option>
              <option value="desc">Décroissant</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Recherche</label>
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-search"></i></span>
              <input 
                type="text" 
                class="form-control" 
                placeholder="Référence, nom, description..."
                v-model="filter.search"
                @input="applyFilters"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Statistiques stock -->
    <div class="row mb-4">
      <div class="col-md-3">
        <div class="card bg-primary text-white">
          <div class="card-body text-center">
            <h6 class="card-title mb-0">Total Produits</h6>
            <h3 class="mt-2">{{ stats.totalProduits }}</h3>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-info text-white">
          <div class="card-body text-center">
            <h6 class="card-title mb-0">Total en stock</h6>
            <h3 class="mt-2">{{ stats.totalEnStock }}</h3>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-warning text-white">
          <div class="card-body text-center">
            <h6 class="card-title mb-0">Produits stock faible</h6>
            <h3 class="mt-2">{{ stats.produitsFaibleStock }}</h3>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-success text-white">
          <div class="card-body text-center">
            <h6 class="card-title mb-0">Valeur du stock</h6>
            <h3 class="mt-2">{{ formatCurrency(stats.valeurStock) }}</h3>
          </div>
        </div>
      </div>
    </div>

    <!-- Tableau des produits -->
    <div class="card">
      <div class="card-body">
        <div v-if="loading" class="text-center py-5">
          <LoadingSpinner message="Chargement des produits..." />
        </div>
        
        <div v-else-if="filteredProduits.length === 0" class="text-center py-5 text-muted">
          <i class="bi bi-box-seam display-1"></i>
          <p class="mt-3">Aucun produit trouvé</p>
          <router-link to="/produits/nouveau" class="btn btn-primary mt-2">
            <i class="bi bi-plus-circle"></i> Ajouter votre premier produit
          </router-link>
        </div>
        
        <div v-else>
          <div class="table-responsive">
            <table class="table table-hover align-middle">
              <thead class="table-light">
                <tr>
                  <th>Référence</th>
                  <th>Nom</th>
                  <th>Description</th>
                  <th class="text-end">Prix HT</th>
                  <th class="text-end">Prix TTC</th>
                  <th class="text-center">Stock</th>
                  <th class="text-center">Niveau</th>
                  <th class="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="produit in filteredProduits" :key="produit.id">
                  <td>
                    <span class="badge bg-secondary">{{ produit.reference }}</span>
                  </td>
                  <td>
                    <strong>{{ produit.nom }}</strong>
                  </td>
                  <td>
                    <div class="text-muted small">{{ truncate(produit.description, 50) }}</div>
                  </td>
                  <td class="text-end">
                    {{ formatCurrency(produit.prix_ht) }}
                  </td>
                  <td class="text-end">
                    <strong>{{ formatCurrency(produit.prix_ttc) }}</strong>
                  </td>
                  <td class="text-center">
                    <span :class="getStockClass(produit.stock)" class="fw-bold">
                      {{ produit.stock }}
                    </span>
                  </td>
                  <td class="text-center">
                    <span :class="getNiveauStockBadgeClass(produit.niveau_stock)" class="badge">
                      {{ produit.niveau_stock }}
                    </span>
                  </td>
                  <td class="text-end">
                    <div class="btn-group btn-group-sm">
                     <router-link 
                        :to="{ name: 'EditProduit', params: { id: produit.id } }" 
                        class="btn btn-outline-primary"
                        title="Modifier"
                      >
                        <i class="bi bi-pencil"></i>
                    </router-link>
                      <button 
                        class="btn btn-outline-success"
                        @click="openStockModal(produit)"
                        title="Ajuster stock"
                      >
                        <i class="bi bi-box-arrow-in-down"></i>
                      </button>
                      <button 
                        class="btn btn-outline-danger"
                        @click="confirmDelete(produit)"
                        title="Supprimer"
                      >
                        <i class="bi bi-trash"></i>
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

    <!-- Modal ajustement stock -->
    <div class="modal fade" id="stockModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Ajustement du stock</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body" v-if="selectedProduit">
            <div class="mb-3">
              <label class="form-label">Produit</label>
              <div class="form-control bg-light">
                {{ selectedProduit.nom }} ({{ selectedProduit.reference }})
              </div>
            </div>
            <div class="row mb-3">
              <div class="col-md-6">
                <label class="form-label">Stock actuel</label>
                <div class="form-control bg-light text-center">
                  <strong>{{ selectedProduit.stock }}</strong>
                </div>
              </div>
              <div class="col-md-6">
                <label class="form-label">Niveau</label>
                <div class="form-control bg-light text-center">
                  <span :class="getNiveauStockBadgeClass(selectedProduit.niveau_stock)" class="badge">
                    {{ selectedProduit.niveau_stock }}
                  </span>
                </div>
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label">Quantité à ajouter/soustraire *</label>
              <div class="input-group">
                <button 
                  class="btn btn-outline-secondary" 
                  type="button"
                  @click="stockAdjustment.quantite = -1"
                >
                  -1
                </button>
                <input 
                  type="number" 
                  class="form-control text-center" 
                  v-model.number="stockAdjustment.quantite"
                />
                <button 
                  class="btn btn-outline-secondary" 
                  type="button"
                  @click="stockAdjustment.quantite = 1"
                >
                  +1
                </button>
                <button 
                  class="btn btn-outline-secondary" 
                  type="button"
                  @click="stockAdjustment.quantite = 10"
                >
                  +10
                </button>
                <button 
                  class="btn btn-outline-secondary" 
                  type="button"
                  @click="stockAdjustment.quantite = -10"
                >
                  -10
                </button>
              </div>
              <div class="form-text">
                Entrez une valeur négative pour réduire le stock
              </div>
            </div>
            <div class="alert alert-info">
              <i class="bi bi-info-circle"></i>
              Nouveau stock: <strong>{{ selectedProduit.stock + stockAdjustment.quantite }}</strong>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
            <button 
              type="button" 
              class="btn btn-primary"
              @click="updateStock"
              :disabled="stockAdjustment.quantite === 0"
            >
              Mettre à jour
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { produitsService } from '@/services/produitsService';
import { formatters, helpers } from '@/utils';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import Swal from 'sweetalert2';

export default {
  name: 'ListProduits',
  components: {
    LoadingSpinner
  },
  data() {
    return {
      loading: true,
      produits: [],
      filteredProduits: [],
      filter: {
        niveauStock: 'all',
        search: ''
      },
      sort: {
        field: 'nom',
        order: 'asc'
      },
      stats: {
        totalProduits: 0,
        totalEnStock: 0,
        produitsFaibleStock: 0,
        valeurStock: 0
      },
      selectedProduit: null,
      stockAdjustment: {
        quantite: 0
      }
    };
  },
  async mounted() {
    await this.loadProduits();
  },
  watch: {
    'filter.niveauStock': 'applyFilters',
    'sort.field': 'applyFilters',
    'sort.order': 'applyFilters'
  },
  methods: {
    async loadProduits() {
      try {
        this.loading = true;
        const response = await produitsService.getAll();
        this.produits = response.produits || [];
        this.filteredProduits = [...this.produits];
        this.calculateStats();
        this.applyFilters();
      } catch (error) {
        console.error('Erreur chargement produits:', error);
        // Mock data
        this.produits = this.getMockProduits();
        this.filteredProduits = [...this.produits];
        this.calculateStats();
      } finally {
        this.loading = false;
      }
    },
    
    applyFilters() {
      let filtered = [...this.produits];
      
      // Filtre par niveau de stock
      if (this.filter.niveauStock !== 'all') {
        filtered = filtered.filter(p => p.niveau_stock === this.filter.niveauStock);
      }
      
      // Filtre par recherche
      if (this.filter.search) {
        const term = this.filter.search.toLowerCase();
        filtered = filtered.filter(p =>
          p.reference.toLowerCase().includes(term) ||
          p.nom.toLowerCase().includes(term) ||
          (p.description && p.description.toLowerCase().includes(term))
        );
      }
      
      // Tri
      filtered.sort((a, b) => {
        let aValue = a[this.sort.field];
        let bValue = b[this.sort.field];
        
        if (this.sort.field === 'prix_ttc' || this.sort.field === 'prix_ht') {
          aValue = parseFloat(aValue);
          bValue = parseFloat(bValue);
        }
        
        if (this.sort.order === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
      
      this.filteredProduits = filtered;
    },
    
    calculateStats() {
      const produitsFaibleStock = this.produits.filter(p => p.niveau_stock === 'faible');
      const valeurStock = this.produits.reduce((sum, p) => {
        return sum + (parseFloat(p.prix_ht) * p.stock);
      }, 0);
      
      this.stats = {
        totalProduits: this.produits.length,
        totalEnStock: this.produits.reduce((sum, p) => sum + p.stock, 0),
        produitsFaibleStock: produitsFaibleStock.length,
        valeurStock: valeurStock
      };
    },
    
    getStockClass(stock) {
      return helpers.getStockLevelClass(stock);
    },
    
    getNiveauStockBadgeClass(niveau) {
      const classes = {
        'faible': 'bg-danger',
        'moyen': 'bg-warning',
        'bon': 'bg-success'
      };
      return classes[niveau] || 'bg-secondary';
    },
    
    openStockModal(produit) {
      this.selectedProduit = produit;
      this.stockAdjustment.quantite = 0;
      new window.bootstrap.Modal(document.getElementById('stockModal')).show();
    },
    
    async updateStock() {
      if (!this.selectedProduit) return;
      
      try {
        await produitsService.updateStock(
          this.selectedProduit.id, 
          this.stockAdjustment.quantite
        );
        
        // Fermer le modal
        const modal = window.bootstrap.Modal.getInstance(document.getElementById('stockModal'));
        modal.hide();
        
        // Recharger les produits
        await this.loadProduits();
        
        Swal.fire({
          icon: 'success',
          title: 'Stock mis à jour !',
          text: `Le stock a été ajusté de ${this.stockAdjustment.quantite}`,
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        console.error('Erreur mise à jour stock:', error);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Impossible de mettre à jour le stock'
        });
      }
    },
    
    async confirmDelete(produit) {
      const result = await Swal.fire({
        title: 'Supprimer ce produit ?',
        html: `
          <p>Le produit <strong>${produit.nom}</strong> sera définitivement supprimé.</p>
          <p class="text-danger">Attention: Cette action est irréversible !</p>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Oui, supprimer',
        cancelButtonText: 'Annuler'
      });
      
      if (result.isConfirmed) {
        try {
          // À implémenter: API de suppression
          await produitsService.delete(produit.id);
          
          Swal.fire({
            icon: 'success',
            title: 'Supprimé !',
            text: 'Le produit a été supprimé.',
            timer: 2000,
            showConfirmButton: false
          });
          
          await this.loadProduits();
        } catch (error) {
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Impossible de supprimer le produit'
          });
        }
      }
    },
    
    exportProduits() {
      // À implémenter: export CSV/Excel
      Swal.fire('Info', 'L\'export n\'est pas encore implémenté', 'info');
    },
    
    formatCurrency: formatters.currency,
    truncate: helpers.truncate,
    
    getMockProduits() {
      return [
        {
          id: 1,
          reference: 'PROD-001',
          nom: 'Ordinateur Portable Pro',
          description: 'Ordinateur portable professionnel 16GB RAM, 512GB SSD',
          prix_ht: 1200.00,
          prix_ttc: 1440.00,
          stock: 25,
          niveau_stock: 'moyen',
          created_at: '2024-01-15'
        },
        {
          id: 2,
          reference: 'PROD-002',
          nom: 'Écran 24" Full HD',
          description: 'Écran LED 24 pouces, résolution 1920x1080',
          prix_ht: 180.00,
          prix_ttc: 216.00,
          stock: 5,
          niveau_stock: 'faible',
          created_at: '2024-01-20'
        },
        {
          id: 3,
          reference: 'PROD-003',
          nom: 'Souris Sans Fil',
          description: 'Souris ergonomique sans fil, autonomie 12 mois',
          prix_ht: 25.00,
          prix_ttc: 30.00,
          stock: 120,
          niveau_stock: 'bon',
          created_at: '2024-01-25'
        }
      ];
    }
  }
};
</script>

<style scoped>
.produits-page {
  padding: 20px 0;
}
</style>