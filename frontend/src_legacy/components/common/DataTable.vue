<template>
  <div class="data-table-component">
    <!-- En-tête avec recherche -->
    <div class="d-flex justify-content-between align-items-center mb-3" v-if="showSearch || showActions">
      <div v-if="showSearch" class="w-50">
        <SearchBar 
          :placeholder="searchPlaceholder"
          @search="handleSearch"
        />
      </div>
      <div v-if="showActions" class="btn-group">
        <slot name="actions"></slot>
      </div>
    </div>

    <!-- Tableau -->
    <div class="table-responsive">
      <table class="table table-hover align-middle">
        <thead class="table-light">
          <tr>
            <th v-if="selectable" style="width: 40px;">
              <input 
                type="checkbox" 
                class="form-check-input" 
                :checked="allSelected"
                @change="toggleSelectAll"
              />
            </th>
            <th v-for="column in columns" :key="column.key" :style="column.style">
              <div class="d-flex align-items-center">
                <span>{{ column.label }}</span>
                <button 
                  v-if="column.sortable"
                  class="btn btn-link btn-sm p-0 ms-1"
                  @click="sortBy(column.key)"
                >
                  <i class="bi" :class="sortIcon(column.key)"></i>
                </button>
              </div>
            </th>
            <th v-if="showActionsColumn" class="text-end" style="width: 120px;">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in paginatedData" :key="item.id || index">
            <td v-if="selectable">
              <input 
                type="checkbox" 
                class="form-check-input" 
                :checked="isSelected(item)"
                @change="toggleSelect(item)"
              />
            </td>
            <td v-for="column in columns" :key="column.key">
              <slot :name="`cell-${column.key}`" :item="item" :value="item[column.key]">
                <template v-if="column.formatter">
                  {{ column.formatter(item[column.key], item) }}
                </template>
                <template v-else>
                  {{ item[column.key] }}
                </template>
              </slot>
            </td>
            <td v-if="showActionsColumn" class="text-end">
              <slot name="row-actions" :item="item">
                <div class="btn-group btn-group-sm">
                  <button 
                    class="btn btn-outline-primary"
                    @click="$emit('view', item)"
                    title="Voir"
                  >
                    <i class="bi bi-eye"></i>
                  </button>
                  <button 
                    class="btn btn-outline-secondary"
                    @click="$emit('edit', item)"
                    title="Modifier"
                  >
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button 
                    class="btn btn-outline-danger"
                    @click="$emit('delete', item)"
                    title="Supprimer"
                  >
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Message vide -->
    <div v-if="filteredData.length === 0" class="text-center py-5 text-muted">
      <i class="bi bi-table display-1"></i>
      <p class="mt-3">{{ emptyMessage }}</p>
    </div>

    <!-- Pagination -->
    <Pagination 
      v-if="showPagination"
      :current-page="currentPage"
      :total-pages="totalPages"
      :total-items="filteredData.length"
      :items-per-page="itemsPerPage"
      @page-change="handlePageChange"
    />
  </div>
</template>

<script>
import SearchBar from './SearchBar.vue';
import Pagination from './Pagination.vue';

export default {
  name: 'DataTable',
  components: {
    SearchBar,
    Pagination
  },
  props: {
    data: {
      type: Array,
      default: () => []
    },
    columns: {
      type: Array,
      default: () => []
    },
    selectable: {
      type: Boolean,
      default: false
    },
    showSearch: {
      type: Boolean,
      default: true
    },
    showPagination: {
      type: Boolean,
      default: true
    },
    showActions: {
      type: Boolean,
      default: false
    },
    showActionsColumn: {
      type: Boolean,
      default: true
    },
    itemsPerPage: {
      type: Number,
      default: 10
    },
    searchPlaceholder: {
      type: String,
      default: 'Rechercher...'
    },
    emptyMessage: {
      type: String,
      default: 'Aucune donnée disponible'
    }
  },
  data() {
    return {
      currentPage: 1,
      searchQuery: '',
      sortField: '',
      sortDirection: 'asc',
      selectedItems: []
    };
  },
  computed: {
    filteredData() {
      let filtered = [...this.data];
      
      // Recherche
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(item => {
          return this.columns.some(column => {
            const value = item[column.key];
            return value && value.toString().toLowerCase().includes(query);
          });
        });
      }
      
      // Tri
      if (this.sortField) {
        filtered.sort((a, b) => {
          let aValue = a[this.sortField];
          let bValue = b[this.sortField];
          
          if (typeof aValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
          }
          
          if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
          if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
          return 0;
        });
      }
      
      return filtered;
    },
    
    totalPages() {
      return Math.ceil(this.filteredData.length / this.itemsPerPage);
    },
    
    paginatedData() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredData.slice(start, end);
    },
    
    allSelected() {
      return this.paginatedData.length > 0 && 
             this.paginatedData.every(item => this.isSelected(item));
    }
  },
  methods: {
    handleSearch(query) {
      this.searchQuery = query;
      this.currentPage = 1;
    },
    
    sortBy(field) {
      if (this.sortField === field) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortField = field;
        this.sortDirection = 'asc';
      }
    },
    
    sortIcon(field) {
      if (this.sortField !== field) {
        return 'bi-arrow-down-up';
      }
      return this.sortDirection === 'asc' ? 'bi-arrow-up' : 'bi-arrow-down';
    },
    
    handlePageChange(page) {
      this.currentPage = page;
    },
    
    toggleSelectAll() {
      if (this.allSelected) {
        this.selectedItems = this.selectedItems.filter(
          selected => !this.paginatedData.some(item => this.itemsEqual(item, selected))
        );
      } else {
        this.paginatedData.forEach(item => {
          if (!this.isSelected(item)) {
            this.selectedItems.push(item);
          }
        });
      }
      this.$emit('selection-change', this.selectedItems);
    },
    
    toggleSelect(item) {
      const index = this.selectedItems.findIndex(selected => this.itemsEqual(selected, item));
      if (index === -1) {
        this.selectedItems.push(item);
      } else {
        this.selectedItems.splice(index, 1);
      }
      this.$emit('selection-change', this.selectedItems);
    },
    
    isSelected(item) {
      return this.selectedItems.some(selected => this.itemsEqual(selected, item));
    },
    
    itemsEqual(a, b) {
      return a.id === b.id;
    }
  },
  emits: ['search', 'sort', 'page-change', 'selection-change', 'view', 'edit', 'delete']
};
</script>

<style scoped>
.data-table-component {
  margin-bottom: 2rem;
}

.table th {
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  color: #6c757d;
  border-bottom: 2px solid #dee2e6;
}

.table td {
  vertical-align: middle;
  padding: 0.75rem;
}

.btn-link {
  text-decoration: none;
}
</style>