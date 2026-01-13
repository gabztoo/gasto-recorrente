// Sistema de fallback para múltiplos providers de IA
// Quando um provider atinge o limite, tenta automaticamente o próximo

import { SubscriptionItem } from "../types";

export interface AIProvider {
  name: string;
  analyze: (text: string) => Promise<{ subs: { n: string; v: number; c: string }[] }>;
}

// Mapeamento de categorias abreviadas para completas
const mapCategory = (cat: string): string => {
  const c = cat.toLowerCase();
  if (c.includes('video') || c.includes('music') || c.includes('tv') || c.includes('stream')) return 'Streaming';
  if (c.includes('software') || c.includes('app') || c.includes('saas') || c.includes('cloud')) return 'Software/App';
  if (c.includes('gym') || c.includes('fit') || c.includes('health') || c.includes('med')) return 'Saúde';
  if (c.includes('game') || c.includes('jogos') || c.includes('xbox') || c.includes('psn')) return 'Games';
  return 'Outros';
};

// Pré-processar texto para reduzir tokens
const preprocessText = (text: string): string => {
  let processed = text.replace(/\n{3,}/g, '\n\n');
  processed = processed.replace(/[ \t]+/g, ' ');
  processed = processed.replace(/[=\-_]{3,}/g, '---');
  processed = processed.replace(/^\s+$/gm, '');
  return processed.trim();
};

// Prompt padrão usado por todos os providers
const getPrompt = (cleanText: string): string => `Analise o extrato bancário e liste APENAS assinaturas recorrentes (Netflix, Spotify, Adobe, etc).
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
${cleanText}
"""`;

// ========== GEMINI PROVIDER ==========
const createGeminiProvider = (model: string): AIProvider => ({
  name: `Gemini (${model})`,
  analyze: async (text: string) => {
    const { GoogleGenAI, Type } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const cleanText = preprocessText(text);

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
              c: { type: Type.STRING, description: "Categoria: stream/soft/saude/game/outro" }
            },
            required: ["n", "v", "c"]
          }
        }
      }
    };

    const response = await ai.models.generateContent({
      model,
      contents: getPrompt(cleanText),
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
  }
});

// ========== GROQ PROVIDER ==========
const createGroqProvider = (): AIProvider => ({
  name: "Groq (llama-3.3-70b)",
  analyze: async (text: string) => {
    const cleanText = preprocessText(text);
    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) throw new Error("GROQ_API_KEY não configurada");

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "Você é um assistente que analisa extratos bancários e retorna APENAS JSON válido com assinaturas encontradas."
          },
          {
            role: "user",
            content: getPrompt(cleanText)
          }
        ],
        temperature: 0,
        max_tokens: 1024,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      if (response.status === 429) {
        throw new Error("RATE_LIMIT");
      }
      throw new Error(`Groq error: ${response.status} - ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("Resposta vazia do Groq");
    
    return JSON.parse(content);
  }
});

// ========== OPENROUTER PROVIDER ==========
const createOpenRouterProvider = (): AIProvider => ({
  name: "OpenRouter (llama-3.3-70b)",
  analyze: async (text: string) => {
    const cleanText = preprocessText(text);
    const apiKey = process.env.OPENROUTER_API_KEY;
    
    if (!apiKey) throw new Error("OPENROUTER_API_KEY não configurada");

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://gastorecorrente.com",
        "X-Title": "Gasto Recorrente"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.3-70b-instruct:free",
        messages: [
          {
            role: "system",
            content: "Você é um assistente que analisa extratos bancários e retorna APENAS JSON válido com assinaturas encontradas."
          },
          {
            role: "user",
            content: getPrompt(cleanText)
          }
        ],
        temperature: 0,
        max_tokens: 1024
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      if (response.status === 429) {
        throw new Error("RATE_LIMIT");
      }
      throw new Error(`OpenRouter error: ${response.status} - ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("Resposta vazia do OpenRouter");
    
    // OpenRouter pode retornar texto com marcação, limpar
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("JSON não encontrado na resposta");
    
    return JSON.parse(jsonMatch[0]);
  }
});

// Lista de providers em ordem de prioridade
const providers: AIProvider[] = [
  createGeminiProvider("gemini-2.5-flash"),
  createGeminiProvider("gemini-2.0-flash-lite"),
  createGroqProvider(),
  createOpenRouterProvider(),
];

// Função principal que tenta cada provider até um funcionar
export const analyzeWithFallback = async (text: string): Promise<{
  items: SubscriptionItem[];
  provider: string;
}> => {
  let lastError: Error | null = null;

  for (const provider of providers) {
    try {
      console.log(`🤖 Tentando: ${provider.name}...`);
      const result = await provider.analyze(text);
      
      console.log(`✅ Sucesso com: ${provider.name}`);
      
      const items: SubscriptionItem[] = (result.subs || []).map(sub => ({
        name: sub.n,
        monthlyCost: sub.v,
        annualCost: sub.v * 12,
        category: mapCategory(sub.c),
        confidence: 0.9,
        description: ''
      }));

      return { items, provider: provider.name };
    } catch (error: any) {
      console.warn(`⚠️ Falha com ${provider.name}:`, error.message || error);
      lastError = error;
      
      // Se for rate limit ou quota exceeded, tentar próximo
      const errorMsg = error.message?.toLowerCase() || '';
      if (
        errorMsg.includes('rate_limit') ||
        errorMsg.includes('quota') ||
        errorMsg.includes('429') ||
        errorMsg.includes('resource_exhausted')
      ) {
        console.log(`🔄 Limite atingido, tentando próximo provider...`);
        continue;
      }
      
      // Para outros erros (API key inválida, etc), também tentar próximo
      continue;
    }
  }

  // Todos os providers falharam
  console.error("❌ Todos os providers falharam");
  throw lastError || new Error("Nenhum provider disponível");
};
