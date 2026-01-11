<template>
  <div class="clients-page">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="h3">Gestion des Clients</h1>
      <router-link to="/clients/nouveau" class="btn btn-primary">
        <i class="bi bi-plus-circle"></i> Nouveau Client
      </router-link>
    </div>

    <!-- Filtres -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-6">
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-search"></i></span>
              <input 
                type="text" 
                class="form-control" 
                placeholder="Rechercher un client..." 
                v-model="searchTerm"
                @input="searchClients"
              />
            </div>
          </div>
          <div class="col-md-6">
            <div class="btn-group" role="group">
              <button 
                type="button" 
                class="btn" 
                :class="filter === 'all' ? 'btn-primary' : 'btn-outline-primary'"
                @click="filter = 'all'"
              >
                Tous
              </button>
              <button 
                type="button" 
                class="btn" 
                :class="filter === 'debiteur' ? 'btn-danger' : 'btn-outline-danger'"
                @click="filter = 'debiteur'"
              >
                Débiteurs
              </button>
              <button 
                type="button" 
                class="btn" 
                :class="filter === 'crediteur' ? 'btn-success' : 'btn-outline-success'"
                @click="filter = 'crediteur'"
              >
                Créanciers
              </button>
              <button 
                type="button" 
                class="btn" 
                :class="filter === 'ajour' ? 'btn-info' : 'btn-outline-info'"
                @click="filter = 'ajour'"
              >
                À jour
              </button>
            </div>
          </div>
        </div>
        <div class="mt-3 small text-muted">
          <span class="me-3">
            <i class="bi bi-circle-fill text-danger"></i> Débiteurs: Clients qui nous doivent de l'argent (solde > 0)
          </span>
          <span class="me-3">
            <i class="bi bi-circle-fill text-info"></i> Créanciers: Clients à qui nous devons de l'argent (solde < 0)
          </span>
          <span>
            <i class="bi bi-circle-fill text-success"></i> À jour: Clients avec solde nul (solde = 0)
          </span>
        </div>
      </div>
    </div>

    <!-- Tableau des clients -->
    <div class="card">
      <div class="card-body">
        <div v-if="loading" class="text-center py-5">
          <LoadingSpinner message="Chargement des clients..." />
        </div>
        
        <div v-else-if="filteredClients.length === 0" class="text-center py-5 text-muted">
          <i class="bi bi-people display-1"></i>
          <p class="mt-3">Aucun client trouvé</p>
          <div v-if="filter !== 'all'" class="mt-2">
            <button class="btn btn-sm btn-outline-secondary" @click="filter = 'all'">
              Voir tous les clients
            </button>
          </div>
        </div>
        
        <div v-else>
          <div class="alert alert-info mb-3">
            <i class="bi bi-info-circle me-2"></i>
            Affichage: <strong>{{ filteredClients.length }}</strong> client(s)
            <span v-if="filter !== 'all'">
              ({{ getFilterDescription() }})
            </span>
          </div>
          
          <div class="table-responsive">
            <table class="table table-hover align-middle">
              <thead class="table-light">
                <tr>
                  <th>ID</th>
                  <th>Nom</th>
                  <th>Contact</th>
                  <th>Solde</th>
                  <th>Situation</th>
                  <th>Création</th>
                  <th class="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="client in filteredClients" :key="client.id" :class="getSoldeRowClass(client.solde)">
                  <td><span class="badge bg-secondary">#{{ client.id }}</span></td>
                  <td>
                    <strong>{{ client.nom }}</strong>
                    <br>
                    <small class="text-muted">{{ truncate(client.adresse, 40) }}</small>
                  </td>
                  <td>
                    <div v-if="client.email">
                      <i class="bi bi-envelope me-1"></i>
                      <small>{{ client.email }}</small>
                    </div>
                    <div v-if="client.telephone" class="mt-1">
                      <i class="bi bi-telephone me-1"></i>
                      <small>{{ client.telephone }}</small>
                    </div>
                  </td>
                  <td :class="getSoldeTextClass(client.solde)">
                    {{ formatCurrency(client.solde) }}
                    <div v-if="client.solde > 0" class="small text-danger">
                      <i class="bi bi-exclamation-triangle"></i> À recouvrer
                    </div>
                    <div v-else-if="client.solde < 0" class="small text-info">
                      <i class="bi bi-arrow-left-circle"></i> Crédit client
                    </div>
                  </td>
                  <td>
                    <span :class="getSituationBadgeClass(client.solde)" class="badge">
                      {{ getSituation(client.solde) }}
                    </span>
                    <div class="small text-muted mt-1">
                      {{ getSituationExplanation(client.solde) }}
                    </div>
                  </td>
                  <td>
                    <small class="text-muted">{{ formatDate(client.created_at) }}</small>
                  </td>
                  <td class="text-end">
                    <div class="btn-group btn-group-sm">
                      <router-link 
                        :to="`/clients/${client.id}`" 
                        class="btn btn-outline-primary"
                        title="Voir détails"
                      >
                        <i class="bi bi-eye"></i>
                      </router-link>
                      <router-link 
                        :to="`/clients/${client.id}/editer`" 
                        class="btn btn-outline-secondary"
                        title="Modifier"
                      >
                        <i class="bi bi-pencil"></i>
                      </router-link>
                      <router-link 
                        :to="`/factures/nouvelle?clientId=${client.id}`" 
                        class="btn btn-outline-success"
                        title="Créer facture"
                      >
                        <i class="bi bi-receipt"></i>
                      </router-link>
                      <button 
                        class="btn btn-outline-danger"
                        @click="confirmDelete(client)"
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

        <!-- Statistiques -->
        <div class="mt-4 pt-4 border-top">
          <h6 class="mb-3">Résumé</h6>
          <div class="row">
            <div class="col-md-3 mb-3">
              <div class="card bg-light">
                <div class="card-body text-center">
                  <h5 class="card-title text-muted mb-2">Total Clients</h5>
                  <h3 class="card-text">{{ stats.totalClients }}</h3>
                </div>
              </div>
            </div>
            <div class="col-md-3 mb-3">
              <div class="card bg-success bg-opacity-10">
                <div class="card-body text-center">
                  <h5 class="card-title text-muted mb-2">À jour</h5>
                  <h3 class="card-text text-success">{{ stats.clientsSoldeZero }}</h3>
                  <small class="text-muted">Solde = 0</small>
                </div>
              </div>
            </div>
            <div class="col-md-3 mb-3">
              <div class="card bg-danger bg-opacity-10">
                <div class="card-body text-center">
                  <h5 class="card-title text-muted mb-2">Débiteurs</h5>
                  <h3 class="card-text text-danger">{{ stats.clientsSoldePositif }}</h3>
                  <small class="text-muted">{{ formatCurrency(stats.totalSoldePositif) }} à recouvrer</small>
                </div>
              </div>
            </div>
            <div class="col-md-3 mb-3">
              <div class="card bg-info bg-opacity-10">
                <div class="card-body text-center">
                  <h5 class="card-title text-muted mb-2">Créanciers</h5>
                  <h3 class="card-text text-info">{{ stats.clientsSoldeNegatif }}</h3>
                  <small class="text-muted">{{ formatCurrency(stats.totalSoldeNegatif) }} crédit client</small>
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
import { clientsService } from '@/services/clientsService';
import { formatters, helpers } from '@/utils';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import Swal from 'sweetalert2';

