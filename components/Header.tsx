
import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAppData } from '../hooks/useAppData';
import { SunIcon, MoonIcon } from './icons';

const Header: React.FC = () => {
  const { theme, toggleTheme } = useAppData();
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname.split('/')[1];
    if (!path || path === 'dashboard') return 'Dashboard';
    if (path === 'exams' && location.pathname.split('/')[2]) return 'Exam Marks';
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <header className="flex-shrink-0 grid grid-cols-3 items-center p-2 bg-card/80 backdrop-blur-sm border-b border-border h-14 z-20">
      <div className="flex items-center justify-start">
        {/* Placeholder for potential left-side action */}
      </div>
      
      <div className="flex items-center justify-center">
        <h1 className="text-lg font-bold font-gothic bg-clip-text text-transparent bg-gradient-to-br from-foreground from-50% to-foreground/60">
            {getPageTitle()}
        </h1>
      </div>

      <div className="flex items-center justify-end">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <MoonIcon className="w-5 h-5"/> : <SunIcon className="w-5 h-5"/>}
        </button>
      </div>
    </header>
  );
};

export default Header;