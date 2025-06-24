import axios from 'axios';

export default async function handler(req, res) {
  const { country, vat } = req.query;

  if (!country || !vat) {
    return res.status(400).json({ error: 'Paramètres manquants: country et vat requis' });
  }

  // Corps XML SOAP à envoyer (format spécifique au service VIES)
  const soapBody = `
    <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:ec.europa.eu:taxud:vies:services:checkVat:types">
      <soap:Header/>
      <soap:Body>
        <urn:checkVat>
          <urn:countryCode>${country}</urn:countryCode>
          <urn:vatNumber>${vat}</urn:vatNumber>
        </urn:checkVat>
      </soap:Body>
    </soap:Envelope>
  `;

  try {
    const response = await axios.post(
      'https://ec.europa.eu/taxation_customs/vies/services/checkVatService',
      soapBody,
      {
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': ''
        },
        timeout: 5000
      }
    );

    // Parse le XML réponse pour récupérer les données (simple parsing regex ici)
    const xml = response.data;

    // Extraction simple des valeurs avec regex (tu peux remplacer par un vrai parseur XML si tu veux)
    const validMatch = xml.match(/<valid>(true|false)<\/valid>/);
    const nameMatch = xml.match(/<name>([^<]*)<\/name>/);
    const addressMatch = xml.match(/<address>([^<]*)<\/address>/);

    const valid = validMatch ? validMatch[1] === 'true' : false;
    const name = nameMatch ? nameMatch[1].trim() : null;
    const address = addressMatch ? addressMatch[1].trim().replace(/\n/g, ', ') : null;

    res.status(200).json({ valid, name, address });
  } catch (error) {
    console.error('Erreur requête SOAP axios :', error.message);
    res.status(500).json({ error: 'Erreur lors de la vérification TVA' });
  }
}
