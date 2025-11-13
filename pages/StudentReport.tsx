

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';
import { useAppData } from '../hooks/useAppData';
import { StudentSessionInfo } from '../types';
import { CLASS_OPTIONS } from '../constants';

const inputStyle = "p-3 w-full bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm transition-colors";

const StudentReport: React.FC = () => {
    const navigate = useNavigate();
    const { activeSession } = useAppData();
    
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedStudentId, setSelectedStudentId] = useState('');
    
    const classOptions = useLiveQuery(async () => {
        if (!activeSession) return [];
        const sessionInfos = await db.studentSessionInfo.where({ session: activeSession }).toArray();
        const classNames = [...new Set(sessionInfos.map(info => info.className))];
        return classNames.sort((a: string, b: string) => {
            const indexA = CLASS_OPTIONS.indexOf(a);
            const indexB = CLASS_OPTIONS.indexOf(b);
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
        });
    }, [activeSession]);
    
    const studentsInClass = useLiveQuery(async () => {
        if (!selectedClass || !activeSession) return [];
        
        const sessionInfos: StudentSessionInfo[] = await db.studentSessionInfo.where({ className: selectedClass, session: activeSession }).toArray();
        if (sessionInfos.length === 0) return [];

        const studentIds = sessionInfos.map(info => info.studentId);
        const studentDetails = await db.students.where('id').anyOf(studentIds).toArray();
        const sessionInfoMap = new Map(sessionInfos.map(info => [info.studentId, info]));
        
        const mergedStudents = studentDetails.map(student => ({
            ...student,
            rollNo: sessionInfoMap.get(student.id!)?.rollNo || '',
        }));

        return mergedStudents.sort((a, b) => (a.rollNo || '').localeCompare(b.rollNo || '', undefined, { numeric: true, sensitivity: 'base' }));
    }, [selectedClass, activeSession]);

    useEffect(() => {
        if (classOptions && classOptions.length > 0 && !selectedClass) {
            setSelectedClass(classOptions[0]);
        }
    }, [classOptions, selectedClass]);

    useEffect(() => {
        setSelectedStudentId('');
    }, [selectedClass]);

    const handleGenerateReport = () => {
        if (selectedStudentId) {
            navigate(`/print/hpc/${selectedStudentId}`);
        }
    };

    return (
        <div className="flex flex-col gap-4 animate-fade-in p-4">
            <div className="bg-card p-4 rounded-lg shadow-sm space-y-4">
                <div>
                    <label className="block text-xs font-medium text-foreground/80 mb-1">Select Class</label>
                    <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className={inputStyle}>
                        <option value="">-- Choose Class --</option>
                        {classOptions?.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-medium text-foreground/80 mb-1">Select Student</label>
                    <select value={selectedStudentId} onChange={e => setSelectedStudentId(e.target.value)} disabled={!selectedClass} className={inputStyle}>
                        <option value="">-- Choose Student --</option>
                        {studentsInClass?.map(s => <option key={s.id} value={String(s.id!)}>
                            {s.name} (R: {s.rollNo}) | S/O: {s.fathersName} | DOB: {s.dob} | {s.contact}
                        </option>)}
                    </select>
                </div>
                <div className="flex justify-end pt-2">
                    <button 
                        onClick={handleGenerateReport} 
                        disabled={!selectedStudentId}
                        className="w-full py-3 px-5 rounded-lg bg-accent text-accent-foreground hover:bg-accent-hover text-sm font-semibold disabled:opacity-60"
                    >
                        Generate HPC
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudentReport;