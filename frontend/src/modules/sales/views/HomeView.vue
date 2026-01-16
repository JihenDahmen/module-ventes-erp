<script setup>
import { ref, onMounted } from 'vue';
import DashboardLayout from '../layouts/DashboardLayout.vue';
import api from '../services/api';

// State
const loading = ref(true);
const error = ref(null);

const metrics = ref({
  totalRevenue: null,
  salesByProduct: [],
  salesByClient: [],
  salesByRegion: [],
  conversionRate: null,
  pendingPayments: [],
  margins: null,
  returns: null
});

onMounted(async () => {
  try {
    const results = await Promise.all([
      api.get('/report/total-revenue'),
      api.get('/report/sales-by-product'),
      api.get('/report/sales-by-client'),
      api.get('/report/sales-by-region'),
      api.get('/report/conversion-rate'),
      api.get('/report/pending-payments'),
      api.get('/report/margins'),
      api.get('/report/returns')
    ]);

    metrics.value = {
      totalRevenue: results[0].data,
      salesByProduct: results[1].data,
      salesByClient: results[2].data,
      salesByRegion: results[3].data,
      conversionRate: results[4].data,
      pendingPayments: results[5].data,
      margins: results[6].data,
      returns: results[7].data
    };
  } catch (err) {
    console.error(err);
    error.value = "Failed to load dashboard data";
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <DashboardLayout>
    <h1>Sales Overview</h1>

    <div v-if="loading" class="loading">Loading dashboard...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    
    <div v-else class="dashboard-grid">
      <!-- KPI Cards -->
      <section class="kpi-section">
        <div class="card kpi">
          <h3>Total Revenue</h3>
          <div class="value">{{ metrics.totalRevenue?.totalRevenue || 0 }} DT</div>
        </div>
        <div class="card kpi">
          <h3>Conversion Rate</h3>
          <div class="value">{{ metrics.conversionRate?.conversionRate || '0%' }}</div>
          <div class="subtitle">
            Devis: {{ metrics.conversionRate?.totalDevis }} → Commandes: {{ metrics.conversionRate?.totalCommandes }}
          </div>
        </div>
        <div class="card kpi">
          <h3>Net Margin</h3>
          <div class="value" :class="{ negative: metrics.margins?.netMargin < 0 }">
            {{ metrics.margins?.netMargin }} DT
          </div>
          <div class="subtitle">Rate: {{ metrics.margins?.marginRate }}</div>
        </div>
        <div class="card kpi">
          <h3>Returns</h3>
          <div class="value">{{ metrics.returns?.totalReturnedValue }} DT</div>
          <div class="subtitle">Items: {{ metrics.returns?.returnedItemsCount }}</div>
        </div>
      </section>

      <!-- Tables Section -->
      <section class="details-section">
        <!-- Products -->
        <div class="card">
          <h3>Top Products</h3>
          <table>
            <thead><tr><th>Product</th><th>Count</th><th>Revenue</th></tr></thead>
            <tbody>
              <tr v-for="item in metrics.salesByProduct" :key="item.produit">
                <td>{{ item.produit }}</td>
                <td>{{ item.count }}</td>
                <td>{{ item.revenue }} DT</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Regions -->
        <div class="card">
          <h3>Sales by Region</h3>
          <table>
            <thead><tr><th>Region</th><th>Count</th><th>Revenue</th></tr></thead>
            <tbody>
              <tr v-for="item in metrics.salesByRegion" :key="item.region">
                <td>{{ item.region }}</td>
                <td>{{ item.count }}</td>
                <td>{{ item.revenue }} DT</td>
              </tr>
            </tbody>
          </table>
        </div>
        
         <!-- Clients -->
        <div class="card">
          <h3>Top Clients</h3>
          <table>
            <thead><tr><th>Client</th><th>Count</th><th>Revenue</th></tr></thead>
            <tbody>
              <tr v-for="item in metrics.salesByClient" :key="item.client">
                <td>{{ item.client }}</td>
                <td>{{ item.count }}</td>
                <td>{{ item.revenue }} DT</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Pending Payments -->
      <section class="full-width-section">
        <div class="card">
          <h3>Pending Payments</h3>
          <table>
            <thead><tr><th>ID</th><th>Client ID</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              <tr v-for="payment in metrics.pendingPayments" :key="payment.id">
                <td>#{{ payment.id }}</td>
                <td>{{ payment.client_id }}</td>
                <td>{{ payment.total }} DT</td>
                <td><span class="badge">{{ payment.status }}</span></td>
                <td>{{ new Date(payment.date).toLocaleDateString() }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </DashboardLayout>
</template>

<style scoped>
.dashboard-grid {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.kpi-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.details-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.card {
  background-color: #1a1a1a;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #333;
}

.kpi h3 { color: #aaa; margin: 0 0 0.5rem 0; font-size: 0.9rem; }
.kpi .value { font-size: 2rem; font-weight: bold; color: #42b883; }
.kpi .value.negative { color: #ff4444; }
.kpi .subtitle { font-size: 0.8rem; color: #666; margin-top: 0.25rem; }

table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
th, td { text-align: left; padding: 0.75rem 0; border-bottom: 1px solid #333; }
th { color: #888; font-weight: normal; font-size: 0.9rem; }
td { color: #eee; }

.badge {
  background: #333;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  color: #fb8c00;
}

.loading, .error { padding: 2rem; text-align: center; font-size: 1.2rem; }
.error { color: #ff4444; }
</style>
