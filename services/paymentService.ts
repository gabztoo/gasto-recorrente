// Serviço de Pagamento - Stripe Payment Links + AbacatePay (PIX)
// Configuração híbrida: Stripe via link direto, AbacatePay via API

const STRIPE_PAYMENT_LINK = import.meta.env.VITE_STRIPE_PAYMENT_LINK || '';

export type PaymentMethod = 'stripe' | 'pix';

export interface PaymentConfig {
  analysisId: string;
  amount: number;
  description: string;
}

const getReturnUrl = () => {
  return `${window.location.origin}${window.location.pathname}`;
};

export const paymentService = {
  /**
   * Salva os dados da análise antes do redirecionamento
   */
  preparePayment: (analysisId: string) => {
    localStorage.setItem('pending_payment_analysis', analysisId);
    localStorage.setItem('pending_payment_timestamp', Date.now().toString());
  },

  /**
   * Redireciona para Stripe Checkout via Payment Link
   */
  redirectToStripe: (analysisId: string) => {
    paymentService.preparePayment(analysisId);
    
    if (!STRIPE_PAYMENT_LINK) {
      console.error('VITE_STRIPE_PAYMENT_LINK não configurado');
      paymentService.simulatePaymentSuccess();
      return;
    }

    window.location.href = STRIPE_PAYMENT_LINK;
  },

  /**
   * Cria cobrança no AbacatePay e redireciona para pagamento PIX
   */
  redirectToAbacatePay: async (analysisId: string) => {
    paymentService.preparePayment(analysisId);
    
    try {
      // Chama a API Route para criar a cobrança
      const response = await fetch('/api/create-billing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ analysisId })
      });

      const data = await response.json();

      if (data.error) {
        console.error('Erro ao criar cobrança:', data.error);
        // Fallback para simulação em desenvolvimento
        if (import.meta.env.DEV) {
          paymentService.simulatePaymentSuccess();
        }
        return;
      }

      if (data.paymentUrl) {
        // Redireciona para a página de pagamento do AbacatePay
        window.location.href = data.paymentUrl;
      } else {
        console.error('URL de pagamento não retornada');
        if (import.meta.env.DEV) {
          paymentService.simulatePaymentSuccess();
        }
      }
    } catch (error) {
      console.error('Erro ao criar cobrança:', error);
      // Fallback para simulação em desenvolvimento
      if (import.meta.env.DEV) {
        paymentService.simulatePaymentSuccess();
      }
    }
  },

  /**
   * Alias para manter compatibilidade - usa AbacatePay
   */
  redirectToMercadoPago: (analysisId: string) => {
    return paymentService.redirectToAbacatePay(analysisId);
  },

  /**
   * Simula pagamento bem-sucedido (para desenvolvimento/teste)
   */
  simulatePaymentSuccess: () => {
    setTimeout(() => {
      window.location.href = `${getReturnUrl()}?payment_success=true&method=simulated`;
    }, 1500);
  },

  /**
   * Verifica se há um pagamento pendente completado
   */
  checkPaymentReturn: (): { success: boolean; cancelled: boolean; method?: string } => {
    const params = new URLSearchParams(window.location.search);
    const isSuccess = params.get('payment_success') === 'true';
    const isCancelled = params.get('payment_cancelled') === 'true';
    const method = params.get('method') || undefined;

    console.log('🔍 checkPaymentReturn:', { 
      url: window.location.href,
      isSuccess, 
      isCancelled, 
      method,
      pendingAnalysis: localStorage.getItem('pending_payment_analysis'),
      pendingTimestamp: localStorage.getItem('pending_payment_timestamp'),
      analysisCache: !!localStorage.getItem('subdetector_analysis_cache')
    });

    // VALIDAÇÃO DE SEGURANÇA: evita que usuários pulem o paywall
    if (isSuccess) {
      const pendingAnalysis = localStorage.getItem('pending_payment_analysis');
      const pendingTimestamp = localStorage.getItem('pending_payment_timestamp');
      
      if (!pendingAnalysis || !pendingTimestamp) {
        console.warn('⚠️ Tentativa de acesso sem pagamento pendente');
        return { success: false, cancelled: false };
      }
      
      const timestamp = parseInt(pendingTimestamp, 10);
      const now = Date.now();
      const thirtyMinutes = 30 * 60 * 1000;
      
      if (now - timestamp > thirtyMinutes) {
        console.warn('⚠️ Pagamento pendente expirado');
        localStorage.removeItem('pending_payment_analysis');
        localStorage.removeItem('pending_payment_timestamp');
        return { success: false, cancelled: false };
      }
      
      console.log('✅ Pagamento válido, redirecionando para dashboard');
    }

    return { success: isSuccess, cancelled: isCancelled, method };
  },

  /**
   * Recupera o ID da análise pendente
   */
  getPendingAnalysisId: (): string | null => {
    return localStorage.getItem('pending_payment_analysis');
  },

  /**
   * Limpa dados de pagamento pendente
   */
  clearPendingPayment: () => {
    localStorage.removeItem('pending_payment_analysis');
    localStorage.removeItem('pending_payment_timestamp');
  },

  /**
   * Verifica se os links de pagamento estão configurados
   */
  isConfigured: () => ({
    stripe: !!STRIPE_PAYMENT_LINK,
    pix: true, // AbacatePay via API sempre disponível (em prod)
    any: !!STRIPE_PAYMENT_LINK || !import.meta.env.DEV
  })
};

