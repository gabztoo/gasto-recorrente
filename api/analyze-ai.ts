// POST /api/analyze-ai
// Endpoint backend seguro para análise de IA
// Protege API keys e implementa rate limiting

import type { IncomingMessage, ServerResponse } from 'http';
import { rateLimitService, getClientIP } from '../services/rateLimitService';

interface RequestBody {
    text?: string;
}

interface SubscriptionData {
    n: string;
    v: number;
    c: string;
}

// Configuração de rate limiting
const RATE_LIMIT_CONFIG = {
    maxRequests: parseInt(process.env.RATE_LIMIT_AI || '5', 10),
    windowMs: 60 * 1000 // 1 minuto
};

// Importações dinâmicas para evitar bundle no cliente
const analyzeWithGemini = async (text: string, model: string): Promise<{ subs: SubscriptionData[] }> => {
    const { GoogleGenAI, Type } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

    const subscriptionSchema = {
        type: Type.OBJECT,
        properties: {
            subs: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        n: { type: Type.STRING, description: "Nome do serviço" },
                        v: { type: Type.NUMBER, description: "Valor mensal" },
                        c: { type: Type.STRING, description: "Categoria" }
                    },
                    required: ["n", "v", "c"]
                }
            }
        }
    };

    const prompt = `Analise o extrato bancário e liste APENAS assinaturas recorrentes (Netflix, Spotify, Adobe, etc).
ATENÇÃO PARA NOMES CAMUFLADOS:
  - "Apple.com/Bill" ou "Apple Services"
  - "Google *Services", "Google *Storage", "Google Play"
  - "Paypal *NomeDoServico"
  - "PAGSEGURO *Nome", "MP *Nome", "IUGU *Nome"
  - "Amazon Prime", "Amazon Digital"

IGNORAR: iFood, Uber, PIX, transferências, compras únicas.
INCLUIR: Streaming, SaaS, Apps, Academias, Jogos.

Responda APENAS com JSON no formato: {"subs": [{"n": "nome", "v": valor, "c": "categoria"}]}

Texto:
"""
${text}
"""`;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: subscriptionSchema,
            temperature: 0,
            maxOutputTokens: 1024,
        }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("Resposta vazia do Gemini");
    return JSON.parse(resultText);
};

const analyzeWithGroq = async (text: string): Promise<{ subs: SubscriptionData[] }> => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("GROQ_API_KEY não configurada");

    const prompt = `Analise o extrato bancário e liste APENAS assinaturas recorrentes.
Responda APENAS com JSON: {"subs": [{"n": "nome", "v": valor, "c": "categoria"}]}

Texto:
"""
${text}
"""`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: "Você é um assistente que analisa extratos bancários e retorna APENAS JSON válido." },
                { role: "user", content: prompt }
            ],
            temperature: 0,
            max_tokens: 1024,
            response_format: { type: "json_object" }
        })
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(`Groq error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("Resposta vazia do Groq");

    return JSON.parse(content);
};

const analyzeWithOpenRouter = async (text: string): Promise<{ subs: SubscriptionData[] }> => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error("OPENROUTER_API_KEY não configurada");

    const prompt = `Analise o extrato bancário e liste APENAS assinaturas recorrentes.
Responda APENAS com JSON: {"subs": [{"n": "nome", "v": valor, "c": "categoria"}]}

Texto:
"""
${text}
"""`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": process.env.SITE_URL || "https://gastorecorrente.shop",
            "X-Title": "Gasto Recorrente"
        },
        body: JSON.stringify({
            model: "meta-llama/llama-3.3-70b-instruct:free",
            messages: [
                { role: "system", content: "Você é um assistente que analisa extratos bancários e retorna APENAS JSON válido." },
                { role: "user", content: prompt }
            ],
            temperature: 0,
            max_tokens: 1024
        })
    });

    if (!response.ok) {
        throw new Error(`OpenRouter error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("Resposta vazia do OpenRouter");

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("JSON não encontrado na resposta");

    return JSON.parse(jsonMatch[0]);
};

// Sistema de fallback
const providers = [
    { name: 'Gemini 2.5 Flash', fn: (text: string) => analyzeWithGemini(text, 'gemini-2.5-flash') },
    { name: 'Gemini 2.0 Flash Lite', fn: (text: string) => analyzeWithGemini(text, 'gemini-2.0-flash-lite') },
    { name: 'Groq', fn: analyzeWithGroq },
    { name: 'OpenRouter', fn: analyzeWithOpenRouter }
];

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

    // Rate limiting
    const clientIP = getClientIP(req);
    if (!rateLimitService.checkLimit(clientIP, RATE_LIMIT_CONFIG)) {
        const info = rateLimitService.getInfo(clientIP, RATE_LIMIT_CONFIG);
        return res.status(429).json({
            error: 'Too many requests',
            retryAfter: Math.ceil(info.resetIn / 1000)
        });
    }

    const text = req.body?.text;

    if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'Text is required' });
    }

    // Preprocessa texto
    let cleanText = text.replace(/\n{3,}/g, '\n\n');
    cleanText = cleanText.replace(/[ \t]+/g, ' ');
    cleanText = cleanText.trim();

    // Tenta cada provider até um funcionar
    let lastError: Error | null = null;

    for (const provider of providers) {
        try {
            console.log(`🤖 Tentando: ${provider.name}...`);
            const result = await provider.fn(cleanText);

            console.log(`✅ Sucesso com: ${provider.name}`);

            return res.status(200).json({
                success: true,
                data: result,
                provider: provider.name
            });
        } catch (error: any) {
            console.warn(`⚠️ Falha com ${provider.name}:`, error.message);
            lastError = error;
            continue;
        }
    }

    // Todos os providers falharam
    console.error("❌ Todos os providers falharam");
    return res.status(500).json({
        error: 'All AI providers failed',
        details: lastError?.message
    });
}
