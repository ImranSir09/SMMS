
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppData } from '../hooks/useAppData';
import { SunIcon, MoonIcon, ArrowLeftIcon, SchoolIcon, LogOutIcon } from './icons';

const Header: React.FC = () => {
  const { theme, toggleTheme, logout, isAuthenticated } = useAppData();
  const location = useLocation();
  const navigate = useNavigate();

  const isDashboard = location.pathname === '/' || location.pathname === '/dashboard';

  const getPageTitle = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const mainPath = pathSegments[0];
    
    // Specific dynamic routes
    if (mainPath === 'student' && pathSegments[1]) return 'Student Profile';
    if (mainPath === 'exams' && pathSegments[1]) return 'Exam Marks';
    if (mainPath === 'print') return 'Print Preview';

    // Specific static routes
    if (!mainPath || mainPath === 'dashboard') return 'Dashboard';
    if (mainPath === 'sba') return 'SBA';
    if (mainPath === 'sba-entry') return 'SBA Entry';
    if (mainPath === 'formative-entry') return 'Formative Assessment Entry';
    if (mainPath === 'student-report') return 'Generate HPC';
    
    // Generic formatter
    return mainPath.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const handleLogout = () => {
      if (window.confirm("Are you sure you want to logout?")) {
          logout();
      }
  };

  return (
    <header className="flex-shrink-0 flex items-center justify-between p-2 bg-card border-b border-border h-16 z-20 print:hidden">
      <div className="flex items-center gap-3 pl-2">
        {isDashboard ? (
          <>
            <div className="h-10 w-10 flex items-center justify-center bg-primary/10 rounded-lg">
              <SchoolIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-br from-foreground from-50% to-foreground/60">
                  School Management Pro
              </h1>
            </div>
          </>
        ) : (
          <>
            <button
              onClick={() => navigate(-1)}
              className="p-2.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-foreground from-50% to-foreground/60">
                {getPageTitle()}
            </h1>
          </>
        )}
      </div>

      <div className="flex items-center justify-end gap-2">
        {isAuthenticated && (
             <button
              onClick={handleLogout}
              className="p-2.5 rounded-full hover:bg-red-500/10 text-red-500 transition-colors"
              aria-label="Logout"
              title="Logout"
            >
              <LogOutIcon className="w-6 h-6" />
            </button>
        )}
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
