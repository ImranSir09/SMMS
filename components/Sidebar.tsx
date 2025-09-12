import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAppData } from '../hooks/useAppData';
import { DashboardIcon, StudentsIcon, StaffIcon, ExamsIcon, ReportsIcon, SettingsIcon, SchoolIcon, CertificateIcon, TimetableIcon } from './icons';

const Sidebar: React.FC = () => {
  const { schoolDetails } = useAppData();

  const navLinkClasses = "flex items-center p-3 my-1 rounded-md transition-colors duration-200";
  const activeClassName = "bg-primary text-primary-foreground shadow";
  const inactiveClassName = "text-foreground hover:bg-black/10 dark:hover:bg-white/10";

  const navItems = [
    { to: "/dashboard", icon: <DashboardIcon className="w-5 h-5" />, label: "Dashboard" },
    { to: "/students", icon: <StudentsIcon className="w-5 h-5" />, label: "Students" },
    { to: "/staff", icon: <StaffIcon className="w-5 h-5" />, label: "Staff" },
    { to: "/exams", icon: <ExamsIcon className="w-5 h-5" />, label: "Exams" },
    { to: "/timetable", icon: <TimetableIcon className="w-5 h-5" />, label: "Timetable" },
    { to: "/certificates", icon: <CertificateIcon className="w-5 h-5" />, label: "Certificates" },
    { to: "/reports", icon: <ReportsIcon className="w-5 h-5" />, label: "Reports" },
    { to: "/settings", icon: <SettingsIcon className="w-5 h-5" />, label: "Settings" },
  ];

  return (
      <aside className={`hidden md:flex fixed top-0 left-0 h-full w-64 bg-card text-card-foreground flex-col z-40`}>
        <div className="flex items-center justify-start p-4 border-b border-border h-16">
          <div className="flex items-center gap-3">
             {schoolDetails?.logo ? (
                <img src={schoolDetails.logo} alt="School Logo" className="w-8 h-8 rounded-md object-cover"/>
             ) : (
                <SchoolIcon className="w-8 h-8 text-primary"/>
             )}
            <span className="text-lg font-bold truncate font-gothic">{schoolDetails?.name || 'Aegis'}</span>
          </div>
        </div>
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul>
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) => `${navLinkClasses} ${isActive ? activeClassName : inactiveClassName}`}
                >
                  {item.icon}
                  <span className="ml-3">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
  );
};

export default Sidebar;