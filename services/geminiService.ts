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

export const analyzeStatement = async (rawText: string): Promise<AnalysisResult> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // Define the schema for structured output
    const subscriptionSchema = {
      type: Type.OBJECT,
      properties: {
        subscriptions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "Nome limpo do serviço (ex: Netflix, Google Storage, Tinder)" },
              monthlyCost: { type: Type.NUMBER, description: "Valor mensal detectado ou média se variar" },
              category: { type: Type.STRING, description: "Categoria do serviço" },
              originalText: { type: Type.STRING, description: "Exemplos do texto original encontrado" },
              frequency: { type: Type.STRING, description: "Mensal, Anual ou Esporádico" }
            },
            required: ["name", "monthlyCost", "category", "originalText"]
          }
        }
      }
    };

    const prompt = `
      Você é um especialista financeiro focado em encontrar "dinheiro desperdiçado" em assinaturas recorrentes.
      
      O usuário forneceu abaixo o texto de faturas/extratos bancários. O texto pode conter dados de UM ou MÚLTIPLOS meses concatenados (ex: Janeiro, Fevereiro, Março).
      
      SUA MISSÃO:
      Identificar transações que são ASSINATURAS recorrentes (SaaS, Streaming, Apps, Academias, Clubes).
      
      REGRAS CRUCIAIS DE RECORRÊNCIA:
      1. Se houver dados de múltiplos meses, PRIORIZE itens que aparecem em meses diferentes com valor igual ou muito próximo. Isso é a prova definitiva de assinatura.
      2. Se houver apenas um mês, use seu conhecimento de nomes de serviços (Netflix, Spotify, Adobe) para identificar.
      
      ATENÇÃO PARA NOMES CAMUFLADOS:
      - "Apple.com/Bill" ou "Apple Services"
      - "Google *Services", "Google *Storage", "Google Play"
      - "Paypal *NomeDoServico"
      - "PAGSEGURO *Nome", "MP *Nome", "IUGU *Nome"
      - "Amazon Prime", "Amazon Digital"
      
      FILTRAGEM:
      - Ignore: iFood, Uber (viagens), Posto, Supermercado, Farmácia, Transferências PIX para pessoas físicas.
      - Inclua: Adobe, Microsoft, ChatGPT, Tinder, Gympass, Smart Fit, HBO, Disney+.
      
      Texto para análise (pode incluir marcadores como '=== INÍCIO FATURA ==='):
      """
      ${rawText.substring(0, 25000)} 
      """
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: subscriptionSchema,
        thinkingConfig: { thinkingBudget: 0 } // Disable thinking for faster response
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("Falha ao gerar resposta da IA");

    const parsedData = JSON.parse(resultText) as { subscriptions: { name: string, monthlyCost: number, category: string, originalText: string }[] };
    
    // Transform into our internal type
    const items: SubscriptionItem[] = parsedData.subscriptions.map(sub => ({
      name: sub.name,
      monthlyCost: sub.monthlyCost,
      annualCost: sub.monthlyCost * 12,
      category: mapCategory(sub.category),
      confidence: 0.9,
      description: sub.originalText
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