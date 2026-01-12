import React, { useRef, useState } from 'react';
import { AnalysisResult, SubscriptionItem } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { 
  Download, ExternalLink, Share2, Copy, Check,
  RefreshCw, TrendingDown
} from 'lucide-react';
import ServiceIcon from './ServiceIcon';
import AlternativesPanel from './AlternativesPanel';

interface DashboardProps {
  currentAnalysis: AnalysisResult;
  onReset: () => void;
}

// Adjusted Palette for "Technical" Look (Less Neon)
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];

const Dashboard: React.FC<DashboardProps> = ({ currentAnalysis, onReset }) => {
  const [copied, setCopied] = useState(false);
  const [selectedService, setSelectedService] = useState<{name: string; cost: number} | null>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);

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

  // Copiar link do relatório
  const copyReportLink = () => {
    const url = `${window.location.origin}${window.location.pathname}#/report/${currentAnalysis.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Exportar como texto/PDF simples
  const exportAsText = () => {
    const lines = [
      '═══════════════════════════════════════════════════════════',
      '         RELATÓRIO DE GASTOS RECORRENTES',
      '═══════════════════════════════════════════════════════════',
      '',
      `Data: ${formatDate(currentAnalysis.date)}`,
      `ID do Relatório: ${currentAnalysis.id}`,
      '',
      '───────────────────────────────────────────────────────────',
      '                      RESUMO',
      '───────────────────────────────────────────────────────────',
      '',
      `Total de Assinaturas: ${currentAnalysis.subscriptionCount}`,
      `Custo Mensal: ${formatCurrency(currentAnalysis.totalMonthly)}`,
      `Custo Anual: ${formatCurrency(currentAnalysis.totalAnnual)}`,
      '',
      '───────────────────────────────────────────────────────────',
      '                 DETALHAMENTO',
      '───────────────────────────────────────────────────────────',
      '',
      ...currentAnalysis.items.map((item, idx) => 
        `${idx + 1}. ${item.name}\n   Categoria: ${item.category}\n   Valor Mensal: ${formatCurrency(item.monthlyCost)}\n   Valor Anual: ${formatCurrency(item.annualCost)}\n`
      ),
      '',
      '───────────────────────────────────────────────────────────',
      '              POR CATEGORIA',
      '───────────────────────────────────────────────────────────',
      '',
      ...categoryData.map(cat => `${cat.name}: ${formatCurrency(cat.value)}/mês`),
      '',
      '═══════════════════════════════════════════════════════════',
      '        Gerado por GastoRecorrente',
      `        ${window.location.origin}`,
      '═══════════════════════════════════════════════════════════',
    ];
    
    const text = lines.join('\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-gastos-${currentAnalysis.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };



  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-20" ref={dashboardRef}>
      
      {/* Header com ações */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Gestão de Assinaturas</h1>
          <p className="text-gray-500 text-xs font-mono">
              ID: {currentAnalysis.id} • Processado em: {formatDate(currentAnalysis.date)}
          </p>
        </div>
        <div className="flex items-center gap-3">
            {/* Botão Novo Escaneamento */}
            <button 
              onClick={onReset}
              className="flex items-center px-4 py-2 bg-surfaceHighlight hover:bg-white/10 text-white rounded-lg text-sm font-medium transition-colors border border-white/10"
            >
                <RefreshCw className="w-4 h-4 mr-2" /> Nova Análise
            </button>
            
            {/* Botão Exportar */}
            <button 
              onClick={exportAsText}
              className="flex items-center px-4 py-2 bg-white text-black hover:bg-gray-200 rounded-lg text-sm font-semibold transition-colors"
            >
                <Download className="w-4 h-4 mr-2" /> Baixar Relatório
            </button>
        </div>
      </div>

      {/* Share Link Bar */}
      <div className="bg-surface border border-white/10 rounded-lg p-4 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/20 rounded-lg">
            <Share2 className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-mono uppercase">Link do seu relatório</p>
            <p className="text-sm text-white font-mono truncate max-w-[300px] sm:max-w-[400px]">
              {`${window.location.origin}/#/report/${currentAnalysis.id}`}
            </p>
          </div>
        </div>
        <button 
          onClick={copyReportLink}
          className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
            copied 
              ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' 
              : 'bg-surfaceHighlight border-white/10 text-white hover:bg-white/10'
          }`}
        >
          {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
          {copied ? 'Copiado!' : 'Copiar Link'}
        </button>
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
              {currentAnalysis.items.map((item, idx) => (
                    <div key={idx} className="bg-surface border border-white/5 p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between hover:border-primary/30 transition-colors group">
                        
                        <div className="flex items-center space-x-4 mb-3 sm:mb-0">
                            <ServiceIcon serviceName={item.name} category={item.category} size="md" />
                            
                            <div>
                                <h4 className="font-medium text-white text-sm leading-tight">{item.name}</h4>
                                <span className="text-[10px] text-gray-500 font-mono mt-0.5 block">
                                    {item.category.toUpperCase()}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end sm:space-x-4 w-full sm:w-auto pl-14 sm:pl-0">
                            <div className="text-right">
                                <p className="font-semibold text-white text-sm">{formatCurrency(item.monthlyCost)}</p>
                                <p className="text-[10px] text-gray-500 uppercase">Mensal</p>
                            </div>
                            
                            <button 
                              onClick={() => setSelectedService({name: item.name, cost: item.monthlyCost})}
                              className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg border border-emerald-500/20 transition-colors"
                              title="Ver como economizar"
                            >
                                <TrendingDown className="w-3 h-3" />
                                <span className="hidden sm:inline">Economizar</span>
                            </button>
                        </div>
                    </div>
              ))}
            </div>
        </div>

      </div>
      
      {/* Modal de Alternativas */}
      {selectedService && (
        <AlternativesPanel 
          serviceName={selectedService.name}
          monthlyCost={selectedService.cost}
          onClose={() => setSelectedService(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;