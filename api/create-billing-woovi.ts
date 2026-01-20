// POST /api/create-billing-woovi
//  Cria uma cobrança no Woovi (PIX) e retorna a URL de pagamento
// PROTEGIDO: CSRF + Rate Limiting + CORS

import type { IncomingMessage, ServerResponse } from 'http';
import { rateLimitService, getClientIP } from '../services/rateLimitService';
import { validateCSRFToken } from '../services/csrfService';

interface RequestBody {
    analysisId?: string;
}

const WOOVI_API_KEY = process.env.WOOVI_API_KEY || '';

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

    if (!WOOVI_API_KEY) {
        console.error('WOOVI_API_KEY não configurada');
        return res.status(500).json({ error: 'Payment service not configured' });
    }

    try {
        const analysisId = req.body?.analysisId;

        // URL base do site (configurada na Vercel)
        const baseUrl = process.env.SITE_URL ||
            (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://gastorecorrente.shop');

        // Criar cobrança no Woovi
        const response = await fetch('https://api.woovi.com/api/v1/charge', {
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

        const data = await response.json();

        if (!response.ok) {
            console.error('Woovi error:', data);
            return res.status(400).json({
                error: data.error || 'Failed to create charge',
                provider: 'woovi'
            });
        }

        // Retorna a URL de pagamento e QR Code
        return res.status(200).json({
            success: true,
            provider: 'woovi',
            chargeId: data.charge?.correlationID,
            paymentUrl: data.charge?.brCode || data.charge?.qrCodeImage,
            qrCode: data.charge?.brCode,
            qrCodeImage: data.charge?.qrCodeImage,
            status: data.charge?.status,
            value: data.charge?.value
        });

    } catch (error) {
        console.error('Error creating Woovi charge:', error);
        return res.status(500).json({
            error: 'Failed to create charge',
            provider: 'woovi'
        });
    }
}
