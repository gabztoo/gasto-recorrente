
import React, { useState, useEffect } from 'react';
import { AppView, AnalysisResult } from './types';
import Hero from './components/Hero';
import Preview from './components/Preview';
import Dashboard from './components/Dashboard';
import { analyzeStatement } from './services/geminiService';
import { paymentService } from './services/paymentService';
import { generateDemoData } from './services/demoData';
import { Hexagon, CheckCircle, XCircle, ScanLine, Tv, Cloud, Gamepad2, Dumbbell, CreditCard } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.LANDING);
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);


  // Estado para animação de análise
  const [analyzingProgress, setAnalyzingProgress] = useState<string[]>([]);

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

      const currentHash = window.location.hash;
      window.history.replaceState({}, '', window.location.pathname + currentHash);
    }

    if (paymentResult.cancelled) {
      setNotification({ type: 'error', message: 'Pagamento cancelado. Tente novamente quando quiser.' });
      setTimeout(() => setNotification(null), 5000);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Análise com animação de progresso
  const handleAnalyze = async (text: string) => {
    setIsAnalyzing(true);
    setIsDemo(false);
    setAnalyzingProgress([]);

    // Simular progresso enquanto analisa
    const progressMessages = [
      'Lendo extrato...',
      'Identificando transações...',
      'Buscando padrões recorrentes...',
      'Categorizando serviços...',
      'Calculando custos anuais...',
      'Finalizando análise...'
    ];

    let progressIndex = 0;
    const progressInterval = setInterval(() => {
      if (progressIndex < progressMessages.length) {
        setAnalyzingProgress(prev => [...prev, progressMessages[progressIndex]]);
        progressIndex++;
      }
    }, 800);

    const result = await analyzeStatement(text);

    clearInterval(progressInterval);

    setAnalysisData(result);
    localStorage.setItem('subdetector_analysis_cache', JSON.stringify(result));

    setIsAnalyzing(false);
    setAnalyzingProgress([]);
    setView(AppView.PREVIEW);
  };

  // Carregar demo
  const handleDemo = () => {
    const demoData = generateDemoData();
    setAnalysisData(demoData);
    setIsDemo(true);
    setView(AppView.DASHBOARD);
    setNotification({ type: 'success', message: 'Modo demonstração - dados fictícios' });
    setTimeout(() => setNotification(null), 3000);
  };

  const handlePaymentSuccess = () => {
    if (analysisData) {
      localStorage.setItem(`report_${analysisData.id}`, JSON.stringify(analysisData));
      window.location.hash = `#/report/${analysisData.id}`;
      setView(AppView.DASHBOARD);
    }
  };

  const handleReset = () => {
    setAnalysisData(null);
    setIsDemo(false);
    window.location.hash = '';
    setView(AppView.LANDING);
  };

  const goHome = () => {
    setAnalysisData(null);
    setIsDemo(false);
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

      {/* Navbar */}
      <nav className={`fixed w-full z-50 transition-all duration-200 border-b ${scrolled ? 'bg-background/90 border-white/10 backdrop-blur-md py-3' : 'bg-transparent border-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex-shrink-0 flex items-center cursor-pointer group" onClick={goHome}>
              <img
                src="/logo.png"
                alt="Gasto Recorrente"
                className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </div>

            <div className="flex items-center space-x-4">
              {view === AppView.DASHBOARD && analysisData && (
                <div className="flex items-center gap-2">
                  {isDemo && (
                    <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
                      DEMO
                    </span>
                  )}
                  <div className="text-xs font-mono text-gray-500 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                    ID: {analysisData.id.substring(0, 8)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow pt-24">

        {/* Landing com Upload integrado */}
        {view === AppView.LANDING && !isAnalyzing && (
          <Hero
            onAnalyze={handleAnalyze}
            onDemo={handleDemo}
            isAnalyzing={isAnalyzing}
          />
        )}

        {/* Tela de Análise em Progresso */}
        {isAnalyzing && (
          <div className="max-w-2xl mx-auto px-4 py-20 text-center">
            <div className="mb-8">
              <div className="w-20 h-20 mx-auto mb-6 relative">
                <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <ScanLine className="absolute inset-0 m-auto w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Analisando seu extrato...</h2>
              <p className="text-gray-400">Nossa IA está identificando suas assinaturas</p>
            </div>

            {/* Progress Messages */}
            <div className="space-y-2 text-left max-w-md mx-auto">
              {analyzingProgress.map((msg, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 text-sm text-gray-400 animate-fade-in"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{msg}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Preview/Paywall */}
        {view === AppView.PREVIEW && analysisData && (
          <Preview
            data={analysisData}
            onPaymentSuccess={handlePaymentSuccess}
          />
        )}

        {/* Dashboard */}
        {view === AppView.DASHBOARD && analysisData && (
          <Dashboard
            currentAnalysis={analysisData}
            onReset={handleReset}
          />
        )}
      </main>

      {/* Footer */}
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
