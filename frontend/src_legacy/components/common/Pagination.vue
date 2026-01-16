<template>
  <div class="pagination-component">
    <nav v-if="totalPages > 1" aria-label="Navigation des pages">
      <div class="d-flex justify-content-between align-items-center">
        <!-- Informations -->
        <div class="text-muted small">
          Affichage de <strong>{{ startItem }}-{{ endItem }}</strong> sur <strong>{{ totalItems }}</strong> éléments
        </div>
        
        <!-- Pagination -->
        <ul class="pagination mb-0">
          <!-- Premier -->
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <button class="page-link" @click="goToPage(1)" :disabled="currentPage === 1">
              <i class="bi bi-chevron-double-left"></i>
            </button>
          </li>
          
          <!-- Précédent -->
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <button class="page-link" @click="goToPage(currentPage - 1)" :disabled="currentPage === 1">
              <i class="bi bi-chevron-left"></i>
            </button>
          </li>
          
          <!-- Pages -->
          <li 
            v-for="page in visiblePages" 
            :key="page" 
            class="page-item" 
            :class="{ active: page === currentPage }"
          >
            <button class="page-link" @click="goToPage(page)">
              {{ page }}
            </button>
          </li>
          
          <!-- Prochain -->
          <li class="page-item" :class="{ disabled: currentPage === totalPages }">
            <button class="page-link" @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages">
              <i class="bi bi-chevron-right"></i>
            </button>
          </li>
          
          <!-- Dernier -->
          <li class="page-item" :class="{ disabled: currentPage === totalPages }">
            <button class="page-link" @click="goToPage(totalPages)" :disabled="currentPage === totalPages">
              <i class="bi bi-chevron-double-right"></i>
            </button>
          </li>
        </ul>
        
        <!-- Sélection par page -->
        <div class="d-flex align-items-center ms-3">
          <span class="me-2 small text-muted">Par page:</span>
          <select class="form-select form-select-sm" style="width: auto;" v-model="localItemsPerPage" @change="updateItemsPerPage">
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>
    </nav>
  </div>
</template>

<script>
export default {
  name: 'Pagination',
  props: {
    currentPage: {
      type: Number,
      required: true
    },
    totalPages: {
      type: Number,
      required: true
    },
    totalItems: {
      type: Number,
      required: true
    },
    itemsPerPage: {
      type: Number,
      default: 10
    },
    maxVisiblePages: {
      type: Number,
      default: 5
    }
  },
  emits: ['page-change', 'items-per-page-change'],
  data() {
    return {
      localItemsPerPage: this.itemsPerPage
    };
  },
  computed: {
    startItem() {
      return (this.currentPage - 1) * this.localItemsPerPage + 1;
    },
    endItem() {
      const end = this.currentPage * this.localItemsPerPage;
      return Math.min(end, this.totalItems);
    },
    visiblePages() {
      const pages = [];
      let start = Math.max(1, this.currentPage - Math.floor(this.maxVisiblePages / 2));
      let end = Math.min(this.totalPages, start + this.maxVisiblePages - 1);
      
      // Ajuster le début si on est près de la fin
      if (end - start + 1 < this.maxVisiblePages) {
        start = Math.max(1, end - this.maxVisiblePages + 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      return pages;
    }
  },
  methods: {
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
        this.$emit('page-change', page);
      }
    },
    updateItemsPerPage() {
      this.$emit('items-per-page-change', parseInt(this.localItemsPerPage));
    }
  }
};
</script>

<style scoped>
.pagination-component .page-link {
  cursor: pointer;
  min-width: 40px;
  text-align: center;
}

.pagination-component .page-item.active .page-link {
  background-color: #4361ee;
  border-color: #4361ee;
}

.pagination-component .form-select-sm {
  width: 80px;
}
</style>