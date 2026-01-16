<script setup>
import { ref, onMounted } from 'vue';
import ErpLayout from '../layouts/ErpLayout.vue';
import api from '../services/api';

const payments = ref([]);
const loading = ref(true);

onMounted(async () => {
    try {
        const res = await api.get('/paiements');
        payments.value = res.data.paiements || [];
    } catch (e) {
        console.error("Failed to fetch payments", e);
    } finally {
        loading.value = false;
    }
});
</script>

<template>
  <ErpLayout>
    <div class="page-header">
      <h1>Payments (Paiements)</h1>
    </div>

    <div v-if="loading">Loading payments...</div>
    
    <table v-else class="data-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Reference</th>
          <th>Invoice Ref</th>
          <th>Amount</th>
          <th>Mode</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="payment in payments" :key="payment.id">
          <td>#{{ payment.id }}</td>
          <td>{{ payment.reference }}</td>
          <td>{{ payment.facture_numero }}</td>
          <td>{{ payment.montant }} DT</td>
          <td>{{ payment.mode_paiement }}</td>
          <td>{{ new Date(payment.date_paiement).toLocaleDateString() }}</td>
        </tr>
      </tbody>
    </table>
  </ErpLayout>
</template>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }

.data-table { width: 100%; border-collapse: collapse; }
.data-table th, .data-table td { text-align: left; padding: 1rem; border-bottom: 1px solid #333; color: #eee; }
</style>
