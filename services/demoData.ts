import { AnalysisResult } from '../types';

// Dados de demonstração realistas para o botão "Ver Exemplo"
export const DEMO_DATA: AnalysisResult = {
  id: 'demo-' + Math.random().toString(36).substr(2, 9),
  date: new Date().toISOString(),
  items: [
    {
      name: 'Netflix',
      monthlyCost: 55.90,
      annualCost: 670.80,
      category: 'Streaming',
      confidence: 0.98,
      description: 'Netflix.com/bill'
    },
    {
      name: 'Spotify Premium',
      monthlyCost: 21.90,
      annualCost: 262.80,
      category: 'Streaming',
      confidence: 0.95,
      description: 'Spotify AB'
    },
    {
      name: 'ChatGPT Plus',
      monthlyCost: 104.90,
      annualCost: 1258.80,
      category: 'Software/App',
      confidence: 0.92,
      description: 'OpenAI *ChatGPT'
    },
    {
      name: 'Adobe Creative Cloud',
      monthlyCost: 224.00,
      annualCost: 2688.00,
      category: 'Software/App',
      confidence: 0.97,
      description: 'Adobe Systems'
    },
    {
      name: 'iCloud+ 200GB',
      monthlyCost: 10.90,
      annualCost: 130.80,
      category: 'Software/App',
      confidence: 0.88,
      description: 'Apple.com/bill'
    },
    {
      name: 'Smart Fit',
      monthlyCost: 119.90,
      annualCost: 1438.80,
      category: 'Saúde',
      confidence: 0.99,
      description: 'Smart Fit Academia'
    },
    {
      name: 'YouTube Premium',
      monthlyCost: 24.90,
      annualCost: 298.80,
      category: 'Streaming',
      confidence: 0.94,
      description: 'Google *YouTube'
    },
    {
      name: 'Xbox Game Pass',
      monthlyCost: 44.99,
      annualCost: 539.88,
      category: 'Games',
      confidence: 0.91,
      description: 'Microsoft *Xbox'
    }
  ],
  totalMonthly: 607.39,
  totalAnnual: 7288.68,
  subscriptionCount: 8,
  potentialSavings: 7288.68
};

// Função para gerar ID único para demo
export const generateDemoData = (): AnalysisResult => ({
  ...DEMO_DATA,
  id: 'demo-' + Math.random().toString(36).substr(2, 9),
  date: new Date().toISOString()
});
