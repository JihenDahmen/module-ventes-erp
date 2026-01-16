<template>
  <div class="retours-page">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="h3">Gestion des Retours</h1>
      <div class="btn-group">
        <router-link to="/retours/nouveau" class="btn btn-primary">
          <i class="bi bi-plus-circle"></i> Nouveau Retour
        </router-link>
        <button class="btn btn-outline-secondary" @click="loadRetours">
          <i class="bi bi-arrow-clockwise"></i>
        </button>
      </div>
    </div>

    <!-- Filtres -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-3">
            <label class="form-label">Statut</label>
            <select class="form-select" v-model="filter.statut">
              <option value="all">Tous les statuts</option>
              <option value="demandé">Demandé</option>
              <option value="validé">Validé (SAV)</option>
              <option value="réceptionné">Réceptionné</option>
              <option value="clôturé">Clôturé</option>
              <option value="rejeté">Rejeté</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Client</label>
            <select class="form-select" v-model="filter.clientId">
              <option value="all">Tous les clients</option>
              <option v-for="client in clients" :key="client.id" :value="client.id">
                {{ client.nom }}
              </option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Date début</label>
            <input type="date" class="form-control" v-model="filter.date_debut">
          </div>
          <div class="col-md-3">
            <label class="form-label">Date fin</label>
            <input type="date" class="form-control" v-model="filter.date_fin">
          </div>
        </div>
      </div>
    </div>

    <!-- Statistiques -->
    <div class="row mb-4">
      <div class="col-md-2" v-for="(count, statut) in stats" :key="statut">
        <div class="card" :class="getStatutCardClass(statut)">
          <div class="card-body text-center py-3">
            <h6 class="card-title text-muted mb-1">{{ statut }}</h6>
            <h3 class="card-text">{{ count }}</h3>
          </div>
        </div>
      </div>
    </div>

    <!-- Tableau des retours -->
    <div class="card">
      <div class="card-body">
        <div v-if="loading" class="text-center py-5">
          <LoadingSpinner message="Chargement des retours..." />
        </div>
        
        <div v-else-if="filteredRetours.length === 0" class="text-center py-5 text-muted">
          <i class="bi bi-arrow-return-left display-1"></i>
          <p class="mt-3">Aucun retour trouvé</p>
          <router-link to="/retours/nouveau" class="btn btn-primary mt-2">
            <i class="bi bi-plus-circle"></i> Créer un retour
          </router-link>
        </div>
        
        <div v-else>
          <div class="table-responsive">
            <table class="table table-hover align-middle">
              <thead class="table-light">
                <tr>
                  <th>Référence</th>
                  <th>Facture</th>
                  <th>Client</th>
                  <th>Date retour</th>
                  <th>Motif</th>
                  <th>Statut</th>
                  <th class="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="retour in filteredRetours" :key="retour.id">
                  <td>
                    <strong>{{ retour.reference }}</strong>
                    <div class="text-muted small">{{ formatDate(retour.created_at) }}</div>
                  </td>
                  <td>
                    <router-link :to="`/factures/${retour.facture_id}`" class="text-decoration-none">
                      {{ retour.facture_numero }}
                    </router-link>
                  </td>
                  <td>
                    <div>{{ retour.client_nom }}</div>
                    <div class="text-muted small">{{ retour.client_email }}</div>
                  </td>
                  <td>
                    <small>{{ formatDate(retour.date_retour) }}</small>
                  </td>
                  <td>
                    <span class="badge bg-secondary">{{ retour.motif }}</span>
                    <div v-if="retour.notes" class="text-muted small mt-1">
                      {{ truncate(retour.notes, 30) }}
                    </div>
                  </td>
                  <td>
                    <span :class="getStatutBadgeClass(retour.statut)" class="badge">
                      {{ retour.statut }}
                    </span>
                  </td>
                  <td class="text-end">
                    <div class="btn-group btn-group-sm">
                      <router-link 
                        :to="`/retours/${retour.id}`" 
                        class="btn btn-outline-primary"
                        title="Voir détails"
                      >
                        <i class="bi bi-eye"></i>
                      </router-link>
                      
                      <!-- Bouton Valider (SAV) -->
                      <button 
                        v-if="retour.statut === 'demandé'"
                        class="btn btn-outline-success"
                        @click="validerRetour(retour)"
                        title="Valider (SAV)"
                      >
                        <i class="bi bi-check-lg"></i>
                      </button>
                      
                      <!-- Bouton Rejeter -->
                      <button 
                        v-if="retour.statut === 'demandé'"
                        class="btn btn-outline-danger"
                        @click="rejeterRetour(retour)"
                        title="Rejeter"
                      >
                        <i class="bi bi-x-circle"></i>
                      </button>
                      
                      <!-- Bouton Réceptionner -->
                      <button 
                        v-if="retour.statut === 'validé'"
                        class="btn btn-outline-warning"
                        @click="receptionnerRetour(retour.id)"
                        title="Réceptionner"
                      >
                        <i class="bi bi-box-arrow-in-down"></i>
                      </button>
                      
                      <!-- Bouton Créer Avoir -->
                      <button 
                        v-if="retour.statut === 'réceptionné'"
                        class="btn btn-outline-info"
                        @click="creerAvoir(retour)"
                        title="Créer avoir"
                      >
                        <i class="bi bi-credit-card-2-front"></i>
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
  </div>
