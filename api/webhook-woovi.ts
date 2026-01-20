// POST /api/webhook-woovi
// Webhook do Woovi para confirmar pagamentos PIX

import type { IncomingMessage, ServerResponse } from 'http';

interface RequestBody {
    [key: string]: any;
}

const WOOVI_API_KEY = process.env.WOOVI_API_KEY || '';

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

    if (!WOOVI_API_KEY) {
        console.error('WOOVI_API_KEY não configurada');
        return res.status(500).json({ error: 'Webhook not configured' });
    }

    try {
        const event = req.body;

        // Validar webhook do Woovi
        // A Woovi envia o evento com os dados da cobrança

        console.log('📥 Webhook Woovi recebido:', event);

        // Processar evento de pagamento confirmado
        // Woovi envia status COMPLETED quando o PIX é pago
        if (event.charge?.status === 'COMPLETED' || event.charge?.status === 'ACTIVE') {
            const correlationID = event.charge?.correlationID;
            const analysisId = event.charge?.additionalInfo?.find(
                (info: any) => info.key === 'analysisId'
            )?.value;

            if (analysisId || correlationID) {
                console.log(`✅ Pagamento Woovi confirmado para análise: ${analysisId || correlationID}`);

                // TODO: Salvar pagamento confirmado em banco de dados
                // Para produção, use banco de dados real (PostgreSQL, MongoDB, etc)
                // Por enquanto, o frontend gerencia via localStorage e URL params
            }
        }

        return res.status(200).json({ received: true });
    } catch (error: any) {
        console.error('Erro no webhook Woovi:', error);
        return res.status(400).json({ error: error.message });
    }
}
