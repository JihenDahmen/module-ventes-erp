<template>
  <div class="client-form-page">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="h3">{{ isEditing ? 'Modifier le client' : 'Nouveau client' }}</h1>
      <router-link to="/clients" class="btn btn-outline-secondary">
        <i class="bi bi-arrow-left"></i> Retour
      </router-link>
    </div>

    <div class="card">
      <div class="card-body">
        <form @submit.prevent="submitForm">
          <div class="row">
            <!-- Informations principales -->
            <div class="col-md-6">
              <div class="mb-3">
                <label for="nom" class="form-label">Nom *</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="nom" 
                  v-model="form.nom"
                  required
                  placeholder="Nom complet ou raison sociale"
                />
              </div>
              
              <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input 
                  type="email" 
                  class="form-control" 
                  id="email" 
                  v-model="form.email"
                  placeholder="email@exemple.com"
                />
              </div>
            </div>
            
            <div class="col-md-6">
              <div class="mb-3">
                <label for="telephone" class="form-label">Téléphone</label>
                <input 
                  type="tel" 
                  class="form-control" 
                  id="telephone" 
                  v-model="form.telephone"
                  placeholder="01 23 45 67 89"
                />
              </div>
              
              <div class="mb-3">
                <label for="adresse" class="form-label">Adresse</label>
                <textarea 
                  class="form-control" 
                  id="adresse" 
                  v-model="form.adresse"
                  rows="2"
                  placeholder="Adresse complète"
                ></textarea>
              </div>
            </div>
          </div>
          
          <div class="row mt-4">
            <div class="col-md-12">
              <div class="d-flex justify-content-between">
                <button 
                  type="button" 
                  class="btn btn-outline-secondary" 
                  @click="$router.push('/clients')"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  class="btn btn-primary"
                  :disabled="submitting"
                >
                  <span v-if="submitting">
                    <span class="spinner-border spinner-border-sm me-2"></span>
                    Enregistrement...
                  </span>
                  <span v-else>
                    <i class="bi bi-check-circle me-2"></i>
                    {{ isEditing ? 'Mettre à jour' : 'Créer le client' }}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { clientsService } from '@/services/clientsService';
import Swal from 'sweetalert2';

export default {
  name: 'ClientForm',
  data() {
    return {
      isEditing: false,
      submitting: false,
      form: {
        nom: '',
        email: '',
        telephone: '',
        adresse: ''
      }
    };
  },
  async created() {
    console.log('ClientForm created, route params:', this.$route.params);
    console.log('Route path:', this.$route.path);
    
    // Vérifier si on est en mode édition
    if (this.$route.params.id) {
      this.isEditing = true;
      await this.loadClient();
    } else if (this.$route.path.includes('/editer')) {
      // Essayer d'extraire l'ID de l'URL
      const pathParts = this.$route.path.split('/');
      const idIndex = pathParts.indexOf('editer') - 1;
      if (idIndex > 0) {
        const clientId = pathParts[idIndex];
        console.log('ID extrait de l\'URL:', clientId);
        this.$route.params.id = clientId;
        this.isEditing = true;
        await this.loadClient();
      }
    }
  },
  methods: {
    async loadClient() {
      try {
        const clientId = this.$route.params.id;
        console.log('Chargement du client ID:', clientId);
        
        if (!clientId) {
          throw new Error('ID client manquant');
        }
        
        const response = await clientsService.getById(clientId);
        console.log('Données client reçues:', response);
        
        this.form = {
          nom: response.client?.nom || '',
          email: response.client?.email || '',
          telephone: response.client?.telephone || '',
          adresse: response.client?.adresse || ''
        };
        
      } catch (error) {
        console.error('Erreur chargement client:', error);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Impossible de charger le client pour modification',
          footer: error.message
        });
        this.$router.push('/clients');
      }
    },
    
    async submitForm() {
      this.submitting = true;
      
      try {
        if (this.isEditing) {
          const clientId = this.$route.params.id;
          await clientsService.update(clientId, this.form);
          Swal.fire({
            icon: 'success',
            title: 'Mis à jour !',
            text: 'Le client a été mis à jour avec succès.',
            timer: 2000,
            showConfirmButton: false
          });
        } else {
          await clientsService.create(this.form);
          Swal.fire({
            icon: 'success',
            title: 'Créé !',
            text: 'Le client a été créé avec succès.',
            timer: 2000,
            showConfirmButton: false
          });
        }
        
        this.$router.push('/clients');
      } catch (error) {
        console.error('Erreur enregistrement client:', error);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: error.response?.data?.error || 'Erreur lors de l\'enregistrement'
        });
      } finally {
        this.submitting = false;
      }
    }
  }
};
</script>