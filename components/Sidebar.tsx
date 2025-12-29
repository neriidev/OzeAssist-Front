import React from 'react';
import { Home, History, Utensils, LogOut, User as UserIcon } from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  user: User;
  activeTab: 'dashboard' | 'nutrition' | 'history' | 'assistant' | 'profile' | 'reports';
  onTabChange: (tab: 'dashboard' | 'nutrition' | 'history' | 'assistant' | 'profile' | 'reports') => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, activeTab, onTabChange, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Início', icon: Home },
    { id: 'nutrition', label: 'Nutrição & IA', icon: Utensils },
    { id: 'history', label: 'Histórico & Relatórios', icon: History },
    { id: 'profile', label: 'Perfil & Lembretes', icon: UserIcon },
  ] as const;

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 h-screen sticky top-0 z-50">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-100 flex items-center gap-3">
        <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold text-xs shadow-sm">
          OA
        </div>
        <div>
          <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-emerald-600 leading-none">
            OzeAssist
          </h1>
          <span className="text-[10px] text-slate-400 font-medium">Versão Web</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          // Highlight Logic: Nutrition activates for Assistant too, History for Reports
          let isActive = activeTab === item.id;
          if (item.id === 'nutrition' && activeTab === 'assistant') isActive = true;
          if (item.id === 'history' && activeTab === 'reports') isActive = true;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                isActive 
                  ? 'bg-teal-50 text-teal-700 shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'stroke-2' : 'stroke-[1.5]'}`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-slate-700 truncate">{user.name}</p>
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 text-sm text-red-500 hover:bg-red-50 hover:text-red-600 py-2 rounded-lg transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;