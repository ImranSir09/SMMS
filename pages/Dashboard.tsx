

import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import Card from '../components/Card';
import { StudentsIcon, StaffIcon, ExamsIcon, SchoolIcon, BarChart3Icon, PieChartIcon, BriefcaseIcon, UsersIcon } from '../components/icons';
import HorizontalBarChart from '../components/HorizontalBarChart';
import { Student, Staff } from '../types';
import { useAppData } from '../hooks/useAppData';

type StatCardProps = {
    icon: React.ReactElement<{ className?: string }>;
    label: string;
    value: React.ReactNode;
    onClick?: () => void;
};

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, onClick }) => (
    <div onClick={onClick} className={`bg-card text-card-foreground p-2 rounded-lg flex items-center gap-2 ${onClick ? 'cursor-pointer hover-lift' : ''}`}>
        <div className="w-8 h-8 rounded-md flex items-center justify-center bg-primary/20 text-primary">
            {React.cloneElement(icon, { className: 'w-5 h-5' })}
        </div>
        <div>
            <p className="text-xs text-foreground/70">{label}</p>
            <div className="text-md font-bold">{value ?? '...'}</div>
        </div>
    </div>
);

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { schoolDetails } = useAppData();

    const dashboardData = useLiveQuery(async () => {
        const [
            studentCount,
            maleCount,
            femaleCount,
            otherCount,
            staffCount,
            examCount,
            recentStudents,
            recentStaff,
            classNames,
        ] = await Promise.all([
            db.students.count(),
            db.students.where({ gender: 'Male' }).count(),
            db.students.where({ gender: 'Female' }).count(),
            db.students.where({ gender: 'Other' }).count(),
            db.staff.count(),
            db.exams.count(),
            db.students.orderBy('id').reverse().limit(4).toArray(),
            db.staff.orderBy('id').reverse().limit(4).toArray(),
            db.students.orderBy('className').uniqueKeys(),
        ]);
        
        const classCounts = await Promise.all(
            (classNames as string[]).map(async (name) => ({
                label: name,
                value: await db.students.where({ className: name }).count(),
            }))
        );

        return {
            studentCount,
            genderCounts: { male: maleCount, female: femaleCount, other: otherCount },
            staffCount,
            examCount,
            recentStudents,
            recentStaff,
            chartData: classCounts.sort((a,b) => b.value - a.value),
        };
    }, []);

    const QuickListItem: React.FC<{ photo: string | null; name: string; detail: string; onClick: () => void; }> = ({ photo, name, detail, onClick }) => (
        <li onClick={onClick} className="flex items-center gap-2 p-1 rounded-md cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
            {photo ? (
                <img src={photo} alt={name} className="w-8 h-8 rounded-full object-cover"/>
            ) : (
                 <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0"></div>
            )}
            <div className="truncate">
                <p className="font-semibold text-xs truncate">{name}</p>
                <p className="text-[10px] text-foreground/60 truncate">{detail}</p>
            </div>
        </li>
    );
    
    const SectionHeader: React.FC<{ icon: React.ReactNode; title: string; action?: React.ReactNode; }> = ({ icon, title, action }) => (
        <div className="flex justify-between items-center px-1 mb-1">
            <div className="flex items-center gap-1.5">
                {icon}
                <h3 className="text-sm font-bold">{title}</h3>
            </div>
            {action}
        </div>
    );

    return (
        <div className="flex flex-col gap-3 animate-fade-in">
             {/* School Header */}
            <div className="flex-shrink-0 flex items-center gap-4 p-3 bg-card rounded-lg shadow-sm">
                {schoolDetails?.logo ? (
                    <img src={schoolDetails.logo} alt="School Logo" className="w-16 h-16 object-contain rounded-md" />
                ) : (
                    <div className="w-16 h-16 flex items-center justify-center bg-primary/10 rounded-full">
                        <SchoolIcon className="w-8 h-8 text-primary" />
                    </div>
                )}
                <div>
                    <h2 className="text-xl font-gothic font-bold text-foreground">
                        {schoolDetails?.name || 'School Name'}
                    </h2>
                    <p className="text-xs text-foreground/70">
                        {schoolDetails?.phone && <span>Ph: {schoolDetails.phone}</span>}
                        {schoolDetails?.udiseCode && <span className="ml-2">| UDISE: {schoolDetails.udiseCode}</span>}
                    </p>
                </div>
            </div>
            
            {/* Main content grid */}
            <div className="flex-1 grid grid-cols-2 gap-3">
                {/* At a Glance */}
                <Card className="col-span-2 p-2 space-y-2">
                    <SectionHeader icon={<BarChart3Icon className="w-4 h-4 text-foreground/60" />} title="At a Glance" />
                    <div className="grid grid-cols-3 gap-2">
                        <StatCard
                            icon={<StudentsIcon />}
                            label="Students"
                            value={
                                dashboardData ? (
                                    <div className="flex flex-col items-start">
                                        <span>{dashboardData.studentCount}</span>
                                        <span className="text-xs font-normal text-foreground/70">
                                            ({dashboardData.genderCounts.male}M / {dashboardData.genderCounts.female}F)
                                        </span>
                                    </div>
                                ) : '...'
                            }
                            onClick={() => navigate('/students')}
                        />
                        <StatCard icon={<StaffIcon />} label="Staff" value={dashboardData?.staffCount} onClick={() => navigate('/staff')} />
                        <StatCard icon={<ExamsIcon />} label="Exams" value={dashboardData?.examCount} onClick={() => navigate('/exams')} />
                    </div>
                </Card>
                
                {/* Class Distribution */}
                <Card className="col-span-2 p-2 flex flex-col">
                    <SectionHeader icon={<PieChartIcon className="w-4 h-4 text-foreground/60" />} title="Class Distribution" />
                    <HorizontalBarChart data={dashboardData?.chartData || []} />
                </Card>

                {/* Recently Added Staff */}
                <Card className="p-2 flex flex-col">
                     <SectionHeader 
                        icon={<BriefcaseIcon className="w-4 h-4 text-foreground/60" />} 
                        title="Recent Staff" 
                        action={<span onClick={() => navigate('/staff')} className="text-xs text-primary hover:underline cursor-pointer">View all</span>}
                    />
                    {dashboardData && dashboardData.recentStaff.length > 0 ? (
                        <ul className="space-y-1 overflow-y-auto">
                            {dashboardData.recentStaff.map(s => <QuickListItem key={s.id} photo={s.photo} name={s.name} detail={s.designation} onClick={() => navigate(`/staff/${s.id}`)} />)}
                        </ul>
                    ) : (
                        <p className="text-center text-xs text-foreground/60 pt-2">No staff added yet.</p>
                    )}
                </Card>

                {/* Recently Added Students */}
                <Card className="p-2 flex flex-col">
                      <SectionHeader 
                        icon={<UsersIcon className="w-4 h-4 text-foreground/60" />} 
                        title="Recent Students" 
                        action={<span onClick={() => navigate('/students')} className="text-xs text-primary hover:underline cursor-pointer">View all</span>}
                    />
                    {dashboardData && dashboardData.recentStudents.length > 0 ? (
                        <ul className="space-y-1 overflow-y-auto">
                            {dashboardData.recentStudents.map(s => <QuickListItem key={s.id} photo={s.photo} name={s.name} detail={`Class ${s.className}`} onClick={() => navigate(`/student/${s.id}`)} />)}
                        </ul>
                    ) : (
                        <p className="text-center text-xs text-foreground/60 py-2">No students added yet.</p>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;