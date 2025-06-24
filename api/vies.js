// Fichier: api/vies.js

import axios from 'axios';
import { parseStringPromise } from 'xml2js';

export default async function handler(req, res) {
  const { country, vat } = req.query;

  if (!country || !vat) {
    return res.status(400).json({ error: 'Paramètres manquants: country et vat requis' });
  }

  const body = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:ec.europa.eu:taxud:vies:services:checkVat:types">
      <soapenv:Header/>
      <soapenv:Body>
        <urn:checkVat>
          <urn:countryCode>${country}</urn:countryCode>
          <urn:vatNumber>${vat}</urn:vatNumber>
        </urn:checkVat>
      </soapenv:Body>
    </soapenv:Envelope>
  `;

  try {
    const response = await axios.post(
      'https://ec.europa.eu/taxation_customs/vies/services/checkVatService',
      body,
      {
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': ''
        }
      }
    );

    const result = await parseStringPromise(response.data, { explicitArray: false });
    const checkVatResponse = result['soap:Envelope']['soap:Body']['checkVatResponse'];

    res.status(200).json(checkVatResponse);
  } catch (error) {
    console.error('Erreur SOAP manuelle :', error);
    res.status(500).json({ error: "Erreur lors de la vérification TVA" });
  }
}
