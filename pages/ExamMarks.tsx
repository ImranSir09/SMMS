
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

// FIX: Create a specific type for mark fields to ensure type safety.
type NumericMarkField = Exclude<keyof Mark, 'id' | 'examId' | 'studentId' | 'subject'>;
// FIX: Create a specific type for student extra data fields to ensure type safety.
type StudentExtraDataField = 'remarks' | 'proficiencyLevel';

// FIX: Use the specific NumericMarkField type for keys.
const ALL_MARK_FIELDS: { key: NumericMarkField; label: string; max: number }[] = [
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
            const studentData = await db.studentExamData.where({ examId: numericExamId }).toArray();
            
            const newMarksData = new Map<string, Partial<Mark>>();
            marks.forEach(mark => {
                const key = `${mark.studentId}-${mark.subject}`;
                newMarksData.set(key, mark);
            });
            setMarksData(newMarksData);
            
            const newStudentExtraData = new Map<number, Partial<StudentExamData>>();
            studentData.forEach(data => {
                newStudentExtraData.set(data.studentId, data);
            });
            setStudentExtraData(newStudentExtraData);
        };
        loadData();
    }, [exam, students, numericExamId]);
    
    // FIX: Use specific NumericMarkField type for the 'field' parameter to ensure type safety and resolve misleading spread operator error.
    const handleMarkChange = (studentId: number, subject: string, field: NumericMarkField, value: string) => {
        const key = `${studentId}-${subject}`;
        const numericValue = value === '' ? undefined : Number(value);

        const fieldDefinition = ALL_MARK_FIELDS.find(f => f.key === field);
        const max = fieldDefinition ? fieldDefinition.max : Infinity;

        // Validation
        const newValidationErrors = new Map(validationErrors);
        const inputKey = `${key}-${String(field)}`;
        if (numericValue !== undefined && (numericValue < 0 || numericValue > max)) {
            newValidationErrors.set(inputKey, `Max: ${max}`);
        } else {
            newValidationErrors.delete(inputKey);
        }
        setValidationErrors(newValidationErrors);

        setMarksData(prev => {
            const newMap = new Map(prev);
            const currentMark = newMap.get(key) || { studentId, examId: numericExamId, subject };
            const updatedMark = { ...currentMark, [field]: numericValue };
            newMap.set(key, updatedMark);
            return newMap;
        });

        setDirtyKeys(prev => new Set(prev).add(key));
        setSaveStatus('pending');
    };

    // FIX: Use specific StudentExtraDataField type for the 'field' parameter to ensure type safety and resolve misleading spread operator error.
    const handleExtraDataChange = (studentId: number, field: StudentExtraDataField, value: string) => {
        const key = `${studentId}-extra`;
        setStudentExtraData(prev => {
            const newMap = new Map(prev);
            const currentData = newMap.get(studentId) || { studentId, examId: numericExamId };
            const updatedData = { ...currentData, [field]: value } as Partial<StudentExamData>;
            newMap.set(studentId, updatedData);
            return newMap;
        });

        setDirtyKeys(prev => new Set(prev).add(key));
        setSaveStatus('pending');
    };

    const saveDirtyData = useCallback(async () => {
        if (dirtyKeys.size === 0 || validationErrors.size > 0) {
            if (validationErrors.size > 0) setSaveStatus('error');
            return;
        }
        setSaveStatus('saving');

        const marksToSave: Mark[] = [];
        const extraDataToSave: StudentExamData[] = [];
        
        const currentDirtyKeys = new Set(dirtyKeys);
        setDirtyKeys(new Set());

        // FIX: Replaced for...of loop with forEach to avoid TypeScript type inference issues where 'key' was 'unknown'.
        currentDirtyKeys.forEach(key => {
            if (key.endsWith('-extra')) {
                const studentId = Number(key.split('-')[0]);
                const data = studentExtraData.get(studentId);
                if (data) extraDataToSave.push(data as StudentExamData);
            } else {
                const mark = marksData.get(key);
                if (mark) marksToSave.push(mark as Mark);
            }
        });
        
        try {
            await db.transaction('rw', db.marks, db.studentExamData, async () => {
                if (marksToSave.length > 0) await db.marks.bulkPut(marksToSave);
                if (extraDataToSave.length > 0) await db.studentExamData.bulkPut(extraDataToSave);
            });
            setSaveStatus('synced');
        } catch (error) {
            console.error("Failed to save marks:", error);
            setSaveStatus('error');
        }
    }, [dirtyKeys, marksData, studentExtraData, validationErrors.size]);

    useEffect(() => {
        if (saveStatus !== 'pending') return;
        const handler = setTimeout(() => {
            saveDirtyData();
        }, DEBOUNCE_DELAY);
        return () => clearTimeout(handler);
    }, [saveStatus, saveDirtyData]);

    const handleGeneratePdf = async (student: Student) => {
        if (!exam || !schoolDetails) return;
        setIsGeneratingPdf(student.id!);
        try {
            await saveDirtyData();

            const studentMarks = await db.marks.where({ studentId: student.id!, examId: numericExamId }).toArray();
            const studentData = await db.studentExamData.where({ studentId: student.id!, examId: numericExamId }).first();

            if (studentMarks.length === 0 || !studentData) {
                alert(`Data is incomplete for ${student.name}. Cannot generate progress card.`);
                setIsGeneratingPdf(null);
                return;
            }
            
            await generatePdfFromComponent(
                <ProgressCard
                    student={student}
                    marks={studentMarks}
                    schoolDetails={schoolDetails}
                    studentExamData={studentData}
                    examName={exam.name}
                />,
                `ProgressCard-${exam.name}-${student.admissionNo}`
            );
        } catch (err) {
            console.error("PDF generation failed:", err);
            alert("An error occurred while generating the PDF.");
        } finally {
            setIsGeneratingPdf(null);
        }
    };

    if (!exam || !students) {
        return <div className="p-4 text-center">Loading exam data...</div>;
    }

    return (
        <div className="flex flex-col h-full">
            <header className="flex-shrink-0 p-3 bg-card border-b border-border">
                <h2 className="text-lg font-bold">{exam.name}</h2>
                <p className="text-sm text-foreground/70">Class: {exam.className}</p>
                <div className="text-xs font-semibold mt-2">
                    Status: 
                    {saveStatus === 'synced' && <span className="text-green-500 ml-1">Synced</span>}
                    {saveStatus === 'pending' && <span className="text-yellow-500 ml-1">Pending changes...</span>}
                    {saveStatus === 'saving' && <span className="text-blue-500 ml-1">Saving...</span>}
                    {saveStatus === 'error' && <span className="text-red-500 ml-1">Error saving! Check for invalid entries.</span>}
                </div>
            </header>

            <div className="flex-shrink-0 flex items-center gap-1 p-2 bg-background/80 overflow-x-auto border-b border-border">
                {SUBJECTS.map(subject => (
                    <button
                        key={subject}
                        onClick={() => setActiveSubject(subject)}
                        className={`py-2 px-3 text-xs font-semibold rounded-md flex-shrink-0 ${activeSubject === subject ? 'bg-primary text-primary-foreground' : 'bg-card'}`}
                    >
                        {subject}
                    </button>
                ))}
            </div>

            <main className="flex-1 overflow-y-auto">
                <table className="w-full text-xs border-collapse">
                    <thead className="sticky top-0 bg-card z-10">
                        <tr>
                            <th className="p-2 border-b border-border text-left">Roll</th>
                            <th className="p-2 border-b border-border text-left">Name</th>
                            {displayedMarkFields.map(field => (
                                <th key={String(field.key)} className="p-2 border-b border-border">{field.label}</th>
                            ))}
                            <th className="p-2 border-b border-border">Print</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map(student => {
                            const key = `${student.id!}-${activeSubject}`;
                            const studentMark = marksData.get(key) || {};
                            return (
                                <tr key={student.id} className="odd:bg-background/50">
                                    <td className="p-2 border-b border-border text-center">{student.rollNo}</td>
                                    <td className="p-2 border-b border-border font-semibold">{student.name}</td>
                                    {displayedMarkFields.map(field => {
                                        const inputKey = `${key}-${String(field.key)}`;
                                        const error = validationErrors.get(inputKey);
                                        return (
                                            <td key={String(field.key)} className="p-1 border-b border-border">
                                                <input
                                                    type="number"
                                                    value={studentMark[field.key] ?? ''}
                                                    onChange={e => handleMarkChange(student.id!, activeSubject!, field.key, e.target.value)}
                                                    className={`w-full p-2 text-center bg-transparent border rounded-md ${error ? 'border-red-500' : 'border-input'}`}
                                                    placeholder={`/${field.max}`}
                                                />
                                            </td>
                                        );
                                    })}
                                    <td className="p-1 border-b border-border text-center">
                                        <button 
                                            onClick={() => handleGeneratePdf(student)}
                                            disabled={isGeneratingPdf === student.id}
                                            className="p-2 rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                                        >
                                            {isGeneratingPdf === student.id ? '...' : <PrintIcon className="w-3 h-3" />}
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                 <div className="p-3 bg-card mt-auto border-t border-border">
                    <h3 className="font-semibold text-sm mb-2">Student Remarks & Proficiency</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {students.map(student => (
                        <div key={student.id} className="p-2 bg-background rounded-md">
                            <p className="font-bold text-xs mb-1">{student.name}</p>
                            <input
                                type="text"
                                placeholder="Remarks..."
                                value={studentExtraData.get(student.id!)?.remarks || ''}
                                onChange={e => handleExtraDataChange(student.id!, 'remarks', e.target.value)}
                                className="w-full p-2 text-xs bg-transparent border border-input rounded-md mb-1"
                            />
                            <select 
                                value={studentExtraData.get(student.id!)?.proficiencyLevel || ''}
                                onChange={e => handleExtraDataChange(student.id!, 'proficiencyLevel', e.target.value)}
                                className="w-full p-2 text-xs bg-transparent border border-input rounded-md"
                            >
                                <option value="">-- Proficiency --</option>
                                <option value="Stream">Stream</option>
                                <option value="Mountain">Mountain</option>
                                <option value="Sky">Sky</option>
                            </select>
                        </div>
                    ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ExamMarks;