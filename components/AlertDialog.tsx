import React, { useEffect } from 'react';
import { CheckCircle2, XCircle, AlertCircle, X } from 'lucide-react';

interface AlertDialogProps {
  isOpen: boolean;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  onClose: () => void;
  duration?: number; // Auto-close duration in ms (0 = no auto-close)
}

const AlertDialog: React.FC<AlertDialogProps> = ({
  isOpen,
  type,
  title,
  message,
  onClose,
  duration = 5000,
}) => {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  const typeStyles = {
    success: {
      icon: CheckCircle2,
      iconColor: 'bg-emerald-100 text-emerald-600',
      border: 'border-emerald-200',
      bg: 'bg-emerald-50',
    },
    error: {
      icon: XCircle,
      iconColor: 'bg-red-100 text-red-600',
      border: 'border-red-200',
      bg: 'bg-red-50',
    },
    warning: {
      icon: AlertCircle,
      iconColor: 'bg-amber-100 text-amber-600',
      border: 'border-amber-200',
      bg: 'bg-amber-50',
    },
    info: {
      icon: AlertCircle,
      iconColor: 'bg-blue-100 text-blue-600',
      border: 'border-blue-200',
      bg: 'bg-blue-50',
    },
  };

  const styles = typeStyles[type];
  const Icon = styles.icon;

  return (
    <div className="fixed top-4 right-4 z-[100] transform transition-all duration-300">
      <div className={`${styles.bg} ${styles.border} border-2 rounded-2xl shadow-xl p-4 max-w-sm min-w-[300px]`}>
        <div className="flex items-start gap-3">
          <div className={`${styles.iconColor} rounded-xl p-2 flex-shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-slate-900 text-sm mb-1">{title}</h4>
            <p className="text-slate-600 text-xs leading-relaxed">{message}</p>
          </div>

          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 text-slate-400 hover:text-slate-600 hover:bg-white/50 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertDialog;

