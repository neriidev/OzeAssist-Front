
import React, { useState } from 'react';
import { 
  X, CreditCard, QrCode, ShieldCheck, Lock, 
  CheckCircle2, Copy, Loader2, CreditCard as CardIcon,
  ChevronRight, ArrowRight
} from 'lucide-react';

interface CheckoutProps {
  onSuccess: () => void;
  onCancel: () => void;
}

type PaymentMethod = 'pix' | 'card';

const Checkout: React.FC<CheckoutProps> = ({ onSuccess, onCancel }) => {
  const [method, setMethod] = useState<PaymentMethod>('pix');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simula processamento de 2 segundos
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      // Aguarda 2 segundos no sucesso antes de fechar
      setTimeout(() => {
        onSuccess();
      }, 2000);
    }, 2000);
  };

  const copyPix = () => {
    navigator.clipboard.writeText('00020101021226850014br.gov.bcb.pix0123ozeassist-premium-subscription-2024');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 bg-white z-[100] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Pagamento Confirmado!</h2>
        <p className="text-slate-500 mt-2">Bem-vindo ao plano PRO. Aproveite todos os recursos ilimitados.</p>
        <div className="mt-8 flex gap-2">
           <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
           <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse delay-75"></div>
           <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse delay-150"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-lg sm:rounded-[2.5rem] flex flex-col h-[90vh] sm:h-auto overflow-hidden animate-in slide-in-from-bottom-10 duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
          <div>
            <h2 className="text-xl font-black text-slate-800">Checkout Seguro</h2>
            <div className="flex items-center gap-1.5 text-teal-600">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Ambiente Protegido</span>
            </div>
          </div>
          <button 
            onClick={onCancel}
            className="p-2 bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Order Summary */}
          <div className="bg-slate-50 p-4 rounded-2xl flex items-center justify-between border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center text-white shadow-sm">
                <CardIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Plano OzeAssist PRO</p>
                <p className="text-[10px] text-slate-400 font-medium">Assinatura Mensal</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-black text-slate-800">R$ 19,90</p>
              <p className="text-[10px] text-teal-600 font-bold uppercase">Pagamento Único</p>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
            <button 
              onClick={() => setMethod('pix')}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${method === 'pix' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <QrCode className="w-4 h-4" /> PIX
            </button>
            <button 
              onClick={() => setMethod('card')}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${method === 'card' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <CreditCard className="w-4 h-4" /> Cartão
            </button>
          </div>

          {/* Form Area */}
          {method === 'pix' ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col items-center justify-center space-y-4 p-4">
                <div className="bg-white p-4 rounded-3xl border-2 border-slate-100 shadow-sm relative group">
                  <img 
                    src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=OzeAssistPixPaymentSimulated" 
                    alt="QR Code PIX" 
                    className="w-40 h-40 opacity-90"
                  />
                  <div className="absolute inset-0 bg-white/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl">
                    <QrCode className="w-10 h-10 text-teal-600" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-slate-700">Escaneie o QR Code</p>
                  <p className="text-xs text-slate-400 mt-1">O acesso é liberado instantaneamente após o pagamento.</p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Ou copie o código</p>
                <div className="flex gap-2">
                  <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3 text-[10px] text-slate-400 font-mono truncate">
                    00020101021226850014br.gov.bcb.pix0123ozeassist-premium...
                  </div>
                  <button 
                    onClick={copyPix}
                    className={`px-4 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${copied ? 'bg-teal-500 text-white' : 'bg-slate-800 text-white'}`}
                  >
                    {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
              </div>

              <button 
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full py-5 bg-teal-600 text-white font-black rounded-3xl shadow-xl shadow-teal-100 flex items-center justify-center gap-2 hover:bg-teal-700 transition-all active:scale-95 disabled:opacity-50"
              >
                {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Já realizei o pagamento'}
              </button>
            </div>
          ) : (
            <form onSubmit={handlePayment} className="space-y-4 animate-in fade-in duration-300">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block tracking-widest ml-1">Número do Cartão</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="0000 0000 0000 0000"
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none font-medium"
                      required
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1">
                      <div className="w-8 h-5 bg-slate-200 rounded"></div>
                      <div className="w-8 h-5 bg-slate-200 rounded"></div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block tracking-widest ml-1">Nome no Cartão</label>
                  <input 
                    type="text" 
                    placeholder="Como impresso no cartão"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none font-medium"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block tracking-widest ml-1">Validade</label>
                    <input 
                      type="text" 
                      placeholder="MM/AA"
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block tracking-widest ml-1">CVV</label>
                    <input 
                      type="password" 
                      placeholder="***"
                      maxLength={3}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none font-medium text-center"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-2xl text-blue-700 text-[10px] font-bold leading-relaxed">
                <Lock className="w-6 h-6 shrink-0" />
                Seus dados de pagamento são criptografados e nunca são armazenados em nossos servidores.
              </div>

              <button 
                type="submit"
                disabled={isProcessing}
                className="w-full py-5 bg-teal-600 text-white font-black rounded-3xl shadow-xl shadow-teal-100 flex items-center justify-center gap-2 hover:bg-teal-700 transition-all active:scale-95 disabled:opacity-50"
              >
                {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Confirmar Assinatura'}
              </button>
            </form>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-50 bg-slate-50/50 flex flex-col items-center gap-2">
           <div className="flex items-center gap-4 grayscale opacity-40">
             <div className="h-6 w-10 bg-slate-400 rounded"></div>
             <div className="h-6 w-10 bg-slate-400 rounded"></div>
             <div className="h-6 w-10 bg-slate-400 rounded"></div>
           </div>
           <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">OzeAssist Technology &copy; 2024</p>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
