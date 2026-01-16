// src/utils/index.js
export * from './constants.js';
export * from './formatters.js';
export * from './helpers.js';

// Exportations nommées
export { MODES_PAIEMENT, MOTIFS_RETOUR, TYPES_AVOIR, STATUTS_FACTURE } from './constants.js';
export { formatters } from './formatters.js';
export { helpers } from './helpers.js';

// Exportation par défaut (optionnel)
export default {
  ...require('./constants.js'),
  ...require('./formatters.js'),
  ...require('./helpers.js')
};