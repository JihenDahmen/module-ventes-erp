<script setup>
</script>

<template>
  <div class="erp-layout">
    <div class="main-content">
      <header class="header">
        <h3>ERP Management</h3>
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

.main-content { flex: 1; display: flex; flex-direction: column; }
.header { height: 64px; border-bottom: 1px solid #333; padding: 0 2rem; display: flex; align-items: center; }
.page-content { padding: 2rem; flex: 1; overflow-y: auto; }
</style>
