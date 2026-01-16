<template>
  <div class="modal fade" :id="modalId" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header" :class="headerClass">
          <h5 class="modal-title">
            <i :class="iconClass" class="me-2"></i>
            {{ title }}
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <p>{{ message }}</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn" :class="buttonClass" data-bs-dismiss="modal">OK</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AlertModal',
  props: {
    modalId: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: 'info',
      validator: value => ['info', 'success', 'warning', 'error'].includes(value)
    },
    title: {
      type: String,
      default: 'Information'
    },
    message: {
      type: String,
      default: ''
    }
  },
  computed: {
    headerClass() {
      const classes = {
        info: 'bg-info text-white',
        success: 'bg-success text-white',
        warning: 'bg-warning text-white',
        error: 'bg-danger text-white'
      };
      return classes[this.type] || 'bg-info text-white';
    },
    iconClass() {
      const classes = {
        info: 'bi bi-info-circle',
        success: 'bi bi-check-circle',
        warning: 'bi bi-exclamation-triangle',
        error: 'bi bi-x-circle'
      };
      return classes[this.type] || 'bi bi-info-circle';
    },
    buttonClass() {
      const classes = {
        info: 'btn-info',
        success: 'btn-success',
        warning: 'btn-warning',
        error: 'btn-danger'
      };
      return classes[this.type] || 'btn-info';
    }
  },
  methods: {
    show() {
      const modal = new window.bootstrap.Modal(document.getElementById(this.modalId));
      modal.show();
    },
    hide() {
      const modal = window.bootstrap.Modal.getInstance(document.getElementById(this.modalId));
      if (modal) modal.hide();
    }
  }
};
</script>