<script setup>
import { ref, onMounted } from 'vue';
import ErpLayout from '../layouts/ErpLayout.vue';
import api from '../services/api';

const invoices = ref([]);
const loading = ref(true);

onMounted(async () => {
    try {
        const res = await api.get('/factures');
        invoices.value = res.data.factures || [];
    } catch (e) {
        console.error("Failed to fetch invoices", e);
    } finally {
        loading.value = false;
    }
});
</script>

<template>
  <ErpLayout>
    <div class="page-header">
      <h1>Invoices (Factures)</h1>
    </div>

    <div v-if="loading">Loading invoices...</div>
    
    <table v-else class="data-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Reference</th>
          <th>Client</th>
          <th>Total TTC</th>
          <th>Status</th>
          <th>Date</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="invoice in invoices" :key="invoice.id">
          <td>#{{ invoice.id }}</td>
          <td>{{ invoice.numero }}</td>
          <td>{{ invoice.client_nom }}</td>
          <td>{{ invoice.montant_ttc }} DT</td>
          <td><span class="badge" :class="invoice.statut">{{ invoice.statut }}</span></td>
          <td>{{ new Date(invoice.date_facture).toLocaleDateString() }}</td>
          <td>
             <button class="btn small">View</button>
          </td>
        </tr>
      </tbody>
    </table>
  </ErpLayout>
</template>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }

.btn { padding: 0.5rem 1rem; border: none; border-radius: 4px; cursor: pointer; }
.btn.small { padding: 0.25rem 0.5rem; font-size: 0.8rem; background: #333; color: white; }

.data-table { width: 100%; border-collapse: collapse; }
.data-table th, .data-table td { text-align: left; padding: 1rem; border-bottom: 1px solid #333; color: #eee; }

.badge { padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.8rem; background: #555; }
.badge.payee { background: #27ae60; }
.badge.brouillon { background: #7f8c8d; }
.badge.validee { background: #2980b9; }
</style>
