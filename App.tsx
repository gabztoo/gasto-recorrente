
import React, { useState, useEffect } from 'react';
import { AppView, AnalysisResult } from './types';
import Hero from './components/Hero';
import UploadSection from './components/UploadSection';
import Preview from './components/Preview';
import Dashboard from './components/Dashboard';
import { analyzeStatement } from './services/geminiService';
import { paymentService } from './services/paymentService';
import { Hexagon, CheckCircle, XCircle } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.LANDING);
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Verificar se há um relatório salvo na URL (hash routing)
  useEffect(() => {
    const checkSavedReport = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/report/')) {
        const reportId = hash.replace('#/report/', '');
        const savedReport = localStorage.getItem(`report_${reportId}`);
        if (savedReport) {
          try {
            const parsed = JSON.parse(savedReport);
            setAnalysisData(parsed);
            setView(AppView.DASHBOARD);
          } catch (e) {
            console.error('Erro ao carregar relatório:', e);
          }
        }
      }
    };
    
    checkSavedReport();
    window.addEventListener('hashchange', checkSavedReport);
    return () => window.removeEventListener('hashchange', checkSavedReport);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
        setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Tratamento de retorno do pagamento
  useEffect(() => {
    const paymentResult = paymentService.checkPaymentReturn();
    
    if (paymentResult.success) {
      const savedData = localStorage.getItem('subdetector_analysis_cache');
      
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          setAnalysisData(parsed);
          
          // Salvar relatório com ID único para acesso via URL
          localStorage.setItem(`report_${parsed.id}`, savedData);
          
          // Atualizar URL para o relatório
          window.location.hash = `#/report/${parsed.id}`;
          
          setView(AppView.DASHBOARD);
          
          // Mostrar notificação de sucesso
          const methodLabel = paymentResult.method === 'pix' ? 'PIX' : 
                             paymentResult.method === 'stripe' ? 'Cartão' : 'Pagamento';
          setNotification({ type: 'success', message: `${methodLabel} confirmado! Relatório desbloqueado.` });
          
          setTimeout(() => setNotification(null), 5000);
        } catch (e) {
          console.error("Erro ao recuperar dados salvos", e);
          setNotification({ type: 'error', message: 'Erro ao recuperar análise. Por favor, tente novamente.' });
          setTimeout(() => setNotification(null), 5000);
        }
      } else {
        setNotification({ type: 'error', message: 'Sessão expirada. Por favor, faça a análise novamente.' });
        setTimeout(() => setNotification(null), 5000);
      }
      
      // Limpar query params mas manter hash
      const currentHash = window.location.hash;
      window.history.replaceState({}, '', window.location.pathname + currentHash);
    }
    
    if (paymentResult.cancelled) {
      setNotification({ type: 'error', message: 'Pagamento cancelado. Tente novamente quando quiser.' });
      setTimeout(() => setNotification(null), 5000);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);


  const handleStart = () => {
    setView(AppView.UPLOAD);
  };

  const handleAnalyze = async (text: string) => {
    setIsAnalyzing(true);
    const result = await analyzeStatement(text);
    
    setAnalysisData(result);
    localStorage.setItem('subdetector_analysis_cache', JSON.stringify(result));
    
    setIsAnalyzing(false);
    setView(AppView.PREVIEW);
  };

  const handlePaymentSuccess = () => {
    if (analysisData) {
      // Salvar relatório com ID único
      localStorage.setItem(`report_${analysisData.id}`, JSON.stringify(analysisData));
      window.location.hash = `#/report/${analysisData.id}`;
      setView(AppView.DASHBOARD);
    }
  };

  const handleReset = () => {
    setAnalysisData(null);
    window.location.hash = '';
    setView(AppView.UPLOAD);
  };

  const goHome = () => {
    setAnalysisData(null);
    window.location.hash = '';
    setView(AppView.LANDING);
  }

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-primary/30 selection:text-white">
      
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-20 right-4 z-[100] flex items-center space-x-3 px-5 py-4 rounded-lg shadow-2xl border animate-slide-in
          ${notification.type === 'success' 
            ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' 
            : 'bg-red-500/20 border-red-500/30 text-red-400'
          }`}
        >
          {notification.type === 'success' 
            ? <CheckCircle className="w-5 h-5" /> 
            : <XCircle className="w-5 h-5" />
          }
          <span className="text-sm font-medium">{notification.message}</span>
          <button 
            onClick={() => setNotification(null)} 
            className="ml-2 opacity-60 hover:opacity-100"
          >
            ×
          </button>
        </div>
      )}
      
      {/* Tech Navbar - Simplificado, sem login */}
      <nav className={`fixed w-full z-50 transition-all duration-200 border-b ${scrolled ? 'bg-background/90 border-white/10 backdrop-blur-md py-3' : 'bg-transparent border-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex-shrink-0 flex items-center cursor-pointer group" onClick={goHome}>
              <div className="mr-3 p-1.5 bg-white text-black rounded-lg">
                  <Hexagon className="w-5 h-5 fill-current" />
              </div>
              <span className="font-bold text-lg text-white tracking-tight">Gasto<span className="text-gray-400">Recorrente</span></span>
            </div>
            
            {/* Área direita vazia por enquanto - pode adicionar links futuramente */}
            <div className="flex items-center space-x-4">
              {view === AppView.DASHBOARD && analysisData && (
                <div className="text-xs font-mono text-gray-500 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                  ID: {analysisData.id.substring(0, 8)}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow pt-24">
        {view === AppView.LANDING && <Hero onStart={handleStart} />}
        
        {view === AppView.UPLOAD && (
          <UploadSection onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
        )}

        {view === AppView.PREVIEW && analysisData && (
          <Preview 
            data={analysisData} 
            onPaymentSuccess={handlePaymentSuccess}
          />
        )}

        {view === AppView.DASHBOARD && analysisData && (
          <Dashboard 
            currentAnalysis={analysisData} 
            onReset={handleReset} 
          />
        )}
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-white/5 py-8 mt-10">
         <div className="max-w-7xl mx-auto px-4 text-center flex flex-col md:flex-row justify-between items-center text-xs text-gray-600 font-mono">
            <p>&copy; {new Date().getFullYear()} Gasto Recorrente Systems.</p>
            <div className="mt-2 md:mt-0 space-x-6">
               <span className="hover:text-gray-300 cursor-pointer">TERMS_OF_SVC</span>
               <span className="hover:text-gray-300 cursor-pointer">PRIVACY_POLICY</span>
               <span className="hover:text-gray-300 cursor-pointer">STATUS</span>
            </div>
         </div>
      </footer>
    </div>
  );
};

export default App;
