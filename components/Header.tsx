
import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAppData } from '../hooks/useAppData';
import { SunIcon, MoonIcon } from './icons';

const Header: React.FC = () => {
  const { theme, toggleTheme, schoolDetails } = useAppData();
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname.split('/')[1];
    if (!path || path === 'dashboard') return 'Dashboard';
    if (path === 'print') return 'Document Preview';
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  const isDashboard = location.pathname === '/dashboard';

  return (
    <header className="sticky top-0 z-20 grid grid-cols-3 items-center p-4 bg-card border-b border-border h-16">
      <div className="flex items-center justify-start">
        <h1 className="text-xl md:text-2xl font-bold font-gothic bg-clip-text text-transparent bg-gradient-to-br from-foreground from-50% to-foreground/60">
            {getPageTitle()}
        </h1>
      </div>
      
      <div className="flex items-center justify-center">
        {isDashboard && schoolDetails?.logo && (
          <img 
            src={schoolDetails.logo}
            alt="School Logo"
            className="h-9 w-auto object-contain"
          />
        )}
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
