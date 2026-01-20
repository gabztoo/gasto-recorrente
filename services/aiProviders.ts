/**
 * AI Providers Service - Frontend
 * Agora chama endpoint backend seguro ao invés de chamar APIs diretamente
 * Isso protege as API keys de exposição no cliente
 */

import { SubscriptionItem } from "../types";

// Mapeamento de categorias abreviadas para completas
const mapCategory = (cat: string): string => {
  const c = cat.toLowerCase();
  if (c.includes('video') || c.includes('music') || c.includes('tv') || c.includes('stream')) return 'Streaming';
  if (c.includes('software') || c.includes('app') || c.includes('saas') || c.includes('cloud')) return 'Software/App';
  if (c.includes('gym') || c.includes('fit') || c.includes('health') || c.includes('med')) return 'Saúde';
  if (c.includes('game') || c.includes('jogos') || c.includes('xbox') || c.includes('psn')) return 'Games';
  return 'Outros';
};

/**
 * Analisa texto usando endpoint backend seguro
 * O backend gerencia API keys e implementa fallback entre providers
 */
export const analyzeWithFallback = async (text: string): Promise<{
  items: SubscriptionItem[];
  provider: string;
}> => {
  try {
    console.log('📊 Enviando texto para análise no backend...');

    const response = await fetch('/api/analyze-ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));

      if (response.status === 429) {
        throw new Error('Muitas requisições. Aguarde um momento e tente novamente.');
      }

      throw new Error(error.error || `Erro ${response.status}`);
    }

    const result = await response.json();

    if (!result.success || !result.data) {
      throw new Error('Resposta inválida do servidor');
    }

    console.log(`✅ Análise concluída via ${result.provider}`);

    // Mapeia resultado do backend para formato esperado
    const subs = result.data.subs || [];
    const items: SubscriptionItem[] = subs.map((sub: { n: string; v: number; c: string }) => ({
      name: sub.n,
      monthlyCost: sub.v,
      annualCost: sub.v * 12,
      category: mapCategory(sub.c),
      confidence: 0.9,
      description: ''
    }));

    return {
      items,
      provider: result.provider
    };

  } catch (error: any) {
    console.error('❌ Erro na análise:', error);
    throw error;
  }
};
