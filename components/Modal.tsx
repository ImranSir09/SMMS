import React, { ReactNode } from 'react';
import { CloseIcon } from './icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background z-50 animate-fade-in flex flex-col">
      <header className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-border h-14 bg-card">
        <h2 className="text-lg font-semibold">{title}</h2>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
          <CloseIcon className="w-5 h-5" />
        </button>
      </header>
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default Modal;