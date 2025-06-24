import soap from 'soap';

export default async function handler(req, res) {
  const { country, vat } = req.query;

  if (!country || !vat) {
    return res.status(400).json({ error: 'Paramètres manquants: country et vat requis' });
  }

  const wsdlUrl = 'https://ec.europa.eu/taxation_customs/vies/checkVatService.wsdl';

  try {
    const client = await soap.createClientAsync(wsdlUrl);

    const [result] = await client.checkVatAsync({
      countryCode: country,
      vatNumber: vat
    });

    res.status(200).json(result);
  } catch (error) {
    console.error('Erreur SOAP :', error);
    res.status(500).json({ error: "Erreur lors de la vérification TVA" });
  }
}
