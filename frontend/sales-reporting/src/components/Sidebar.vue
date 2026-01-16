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
  width: 260px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--glass-border);
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
}

.logo {
  margin-bottom: 3rem;
  padding-left: 0.5rem;
}

.logo h2 {
  font-size: 1.5rem;
  background: linear-gradient(to right, #fff, var(--accent-secondary));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 0.875rem 1rem;
  color: var(--text-secondary);
  text-decoration: none;
  border-radius: var(--radius-md);
  margin-bottom: 0.5rem;
  transition: all var(--transition-medium);
  font-weight: 500;
  border: 1px solid transparent;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.03);
  color: var(--text-primary);
  transform: translateX(4px);
}

.nav-item.active {
  background: linear-gradient(90deg, rgba(99, 102, 241, 0.15) 0%, transparent 100%);
  border-left: 3px solid var(--accent-primary);
  color: var(--text-primary);
  border-radius: 4px var(--radius-md) var(--radius-md) 4px; /* flat left edge */
}

.nav-item.external {
  color: var(--accent-secondary);
  margin-top: auto;
  background: rgba(99, 102, 241, 0.05);
  border: 1px solid rgba(99, 102, 241, 0.2);
  justify-content: center;
}

.nav-item.external:hover {
  background: var(--accent-primary);
  color: white;
  box-shadow: 0 4px 12px var(--accent-glow);
  transform: translateY(-2px);
}

.separator {
  height: 1px;
  background: linear-gradient(to right, transparent, var(--glass-border), transparent);
  margin: 1.5rem 0;
}
</style>
