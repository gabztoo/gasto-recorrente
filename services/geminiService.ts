import { AnalysisResult } from "../types";
import { analyzeWithFallback } from "./aiProviders";

/**
 * Analisa um extrato bancário usando sistema de fallback automático.
 * Tenta múltiplos providers (Gemini, Groq, OpenRouter) até um funcionar.
 */
export const analyzeStatement = async (rawText: string): Promise<AnalysisResult> => {
  try {
    console.log("📊 Iniciando análise do extrato...");
    
    const { items, provider } = await analyzeWithFallback(rawText);
    
    console.log(`✅ Análise concluída via ${provider}`);
    console.log(`📋 ${items.length} assinaturas encontradas`);

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
    console.error("❌ Erro na análise (todos os providers falharam):", error);
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