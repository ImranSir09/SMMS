

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';
import { Exam, Student, Mark, StudentExamData } from '../types';
import { useAppData } from '../hooks/useAppData';
import { generatePdfFromComponent } from '../utils/pdfGenerator';
import ProgressCard from '../components/ProgressCard';
import { PrintIcon } from '../components/icons';

const SUBJECTS = ['English', 'Math', 'Science', 'Social Science', 'Urdu', 'Kashmiri'];
const ALL_MARK_FIELDS: { key: keyof Mark; label: string; max: number }[] = [
    { key: 'fa1', label: 'FA1', max: 5 },
    { key: 'fa2', label: 'FA2', max: 5 },
    { key: 'fa3', label: 'FA3', max: 5 },
    { key: 'fa4', label: 'FA4', max: 5 },
    { key: 'fa5', label: 'FA5', max: 5 },
    { key: 'fa6', label: 'FA6', max: 5 },
    { key: 'coCurricular', label: 'CCA', max: 20 },
    { key: 'summative', label: 'SA', max: 50 },
];
const DEBOUNCE_DELAY = 2000; // 2 seconds

const ExamMarks: React.FC = () => {
    const { examId } = useParams<{ examId: string }>();
    const { schoolDetails } = useAppData();
    const numericExamId = Number(examId);

    const [marksData, setMarksData] = useState<Map<string, Partial<Mark>>>(new Map());
    const [studentExtraData, setStudentExtraData] = useState<Map<number, Partial<StudentExamData>>>(new Map());
    const [dirtyKeys, setDirtyKeys] = useState<Set<string>>(new Set());
    const [saveStatus, setSaveStatus] = useState<'synced' | 'pending' | 'saving' | 'error'>('synced');
    const [validationErrors, setValidationErrors] = useState<Map<string, string>>(new Map());
    const [isGeneratingPdf, setIsGeneratingPdf] = useState<number | null>(null);
    const [activeSubject, setActiveSubject] = useState<string | null>(null);

    const exam = useLiveQuery(() => db.exams.get(numericExamId), [numericExamId]);
    const students = useLiveQuery(() => 
        exam ? db.students.where('className').equals(exam.className).sortBy('rollNo') : Promise.resolve([]), 
    [exam]);

    const displayedMarkFields = useMemo(() => {
        if (!exam) return [];

        const examName = exam.name.toLowerCase();

        if (examName.startsWith('fa1')) return ALL_MARK_FIELDS.filter(f => f.key === 'fa1');
        if (examName.startsWith('fa2')) return ALL_MARK_FIELDS.filter(f => f.key === 'fa2');
        if (examName.startsWith('fa3')) return ALL_MARK_FIELDS.filter(f => f.key === 'fa3');
        if (examName.startsWith('fa4')) return ALL_MARK_FIELDS.filter(f => f.key === 'fa4');
        if (examName.startsWith('fa5')) return ALL_MARK_FIELDS.filter(f => f.key === 'fa5');
        if (examName.startsWith('fa6')) return ALL_MARK_FIELDS.filter(f => f.key === 'fa6');
        if (examName.includes('co-curricular')) return ALL_MARK_FIELDS.filter(f => f.key === 'coCurricular');
        if (examName.includes('summative')) return ALL_MARK_FIELDS.filter(f => f.key === 'summative');
        
        // Default case for 'Term 1', 'Final Exam', 'Other', etc.
        return ALL_MARK_FIELDS;
    }, [exam]);

    useEffect(() => {
        if (SUBJECTS.length > 0 && !activeSubject) {
            setActiveSubject(SUBJECTS[0]);
        }
    }, [activeSubject]);

    useEffect(() => {
        if (!exam || !students || students.length === 0) return;

        const loadData = async () => {
            const marks = await db.marks.where({ examId: numericExamId }).toArray();
            const extras = await db.studentExamData.where({ examId: numericExamId }).toArray();

            const newMarksMap = new Map<string, Partial<Mark>>();
            marks.forEach(m => newMarksMap.set(`${m.studentId}-${m.subject}`, m));
            setMarksData(newMarksMap);
            
            const newExtrasMap = new Map<number, Partial<StudentExamData>>();
            extras.forEach(e => newExtrasMap.set(e.studentId, e));
            setStudentExtraData(newExtrasMap);
        };
        loadData();
    }, [numericExamId, exam, students]);

    const savePendingChanges = useCallback(async () => {
        if (dirtyKeys.size === 0) return;
        setSaveStatus('saving');
        const keysToSave = new Set(dirtyKeys);
        setDirtyKeys(new Set());
        
        try {
            await db.transaction('rw', db.marks, db.studentExamData, async () => {
                for (const key of keysToSave) {
                    if (key.startsWith('extra-')) {
                        const studentId = Number(key.split('-')[1]);
                        const data = studentExtraData.get(studentId);
                        if (data) await db.studentExamData.put({ ...data, studentId, examId: numericExamId } as StudentExamData);
                    } else {
                        const data = marksData.get(key);
                        if (data) await db.marks.put(data as Mark);
                    }
                }
            });
            setSaveStatus('synced');
        } catch (error) {
            console.error('Failed to save data:', error);
            setSaveStatus('error');
        }
    }, [dirtyKeys, marksData, studentExtraData, numericExamId]);

    useEffect(() => {
        if (dirtyKeys.size > 0) {
            setSaveStatus('pending');
            const handler = setTimeout(savePendingChanges, DEBOUNCE_DELAY);
            return () => clearTimeout(handler);
        }
    }, [dirtyKeys, savePendingChanges]);

    const handleMarkChange = (studentId: number, subject: string, field: keyof Mark, value: string) => {
        const numericValue = Number(value);
        const max = ALL_MARK_FIELDS.find(f => f.key === field)?.max;
        const markKey = `${studentId}-${subject}`;

        if (max !== undefined && (numericValue < 0 || numericValue > max)) {
            setValidationErrors(prev => new Map(prev).set(`${markKey}-${field}`, `Must be between 0 and ${max}`));
            return;
        }
        setValidationErrors(prev => {
            const newErrors = new Map(prev);
            newErrors.delete(`${markKey}-${field}`);
            return newErrors;
        });
        
        setMarksData(prev => {
            const newMap = new Map(prev);
            const existing = newMap.get(markKey) || { examId: numericExamId, studentId, subject };
            newMap.set(markKey, { ...existing, [field]: value === '' ? undefined : numericValue });
            return newMap;
        });
        setDirtyKeys(prev => new Set(prev).add(markKey));
    };
    
    const calculateTotal = useCallback((marks: Partial<Mark> | undefined) => {
        if (!marks) return 0;
        return displayedMarkFields.reduce((sum, field) => sum + (Number(marks[field.key]) || 0), 0);
    }, [displayedMarkFields]);

    const handleGeneratePdf = async (student: Student) => {
        if (!schoolDetails || !exam) return;
        setIsGeneratingPdf(student.id!);
        try {
            const studentMarks = await db.marks.where({ studentId: student.id!, examId: numericExamId }).toArray();
            const studentExtra = await db.studentExamData.where({ studentId: student.id!, examId: numericExamId }).first();

            await generatePdfFromComponent(
                <ProgressCard 
                    student={student} 
                    marks={studentMarks} 
                    schoolDetails={schoolDetails}
                    studentExamData={studentExtra || { examId: numericExamId, studentId: student.id! }}
                    examName={exam.name}
                />,
                `ProgressCard-${exam.name}-${student.admissionNo}`
            );
        } catch (error) {
            console.error("PDF Generation failed:", error);
            alert("Failed to generate PDF.");
        } finally {
            setIsGeneratingPdf(null);
        }
    };
    
    const getSaveStatusIndicator = () => {
        switch (saveStatus) {
            case 'synced': return <span className="text-green-500">Synced</span>;
            case 'pending': return <span className="text-yellow-500">Saving...</span>;
            case 'saving': return <span className="text-blue-500">Saving...</span>;
            case 'error': return <span className="text-red-500">Error!</span>;
        }
    };

    const headerCellStyle = "p-1.5 border-b border-border text-center font-semibold sticky top-0 bg-background z-20";
    const cellStyle = "p-0.5 border-b border-border text-center align-middle";
    const studentNameCellStyle = `${cellStyle} text-left font-medium sticky left-0 bg-background z-10 p-2`;
    const inputMarkStyle = "w-full h-full text-center bg-transparent p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-primary";

    if (!exam) return <div className="p-4 text-center">Loading exam data...</div>;

    return (
        <div className="flex flex-col">
            <div className="flex-shrink-0 mb-2 flex justify-between items-center">
                 <h2 className="font-semibold">{exam.name} - Class {exam.className}</h2>
                 <div className="text-xs font-medium">{getSaveStatusIndicator()}</div>
            </div>
            
            <div className="flex-shrink-0 mb-2">
                <div className="flex items-center gap-1 p-1 bg-card rounded-lg border border-border overflow-x-auto">
                    {SUBJECTS.map(subject => (
                        <button
                            key={subject}
                            onClick={() => setActiveSubject(subject)}
                            className={`flex-shrink-0 px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeSubject === subject ? 'bg-primary text-primary-foreground shadow' : 'hover:bg-primary/10'}`}
                        >
                            {subject}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-auto">
                <table className="w-full text-left text-xs border-collapse">
                    <thead className="sticky top-0 bg-background z-10">
                        <tr>
                            <th className={headerCellStyle}>Student</th>
                            {displayedMarkFields.map(f => <th key={String(f.key)} className={headerCellStyle}>{f.label}</th>)}
                            <th className={headerCellStyle}>Total</th>
                            <th className={headerCellStyle}>Report</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students?.map(student => {
                            const marksForSubject = marksData.get(`${student.id}-${activeSubject}`);
                            const total = calculateTotal(marksForSubject);
                            return (
                                <tr key={student.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                                    <td className={studentNameCellStyle}>
                                        <div className="truncate w-20">{student.name}</div>
                                        <div className="text-foreground/60">R. {student.rollNo}</div>
                                    </td>
                                    {displayedMarkFields.map(field => (
                                        <td key={String(field.key)} className={cellStyle}>
                                            <input
                                                type="number"
                                                value={marksForSubject?.[field.key] ?? ''}
                                                onChange={e => handleMarkChange(student.id!, activeSubject!, field.key, e.target.value)}
                                                className={inputMarkStyle}
                                                max={field.max}
                                                min="0"
                                            />
                                        </td>
                                    ))}
                                    <td className={`${cellStyle} font-bold`}>{total}</td>
                                    <td className={cellStyle}>
                                        <button onClick={() => handleGeneratePdf(student)} disabled={isGeneratingPdf === student.id} className="p-2 text-primary disabled:opacity-50">
                                            {isGeneratingPdf === student.id ? '...' : <PrintIcon className="w-5 h-5" />}
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ExamMarks;