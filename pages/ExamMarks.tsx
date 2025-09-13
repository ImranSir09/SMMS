import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';
import { Exam, Student, Mark, StudentExamData } from '../types';
import { useAppData } from '../hooks/useAppData';
import { generatePdfFromComponent } from '../utils/pdfGenerator';
import ProgressCard from '../components/ProgressCard';
import { PrintIcon } from '../components/icons';

const SUBJECTS = ['English', 'Math', 'Science', 'Social Science', 'Urdu', 'Kashmiri'];
const FA_FIELDS: (keyof Mark)[] = ['fa1', 'fa2', 'fa3', 'fa4', 'fa5', 'fa6'];
const MARK_FIELDS: { key: keyof Mark; label: string; max: number }[] = [
    ...FA_FIELDS.map((f, i) => ({ key: f, label: `FA${i+1}`, max: 5 })),
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

    useEffect(() => {
        if (students && students.length > 0 && !activeSubject && SUBJECTS.length > 0) {
            setActiveSubject(SUBJECTS[0]);
        }
    }, [students, activeSubject]);

    useEffect(() => {
        if (!exam) return;

        const fetchData = async () => {
            const marks = await db.marks.where({ examId: numericExamId }).toArray();
            const extraData = await db.studentExamData.where({ examId: numericExamId }).toArray();

            const marksMap = new Map<string, Partial<Mark>>();
            marks.forEach(m => marksMap.set(`${m.studentId}-${m.subject}`, m));
            setMarksData(marksMap);

            const extraDataMap = new Map<number, Partial<StudentExamData>>();
            extraData.forEach(d => extraDataMap.set(d.studentId, d));
            setStudentExtraData(extraDataMap);
        };
        fetchData();
    }, [exam, numericExamId]);

    const handleSave = useCallback(async () => {
        if (dirtyKeys.size === 0) {
            setSaveStatus('synced');
            return;
        };
        setSaveStatus('saving');
        
        try {
            const updatedMarksData = new Map(marksData);
            const updatedExtraData = new Map(studentExtraData);
    
            await db.transaction('rw', db.marks, db.studentExamData, async () => {
                for (const key of dirtyKeys) {
                    if (key.startsWith('extra-')) {
                        const studentId = parseInt(key.split('-')[1], 10);
                        const data = updatedExtraData.get(studentId); 
                        if (data) {
                            const dataToSave = { ...data, examId: numericExamId, studentId } as StudentExamData;
                            const newId = await db.studentExamData.put(dataToSave);
                            updatedExtraData.set(studentId, { ...dataToSave, id: newId });
                        }
                    } else {
                        const [studentIdStr, subject] = key.split('-');
                        const studentId = parseInt(studentIdStr, 10);
                        const data = updatedMarksData.get(key);
                        if (data) {
                            const dataToSave = { ...data, examId: numericExamId, studentId, subject } as Mark;
                            const newId = await db.marks.put(dataToSave);
                            updatedMarksData.set(key, { ...dataToSave, id: newId });
                        }
                    }
                }
            });
    
            setMarksData(updatedMarksData);
            setStudentExtraData(updatedExtraData);
    
            setDirtyKeys(new Set());
            setSaveStatus('synced');
        } catch (error) {
            console.error('Failed to save marks:', error);
            setSaveStatus('error');
        }
    }, [dirtyKeys, marksData, studentExtraData, numericExamId]);

    useEffect(() => {
        if (saveStatus !== 'pending') return;
        const handler = setTimeout(() => {
            handleSave();
        }, DEBOUNCE_DELAY);
        return () => clearTimeout(handler);
    }, [saveStatus, handleSave]);

    const validateAndSetMark = (studentId: number, subject: string, field: keyof Mark, value: string, max: number) => {
        const key = `${studentId}-${subject}`;
        const errorKey = `${key}-${String(field)}`;
        const numericValue = value === '' ? undefined : Number(value);
        
        const newErrors = new Map(validationErrors);
        if (numericValue !== undefined && (numericValue < 0 || numericValue > max)) {
            newErrors.set(errorKey, `Max ${max}`);
        } else {
            newErrors.delete(errorKey);
        }
        setValidationErrors(newErrors);

        setMarksData(prev => {
            const newMap = new Map(prev);
            const currentMark = newMap.get(key) || {};
            newMap.set(key, { ...currentMark, [field]: numericValue });
            return newMap;
        });
        
        setDirtyKeys(prev => new Set(prev).add(key));
        setSaveStatus('pending');
    };
    
    const handleExtraDataChange = (studentId: number, field: keyof StudentExamData, value: string) => {
        setStudentExtraData(prev => {
            const newMap = new Map(prev);
            const currentData = newMap.get(studentId) || {};
            newMap.set(studentId, { ...currentData, [field]: value });
            return newMap;
        });
        const key = `extra-${studentId}`;
        setDirtyKeys(prev => new Set(prev).add(key));
        setSaveStatus('pending');
    };

    const handleGenerateProgressCard = async (student: Student) => {
        if (!schoolDetails || !exam) return;
        setIsGeneratingPdf(student.id!);
        const studentMarks = await db.marks.where({ examId: numericExamId, studentId: student.id! }).toArray();
        const studentData = await db.studentExamData.where({ examId: numericExamId, studentId: student.id! }).first();
        await generatePdfFromComponent(
            <ProgressCard student={student} marks={studentMarks} schoolDetails={schoolDetails} studentExamData={studentData || { examId: numericExamId, studentId: student.id! }} examName={exam.name} />,
            `Progress-Card-${student.admissionNo}`
        );
        setIsGeneratingPdf(null);
    };

    const handleGenerateAll = async () => {
        if (!students || students.length === 0) return;
        if (window.confirm(`This will generate and download ${students.length} PDF files. This may take some time. Are you sure you want to continue?`)) {
            for (const student of students) {
                await new Promise(resolve => setTimeout(resolve, 500)); 
                await handleGenerateProgressCard(student);
            }
        }
    };
    
    const SaveStatusIndicator = () => {
        let text = 'Synced';
        let color = 'text-green-600';
        if (saveStatus === 'pending') { text = 'Unsaved changes'; color = 'text-yellow-600'; } 
        else if (saveStatus === 'saving') { text = 'Saving...'; color = 'text-blue-600'; } 
        else if (saveStatus === 'error') { text = 'Save error!'; color = 'text-red-600'; }
        return <span className={`text-xs font-semibold ${color}`}>{text}</span>;
    };

    if (!exam || !students) return <div className="p-4 text-center">Loading exam data...</div>;

    return (
        <div className="h-full flex flex-col">
            <header className="flex-shrink-0 p-2 border-b border-border">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold">{exam.name} - Class {exam.className}</h2>
                        <SaveStatusIndicator />
                    </div>
                    <button onClick={handleGenerateAll} className="py-2 px-3 text-xs font-semibold rounded-md bg-accent text-accent-foreground flex items-center justify-center gap-1">
                        <PrintIcon className="w-4 h-4" /> All Cards
                    </button>
                </div>
            </header>

             <div className="flex-shrink-0 grid grid-cols-3 gap-1 p-2 border-b border-border bg-background/50">
                {SUBJECTS.map(subject => (
                    <button
                        key={subject}
                        onClick={() => setActiveSubject(subject)}
                        className={`p-1 text-xs font-semibold rounded-md transition-colors ${activeSubject === subject ? 'bg-primary text-primary-foreground shadow-md' : 'bg-card border border-border'}`}
                    >
                        {subject}
                    </button>
                ))}
            </div>
            
            <main className="flex-1 overflow-auto">
                <table className="w-full text-xs border-collapse">
                    <thead className="sticky top-0 bg-background z-20">
                        <tr>
                            <th className="p-1 border border-border sticky left-0 bg-background z-30" rowSpan={2}>Student</th>
                            {SUBJECTS.map(subject => (
                                <th key={subject} className="p-1 border border-border" colSpan={MARK_FIELDS.length}>{subject}</th>
                            ))}
                            <th className="p-1 border border-border" colSpan={2} rowSpan={1}>Final</th>
                        </tr>
                        <tr>
                            {SUBJECTS.map(subject => (
                                MARK_FIELDS.map(field => (
                                    <th key={`${subject}-${field.key}`} className="p-1 border border-border font-medium" title={`${field.label} (Max: ${field.max})`}>{field.label}</th>
                                ))
                            ))}
                            <th className="p-1 border border-border font-medium">Remarks</th>
                            <th className="p-1 border border-border font-medium">Level</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map(student => (
                            <tr key={student.id}>
                                <td className="p-1 border border-border font-semibold sticky left-0 bg-card z-10 whitespace-nowrap">
                                    <div className="flex justify-between items-center">
                                        <span>{student.name}</span>
                                        <button onClick={() => handleGenerateProgressCard(student)} disabled={isGeneratingPdf === student.id} className="p-1 ml-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-50" aria-label="Print Progress Card">
                                             {isGeneratingPdf === student.id ? '...' : <PrintIcon className="w-3 h-3" />}
                                        </button>
                                    </div>
                                </td>
                                {SUBJECTS.map(subject => (
                                    MARK_FIELDS.map(field => {
                                        const key = `${student.id}-${subject}`;
                                        const errorKey = `${key}-${String(field.key)}`;
                                        const error = validationErrors.get(errorKey);
                                        const isActive = subject === activeSubject;
                                        return (
                                            <td key={`${key}-${field.key}`} className={`p-0 border border-border transition-colors ${isActive ? 'bg-primary/5 dark:bg-primary/10' : 'bg-background/20'}`}>
                                                <input
                                                    type="number"
                                                    value={marksData.get(key)?.[field.key] ?? ''}
                                                    onChange={e => validateAndSetMark(student.id!, subject, field.key, e.target.value, field.max)}
                                                    className={`w-10 text-center bg-transparent focus:bg-background outline-none disabled:text-foreground/50 ${error ? 'border-2 border-red-500' : ''}`}
                                                    min="0" max={field.max}
                                                    title={error}
                                                    disabled={!isActive}
                                                />
                                            </td>
                                        );
                                    })
                                ))}
                                <td className="p-0 border border-border">
                                    <input
                                        type="text"
                                        value={studentExtraData.get(student.id!)?.remarks ?? ''}
                                        onChange={e => handleExtraDataChange(student.id!, 'remarks', e.target.value)}
                                        className="w-24 px-1 bg-transparent focus:bg-background outline-none"
                                    />
                                </td>
                                 <td className="p-0 border border-border">
                                    <select
                                        value={studentExtraData.get(student.id!)?.proficiencyLevel ?? ''}
                                        onChange={e => handleExtraDataChange(student.id!, 'proficiencyLevel', e.target.value)}
                                        className="w-20 text-center bg-transparent focus:bg-background outline-none border-0 focus:ring-0"
                                    >
                                        <option value="">--</option>
                                        <option value="Stream">Stream</option>
                                        <option value="Mountain">Mountain</option>
                                        <option value="Sky">Sky</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </main>
        </div>
    );
};

export default ExamMarks;