<script setup>
</script>

<template>
  <div class="landing-container">
    <div class="glass-panel p-5 text-center hero-content">
      <h1 class="display-4 mb-3 heading-gradient">ERP & Sales System</h1>
      <p class="fs-5 text-muted mb-5">Select a module to continue operation</p>
      
      <div class="d-flex justify-content-center gap-4 flex-wrap">
        <router-link to="/quotes" class="btn-primary-custom text-decoration-none">
          <i class="bi bi-box-seam me-2"></i>Access ERP Core
        </router-link>
        <router-link to="/sales" class="btn-primary-custom text-decoration-none" style="filter: hue-rotate(40deg);">
           <i class="bi bi-graph-up me-2"></i>Access Sales Reporting
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.landing-container {
    height: 80vh;
    display: flex;
    align-items: center;
    justify-content: center;
}
.hero-content {
    max-width: 800px;
    width: 100%;
}
.text-muted {
    color: var(--text-secondary) !important;
}
</style>
