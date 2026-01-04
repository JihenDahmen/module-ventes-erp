<template>
  <div class="search-bar-component">
    <div class="input-group">
      <span class="input-group-text">
        <i class="bi bi-search"></i>
      </span>
      <input
        type="text"
        class="form-control"
        :placeholder="placeholder"
        :value="modelValue"
        @input="handleInput"
        @keyup.enter="handleSearch"
      />
      <button 
        v-if="showClear && modelValue"
        class="btn btn-outline-secondary"
        type="button"
        @click="clearSearch"
      >
        <i class="bi bi-x"></i>
      </button>
      <button 
        v-if="showButton"
        class="btn btn-primary"
        type="button"
        @click="handleSearch"
      >
        {{ buttonText }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SearchBar',
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: 'Rechercher...'
    },
    debounce: {
      type: Number,
      default: 300
    },
    showClear: {
      type: Boolean,
      default: true
    },
    showButton: {
      type: Boolean,
      default: false
    },
    buttonText: {
      type: String,
      default: 'Rechercher'
    }
  },
  emits: ['update:modelValue', 'search'],
  data() {
    return {
      timeoutId: null
    };
  },
  methods: {
    handleInput(event) {
      const value = event.target.value;
      this.$emit('update:modelValue', value);
      
      // Debounce pour éviter trop d'appels
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
      }
      
      this.timeoutId = setTimeout(() => {
        this.$emit('search', value);
      }, this.debounce);
    },
    
    handleSearch() {
      this.$emit('search', this.modelValue);
    },
    
    clearSearch() {
      this.$emit('update:modelValue', '');
      this.$emit('search', '');
    }
  }
};
</script>

<style scoped>
.search-bar-component .input-group {
  max-width: 400px;
}
</style>