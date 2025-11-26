
import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { useAppData } from '../hooks/useAppData';
import {
    SchoolIcon,
    HashIcon,
    UsersIcon,
    UserIcon,
    InfoIcon,
    BriefcaseIcon,
} from '../components/icons';
import { CLASS_OPTIONS } from '../constants';

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode; className: string; }> = ({ icon, label, value, className }) => (
    <div className={`p-3 rounded-xl flex items-center gap-3 ${className}`}>
        <div className="opacity-80">{icon}</div>
        <div>
            <p className="text-xs opacity-90 font-semibold">{label}</p>
            <p className="text-xl font-bold">{value ?? '...'}</p>
        </div>
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
    const { schoolDetails, activeSession, setActiveSession, availableSessions } = useAppData();

    const dashboardData = useLiveQuery(async () => {
        if (!activeSession) return { studentCount: 0, maleCount: 0, femaleCount: 0, classNames: [] };

        const studentSessionInfos = await db.studentSessionInfo.where({ session: activeSession }).toArray();
        const studentIds = studentSessionInfos.map(info => info.studentId);
        
        if (studentIds.length === 0) {
            return { studentCount: 0, maleCount: 0, femaleCount: 0, classNames: [] };
        }

        const students = await db.students.where('id').anyOf(studentIds).toArray();
        
        const maleCount = students.filter(s => s.gender === 'Male').length;
        const femaleCount = students.filter(s => s.gender === 'Female').length;
        
        const classNames = [...new Set(studentSessionInfos.map(info => info.className))];
        // FIX: Add explicit string types to sort callback parameters to resolve 'unknown' type error.
        const sortedClassNames = classNames.sort((a: string, b: string) => {
            const indexA = CLASS_OPTIONS.indexOf(a);
            const indexB = CLASS_OPTIONS.indexOf(b);

            if (indexA !== -1 && indexB !== -1) {
                return indexA - indexB;
            }
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            
            return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
        });

        return {
            studentCount: students.length,
            maleCount,
            femaleCount,
            classNames: sortedClassNames,
        };
    }, [activeSession]);
    
    return (
        <div className="flex flex-col gap-6 animate-fade-in pb-8">
            
            {/* School Identity Section */}
            <div className="flex flex-col items-center justify-center pt-4 pb-2">
                {schoolDetails?.logo ? (
                    <img 
                        src={schoolDetails.logo} 
                        alt="School Logo" 
                        className="h-20 w-20 object-contain mb-2 drop-shadow-md" 
                    />
                ) : (
                    <div className="h-16 w-16 flex items-center justify-center bg-primary/10 rounded-full mb-2">
                        <SchoolIcon className="w-8 h-8 text-primary" />
                    </div>
                )}
                <h1 className="text-xl font-bold text-center text-foreground uppercase tracking-wide px-4 leading-tight">
                    {schoolDetails?.name || 'Your School Name'}
                </h1>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <StatCard icon={<HashIcon className="w-5 h-5"/>} label="UDISE" value={schoolDetails?.udiseCode || 'N/A'} className="bg-slate-500 text-white"/>
                <StatCard icon={<UsersIcon className="w-5 h-5"/>} label="Students" value={dashboardData?.studentCount ?? 0} className="bg-primary text-primary-foreground"/>
                <StatCard icon={<UserIcon className="w-5 h-5"/>} label="Boys" value={dashboardData?.maleCount ?? 0} className="bg-sky-500 text-white"/>
                <StatCard icon={<UserIcon className="w-5 h-5"/>} label="Girls" value={dashboardData?.femaleCount ?? 0} className="bg-pink-500 text-white"/>
            </div>
            
            <div className="p-4 bg-card rounded-xl text-center shadow-sm">
                <label htmlFor="session-select" className="text-sm font-semibold text-foreground/70">Active Session</label>
                <select
                    id="session-select"
                    value={activeSession}
                    onChange={(e) => setActiveSession(e.target.value)}
                    className="w-full mt-1 p-2 bg-background border border-border rounded-md text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label="Select active session"
                >
                    {availableSessions.length > 0 ? availableSessions.map(session => (
                        <option key={session} value={session}>{session}</option>
                    )) : <option>{activeSession}</option>}
                </select>
            </div>
            
            <section className="flex flex-col gap-3">
                 <SectionHeader icon={<BriefcaseIcon className="w-5 h-5 text-foreground/70"/>} title="Navigate Classes" />
                 <div className="flex flex-wrap gap-2">
                    {dashboardData?.classNames.map(className => (
                        <button 
                            key={className} 
                            onClick={() => navigate('/students', { state: { preselectedClass: className } })}
                            className="py-2 px-4 bg-card border border-border rounded-lg text-sm font-semibold hover-lift"
                        >
                            {className}
                        </button>
                    ))}
                    {(!dashboardData || dashboardData.classNames.length === 0) && (
                        <p className="text-xs text-foreground/60 w-full text-center p-4">No classes found for this session. Add students to see classes here.</p>
                    )}
                 </div>
                 <div className="flex items-center gap-2 text-xs text-foreground/60 p-2 bg-blue-500/10 rounded-lg">
                    <InfoIcon className="w-4 h-4 text-blue-500"/>
                    <span>Click a class button to view students for the current session.</span>
                 </div>
            </section>
        </div>
    );
};

export default Dashboard;
