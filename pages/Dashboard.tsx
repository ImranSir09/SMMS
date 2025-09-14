
import React, { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import Card from '../components/Card';
import { StudentsIcon, StaffIcon, ExamsIcon, SchoolIcon } from '../components/icons';
import DoughnutChart from '../components/DoughnutChart';
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
    const students = useLiveQuery(() => db.students.toArray(), []);
    const staff = useLiveQuery(() => db.staff.toArray(), []);
    const exams = useLiveQuery(() => db.exams.count(), [], 0);

    const { chartData, recentStudents, recentStaff, genderCounts } = useMemo(() => {
        const classCounts: { [key: string]: number } = {};
        let recentStudents: Student[] = [];
        const genderCounts = { male: 0, female: 0, other: 0 };

        if (students) {
            students.forEach(student => {
                classCounts[student.className] = (classCounts[student.className] || 0) + 1;
                if (student.gender === 'Male') {
                    genderCounts.male++;
                } else if (student.gender === 'Female') {
                    genderCounts.female++;
                } else {
                    genderCounts.other++;
                }
            });
            recentStudents = [...students].sort((a, b) => (b.id || 0) - (a.id || 0)).slice(0, 4);
        }
        
        const chartData = Object.entries(classCounts)
            .map(([label, value]) => ({ label, value }))
            .sort((a, b) => b.value - a.value);

        const recentStaff: Staff[] = staff ? [...staff].sort((a, b) => (b.id || 0) - (a.id || 0)).slice(0, 4) : [];
        
        return { chartData, recentStudents, recentStaff, genderCounts };

    }, [students, staff]);

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

    return (
        <div className="flex flex-col gap-3 animate-fade-in">
             {/* School Header */}
            <div className="flex-shrink-0 flex items-center gap-3 p-3 bg-card rounded-lg shadow-sm">
                {schoolDetails?.logo ? (
                    <img src={schoolDetails.logo} alt="School Logo" className="w-12 h-12 object-contain rounded-md" />
                ) : (
                    <div className="w-12 h-12 flex items-center justify-center bg-primary/10 rounded-full">
                        <SchoolIcon className="w-6 h-6 text-primary" />
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
            <div className="flex-1 grid grid-cols-2 grid-rows-[auto_1fr_auto] gap-3">
                {/* At a Glance */}
                <Card className="col-span-2 p-2 space-y-2">
                    <h3 className="text-sm font-bold px-1">At a Glance</h3>
                    <div className="grid grid-cols-3 gap-2">
                        <StatCard
                            icon={<StudentsIcon />}
                            label="Students"
                            value={
                                students ? (
                                    <div className="flex items-baseline gap-2">
                                        <span>{students.length}</span>
                                        <span className="text-xs font-normal text-foreground/70">
                                            ({genderCounts.male} Boys / {genderCounts.female} Girls)
                                        </span>
                                    </div>
                                ) : '...'
                            }
                            onClick={() => navigate('/students')}
                        />
                        <StatCard icon={<StaffIcon />} label="Staff" value={staff?.length} onClick={() => navigate('/staff')} />
                        <StatCard icon={<ExamsIcon />} label="Exams" value={exams} onClick={() => navigate('/exams')} />
                    </div>
                </Card>
                
                {/* Class Distribution */}
                <Card className="p-2 flex flex-col">
                    <h3 className="text-sm font-bold px-1 mb-1">Class Distribution</h3>
                    <div className="flex-1 flex items-center justify-center">
                        {chartData && chartData.length > 0 ? (
                        <DoughnutChart data={chartData} />
                        ) : (
                            <p className="text-foreground/60 text-xs text-center">No student data for chart.</p>
                        )}
                    </div>
                </Card>

                {/* Recently Added Staff */}
                <Card className="p-2 flex flex-col">
                    <div className="flex justify-between items-center px-1 mb-1">
                        <h3 className="text-sm font-bold">Recent Staff</h3>
                        <span onClick={() => navigate('/staff')} className="text-xs text-primary hover:underline cursor-pointer">View all</span>
                    </div>
                    {recentStaff.length > 0 ? (
                        <ul className="space-y-1 overflow-y-auto">
                            {recentStaff.map(s => <QuickListItem key={s.id} photo={s.photo} name={s.name} detail={s.designation} onClick={() => navigate(`/staff/${s.id}`)} />)}
                        </ul>
                    ) : (
                        <p className="text-center text-xs text-foreground/60 pt-2">No staff added yet.</p>
                    )}
                </Card>

                {/* Recently Added Students */}
                <Card className="col-span-2 p-2">
                     <div className="flex justify-between items-center px-1 mb-1">
                        <h3 className="text-sm font-bold">Recent Students</h3>
                        <span onClick={() => navigate('/students')} className="text-xs text-primary hover:underline cursor-pointer">View all</span>
                    </div>
                    {recentStudents.length > 0 ? (
                        <ul className="grid grid-cols-2 gap-x-2 gap-y-1">
                            {recentStudents.map(s => <QuickListItem key={s.id} photo={s.photo} name={s.name} detail={`Class ${s.className}`} onClick={() => navigate(`/student/${s.id}`)} />)}
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
