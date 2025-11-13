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
    
    // Specific handling for nested routes
    if (pathSegments[0] === 'reports' && pathSegments[1] === 'generate-certificate') {
        return 'Generate Certificates';
    }
    
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

  return (
    <header className="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-card border-b border-border z-20 print:hidden">
      <div className="flex items-center gap-3">
        {isDashboard ? (
          <>
            {schoolDetails?.logo ? (
              <img src={schoolDetails.logo} alt="School Logo" className="h-10 w-auto object-contain rounded-md" />
            ) : (
              <div className="h-10 w-10 flex items-center justify-center bg-primary/10 rounded-lg">
                <SchoolIcon className="w-6 h-6 text-primary" />
              </div>
            )}
            <div>
              <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-br from-foreground from-50% to-foreground/60">
                  {schoolDetails?.name || 'School Management Pro V2'}
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