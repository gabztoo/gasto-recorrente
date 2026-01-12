import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, SubscriptionItem } from "../types";

const mapCategory = (cat: string): string => {
  const c = cat.toLowerCase();
  if (c.includes('video') || c.includes('music') || c.includes('tv') || c.includes('stream')) return 'Streaming';
  if (c.includes('software') || c.includes('app') || c.includes('saas') || c.includes('cloud')) return 'Software/App';
  if (c.includes('gym') || c.includes('fit') || c.includes('health') || c.includes('med')) return 'Saúde';
  if (c.includes('game') || c.includes('jogos') || c.includes('xbox') || c.includes('psn')) return 'Games';
  return 'Outros';
}

// Pré-processar texto para reduzir tokens (sem limitar tamanho)
const preprocessText = (text: string): string => {
  // Remove linhas vazias duplicadas
  let processed = text.replace(/\n{3,}/g, '\n\n');
  
  // Remove espaços extras
  processed = processed.replace(/[ \t]+/g, ' ');
  
  // Remove caracteres especiais repetidos (separadores)
  processed = processed.replace(/[=\-_]{3,}/g, '---');
  
  // Remove linhas que são só espaços
  processed = processed.replace(/^\s+$/gm, '');
  
  return processed.trim();
};

export const analyzeStatement = async (rawText: string): Promise<AnalysisResult> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Pré-processa o texto para economizar tokens
    const cleanText = preprocessText(rawText);

    // Schema simplificado para resposta menor
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

    // Prompt otimizado e mais curto
    const prompt = `Analise o extrato bancário e liste APENAS assinaturas recorrentes (Netflix, Spotify, Adobe, etc).
    ATENÇÃO PARA NOMES CAMUFLADOS:
      - "Apple.com/Bill" ou "Apple Services"
      - "Google *Services", "Google *Storage", "Google Play"
      - "Paypal *NomeDoServico"
      - "PAGSEGURO *Nome", "MP *Nome", "IUGU *Nome"
      - "Amazon Prime", "Amazon Digital"
    

IGNORAR: iFood, Uber, PIX, transferências, compras únicas.
INCLUIR: Streaming, SaaS, Apps, Academias, Jogos.

Texto:
"""
${cleanText}
"""`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash', // Modelo mais eficiente
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: subscriptionSchema,
        temperature: 0.1, // Mais determinístico = menos tokens
        maxOutputTokens: 1024, // Limita resposta
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("Falha ao gerar resposta da IA");

    const parsedData = JSON.parse(resultText) as { subs: { n: string, v: number, c: string }[] };
    
    // Transform into our internal type
    const items: SubscriptionItem[] = parsedData.subs.map(sub => ({
      name: sub.n,
      monthlyCost: sub.v,
      annualCost: sub.v * 12,
      category: mapCategory(sub.c),
      confidence: 0.9,
      description: ''
    }));

    const totalMonthly = items.reduce((acc, item) => acc + item.monthlyCost, 0);
    const totalAnnual = totalMonthly * 12;

    return {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      items,
      totalMonthly,
      totalAnnual,
      subscriptionCount: items.length,
      potentialSavings: totalAnnual
    };

  } catch (error) {
    console.error("Erro na análise:", error);
    // Return empty state on error
    return {
        id: 'error',
        date: new Date().toISOString(),
        items: [],
        totalAnnual: 0,
        totalMonthly: 0,
        subscriptionCount: 0,
        potentialSavings: 0
    };
  }
};