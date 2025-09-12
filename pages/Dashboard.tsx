import React, { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import Card from '../components/Card';
import { StudentsIcon, StaffIcon, ExamsIcon } from '../components/icons';
import DoughnutChart from '../components/DoughnutChart';
import { Student, Staff } from '../types';

type StatCardProps = {
    icon: React.ReactElement<{ className?: string }>;
    label: string;
    value: number | string | undefined;
    onClick?: () => void;
};

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, onClick }) => (
    <div onClick={onClick} className={`bg-card text-card-foreground p-2 rounded-lg flex items-center gap-2 ${onClick ? 'cursor-pointer hover-lift' : ''}`}>
        <div className="w-8 h-8 rounded-md flex items-center justify-center bg-primary/20 text-primary">
            {React.cloneElement(icon, { className: 'w-5 h-5' })}
        </div>
        <div>
            <p className="text-xs text-foreground/70">{label}</p>
            <p className="text-md font-bold">{value ?? '...'}</p>
        </div>
    </div>
);

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const students = useLiveQuery(() => db.students.toArray(), []);
    const staff = useLiveQuery(() => db.staff.toArray(), []);
    const exams = useLiveQuery(() => db.exams.count(), [], 0);

    const { chartData, recentStudents, recentStaff } = useMemo(() => {
        const classCounts: { [key: string]: number } = {};
        let recentStudents: Student[] = [];
        if (students) {
            students.forEach(student => {
                classCounts[student.className] = (classCounts[student.className] || 0) + 1;
            });
            recentStudents = [...students].sort((a, b) => (b.id || 0) - (a.id || 0)).slice(0, 4);
        }
        
        const chartData = Object.entries(classCounts)
            .map(([label, value]) => ({ label, value }))
            .sort((a, b) => b.value - a.value);

        const recentStaff: Staff[] = staff ? [...staff].sort((a, b) => (b.id || 0) - (a.id || 0)).slice(0, 4) : [];
        
        return { chartData, recentStudents, recentStaff };

    }, [students, staff]);

    const QuickListItem: React.FC<{ photo: string | null; name: string; detail: string; }> = ({ photo, name, detail }) => (
        <li className="flex items-center gap-2 p-1 rounded-md">
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
        <div className="h-full grid grid-cols-2 grid-rows-3 gap-3 animate-fade-in">
            {/* At a Glance */}
            <Card className="col-span-2 p-2 space-y-2">
                <h3 className="text-sm font-bold px-1">At a Glance</h3>
                <div className="grid grid-cols-3 gap-2">
                    <StatCard icon={<StudentsIcon />} label="Students" value={students?.length} onClick={() => navigate('/students')} />
                    <StatCard icon={<StaffIcon />} label="Staff" value={staff?.length} onClick={() => navigate('/staff')} />
                    <StatCard icon={<ExamsIcon />} label="Exams" value={exams} onClick={() => navigate('/exams')} />
                </div>
            </Card>
            
            {/* Class Distribution */}
            <Card className="row-span-2 p-2 flex flex-col">
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
                <h3 className="text-sm font-bold px-1 mb-1">Recent Staff</h3>
                {recentStaff.length > 0 ? (
                     <ul className="space-y-1 overflow-y-auto">
                        {recentStaff.map(s => <QuickListItem key={s.id} photo={s.photo} name={s.name} detail={s.designation} />)}
                    </ul>
                ) : (
                     <p className="text-center text-xs text-foreground/60 pt-2">No staff added yet.</p>
                )}
            </Card>

            {/* Recently Added Students */}
            <Card className="col-span-2 p-2">
                <h3 className="text-sm font-bold px-1 mb-1">Recent Students</h3>
                 {recentStudents.length > 0 ? (
                    <ul className="grid grid-cols-2 gap-x-2 gap-y-1">
                        {recentStudents.map(s => <QuickListItem key={s.id} photo={s.photo} name={s.name} detail={`Class ${s.className}`} />)}
                    </ul>
                ) : (
                    <p className="text-center text-xs text-foreground/60 py-2">No students added yet.</p>
                )}
            </Card>
        </div>
    );
};

export default Dashboard;