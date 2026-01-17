<template>
  <div class="avoir-form-page">
    <div class="text-center py-5">
      <i class="bi bi-credit-card-2-front display-1 text-muted"></i>
      <h3 class="mt-3">Les avoirs sont créés automatiquement</h3>
      <p class="text-muted">
        Les avoirs sont générés automatiquement lors du traitement des retours.
      </p>
      <router-link to="/retours" class="btn btn-primary mt-3">
        <i class="bi bi-arrow-return-left"></i> Voir les retours
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AvoirForm'
};
</script>