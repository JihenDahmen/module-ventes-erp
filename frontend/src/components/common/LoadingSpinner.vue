<template>
  <div class="loading-spinner text-center py-5">
    <div class="spinner-border" :class="spinnerClass" role="status">
      <span class="visually-hidden">Chargement...</span>
    </div>
    <p class="mt-3" :class="textClass" v-if="message">{{ message }}</p>
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'LoadingSpinner',
  props: {
    message: {
      type: String,
      default: 'Chargement en cours...'
    },
    size: {
      type: String,
      default: 'medium',
      validator: value => ['small', 'medium', 'large'].includes(value)
    },
    type: {
      type: String,
      default: 'primary',
      validator: value => ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'].includes(value)
    }
  },
  computed: {
    spinnerClass() {
      const sizeClass = {
        small: 'spinner-border-sm',
        medium: '',
        large: 'spinner-border-lg'
      }[this.size];
      
      return `text-${this.type} ${sizeClass}`;
    },
    textClass() {
      return `text-${this.type}`;
    }
  }
};
</script>

<style scoped>
.loading-spinner {
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>