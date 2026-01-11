<template>
  <div class="retour-detail-page">
    <!-- En-tête -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="h3 mb-0">Retour {{ retour.reference || 'Chargement...' }}</h1>
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-0">
            <li class="breadcrumb-item">
              <router-link to="/retours">Retours</router-link>
            </li>
            <li class="breadcrumb-item active" aria-current="page">
              {{ retour.reference || 'Détails' }}
            </li>
          </ol>
        </nav>
      </div>
      <div class="btn-group">
        <router-link to="/retours" class="btn btn-outline-secondary">
          <i class="bi bi-arrow-left"></i> Retour
        </router-link>
        <button class="btn btn-outline-primary" @click="printPage">
          <i class="bi bi-printer"></i> Imprimer
        </button>
      </div>
    </div>

    <!-- Contenu -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
      <p class="mt-3">Chargement des détails du retour...</p>
    </div>

    <div v-else-if="!retour.id" class="text-center py-5 text-danger">
      <i class="bi bi-exclamation-triangle display-1"></i>
      <p class="mt-3">Retour non trouvé</p>
      <p class="small">ID: {{ retourId }}</p>
      <router-link to="/retours" class="btn btn-primary mt-3">
        Retour à la liste
      </router-link>
    </div>

    <div v-else class="row">
      <!-- Informations principales -->
      <div class="col-md-4">
        <div class="card mb-4">
          <div class="card-header">
            <h5 class="mb-0">Informations du retour</h5>
          </div>
          <div class="card-body">
            <table class="table table-sm">
              <tbody>
                <tr>
                  <td><strong>Référence:</strong></td>
                  <td>{{ retour.reference }}</td>
                </tr>
                <tr>
                  <td><strong>Statut:</strong></td>
                  <td>
                    <span :class="getStatutBadgeClass(retour.statut)" class="badge">
                      {{ retour.statut }}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td><strong>Date retour:</strong></td>
                  <td>{{ formatDate(retour.date_retour) }}</td>
                </tr>
                <tr>
                  <td><strong>Motif:</strong></td>
                  <td>{{ retour.motif }}</td>
                </tr>
                <tr v-if="retour.notes">
                  <td><strong>Notes:</strong></td>
                  <td>{{ retour.notes }}</td>
                </tr>
                <tr>
                  <td><strong>Créé le:</strong></td>
                  <td>{{ formatDateTime(retour.created_at) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Informations facture -->
        <div class="card mb-4">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Facture associée</h5>
            <router-link 
              v-if="retour.facture_id"
              :to="`/factures/${retour.facture_id}`" 
              class="btn btn-sm btn-outline-primary"
            >
              <i class="bi bi-eye"></i>
            </router-link>
          </div>
          <div class="card-body">
            <div v-if="retour.facture_numero">
              <h6>{{ retour.facture_numero }}</h6>
              <div class="text-muted small">
                {{ formatDate(retour.facture_date) }}
              </div>
            </div>
            <div v-else class="text-muted">
              Information non disponible
            </div>
          </div>
        </div>

        <!-- Informations client -->
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Client</h5>
          </div>
          <div class="card-body">
            <div v-if="retour.client_nom">
              <h6>{{ retour.client_nom }}</h6>
              <div class="text-muted small mb-2">
                {{ retour.client_email || 'Pas d\'email' }}
              </div>
              <div class="text-muted small">
                {{ retour.client_telephone || 'Pas de téléphone' }}
              </div>
            </div>
            <div v-else class="text-muted">
              Client non trouvé
            </div>
          </div>
        </div>
      </div>

      <!-- Produits et historique -->
      <div class="col-md-8">
        <!-- Produits retournés -->
        <div class="card mb-4">
          <div class="card-header">
            <h5 class="mb-0">Produits retournés ({{ retour.lignes?.length || 0 }})</h5>
          </div>
          <div class="card-body p-0">
            <div v-if="!retour.lignes || retour.lignes.length === 0" 
                 class="text-center py-4 text-muted">
              <i class="bi bi-box display-6 opacity-25"></i>
              <p class="mt-2">Aucun produit retourné</p>
            </div>
            <div v-else class="table-responsive">
              <table class="table table-hover mb-0">
                <thead class="table-light">
                  <tr>
                    <th>Produit</th>
                    <th class="text-center">Quantité originale</th>
                    <th class="text-center">Quantité retournée</th>
                    <th>Raison</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="ligne in retour.lignes" :key="ligne.id">
                    <td>
                      <div>
                        <strong>{{ ligne.produit_nom }}</strong>
                        <div class="text-muted small">{{ ligne.produit_reference }}</div>
                      </div>
                    </td>
                    <td class="text-center">{{ ligne.quantite_originale || 'N/A' }}</td>
                    <td class="text-center">
                      <strong>{{ ligne.quantite_retournee }}</strong>
                    </td>
                    <td>{{ ligne.raison || '-' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Actions disponibles -->
        <div class="card" v-if="retour.statut !== 'clôturé' && retour.statut !== 'rejeté'">
          <div class="card-header">
            <h5 class="mb-0">Actions disponibles</h5>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-6" v-if="retour.statut === 'demandé'">
                <button class="btn btn-success w-100 mb-2" @click="validerRetour">
                  <i class="bi bi-check-lg"></i> Valider le retour (SAV)
                </button>
                <button class="btn btn-danger w-100" @click="rejeterRetour">
                  <i class="bi bi-x-circle"></i> Rejeter le retour
                </button>
              </div>
              
              <div class="col-md-6" v-if="retour.statut === 'validé'">
                <button class="btn btn-warning w-100 mb-2" @click="receptionnerRetour">
                  <i class="bi bi-box-arrow-in-down"></i> Réceptionner les produits
                </button>
              </div>
              
              <div class="col-md-6" v-if="retour.statut === 'réceptionné'">
                <button class="btn btn-info w-100" @click="creerAvoir">
                  <i class="bi bi-credit-card-2-front"></i> Créer un avoir
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Historique -->
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Historique du processus</h5>
          </div>
          <div class="card-body">
            <div class="timeline">
              <div class="timeline-item" :class="{ active: true }">
                <div class="timeline-marker bg-primary"></div>
                <div class="timeline-content">
                  <h6>Demande créée</h6>
                  <small class="text-muted">{{ formatDateTime(retour.created_at) }}</small>
                  <p>Retour initié par le client</p>
                </div>
              </div>
              
              <div class="timeline-item" :class="{ active: retour.statut !== 'demandé' }">
                <div class="timeline-marker" :class="getTimelineClass('validé')"></div>
                <div class="timeline-content">
                  <h6>Validation SAV</h6>
                  <small class="text-muted" v-if="retour.statut !== 'demandé'">
                    {{ formatDateTime(retour.date_validation) }}
                  </small>
                  <p v-if="retour.statut === 'demandé'">En attente de validation</p>
                  <p v-else>Validé par le service après-vente</p>
                </div>
              </div>
              
              <div class="timeline-item" :class="{ active: ['réceptionné', 'clôturé'].includes(retour.statut) }">
                <div class="timeline-marker" :class="getTimelineClass('réceptionné')"></div>
                <div class="timeline-content">
                  <h6>Réception produits</h6>
                  <small class="text-muted" v-if="['réceptionné', 'clôturé'].includes(retour.statut)">
                    {{ formatDateTime(retour.date_reception) }}
                  </small>
                  <p v-if="retour.statut === 'validé'">En attente de réception</p>
                  <p v-else-if="retour.statut === 'réceptionné'">Produits réceptionnés</p>
                  <p v-else>Stock mis à jour</p>
                </div>
              </div>
              
              <div class="timeline-item" :class="{ active: retour.statut === 'clôturé' }">
                <div class="timeline-marker" :class="getTimelineClass('clôturé')"></div>
                <div class="timeline-content">
                  <h6>Clôture</h6>
                  <small class="text-muted" v-if="retour.statut === 'clôturé'">
                    {{ formatDateTime(retour.date_cloture) }}
                  </small>
                  <p v-if="retour.statut === 'clôturé'">Avoir créé et processus terminé</p>
                  <p v-else>En attente de clôture</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { retoursService } from '@/services/retoursService';
import Swal from 'sweetalert2';

export default {
  name: 'RetourDetail',
  data() {
    return {
      loading: true,
      retour: {},
      retourId: null
    };
  },
  async mounted() {
    // Récupérer l'ID depuis l'URL
    this.retourId = this.$route.params.id;
    
    if (!this.retourId) {
      console.error('Pas d\'ID dans l\'URL');
      this.$router.push('/retours');
      return;
    }
    
    await this.loadRetour();
  },
  methods: {
    async loadRetour() {
      try {
        this.loading = true;
        console.log('Chargement retour ID:', this.retourId);
        
        const response = await retoursService.getById(this.retourId);
        console.log('Réponse API retour:', response);
        
        if (response.success && response.retour) {
          this.retour = response.retour;
          console.log('Retour chargé:', this.retour);
        } else {
          throw new Error(response.error || 'Retour non trouvé');
        }
        
      } catch (error) {
        console.error('Erreur chargement retour:', error);
        
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: `Impossible de charger le retour #${this.retourId}`,
          footer: error.response?.data?.error || error.message
        });
        
        this.$router.push('/retours');
        
      } finally {
        this.loading = false;
      }
    },
    
    getStatutBadgeClass(statut) {
      const classes = {
        'demandé': 'bg-info',
        'validé': 'bg-primary',
        'réceptionné': 'bg-warning',
        'clôturé': 'bg-success',
        'rejeté': 'bg-danger'
      };
      return classes[statut] || 'bg-secondary';
    },
    
    getTimelineClass(etape) {
      if (this.retour.statut === etape) return 'bg-success';
      if (this.retour.statut === 'rejeté' && etape === 'validé') return 'bg-danger';
      return 'bg-light';
    },
    
    formatDate(value) {
      if (!value) return '';
      return new Date(value).toLocaleDateString('fr-FR');
    },
    
    formatDateTime(value) {
      if (!value) return '';
      return new Date(value).toLocaleString('fr-FR');
    },
    
    async validerRetour() {
      const result = await Swal.fire({
        title: 'Valider ce retour ?',
        text: 'Le retour sera validé par le SAV.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Valider',
        cancelButtonText: 'Annuler'
      });
      
      if (result.isConfirmed) {
        try {
          await retoursService.validate(this.retourId);
          await this.loadRetour();
          Swal.fire('Validé !', 'Le retour a été validé', 'success');
        } catch (error) {
          Swal.fire('Erreur', 'Impossible de valider', 'error');
        }
      }
    },
    
    async receptionnerRetour() {
      const result = await Swal.fire({
        title: 'Réceptionner les produits ?',
        text: 'Les produits seront marqués comme réceptionnés.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Réceptionner',
        cancelButtonText: 'Annuler'
      });
      
      if (result.isConfirmed) {
        try {
          await retoursService.receive(this.retourId);
          await this.loadRetour();
          Swal.fire('Réceptionné !', 'Les produits ont été réceptionnés', 'success');
        } catch (error) {
          Swal.fire('Erreur', 'Impossible de réceptionner', 'error');
        }
      }
    },
    
async creerAvoir() {
  const result = await Swal.fire({
    title: 'Type d\'avoir',
    input: 'select',
    inputOptions: {
      'avoir_client': 'Avoir client (crédit en compte)',
      'remboursement': 'Remboursement (argent rendu)',
      'échange': 'Échange (nouveau produit envoyé)'
    },
    inputPlaceholder: 'Sélectionner le type',
    showCancelButton: true,
    confirmButtonText: 'Continuer',
    cancelButtonText: 'Annuler'
  });
  
  if (result.isConfirmed && result.value) {
    const typeAvoir = result.value;
    
    // Pour un échange, pas besoin de montant
    if (typeAvoir === 'échange') {
      try {
        const avoirData = {
          client_id: this.retour.client_id,
          montant: 0,
          type: typeAvoir
        };
        
        await retoursService.createAvoir(this.retourId, avoirData);
        
        Swal.fire({
          icon: 'success',
          title: 'Échange initié !',
          html: `
            <p>Le processus d'échange a été initié.</p>
            <p><strong>Type:</strong> Échange produit</p>
            <p><strong>Actions:</strong></p>
            <ul class="text-start">
              <li>Préparer le nouveau produit</li>
              <li>Organiser l'envoi</li>
              <li>Mettre à jour les stocks</li>
            </ul>
          `,
          timer: 4000,
          showConfirmButton: false
        });
        
        await this.loadRetour();
        return;
        
      } catch (error) {
        console.error('Erreur création échange:', error);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: error.response?.data?.error || 'Impossible de créer l\'échange'
        });
        return;
      }
    }
    
    // Pour avoir_client ou remboursement, calculer le montant suggéré
    let montantSuggere = 100;
    if (this.retour.lignes && this.retour.lignes.length > 0) {
      // Calculer le montant total des lignes retournées
      montantSuggere = this.retour.lignes.reduce((total, ligne) => {
        return total + (ligne.prix_unitaire * ligne.quantite_retournee);
      }, 0);
    }
    
    const { value: montant } = await Swal.fire({
      title: 'Montant de l\'avoir',
      html: `
        <p>Montant suggéré basé sur le retour: <strong>${this.formatCurrency(montantSuggere)}</strong></p>
        <p>Vous pouvez ajuster ce montant si nécessaire.</p>
      `,
      input: 'number',
      inputLabel: 'Montant (TND)',
      inputValue: montantSuggere,
      showCancelButton: true,
      confirmButtonText: 'Créer',
      cancelButtonText: 'Annuler',
      inputValidator: (value) => {
        if (!value || value <= 0) {
          return 'Le montant doit être supérieur à 0';
        }
      }
    });
    
    if (montant) {
      try {
        const avoirData = {
          client_id: this.retour.client_id,
          montant: parseFloat(montant),
          type: typeAvoir
        };
        
        const response = await retoursService.createAvoir(this.retourId, avoirData);
        
        Swal.fire({
          icon: 'success',
          title: typeAvoir === 'avoir_client' ? 'Avoir créé !' : 'Remboursement initié !',
          html: `
            <p>${typeAvoir === 'avoir_client' ? 'L\'avoir client a été créé avec succès.' : 'Le processus de remboursement a été initié.'}</p>
            <p><strong>Type:</strong> ${typeAvoir}</p>
            <p><strong>Montant:</strong> ${this.formatCurrency(montant)}</p>
            ${response.avoir?.numero ? `<p><strong>Référence:</strong> ${response.avoir.numero}</p>` : ''}
          `,
          timer: 3000,
          showConfirmButton: false
        });
        
        await this.loadRetour();
        
      } catch (error) {
        console.error('Erreur création avoir:', error);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: error.response?.data?.error || 'Impossible de créer l\'avoir'
        });
      }
    }
  }
},
    
    async rejeterRetour() {
      const result = await Swal.fire({
        title: 'Rejeter ce retour ?',
        html: `
          <p>Le retour sera rejeté.</p>
          <div class="mb-3">
            <label class="form-label">Raison du rejet</label>
            <select id="raisonRejet" class="form-select">
              <option value="hors_delai">Hors délai</option>
              <option value="produit_utilise">Produit utilisé</option>
              <option value="emballage_manquant">Emballage manquant</option>
              <option value="autre">Autre</option>
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label">Commentaire</label>
            <textarea id="commentaireRejet" class="form-control" rows="3"></textarea>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Rejeter',
        cancelButtonText: 'Annuler'
      });
      
      if (result.isConfirmed) {
        // À implémenter : méthode de rejet
        Swal.fire('Info', 'Fonctionnalité à implémenter', 'info');
      }
    },
    
    printPage() {
      window.print();
    }
  }
};
</script>

<style scoped>
.retour-detail-page {
  padding: 20px 0;
}

.timeline {
  position: relative;
  padding-left: 30px;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 15px;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: #e9ecef;
}

.timeline-item {
  position: relative;
  margin-bottom: 30px;
}

.timeline-marker {
  position: absolute;
  left: -30px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid #fff;
}

.timeline-content {
  padding-left: 20px;
}

.timeline-item.active .timeline-marker {
  border-width: 4px;
}
</style>