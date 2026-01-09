import React, { useState } from 'react';
import { X, Lock } from 'lucide-react';
import { User } from '../types';
import { authService } from '../services/authService';

interface LoginModalProps {
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  message?: string;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose, onLoginSuccess, message }) => {
  const [loading, setLoading] = useState<'google' | 'facebook' | null>(null);

  const handleLogin = async (provider: 'google' | 'facebook') => {
    setLoading(provider);
    try {
      let user;
      if (provider === 'google') {
        user = await authService.loginWithGoogle();
      } else {
        user = await authService.loginWithFacebook();
      }
      onLoginSuccess(user);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-surface border border-white/10 rounded-xl w-full max-w-md overflow-hidden shadow-2xl relative">
        
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 text-center">
          <div className="w-12 h-12 bg-surfaceHighlight border border-white/5 rounded-lg flex items-center justify-center mx-auto mb-6">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          
          <h2 className="text-xl font-bold text-white mb-2">
            {message || "Autenticação Necessária"}
          </h2>
          <p className="text-gray-500 text-sm mb-8">
            Faça login para salvar o histórico de análise e prosseguir com o pagamento seguro.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => handleLogin('google')}
              disabled={!!loading}
              className="w-full flex items-center justify-center space-x-3 bg-white hover:bg-gray-100 text-black font-medium py-3 px-4 rounded-lg transition-all text-sm"
            >
              {loading === 'google' ? (
                 <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span>Continuar com Google</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleLogin('facebook')}
              disabled={!!loading}
              className="w-full flex items-center justify-center space-x-3 bg-[#1877F2] hover:bg-[#1565D8] text-white font-medium py-3 px-4 rounded-lg transition-all text-sm"
            >
              {loading === 'facebook' ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span>Continuar com Facebook</span>
                </>
              )}
            </button>
          </div>
          
          <p className="mt-6 text-[10px] text-gray-600">
            Termos de uso e Política de Privacidade aplicáveis.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;