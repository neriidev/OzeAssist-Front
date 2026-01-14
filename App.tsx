
import React from 'react';
import Dashboard from './components/Dashboard';
import Navigation from './components/Navigation';
import Sidebar from './components/Sidebar';
import History from './components/History';
import AiAssistant from './components/AiAssistant';
import InjectionLogger from './components/InjectionLogger';
import HealthLogger from './components/HealthLogger';
import AuthScreen from './components/AuthScreen';
import Profile from './components/Profile';
import Reports from './components/Reports';
import Nutrition from './components/Nutrition';
import AffiliatePortal from './components/AffiliatePortal';
import PremiumBarrier from './components/PremiumBarrier';
import Checkout from './components/Checkout';
import AlertDialog from './components/AlertDialog';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import { AppProvider, useApp } from './contexts/AppContext';
import { LogOut } from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    user,
    isCheckingAuth,
    isTrialExpired,
    activeTab,
    showInjectionLogger,
    showHealthLogger,
    showCheckout,
    alert,
    records,
    healthRecords,
    nutritionData,
    reminders,
    unlockedAchievements,
    setActiveTab,
    setShowInjectionLogger,
    setShowHealthLogger,
    setShowCheckout,
    setAlert,
    authenticate,
    logout,
    saveInjectionRecord,
    saveHealthRecord,
    updateNutrition,
    deleteRecord,
    addReminder,
    deleteReminder,
    toggleReminder,
    handleSubscriptionSuccess,
  } = useApp();

  // Mostrar loading enquanto verifica autenticação
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold text-xl shadow-sm mx-auto mb-4 animate-pulse">
            OA
          </div>
          <p className="text-slate-600 text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen onAuthenticate={authenticate} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      
      <Sidebar 
        user={user} 
        activeTab={activeTab === 'affiliate' ? 'profile' : activeTab} 
        onTabChange={(tab) => setActiveTab(tab)} 
        onLogout={logout} 
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* Mobile Top Bar */}
        <div className="bg-white px-6 py-4 flex justify-between items-center sticky top-0 z-30 shadow-sm md:hidden">
          <div 
            className="flex items-center gap-3 cursor-pointer" 
            onClick={() => setActiveTab('profile')}
          >
            <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold text-xs">
              {user.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-emerald-600 leading-none">
                OzeAssist
              </h1>
              <p className="text-[10px] text-slate-400 font-medium">Olá, {user.name.split(' ')[0]}</p>
            </div>
          </div>
          <button onClick={logout} className="p-2 text-slate-400 hover:text-red-500 rounded-full transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <main className="p-6 max-w-5xl mx-auto w-full">
            {activeTab === 'dashboard' && (
              <Dashboard 
                user={user}
                records={records} 
                healthRecords={healthRecords}
                onLogClick={() => {
                  if (isTrialExpired) {
                    setShowCheckout(true);
                  } else {
                    setShowInjectionLogger(true);
                  }
                }} 
                onHealthLogClick={() => {
                  if (isTrialExpired) {
                    setShowCheckout(true);
                  } else {
                    setShowHealthLogger(true);
                  }
                }}
                onUpgradeClick={() => setShowCheckout(true)}
              />
            )}
            {activeTab === 'nutrition' && (
              isTrialExpired ? (
                <PremiumBarrier 
                  title="Diário Nutricional Bloqueado" 
                  description="Seu período de teste grátis terminou. Assine o PRO para continuar registrando sua alimentação." 
                  onSubscribe={() => setShowCheckout(true)}
                />
              ) : (
                <Nutrition 
                  nutritionData={nutritionData}
                  onUpdateNutrition={updateNutrition}
                  onNavigateToAI={() => setActiveTab('assistant')}
                />
              )
            )}
            
            {activeTab === 'reports' && (
              isTrialExpired ? (
                <PremiumBarrier 
                  title="Relatórios Bloqueados" 
                  description="Seu período de teste grátis terminou. Assine o PRO para ver suas estatísticas detalhadas." 
                  onSubscribe={() => setShowCheckout(true)}
                />
              ) : (
                <Reports 
                  records={records}
                  healthRecords={healthRecords}
                  onBack={() => setActiveTab('history')}
                />
              )
            )}
            
            {activeTab === 'history' && (
              isTrialExpired ? (
                <PremiumBarrier 
                  title="Histórico Bloqueado" 
                  description="Seu período de teste grátis terminou. Assine o PRO para acessar seu histórico completo." 
                  onSubscribe={() => setShowCheckout(true)}
                />
              ) : (
                <History 
                  records={records} 
                  healthRecords={healthRecords}
                  onDelete={deleteRecord}
                  onNavigateToReports={() => setActiveTab('reports')}
                />
              )
            )}
            
            {activeTab === 'assistant' && (
              isTrialExpired ? (
                <PremiumBarrier 
                  title="Assistente IA PRO" 
                  description="Falar com nossa IA especialista requer uma assinatura ativa. Atualize para o PRO agora!" 
                  onSubscribe={() => setShowCheckout(true)}
                />
              ) : (
                <AiAssistant onBack={() => setActiveTab('nutrition')} />
              )
            )}
            
            {activeTab === 'profile' && (
              <Profile 
                 user={user}
                 reminders={reminders}
                 unlockedAchievements={unlockedAchievements}
                 onAddReminder={addReminder}
                 onDeleteReminder={deleteReminder}
                 onToggleReminder={toggleReminder}
                 onLogout={logout}
                 onNavigateToAffiliate={() => setActiveTab('affiliate')}
                 onUpgrade={() => setShowCheckout(true)}
              />
            )}
            
            {activeTab === 'affiliate' && (
              <AffiliatePortal user={user} onBack={() => setActiveTab('profile')} />
            )}
          </main>
        </div>

        {showInjectionLogger && !isTrialExpired && (
          <InjectionLogger 
            onSave={saveInjectionRecord} 
            onCancel={() => setShowInjectionLogger(false)} 
          />
        )}
        {showHealthLogger && !isTrialExpired && (
          <HealthLogger 
            onSave={saveHealthRecord} 
            onCancel={() => setShowHealthLogger(false)} 
          />
        )}
        {showCheckout && (
          <Checkout 
            onSuccess={handleSubscriptionSuccess} 
            onCancel={() => setShowCheckout(false)} 
          />
        )}
        <Navigation 
          activeTab={activeTab === 'affiliate' ? 'profile' : activeTab} 
          onTabChange={setActiveTab} 
        />
      </div>
      
      {/* Alert Dialog */}
      <AlertDialog
        isOpen={alert.isOpen}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        onClose={() => setAlert({ ...alert, isOpen: false })}
      />
      
      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
