
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';
import { Exam, Student, Mark, StudentExamData, StudentSessionInfo } from '../types';
import { useToast } from '../contexts/ToastContext';
import { useAppData } from '../hooks/useAppData';
import { SUBJECTS } from '../constants';
import { GridIcon, UserCheckIcon } from '../components/icons';

const DEBOUNCE_DELAY = 1500;

const ExamMarks: React.FC = () => {
    const { examId: examIdStr } = useParams<{ examId: string }>();
    const examId = useMemo(() => Number(examIdStr), [examIdStr]);
    const { addToast } = useToast();
    const { activeSession } = useAppData();

    // State
    const [viewMode, setViewMode] = useState<'bySubject' | 'byStudent'>('bySubject');
    const [exam, setExam] = useState<Exam | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    
    // View Specific State
    const [subject, setSubject] = useState<string>(SUBJECTS[0]);
    const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);

    // Data State
    // Maps ID (Student ID or Subject Name) -> Mark Record
    const [marks, setMarks] = useState<Map<number | string, Partial<Mark>>>(new Map());
    const [studentExamData, setStudentExamData] = useState<Map<number, Partial<StudentExamData>>>(new Map());
    
    const [saveStatus, setSaveStatus] = useState<'synced' | 'pending' | 'saving' | 'error'>('synced');
    const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const examData = useLiveQuery(() => db.exams.get(examId), [examId]);
    
    useEffect(() => {
        if (examData) {
            setExam(examData);
        }
    }, [examData]);

    // 1. Fetch Students for the Exam Class
    useEffect(() => {
        const fetchStudents = async () => {
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
            
            // Auto-select first student in By Student mode if none selected
            if (viewMode === 'byStudent' && !selectedStudentId && mergedStudents.length > 0) {
                setSelectedStudentId(mergedStudents[0].id!);
            }
        };

        fetchStudents();
    }, [exam, activeSession, viewMode]);

    // 2. Fetch Marks based on View Mode
    useEffect(() => {
        const fetchMarks = async () => {
            if (!exam) return;

            setMarks(new Map());
            setStudentExamData(new Map());

            if (viewMode === 'bySubject') {
                // Fetch marks for ALL students for ONE subject
                const studentIds = students.map(s => s.id!);
                if (studentIds.length === 0) return;

                const existingMarks = await db.marks.where('[examId+subject]').equals([examId, subject]).toArray();
                const marksMap = new Map<number | string, Partial<Mark>>();
                existingMarks.forEach(m => marksMap.set(m.studentId, m));
                setMarks(marksMap);

                const existingData = await db.studentExamData.where('examId').equals(examId).and(d => studentIds.includes(d.studentId)).toArray();
                const dataMap = new Map(existingData.map(d => [d.studentId, d]));
                setStudentExamData(dataMap);

            } else if (viewMode === 'byStudent' && selectedStudentId) {
                // Fetch marks for ONE student for ALL subjects
                const existingMarks = await db.marks.where('[examId+studentId]').equals([examId, selectedStudentId]).toArray();
                const marksMap = new Map<number | string, Partial<Mark>>();
                existingMarks.forEach(m => marksMap.set(m.subject, m));
                setMarks(marksMap);

                const existingData = await db.studentExamData.where({ examId: examId, studentId: selectedStudentId }).first();
                const dataMap = new Map();
                if(existingData) dataMap.set(selectedStudentId, existingData);
                setStudentExamData(dataMap);
            }
        };

        fetchMarks();
    }, [exam, viewMode, subject, selectedStudentId, students]);


    const handleSave = useCallback(async (marksToSave: Map<number | string, Partial<Mark>>, studentDataToSave: Map<number, Partial<StudentExamData>>) => {
        setSaveStatus('saving');
        try {
            const marksPayload: Mark[] = [];
            
            marksToSave.forEach((mark, key) => {
                // If viewMode is 'bySubject', key is studentId. If 'byStudent', key is subject name.
                const studentId = viewMode === 'bySubject' ? (key as number) : selectedStudentId!;
                const subjectName = viewMode === 'bySubject' ? subject : (key as string);

                if (mark.id || Object.values(mark).some(v => v !== undefined && v !== null && v !== '')) {
                    marksPayload.push({
                        examId,
                        studentId,
                        subject: subjectName,
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
    }, [examId, subject, selectedStudentId, viewMode, addToast]);

    const handleMarkChange = (key: number | string, field: keyof Mark, value: string) => {
        const numValue = value === '' ? undefined : parseFloat(value);
        if (value !== '' && (isNaN(numValue as number) || (numValue as number) < 0)) return;
        
        const updatedMarks = new Map(marks);
        const currentMark = updatedMarks.get(key) || {};
        currentMark[field] = numValue;
        updatedMarks.set(key, currentMark);
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
            <header className="bg-card p-3 rounded-lg shadow-sm space-y-3">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-xl font-bold">{exam.name} - Class {exam.className}</h1>
                        <p className="text-xs text-foreground/60">{activeSession}</p>
                    </div>
                    <div className="flex bg-background border border-border rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('bySubject')}
                            className={`p-2 rounded-md flex items-center gap-1 text-xs font-semibold transition-colors ${viewMode === 'bySubject' ? 'bg-primary text-primary-foreground' : 'hover:bg-primary/10'}`}
                            title="View by Subject"
                        >
                            <GridIcon className="w-4 h-4" /> By Subject
                        </button>
                        <button
                            onClick={() => setViewMode('byStudent')}
                            className={`p-2 rounded-md flex items-center gap-1 text-xs font-semibold transition-colors ${viewMode === 'byStudent' ? 'bg-primary text-primary-foreground' : 'hover:bg-primary/10'}`}
                            title="View by Student"
                        >
                            <UserCheckIcon className="w-4 h-4" /> By Student
                        </button>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    {viewMode === 'bySubject' ? (
                        <select value={subject} onChange={e => setSubject(e.target.value)} className="flex-1 p-2 bg-background border border-input rounded-md text-sm font-semibold">
                            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    ) : (
                        <select value={selectedStudentId || ''} onChange={e => setSelectedStudentId(Number(e.target.value))} className="flex-1 p-2 bg-background border border-input rounded-md text-sm font-semibold">
                            <option value="" disabled>Select Student</option>
                            {students.map(s => <option key={s.id} value={s.id}>{s.name} (Roll: {s.rollNo})</option>)}
                        </select>
                    )}
                    
                     <div className="text-xs font-semibold w-20 text-right">
                        {saveStatus === 'synced' && <span className="text-green-500">Synced</span>}
                        {saveStatus === 'pending' && <span className="text-yellow-500">Saving...</span>}
                        {saveStatus === 'saving' && <span className="text-blue-500">Saving...</span>}
                        {saveStatus === 'error' && <span className="text-red-500">Error!</span>}
                    </div>
                </div>
            </header>
            
            {viewMode === 'byStudent' && selectedStudentId && (
                 <div className="bg-card p-3 rounded-lg border border-border grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs font-semibold text-foreground/70">Teacher's Remarks</label>
                        <input
                            type="text"
                            value={studentExamData.get(selectedStudentId)?.remarks ?? ''}
                            onChange={e => handleStudentDataChange(selectedStudentId, 'remarks', e.target.value)}
                            className="w-full p-2 mt-1 bg-background border border-input rounded-md text-sm"
                            placeholder="Overall performance..."
                        />
                    </div>
                     <div>
                        <label className="text-xs font-semibold text-foreground/70">Proficiency Level</label>
                        <select
                            value={studentExamData.get(selectedStudentId)?.proficiencyLevel ?? ''}
                            onChange={e => handleStudentDataChange(selectedStudentId, 'proficiencyLevel', e.target.value)}
                            className="w-full p-2 mt-1 bg-background border border-input rounded-md text-sm"
                        >
                            <option value="">-- Select Level --</option>
                            <option value="Stream">Stream (Needs Improvement)</option>
                            <option value="Mountain">Mountain (Satisfactory)</option>
                            <option value="Sky">Sky (Excellent)</option>
                        </select>
                    </div>
                 </div>
            )}

            <div className="overflow-x-auto flex-1 bg-card rounded-lg border border-border">
                <table className="w-full border-collapse text-xs">
                    <thead className="sticky top-0 z-20 bg-primary/5">
                        <tr>
                            <th className="p-3 border-b border-border text-left w-40 sticky left-0 bg-card z-10">
                                {viewMode === 'bySubject' ? 'Student Name' : 'Subject'}
                            </th>
                            {markFields.map(f => <th key={String(f)} className="p-2 border-b border-border text-center uppercase text-xs font-bold text-foreground/70">{String(f).replace('coCurricular', 'Co-Cur').replace('summative', 'Summ.')}</th>)}
                            {viewMode === 'bySubject' && <th className="p-2 border-b border-border">Remarks</th>}
                            {viewMode === 'bySubject' && <th className="p-2 border-b border-border">Level</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {viewMode === 'bySubject' ? (
                            students.map(student => {
                                const studentMark = marks.get(student.id!) || {};
                                const studentData = studentExamData.get(student.id!) || {};
                                return (
                                    <tr key={student.id} className="odd:bg-background/50 hover:bg-primary/5 transition-colors">
                                        <td className="p-2 border-b border-border font-semibold sticky left-0 bg-card z-10 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span>{student.name}</span>
                                                <span className="text-[10px] text-foreground/50">Roll: {student.rollNo}</span>
                                            </div>
                                        </td>
                                        {markFields.map(field => (
                                            <td key={String(field)} className="p-1 border-b border-border text-center">
                                                <input
                                                    type="number"
                                                    value={studentMark[field] ?? ''}
                                                    onChange={e => handleMarkChange(student.id!, field, e.target.value)}
                                                    className="w-12 p-1.5 text-center bg-transparent border border-input rounded focus:border-primary outline-none transition-all"
                                                    placeholder="-"
                                                />
                                            </td>
                                        ))}
                                        <td className="p-1 border-b border-border">
                                            <input
                                                type="text"
                                                value={studentData.remarks ?? ''}
                                                onChange={e => handleStudentDataChange(student.id!, 'remarks', e.target.value)}
                                                className="w-24 p-1.5 bg-transparent border border-input rounded focus:border-primary outline-none text-xs"
                                            />
                                        </td>
                                         <td className="p-1 border-b border-border">
                                            <select
                                                value={studentData.proficiencyLevel ?? ''}
                                                onChange={e => handleStudentDataChange(student.id!, 'proficiencyLevel', e.target.value)}
                                                className="w-20 p-1 bg-transparent border border-input rounded focus:border-primary outline-none text-xs"
                                            >
                                                <option value="">--</option>
                                                <option value="Stream">Strm</option>
                                                <option value="Mountain">Mtn</option>
                                                <option value="Sky">Sky</option>
                                            </select>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            SUBJECTS.map(subj => {
                                const subjectMark = marks.get(subj) || {};
                                return (
                                    <tr key={subj} className="odd:bg-background/50 hover:bg-primary/5 transition-colors">
                                        <td className="p-3 border-b border-border font-semibold sticky left-0 bg-card z-10">{subj}</td>
                                        {markFields.map(field => (
                                             <td key={String(field)} className="p-1 border-b border-border text-center">
                                                <input
                                                    type="number"
                                                    value={subjectMark[field] ?? ''}
                                                    onChange={e => {
                                                        if (selectedStudentId) handleMarkChange(subj, field, e.target.value);
                                                    }}
                                                    className="w-full max-w-[60px] p-2 text-center bg-transparent border border-input rounded focus:border-primary outline-none transition-all"
                                                    placeholder="-"
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
                 {viewMode === 'bySubject' && students.length === 0 && <div className="p-8 text-center text-foreground/50">No students found in this class.</div>}
                 {viewMode === 'byStudent' && !selectedStudentId && <div className="p-8 text-center text-foreground/50">Select a student to enter marks.</div>}
            </div>
        </div>
    );
};

export default ExamMarks;
