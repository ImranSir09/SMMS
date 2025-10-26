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

  const linkClasses = "flex flex-col items-center justify-center flex-1 p-1 transition-colors text-foreground/60 hover:text-primary";
  const activeClassName = "text-primary";

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border flex md:hidden z-30">
      {navItems.map(item => (
        // FIX: Replaced exact and activeClassName with a className function for react-router-dom v6. The 'end' prop replicates 'exact'.
        <NavLink
          key={item.to}
          to={item.to}
          end
          className={({ isActive }) =>
            `${linkClasses} ${isActive ? activeClassName : ""}`
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
