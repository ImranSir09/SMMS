
import React from 'react';
// FIX: Updated react-router-dom imports from v5 to v6 to resolve export errors. Using useNavigate instead of useHistory.
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppData } from '../hooks/useAppData';
import { SunIcon, MoonIcon, ArrowLeftIcon } from './icons';

const Header: React.FC = () => {
  const { theme, toggleTheme } = useAppData();
  const location = useLocation();
  // FIX: Replaced v5 useHistory with v6 useNavigate.
  const navigate = useNavigate();

  const getPageTitle = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const mainPath = pathSegments[0];
    
    if (mainPath === 'student' && pathSegments[1]) return 'Student Profile';
    if (mainPath === 'staff' && pathSegments[1]) return 'Staff Profile';
    if (mainPath === 'exams' && pathSegments[1]) return 'Exam Marks';
    if (mainPath === 'print' && pathSegments[1]) return 'Print Preview';
    if (!mainPath || mainPath === 'dashboard') return 'Dashboard';
    
    return mainPath.charAt(0).toUpperCase() + mainPath.slice(1);
  };

  const pathSegments = location.pathname.split('/').filter(Boolean);
  const showBackButton = pathSegments.length > 1;

  return (
    <header className="flex-shrink-0 grid grid-cols-3 items-center p-2 bg-card border-b border-border h-14 z-20">
      <div className="flex items-center justify-start">
        {showBackButton && (
          <button
            // FIX: Updated navigation call to use navigate(-1) for v6.
            onClick={() => navigate(-1)}
            className="p-2.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
        )}
      </div>
      
      <div className="flex items-center justify-center">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-foreground from-50% to-foreground/60">
            {getPageTitle()}
        </h1>
      </div>

      <div className="flex items-center justify-end">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <MoonIcon className="w-6 h-6"/> : <SunIcon className="w-6 h-6"/>}
        </button>
      </div>
    </header>
  );
};

export default Header;