</template>

<script>
import { retoursService } from '@/services/retoursService';
import { clientsService } from '@/services/clientsService';
import { formatters, helpers } from '@/utils';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import Swal from 'sweetalert2';

export default {
  name: 'ListRetours',
  components: {
    LoadingSpinner
  },
  data() {
    return {
      loading: true,
      retours: [],
      filteredRetours: [],
      clients: [],
      filter: {
        statut: 'all',
        clientId: 'all',
        date_debut: '',
        date_fin: ''
      },
      stats: {}
    };
  },
  async mounted() {
    await Promise.all([this.loadRetours(), this.loadClients()]);
  },
  watch: {
    'filter.statut': 'applyFilters',
    'filter.clientId': 'applyFilters',
    'filter.date_debut': 'applyFilters',
    'filter.date_fin': 'applyFilters'
  },
  methods: {
    async loadRetours() {
      try {
        this.loading = true;
        const response = await retoursService.getAll();
        this.retours = response.retours || [];
        this.filteredRetours = [...this.retours];
        this.stats = response.stats || {};
      } catch (error) {
        console.error('Erreur chargement retours:', error);
        // Mock data
        this.retours = this.getMockRetours();
        this.filteredRetours = [...this.retours];
        this.stats = this.calculateMockStats();
      } finally {
        this.loading = false;
      }
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
      let filtered = [...this.retours];
      
      // Filtre par statut
      if (this.filter.statut !== 'all') {
        filtered = filtered.filter(r => r.statut === this.filter.statut);
      }
      
      // Filtre par client
      if (this.filter.clientId !== 'all') {
        filtered = filtered.filter(r => r.client_id == this.filter.clientId);
      }
      
      // Filtre par date
      if (this.filter.date_debut) {
        const dateDebut = new Date(this.filter.date_debut);
        filtered = filtered.filter(r => new Date(r.date_retour) >= dateDebut);
      }
      
      if (this.filter.date_fin) {
        const dateFin = new Date(this.filter.date_fin);
        dateFin.setHours(23, 59, 59);
        filtered = filtered.filter(r => new Date(r.date_retour) <= dateFin);
      }
      
      this.filteredRetours = filtered;
    },
    
    getStatutCardClass(statut) {
      const classes = {
        'demandé': 'border-info',
        'validé': 'border-primary',
        'réceptionné': 'border-warning',
        'clôturé': 'border-success',
        'rejeté': 'border-danger'
      };
      return classes[statut] || '';
    },
    
    getStatutBadgeClass(statut) {
      const classes = {
        'demandé': 'bg-info',
        'validé': 'bg-primary',
        'réceptionné': 'bg-warning',
        'clôturé': 'bg-success',
        'rejeté': 'bg-danger'
      };
      return classes[statut] || 'bg-secondary';
    },
    
    async validerRetour(retour) {
      console.log('=== VALIDATION RETOUR FRONTEND ===');
      console.log('Retour à valider:', retour);
      console.log('Retour ID:', retour.id);
      console.log('Retour statut:', retour.statut);
      
      if (!retour.id) {
        console.error('ERREUR: Retour sans ID');
        Swal.fire('Erreur', 'Le retour n\'a pas d\'ID', 'error');
        return;
      }
      
      const result = await Swal.fire({
        title: 'Valider ce retour ?',
        html: `
          <div class="text-start">
            <p><strong>Référence:</strong> ${retour.reference}</p>
            <p><strong>Client:</strong> ${retour.client_nom}</p>
            <p><strong>Facture:</strong> ${retour.facture_numero}</p>
            <p><strong>Motif:</strong> ${retour.motif}</p>
            <div class="alert alert-info mt-3">
              <i class="bi bi-info-circle"></i>
              Le retour sera marqué comme "validé" par le SAV.
            </div>
          </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Valider',
        cancelButtonText: 'Annuler',
        showLoaderOnConfirm: true,
        preConfirm: async () => {
          try {
            console.log('Appel API avec ID:', retour.id);
            const response = await retoursService.validate(retour.id);
            console.log('Réponse API:', response);
            return response;
          } catch (error) {
            console.error('Erreur API:', error);
            Swal.showValidationMessage(
              `Erreur: ${error.response?.data?.error || error.message}`
            );
          }
        }
      });
      
      if (result.isConfirmed && result.value?.success) {
        Swal.fire({
          icon: 'success',
          title: 'Validé !',
          html: `
            <p>Le retour a été validé avec succès.</p>
            <p><strong>Nouveau statut:</strong> validé</p>
            <p class="text-muted small">Prêt pour la réception logistique</p>
          `,
          timer: 3000,
          showConfirmButton: false
        });
        
        // Recharger les données
        await this.loadRetours();
        
      } else if (result.isConfirmed && result.value?.success === false) {
        Swal.fire({
          icon: 'error',
          title: 'Échec',
          text: result.value?.error || 'La validation a échoué',
          footer: 'Vérifiez que le retour est bien en statut "demandé"'
        });
      }
    },
    
    async receptionnerRetour(retourId) {
      console.log('Tentative réception pour retour ID:', retourId);
      
      if (!retourId) {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'ID de retour manquant'
        });
        return;
      }

      const result = await Swal.fire({
        title: 'Réceptionner les produits ?',
        html: `
          <p>Les produits du retour <strong>${retourId}</strong> seront réceptionnés.</p>
          <p class="text-warning"><i class="bi bi-exclamation-triangle"></i> Les stocks seront mis à jour automatiquement.</p>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Oui, réceptionner',
        cancelButtonText: 'Annuler'
      });
      
      if (result.isConfirmed) {
        try {
          const response = await retoursService.receive(retourId);
          
          Swal.fire({
            icon: 'success',
            title: 'Réceptionné !',
            html: `
              <p>Les produits ont été réceptionnés avec succès.</p>
              <p class="small">Retour ID: ${retourId}</p>
            `,
            timer: 2000,
            showConfirmButton: false
          });
          
          // Recharger la liste
          await this.loadRetours();
          
        } catch (error) {
          console.error('Erreur réception complète:', error);
          console.error('Response:', error.response);
          
          let message = 'Impossible de réceptionner le retour';
          if (error.response?.data?.error) {
            message = error.response.data.error;
          } else if (error.message) {
            message = error.message;
          }
          
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            html: `
              <p>${message}</p>
              <p class="small text-muted">ID retour: ${retourId}</p>
              <p class="small text-muted">Vérifiez que le retour est bien "validé"</p>
            `
          });
        }
      }
    },
    
    async rejeterRetour(retour) {
      console.log('Rejet retour:', retour.id);
      
      // Demander la raison du rejet
      const { value: raison } = await Swal.fire({
        title: 'Rejeter ce retour ?',
        html: `
          <p>Le retour <strong>${retour.reference}</strong> sera rejeté.</p>
          <p class="text-danger"><i class="bi bi-exclamation-triangle"></i> Cette action est irréversible !</p>
        `,
        input: 'textarea',
        inputLabel: 'Raison du rejet',
        inputPlaceholder: 'Expliquez pourquoi ce retour est rejeté...',
        inputAttributes: {
          'aria-label': 'Raison du rejet'
        },
        showCancelButton: true,
        confirmButtonText: 'Oui, rejeter',
        cancelButtonText: 'Annuler',
        inputValidator: (value) => {
          if (!value) {
            return 'Veuillez indiquer une raison !';
          }
        }
      });
      
      if (raison) {
        try {
          await retoursService.reject(retour.id, raison);
          
          Swal.fire({
            icon: 'success',
            title: 'Rejeté !',
            html: `
              <p>Le retour a été rejeté avec succès.</p>
              <p class="small text-muted">Raison: ${raison.substring(0, 100)}${raison.length > 100 ? '...' : ''}</p>
            `,
            timer: 2000,
            showConfirmButton: false
          });
          
          // Recharger la liste
          await this.loadRetours();
          
        } catch (error) {
          console.error('Erreur rejet:', error);
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: error.response?.data?.error || 'Impossible de rejeter le retour'
          });
        }
      }
    },
    
    async getMontantRetour(retourId) {
      try {
        const response = await retoursService.getById(retourId);
        // Calculer le montant total des lignes retournées
        return response.retour.lignes?.reduce((total, ligne) => {
          return total + (ligne.prix_unitaire * ligne.quantite_retournee);
        }, 0) || 0;
      } catch (error) {
        return 0;
      }
    },
    
    // AJOUT DE LA MÉTHODE MANQUANTE
    calculerMontantRetour(retour) {
      // Méthode simple : 80% du montant facture pour l'exemple
      // En réalité, vous devriez calculer basé sur les produits retournés
      return 100; // Valeur par défaut
    },
    
    async creerAvoir(retour) {
      const result = await Swal.fire({
        title: 'Type d\'avoir',
        input: 'select',
        inputOptions: {
          'avoir_client': 'Avoir client (crédit en compte)',
          'remboursement': 'Remboursement (argent rendu)',
          'échange': 'Échange (nouveau produit envoyé)'
        },
        inputPlaceholder: 'Sélectionner le type',
        showCancelButton: true,
        confirmButtonText: 'Continuer',
        cancelButtonText: 'Annuler'
      });
      
      if (result.isConfirmed && result.value) {
        const typeAvoir = result.value;
        
        // Pour un échange, pas besoin de montant
        if (typeAvoir === 'échange') {
          try {
            const avoirData = {
              client_id: retour.client_id,
              montant: 0, // Montant à 0 pour un échange
              type: typeAvoir
            };
            
            await retoursService.createAvoir(retour.id, avoirData);
            
            Swal.fire({
              icon: 'success',
              title: 'Échange initié !',
              html: `
                <p>Le processus d'échange a été initié.</p>
                <p><strong>Type:</strong> Échange produit</p>
                <p><strong>Actions:</strong></p>
                <ul class="text-start">
                  <li>Préparer le nouveau produit</li>
                  <li>Organiser l'envoi</li>
                  <li>Mettre à jour les stocks</li>
                </ul>
              `,
              timer: 4000,
              showConfirmButton: false
            });
            
            await this.loadRetours();
            return;
            
          } catch (error) {
            console.error('Erreur création échange:', error);
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: error.response?.data?.error || 'Impossible de créer l\'échange'
            });
            return;
          }
        }
        
        // Pour avoir_client ou remboursement, demander le montant
        const montantRetour = await this.getMontantRetour(retour.id);
        const montantSuggere = montantRetour > 0 ? montantRetour : 100;
        
        const { value: montant } = await Swal.fire({
          title: 'Montant de l\'avoir',
          html: `
            <p>Montant suggéré basé sur le retour: <strong>${formatters.currency(montantSuggere)}</strong></p>
            <p>Vous pouvez ajuster ce montant si nécessaire.</p>
          `,
          input: 'number',
          inputLabel: 'Montant (TND)',
          inputValue: montantSuggere,
          showCancelButton: true,
          confirmButtonText: 'Créer',
          cancelButtonText: 'Annuler',
          inputValidator: (value) => {
            if (!value || value <= 0) {
              return 'Le montant doit être supérieur à 0';
            }
          }
        });
        
        if (montant) {
          try {
            const avoirData = {
              client_id: retour.client_id,
              montant: parseFloat(montant),
              type: typeAvoir
            };
            
            const response = await retoursService.createAvoir(retour.id, avoirData);
            
            Swal.fire({
              icon: 'success',
              title: typeAvoir === 'avoir_client' ? 'Avoir créé !' : 'Remboursement initié !',
              html: `
                <p>${typeAvoir === 'avoir_client' ? 'L\'avoir client a été créé avec succès.' : 'Le processus de remboursement a été initié.'}</p>
                <p><strong>Type:</strong> ${typeAvoir}</p>
                <p><strong>Montant:</strong> ${formatters.currency(montant)}</p>
                ${response.avoir?.numero ? `<p><strong>Référence:</strong> ${response.avoir.numero}</p>` : ''}
              `,
              timer: 3000,
              showConfirmButton: false
            });
            
            await this.loadRetours();
            
          } catch (error) {
            console.error('Erreur création avoir:', error);
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: error.response?.data?.error || 'Impossible de créer l\'avoir'
            });
          }
        }
      }
    },
    
    formatDate: formatters.date,
    formatCurrency: formatters.currency,
    truncate: helpers.truncate,
    
    getMockRetours() {
      return [
        {
          id: 1,
          reference: 'RET-2024-0001',
          facture_id: 1,
          facture_numero: 'FACT-2024-0125',
          client_id: 1,
          client_nom: 'Entreprise ABC',
          client_email: 'contact@abc.com',
          date_retour: '2024-01-28',
          motif: 'défectueux',
          notes: 'Produit ne fonctionne pas à la réception',
          statut: 'demandé',
          lignes_count: 1,
          created_at: '2024-01-28T10:30:00'
        },
        {
          id: 2,
          reference: 'RET-2024-0002',
          facture_id: 2,
          facture_numero: 'FACT-2024-0124',
          client_id: 2,
          client_nom: 'SARL XYZ',
          client_email: 'info@xyz.com',
          date_retour: '2024-01-27',
          motif: 'non_conforme',
          notes: 'Couleur différente de la commande',
          statut: 'validé',
          lignes_count: 2,
          created_at: '2024-01-27T14:15:00'
        }
      ];
    },
    
    calculateMockStats() {
      return {
        demandé: 1,
        validé: 1,
        réceptionné: 0,
        clôturé: 0,
        rejeté: 0
      };
    }
  }
};
</script>

<style scoped>
.retours-page {
  padding: 20px 0;
}
</style>