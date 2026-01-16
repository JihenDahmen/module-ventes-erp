<script setup>
import { ref, onMounted } from 'vue';
import ErpLayout from '../layouts/ErpLayout.vue';
import api from '../services/api';

const quotes = ref([]);
const loading = ref(true);

onMounted(async () => {
    try {
        const res = await api.get('/quotes');
        quotes.value = res.data;
    } catch (e) {
        console.error("Failed to fetch quotes", e);
    } finally {
        loading.value = false;
    }
});

const createQuote = async () => {
    // Placeholder for creating quote
    alert("Create Quote feature to be implemented with form.");
};
</script>

<template>
  <ErpLayout>
    <div class="page-header">
      <h1>Quotes (Devis)</h1>
      <button @click="createQuote" class="btn primary">New Quote</button>
    </div>

    <div v-if="loading">Loading quotes...</div>
    
    <table v-else class="data-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Client ID</th>
          <th>Total</th>
          <th>Status</th>
          <th>Date</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="quote in quotes" :key="quote.id">
          <td>#{{ quote.id }}</td>
          <td>{{ quote.client_id }}</td>
          <td>{{ quote.total }} DT</td>
          <td><span class="badge" :class="quote.status">{{ quote.status }}</span></td>
          <td>{{ new Date(quote.created_at).toLocaleDateString() }}</td>
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
.btn.primary { background-color: #42b883; color: white; }
.btn.small { padding: 0.25rem 0.5rem; font-size: 0.8rem; background: #333; color: white; }

.data-table { width: 100%; border-collapse: collapse; }
.data-table th, .data-table td { text-align: left; padding: 1rem; border-bottom: 1px solid #333; color: #eee; }
.data-table th { color: #888; }

.badge { padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.8rem; background: #555; }
.badge.en_attente { background: #e67e22; }
.badge.valide { background: #27ae60; }
</style>
