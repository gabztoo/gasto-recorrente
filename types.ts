export enum AppView {
  LANDING = 'LANDING',
  UPLOAD = 'UPLOAD',
  ANALYZING = 'ANALYZING',
  PREVIEW = 'PREVIEW',
  DASHBOARD = 'DASHBOARD'
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  provider: 'google' | 'facebook';
}

export interface SubscriptionItem {
  name: string;
  category: string;
  monthlyCost: number;
  annualCost: number;
  confidence: number;
  description: string; // The original transaction text match
}

export interface AnalysisResult {
  id: string; // Unique ID for history
  date: string;
  totalMonthly: number;
  totalAnnual: number;
  subscriptionCount: number;
  items: SubscriptionItem[];
  potentialSavings: number;
}

export interface AnalysisState {
  status: 'idle' | 'loading' | 'success' | 'error';
  data: AnalysisResult | null;
  error?: string;
}

export enum Category {
  STREAMING = 'Streaming',
  SOFTWARE = 'Software',
  GYM = 'Academia/Saúde',
  CLOUD = 'Nuvem/Hospedagem',
  UTILITIES = 'Utilidades',
  OTHER = 'Outros'
}