
import React, { useState, useEffect } from 'react';
import { User, AffiliateData } from '../types';
import { 
  Users, Link as LinkIcon, Copy, Check, TrendingUp, Gift, 
  ArrowLeft, Share2, Mail, MessageCircle, QrCode, X, Download
} from 'lucide-react';

interface AffiliatePortalProps {
  user: User;
  onBack: () => void;
}

const AffiliatePortal: React.FC<AffiliatePortalProps> = ({ user, onBack }) => {
  const [affiliateData, setAffiliateData] = useState<AffiliateData | null>(null);
  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(`oze_affiliate_${user.email}`);
    if (saved) {
      setAffiliateData(JSON.parse(saved));
    } else {
      const newAffiliate: AffiliateData = {
        ownerEmail: user.email,
        code: user.name.split(' ')[0].toLowerCase() + Math.floor(Math.random() * 1000),
        points: 0,
        clicks: Math.floor(Math.random() * 50),
        leads: []
      };
      localStorage.setItem(`oze_affiliate_${user.email}`, JSON.stringify(newAffiliate));
      setAffiliateData(newAffiliate);
    }
  }, [user]);

  const affiliateLink = `${window.location.origin}${window.location.pathname}?ref=${affiliateData?.code}`;
  const shareMessage = `Olá! Estou usando o OzeAssist para acompanhar meu tratamento e é incrível. Use meu link para baixar e começar também: ${affiliateLink}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(affiliateLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
    window.open(url, '_blank');
  };

  const shareEmail = () => {
    const url = `mailto:?subject=${encodeURIComponent('Convite OzeAssist')}&body=${encodeURIComponent(shareMessage)}`;
    window.location.href = url;
  };

  if (!affiliateData) return null;

  // QR Code URL using a public API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(affiliateLink)}`;

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-slate-800">Programa de Afiliados</h2>
      </div>

      {/* Hero Card */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-lg font-bold opacity-90 mb-1">Convide e Ganhe</h3>
          <p className="text-sm opacity-80 mb-6 max-w-[200px]">Ajude outras pessoas e ganhe Pontos Oze por cada indicação.</p>
          
          <div className="flex items-end gap-2">
            <span className="text-4xl font-extrabold">{affiliateData.points}</span>
            <span className="text-sm font-medium mb-1.5 opacity-80">Pontos Acumulados</span>
          </div>
        </div>
        <Gift className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 text-white" />
      </div>

      {/* Share Actions Area */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-4">
        <label className="block text-sm font-bold text-slate-700">Compartilhar agora</label>
        
        <div className="grid grid-cols-3 gap-3">
          <button 
            onClick={shareWhatsApp}
            className="flex flex-col items-center gap-2 p-3 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-100 transition-colors"
          >
            <div className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-sm">
              <MessageCircle className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase">WhatsApp</span>
          </button>

          <button 
            onClick={shareEmail}
            className="flex flex-col items-center gap-2 p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-100 transition-colors"
          >
            <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-sm">
              <Mail className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase">E-mail</span>
          </button>

          <button 
            onClick={() => setShowQrModal(true)}
            className="flex flex-col items-center gap-2 p-3 bg-slate-50 text-slate-600 rounded-2xl hover:bg-slate-100 transition-colors"
          >
            <div className="w-10 h-10 bg-slate-800 text-white rounded-full flex items-center justify-center shadow-sm">
              <QrCode className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase">QR Code</span>
          </button>
        </div>

        {/* Link Copy Box */}
        <div className="pt-4 border-t border-slate-50">
          <div className="flex gap-2">
            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[10px] text-slate-400 font-mono truncate flex items-center">
              {affiliateLink}
            </div>
            <button 
              onClick={handleCopy}
              className={`px-4 py-3 rounded-xl transition-all flex items-center gap-2 font-bold text-xs ${copied ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copiado' : 'Link'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-teal-500" />
            <span className="text-xs font-bold text-slate-400 uppercase">Cliques</span>
          </div>
          <div className="text-2xl font-bold text-slate-800">{affiliateData.clicks}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-bold text-slate-400 uppercase">Indicações</span>
          </div>
          <div className="text-2xl font-bold text-slate-800">{affiliateData.leads.length}</div>
        </div>
      </div>

      {/* Leads List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-700">Amigos que entraram</h3>
          <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold">+10 pts por amigo</span>
        </div>
        <div className="p-2">
          {affiliateData.leads.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm italic">
              Nenhuma indicação ainda. <br/> Comece a compartilhar!
            </div>
          ) : (
            <div className="space-y-1">
              {affiliateData.leads.map(lead => (
                <div key={lead.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center font-bold text-xs">
                      {lead.referredEmail.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">{lead.referredEmail.split('@')[0]}</p>
                      <p className="text-[10px] text-slate-400">{new Date(lead.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 bg-teal-50 text-teal-600 rounded-full uppercase">Ativo</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center space-y-4">
              <div className="inline-block p-3 bg-indigo-50 text-indigo-600 rounded-2xl mb-2">
                <QrCode className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Seu QR Code</h3>
              <p className="text-sm text-slate-500">Peça para seu amigo escanear com a câmera do celular.</p>
              
              <div className="bg-slate-50 p-6 rounded-3xl border-2 border-dashed border-slate-200 flex items-center justify-center">
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code de Afiliado" 
                  className="w-48 h-48 rounded-xl"
                  onLoad={() => console.log('QR Code Loaded')}
                />
              </div>

              <div className="pt-4 flex flex-col gap-2">
                <button 
                  onClick={handleCopy}
                  className="w-full py-4 bg-teal-600 text-white font-bold rounded-2xl shadow-lg shadow-teal-600/20 active:scale-95 transition-all"
                >
                  {copied ? 'Copiado para Área de Transferência!' : 'Copiar Link'}
                </button>
                <button 
                   onClick={() => setShowQrModal(false)}
                   className="w-full py-3 text-slate-400 font-medium"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AffiliatePortal;
