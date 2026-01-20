// POST /api/webhook-stripe
// Webhook do Stripe para confirmar pagamentos

import type { IncomingMessage, ServerResponse } from 'http';

interface RequestBody {
    [key: string]: any;
}

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

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

    // TODO: Implementar validação de assinatura do webhook do Stripe
    // Para implementar corretamente, use a biblioteca stripe e valide a assinatura

    const signature = req.headers['stripe-signature'] as string;

    if (!STRIPE_WEBHOOK_SECRET) {
        console.error('STRIPE_WEBHOOK_SECRET não configurado');
        return res.status(500).json({ error: 'Webhook not configured' });
    }

    try {
        const event = req.body;

        // Processar evento de checkout completo
        if (event.type === 'checkout.session.completed') {
            const session = event.data?.object;
            const analysisId = session?.metadata?.analysisId;

            if (analysisId) {
                console.log(`✅ Pagamento Stripe confirmado para análise: ${analysisId}`);

                // TODO: Salvar pagamento confirmado em banco de dados
                // Por enquanto, o frontend gerencia via URL params
            }
        }

        return res.status(200).json({ received: true });
    } catch (error: any) {
        console.error('Erro no webhook Stripe:', error);
        return res.status(400).json({ error: error.message });
    }
}
