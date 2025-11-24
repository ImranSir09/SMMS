
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import { PieChartIcon, UserListIcon, BarChart3Icon, GridIcon } from '../components/icons';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';
import { useAppData } from '../hooks/useAppData';
import { CLASS_OPTIONS } from '../constants';

const Reports: React.FC = () => {
    const navigate = useNavigate();
    const { activeSession } = useAppData();

    const classOptions = useLiveQuery(
        async () => {
            if (!activeSession) return [];
            const sessionInfos = await db.studentSessionInfo.where({ session: activeSession }).toArray();
            const classNames = [...new Set(sessionInfos.map(info => info.className))];
            // FIX: Add explicit string types to sort callback parameters to resolve 'unknown' type error.
            return classNames.sort((a: string, b: string) => {
                const indexA = CLASS_OPTIONS.indexOf(a);
                const indexB = CLASS_OPTIONS.indexOf(b);
                if (indexA !== -1 && indexB !== -1) return indexA - indexB;
                if (indexA !== -1) return -1;
                if (indexB !== -1) return 1;
                return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
            });
        },
        [activeSession],
        []
    );

    const handlePrintRollStatement = () => {
        const className = prompt('Enter class name:', classOptions?.[0] || '1st');
        if (className) {
            navigate(`/print/roll-statement/${className}`);
        }
    };

    return (
        <div className="flex flex-col gap-4 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Card onClick={handlePrintRollStatement} className="p-4 flex items-center gap-3 cursor-pointer hover-lift">
                    <UserListIcon className="w-8 h-8 text-primary" />
                    <div>
                        <h3 className="font-semibold">Roll Statement</h3>
                        <p className="text-xs text-foreground/70">List of students in a class.</p>
                    </div>
                </Card>
                <Card onClick={() => navigate('/print/category-roll-statement')} className="p-4 flex items-center gap-3 cursor-pointer hover-lift">
                    <PieChartIcon className="w-8 h-8 text-primary" />
                    <div>
                        <h3 className="font-semibold">Category-wise Roll Statement</h3>
                        <p className="text-xs text-foreground/70">Student counts by category and gender.</p>
                    </div>
                </Card>
                <Card onClick={() => navigate('/print/consolidated-roll-statement')} className="p-4 flex items-center gap-3 cursor-pointer hover-lift">
                    <GridIcon className="w-8 h-8 text-primary" />
                    <div>
                        <h3 className="font-semibold">Consolidated Roll Statement</h3>
                        <p className="text-xs text-foreground/70">All classes with gender & category breakdown.</p>
                    </div>
                </Card>
                 <Card onClick={() => navigate('/exams')} className="p-4 flex items-center gap-3 cursor-pointer hover-lift">
                    <BarChart3Icon className="w-8 h-8 text-primary" />
                    <div>
                        <h3 className="font-semibold">Exam Performance</h3>
                        <p className="text-xs text-foreground/70">Manage marks and view results.</p>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Reports;
