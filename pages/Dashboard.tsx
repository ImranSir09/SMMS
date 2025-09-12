import React, { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';
import Card from '../components/Card';
import { StudentsIcon, StaffIcon, ExamsIcon } from '../components/icons';
import DoughnutChart from '../components/DoughnutChart';
import { Student, Staff } from '../types';

type StatCardProps = {
    icon: React.ReactElement<{ className?: string }>;
    label: string;
    value: number | string | undefined;
    color: 'primary' | 'accent' | 'success';
};

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color }) => {
    const colorClasses = {
        primary: 'bg-primary/20 text-primary',
        accent: 'bg-accent/20 text-accent',
        success: 'bg-success/20 text-success',
    };

    return (
        <Card className="p-4 flex items-center gap-4 hover-lift">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
                {React.cloneElement(icon, { className: 'w-6 h-6' })}
            </div>
            <div>
                <p className="text-sm text-foreground/70">{label}</p>
                <p className="text-2xl font-bold">{value ?? '...'}</p>
            </div>
        </Card>
    );
};

const Dashboard: React.FC = () => {
    const students = useLiveQuery(() => db.students.toArray(), []);
    const staff = useLiveQuery(() => db.staff.toArray(), []);
    // FIX: Provided an empty dependency array as the second argument to useLiveQuery.
    const exams = useLiveQuery(() => db.exams.count(), [], 0);

    const { chartData, recentStudents, recentStaff } = useMemo(() => {
        const classCounts: { [key: string]: number } = {};
        let recentStudents: Student[] = [];
        if (students) {
            students.forEach(student => {
                classCounts[student.className] = (classCounts[student.className] || 0) + 1;
            });
            recentStudents = [...students].sort((a, b) => (b.id || 0) - (a.id || 0)).slice(0, 5);
        }
        
        const chartData = Object.entries(classCounts)
            .map(([label, value]) => ({ label, value }))
            .sort((a, b) => b.value - a.value);

        const recentStaff: Staff[] = staff ? [...staff].sort((a, b) => (b.id || 0) - (a.id || 0)).slice(0, 5) : [];
        
        return { chartData, recentStudents, recentStaff };

    }, [students, staff]);

    const QuickListItem: React.FC<{ photo: string | null; name: string; detail: string; }> = ({ photo, name, detail }) => (
        <li className="flex items-center gap-3 p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5">
            {photo ? (
                <img src={photo} alt={name} className="w-10 h-10 rounded-full object-cover"/>
            ) : (
                 <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0"></div>
            )}
            <div className="truncate">
                <p className="font-semibold text-sm truncate">{name}</p>
                <p className="text-xs text-foreground/60 truncate">{detail}</p>
            </div>
        </li>
    );

    return (
        <div className="animate-fade-in-up space-y-6">
            {/* At a Glance */}
            <section>
                <h2 className="text-xl font-bold mb-4">At a Glance</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard icon={<StudentsIcon />} label="Total Students" value={students?.length} color="primary" />
                    <StatCard icon={<StaffIcon />} label="Total Staff" value={staff?.length} color="accent" />
                    <StatCard icon={<ExamsIcon />} label="Exams Created" value={exams} color="success" />
                </div>
            </section>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 {/* Class Distribution */}
                <section className="lg:col-span-2">
                    <h2 className="text-xl font-bold mb-4">Class Distribution</h2>
                    <Card className="p-6 h-96 flex items-center justify-center">
                        {chartData && chartData.length > 0 ? (
                           <DoughnutChart data={chartData} />
                        ) : (
                            <p className="text-foreground/60">No student data available to display chart.</p>
                        )}
                    </Card>
                </section>

                {/* Recently Added Staff */}
                <section>
                    <h2 className="text-xl font-bold mb-4">Recent Staff</h2>
                    <Card className="p-4 h-96 overflow-y-auto">
                        {recentStaff.length > 0 ? (
                             <ul className="space-y-2">
                                {recentStaff.map(s => <QuickListItem key={s.id} photo={s.photo} name={s.name} detail={s.designation} />)}
                            </ul>
                        ) : (
                             <p className="text-center text-sm text-foreground/60 pt-4">No staff members have been added yet.</p>
                        )}
                    </Card>
                </section>
            </div>

            {/* Recently Added Students */}
            <section>
                <h2 className="text-xl font-bold mb-4">Recently Added Students</h2>
                <Card className="p-4">
                    {recentStudents.length > 0 ? (
                        <ul className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
                            {recentStudents.map(s => <QuickListItem key={s.id} photo={s.photo} name={s.name} detail={`Class ${s.className} | Roll ${s.rollNo}`} />)}
                        </ul>
                    ) : (
                        <p className="text-center text-sm text-foreground/60 py-4">No students have been added yet.</p>
                    )}
                </Card>
            </section>
        </div>
    );
};

export default Dashboard;