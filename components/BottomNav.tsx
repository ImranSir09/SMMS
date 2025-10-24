
import React from 'react';
// FIX: Updated NavLink usage to react-router-dom v6 syntax.
import { NavLink } from 'react-router-dom';
import { DashboardIcon, StudentsIcon, SettingsIcon, ReportsIcon, ClipboardListIcon } from './icons';

const BottomNav: React.FC = () => {
  const navItems = [
    { to: "/dashboard", icon: <DashboardIcon className="w-5 h-5" />, label: "Dashboard" },
    { to: "/students", icon: <StudentsIcon className="w-5 h-5" />, label: "Students" },
    { to: "/reports", icon: <ReportsIcon className="w-5 h-5" />, label: "Reports" },
    { to: "/sba", icon: <ClipboardListIcon className="w-5 h-5" />, label: "SBA" },
    { to: "/settings", icon: <SettingsIcon className="w-5 h-5" />, label: "Settings" },
  ];

  const linkClasses = "flex flex-col items-center justify-center flex-1 p-1 transition-colors";
  const activeClassName = "text-primary";
  const inactiveClassName = "text-foreground/60 hover:text-primary";

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border flex md:hidden z-30">
      {navItems.map(item => (
        // FIX: Updated NavLink from v5 to v6 syntax. Replaced className/activeClassName props with a className function.
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => `${linkClasses} ${isActive ? activeClassName : inactiveClassName}`}
        >
          {item.icon}
          <span className="text-xs mt-1 font-medium">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;
