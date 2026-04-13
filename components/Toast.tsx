
import React from 'react';
import { InfoIcon, AlertTriangleIcon, CloseIcon, CheckCircleIcon } from './icons';

interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastProps {
  toast: ToastMessage;
  onRemove: (id: number) => void;
}

const ICONS = {
    success: <CheckCircleIcon className="w-5 h-5" />,
    error: <AlertTriangleIcon className="w-5 h-5" />,
    info: <InfoIcon className="w-5 h-5" />,
};

const COLORS = {
    success: 'bg-green-500 border-green-600 dark:bg-green-600 dark:border-green-700',
    error: 'bg-red-500 border-red-600 dark:bg-red-600 dark:border-red-700',
    info: 'bg-blue-500 border-blue-600 dark:bg-blue-600 dark:border-blue-700',
};

const Toast: React.FC<ToastProps> = ({ toast, onRemove }) => {
    return (
        <div className={`w-full max-w-sm p-3 rounded-lg shadow-lg flex items-start text-white border-l-4 pointer-events-auto ${COLORS[toast.type]} animate-fade-in-up`}>
            <div className="flex-shrink-0 mr-3">
                {ICONS[toast.type]}
            </div>
            <div className="flex-1 text-sm font-medium">
                {toast.message}
            </div>
            <button onClick={() => onRemove(toast.id)} className="ml-3 -mr-1 -mt-1 p-1 rounded-full hover:bg-black/20 transition-colors">
                <CloseIcon className="w-4 h-4" />
            </button>
        </div>
    );
};

export const ToastContainer: React.FC<{ toasts: ToastMessage[], removeToast: (id: number) => void }> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-16 right-0 left-0 sm:left-auto sm:right-4 z-[100] p-4 sm:p-0 space-y-2 flex flex-col items-center sm:items-end pointer-events-none">
        {toasts.map(toast => (
            <Toast key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
    </div>
  );
};
