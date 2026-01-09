
import React, { useState, useEffect } from 'react';
import { AppView, AnalysisResult, User } from './types';
import Hero from './components/Hero';
import UploadSection from './components/UploadSection';
import Preview from './components/Preview';
import Dashboard from './components/Dashboard';
import LoginModal from './components/LoginModal';
import { analyzeStatement } from './services/geminiService';
import { authService } from './services/authService';
import { historyService } from './services/historyService';
import { paymentService } from './services/paymentService';
import { LayoutDashboard, LogOut, User as UserIcon, Hexagon, CheckCircle, XCircle } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.LANDING);
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    
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
      const currentUser = authService.getCurrentUser();
      const savedData = localStorage.getItem('subdetector_analysis_cache');
      
      console.log('Payment return detected:', { currentUser: !!currentUser, savedData: !!savedData });
      
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          setAnalysisData(parsed);
          
          if (currentUser) {
            setUser(currentUser);
            historyService.saveToHistory(currentUser.id, parsed);
          }
          
          setView(AppView.DASHBOARD);
          
          // Mostrar notificação de sucesso
          const methodLabel = paymentResult.method === 'pix' ? 'PIX' : 
                             paymentResult.method === 'stripe' ? 'Cartão' : 'Pagamento';
          setNotification({ type: 'success', message: `${methodLabel} confirmado! Relatório desbloqueado.` });
          
          // Limpar notificação após 5 segundos
          setTimeout(() => setNotification(null), 5000);
        } catch (e) {
          console.error("Erro ao recuperar dados salvos", e);
          setNotification({ type: 'error', message: 'Erro ao recuperar análise. Por favor, tente novamente.' });
          setTimeout(() => setNotification(null), 5000);
        }
      } else {
        console.warn('Nenhuma análise encontrada no cache');
        setNotification({ type: 'error', message: 'Sessão expirada. Por favor, faça a análise novamente.' });
        setTimeout(() => setNotification(null), 5000);
      }
      
      // Limpar dados de pagamento pendente e URL
      paymentService.clearPendingPayment();
      window.history.replaceState({}, '', window.location.pathname);
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

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    setShowLoginModal(false);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setView(AppView.LANDING);
  };

  const handlePaymentSuccess = () => {
    if (user && analysisData) {
      historyService.saveToHistory(user.id, analysisData);
      setView(AppView.DASHBOARD);
    }
  };

  const handleHistorySelect = (historyItem: AnalysisResult) => {
    setAnalysisData(historyItem);
  };

  const handleReset = () => {
    setAnalysisData(null);
    setView(AppView.UPLOAD);
  };

  const goHome = () => {
    setAnalysisData(null);
    setView(AppView.LANDING);
  }

  const handleGoToHistory = () => {
    if (user) {
      const history = historyService.getHistory(user.id);
      if (history.length > 0) {
        // Carrega a análise mais recente
        setAnalysisData(history[0]);
        setView(AppView.DASHBOARD);
      }
    }
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
      
      {/* Tech Navbar */}
      <nav className={`fixed w-full z-50 transition-all duration-200 border-b ${scrolled ? 'bg-background/90 border-white/10 backdrop-blur-md py-3' : 'bg-transparent border-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex-shrink-0 flex items-center cursor-pointer group" onClick={goHome}>
              <div className="mr-3 p-1.5 bg-white text-black rounded-lg">
                  <Hexagon className="w-5 h-5 fill-current" />
              </div>
              <span className="font-bold text-lg text-white tracking-tight">Gasto<span className="text-gray-400">Recorrente</span></span>
            </div>
            
            <div className="flex items-center space-x-4">
               {user ? (
                 <div className="flex items-center space-x-4">
                   {/* Botão de acesso ao histórico */}
                   {historyService.getHistory(user.id).length > 0 && view !== AppView.DASHBOARD && (
                     <button 
                       onClick={handleGoToHistory}
                       className="flex items-center text-sm font-medium text-gray-400 hover:text-primary transition-colors"
                       title="Meu Histórico"
                     >
                       <LayoutDashboard className="w-4 h-4 mr-1" />
                       <span className="hidden sm:inline">Histórico</span>
                     </button>
                   )}
                   <div className="hidden md:flex flex-col text-right">
                      <span className="text-[10px] text-gray-500 font-mono uppercase">User Session</span>
                      <span className="text-sm font-semibold text-white leading-none">{user.name}</span>
                   </div>
                   <div className="relative">
                       <img src={user.avatar} className="h-8 w-8 rounded-full border border-white/10 grayscale hover:grayscale-0 transition-all" alt="Avatar" />
                   </div>
                   <button onClick={handleLogout} className="text-gray-500 hover:text-white transition-colors" title="Sair">
                      <LogOut className="w-5 h-5" />
                   </button>
                 </div>
               ) : (
                 view !== AppView.LANDING && (
                    <button 
                      onClick={() => setShowLoginModal(true)}
                      className="text-sm font-medium text-white hover:text-primary transition-colors flex items-center"
                    >
                      <UserIcon className="w-4 h-4 mr-2" />
                      Entrar
                    </button>
                 )
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
            user={user}
            onRequireLogin={() => setShowLoginModal(true)}
            onPaymentSuccess={handlePaymentSuccess}
          />
        )}

        {view === AppView.DASHBOARD && analysisData && (
          <Dashboard 
            currentAnalysis={analysisData} 
            user={user}
            onReset={handleReset} 
            onSelectHistory={handleHistorySelect}
          />
        )}
      </main>

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal 
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

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
