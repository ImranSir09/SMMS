import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3Icon, ClipboardListIcon, EditIcon, HolisticIcon } from '../components/icons';

const SbaButton: React.FC<{ title: string; onClick: () => void; icon: React.ReactNode }> = ({ title, onClick, icon }) => (
    <button onClick={onClick} className="w-full bg-card text-card-foreground p-4 rounded-lg flex items-center gap-4 border border-border shadow-sm hover-lift text-left">
        <div className="text-primary">
            {icon}
        </div>
        <span className="font-semibold">{title}</span>
    </button>
);


const SBA: React.FC = () => {
    const navigate = useNavigate();

    const menuItems = [
        {
            title: "School Based Assessment Entry",
            icon: <ClipboardListIcon className="w-6 h-6" />,
            path: "/sba-entry"
        },
        {
            title: "Formative Assessment Entry",
            icon: <EditIcon className="w-6 h-6" />,
            path: "/formative-entry"
        },
        {
            title: "Holistic Progress Card",
            icon: <HolisticIcon className="w-6 h-6" />,
            path: "/student-report"
        },
        {
            title: "Formative Assessment Report",
            icon: <BarChart3Icon className="w-6 h-6" />,
            path: "#"
        },
        {
            title: "Co-Curricular Activity Report",
            icon: <BarChart3Icon className="w-6 h-6" />,
            path: "#"
        },
        {
            title: "SBA Result Sheet",
            icon: <BarChart3Icon className="w-6 h-6" />,
            path: "#"
        }
    ];

    return (
        <div className="flex flex-col gap-4 animate-fade-in">
            <header className="p-3 bg-card rounded-lg shadow-sm text-center">
                <h1 className="text-xl font-bold">School Based Assessment</h1>
            </header>
            <div className="flex flex-col gap-3">
                {menuItems.map(item => (
                    <SbaButton
                        key={item.title}
                        title={item.title}
                        icon={item.icon}
                        onClick={() => item.path === '#' ? alert('This feature is not yet implemented.') : navigate(item.path)}
                    />
                ))}
            </div>
        </div>
    );
};

export default SBA;