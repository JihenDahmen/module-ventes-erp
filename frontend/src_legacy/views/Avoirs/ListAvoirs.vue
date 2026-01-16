<template>
  <div class="avoirs-page">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="h3">Gestion des Avoirs</h1>
      <div class="btn-group">
        <button class="btn btn-outline-secondary" @click="loadAvoirs">
          <i class="bi bi-arrow-clockwise"></i>
        </button>
      </div>
    </div>

    <!-- Filtres -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-3">
            <label class="form-label">Type</label>
            <select class="form-select" v-model="filter.type">
              <option value="all">Tous les types</option>
              <option value="avoir_client">Avoir client</option>
              <option value="remboursement">Remboursement</option>
              <option value="échange">Échange</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Statut</label>
            <select class="form-select" v-model="filter.statut">
              <option value="all">Tous les statuts</option>
              <option value="généré">Généré</option>
              <option value="appliqué">Appliqué</option>
              <option value="annulé">Annulé</option>
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
            <label class="form-label">Année</label>
            <select class="form-select" v-model="filter.annee">
              <option value="all">Toutes années</option>
              <option v-for="year in years" :key="year" :value="year">
                {{ year }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Statistiques -->
    <div class="row mb-4">
      <div class="col-md-3">
        <div class="card bg-primary text-white">
          <div class="card-body text-center">
            <h6 class="card-title mb-0">Total Avoirs</h6>
            <h3 class="mt-2">{{ stats.total || 0 }}</h3>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-info text-white">
          <div class="card-body text-center">
            <h6 class="card-title mb-0">Avoirs disponibles</h6>
            <h3 class="mt-2">{{ stats.généré || 0 }}</h3>
            <small>{{ formatCurrency(statsTotal.généré) }}</small>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-success text-white">
          <div class="card-body text-center">
            <h6 class="card-title mb-0">Avoirs appliqués</h6>
            <h3 class="mt-2">{{ stats.appliqué || 0 }}</h3>
            <small>{{ formatCurrency(statsTotal.appliqué) }}</small>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-warning text-white">
          <div class="card-body text-center">
            <h6 class="card-title mb-0">Montant total</h6>
            <h3 class="mt-2">{{ formatCurrency(statsTotal.total) }}</h3>
          </div>
        </div>
      </div>
    </div>

    <!-- Tableau des avoirs -->
    <div class="card">
      <div class="card-body">
        <div v-if="loading" class="text-center py-5">
          <LoadingSpinner message="Chargement des avoirs..." />
        </div>
        
        <div v-else-if="filteredAvoirs.length === 0" class="text-center py-5 text-muted">
          <i class="bi bi-credit-card-2-front display-1"></i>
          <p class="mt-3">Aucun avoir trouvé</p>
        </div>
        
        <div v-else>
          <div class="table-responsive">
            <table class="table table-hover align-middle">
              <thead class="table-light">
                <tr>
                  <th>Numéro</th>
                  <th>Client</th>
                  <th>Retour</th>
                  <th>Montant</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Statut</th>
                  <th class="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="avoir in filteredAvoirs" :key="avoir.id">
                  <td>
                    <strong>{{ avoir.numero }}</strong>
                  </td>
                  <td>
                    <div>{{ avoir.client_nom }}</div>
                    <div class="text-muted small">{{ avoir.client_email }}</div>
                  </td>
                  <td>
                    <div v-if="avoir.retour_reference" class="small">
                      {{ avoir.retour_reference }}
                    </div>
                    <div v-else class="text-muted small">-</div>
                  </td>
                  <td>
                    <strong>{{ formatCurrency(avoir.montant) }}</strong>
                  </td>
                  <td>
                    <span :class="getTypeBadgeClass(avoir.type)" class="badge">
                      {{ avoir.type }}
                    </span>
                  </td>
                  <td>
                    <small>{{ formatDate(avoir.date_avoir) }}</small>
                  </td>
                  <td>
                    <span :class="getStatutBadgeClass(avoir.statut)" class="badge">
                      {{ avoir.statut }}
                    </span>
                  </td>
                  <td class="text-end">
                    <div class="btn-group btn-group-sm">
                      <button 
                        class="btn btn-outline-info"
                        @click="viewDetails(avoir)"
                        title="Voir détails"
                      >
                        <i class="bi bi-eye"></i>
                      </button>
                      
                      <!-- BOUTON APPLIQUER : Seulement pour avoir client et statut généré -->
                      <button 
                        v-if="avoir.type === 'avoir_client' && avoir.statut === 'généré'"
                        class="btn btn-outline-success"
                        @click="appliquerAvoir(avoir)"
                        title="Appliquer à une facture"
                      >
                        <i class="bi bi-check-lg"></i>
                      </button>
                      
                      <!-- BOUTON REMBOURSER : Pour les remboursements générés -->
                      <button 
                        v-if="avoir.type === 'remboursement' && avoir.statut === 'généré'"
                        class="btn btn-outline-warning"
                        @click="effectuerRemboursement(avoir)"
                        title="Effectuer le remboursement"
                      >
                        <i class="bi bi-cash-stack"></i>
                      </button>
                      
                      <!-- BOUTON PROCESSUS ÉCHANGE : Pour les échanges générés -->
                      <button 
                        v-if="avoir.type === 'échange' && avoir.statut === 'généré'"
                        class="btn btn-outline-secondary"
                        @click="processusEchange(avoir)"
                        title="Démarrer le processus d'échange"
                      >
                        <i class="bi bi-truck"></i>
                      </button>
                      
                      <!-- BOUTON ANNULER : Pour tous les types générés -->
                      <button 
                        v-if="avoir.statut === 'généré'"
                        class="btn btn-outline-danger"
                        @click="annulerAvoir(avoir)"
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
          
          <!-- Totaux par type -->
          <div class="mt-4 pt-4 border-top">
            <h6 class="mb-3">Montants totaux par type</h6>
            <div class="row">
              <div class="col-md-4" v-for="(montant, type) in totalParType" :key="type">
                <div class="card">
                  <div class="card-body text-center">
                    <h5 class="card-title text-muted mb-1">{{ type }}</h5>
                    <h4 class="card-text">{{ formatCurrency(montant) }}</h4>
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
import { avoirsService } from '@/services/avoirsService';
import { clientsService } from '@/services/clientsService';
import { formatters } from '@/utils';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import Swal from 'sweetalert2';

export default {
  name: 'ListAvoirs',
  components: {
    LoadingSpinner
  },
  data() {
    const currentYear = new Date().getFullYear();
    const years = Array.from({length: 5}, (_, i) => currentYear - i);
    
    return {
      loading: true,
      avoirs: [],
      filteredAvoirs: [],
      clients: [],
      filter: {
        type: 'all',
        statut: 'all',
        clientId: 'all',
        annee: 'all'
      },
      stats: {},
      statsTotal: {},
      totalParType: {},
      years
    };
  },
  async mounted() {
    await Promise.all([this.loadAvoirs(), this.loadClients()]);
  },
  watch: {
    'filter.type': 'applyFilters',
    'filter.statut': 'applyFilters',
    'filter.clientId': 'applyFilters',
    'filter.annee': 'applyFilters'
  },
  methods: {
    async loadAvoirs() {
      try {
        this.loading = true;
        const response = await avoirsService.getAll();
        this.avoirs = response.avoirs || [];
        this.filteredAvoirs = [...this.avoirs];
        this.stats = response.stats || {};
        this.totalParType = response.totalParType || {};
        this.calculateStatsTotal();
      } catch (error) {
        console.error('Erreur chargement avoirs:', error);
        // Mock data
        this.avoirs = this.getMockAvoirs();
        this.filteredAvoirs = [...this.avoirs];
        this.calculateStatsTotal();
        this.calculateTotalParType();
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
      let filtered = [...this.avoirs];
      
      // Filtre par type
      if (this.filter.type !== 'all') {
        filtered = filtered.filter(a => a.type === this.filter.type);
      }
      
      // Filtre par statut
      if (this.filter.statut !== 'all') {
        filtered = filtered.filter(a => a.statut === this.filter.statut);
      }
      
      // Filtre par client
      if (this.filter.clientId !== 'all') {
        filtered = filtered.filter(a => a.client_id == this.filter.clientId);
      }
      
      // Filtre par année
      if (this.filter.annee !== 'all') {
        const annee = parseInt(this.filter.annee);
        filtered = filtered.filter(a => {
          const dateAvoir = new Date(a.date_avoir);
          return dateAvoir.getFullYear() === annee;
        });
      }
      
      this.filteredAvoirs = filtered;
    },
    
    calculateStatsTotal() {
      const avoirsGeneres = this.avoirs.filter(a => a.statut === 'généré');
      const avoirsAppliques = this.avoirs.filter(a => a.statut === 'appliqué');
      
      this.statsTotal = {
        généré: avoirsGeneres.reduce((sum, a) => sum + parseFloat(a.montant), 0),
        appliqué: avoirsAppliques.reduce((sum, a) => sum + parseFloat(a.montant), 0),
        total: this.avoirs.reduce((sum, a) => sum + parseFloat(a.montant), 0)
      };
    },
    
    calculateTotalParType() {
      const types = ['avoir_client', 'remboursement', 'échange'];
      this.totalParType = {};
      
      types.forEach(type => {
        const avoirsType = this.avoirs.filter(a => a.type === type);
        this.totalParType[type] = avoirsType.reduce((sum, a) => sum + parseFloat(a.montant), 0);
      });
    },
    
    getTypeBadgeClass(type) {
      const classes = {
        'avoir_client': 'bg-primary',
        'remboursement': 'bg-success',
        'échange': 'bg-info'
      };
      return classes[type] || 'bg-secondary';
    },
    
    getStatutBadgeClass(statut) {
      const classes = {
        'généré': 'bg-info',
        'appliqué': 'bg-success',
        'annulé': 'bg-danger'
      };
      return classes[statut] || 'bg-secondary';
    },
    
    viewDetails(avoir) {
      Swal.fire({
        title: 'Détails de l\'avoir',
        html: `
          <div class="text-start">
            <p><strong>Numéro:</strong> ${avoir.numero}</p>
            <p><strong>Client:</strong> ${avoir.client_nom}</p>
            <p><strong>Email:</strong> ${avoir.client_email}</p>
            <p><strong>Montant:</strong> ${this.formatCurrency(avoir.montant)}</p>
            <p><strong>Type:</strong> ${avoir.type}</p>
            <p><strong>Statut:</strong> ${avoir.statut}</p>
            <p><strong>Date:</strong> ${this.formatDate(avoir.date_avoir)}</p>
            ${avoir.retour_reference ? `<p><strong>Retour:</strong> ${avoir.retour_reference}</p>` : ''}
            <p><strong>Créé le:</strong> ${this.formatDate(avoir.created_at)}</p>
          </div>
        `,
        showCloseButton: true,
        showConfirmButton: false
      });
    },
      async effectuerRemboursement(avoir) {
    const result = await Swal.fire({
      title: 'Effectuer le remboursement ?',
      html: `
        <div class="text-start">
          <p>Le remboursement <strong>${avoir.numero}</strong> sera effectué.</p>
          <p><strong>Client:</strong> ${avoir.client_nom}</p>
          <p><strong>Montant:</strong> ${this.formatCurrency(avoir.montant)}</p>
          <div class="alert alert-warning mt-3">
            <i class="bi bi-exclamation-triangle"></i>
            <strong>Sortie de caisse à prévoir !</strong><br>
            <small>Ce montant sera déduit de votre trésorerie.</small>
          </div>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Confirmer le remboursement',
      cancelButtonText: 'Annuler',
      input: 'select',
      inputLabel: 'Mode de remboursement',
      inputOptions: {
        'virement': 'Virement bancaire',
        'chèque': 'Chèque',
        'espèces': 'Espèces'
      },
      inputPlaceholder: 'Sélectionner le mode',
      inputValidator: (value) => {
        if (!value) {
          return 'Veuillez sélectionner un mode de remboursement';
        }
      }
    });
    
    if (result.isConfirmed && result.value) {
      const mode = result.value;
      
      try {
        // API pour effectuer le remboursement
        const response = await avoirsService.effectuerRemboursement(avoir.id, {
          mode_remboursement: mode,
          notes: `Remboursement effectué via ${mode}`
        });
        
        Swal.fire({
          icon: 'success',
          title: 'Remboursement effectué !',
          html: `
            <p>Le remboursement a été effectué avec succès.</p>
            <p><strong>Mode:</strong> ${mode}</p>
            <p><strong>Montant:</strong> ${this.formatCurrency(avoir.montant)}</p>
            <p class="text-muted small">Le statut a été mis à jour.</p>
          `,
          timer: 3000,
          showConfirmButton: false
        });
        
        // Recharger les avoirs
        await this.loadAvoirs();
        
      } catch (error) {
        console.error('Erreur remboursement:', error);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: error.response?.data?.error || 'Impossible d\'effectuer le remboursement'
        });
      }
    }
  },
  
  async processusEchange(avoir) {
    const result = await Swal.fire({
      title: 'Démarrer le processus d\'échange ?',
      html: `
        <div class="text-start">
          <p>L'échange <strong>${avoir.numero}</strong> sera traité.</p>
          <p><strong>Client:</strong> ${avoir.client_nom}</p>
          <div class="alert alert-info mt-3">
            <i class="bi bi-info-circle"></i>
            <strong>Processus logistique :</strong><br>
            <small>1. Préparer le nouveau produit<br>
            2. Organiser l'envoi<br>
            3. Mettre à jour les stocks</small>
          </div>
        </div>
      `,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Démarrer le processus',
      cancelButtonText: 'Annuler'
    });
    
    if (result.isConfirmed) {
      try {
        // API pour démarrer le processus d'échange
        const response = await avoirsService.demarrerEchange(avoir.id);
        
        Swal.fire({
          icon: 'success',
          title: 'Processus démarré !',
          html: `
            <p>Le processus d'échange a été démarré.</p>
            <p><strong>Actions à effectuer :</strong></p>
            <ol class="text-start small">
              <li>Vérifier la disponibilité du produit</li>
              <li>Préparer le bon de livraison</li>
              <li>Mettre à jour les stocks</li>
              <li>Organiser l'expédition</li>
            </ol>
          `,
          timer: 4000,
          showConfirmButton: false
        });
        
        // Recharger les avoirs
        await this.loadAvoirs();
        
      } catch (error) {
        console.error('Erreur processus échange:', error);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: error.response?.data?.error || 'Impossible de démarrer le processus'
        });
      }
    }
  },
    
  async appliquerAvoir(avoir) {
    const { value: factureId } = await Swal.fire({
      title: 'Appliquer cet avoir client',
      html: `
        <div class="text-start">
          <p>L'avoir client <strong>${avoir.numero}</strong> sera appliqué à une facture.</p>
          <p><strong>Montant disponible:</strong> ${this.formatCurrency(avoir.montant)}</p>
          <p><strong>Client:</strong> ${avoir.client_nom}</p>
          <div class="alert alert-info mt-3">
            <i class="bi bi-info-circle"></i>
            <small>Cet avoir client sera converti en crédit sur la facture sélectionnée.</small>
          </div>
        </div>
      `,
      input: 'number',
      inputLabel: 'ID de la facture',
      inputPlaceholder: 'Entrez l\'ID de la facture...',
      showCancelButton: true,
      confirmButtonText: 'Appliquer',
      cancelButtonText: 'Annuler',
      inputValidator: (value) => {
        if (!value) {
          return 'Veuillez entrer l\'ID de la facture';
        }
      }
    });
    
    if (factureId) {
      try {
        await avoirsService.apply(avoir.id, factureId);
        
        Swal.fire({
          icon: 'success',
          title: 'Appliqué !',
          html: `
            <p>L'avoir client a été appliqué avec succès.</p>
            <p><strong>Facture:</strong> ${factureId}</p>
            <p><strong>Crédit appliqué:</strong> ${this.formatCurrency(avoir.montant)}</p>
            <p class="text-muted small">Le statut a été mis à jour.</p>
          `,
          timer: 3000,
          showConfirmButton: false
        });
        
        await this.loadAvoirs();
      } catch (error) {
        console.error('Erreur application avoir:', error);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: error.response?.data?.error || 'Impossible d\'appliquer l\'avoir'
        });
      }
    }
  },
    
async annulerAvoir(avoir) {
  const result = await Swal.fire({
    title: 'Annuler cet avoir ?',
    html: `
      <div class="text-start">
        <p>L'avoir <strong>${avoir.numero}</strong> sera annulé.</p>
        <p><strong>Montant:</strong> ${this.formatCurrency(avoir.montant)}</p>
        <p><strong>Client:</strong> ${avoir.client_nom}</p>
        <div class="alert alert-danger mt-3">
          <i class="bi bi-exclamation-triangle"></i>
          <strong>Cette action est irréversible !</strong><br>
          <small>Pour un avoir client, le solde du client sera réajusté.</small>
        </div>
      </div>
    `,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    confirmButtonText: 'Oui, annuler',
    cancelButtonText: 'Annuler',
    showLoaderOnConfirm: true,
    preConfirm: async () => {
      try {
        console.log('Tentative d\'annulation de l\'avoir:', avoir.id);
        const response = await avoirsService.annuler(avoir.id);
        console.log('Réponse d\'annulation:', response);
        return response;
      } catch (error) {
        console.error('Erreur d\'annulation:', error);
        Swal.showValidationMessage(
          `Erreur: ${error.response?.data?.error || error.message}`
        );
      }
    }
  });
  
  if (result.isConfirmed && result.value?.success) {
    Swal.fire({
      icon: 'success',
      title: 'Annulé !',
      html: `
        <p>L'avoir a été annulé avec succès.</p>
        <p><strong>Numéro:</strong> ${avoir.numero}</p>
        <p><strong>Statut:</strong> annulé</p>
        <p class="text-muted small">Le solde client a été réajusté si nécessaire.</p>
      `,
      timer: 3000,
      showConfirmButton: false
    });
    
    // Recharger les avoirs
    await this.loadAvoirs();
    
  } else if (result.isConfirmed && result.value?.success === false) {
    Swal.fire({
      icon: 'error',
      title: 'Échec',
      text: result.value?.error || 'Impossible d\'annuler l\'avoir',
      footer: 'Vérifiez que l\'avoir est bien en statut "généré"'
    });
  }
},
    
    formatCurrency: formatters.currency,
    formatDate: formatters.date,
    
    getMockAvoirs() {
      return [
        {
          id: 1,
          numero: 'AVOIR-2024-0001',
          client_id: 1,
          client_nom: 'Entreprise ABC',
          client_email: 'contact@abc.com',
          retour_id: 1,
          retour_reference: 'RET-2024-0001',
          montant: 150.00,
          type: 'avoir_client',
          statut: 'généré',
          date_avoir: '2024-01-28',
          created_at: '2024-01-28T14:30:00'
        },
        {
          id: 2,
          numero: 'AVOIR-2024-0002',
          client_id: 2,
          client_nom: 'SARL XYZ',
          client_email: 'info@xyz.com',
          retour_id: 2,
          retour_reference: 'RET-2024-0002',
          montant: 250.00,
          type: 'remboursement',
          statut: 'appliqué',
          date_avoir: '2024-01-27',
          created_at: '2024-01-27T16:45:00'
        }
      ];
    }
  }
};
</script>

<style scoped>
.avoirs-page {
  padding: 20px 0;
}
</style>