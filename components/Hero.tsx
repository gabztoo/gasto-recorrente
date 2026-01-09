
import React from 'react';
import { ArrowRight, ShieldCheck, Search, Repeat, History } from 'lucide-react';

interface HeroProps {
  onStart: () => void;
}

const Hero: React.FC<HeroProps> = ({ onStart }) => {
  return (
    <div className="relative pt-16 pb-24">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        
        {/* Top Badge - Technical Style */}
        <div className="flex justify-center mb-8">
          <div className="bg-surface/50 border border-primary/20 backdrop-blur-sm px-4 py-1.5 rounded-full flex items-center space-x-3">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-xs font-mono font-medium text-primary tracking-wide">GASTO_RECORRENTE // ACTIVE</span>
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-tight max-w-5xl">
          Detector de Assinaturas <br className="hidden md:block"/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-light">
            & Custos Recorrentes
          </span>
        </h1>

        <p className="max-w-2xl text-lg text-gray-400 mb-10 leading-relaxed">
          O Gasto Recorrente analisa padrões em faturas para identificar vazamentos financeiros recorrentes com precisão de IA.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mb-20 w-full justify-center">
          <button
            onClick={onStart}
            className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white transition-all duration-200 bg-primary hover:bg-primary-hover rounded-lg shadow-lg shadow-primary/20 overflow-hidden"
          >
            <span className="relative flex items-center">
              Escanear Agora
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
          
          <div className="flex items-center space-x-2 text-gray-400 text-sm px-6 py-4 border border-white/5 bg-surface/30 rounded-lg">
            <ShieldCheck className="w-4 h-4 text-gray-300" />
            <span>Processamento Local e Seguro</span>
          </div>
        </div>

        {/* Feature Grid - Specific to Subscriptions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full max-w-6xl">
          
          <div className="tech-panel-highlight p-6 rounded-xl hover:border-primary/30 transition-all group bg-surface/40">
            <div className="w-10 h-10 bg-surfaceHighlight rounded-lg border border-white/5 flex items-center justify-center mb-4 group-hover:border-primary/30 transition-colors">
              <Search className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
            </div>
            <h3 className="font-semibold text-white text-lg mb-2">Busca Profunda</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Detecta nomes comerciais complexos (ex: "Google *Gsuite", "Amzn Digital", "PAG* Spotify").
            </p>
          </div>
          
          <div className="tech-panel-highlight p-6 rounded-xl hover:border-primary/30 transition-all group bg-surface/40">
            <div className="w-10 h-10 bg-surfaceHighlight rounded-lg border border-white/5 flex items-center justify-center mb-4 group-hover:border-primary/30 transition-colors">
              <Repeat className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
            </div>
            <h3 className="font-semibold text-white text-lg mb-2">Análise de Recorrência</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Diferencia compras únicas de assinaturas mensais ou anuais com base em padrões temporais.
            </p>
          </div>

          <div className="tech-panel-highlight p-6 rounded-xl hover:border-primary/30 transition-all group bg-surface/40">
            <div className="w-10 h-10 bg-surfaceHighlight rounded-lg border border-white/5 flex items-center justify-center mb-4 group-hover:border-primary/30 transition-colors">
              <History className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
            </div>
            <h3 className="font-semibold text-white text-lg mb-2">Assinaturas Fantasmas</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Identifica serviços esquecidos que continuam cobrando pequenos valores mensalmente.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Hero;
