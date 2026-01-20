// GET /api/verify-payment
// Verifica se uma análise foi paga (validação backend)

import type { IncomingMessage, ServerResponse } from 'http';

interface RequestQuery {
    analysisId?: string;
}

// TODO: Em produção, substituir por banco de dados real
// Por enquanto, aceita qualquer análise que tenha sido criada
// O ideal seria armazenar confirmações de pagamento dos webhooks

export default async function handler(
    req: IncomingMessage & { method?: string; url?: string },
    res: ServerResponse & {
        status: (code: number) => { json: (data: unknown) => void };
        json: (data: unknown) => void;
    }
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Parse query parameters
        const url = new URL(req.url || '', `http://${req.headers.host}`);
        const analysisId = url.searchParams.get('analysisId');

        if (!analysisId) {
            return res.status(400).json({ error: 'analysisId is required' });
        }

        // TODO: Consultar banco de dados para verificar se analysisId tem pagamento confirmado
        // Por enquanto, retorna que todos os IDs são válidos se existirem no localStorage
        // Isso ainda é melhor que validação 100% no frontend, mas não é ideal

        // Em produção, implementar algo como:
        // const payment = await db.payments.findOne({ analysisId, status: 'confirmed' });
        // return res.status(200).json({ paid: !!payment });

        return res.status(200).json({
            paid: false, // Por padrão, requer pagamento
            message: 'Payment verification requires database integration'
        });

    } catch (error: any) {
        console.error('Erro na verificação de pagamento:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
