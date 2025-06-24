// api/vies.js
import axios from 'axios';

export default async function handler(req, res) {
  const { country, vat } = req.query;

  if (!country || !vat) {
    return res.status(400).json({ error: 'Paramètres manquants: country et vat requis' });
  }

  const xmlBody = `<?xml version="1.0" encoding="UTF-8"?>
    <soap:Envelope
      xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
      xmlns:tns="urn:ec.europa.eu:taxud:vies:services:checkVat:types">
      <soap:Body>
        <tns:checkVat>
          <tns:countryCode>${country}</tns:countryCode>
          <tns:vatNumber>${vat}</tns:vatNumber>
        </tns:checkVat>
      </soap:Body>
    </soap:Envelope>`;

  try {
    const { data } = await axios.post(
      'https://ec.europa.eu/taxation_customs/vies/services/checkVatService',
      xmlBody,
      {
        headers: {
          'Content-Type': 'text/xml;charset=UTF-8',
          'SOAPAction': '',
        },
        timeout: 10000,
      }
    );

    res.status(200).json({ raw: data }); // tu peux parser si besoin
  } catch (error) {
    console.error('Erreur SOAP Axios :', error.message);
    res.status(500).json({ error: 'Erreur lors de la requête SOAP avec Axios' });
  }
}
