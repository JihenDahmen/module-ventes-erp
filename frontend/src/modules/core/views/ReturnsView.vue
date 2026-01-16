<script setup>
import { ref, onMounted } from 'vue';
import ErpLayout from '../layouts/ErpLayout.vue';
import api from '../services/api';

const returns = ref([]);
const loading = ref(true);

onMounted(async () => {
    try {
        const res = await api.get('/retours');
        returns.value = res.data.retours || [];
    } catch (e) {
        console.error("Failed to fetch returns", e);
    } finally {
        loading.value = false;
    }
});
</script>

<template>
  <ErpLayout>
    <div class="page-header">
      <h1>Returns (Retours)</h1>
    </div>

    <div v-if="loading">Loading returns...</div>
    
    <table v-else class="data-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Reference</th>
          <th>Invoice Ref</th>
          <th>Motif</th>
          <th>Status</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="ret in returns" :key="ret.id">
          <td>#{{ ret.id }}</td>
          <td>{{ ret.reference }}</td>
          <td>{{ ret.facture_numero }}</td>
          <td>{{ ret.motif }}</td>
          <td><span class="badge" :class="ret.statut">{{ ret.statut }}</span></td>
          <td>{{ new Date(ret.date_retour).toLocaleDateString() }}</td>
        </tr>
      </tbody>
    </table>
  </ErpLayout>
</template>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }

.data-table { width: 100%; border-collapse: collapse; }
.data-table th, .data-table td { text-align: left; padding: 1rem; border-bottom: 1px solid #333; color: #eee; }

.badge { padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.8rem; background: #555; }
.badge.valide { background: #27ae60; }
.badge.en_attente { background: #e67e22; }
</style>
