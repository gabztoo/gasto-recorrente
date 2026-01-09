import React, { useState } from 'react';
import { X, CreditCard, QrCode, Lock, Shield, ArrowRight, Loader2 } from 'lucide-react';
import { paymentService } from '../services/paymentService';

interface PaymentModalProps {
  analysisId: string;
  amount: number;
  onClose: () => void;
  onProcessing?: () => void;
}

type PaymentMethod = 'stripe' | 'pix';

const PaymentModal: React.FC<PaymentModalProps> = ({ 
  analysisId, 
  amount, 
  onClose,
  onProcessing 
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const config = paymentService.isConfigured();

  const handlePayment = () => {
    if (!selectedMethod) return;
    
    setIsProcessing(true);
    onProcessing?.();

    if (selectedMethod === 'stripe') {
      paymentService.redirectToStripe(analysisId);
    } else {
      paymentService.redirectToMercadoPago(analysisId);
    }
  };

  const formatCurrency = (value: number) => 
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-background/90 backdrop-blur-md">
      <div className="bg-surface border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
        
        {/* Header */}
        <div className="relative p-6 pb-4 border-b border-white/5">
          <button 
            onClick={onClose}
            disabled={isProcessing}
            className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
              <Lock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Finalizar Pagamento</h2>
              <p className="text-xs text-gray-500 font-mono">SECURE_CHECKOUT_V1</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          
          {/* Amount Display */}
          <div className="text-center mb-6 py-4 bg-background rounded-lg border border-white/5">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total a Pagar</p>
            <p className="text-3xl font-bold text-white">{formatCurrency(amount)}</p>
            <p className="text-xs text-gray-600 mt-1">Pagamento único • Acesso imediato</p>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-3 mb-6">
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Método de Pagamento</p>
            
            {/* Card/Stripe Option */}
            <button
              onClick={() => setSelectedMethod('stripe')}
              disabled={isProcessing}
              className={`w-full p-4 rounded-lg border-2 transition-all flex items-center justify-between group
                ${selectedMethod === 'stripe' 
                  ? 'border-primary bg-primary/10' 
                  : 'border-white/10 hover:border-white/20 bg-background/50'
                }
                ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors
                  ${selectedMethod === 'stripe' ? 'bg-primary/20 text-primary' : 'bg-surfaceHighlight text-gray-400'}
                `}>
                  <CreditCard className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-white text-sm">Cartão de Crédito/Débito</p>
                  <p className="text-xs text-gray-500">Visa, Mastercard, Elo, Amex</p>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                ${selectedMethod === 'stripe' ? 'border-primary bg-primary' : 'border-gray-600'}
              `}>
                {selectedMethod === 'stripe' && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
            </button>

            {/* PIX/Mercado Pago Option */}
            <button
              onClick={() => setSelectedMethod('pix')}
              disabled={isProcessing}
              className={`w-full p-4 rounded-lg border-2 transition-all flex items-center justify-between group
                ${selectedMethod === 'pix' 
                  ? 'border-emerald-500 bg-emerald-500/10' 
                  : 'border-white/10 hover:border-white/20 bg-background/50'
                }
                ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors
                  ${selectedMethod === 'pix' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-surfaceHighlight text-gray-400'}
                `}>
                  <QrCode className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-white text-sm">PIX</p>
                  <p className="text-xs text-gray-500">Pagamento instantâneo via QR Code</p>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                ${selectedMethod === 'pix' ? 'border-emerald-500 bg-emerald-500' : 'border-gray-600'}
              `}>
                {selectedMethod === 'pix' && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
            </button>
          </div>

          {/* Pay Button */}
          <button
            onClick={handlePayment}
            disabled={!selectedMethod || isProcessing}
            className={`w-full py-4 rounded-lg font-semibold text-sm transition-all flex items-center justify-center space-x-2
              ${!selectedMethod || isProcessing
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : selectedMethod === 'pix'
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                  : 'bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20'
              }
            `}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Redirecionando...</span>
              </>
            ) : (
              <>
                <span>PAGAR {formatCurrency(amount)}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Security Badge */}
          <div className="mt-6 flex justify-center items-center space-x-2 text-gray-600">
            <Shield className="w-3 h-3" />
            <span className="text-[10px] uppercase tracking-widest font-mono">
              {selectedMethod === 'pix' ? 'MERCADO_PAGO_SECURE' : 'STRIPE_ENCRYPTED'}
            </span>
          </div>

          {/* Dev Mode Warning */}
          {!config.any && (
            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-xs text-yellow-400 text-center">
                ⚠️ Modo desenvolvimento: Links de pagamento não configurados. 
                Pagamento será simulado.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;