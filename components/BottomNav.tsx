import React from 'react';
import { NavLink } from 'react-router-dom';
import { DashboardIcon, StudentsIcon, SettingsIcon, ReportsIcon, HolisticIcon } from './icons';

const BottomNav: React.FC = () => {
  const navItems = [
    { to: "/dashboard", icon: <DashboardIcon className="w-5 h-5" />, label: "Dashboard" },
    { to: "/students", icon: <StudentsIcon className="w-5 h-5" />, label: "Students" },
    { to: "/sba", icon: <HolisticIcon className="w-5 h-5" />, label: "SBA" },
    { to: "/reports", icon: <ReportsIcon className="w-5 h-5" />, label: "Reports" },
    { to: "/settings", icon: <SettingsIcon className="w-5 h-5" />, label: "Settings" },
  ];

  const linkClasses = "flex flex-col items-center justify-center flex-1 p-2 transition-all duration-200 text-foreground/70 hover:text-primary rounded-xl";
  
  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 h-16 w-[95%] max-w-sm bg-card rounded-2xl shadow-lg flex md:hidden z-30 p-1 gap-1">
      {navItems.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          end
          className={({ isActive }) =>
            `${linkClasses} ${isActive ? "text-primary bg-primary/10" : ""}`
          }
        >
          {item.icon}
          <span className="text-xs mt-1 font-medium">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;