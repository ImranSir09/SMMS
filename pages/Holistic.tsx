import React, { useState, useMemo, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';
import { Student, HolisticRecord } from '../types';
import { HolisticIcon } from '../components/icons';

type ActiveTab = 'Co-Curricular' | 'Personal & Social' | 'Subject Specific';

const ACADEMIC_YEAR = '2024-25'; // This should be dynamic in a real app

const DOMAINS: { tab: ActiveTab; aspects: string[] }[] = [
    {
        tab: 'Co-Curricular',
        aspects: ['Art Education', 'Health & Physical Ed.'],
    },
    {
        tab: 'Personal & Social',
        aspects: ['Discipline', 'Punctuality', 'Collaboration', 'Leadership', 'Curiosity'],
    },
    {
        tab: 'Subject Specific',
        aspects: ['English: Reading', 'English: Writing', 'Math: Problem Solving', 'Science: Inquiry'],
    }
];

const GRADE_OPTIONS: HolisticRecord['grade'][] = ['A', 'B', 'C'];

const Holistic: React.FC = () => {
    const [activeClass, setActiveClass] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<ActiveTab>('Co-Curricular');

    const allStudents = useLiveQuery(() => db.students.toArray(), []);

    const classTabs = useMemo<string[]>(() => {
        if (!allStudents) return [];
        const classSet = new Set(allStudents.map(s => s.className));
        // FIX: Explicitly type the sort callback parameters to string to resolve a TypeScript inference issue.
        return Array.from(classSet).sort((a: string, b: string) => 
            a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
        );
    }, [allStudents]);

    useEffect(() => {
        if (classTabs.length > 0 && !activeClass) {
            setActiveClass(classTabs[0]);
        }
    }, [classTabs, activeClass]);

    const studentsInClass = useLiveQuery(() => 
        activeClass ? db.students.where('className').equals(activeClass).sortBy('rollNo') : Promise.resolve([]),
    [activeClass]);
    
    const holisticData = useLiveQuery(() => 
        activeClass ? db.holisticRecords.where('className').equals(activeClass).toArray() : Promise.resolve([]),
    [activeClass]);

    const dataMap = useMemo(() => {
        const map = new Map<string, HolisticRecord>();
        if (holisticData) {
            holisticData.forEach(record => {
                map.set(`${record.studentId}-${record.domain}-${record.aspect}`, record);
            });
        }
        return map;
    }, [holisticData]);

    const handleGradeChange = async (studentId: number, domain: ActiveTab, aspect: string, grade: HolisticRecord['grade']) => {
        const existingRecord = dataMap.get(`${studentId}-${domain}-${aspect}`);
        const record: HolisticRecord = {
            id: existingRecord?.id,
            studentId,
            className: activeClass!,
            academicYear: ACADEMIC_YEAR,
            domain,
            aspect,
            grade,
        };
        
        await db.holisticRecords.put(record);
    };

    const aspectsForTab = DOMAINS.find(d => d.tab === activeTab)?.aspects || [];

    const cellStyle = "p-1 border-b border-r border-border text-center align-middle";
    const headerCellStyle = `${cellStyle} p-2 font-semibold sticky top-0 bg-background z-20 whitespace-nowrap`;
    const studentNameCellStyle = `${cellStyle} text-left font-medium sticky left-0 bg-background z-10 w-28`;

    return (
        <div className="flex flex-col h-full">
            {/* Class Selector */}
            <div className="flex-shrink-0 p-1">
                <select 
                    value={activeClass || ''} 
                    onChange={e => setActiveClass(e.target.value)}
                    className="p-2 text-sm bg-background border border-input rounded-md w-full focus:outline-none focus:ring-2 focus:ring-primary"
                >
                    <option value="" disabled>-- Select a Class --</option>
                    {classTabs.map(c => <option key={c} value={c}>Class {c}</option>)}
                </select>
            </div>
            
            {/* Tab Navigation */}
            <div className="flex-shrink-0 flex items-center justify-center gap-1 p-1 bg-card rounded-lg border border-border my-2">
                {DOMAINS.map(({ tab }) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 px-2 py-1.5 text-xs font-semibold rounded-md transition-colors ${activeTab === tab ? 'bg-primary text-primary-foreground shadow' : 'hover:bg-primary/10'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Data Table */}
            {studentsInClass && studentsInClass.length > 0 ? (
                <div className="flex-1 overflow-auto border border-border rounded-lg text-xs">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr>
                                <th className={studentNameCellStyle}>Student</th>
                                {aspectsForTab.map(aspect => (
                                    <th key={aspect} className={headerCellStyle}>{aspect}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {studentsInClass.map(student => (
                                <tr key={student.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                                    <td className={studentNameCellStyle}>
                                        <div className="truncate">{student.name}</div>
                                        <div className="text-foreground/60">R. {student.rollNo}</div>
                                    </td>
                                    {aspectsForTab.map(aspect => {
                                        const record = dataMap.get(`${student.id}-${activeTab}-${aspect}`);
                                        return (
                                            <td key={aspect} className={cellStyle}>
                                                <select
                                                    value={record?.grade || ''}
                                                    onChange={(e) => handleGradeChange(student.id!, activeTab, aspect, e.target.value as HolisticRecord['grade'])}
                                                    className="w-full bg-transparent p-1 border-0 focus:ring-0 appearance-none text-center"
                                                >
                                                    <option value="">-</option>
                                                    {GRADE_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                                                </select>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4 border-2 border-dashed border-border rounded-lg">
                    <HolisticIcon className="w-10 h-10 text-foreground/20" />
                    <h3 className="text-md font-semibold mt-2">No Students Found</h3>
                    <p className="mt-1 text-xs text-foreground/60">
                        {activeClass ? `No students in Class ${activeClass}.` : 'Please select a class to begin.'}
                    </p>
                </div>
            )}
            
            <div className="flex-shrink-0 p-2 text-center text-xs text-foreground/60">
                Grade Key: A (Exceeds Exp.), B (Meets Exp.), C (Needs Support)
            </div>
        </div>
    );
};

export default Holistic;