export default {
  name: 'ListClients',
  components: {
    LoadingSpinner
  },
  data() {
    return {
      clients: [],
      filteredClients: [],
      loading: true,
      searchTerm: '',
      filter: 'all',
      stats: {
        totalClients: 0,
        clientsSoldePositif: 0,
        clientsSoldeNegatif: 0,
        clientsSoldeZero: 0,
        totalSoldePositif: 0,
        totalSoldeNegatif: 0
      }
    };
  },
  async mounted() {
    await this.loadClients();
  },
  watch: {
    filter() {
      this.applyFilters();
    }
  },
  methods: {
    async loadClients() {
      try {
        this.loading = true;
        const response = await clientsService.getAll();
        this.clients = response.clients || [];
        this.filteredClients = [...this.clients];
        this.calculateStats();
      } catch (error) {
        console.error('Erreur chargement clients:', error);
        // Mock data pour développement
        this.clients = this.getMockClients();
        this.filteredClients = [...this.clients];
        this.calculateStats();
      } finally {
        this.loading = false;
      }
    },
    async refreshClients() {
  console.log('Rechargement des clients...');
  await this.loadClients();
  this.$forceUpdate(); // Force le re-render
},
    
    searchClients() {
      if (!this.searchTerm.trim()) {
        this.applyFilters();
        return;
      }
      
      const term = this.searchTerm.toLowerCase();
      this.filteredClients = this.clients.filter(client =>
        client.nom.toLowerCase().includes(term) ||
        (client.email && client.email.toLowerCase().includes(term)) ||
        (client.telephone && client.telephone.includes(term)) ||
        (client.adresse && client.adresse.toLowerCase().includes(term))
      );
    },
    
    applyFilters() {
      let filtered = [...this.clients];
      
      switch (this.filter) {
        case 'debiteur':
          filtered = filtered.filter(c => parseFloat(c.solde) > 0);
          break;
        case 'crediteur':
          filtered = filtered.filter(c => parseFloat(c.solde) < 0);
          break;
        case 'ajour':
          filtered = filtered.filter(c => parseFloat(c.solde) === 0);
          break;
      }
      
      // Appliquer aussi la recherche si présente
      if (this.searchTerm.trim()) {
        const term = this.searchTerm.toLowerCase();
        filtered = filtered.filter(client =>
          client.nom.toLowerCase().includes(term) ||
          (client.email && client.email.toLowerCase().includes(term)) ||
          (client.telephone && client.telephone.includes(term)) ||
          (client.adresse && client.adresse.toLowerCase().includes(term))
        );
      }
      
      this.filteredClients = filtered;
    },
    
    calculateStats() {
      const clientsSoldePositif = this.clients.filter(c => parseFloat(c.solde) > 0);
      const clientsSoldeNegatif = this.clients.filter(c => parseFloat(c.solde) < 0);
      
      this.stats = {
        totalClients: this.clients.length,
        clientsSoldePositif: clientsSoldePositif.length,
        clientsSoldeNegatif: clientsSoldeNegatif.length,
        clientsSoldeZero: this.clients.filter(c => parseFloat(c.solde) === 0).length,
        totalSoldePositif: clientsSoldePositif.reduce((sum, c) => sum + parseFloat(c.solde), 0),
        totalSoldeNegatif: Math.abs(clientsSoldeNegatif.reduce((sum, c) => sum + parseFloat(c.solde), 0))
      };
    },
    
    getFilterDescription() {
      switch (this.filter) {
        case 'debiteur': return 'Débiteurs uniquement (solde > 0)';
        case 'crediteur': return 'Créanciers uniquement (solde < 0)';
        case 'ajour': return 'Clients à jour uniquement (solde = 0)';
        default: return 'Tous les clients';
      }
    },
    
    getSituation(solde) {
      const soldeNum = parseFloat(solde);
      if (soldeNum > 0) return 'Débiteur';
      if (soldeNum < 0) return 'Créancier';
      return 'À jour';
    },
    
    getSituationExplanation(solde) {
      const soldeNum = parseFloat(solde);
      if (soldeNum > 0) return `Dette client: ${this.formatCurrency(soldeNum)}`;
      if (soldeNum < 0) return `Crédit client: ${this.formatCurrency(Math.abs(soldeNum))}`;
      return 'Solde à jour';
    },
    
    getSituationBadgeClass(solde) {
      const soldeNum = parseFloat(solde);
      if (soldeNum > 0) return 'bg-danger';
      if (soldeNum < 0) return 'bg-info';
      return 'bg-success';
    },
    
    getSoldeRowClass(solde) {
      const soldeNum = parseFloat(solde);
      if (soldeNum > 0) return 'table-danger';
      if (soldeNum < 0) return 'table-info';
      return '';
    },
    
    getSoldeTextClass(solde) {
      const soldeNum = parseFloat(solde);
      if (soldeNum > 0) return 'text-danger fw-bold';
      if (soldeNum < 0) return 'text-info fw-bold';
      return '';
    },
    
    formatCurrency: formatters.currency,
    formatDate: formatters.date,
    truncate: helpers.truncate,
    
    confirmDelete(client) {
      Swal.fire({
        title: 'Supprimer le client ?',
        html: `Êtes-vous sûr de vouloir supprimer le client <strong>"${client.nom}"</strong> ?<br>Cette action est irréversible.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Oui, supprimer',
        cancelButtonText: 'Annuler',
        reverseButtons: true
      }).then(async (result) => {
        if (result.isConfirmed) {
          await this.deleteClient(client);
        }
      });
    },
    
    async deleteClient(client) {
      try {
        await clientsService.delete(client.id);
        
        Swal.fire({
          icon: 'success',
          title: 'Supprimé !',
          text: `Le client "${client.nom}" a été supprimé.`,
          timer: 2000,
          showConfirmButton: false
        });
        
        await this.loadClients();
      } catch (error) {
        console.error('Erreur suppression client:', error);
        Swal.fire({
          icon: 'error',
          title: 'Erreur !',
          text: error.response?.data?.error || 'Impossible de supprimer le client.',
        });
      }
    },
    
    getMockClients() {
      return [
        // DÉBITEURS (solde > 0)
        {
          id: 1,
          nom: 'Entreprise ABC SARL',
          email: 'contact@abc-sarl.com',
          telephone: '01 23 45 67 89',
          adresse: '123 Avenue des Champs-Élysées, 75008 Paris',
          solde: 2450.75,
          created_at: '2024-01-15T10:30:00'
        },
        {
          id: 4,
          nom: 'Société Tech Innov',
          email: 'info@tech-innov.fr',
          telephone: '02 98 76 54 32',
          adresse: '321 Rue du Commerce, 35000 Rennes',
          solde: 8500.00,
          created_at: '2024-02-01T11:20:00'
        },
        // CRÉANCIERS (solde < 0)
        {
          id: 2,
          nom: 'SARL XYZ Distribution',
          email: 'commercial@xyz-dist.com',
          telephone: '04 56 78 90 12',
          adresse: '456 Rue de la République, 69002 Lyon',
          solde: -1250.50,
          created_at: '2024-01-20T14:15:00'
        },
        {
          id: 5,
          nom: 'Boutique Fashion',
          email: 'contact@fashion-boutique.fr',
          telephone: '03 45 67 89 01',
          adresse: '789 Rue du Commerce, 75001 Paris',
          solde: -500.25,
          created_at: '2024-02-05T14:30:00'
        },
        // À JOUR (solde = 0)
        {
          id: 3,
          nom: 'M. Dupont Jean-Pierre',
          email: 'jean.dupont@email.com',
          telephone: '06 12 34 56 78',
          adresse: '789 Boulevard de Marseille, 13001 Marseille',
          solde: 0.00,
          created_at: '2024-01-25T09:45:00'
        },
        {
          id: 6,
          nom: 'Restaurant Le Gourmet',
          email: 'reservation@gourmet-resto.fr',
          telephone: '05 67 89 01 23',
          adresse: '456 Avenue de la Gastronomie, 69001 Lyon',
          solde: 0.00,
          created_at: '2024-02-10T09:15:00'
        }
      ];
    }
  }
};
</script>

<style scoped>
.clients-page {
  padding: 20px 0;
}
.table-responsive {
  max-height: 600px;
  overflow-y: auto;
}
.btn-group-sm .btn {
  padding: 0.25rem 0.5rem;
}
.table-danger {
  --bs-table-bg: rgba(220, 53, 69, 0.05);
}
.table-info {
  --bs-table-bg: rgba(13, 110, 253, 0.05);
}
.btn-group .btn {
  border-radius: 0.375rem;
}
.btn-group .btn:not(:first-child) {
  margin-left: -1px;
}
</style>