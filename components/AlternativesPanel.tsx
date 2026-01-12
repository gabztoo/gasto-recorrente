import React from 'react';
import { X, ExternalLink, Lightbulb, DollarSign, Gift, TrendingDown } from 'lucide-react';
import { getAlternatives, getAlternativeStyle, getAlternativeLabel, Alternative } from '../services/alternativesService';

interface AlternativesPanelProps {
  serviceName: string;
  monthlyCost: number;
  onClose: () => void;
}

const AlternativesPanel: React.FC<AlternativesPanelProps> = ({ serviceName, monthlyCost, onClose }) => {
  const alternatives = getAlternatives(serviceName);
  
  // Calcular economia potencial
  const monthlySaving = monthlyCost; // Se cancelar, economiza 100%
  const annualSaving = monthlyCost * 12;

  const getIcon = (type: Alternative['type']) => {
    switch (type) {
      case 'free': return <Gift className="w-4 h-4" />;
      case 'cheaper': return <DollarSign className="w-4 h-4" />;
      case 'tip': return <Lightbulb className="w-4 h-4" />;
    }
  };

  const formatCurrency = (val: number) => 
    val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-white/10 rounded-xl max-w-md w-full shadow-2xl animate-fade-in">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div>
            <h3 className="text-lg font-semibold text-white">Alternativas para cancelar</h3>
            <p className="text-sm text-gray-400">{serviceName}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Savings Summary */}
        <div className="p-4 bg-emerald-500/10 border-b border-emerald-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <TrendingDown className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-emerald-400/80 font-mono uppercase">Economia ao cancelar</p>
              <div className="flex items-baseline gap-3">
                <span className="text-xl font-bold text-emerald-400">{formatCurrency(monthlySaving)}/mês</span>
                <span className="text-sm text-emerald-400/60">({formatCurrency(annualSaving)}/ano)</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Alternatives List */}
        <div className="p-4 space-y-3 max-h-[350px] overflow-y-auto">
          {alternatives.map((alt, idx) => (
            <div 
              key={idx}
              className="bg-surfaceHighlight border border-white/5 rounded-lg p-4 hover:border-white/10 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg border ${getAlternativeStyle(alt.type)}`}>
                  {getIcon(alt.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-white">{alt.name}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${getAlternativeStyle(alt.type)}`}>
                      {getAlternativeLabel(alt.type)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">{alt.description}</p>
                  {alt.url && (
                    <a 
                      href={alt.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary-light mt-2 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Acessar {alt.name}
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-surfaceHighlight/50 rounded-b-xl">
          <p className="text-xs text-gray-500 text-center">
            💡 Cancelando este serviço você economiza <span className="text-emerald-400 font-semibold">{formatCurrency(annualSaving)}</span> por ano
          </p>
        </div>
      </div>
    </div>
  );
};

export default AlternativesPanel;
