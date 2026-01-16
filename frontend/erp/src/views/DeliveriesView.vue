<script setup>
import { ref, onMounted } from 'vue';
import ErpLayout from '../layouts/ErpLayout.vue';
import api from '../services/api';

const deliveries = ref([]);
const loading = ref(true);

onMounted(async () => {
    try {
        const res = await api.get('/deliveries');
        deliveries.value = res.data;
    } catch (e) {
        console.error("Failed to fetch deliveries", e);
    } finally {
        loading.value = false;
    }
});
</script>

<template>
  <ErpLayout>
    <div class="page-header">
      <h1>Deliveries (Livraisons)</h1>
    </div>

    <div v-if="loading">Loading deliveries...</div>
    
    <table v-else class="data-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Order ID</th>
          <th>Client ID</th>
          <th>Status</th>
          <th>Date</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="delivery in deliveries" :key="delivery.id">
          <td>#{{ delivery.id }}</td>
          <td>#{{ delivery.order_id }}</td>
          <td>{{ delivery.client_id }}</td>
          <td><span class="badge" :class="delivery.status">{{ delivery.status }}</span></td>
          <td>{{ new Date(delivery.created_at).toLocaleDateString() }}</td>
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
.badge.prepared { background: #f1c40f; color: #333; }
.badge.shipped { background: #3498db; }
.badge.delivered { background: #27ae60; }
</style>
