<script setup>
import { RouterLink } from 'vue-router';
</script>

<template>
  <div class="erp-layout">
    <aside class="sidebar">
      <div class="logo">
        <h2>ERP Core</h2>
      </div>
      <nav>
        <RouterLink to="/quotes" class="nav-item" active-class="active">Quotes (Devis)</RouterLink>
        <RouterLink to="/orders" class="nav-item" active-class="active">Orders (Commandes)</RouterLink>
        <RouterLink to="/deliveries" class="nav-item" active-class="active">Deliveries (Livraisons)</RouterLink>
        
        <RouterLink to="/deliveries" class="nav-item" active-class="active">Deliveries (Livraisons)</RouterLink>
        
        <div class="separator"></div>

        <!-- Integrated Module -->
        <RouterLink to="/reporting" class="nav-item" active-class="active">Sales Reporting</RouterLink>
      </nav>
    </aside>

    <div class="main-content">
      <header class="header">
        <h3>ERP Yasmine Management</h3>
      </header>
      <main class="page-content">
        <slot></slot>
      </main>
    </div>
  </div>
</template>

<style scoped>
.erp-layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  background-color: #242424;
  color: #fff;
}

.sidebar {
  width: 250px;
  background-color: #1a1a1a;
  border-right: 1px solid #333;
  padding: 1rem;
  display: flex;
  flex-direction: column;
}

.logo { margin-bottom: 2rem; }

.nav-item {
  display: block;
  padding: 0.75rem 1rem;
  color: #aaa;
  text-decoration: none;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  transition: all 0.2s;
}

.nav-item:hover { background-color: #333; color: #fff; }
.nav-item.active { background-color: #42b883; color: #fff; }
.nav-item.external { color: #5dade2; margin-top: auto; }

.separator { height: 1px; background: #333; margin: 1rem 0; }

.main-content { flex: 1; display: flex; flex-direction: column; }
.header { height: 64px; border-bottom: 1px solid #333; padding: 0 2rem; display: flex; align-items: center; }
.page-content { padding: 2rem; flex: 1; overflow-y: auto; }
</style>
