<template>
  <div v-if="showModal" class="modal fade" :id="modalId" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ title }}</h5>
          <button type="button" class="btn-close" @click="hide"></button>
        </div>
        <div class="modal-body">
          <p>{{ message }}</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="hide">Annuler</button>
          <button type="button" class="btn btn-danger" @click="confirm">Confirmer</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Modal } from 'bootstrap';

export default {
  name: 'ConfirmModal',
  props: {
    modalId: {
      type: String,
      default: 'confirmModal'
    },
    title: {
      type: String,
      default: 'Confirmation'
    },
    message: {
      type: String,
      default: 'Êtes-vous sûr de vouloir continuer ?'
    }
  },
  emits: ['confirm'],
  data() {
    return {
      showModal: false,
      modalInstance: null
    };
  },
  methods: {
    show() {
      this.showModal = true;
      this.$nextTick(() => {
        const modalElement = document.getElementById(this.modalId);
        if (modalElement) {
          this.modalInstance = new Modal(modalElement, {
            backdrop: 'static',
            keyboard: false
          });
          this.modalInstance.show();
          
          // Écouter l'événement de fermeture pour nettoyer
          modalElement.addEventListener('hidden.bs.modal', () => {
            this.showModal = false;
          });
        }
      });
    },
    
    hide() {
      if (this.modalInstance) {
        this.modalInstance.hide();
      }
    },
    
    confirm() {
      this.$emit('confirm');
      this.hide();
    }
  }
};
</script>