
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppData } from '../hooks/useAppData';
import { SunIcon, MoonIcon, ArrowLeftIcon } from './icons';

const Header: React.FC = () => {
  const { theme, toggleTheme } = useAppData();
  const location = useLocation();
  const navigate = useNavigate();

  const getPageTitle = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const mainPath = pathSegments[0];
    
    if (mainPath === 'student' && pathSegments[1]) return 'Student Profile';
    if (mainPath === 'staff' && pathSegments[1]) return 'Staff Profile';
    if (mainPath === 'exams' && pathSegments[1]) return 'Exam Marks';
    if (!mainPath || mainPath === 'dashboard') return 'Dashboard';
    
    return mainPath.charAt(0).toUpperCase() + mainPath.slice(1);
  };

  const isProfilePage = location.pathname.startsWith('/student/') || location.pathname.startsWith('/staff/');

  return (
    <header className="flex-shrink-0 grid grid-cols-3 items-center p-2 bg-card border-b border-border h-14 z-20">
      <div className="flex items-center justify-start">
        {isProfilePage && (
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
        )}
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