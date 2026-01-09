// Serviço de Pagamento - Stripe Payment Links + Mercado Pago (PIX)
// Configuração sem backend, usando redirecionamento direto

const STRIPE_PAYMENT_LINK = import.meta.env.VITE_STRIPE_PAYMENT_LINK || '';
const MERCADOPAGO_PAYMENT_LINK = import.meta.env.VITE_MERCADOPAGO_PAYMENT_LINK || '';

export type PaymentMethod = 'stripe' | 'mercadopago';

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
   * IMPORTANTE: Configure a URL de sucesso diretamente no Stripe Dashboard:
   * - Vá em Payment Links > Editar > After payment
   * - Configure: http://localhost:3001?payment_success=true&method=stripe
   * (ou sua URL de produção)
   */
  redirectToStripe: (analysisId: string) => {
    paymentService.preparePayment(analysisId);
    
    if (!STRIPE_PAYMENT_LINK) {
      console.error('VITE_STRIPE_PAYMENT_LINK não configurado');
      // Fallback para simulação em desenvolvimento
      paymentService.simulatePaymentSuccess();
      return;
    }

    // Stripe Payment Links NÃO suportam success_url via query params
    // A URL de sucesso deve ser configurada no Dashboard do Stripe
    window.location.href = STRIPE_PAYMENT_LINK;
  },

  /**
   * Redireciona para Mercado Pago (PIX)
   */
  redirectToMercadoPago: (analysisId: string) => {
    paymentService.preparePayment(analysisId);
    
    if (!MERCADOPAGO_PAYMENT_LINK) {
      console.error('VITE_MERCADOPAGO_PAYMENT_LINK não configurado');
      // Fallback para simulação em desenvolvimento
      paymentService.simulatePaymentSuccess();
      return;
    }

    const successUrl = `${getReturnUrl()}?payment_success=true&method=pix`;
    
    // Mercado Pago também suporta external_reference para rastreamento
    const url = new URL(MERCADOPAGO_PAYMENT_LINK);
    url.searchParams.set('external_reference', analysisId);
    url.searchParams.set('back_urls[success]', successUrl);
    
    window.location.href = url.toString();
  },

  /**
   * Simula pagamento bem-sucedido (para desenvolvimento/teste)
   */
  simulatePaymentSuccess: () => {
    // Simular delay de processamento
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

    // VALIDAÇÃO DE SEGURANÇA: evita que usuários pulem o paywall
    if (isSuccess) {
      const pendingAnalysis = localStorage.getItem('pending_payment_analysis');
      const pendingTimestamp = localStorage.getItem('pending_payment_timestamp');
      
      // Verifica se existe um pagamento pendente
      if (!pendingAnalysis || !pendingTimestamp) {
        console.warn('Tentativa de acesso sem pagamento pendente');
        return { success: false, cancelled: false };
      }
      
      // Verifica se o timestamp é recente (máximo 30 minutos)
      const timestamp = parseInt(pendingTimestamp, 10);
      const now = Date.now();
      const thirtyMinutes = 30 * 60 * 1000;
      
      if (now - timestamp > thirtyMinutes) {
        console.warn('Pagamento pendente expirado');
        // Limpar dados expirados
        localStorage.removeItem('pending_payment_analysis');
        localStorage.removeItem('pending_payment_timestamp');
        return { success: false, cancelled: false };
      }
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
    mercadopago: !!MERCADOPAGO_PAYMENT_LINK,
    any: !!STRIPE_PAYMENT_LINK || !!MERCADOPAGO_PAYMENT_LINK
  })
};
