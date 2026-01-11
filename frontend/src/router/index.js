import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue')
  },
  {
    path: '/clients',
    name: 'Clients',
    component: () => import('@/views/Clients/ListClients.vue')
  },
  {
    path: '/clients/nouveau',
    name: 'NewClient',
    component: () => import('@/views/Clients/ClientForm.vue')
  },
  {
    path: '/clients/:id',
    name: 'ClientDetail',
    component: () => import('@/views/Clients/ClientDetail.vue')
  },
   {
    path: '/clients/:id/editer',
    name: 'EditClient',
    component: () => import('@/views/Clients/ClientForm.vue'),
    props: true  // IMPORTANT: Passe les paramètres de route comme props
  },
  {
    path: '/factures',
    name: 'Factures',
    component: () => import('@/views/Factures/ListFactures.vue')
  },
  {
    path: '/factures/nouvelle',
    name: 'NewFacture',
    component: () => import('@/views/Factures/FactureForm.vue')
  },
 {
  path: '/factures/:id',
  name: 'FactureDetail',
  component: () => import('@/views/Factures/FactureDetail.vue'),
  props: true  // ⭐️ TRÈS IMPORTANT : passe les params comme props
},
  {
    path: '/paiements',
    name: 'Paiements',
    component: () => import('@/views/Paiements/ListPaiements.vue')
  },
  {
    path: '/paiements/nouveau',
    name: 'NewPaiement',
    component: () => import('@/views/Paiements/PaiementForm.vue')
  },
  {
    path: '/produits',
    name: 'Produits',
    component: () => import('@/views/Produits/ListProduits.vue')
  },
  {
    path: '/produits/nouveau',
    name: 'NewProduit',
    component: () => import('@/views/Produits/ProduitForm.vue')
  },
   {
    path: '/produits/:id/editer',
    name: 'EditProduit',
    component: () => import('@/views/Produits/ProduitForm.vue'),
    props: true  // Important : passe l'id comme prop
  },
  {
    path: '/retours',
    name: 'Retours',
    component: () => import('@/views/Retours/ListRetours.vue')
  },
  {
    path: '/retours/nouveau',
    name: 'NewRetour',
    component: () => import('@/views/Retours/RetourForm.vue')
  },
  {
    path: '/avoirs',
    name: 'Avoirs',
    component: () => import('@/views/Avoirs/ListAvoirs.vue')
  },
  {
  path: '/retours/:id',
  name: 'RetourDetail',
  component: () => import('@/views/Retours/RetourDetail.vue')
}
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;