const db = require('../config/db');

class BalanceService {
  // Mettre à jour le solde après une facture
  static async updateAfterFacture(clientId, montantFacture) {
    const [result] = await db.execute(
      'UPDATE clients SET solde = solde + ? WHERE id = ?',
      [montantFacture, clientId]
    );
    console.log(`Facture: Client ${clientId} +${montantFacture}€ (augmente dette)`);
    return result.affectedRows > 0;
  }
  
  // Mettre à jour le solde après un paiement
  static async updateAfterPaiement(clientId, montantPaiement) {
    const [result] = await db.execute(
      'UPDATE clients SET solde = solde - ? WHERE id = ?',
      [montantPaiement, clientId]
    );
    console.log(`Paiement: Client ${clientId} -${montantPaiement}€ (diminue dette)`);
    return result.affectedRows > 0;
  }
  
  // Mettre à jour le solde après un avoir
  static async updateAfterAvoir(clientId, montantAvoir) {
    const [result] = await db.execute(
      'UPDATE clients SET solde = solde - ? WHERE id = ?',
      [montantAvoir, clientId]
    );
    console.log(`Avoir: Client ${clientId} -${montantAvoir}€ (crédite client)`);
    return result.affectedRows > 0;
  }
  
  // Récupérer le statut du solde
  static getSituation(solde) {
    const soldeNum = parseFloat(solde) || 0;
    if (soldeNum > 0) return 'débiteur';
    if (soldeNum < 0) return 'créditeur';
    return 'à jour';
  }
  
  // Formater le solde pour l'affichage
  static formatSolde(solde) {
    const soldeNum = parseFloat(solde) || 0;
    if (soldeNum > 0) return `Dette client: ${Math.abs(soldeNum).toFixed(2)} €`;
    if (soldeNum < 0) return `Crédit client: ${Math.abs(soldeNum).toFixed(2)} €`;
    return 'À jour';
  }
}

module.exports = BalanceService;