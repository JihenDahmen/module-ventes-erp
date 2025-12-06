<script setup>
import { RouterLink } from 'vue-router';
</script>

<template>
  <aside class="sidebar">
    <div class="logo">
      <h2>ERP Sales</h2>
    </div>
    <nav>
      <RouterLink to="/" class="nav-item" active-class="active">Dashboard</RouterLink>
      <RouterLink to="/reports" class="nav-item" active-class="active">Reports</RouterLink>
      <RouterLink to="/settings" class="nav-item" active-class="active">Settings</RouterLink>
      
      <div class="separator"></div>
      
      <a href="http://localhost:5174" class="nav-item external">
        Go to ERP Core ⬈
      </a>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 250px;
  background-color: #1a1a1a;
  border-right: 1px solid #333;
  display: flex;
  flex-direction: column;
  padding: 1rem;
}

.logo {
  margin-bottom: 2rem;
  color: #fff;
}

.nav-item {
  display: block;
  padding: 0.75rem 1rem;
  color: #aaa;
  text-decoration: none;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  transition: all 0.2s;
}

.nav-item:hover {
  background-color: #333;
  color: #fff;
}

.nav-item.active {
  background-color: #42b883;
  color: #fff;
}

.nav-item.external {
  color: #5dade2;
  margin-top: auto;
}

.separator {
  height: 1px;
  background: #333;
  margin: 1rem 0;
}
</style>
