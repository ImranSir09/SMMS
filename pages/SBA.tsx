import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardListIcon, EditIcon, BarChart3Icon, UsersIcon, HolisticIcon } from '../components/icons';

// FIX: Explicitly typed the MenuButton component with React.FC to resolve a TypeScript error where the 'key' prop was incorrectly being considered part of the component's own props.
const MenuButton: React.FC<{ label: string, icon: React.ReactNode, onClick: () => void }> = ({ label, icon, onClick }) => (
    <button
        onClick={onClick}
        className="w-full text-left p-4 bg-card border border-border rounded-lg shadow-sm flex items-center gap-4 hover-lift transition-all duration-200"
    >
        <div className="text-primary">{icon}</div>
        <span className="font-semibold text-card-foreground">{label}</span>
    </button>
);

const SBA: React.FC = () => {
    const navigate = useNavigate();

    const menuItems = [
        { label: 'School Based Assessment Entry', icon: <ClipboardListIcon className="w-6 h-6" />, path: '/holistic-assessment' },
        { label: 'Formative Assessment Entry', icon: <EditIcon className="w-6 h-6" />, path: '/formative-assessment' },
        { label: 'Holistic Progress Card', icon: <HolisticIcon className="w-6 h-6" />, path: '/reports/student-report' },
        { label: 'Formative Assessment Report', icon: <BarChart3Icon className="w-6 h-6" />, path: '/reports/formative-assessment-record' },
        { label: 'Co-Curricular Activity Report', icon: <BarChart3Icon className="w-6 h-6" />, path: '/reports/co-curricular-record' },
        { label: 'SBA Result Sheet', icon: <BarChart3Icon className="w-6 h-6" />, path: '/reports/sba-result-sheet' },
    ];

    return (
        <div className="animate-fade-in-up p-2 space-y-4">
            <header className="text-center p-4 rounded-lg bg-card border border-border">
                <h1 className="text-2xl font-bold font-gothic text-red-700 dark:text-red-500">School Based Assessment</h1>
            </header>
            <div className="space-y-3">
                {menuItems.map(item => (
                    <MenuButton key={item.label} label={item.label} icon={item.icon} onClick={() => navigate(item.path)} />
                ))}
            </div>
        </div>
    );
};

export default SBA;