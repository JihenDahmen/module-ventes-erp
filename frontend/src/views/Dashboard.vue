<template>
  <div class="dashboard">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="h3">Dashboard</h1>
      <span class="text-muted">{{ currentDate }}</span>
    </div>

    <!-- Statistiques rapides -->
    <div class="row mb-4">
      <div class="col-md-3">
        <div class="card bg-primary text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="card-title mb-0">Clients</h6>
                <h2 class="mt-2">{{ stats.clients?.total || 0 }}</h2>
              </div>
              <i class="bi bi-people display-6 opacity-50"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-success text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="card-title mb-0">CA Total</h6>
                <h2 class="mt-2">{{ formatCurrency(stats.factures?.total_montant || 0) }}</h2>
              </div>
              <i class="bi bi-cash-stack display-6 opacity-50"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-warning text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="card-title mb-0">Paiements</h6>
                <h2 class="mt-2">{{ stats.paiements?.total || 0 }}</h2>
              </div>
              <i class="bi bi-credit-card display-6 opacity-50"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-info text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="card-title mb-0">Stock</h6>
                <h2 class="mt-2">{{ stats.produits?.total_stock || 0 }}</h2>
              </div>
              <i class="bi bi-box-seam display-6 opacity-50"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <!-- Dernières factures -->
      <div class="col-md-6">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Dernières factures</h5>
            <router-link to="/factures" class="btn btn-sm btn-outline-primary">
              Voir tout
            </router-link>
          </div>
          <div class="card-body">
            <div v-if="loading" class="text-center py-3">
              <div class="spinner-border spinner-border-sm" role="status"></div>
            </div>
            <div v-else-if="recent.factures?.length === 0" class="text-center py-3 text-muted">
              Aucune facture récente
            </div>
            <div v-else class="list-group list-group-flush">
              <div v-for="facture in recent.factures" :key="facture.numero" class="list-group-item">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{{ facture.numero }}</strong>
                    <div class="text-muted small">{{ facture.client_nom }}</div>
                  </div>
                  <div class="text-end">
                    <span class="badge" :class="getStatusBadgeClass(facture.statut)">
                      {{ facture.statut }}
                    </span>
                    <div class="mt-1">{{ formatCurrency(facture.montant_ttc) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Derniers paiements -->
      <div class="col-md-6">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Derniers paiements</h5>
            <router-link to="/paiements" class="btn btn-sm btn-outline-primary">
              Voir tout
            </router-link>
          </div>
          <div class="card-body">
            <div v-if="loading" class="text-center py-3">
              <div class="spinner-border spinner-border-sm" role="status"></div>
            </div>
            <div v-else-if="recent.paiements?.length === 0" class="text-center py-3 text-muted">
              Aucun paiement récent
            </div>
            <div v-else class="list-group list-group-flush">
              <div v-for="paiement in recent.paiements" :key="paiement.reference" class="list-group-item">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{{ paiement.facture_numero }}</strong>
                    <div class="text-muted small">{{ paiement.mode_paiement }}</div>
                  </div>
                  <div class="text-end">
                    <div class="text-success">{{ formatCurrency(paiement.montant) }}</div>
                    <div class="text-muted small">{{ formatDate(paiement.created_at) }}</div>
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
import { dashboardService } from '@/services/dashboardService';
import { formatters, helpers } from '@/utils';

export default {
  name: 'Dashboard',
  data() {
    return {
      loading: true,
      stats: {},
      recent: {},
      currentDate: new Date().toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    };
  },
  async mounted() {
    await this.loadDashboard();
  },
  methods: {
    async loadDashboard() {
      try {
        this.loading = true;
        const data = await dashboardService.getStats();
        this.stats = data.stats || {};
        this.recent = data.recent || {};
      } catch (error) {
        console.error('Erreur chargement dashboard:', error);
        // Données mock pour développement
        this.stats = {
          clients: { total: 45 },
          factures: { total_montant: 125000 },
          paiements: { total: 89 },
          produits: { total_stock: 1250 }
        };
        this.recent = {
          factures: [
            { numero: 'FACT-2024-0125', client_nom: 'Entreprise ABC', montant_ttc: 1500, statut: 'validée' },
            { numero: 'FACT-2024-0124', client_nom: 'SARL XYZ', montant_ttc: 2500, statut: 'payée' }
          ],
          paiements: [
            { reference: 'PAY-123456', facture_numero: 'FACT-2024-0124', mode_paiement: 'virement', montant: 2500, created_at: new Date().toISOString() }
          ]
        };
      } finally {
        this.loading = false;
      }
    },
    formatCurrency: formatters.currency,
    formatDate: formatters.date,
    getStatusBadgeClass: helpers.getStatusBadgeClass
  }
};
</script>