class NotificationService {
  // Notifier la comptabilité d'un paiement
  async notifierComptabilitePaiement(paiementData) {
    console.log(`[NOTIFICATION COMPTABILITÉ] Paiement ${paiementData.reference} reçu`);
    console.log(`Client: ${paiementData.client_nom}, Montant: ${paiementData.montant}€`);
    // Ici, vous intégrerez votre système de notification (email, webhook, etc.)
    return { success: true, message: 'Comptabilité notifiée' };
  }

  // Envoyer un reçu au client
  async envoyerRecuClient(clientEmail, paiementData) {
    console.log(`[REÇU CLIENT] Envoyé à ${clientEmail}`);
    console.log(`Référence paiement: ${paiementData.reference}`);
    // Ici, vous générerez et enverrez le reçu par email
    return { success: true, message: 'Reçu envoyé au client' };
  }

  // Notifier un échec d'association
  async notifierEchecAssociation(paiementData, errorMessage) {
    console.error(`[ALERTE] Échec d'association paiement-facture`);
    console.error(`Données: ${JSON.stringify(paiementData)}`);
    console.error(`Erreur: ${errorMessage}`);
    // Ici, vous notifierez l'équipe support
    return { success: true, message: 'Alerte envoyée' };
  }
}

module.exports = new NotificationService();