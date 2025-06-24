// api/vies.js
import axios from 'axios';

export default async function handler(req, res) {
  const { country, vat } = req.query;

  if (!country || !vat) {
    return res.status(400).json({ error: 'Paramètres manquants: country et vat requis' });
  }

  const xml = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:ec.europa.eu:taxud:vies:services:checkVat:types">
      <soapenv:Header/>
      <soapenv:Body>
        <urn:checkVat>
          <urn:countryCode>${country}</urn:countryCode>
          <urn:vatNumber>${vat}</urn:vatNumber>
        </urn:checkVat>
      </soapenv:Body>
    </soapenv:Envelope>`;

  try {
    const response = await axios.post(
      'https://ec.europa.eu/taxation_customs/vies/services/checkVatService',
      xml,
      {
        headers: {
          'Content-Type': 'text/xml;charset=UTF-8',
          'SOAPAction': ''
        }
      }
    );

    const result = response.data;
    res.status(200).send(result); // ou parsage XML -> JSON si tu veux
  } catch (error) {
    console.error('Erreur SOAP :', error.message);
    res.status(500).json({ error: 'Erreur lors de la vérification TVA' });
  }
}
