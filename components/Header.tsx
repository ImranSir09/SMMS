import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppData } from '../hooks/useAppData';
import { SunIcon, MoonIcon, ArrowLeftIcon, SchoolIcon } from './icons';

const Header: React.FC = () => {
  const { theme, toggleTheme, schoolDetails } = useAppData();
  const location = useLocation();
  const navigate = useNavigate();

  const isDashboard = location.pathname === '/' || location.pathname === '/dashboard';

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

  return (
    <header className="flex-shrink-0 flex items-center justify-between p-2 bg-card border-b border-border h-16 z-20">
      <div className="flex items-center gap-3">
        {isDashboard ? (
          <>
            {schoolDetails?.logo ? (
              <img src={schoolDetails.logo} alt="School Logo" className="h-12 w-auto object-contain rounded-md" />
            ) : (
              <div className="h-12 w-12 flex items-center justify-center bg-primary/10 rounded-md">
                <SchoolIcon className="w-7 h-7 text-primary" />
              </div>
            )}
            <div>
              <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-br from-foreground from-50% to-foreground/60">
                  {schoolDetails?.name || 'School Management Pro'}
              </h1>
              <p className="text-[10px] text-foreground/70 -mt-1">by Imran Gani Mugloo Teacher Zone Vailoo</p>
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