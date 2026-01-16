export const helpers = {
  getStatusBadgeClass(status) {
    const classes = {
      'brouillon': 'bg-secondary',
      'validée': 'bg-primary',
      'payée': 'bg-success',
      'partiellement_payée': 'bg-warning',
      'annulée': 'bg-danger',
      'demandé': 'bg-info',
      'validé': 'bg-primary',
      'réceptionné': 'bg-warning',
      'clôturé': 'bg-success',
      'rejeté': 'bg-danger',
      'généré': 'bg-info',
      'appliqué': 'bg-success',
      'annulé': 'bg-danger'
    };
    return classes[status] || 'bg-secondary';
  },
  
  getSituationClass(solde) {
    if (solde > 0) return 'text-danger fw-bold';
    if (solde < 0) return 'text-success fw-bold';
    return '';
  },
  
  getStockLevelClass(stock) {
    if (stock < 10) return 'text-danger';
    if (stock < 50) return 'text-warning';
    return 'text-success';
  },
  
  truncate(text, length = 50) {
    if (!text) return '';
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
  }
};