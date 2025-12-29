import React from 'react';
import { Home, History, User, Utensils } from 'lucide-react';

interface NavigationProps {
  activeTab: 'dashboard' | 'nutrition' | 'history' | 'assistant' | 'profile' | 'reports';
  onTabChange: (tab: 'dashboard' | 'nutrition' | 'history' | 'assistant' | 'profile' | 'reports') => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-2 pb-5 z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <div className="flex justify-between items-center max-w-lg mx-auto">
        <button
          onClick={() => onTabChange('dashboard')}
          className={`flex flex-col items-center p-2 rounded-xl transition-all min-w-[60px] ${
            activeTab === 'dashboard' ? 'text-teal-600 bg-teal-50' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Home className={`w-6 h-6 ${activeTab === 'dashboard' ? 'fill-current' : ''}`} />
          <span className="text-[10px] font-medium mt-1">Início</span>
        </button>

        <button
          onClick={() => onTabChange('nutrition')}
          className={`flex flex-col items-center p-2 rounded-xl transition-all min-w-[60px] ${
            activeTab === 'nutrition' || activeTab === 'assistant' ? 'text-teal-600 bg-teal-50' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Utensils className={`w-6 h-6 ${activeTab === 'nutrition' || activeTab === 'assistant' ? 'fill-current' : ''}`} />
          <span className="text-[10px] font-medium mt-1">Nutri</span>
        </button>
        
        <button
          onClick={() => onTabChange('history')}
          className={`flex flex-col items-center p-2 rounded-xl transition-all min-w-[60px] ${
            activeTab === 'history' || activeTab === 'reports' ? 'text-teal-600 bg-teal-50' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <History className="w-6 h-6" />
          <span className="text-[10px] font-medium mt-1">Hist</span>
        </button>

        <button
          onClick={() => onTabChange('profile')}
          className={`flex flex-col items-center p-2 rounded-xl transition-all min-w-[60px] ${
            activeTab === 'profile' ? 'text-teal-600 bg-teal-50' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <User className={`w-6 h-6 ${activeTab === 'profile' ? 'fill-current' : ''}`} />
          <span className="text-[10px] font-medium mt-1">Perfil</span>
        </button>
      </div>
    </div>
  );
};

export default Navigation;