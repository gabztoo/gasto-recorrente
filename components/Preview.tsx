import React, { useState } from 'react';
import { Lock, Check, AlertCircle, ArrowRight, TrendingDown, Ban, Shield, Tv, Music, Gamepad2, Dumbbell, Cloud, CreditCard } from 'lucide-react';
import { AnalysisResult, User } from '../types';
import PaymentModal from './PaymentModal';

interface PreviewProps {
  data: AnalysisResult;
  user: User | null;
  onRequireLogin: () => void;
  onPaymentSuccess: () => void;
}

const PRICE = 10.00; // Preço do relatório em R$

// Cores para serviços conhecidos
const SERVICE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'netflix': { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
  'spotify': { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
  'disney': { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
  'amazon': { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
  'prime': { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  'hbo': { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
  'adobe': { bg: 'bg-red-600/20', text: 'text-red-500', border: 'border-red-600/30' },
  'microsoft': { bg: 'bg-blue-600/20', text: 'text-blue-500', border: 'border-blue-600/30' },
  'google': { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  'apple': { bg: 'bg-gray-400/20', text: 'text-gray-300', border: 'border-gray-400/30' },
  'youtube': { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
  'chatgpt': { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  'openai': { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  'smart fit': { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
  'gympass': { bg: 'bg-pink-500/20', text: 'text-pink-400', border: 'border-pink-500/30' },
};

// Ícone por categoria
const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'streaming': return <Tv className="w-3 h-3" />;
    case 'software/app': return <Cloud className="w-3 h-3" />;
    case 'games': return <Gamepad2 className="w-3 h-3" />;
    case 'saúde': return <Dumbbell className="w-3 h-3" />;
    default: return <CreditCard className="w-3 h-3" />;
  }
};

const getServiceStyle = (name: string) => {
  const nameLower = name.toLowerCase();
  for (const [key, style] of Object.entries(SERVICE_COLORS)) {
    if (nameLower.includes(key)) return style;
  }
  return { bg: 'bg-white/10', text: 'text-gray-300', border: 'border-white/20' };
};

const Preview: React.FC<PreviewProps> = ({ data, user, onRequireLogin, onPaymentSuccess }) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  const handlePaymentClick = () => {
    if (!user) {
      onRequireLogin();
      return;
    }
    setShowPaymentModal(true);
  };

  return (
    <>
      <div className="max-w-5xl mx-auto px-4 py-12">
        
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-2">Varredura Concluída</h2>
          <p className="text-gray-400 text-sm">Identificamos padrões de recorrência em seus dados.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 bg-surface border border-white/10 rounded-xl overflow-hidden shadow-2xl">
          
          {/* Left: Data Preview (Darker) */}
          <div className="p-8 md:p-12 bg-background border-r border-white/10 relative">
             <div className="flex items-center justify-between mb-8">
                 <div className="text-xs font-mono text-gray-500 uppercase">Resumo da Detecção</div>
                 <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
             </div>
             
             <div className="space-y-8">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-3xl font-bold text-white/60 select-none">•••</p>
                        <p className="text-xs text-gray-500 mt-1">Assinaturas Ativas</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xl font-mono text-gray-300/60 select-none">R$ •••,••</p>
                        <p className="text-xs text-gray-500 mt-1">Custo Mensal</p>
                    </div>
                </div>

                {/* Subscription Badges */}
                {data.items.length > 0 && (
                  <div className="mt-6">
                    <p className="text-xs font-mono text-gray-500 mb-3 uppercase">Serviços Detectados</p>
                    <div className="flex flex-wrap gap-2">
                      {data.items.slice(0, 3).map((item, index) => {
                        const style = getServiceStyle(item.name);
                        return (
                          <div 
                            key={index}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium ${style.bg} ${style.text} ${style.border}`}
                          >
                            {getCategoryIcon(item.category)}
                            <span>{item.name}</span>
                          </div>
                        );
                      })}
                      {data.items.length > 3 && (
                        <div className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-white/20 bg-white/10 text-gray-400 text-xs font-medium">
                          +{data.items.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Blurred List - Clean Technical Look */}
                <div className="space-y-1 relative mt-6">
                   {/* Gradient overlay for blur */}
                   <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/80 to-background z-10"></div>
                   
                   {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center justify-between p-3 border-b border-white/5 opacity-40 blur-[2px]">
                          <div className="w-24 h-3 bg-gray-800 rounded-sm"></div>
                          <div className="w-12 h-3 bg-gray-800 rounded-sm"></div>
                      </div>
                   ))}
                   
                   {/* Floating Alert Card */}
                   <div className="absolute top-1/4 left-0 right-0 z-20 p-4 bg-surface border border-red-500/30 rounded-lg shadow-lg">
                       <div className="flex items-start space-x-3">
                           <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                           <div>
                               <p className="text-sm font-semibold text-white">Assinatura "Fantasma" Detectada</p>
                               <p className="text-xs text-gray-400 mt-1">Serviço não utilizado cobrando R$ 49,90/mês.</p>
                           </div>
                       </div>
                   </div>
                </div>
             </div>
          </div>

          {/* Right: Action (Lighter/Highlight) */}
          <div className="p-8 md:p-12 flex flex-col justify-start bg-surface relative">
              
              {/* SAVINGS HIGHLIGHT - MOVED TO TOP AND ENLARGED */}
              <div className="mb-10 text-center">
                  <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Potencial de Economia Anual</p>
                  
                  <div className="flex flex-col items-center justify-center py-8">
                      <span className="text-6xl md:text-7xl font-black text-primary tracking-tighter drop-shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                          R$ {data.potentialSavings.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                      </span>
                      <span className="text-xs font-mono text-gray-500 mt-4 flex items-center bg-white/5 px-3 py-1 rounded-full border border-white/5">
                          <TrendingDown className="w-3 h-3 mr-1 text-green-500" />
                          PROJEÇÃO_DE_RECUPERAÇÃO_ANUAL
                      </span>
                  </div>
              </div>

              <div className="h-px bg-white/5 w-full mb-8"></div>

              <ul className="space-y-4 mb-10">
                  <li className="flex items-center text-sm text-gray-300">
                      <div className="bg-primary/20 p-1 rounded-full mr-3"><Check className="w-3 h-3 text-primary" /></div>
                      Relatório completo de gastos recorrentes
                  </li>
                  <li className="flex items-center text-sm text-gray-300">
                      <div className="bg-primary/20 p-1 rounded-full mr-3"><Ban className="w-3 h-3 text-primary" /></div>
                      Manual de cancelamento imediato
                  </li>
                  <li className="flex items-center text-sm text-gray-300">
                      <div className="bg-primary/20 p-1 rounded-full mr-3"><Check className="w-3 h-3 text-primary" /></div>
                      Identificação de planos obsoletos
                  </li>
              </ul>

              <button
                  onClick={handlePaymentClick}
                  className="w-full py-5 rounded-lg font-bold text-base flex items-center justify-center transition-all transform active:scale-[0.98] bg-primary hover:bg-primary-hover text-white shadow-xl shadow-primary/25"
              >
                  <span className="mr-2">DESBLOQUEAR RELATÓRIO - R$ {PRICE.toFixed(2).replace('.', ',')}</span>
                  <ArrowRight className="w-5 h-5" />
              </button>

              <div className="mt-6 flex justify-center items-center space-x-2 text-gray-500">
                  <Lock className="w-3 h-3" />
                  <span className="text-[10px] uppercase tracking-widest font-mono">SECURE_PAYMENT_GATEWAY</span>
              </div>
          </div>

        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          analysisId={data.id}
          amount={PRICE}
          onClose={() => setShowPaymentModal(false)}
          onProcessing={() => {
            // O redirecionamento acontece dentro do modal
          }}
        />
      )}
    </>
  );
};

export default Preview;

