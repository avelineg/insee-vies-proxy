// Fichier: api/vies.js

export default async function handler(req, res) {
  const { country, vat } = req.query;

  if (!country || !vat) {
    return res.status(400).json({ error: 'Paramètres manquants: country et vat requis' });
  }

  try {
    // Correction de l’URL : suppression de la redondance du code pays dans le numéro de TVA
    const apiUrl = `https://ec.europa.eu/taxation_customs/vies/rest-api/ms/${country}/vatnumber/${vat}`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Erreur de l’API VIES' });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur: ' + error.message });
  }
}
