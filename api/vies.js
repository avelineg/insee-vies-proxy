// Fichier: api/vies.js

import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';

export default async function handler(req, res) {
  const { country, vat } = req.query;

  if (!country || !vat) {
    return res.status(400).json({ error: 'Paramètres manquants: country et vat requis' });
  }

  const soapEnvelope = `
    <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
                   xmlns:tns="urn:ec.europa.eu:taxud:vies:services:checkVat:types">
      <soap:Body>
        <tns:checkVat>
          <tns:countryCode>${country}</tns:countryCode>
          <tns:vatNumber>${vat}</tns:vatNumber>
        </tns:checkVat>
      </soap:Body>
    </soap:Envelope>
  `;

  try {
    const { data } = await axios.post(
      'https://ec.europa.eu/taxation_customs/vies/services/checkVatService',
      soapEnvelope,
      {
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': ''
        },
        timeout: 10000
      }
    );

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
    });

    const json = parser.parse(data);

    const result =
      json['soap:Envelope']?.['soap:Body']?.['checkVatResponse'] ??
      json['soap:Envelope']?.['soap:Body']?.['ns2:checkVatResponse'];

    if (!result) {
      throw new Error('Réponse invalide du service VIES');
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Erreur VIES :', error.message);
    res.status(500).json({ error: 'Erreur lors de la vérification TVA' });
  }
}
