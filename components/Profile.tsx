
import React, { useState } from 'react';
import { User, Reminder, UnlockedAchievement } from '../types';
import { ACHIEVEMENTS_LIST } from '../constants';
import { apiService } from '../services/api';
import AlertDialog from './AlertDialog';
import ConfirmDialog from './ConfirmDialog';
// Added ArrowRight and ShieldCheck to imports to fix missing component errors
import { Bell, BellOff, Trophy, Flag, CalendarCheck, Activity, Scale, Trash2, Plus, Clock, Share2, ChevronRight, Pill, Calendar, Target, Crown, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

interface ProfileProps {
  user: User;
  reminders: Reminder[];
  unlockedAchievements: UnlockedAchievement[];
  onAddReminder: (reminder: Reminder) => void;
  onDeleteReminder: (id: string) => void;
  onToggleReminder: (id: string) => void;
  onLogout: () => void;
  onNavigateToAffiliate: () => void;
  onUpgrade: () => void;
}

const Profile: React.FC<ProfileProps> = ({ 
  user, 
  reminders, 
  unlockedAchievements, 
  onAddReminder, 
  onDeleteReminder,
  onToggleReminder,
  onLogout,
  onNavigateToAffiliate,
  onUpgrade
}) => {
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [newDay, setNewDay] = useState(1);
  const [newTime, setNewTime] = useState('08:00');
  const [alert, setAlert] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
  });
  const [deleteReminderConfirm, setDeleteReminderConfirm] = useState<{ isOpen: boolean; id: string }>({
    isOpen: false,
    id: '',
  });

  const daysOfWeek = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  const getIcon = (name: string) => {
    switch (name) {
      case 'Flag': return <Flag className="w-5 h-5" />;
      case 'CalendarCheck': return <CalendarCheck className="w-5 h-5" />;
      case 'Trophy': return <Trophy className="w-5 h-5" />;
      case 'Activity': return <Activity className="w-5 h-5" />;
      case 'Scale': return <Scale className="w-5 h-5" />;
      default: return <Trophy className="w-5 h-5" />;
    }
  };

  const handleSaveReminder = async () => {
    try {
      const reminderData = {
        dayOfWeek: newDay,
        time: newTime,
        enabled: true,
        frequency: 'weekly' as const
      };
      const reminder = await apiService.createReminder(reminderData);
      onAddReminder({
        id: reminder.id,
        dayOfWeek: reminder.dayOfWeek,
        dayOfMonth: reminder.dayOfMonth,
        time: reminder.time,
        enabled: reminder.enabled,
        frequency: reminder.frequency,
      });
      setShowAddReminder(false);
      setAlert({
        isOpen: true,
        type: 'success',
        title: 'Lembrete Criado',
        message: 'Lembrete criado com sucesso!',
      });
    } catch (error: any) {
      console.error('Erro ao criar lembrete:', error);
      setAlert({
        isOpen: true,
        type: 'error',
        title: 'Erro ao Criar',
        message: error.message || 'Erro ao criar lembrete. Tente novamente.',
      });
    }
  };

  // Trial Logic
  const start = new Date(user.createdAt).getTime();
  const now = new Date().getTime();
  const diffDays = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  const trialRemaining = Math.max(0, 7 - diffDays);

  return (
    <div className="space-y-8 pb-24">
      
      {/* User Card */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg ${user.isPremium ? 'bg-gradient-to-br from-amber-400 to-orange-500' : 'bg-gradient-to-br from-teal-400 to-emerald-500'}`}>
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-800">{user.name}</h2>
            {user.isPremium && (
               <span className="bg-amber-100 text-amber-600 p-1 rounded-full">
                 <Crown className="w-3 h-3" />
               </span>
            )}
          </div>
          <p className="text-sm text-slate-500">{user.email}</p>
        </div>
        <button 
          onClick={onLogout}
          className="text-xs text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors font-medium"
        >
          Sair
        </button>
      </div>

      {/* Subscription Card */}
      {!user.isPremium ? (
        <div className="bg-slate-900 rounded-[2.5rem] p-6 text-white shadow-2xl space-y-4 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Plano PRO</span>
            </div>
            <h3 className="text-xl font-black mb-1">Deseja acesso total?</h3>
            <p className="text-xs opacity-60 mb-6">
              {trialRemaining > 0 
                ? `Seu teste grátis expira em ${trialRemaining} dias.` 
                : "Seu período de teste terminou."}
            </p>
            
            <button 
              onClick={onUpgrade}
              className="w-full py-4 bg-white text-slate-900 font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-100 active:scale-95 transition-all"
            >
              Assinar PRO - R$ 19,90 <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-teal-500/20 blur-[60px]"></div>
          <div className="absolute -left-10 -top-10 w-40 h-40 bg-amber-500/10 blur-[60px]"></div>
        </div>
      ) : (
        <div className="bg-teal-50 border border-teal-100 p-5 rounded-3xl flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-teal-500 text-white rounded-2xl flex items-center justify-center">
               <ShieldCheck className="w-6 h-6" />
             </div>
             <div>
               <p className="text-sm font-black text-teal-800 tracking-tight">Assinante Premium</p>
               <p className="text-[10px] text-teal-600 font-bold uppercase tracking-wider">Acesso Ilimitado</p>
             </div>
          </div>
          <span className="text-[10px] font-black text-teal-500 bg-white px-3 py-1.5 rounded-full border border-teal-100">Ativo</span>
        </div>
      )}

      {/* Treatment Info */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Seu Tratamento</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
            <Pill className="w-5 h-5 text-teal-600 mt-1" />
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Medicamento</p>
              <p className="text-sm font-bold text-slate-700">{user.medication || 'Não definido'}</p>
              <p className="text-xs text-slate-500">{user.currentDosage} mg</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
            <Calendar className="w-5 h-5 text-indigo-600 mt-1" />
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Frequência</p>
              <p className="text-sm font-bold text-slate-700 capitalize">
                {user.dosageFrequency === 'weekly' ? 'Semanal' : user.dosageFrequency === 'daily' ? 'Diário' : 'Mensal'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Affiliate Banner */}
      <div 
        onClick={onNavigateToAffiliate}
        className="bg-indigo-600 rounded-2xl p-4 text-white shadow-md flex items-center justify-between cursor-pointer hover:bg-indigo-700 transition-all active:scale-95"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold">Programa de Afiliados</h4>
            <p className="text-[10px] opacity-80">Convide amigos e acumule pontos</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 opacity-50" />
      </div>

      {/* Achievements Section */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          Conquistas ({unlockedAchievements.length}/{ACHIEVEMENTS_LIST.length})
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {ACHIEVEMENTS_LIST.map((achievement) => {
            const isUnlocked = unlockedAchievements.some(u => u.id === achievement.id);
            return (
              <div 
                key={achievement.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isUnlocked 
                    ? 'bg-amber-50 border-amber-200 shadow-sm' 
                    : 'bg-slate-50 border-slate-100 opacity-60 grayscale'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${
                  isUnlocked ? 'bg-amber-100 text-amber-600' : 'bg-slate-200 text-slate-400'
                }`}>
                  {getIcon(achievement.icon)}
                </div>
                <h4 className={`font-bold text-sm ${isUnlocked ? 'text-slate-800' : 'text-slate-500'}`}>
                  {achievement.title}
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-tight">
                  {achievement.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reminders Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-500" />
            Lembretes
          </h3>
          <button 
            onClick={() => setShowAddReminder(true)}
            className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-full transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {showAddReminder && (
          <div className="bg-white p-4 rounded-2xl border border-indigo-100 shadow-sm mb-4">
             <div className="grid grid-cols-2 gap-3 mb-3">
               <div>
                 <label className="text-xs text-slate-500 font-medium block mb-1">Dia</label>
                 <select 
                    value={newDay} 
                    onChange={(e) => setNewDay(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 rounded-lg text-sm border-slate-200 outline-none"
                 >
                   {daysOfWeek.map((day, idx) => (
                     <option key={idx} value={idx}>{day}</option>
                   ))}
                 </select>
               </div>
               <div>
                 <label className="text-xs text-slate-500 font-medium block mb-1">Hora</label>
                 <input 
                    type="time" 
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full p-2 bg-slate-50 rounded-lg text-sm border-slate-200 outline-none"
                 />
               </div>
             </div>
             <div className="flex justify-end gap-2">
               <button onClick={() => setShowAddReminder(false)} className="text-xs text-slate-500 px-3 py-2">Cancelar</button>
               <button onClick={handleSaveReminder} className="text-xs bg-indigo-600 text-white px-3 py-2 rounded-lg font-bold">Salvar</button>
             </div>
          </div>
        )}

        {reminders.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-sm">
            Nenhum lembrete configurado.
          </div>
        ) : (
          <div className="space-y-3">
            {reminders.map((reminder) => (
              <div key={reminder.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${reminder.enabled ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className={`font-bold ${reminder.enabled ? 'text-slate-800' : 'text-slate-400'}`}>
                      {reminder.frequency === 'daily' ? 'Diário' : 
                       reminder.frequency === 'monthly' ? `Dia ${reminder.dayOfMonth} (Mensal)` :
                       daysOfWeek[reminder.dayOfWeek || 0]}
                    </p>
                    <p className="text-xs text-slate-400">{reminder.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <button 
                     onClick={() => onToggleReminder(reminder.id)}
                     className={`p-2 rounded-full transition-colors ${reminder.enabled ? 'text-indigo-500 hover:bg-indigo-50' : 'text-slate-300 hover:bg-slate-100'}`}
                   >
                     {reminder.enabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
                   </button>
                   <button 
                     onClick={() => setDeleteReminderConfirm({ isOpen: true, id: reminder.id })}
                     className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                   >
                     <Trash2 className="w-5 h-5" />
                   </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Alert Dialog */}
      <AlertDialog
        isOpen={alert.isOpen}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        onClose={() => setAlert({ ...alert, isOpen: false })}
      />

      {/* Delete Reminder Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteReminderConfirm.isOpen}
        title="Excluir Lembrete"
        message="Tem certeza que deseja excluir este lembrete? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={() => {
          onDeleteReminder(deleteReminderConfirm.id);
          setDeleteReminderConfirm({ isOpen: false, id: '' });
        }}
        onCancel={() => setDeleteReminderConfirm({ isOpen: false, id: '' })}
      />
    </div>
  );
};

export default Profile;
