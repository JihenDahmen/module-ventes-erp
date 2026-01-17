export const formatters = {
  currency(value) {
    if (value === null || value === undefined) return '0,00 TND';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'TND'
    }).format(value);
  },
  
  date(value) {
    if (!value) return '';
    return new Date(value).toLocaleDateString('fr-FR');
  },
  
  datetime(value) {
    if (!value) return '';
    return new Date(value).toLocaleString('fr-FR');
  },
  
  percentage(value) {
    if (value === null || value === undefined) return '0 %';
    return `${parseFloat(value).toFixed(2)} %`;
  },
  
  capitalize(text) {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }
};