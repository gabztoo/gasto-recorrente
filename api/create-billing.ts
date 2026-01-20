// POST /api/create-billing
// Cria uma cobrança no AbacatePay e retorna a URL de pagamento
// PROTEGIDO: CSRF + Rate Limiting + CORS

import type { IncomingMessage, ServerResponse } from 'http';
import { rateLimitService, getClientIP } from '../services/rateLimitService';
import { validateCSRFToken } from '../services/csrfService';
import { rateLimitService, getClientIP } from '../services/rateLimitService';
import { validateCSRFToken } from '../services/csrfService';

interface RequestBody {
  analysisId?: string;
}

const WOOVI_API_KEY = process.env.WOOVI_API_KEY || '';
const ABACATEPAY_API_KEY = process.env.ABACATEPAY_API_KEY || '';

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

  // Validação CORS (aceita apenas requisições do próprio site)
  const origin = req.headers['origin'] || req.headers['referer'] || '';
  const siteUrl = process.env.SITE_URL || 'http://localhost:3000';

  if (origin && !origin.startsWith(siteUrl) && !origin.includes('localhost')) {
    console.warn('⚠️ Origem suspeita:', origin);
    return res.status(403).json({ error: 'Forbidden' });
  }

  // Validação CSRF
  if (!validateCSRFToken(req)) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }

  // Rate limiting (10 requisições por minuto)
  const clientIP = getClientIP(req);
  if (!rateLimitService.checkLimit(clientIP, { maxRequests: 10, windowMs: 60000 })) {
    return res.status(429).json({ error: 'Too many requests. Try again later.' });
  }

  // Validação CORS (aceita apenas requisições do próprio site)
  const origin = req.headers['origin'] || req.headers['referer'] || '';
  const siteUrl = process.env.SITE_URL || 'http://localhost:3000';

  if (origin && !origin.startsWith(siteUrl) && !origin.includes('localhost')) {
    console.warn('⚠️ Origem suspeita:', origin);
    return res.status(403).json({ error: 'Forbidden' });
  }

  // Validação CSRF
  if (!validateCSRFToken(req)) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }

  // Rate limiting (10 requisições por minuto)
  const clientIP = getClientIP(req);
  if (!rateLimitService.checkLimit(clientIP, { maxRequests: 10, windowMs: 60000 })) {
    return res.status(429).json({ error: 'Too many requests. Try again later.' });
  }

  const analysisId = req.body?.analysisId;
  const baseUrl = process.env.SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://gastorecorrente.shop');

  // ========== TENTATIVA 1: WOOVI (PRINCIPAL) ==========
  if (WOOVI_API_KEY) {
    try {
      console.log('🎯 Tentando Woovi (principal)...');

      const wooviResponse = await fetch('https://api.woovi.com/api/v1/charge', {
        method: 'POST',
        headers: {
          'Authorization': WOOVI_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          correlationID: analysisId || `analysis-${Date.now()}`,
          value: 500, // R$ 5,00 em centavos
          comment: 'Análise Completa de Assinaturas - Gasto Recorrente',
          customer: {
            name: 'Cliente Gasto Recorrente',
            email: 'cliente@gastorecorrente.shop'
          },
          additionalInfo: [
            {
              key: 'Produto',
              value: 'Relatório detalhado de gastos recorrentes'
            },
            {
              key: 'analysisId',
              value: analysisId || ''
            }
          ]
        })
      });

      const wooviData = await wooviResponse.json();

      if (wooviResponse.ok && wooviData.charge) {
        console.log('✅ Cobrança criada com sucesso via Woovi');

        return res.status(200).json({
          success: true,
          provider: 'woovi',
          chargeId: wooviData.charge.correlationID,
          paymentUrl: wooviData.charge.brCode || wooviData.charge.qrCodeImage,
          qrCode: wooviData.charge.brCode,
          qrCodeImage: wooviData.charge.qrCodeImage,
          status: wooviData.charge.status,
          value: wooviData.charge.value
        });
      }

      console.warn('⚠️ Woovi falhou, tentando fallback para AbacatePay...', wooviData);
    } catch (error) {
      console.error('❌ Erro ao tentar Woovi:', error);
      console.log('🔄 Tentando fallback para AbacatePay...');
    }
  } else {
    console.log('⚠️ WOOVI_API_KEY não configurada, usando AbacatePay diretamente');
  }

  // ========== TENTATIVA 2: ABACATEPAY (FALLBACK) ==========
  if (!ABACATEPAY_API_KEY) {
    console.error('Nenhum provedor de pagamento configurado');
    return res.status(500).json({ error: 'Payment service not configured' });
  }

  try {
    console.log('🔄 Tentando AbacatePay (fallback)...');

    const abacateResponse = await fetch('https://api.abacatepay.com/v1/billing/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ABACATEPAY_API_KEY}`,
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

    const abacateData = await abacateResponse.json();

    if (abacateData.error) {
      console.error('AbacatePay error:', abacateData.error);
      return res.status(400).json({ error: abacateData.error });
    }

    console.log('✅ Cobrança criada com sucesso via AbacatePay (fallback)');

    // Retorna a URL de pagamento
    return res.status(200).json({
      success: true,
      provider: 'abacatepay',
      billingId: abacateData.data?.id,
      paymentUrl: abacateData.data?.url,
      amount: abacateData.data?.amount,
      status: abacateData.data?.status
    });

  } catch (error) {
    console.error('Error creating billing:', error);
    return res.status(500).json({ error: 'Failed to create billing' });
  }
}
