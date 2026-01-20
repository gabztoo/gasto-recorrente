// POST /api/webhook-abacatepay
// Webhook do AbacatePay para confirmar pagamentos PIX

import type { IncomingMessage, ServerResponse } from 'http';

interface RequestBody {
    [key: string]: any;
}

const ABACATEPAY_API_KEY = process.env.ABACATEPAY_API_KEY || '';

export default async function handler(
    req: IncomingMessage & { body?: RequestBody; method?: string },
    res: ServerResponse & {
        status: (code: number) => { json: (data: unknown) => void };
        json: (data: unknown) => void;
    }
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!ABACATEPAY_API_KEY) {
        console.error('ABACATEPAY_API_KEY não configurada');
        return res.status(500).json({ error: 'Webhook not configured' });
    }

    try {
        const event = req.body;

        // Validar evento do AbacatePay
        // TODO: Implementar validação de assinatura se disponível na API

        // Processar evento de pagamento confirmado
        if (event.status === 'COMPLETED' || event.status === 'PAID') {
            const billingId = event.id;
            const analysisId = event.metadata?.analysisId;

            if (analysisId) {
                console.log(`✅ Pagamento PIX confirmado para análise: ${analysisId}`);

                // TODO: Salvar pagamento confirmado em banco de dados
                // Para produção, use banco de dados real (PostgreSQL, MongoDB, etc)
                // Por enquanto, o frontend gerencia via localStorage e URL params
            }
        }

        return res.status(200).json({ received: true });
    } catch (error: any) {
        console.error('Erro no webhook AbacatePay:', error);
        return res.status(400).json({ error: error.message });
    }
}
