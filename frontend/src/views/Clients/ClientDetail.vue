<template>
  <div class="client-detail-page">
    <!-- En-tête -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="h3 mb-0">{{ client.nom || 'Chargement...' }}</h1>
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-0">
            <li class="breadcrumb-item">
              <router-link to="/clients">Clients</router-link>
            </li>
            <li class="breadcrumb-item active" aria-current="page">
              {{ client.nom ? client.nom : 'Détails' }}
            </li>
          </ol>
        </nav>
      </div>
      <div class="btn-group">
        <router-link :to="`/clients/${$route.params.id}/editer`" class="btn btn-outline-primary">
          <i class="bi bi-pencil"></i> Modifier
        </router-link>
        <router-link :to="`/factures/nouvelle?clientId=${$route.params.id}`" class="btn btn-success">
          <i class="bi bi-receipt"></i> Nouvelle facture
        </router-link>
      </div>
    </div>

    <div v-if="loading" class="text-center py-5">
      <LoadingSpinner message="Chargement des informations client..." />
    </div>

    <div v-else-if="!client || Object.keys(client).length === 0" class="text-center py-5 text-danger">
      <i class="bi bi-exclamation-triangle display-1"></i>
      <p class="mt-3">Client non trouvé</p>
      <router-link to="/clients" class="btn btn-primary mt-2">
        <i class="bi bi-arrow-left"></i> Retour à la liste
      </router-link>
    </div>

    <div v-else class="row">
      <!-- Informations client -->
      <div class="col-md-4">
        <div class="card mb-4">
          <div class="card-header">
            <h5 class="mb-0">Informations client</h5>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <label class="form-label text-muted mb-1">Contact</label>
              <div>
                <i class="bi bi-envelope me-2"></i>
                {{ client.email || 'Non renseigné' }}
              </div>
              <div class="mt-2">
                <i class="bi bi-telephone me-2"></i>
                {{ client.telephone || 'Non renseigné' }}
              </div>
            </div>
            
            <div class="mb-3">
              <label class="form-label text-muted mb-1">Adresse</label>
              <div v-if="client.adresse" class="bg-light p-2 rounded">
                {{ client.adresse }}
              </div>
              <div v-else class="text-muted">Non renseignée</div>
            </div>
            
            <div class="mb-3">
              <label class="form-label text-muted mb-1">Client depuis</label>
              <div>{{ formatDate(client.created_at) }}</div>
            </div>
            
            <div class="mb-3">
              <label class="form-label text-muted mb-1">ID Client</label>
              <div class="badge bg-secondary">#{{ client.id }}</div>
            </div>
          </div>
        </div>

        <!-- Avoirs disponibles -->
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Avoirs disponibles</h5>
            <button class="btn btn-sm btn-outline-primary" @click="loadAvoirs">
              <i class="bi bi-arrow-clockwise"></i>
            </button>
          </div>
          <div class="card-body">
            <div v-if="loadingAvoirs" class="text-center py-3">
              <div class="spinner-border spinner-border-sm" role="status"></div>
            </div>
            <div v-else-if="avoirs.length === 0" class="text-center py-3 text-muted">
              <i class="bi bi-credit-card-2-front display-6 opacity-25"></i>
              <p class="mt-2">Aucun avoir disponible</p>
            </div>
            <div v-else>
              <div v-for="avoir in avoirs" :key="avoir.id" class="mb-3 p-3 border rounded">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{{ avoir.numero }}</strong>
                    <div class="text-muted small">{{ formatDate(avoir.date_avoir) }}</div>
                  </div>
                  <div class="text-end">
                    <div class="text-success fw-bold">{{ formatCurrency(avoir.montant) }}</div>
                    <span class="badge bg-info">{{ avoir.type }}</span>
                  </div>
                </div>
              </div>
              <div class="mt-3 text-center">
                <small class="text-muted">Total disponible: {{ formatCurrency(totalAvoirs) }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Solde et factures -->
      <div class="col-md-8">
        <!-- Solde client -->
        <div class="card mb-4" :class="getSoldeCardClass(client.solde)">
          <div class="card-body text-center py-4">
            <h5 class="card-title mb-3">Situation financière</h5>
            <div class="display-4 fw-bold mb-2">
              {{ formatCurrency(client.solde || 0) }}
            </div>
            <div>
              <span :class="getSituationBadgeClass(client.solde)" class="badge fs-6">
                {{ getSituation(client.solde) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Factures du client -->
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Historique des factures</h5>
            <div class="btn-group">
              <button 
                class="btn btn-sm" 
                :class="invoiceFilter === 'all' ? 'btn-primary' : 'btn-outline-primary'"
                @click="invoiceFilter = 'all'"
              >
                Toutes
              </button>
              <button 
                class="btn btn-sm" 
                :class="invoiceFilter === 'pending' ? 'btn-warning' : 'btn-outline-warning'"
                @click="invoiceFilter = 'pending'"
              >
                En attente
              </button>
              <button 
                class="btn btn-sm" 
                :class="invoiceFilter === 'paid' ? 'btn-success' : 'btn-outline-success'"
                @click="invoiceFilter = 'paid'"
              >
                Payées
              </button>
            </div>
          </div>
          <div class="card-body">
            <div v-if="loadingInvoices" class="text-center py-3">
              <div class="spinner-border spinner-border-sm" role="status"></div>
            </div>
            <div v-else-if="filteredInvoices.length === 0" class="text-center py-4 text-muted">
              <i class="bi bi-receipt display-6 opacity-25"></i>
              <p class="mt-2">Aucune facture trouvée</p>
            </div>
            <div v-else class="list-group list-group-flush">
              <div 
                v-for="facture in filteredInvoices" 
                :key="facture.id" 
                class="list-group-item"
              >
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <div class="d-flex align-items-center">
                      <strong class="me-3">{{ facture.numero }}</strong>
                      <span :class="getStatusBadgeClass(facture.statut)" class="badge">
                        {{ facture.statut }}
                      </span>
                    </div>
                    <small class="text-muted">{{ formatDate(facture.date_facture) }}</small>
                  </div>
                  <div class="text-end">
                    <div class="fw-bold">{{ formatCurrency(facture.montant_ttc) }}</div>
                    <div v-if="facture.statut !== 'payée'" class="small">
                      <span class="text-success">Payé: {{ formatCurrency(facture.total_paye || 0) }}</span>
                      <br>
                      <span class="text-danger">Restant: {{ formatCurrency(facture.montant_ttc - (facture.total_paye || 0)) }}</span>
                    </div>
                  </div>
                </div>
                <div class="mt-2">
                  <router-link 
                    :to="`/factures/${facture.id}`" 
                    class="btn btn-sm btn-outline-primary me-2"
                  >
                    <i class="bi bi-eye"></i> Détails
                  </router-link>
                  <router-link 
                    v-if="facture.statut === 'validée' || facture.statut === 'partiellement_payée'"
                    :to="`/paiements/nouveau?factureId=${facture.id}`" 
                    class="btn btn-sm btn-outline-success"
                  >
                    <i class="bi bi-credit-card"></i> Payer
                  </router-link>
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
import { facturesService } from '@/services/facturesService';
import { avoirsService } from '@/services/avoirsService';
import { formatters, helpers } from '@/utils';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';

export default {
  name: 'ClientDetail',
  components: {
    LoadingSpinner
  },
  data() {
    return {
      loading: true,
      loadingInvoices: false,
      loadingAvoirs: false,
      client: {},
      invoices: [],
      avoirs: [],
      invoiceFilter: 'all'
    };
  },
  async mounted() {
    console.log('ClientDetail mounted');
    console.log('Route params:', this.$route.params);
    console.log('Route path:', this.$route.path);
    await this.loadData();
  },
  computed: {
    filteredInvoices() {
      if (this.invoiceFilter === 'all') return this.invoices;
      if (this.invoiceFilter === 'pending') {
        return this.invoices.filter(f => f.statut !== 'payée' && f.statut !== 'annulée');
      }
      return this.invoices.filter(f => f.statut === 'payée');
    },
    totalAvoirs() {
      return this.avoirs.reduce((total, a) => total + parseFloat(a.montant || 0), 0);
    }
  },
  methods: {
    async loadData() {
      try {
        console.log('Début du chargement des données pour client ID:', this.$route.params.id);
        await this.loadClient();
        
        // Charger factures et avoirs en parallèle
        if (this.client && this.client.id) {
          await Promise.all([
            this.loadInvoices(),
            this.loadAvoirs()
          ]);
        }
      } catch (error) {
        console.error('Erreur chargement données client:', error);
      }
    },
    
    async loadClient() {
      try {
        const clientId = this.$route.params.id;
        console.log('Chargement du client ID:', clientId);
        
        if (!clientId) {
          console.error('ID client manquant dans les paramètres de route');
          this.loading = false;
          return;
        }
        
        const response = await clientsService.getById(clientId);
        console.log('Réponse API client:', response);
        
        if (response && response.success && response.client) {
          this.client = response.client;
          console.log('Client chargé:', this.client);
        } else {
          console.error('Réponse API invalide:', response);
          this.client = {};
        }
      } catch (error) {
        console.error('Erreur chargement client:', error);
        console.error('Détails de l\'erreur:', error.response || error.message);
        this.client = {};
      } finally {
        this.loading = false;
      }
    },
    
    async loadInvoices() {
      try {
        this.loadingInvoices = true;
        const response = await facturesService.getAll();
        
        // Filtrer par client_id
        this.invoices = (response.factures || []).filter(f => f.client_id == this.$route.params.id);
        console.log(`Factures du client ${this.$route.params.id}:`, this.invoices.length);
        
      } catch (error) {
        console.error('Erreur chargement factures:', error);
        this.invoices = [];
      } finally {
        this.loadingInvoices = false;
      }
    },
    
    async loadAvoirs() {
      try {
        this.loadingAvoirs = true;
        const clientId = this.$route.params.id;
        const response = await avoirsService.getByClient(clientId);
        this.avoirs = response.avoirs || [];
        console.log(`Avoirs du client ${clientId}:`, this.avoirs.length);
      } catch (error) {
        console.error('Erreur chargement avoirs:', error);
        this.avoirs = [];
      } finally {
        this.loadingAvoirs = false;
      }
    },
    
    getSituation(solde) {
      if (solde > 0) return 'Débiteur';
      if (solde < 0) return 'Créancier';
      return 'À jour';
    },
    
    getSituationBadgeClass(solde) {
      if (solde > 0) return 'bg-danger';
      if (solde < 0) return 'bg-info';
      return 'bg-success';
    },
    
    getSoldeCardClass(solde) {
      if (solde > 0) return 'border-danger';
      if (solde < 0) return 'border-info';
      return 'border-success';
    },
    
    formatCurrency: formatters.currency,
    formatDate: formatters.date,
    getStatusBadgeClass: helpers.getStatusBadgeClass
  }
};
</script>