<script setup>
import Sidebar from '../components/Sidebar.vue';
import Header from '../components/Header.vue';
</script>

<template>
  <div class="dashboard-layout">
    <Sidebar />
    <div class="main-content">
      <Header />
      <main class="page-content">
        <slot></slot>
      </main>
    </div>
  </div>
</template>

<style scoped>
.dashboard-layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.page-content {
  padding: 2rem;
  overflow-y: auto;
  flex: 1;
}
</style>
