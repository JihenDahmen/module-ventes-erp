export const MODES_PAIEMENT = [
  { value: 'espèces', label: 'Espèces' },
  { value: 'carte', label: 'Carte bancaire' },
  { value: 'virement', label: 'Virement' },
  { value: 'chèque', label: 'Chèque' },
  { value: 'avoir', label: 'Avoir' }
];

export const MOTIFS_RETOUR = [
  { value: 'défectueux', label: 'Produit défectueux' },
  { value: 'non_conforme', label: 'Produit non conforme' },
  { value: 'erreur_commande', label: 'Erreur de commande' },
  { value: 'autre', label: 'Autre motif' }
];

export const TYPES_AVOIR = [
  { value: 'avoir_client', label: 'Avoir client' },
  { value: 'remboursement', label: 'Remboursement' },
  { value: 'échange', label: 'Échange' }
];

export const STATUTS_FACTURE = [
  { value: 'brouillon', label: 'Brouillon' },
  { value: 'validée', label: 'Validée' },
  { value: 'payée', label: 'Payée' },
  { value: 'partiellement_payée', label: 'Partiellement payée' },
  { value: 'annulée', label: 'Annulée' }
];