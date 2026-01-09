import React, { useState, useEffect } from 'react';
import { AnalysisResult, SubscriptionItem, User } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { 
  Download, ExternalLink, Calendar, CreditCard, History, ChevronRight, 
  PlayCircle, AppWindow, Dumbbell, Gamepad2, Cloud, Zap, 
  Clapperboard, Music, Car, Utensils, ShoppingCart, PenTool, Bot, HardDrive, Smartphone,
  GraduationCap, Wifi, Shield, Cpu, Globe
} from 'lucide-react';
import { historyService } from '../services/historyService';

interface DashboardProps {
  currentAnalysis: AnalysisResult;
  user: User;
  onReset: () => void;
  onSelectHistory: (analysis: AnalysisResult) => void;
}

// Adjusted Palette for "Technical" Look (Less Neon)
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];

const Dashboard: React.FC<DashboardProps> = ({ currentAnalysis, user, onReset, onSelectHistory }) => {
  const [history, setHistory] = useState<AnalysisResult[]>([]);

  useEffect(() => {
    if (user) {
      setHistory(historyService.getHistory(user.id));
    }
  }, [user, currentAnalysis]);

  // Aggregate data for chart
  const categoryData = currentAnalysis.items.reduce((acc, item) => {
    const existing = acc.find(c => c.name === item.category);
    if (existing) {
      existing.value += item.monthlyCost;
    } else {
      acc.push({ name: item.category, value: item.monthlyCost });
    }
    return acc;
  }, [] as { name: string, value: number }[])
  .filter(item => {
    if (item.name === 'Outros' || item.name === 'Other') {
        return (item.value / currentAnalysis.totalMonthly) > 0.05;
    }
    return true;
  });

  const formatCurrency = (val: number) => 
    val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const formatDate = (isoStr: string) => {
      return new Date(isoStr).toLocaleDateString('pt-BR', {
          day: '2-digit', month: '2-digit', year: 'numeric'
      });
  }

  // Styles Updated to be less "Glowy" and more "Flat/Clean"
  const getServiceStyles = (name: string, category: string) => {
    const n = name.toLowerCase();
    const c = category.toLowerCase();

    // 1. Match Específico
    if (n.includes('netflix') || n.includes('hbo') || n.includes('disney') || n.includes('prime video')) {
        return { icon: <Clapperboard className="w-5 h-5" />, style: "bg-red-500/10 text-red-400 border-red-500/20" };
    }
    if (n.includes('spotify') || n.includes('deezer') || n.includes('apple music') || n.includes('youtube music')) {
        return { icon: <Music className="w-5 h-5" />, style: "bg-green-500/10 text-green-400 border-green-500/20" };
    }
    if (n.includes('uber') || n.includes('99') || n.includes('cabify')) {
        return { icon: <Car className="w-5 h-5" />, style: "bg-zinc-700/30 text-gray-300 border-zinc-600/30" };
    }
    if (n.includes('ifood') || n.includes('rappi') || n.includes('zê delivery')) {
        return { icon: <Utensils className="w-5 h-5" />, style: "bg-red-500/10 text-red-400 border-red-500/20" };
    }
    if (n.includes('amazon') || n.includes('mercadolivre') || n.includes('shopee') || n.includes('magalu')) {
        return { icon: <ShoppingCart className="w-5 h-5" />, style: "bg-orange-500/10 text-orange-400 border-orange-500/20" };
    }
    if (n.includes('adobe') || n.includes('figma') || n.includes('canva') || n.includes('photoshop')) {
        return { icon: <PenTool className="w-5 h-5" />, style: "bg-purple-500/10 text-purple-400 border-purple-500/20" };
    }
    if (n.includes('chatgpt') || n.includes('openai') || n.includes('midjourney') || n.includes('claude')) {
        return { icon: <Bot className="w-5 h-5" />, style: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" };
    }
    if (n.includes('google') || n.includes('drive') || n.includes('storage') || n.includes('icloud') || n.includes('aws')) {
        return { icon: <HardDrive className="w-5 h-5" />, style: "bg-blue-500/10 text-blue-400 border-blue-500/20" };
    }
    if (n.includes('tinder') || n.includes('bumble') || n.includes('badoo')) {
        return { icon: <Smartphone className="w-5 h-5" />, style: "bg-pink-500/10 text-pink-400 border-pink-500/20" };
    }
    if (n.includes('microsoft') || n.includes('office') || n.includes('365')) {
         return { icon: <AppWindow className="w-5 h-5" />, style: "bg-blue-600/10 text-blue-500 border-blue-600/20" };
    }
    
    // Default Fallback
    return {
      icon: <Zap className="w-5 h-5" />,
      style: "bg-surfaceHighlight text-gray-400 border-white/10"
    };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-20 flex flex-col lg:flex-row gap-8">
      
      {/* Sidebar */}
      <div className="lg:w-1/4 w-full">
         <div className="tech-panel rounded-xl p-6 h-auto lg:h-full lg:min-h-[500px]">
            <div className="flex items-center space-x-3 mb-6">
                <div className="relative">
                    <img src={user.avatar} alt={user.name} className="relative w-10 h-10 rounded-full border border-white/10 object-cover grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all" />
                </div>
                <div>
                    <h3 className="text-white font-semibold text-sm">{user.name}</h3>
                    <div className="flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mr-1.5"></span>
                        <p className="text-gray-500 text-[10px] font-mono uppercase">Plano Premium</p>
                    </div>
                </div>
            </div>

            <div className="h-px bg-white/5 my-6"></div>
            
            <h4 className="text-gray-500 text-[10px] font-mono font-bold uppercase tracking-widest mb-4 flex items-center">
                <History className="w-3 h-3 mr-2" /> Histórico
            </h4>

            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
                {history.map((h) => (
                    <div 
                        key={h.id}
                        onClick={() => onSelectHistory(h)}
                        className={`p-3 rounded-lg cursor-pointer border transition-all duration-200 group
                            ${h.id === currentAnalysis.id 
                                ? 'bg-primary/10 border-primary/30' 
                                : 'bg-transparent border-transparent hover:bg-surfaceHighlight'}`}
                    >
                        <div className="flex justify-between items-center mb-1">
                            <span className={`text-xs font-semibold ${h.id === currentAnalysis.id ? 'text-primary' : 'text-gray-400'}`}>
                                {formatDate(h.date)}
                            </span>
                            {h.id === currentAnalysis.id && <ChevronRight className="w-3 h-3 text-primary" />}
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-gray-600">
                            <span>{h.subscriptionCount} assinaturas</span>
                            <span>{formatCurrency(h.totalMonthly)}</span>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="h-px bg-white/5 my-6"></div>
            
            <button onClick={onReset} className="w-full py-2 bg-surfaceHighlight hover:bg-white/10 text-white rounded-lg border border-white/10 transition-colors text-xs font-semibold uppercase tracking-wide">
                + Novo Escaneamento
            </button>
         </div>
      </div>

      {/* Main Content */}
      <div className="lg:w-3/4 w-full">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">Gestão de Assinaturas</h1>
              <p className="text-gray-500 text-xs font-mono">
                  ID: {currentAnalysis.id} • Processado em: {formatDate(currentAnalysis.date)}
              </p>
            </div>
            <div>
                <button className="flex items-center px-4 py-2 bg-white text-black hover:bg-gray-200 rounded-lg text-sm font-semibold transition-colors">
                    <Download className="w-4 h-4 mr-2" /> Exportar Relatório
                </button>
            </div>
          </div>

          {/* KPI Cards - Solid, clean */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-surface border border-white/10 p-5 rounded-lg">
                <span className="text-gray-500 text-[10px] font-mono uppercase tracking-wider block mb-2">Custo Mensal (SaaS)</span>
                <p className="text-2xl font-bold text-white tracking-tight">{formatCurrency(currentAnalysis.totalMonthly)}</p>
            </div>
            
            <div className="bg-surface border border-white/10 p-5 rounded-lg">
                <span className="text-gray-500 text-[10px] font-mono uppercase tracking-wider block mb-2">Custo Anualizado</span>
                <p className="text-2xl font-bold text-white tracking-tight">{formatCurrency(currentAnalysis.totalAnnual)}</p>
            </div>

            <div className="bg-surface border border-white/10 p-5 rounded-lg">
                <span className="text-gray-500 text-[10px] font-mono uppercase tracking-wider block mb-2">Assinaturas Ativas</span>
                <div className="flex items-baseline">
                    <p className="text-2xl font-bold text-white tracking-tight">{currentAnalysis.subscriptionCount}</p>
                    <span className="ml-2 text-[10px] text-primary font-medium bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">Recorrentes</span>
                </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* Chart Section */}
            <div className="xl:col-span-1 tech-panel rounded-xl p-6 h-min">
                <h3 className="text-sm font-semibold text-white mb-6">Distribuição por Categoria</h3>
                <div className="h-64 w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="#09090b"
                        strokeWidth={2}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px' }}
                        itemStyle={{ color: '#fff' }}
                        formatter={(value: number) => formatCurrency(value)}
                        cursor={false}
                      />
                      <Legend 
                        verticalAlign="bottom" 
                        height={36} 
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: '10px', opacity: 0.6 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
            </div>

            {/* List Section */}
            <div className="xl:col-span-2 space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-white">Detalhamento dos Serviços</h3>
                </div>
                
                <div className="space-y-2">
                  {currentAnalysis.items.map((item, idx) => {
                    const { icon, style } = getServiceStyles(item.name, item.category);
                    
                    return (
                        <div key={idx} className="bg-surface border border-white/5 p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between hover:border-primary/30 transition-colors group">
                            
                            <div className="flex items-center space-x-4 mb-3 sm:mb-0">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${style}`}>
                                    {icon}
                                </div>
                                
                                <div>
                                    <h4 className="font-medium text-white text-sm leading-tight">{item.name}</h4>
                                    <span className="text-[10px] text-gray-500 font-mono mt-0.5 block">
                                        {item.category.toUpperCase()}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end sm:space-x-8 w-full sm:w-auto pl-14 sm:pl-0">
                                <div className="text-right">
                                    <p className="font-semibold text-white text-sm">{formatCurrency(item.monthlyCost)}</p>
                                    <p className="text-[10px] text-gray-500 uppercase">Mensal</p>
                                </div>
                                
                                <button 
                                  className="text-gray-600 hover:text-white transition-colors p-2"
                                  title="Detalhes da Cobrança"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    );
                  })}
                </div>
            </div>

          </div>
      </div>
    </div>
  );
};

export default Dashboard;