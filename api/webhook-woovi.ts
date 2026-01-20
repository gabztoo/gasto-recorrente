// POST /api/webhook-woovi
// Webhook do Woovi para confirmar pagamentos PIX

import type { IncomingMessage, ServerResponse } from 'http';

interface WooviWebhookPayload {
    charge?: {
        correlationID?: string;
        status?: string;
        value?: number;
        additionalInfo?: Array<{ key: string; value: string }>;
    };
}

export default async function handler(
    req: IncomingMessage & { body?: WooviWebhookPayload; method?: string },
    res: ServerResponse & {
        status: (code: number) => { json: (data: unknown) => void };
        json: (data: unknown) => void;
    }
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const event = req.body;

        console.log('📥 Webhook Woovi recebido:', JSON.stringify(event, null, 2));

        // Processar evento de pagamento confirmado
        // Woovi envia status COMPLETED quando o PIX é pago
        if (event?.charge?.status === 'COMPLETED' || event?.charge?.status === 'ACTIVE') {
            const correlationID = event.charge.correlationID;
            const analysisId = event.charge.additionalInfo?.find(
                (info) => info.key === 'analysisId'
            )?.value;

            if (analysisId || correlationID) {
                console.log(`✅ Pagamento Woovi confirmado para análise: ${analysisId || correlationID}`);

                // TODO: Salvar pagamento confirmado em banco de dados
                // Para produção, use banco de dados real (PostgreSQL, MongoDB, etc)
                // Por enquanto, o frontend gerencia via localStorage e URL params
            }
        }

        return res.status(200).json({ received: true });
    } catch (error) {
        console.error('Erro no webhook Woovi:', error);
        return res.status(400).json({ error: 'Webhook processing failed' });
    }
}
