import { AnalysisResult, User } from '../types';

const HISTORY_KEY_PREFIX = 'subdetector_history_';

export const historyService = {
  saveToHistory: (userId: string, analysis: AnalysisResult) => {
    const key = HISTORY_KEY_PREFIX + userId;
    const currentHistoryStr = localStorage.getItem(key);
    let history: AnalysisResult[] = currentHistoryStr ? JSON.parse(currentHistoryStr) : [];
    
    // Evitar duplicatas baseadas no ID
    if (!history.find(h => h.id === analysis.id)) {
      history.unshift(analysis); // Adiciona no começo
      localStorage.setItem(key, JSON.stringify(history));
    }
  },

  getHistory: (userId: string): AnalysisResult[] => {
    const key = HISTORY_KEY_PREFIX + userId;
    const currentHistoryStr = localStorage.getItem(key);
    return currentHistoryStr ? JSON.parse(currentHistoryStr) : [];
  },
  
  clearHistory: (userId: string) => {
      const key = HISTORY_KEY_PREFIX + userId;
      localStorage.removeItem(key);
  }
};