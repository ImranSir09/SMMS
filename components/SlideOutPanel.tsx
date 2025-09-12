import React, { ReactNode } from 'react';
import { CloseIcon } from './icons';

interface SlideOutPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

const SlideOutPanel: React.FC<SlideOutPanelProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} aria-modal="true" role="dialog">
      <div
        className="absolute top-0 right-0 h-full w-full max-w-lg bg-card border-l border-border shadow-2xl flex flex-col animate-slide-in-right"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10" aria-label="Close panel">
            <CloseIcon className="w-5 h-5" />
          </button>
        </header>
        {children}
      </div>
    </div>
  );
};

export default SlideOutPanel;
