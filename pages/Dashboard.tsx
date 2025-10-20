
import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { useAppData } from '../hooks/useAppData';
import { useToast } from '../contexts/ToastContext';
import {
    SchoolIcon,
    HashIcon,
    UsersIcon,
    UserIcon,
    StudentsIcon,
    UserListIcon,
    EditIcon,
    PrintIcon,
    BarChart3Icon,
    BookIcon,
    CalendarIcon,
    ClipboardListIcon,
    InfoIcon,
    DashboardIcon,
    BriefcaseIcon,
} from '../components/icons';

// Reusable components for the new dashboard
const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode; color: string; }> = ({ icon, label, value, color }) => (
    <div className={`p-3 rounded-xl flex items-center gap-3 ${color}`}>
        <div className="text-white/80">{icon}</div>
        <div>
            <p className="text-xs text-white/90 font-semibold">{label}</p>
            <p className="text-xl font-bold text-white">{value ?? '...'}</p>
        </div>
    </div>
);

const FeatureTile: React.FC<{ icon: React.ReactNode; label: string; color: string; onClick: () => void; }> = ({ icon, label, color, onClick }) => (
    <div
        onClick={onClick}
        className={`p-4 rounded-2xl flex flex-col justify-between h-28 cursor-pointer hover-lift ${color}`}
    >
        <div className="text-white">{icon}</div>
        <p className="font-bold text-white">{label}</p>
    </div>
);

const SectionHeader: React.FC<{ icon: React.ReactNode; title: string; }> = ({ icon, title }) => (
    <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
    </div>
);

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { schoolDetails } = useAppData();
    const { addToast } = useToast();

    const dashboardData = useLiveQuery(async () => {
        const [
            studentCount,
            maleCount,
            femaleCount,
            classNames,
        ] = await Promise.all([
            db.students.count(),
            db.students.where({ gender: 'Male' }).count(),
            db.students.where({ gender: 'Female' }).count(),
            db.students.orderBy('className').uniqueKeys(),
        ]);
        
        const sortedClassNames = (classNames as string[]).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

        return {
            studentCount,
            maleCount,
            femaleCount,
            classNames: sortedClassNames,
        };
    }, []);

    const features = [
        { label: 'Add Student', icon: <StudentsIcon className="w-6 h-6"/>, color: 'bg-green-500', path: '/students' },
        { label: 'View Admissions', icon: <UserListIcon className="w-6 h-6"/>, color: 'bg-red-500', path: '/students' },
        { label: 'Marks Entry', icon: <EditIcon className="w-6 h-6"/>, color: 'bg-blue-500', path: '/exams' },
        { label: 'Print Results', icon: <PrintIcon className="w-6 h-6"/>, color: 'bg-cyan-500', path: '/certificates' },
        { label: 'Roll Statement', icon: <BarChart3Icon className="w-6 h-6"/>, color: 'bg-yellow-500', path: '/reports' },
        { label: 'Subjects', icon: <BookIcon className="w-6 h-6"/>, color: 'bg-gray-800', path: '/exams' },
        { label: 'Time Table', icon: <CalendarIcon className="w-6 h-6"/>, color: 'bg-purple-500', action: () => addToast('Time Table feature is coming soon.', 'info') },
        { label: 'Necessary Formats', icon: <ClipboardListIcon className="w-6 h-6"/>, color: 'bg-gray-500', path: '/reports' },
    ];
    
    return (
        <div className="flex flex-col gap-6 animate-fade-in pb-8">
            {/* School Header */}
            <header className="flex items-center gap-3 p-4 bg-primary/10 rounded-xl shadow-sm border border-primary/20">
                 <div className="w-12 h-12 flex items-center justify-center bg-primary/20 rounded-full flex-shrink-0">
                    <SchoolIcon className="w-7 h-7 text-primary" />
                </div>
                <div>
                    <h1 className="text-xl font-gothic font-bold text-primary">
                        {schoolDetails?.name || 'School Name'}
                    </h1>
                </div>
            </header>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
                <StatCard icon={<HashIcon className="w-5 h-5"/>} label="UDISE" value={schoolDetails?.udiseCode || 'N/A'} color="bg-gray-400"/>
                <StatCard icon={<UsersIcon className="w-5 h-5"/>} label="Students" value={dashboardData?.studentCount ?? 0} color="bg-blue-400"/>
                <StatCard icon={<UserIcon className="w-5 h-5"/>} label="Boys" value={dashboardData?.maleCount ?? 0} color="bg-sky-400"/>
                <StatCard icon={<UserIcon className="w-5 h-5"/>} label="Girls" value={dashboardData?.femaleCount ?? 0} color="bg-pink-400"/>
            </div>
            
            {/* Session Card */}
            <div className="p-4 bg-card rounded-xl text-center shadow-sm">
                <p className="text-sm font-semibold text-foreground/70">Session</p>
                <p className="text-lg font-bold">Nov-Dec 2025</p>
            </div>
            
            {/* Quick Access Features */}
            <section className="flex flex-col gap-3">
                <SectionHeader icon={<DashboardIcon className="w-5 h-5 text-foreground/70"/>} title="Quick Access Features" />
                <div className="grid grid-cols-2 gap-3">
                    {features.map(feature => (
                        <FeatureTile 
                            key={feature.label}
                            icon={feature.icon}
                            label={feature.label}
                            color={feature.color}
                            onClick={() => feature.path ? navigate(feature.path) : feature.action?.()}
                        />
                    ))}
                </div>
            </section>
            
            {/* Navigate Classes */}
            <section className="flex flex-col gap-3">
                 <SectionHeader icon={<BriefcaseIcon className="w-5 h-5 text-foreground/70"/>} title="Navigate Classes" />
                 <div className="flex flex-wrap gap-2">
                    {dashboardData?.classNames.map(className => (
                        <button 
                            key={className} 
                            onClick={() => navigate('/students')}
                            className="py-2 px-4 bg-card border border-border rounded-lg text-sm font-semibold hover-lift"
                        >
                            {className}
                        </button>
                    ))}
                    {(!dashboardData || dashboardData.classNames.length === 0) && (
                        <p className="text-xs text-foreground/60 w-full text-center p-4">No classes found. Add students to see classes here.</p>
                    )}
                 </div>
                 <div className="flex items-center gap-2 text-xs text-foreground/60 p-2 bg-blue-500/10 rounded-lg">
                    <InfoIcon className="w-4 h-4 text-blue-500"/>
                    <span>Click a class button to view active students.</span>
                 </div>
            </section>
        </div>
    );
};

export default Dashboard;
