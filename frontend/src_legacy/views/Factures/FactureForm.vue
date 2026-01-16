<template>
  <div class="facture-form-page">
    <!-- En-tête -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="h3 mb-0">{{ isEditing ? 'Modifier la facture' : 'Nouvelle facture' }}</h1>
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-0">
            <li class="breadcrumb-item">
              <router-link to="/factures">Factures</router-link>
            </li>
            <li class="breadcrumb-item active" aria-current="page">
              {{ isEditing ? 'Modification' : 'Création' }}
            </li>
          </ol>
        </nav>
      </div>
      <div class="btn-group">
        <router-link to="/factures" class="btn btn-outline-secondary">
          <i class="bi bi-arrow-left"></i> Annuler
        </router-link>
        <button 
          type="button" 
          class="btn btn-primary"
          :disabled="!canSubmit"
          @click="submitFacture"
        >
          <span v-if="submitting">
            <span class="spinner-border spinner-border-sm me-2"></span>
            Enregistrement...
          </span>
          <span v-else>
            <i class="bi bi-check-circle me-2"></i>
            {{ isEditing ? 'Mettre à jour' : 'Créer la facture' }}
          </span>
        </button>
      </div>
    </div>

    <div class="row">
      <!-- Sélection client -->
      <div class="col-md-4">
        <div class="card mb-4">
          <div class="card-header">
            <h5 class="mb-0">Client</h5>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <label class="form-label">Sélectionner un client *</label>
              <select 
                class="form-select" 
                v-model="facture.client_id"
                :disabled="isEditing"
                required
              >
                <option value="">Choisir un client...</option>
                <option 
                  v-for="client in clients" 
                  :key="client.id" 
                  :value="client.id"
                >
                  {{ client.nom }} {{ client.solde > 0 ? '(Débiteur)' : '' }}
                </option>
              </select>
            </div>
            
            <div v-if="selectedClient" class="border rounded p-3 bg-light">
              <h6 class="mb-2">{{ selectedClient.nom }}</h6>
              <div class="small text-muted mb-2">
                {{ selectedClient.email || 'Pas d\'email' }}
              </div>
              <div class="small text-muted mb-2">
                {{ selectedClient.telephone || 'Pas de téléphone' }}
              </div>
              <div class="mt-3">
                <span class="badge" :class="getSituationBadgeClass(selectedClient.solde)">
                  Solde: {{ formatCurrency(selectedClient.solde) }}
                </span>
              </div>
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
                  <td>Total HT</td>
                  <td class="text-end">{{ formatCurrency(totaux.ht) }}</td>
                </tr>
                <tr>
                  <td>TVA (20%)</td>
                  <td class="text-end">{{ formatCurrency(totaux.tva) }}</td>
                </tr>
                <tr class="table-active fw-bold">
                  <td>Total TTC</td>
                  <td class="text-end">{{ formatCurrency(totaux.ttc) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Lignes de facture -->
      <div class="col-md-8">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Lignes de facture</h5>
            <button 
              type="button" 
              class="btn btn-sm btn-primary"
              @click="addLigne"
              :disabled="!facture.client_id"
            >
              <i class="bi bi-plus-circle"></i> Ajouter une ligne
            </button>
          </div>
          <div class="card-body">
            <div v-if="facture.lignes.length === 0" class="text-center py-5 text-muted">
              <i class="bi bi-cart display-1"></i>
              <p class="mt-3">Aucune ligne ajoutée</p>
              <p class="small">Sélectionnez d'abord un client puis ajoutez des produits</p>
            </div>
            
            <div v-else class="table-responsive">
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>Produit</th>
                    <th class="text-center">Quantité</th>
                    <th class="text-end">Prix unitaire</th>
                    <th class="text-end">Remise %</th>
                    <th class="text-end">Sous-total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(ligne, index) in facture.lignes" :key="index">
                    <td style="width: 40%;">
                      <select 
                        class="form-select form-select-sm" 
                        v-model="ligne.produit_id"
                        @change="updateProduit(index)"
                      >
                        <option value="">Sélectionner un produit...</option>
                        <option 
                          v-for="produit in produits" 
                          :key="produit.id" 
                          :value="produit.id"
                          :disabled="produit.stock <= 0"
                        >
                          {{ produit.nom }} - {{ formatCurrency(produit.prix_ht) }} HT 
                          (Stock: {{ produit.stock }})
                        </option>
                      </select>
                      <div v-if="ligne.produit" class="mt-1 small text-muted">
                        {{ ligne.produit.description || 'Pas de description' }}
                      </div>
                    </td>
                    <td style="width: 15%;">
                      <input 
                        type="number" 
                        class="form-control form-control-sm text-center" 
                        v-model.number="ligne.quantite"
                        min="1"
                        @input="updateTotaux"
                      />
                      <div v-if="ligne.produit && ligne.quantite > ligne.produit.stock" 
                           class="small text-danger">
                        Stock insuffisant
                      </div>
                    </td>
                    <td style="width: 15%;">
                      <input 
                        type="number" 
                        class="form-control form-control-sm text-end" 
                        v-model.number="ligne.prix_unitaire"
                        step="0.01"
                        @input="updateTotaux"
                      />
                    </td>
                    <td style="width: 15%;">
                      <input 
                        type="number" 
                        class="form-control form-control-sm text-end" 
                        v-model.number="ligne.remise"
                        min="0"
                        max="100"
                        step="0.1"
                        @input="updateTotaux"
                      />
                    </td>
                    <td style="width: 15%;" class="text-end">
                      <strong>{{ formatCurrency(ligne.sous_total) }}</strong>
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
                <tfoot v-if="facture.lignes.length > 0">
                  <tr>
                    <td colspan="4" class="text-end"><strong>Total HT:</strong></td>
                    <td class="text-end"><strong>{{ formatCurrency(totaux.ht) }}</strong></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td colspan="4" class="text-end">TVA (20%):</td>
                    <td class="text-end">{{ formatCurrency(totaux.tva) }}</td>
                    <td></td>
                  </tr>
                  <tr class="table-active">
                    <td colspan="4" class="text-end"><strong>Total TTC:</strong></td>
                    <td class="text-end"><strong>{{ formatCurrency(totaux.ttc) }}</strong></td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { clientsService } from '@/services/clientsService';
import { produitsService } from '@/services/produitsService';
import { facturesService } from '@/services/facturesService';
import { formatters } from '@/utils/formatters.js';
import Swal from 'sweetalert2';

export default {
  name: 'FactureForm',
  data() {
    return {
      isEditing: false,
      submitting: false,
      clients: [],
      produits: [],
      facture: {
        client_id: '',
        lignes: []
      },
      totaux: {
        ht: 0,
        tva: 0,
        ttc: 0
      }
    };
  },
  computed: {
    selectedClient() {
      return this.clients.find(c => c.id == this.facture.client_id);
    },
    canSubmit() {
      return this.facture.client_id && 
             this.facture.lignes.length > 0 &&
             !this.facture.lignes.some(l => !l.produit_id || l.quantite <= 0);
    }
  },
  async mounted() {
    await Promise.all([this.loadClients(), this.loadProduits()]);
    
    // Vérifier s'il y a des paramètres d'URL
    const clientId = this.$route.query.clientId;
    if (clientId) {
      this.facture.client_id = clientId;
    }
    
    const editId = this.$route.query.edit;
    if (editId) {
      this.isEditing = true;
      await this.loadFacture(editId);
    }
  },
  methods: {
    async loadClients() {
      try {
        const response = await clientsService.getAll();
        this.clients = response.clients || [];
      } catch (error) {
        console.error('Erreur chargement clients:', error);
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
    
    async loadFacture(id) {
      try {
        const response = await facturesService.getById(id);
        const facture = response.facture;
        
        this.facture = {
          client_id: facture.client_id,
          lignes: facture.lignes.map(l => ({
            produit_id: l.produit_id,
            produit: this.produits.find(p => p.id === l.produit_id),
            quantite: l.quantite,
            prix_unitaire: l.prix_unitaire,
            remise: l.remise || 0,
            sous_total: l.sous_total
          }))
        };
        
        this.updateTotaux();
      } catch (error) {
        console.error('Erreur chargement facture:', error);
        Swal.fire('Erreur', 'Impossible de charger la facture', 'error');
        this.$router.push('/factures');
      }
    },
    
    addLigne() {
      this.facture.lignes.push({
        produit_id: '',
        produit: null,
        quantite: 1,
        prix_unitaire: 0,
        remise: 0,
        sous_total: 0
      });
    },
    
    removeLigne(index) {
      this.facture.lignes.splice(index, 1);
      this.updateTotaux();
    },
    
    updateProduit(index) {
      const ligne = this.facture.lignes[index];
      const produit = this.produits.find(p => p.id == ligne.produit_id);
      
      if (produit) {
        ligne.produit = produit;
        ligne.prix_unitaire = produit.prix_ht;
      } else {
        ligne.produit = null;
        ligne.prix_unitaire = 0;
      }
      
      this.updateTotaux();
    },
    
    updateTotaux() {
      let totalHT = 0;
      
      this.facture.lignes.forEach(ligne => {
        const prixNet = ligne.prix_unitaire * (1 - (ligne.remise || 0) / 100);
        ligne.sous_total = prixNet * ligne.quantite;
        totalHT += ligne.sous_total;
      });
      
      const tva = totalHT * 0.20;
      
      this.totaux = {
        ht: totalHT,
        tva: tva,
        ttc: totalHT + tva
      };
    },
    
    // CORRECTION ICI : Ajoutez cette méthode
    getSituationBadgeClass(solde) {
      if (solde > 0) return 'bg-danger';
      if (solde < 0) return 'bg-info';
      return 'bg-success';
    },
    
    async submitFacture() {
      if (!this.canSubmit) return;
      
      // Validation supplémentaire
      const hasStockIssue = this.facture.lignes.some(ligne => 
        ligne.produit && ligne.quantite > ligne.produit.stock
      );
      
      if (hasStockIssue) {
        Swal.fire('Attention', 'Certains produits ont un stock insuffisant', 'warning');
        return;
      }
      
      this.submitting = true;
      
      try {
        const factureData = {
          client_id: this.facture.client_id,
          lignes: this.facture.lignes.map(l => ({
            produit_id: l.produit_id,
            quantite: l.quantite,
            prix_unitaire: l.prix_unitaire,
            remise: l.remise
          }))
        };
        
        if (this.isEditing) {
          // À implémenter: mise à jour facture
          Swal.fire('Info', 'La mise à jour des factures n\'est pas encore implémentée', 'info');
        } else {
          const response = await facturesService.create(factureData);
          
          Swal.fire({
            icon: 'success',
            title: 'Facture créée !',
            html: `
              <p>La facture a été créée avec succès.</p>
              <p><strong>Numéro:</strong> ${response.facture.numero}</p>
              <p><strong>Montant:</strong> ${this.formatCurrency(response.facture.montant_ttc)}</p>
            `,
            showCancelButton: true,
            confirmButtonText: 'Voir la facture',
            cancelButtonText: 'Continuer'
          }).then(result => {
            if (result.isConfirmed) {
              this.$router.push(`/factures/${response.facture.id}`);
            } else {
              this.$router.push('/factures');
            }
          });
        }
      } catch (error) {
        console.error('Erreur création facture:', error);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: error.response?.data?.error || 'Erreur lors de la création de la facture'
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
.facture-form-page {
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

input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  opacity: 1;
}
</style>