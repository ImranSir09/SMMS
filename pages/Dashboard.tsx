import React, { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import Card from '../components/Card';
import { StudentsIcon, StaffIcon, ExamsIcon, TimetableIcon, PlusIcon } from '../components/icons';

type StatCardProps = {
    icon: React.ReactElement<{ className?: string }>;
    label: string;
    value: number | string | undefined;
    color: 'primary' | 'accent' | 'success' | 'blue';
};

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color }) => {
    const colorClasses = {
        primary: 'bg-primary/20 text-primary',
        accent: 'bg-accent/20 text-accent',
        success: 'bg-success/20 text-success',
        blue: 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
    };

    return (
        <Card className="p-4 flex items-center gap-4 hover-lift">
            <div className={`p-3 rounded-full ${colorClasses[color]}`}>
                {/* FIX: Resolved TypeScript error by updating StatCardProps to ensure the icon prop type accepts a className. */}
                {React.cloneElement(icon, { className: "w-6 h-6" })}
            </div>
            <div>
                <p className="text-sm text-foreground/80">{label}</p>
                <p className="text-2xl font-bold">{value ?? '...'}</p>
            </div>
        </Card>
    );
};

const Dashboard: React.FC = () => {
    const navigate = useNavigate();

    const studentCount = useLiveQuery(() => db.students.count(), []);
    const staffCount = useLiveQuery(() => db.staff.count(), []);
    const examCount = useLiveQuery(() => db.exams.count(), []);
    const recentStudents = useLiveQuery(() => db.students.orderBy('id').reverse().limit(5).toArray(), []);
    
    const allStaff = useLiveQuery(() => db.staff.toArray(), []);
    const staffMap = useMemo(() => {
        const map = new Map<number, string>();
        allStaff?.forEach(s => s.id && map.set(s.id, s.name));
        return map;
    }, [allStaff]);
    
    const dayName = useMemo(() => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[new Date().getDay()];
    }, []);

    const todaysSlots = useLiveQuery(() => 
        dayName !== 'Sunday' 
        ? db.timetable.where('day').equals(dayName).sortBy('period') 
        : Promise.resolve([]),
    [dayName]);
    
    const PERIOD_TIMES: { [key: number]: string } = {
        1: '09-10 AM', 2: '10-11 AM', 3: '11-12 PM', 4: '12-01 PM',
        5: '02-03 PM', 6: '03-04 PM', 7: '04-05 PM', 8: '05-06 PM',
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Main Content Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Stat Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard icon={<StudentsIcon />} label="Total Students" value={studentCount} color="primary" />
                        <StatCard icon={<StaffIcon />} label="Total Staff" value={staffCount} color="accent" />
                        <StatCard icon={<ExamsIcon />} label="Total Exams" value={examCount} color="success" />
                    </div>

                    {/* Today's Schedule Card */}
                    <Card className="p-6">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <TimetableIcon className="w-5 h-5 text-primary" />
                            Today's Schedule ({dayName})
                        </h2>
                        {dayName === 'Sunday' || !todaysSlots || todaysSlots.length === 0 ? (
                             <div className="text-center py-8 text-foreground/60">
                                {dayName === 'Sunday' ? "It's Sunday! Enjoy the day off." : "No classes scheduled for today."}
                             </div>
                        ) : (
                            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                               {todaysSlots.map(slot => (
                                   <div key={slot.id} className="flex items-center gap-4 p-3 bg-background rounded-md">
                                       <div className="text-center w-20 flex-shrink-0">
                                           <p className="font-bold text-primary">{`P${slot.period}`}</p>
                                           <p className="text-xs text-foreground/70">{PERIOD_TIMES[slot.period]}</p>
                                       </div>
                                       <div className="border-l border-border pl-4 flex-1">
                                           <p className="font-semibold">{slot.subject}</p>
                                           <p className="text-sm text-foreground/80">
                                               Class {slot.className} by {staffMap.get(slot.staffId) || 'N/A'}
                                           </p>
                                       </div>
                                   </div>
                               ))}
                            </div>
                        )}
                    </Card>
                </div>

                {/* Sidebar Column */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Quick Actions Card */}
                    <Card className="p-6">
                        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
                        <div className="space-y-3">
                           <button onClick={() => navigate('/students')} className="w-full text-left flex items-center gap-3 p-3 rounded-md hover:bg-background transition-colors">
                                <PlusIcon className="w-5 h-5 text-accent"/>
                                <span className="font-semibold">Add New Student</span>
                           </button>
                           <button onClick={() => navigate('/staff')} className="w-full text-left flex items-center gap-3 p-3 rounded-md hover:bg-background transition-colors">
                                <PlusIcon className="w-5 h-5 text-accent"/>
                                <span className="font-semibold">Add New Staff</span>
                           </button>
                           <button onClick={() => navigate('/timetable')} className="w-full text-left flex items-center gap-3 p-3 rounded-md hover:bg-background transition-colors">
                                <TimetableIcon className="w-5 h-5 text-accent"/>
                                <span className="font-semibold">Manage Timetable</span>
                           </button>
                            <button onClick={() => navigate('/exams')} className="w-full text-left flex items-center gap-3 p-3 rounded-md hover:bg-background transition-colors">
                                <ExamsIcon className="w-5 h-5 text-accent"/>
                                <span className="font-semibold">Create an Exam</span>
                           </button>
                        </div>
                    </Card>

                    {/* Recently Added Students Card */}
                    <Card className="p-6">
                        <h2 className="text-lg font-semibold mb-4">Recently Added Students</h2>
                        <div className="space-y-4">
                            {recentStudents && recentStudents.length > 0 ? recentStudents.map(student => (
                                <div key={student.id} className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                                        {student.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-semibold">{student.name}</p>
                                        <p className="text-xs text-foreground/70">Class {student.className} | Roll No: {student.rollNo}</p>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-sm text-foreground/60 text-center py-4">No recent students found.</p>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;