
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';
import { Exam, Student, Mark, StudentExamData, StudentSessionInfo } from '../types';
import { useToast } from '../contexts/ToastContext';
import { useAppData } from '../hooks/useAppData';
import { SUBJECTS } from '../constants';

const DEBOUNCE_DELAY = 1500;

const ExamMarks: React.FC = () => {
    const { examId: examIdStr } = useParams<{ examId: string }>();
    const examId = useMemo(() => Number(examIdStr), [examIdStr]);
    const { addToast } = useToast();
    const { activeSession } = useAppData();

    const [exam, setExam] = useState<Exam | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [marks, setMarks] = useState<Map<number, Partial<Mark>>>(new Map());
    const [studentExamData, setStudentExamData] = useState<Map<number, Partial<StudentExamData>>>(new Map());
    const [saveStatus, setSaveStatus] = useState<'synced' | 'pending' | 'saving' | 'error'>('synced');
    const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [subject, setSubject] = useState<string>(SUBJECTS[0]);

    const examData = useLiveQuery(() => db.exams.get(examId), [examId]);
    
    useEffect(() => {
        if (examData) {
            setExam(examData);
        }
    }, [examData]);

    useEffect(() => {
        const fetchStudentsAndMarks = async () => {
            if (!exam || !activeSession) return;

            const sessionInfos: StudentSessionInfo[] = await db.studentSessionInfo.where({ className: exam.className, session: activeSession }).toArray();
            if (sessionInfos.length === 0) {
                setStudents([]);
                return;
            }
            const studentIds = sessionInfos.map(info => info.studentId);
            const studentDetails = await db.students.where('id').anyOf(studentIds).toArray();
            const sessionInfoMap = new Map(sessionInfos.map(info => [info.studentId, info]));
            
            const mergedStudents = studentDetails.map(student => ({
                ...student,
                rollNo: sessionInfoMap.get(student.id!)?.rollNo || '',
            })).sort((a, b) => (a.rollNo || '').localeCompare(b.rollNo || '', undefined, { numeric: true, sensitivity: 'base' }));

            setStudents(mergedStudents);

            if (studentIds.length > 0) {
                const existingMarks = await db.marks.where('[examId+subject]').equals([examId, subject]).toArray();
                const marksMap = new Map(existingMarks.map(m => [m.studentId, m]));
                setMarks(marksMap);

                const existingStudentExamData = await db.studentExamData.where('examId').equals(examId).and(data => studentIds.includes(data.studentId)).toArray();
                const studentExamDataMap = new Map(existingStudentExamData.map(d => [d.studentId, d]));
                setStudentExamData(studentExamDataMap);
            }
        };

        fetchStudentsAndMarks();
    }, [exam, activeSession, subject, examId]);

    const handleSave = useCallback(async (marksToSave: Map<number, Partial<Mark>>, studentDataToSave: Map<number, Partial<StudentExamData>>) => {
        if (marksToSave.size === 0 && studentDataToSave.size === 0) return;
        setSaveStatus('saving');
        try {
            const marksPayload: Mark[] = [];
            marksToSave.forEach((mark, studentId) => {
                if (mark.id || Object.values(mark).some(v => v !== undefined && v !== null && v !== '')) {
                    marksPayload.push({
                        examId,
                        studentId,
                        subject,
                        ...mark,
                    } as Mark);
                }
            });
            
            const studentDataPayload: StudentExamData[] = [];
            studentDataToSave.forEach((data, studentId) => {
                 if (data.id || data.remarks || data.proficiencyLevel) {
                    studentDataPayload.push({
                        examId,
                        studentId,
                        ...data,
                    } as StudentExamData);
                 }
            });

            await db.transaction('rw', db.marks, db.studentExamData, async () => {
                if (marksPayload.length > 0) await db.marks.bulkPut(marksPayload);
                if (studentDataPayload.length > 0) await db.studentExamData.bulkPut(studentDataPayload);
            });
            setSaveStatus('synced');
            addToast('Marks saved automatically!', 'success');
        } catch (error) {
            console.error('Failed to save marks:', error);
            setSaveStatus('error');
            addToast('Error saving marks.', 'error');
        }
    }, [examId, subject, addToast]);

    const handleMarkChange = (studentId: number, field: keyof Mark, value: string) => {
        const numValue = value === '' ? undefined : parseFloat(value);
        if (value !== '' && (isNaN(numValue as number) || (numValue as number) < 0)) return;
        
        const updatedMarks = new Map(marks);
        const currentMark = updatedMarks.get(studentId) || {};
        currentMark[field] = numValue;
        updatedMarks.set(studentId, currentMark);
        setMarks(updatedMarks);

        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        setSaveStatus('pending');
        saveTimeoutRef.current = setTimeout(() => handleSave(updatedMarks, studentExamData), DEBOUNCE_DELAY);
    };

    const handleStudentDataChange = (studentId: number, field: keyof StudentExamData, value: string) => {
        const updatedData = new Map(studentExamData);
        const currentData = updatedData.get(studentId) || {};
        (currentData[field] as any) = value;
        updatedData.set(studentId, currentData);
        setStudentExamData(updatedData);

        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        setSaveStatus('pending');
        saveTimeoutRef.current = setTimeout(() => handleSave(marks, updatedData), DEBOUNCE_DELAY);
    };

    if (!exam) {
        return <div>Loading...</div>;
    }

    const markFields: (keyof Mark)[] = ['fa1', 'fa2', 'fa3', 'fa4', 'fa5', 'fa6', 'coCurricular', 'summative'];

    return (
        <div className="flex flex-col gap-2 p-2">
            <header className="bg-card p-3 rounded-lg shadow-sm">
                <h1 className="text-xl font-bold">{exam.name} - Class {exam.className}</h1>
                <p className="text-sm text-foreground/70">Enter marks for subject:</p>
                <div className="flex items-center gap-2 mt-2">
                    <select value={subject} onChange={e => setSubject(e.target.value)} className="p-2 bg-background border border-input rounded-md text-sm">
                        {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                     <div className="text-xs font-semibold h-4 flex-grow text-right">
                        {saveStatus === 'synced' && <span className="text-green-500">Synced</span>}
                        {saveStatus === 'pending' && <span className="text-yellow-500">Saving...</span>}
                        {saveStatus === 'saving' && <span className="text-blue-500">Saving...</span>}
                        {saveStatus === 'error' && <span className="text-red-500">Error!</span>}
                    </div>
                </div>
            </header>
            
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-xs bg-card">
                    <thead className="sticky top-0 z-20">
                        <tr className="bg-primary/10">
                            <th className="p-2 border border-border sticky left-0 bg-card z-10">Student</th>
                            {markFields.map(f => <th key={String(f)} className="p-2 border border-border uppercase">{String(f).replace('coCurricular', 'Co-Cur')}</th>)}
                            <th className="p-2 border border-border">Remarks</th>
                            <th className="p-2 border border-border">Proficiency</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map(student => {
                            const studentMark = marks.get(student.id!) || {};
                            const studentData = studentExamData.get(student.id!) || {};
                            return (
                                <tr key={student.id} className="odd:bg-background">
                                    <td className="p-2 border border-border font-semibold sticky left-0 bg-card z-10 whitespace-nowrap">{student.name}</td>
                                    {markFields.map(field => (
                                        <td key={String(field)} className="p-1 border border-border">
                                            <input
                                                type="number"
                                                value={studentMark[field] ?? ''}
                                                onChange={e => handleMarkChange(student.id!, field, e.target.value)}
                                                className="w-12 p-1 bg-transparent text-center rounded-md border border-input focus:outline-none focus:ring-1 focus:ring-primary"
                                                max="100" min="0"
                                            />
                                        </td>
                                    ))}
                                    <td className="p-1 border border-border">
                                        <input
                                            type="text"
                                            value={studentData.remarks ?? ''}
                                            onChange={e => handleStudentDataChange(student.id!, 'remarks', e.target.value)}
                                            className="w-24 p-1 bg-transparent rounded-md border border-input focus:outline-none focus:ring-1 focus:ring-primary"
                                        />
                                    </td>
                                     <td className="p-1 border border-border">
                                        <select
                                            value={studentData.proficiencyLevel ?? ''}
                                            onChange={e => handleStudentDataChange(student.id!, 'proficiencyLevel', e.target.value)}
                                            className="w-full p-1 bg-transparent rounded-md border border-input focus:outline-none focus:ring-1 focus:ring-primary"
                                        >
                                            <option value="">--</option>
                                            <option value="Stream">Stream</option>
                                            <option value="Mountain">Mountain</option>
                                            <option value="Sky">Sky</option>
                                        </select>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ExamMarks;
