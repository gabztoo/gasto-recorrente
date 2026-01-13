// POST /api/create-billing
// Cria uma cobrança no AbacatePay e retorna a URL de pagamento

import type { IncomingMessage, ServerResponse } from 'http';

interface RequestBody {
  analysisId?: string;
}

export default async function handler(
  req: IncomingMessage & { body?: RequestBody; method?: string },
  res: ServerResponse & { 
    status: (code: number) => { json: (data: unknown) => void };
    json: (data: unknown) => void;
  }
) {
  // Apenas POST é permitido
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ABACATEPAY_API_KEY;
  
  if (!apiKey) {
    console.error('ABACATEPAY_API_KEY não configurada');
    return res.status(500).json({ error: 'Payment service not configured' });
  }

  try {
    const analysisId = req.body?.analysisId;
    
    // URL base do site (configurada na Vercel)
    const baseUrl = process.env.SITE_URL || 
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://gastorecorrente.shop');
    
    const response = await fetch('https://api.abacatepay.com/v1/billing/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        frequency: 'ONE_TIME',
        methods: ['PIX'],
        products: [{
          externalId: analysisId || 'analysis',
          name: 'Análise Completa de Assinaturas',
          description: 'Relatório detalhado de gastos recorrentes identificados no seu extrato',
          price: 500, // R$ 5,00 em centavos
          quantity: 1
        }],
        returnUrl: baseUrl,
        completionUrl: `${baseUrl}?payment_success=true&method=pix`,
        externalId: analysisId,
        metadata: {
          analysisId,
          source: 'gasto-recorrente'
        }
      })
    });

    const data = await response.json();
    
    if (data.error) {
      console.error('AbacatePay error:', data.error);
      return res.status(400).json({ error: data.error });
    }

    // Retorna a URL de pagamento
    return res.status(200).json({
      success: true,
      billingId: data.data?.id,
      paymentUrl: data.data?.url,
      amount: data.data?.amount,
      status: data.data?.status
    });

  } catch (error) {
    console.error('Error creating billing:', error);
    return res.status(500).json({ error: 'Failed to create billing' });
  }
}
