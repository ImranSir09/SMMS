import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';
import { Exam, Student, Mark, StudentExamData } from '../types';
import { useAppData } from '../hooks/useAppData';
import { generatePdfFromComponent } from '../utils/pdfGenerator';
import ProgressCard from '../components/ProgressCard';
import { SaveIcon, PrintIcon } from '../components/icons';

const SUBJECTS = ['English', 'Mathematics', 'Science', 'Social Science', 'Hindi', 'Urdu', 'Kashmiri', 'Computer', 'Art', 'Music', 'P.E.', 'G.K.'];

const ExamMarks: React.FC = () => {
    const { examId } = useParams<{ examId: string }>();
    const [activeSubject, setActiveSubject] = useState(SUBJECTS[0]);
    const [marks, setMarks] = useState<{ [studentId: number]: Partial<Mark> }>({});
    const [studentExamData, setStudentExamData] = useState<{ [studentId: number]: Partial<StudentExamData> }>({});
    const [isSaving, setIsSaving] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState<number | null>(null);
    const { schoolDetails } = useAppData();

    const numericExamId = Number(examId);

    const exam = useLiveQuery(() => db.exams.get(numericExamId), [numericExamId]);
    const students = useLiveQuery(() => 
        exam ? db.students.where('className').equals(exam.className).sortBy('rollNo') : Promise.resolve([]),
    [exam]);
    
    useEffect(() => {
        if (!students || !numericExamId || !activeSubject) return;

        const fetchMarks = async () => {
            const marksData = await db.marks
                .where({ examId: numericExamId, subject: activeSubject })
                .toArray();
            
            const studentExamDataRecords = await db.studentExamData
                .where('examId').equals(numericExamId)
                .toArray();

            const marksMap: { [studentId: number]: Partial<Mark> } = {};
            students.forEach(student => {
                const existingMark = marksData.find(m => m.studentId === student.id);
                marksMap[student.id!] = existingMark || { fa1: undefined, fa2: undefined, fa3: undefined, fa4: undefined, fa5: undefined, fa6: undefined, coCurricular: undefined, summative: undefined };
            });
            setMarks(marksMap);
            
            const studentDataMap: { [studentId: number]: Partial<StudentExamData> } = {};
            students.forEach(student => {
                const existingData = studentExamDataRecords.find(d => d.studentId === student.id);
                studentDataMap[student.id!] = existingData || { proficiencyLevel: '', remarks: '' };
            });
            setStudentExamData(studentDataMap);
        };
        fetchMarks();
    }, [students, numericExamId, activeSubject]);

    const handleMarkChange = (studentId: number, field: keyof Mark, value: string) => {
        const numericValue = value === '' ? undefined : Number(value);
        setMarks(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], [field]: numericValue }
        }));
    };
    
    const handleStudentDataChange = (studentId: number, field: keyof StudentExamData, value: string) => {
        setStudentExamData(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], [field]: value }
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await db.transaction('rw', db.marks, db.studentExamData, async () => {
                const marksToPut: Mark[] = [];
                const studentDataToPut: StudentExamData[] = [];
                
                for (const studentIdStr in marks) {
                    const studentId = Number(studentIdStr);
                    const markData = marks[studentId];
                    // Save marks for active subject
                    if (Object.values(markData).some(v => v !== undefined)) {
                         marksToPut.push({
                            ...markData,
                            examId: numericExamId,
                            studentId: studentId,
                            subject: activeSubject
                        } as Mark);
                    }
                }
                
                for (const studentIdStr in studentExamData) {
                    const studentId = Number(studentIdStr);
                     // Save student specific exam data (remarks, etc.)
                    const studentData = studentExamData[studentId];
                    if (studentData && (studentData.remarks || studentData.proficiencyLevel)) {
                        studentDataToPut.push({
                            ...studentData,
                            examId: numericExamId,
                            studentId: studentId
                        } as StudentExamData);
                    }
                }
                if (marksToPut.length > 0) await db.marks.bulkPut(marksToPut);
                if (studentDataToPut.length > 0) await db.studentExamData.bulkPut(studentDataToPut);
            });
            alert('Marks saved successfully!');
        } catch (error) {
            console.error('Failed to save marks:', error);
            alert('Error saving marks.');
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleGenerateProgressCard = async (student: Student) => {
        if (!schoolDetails || !exam) return;
        setIsGeneratingPdf(student.id!);
        const studentMarks = await db.marks.where({ examId: numericExamId, studentId: student.id! }).toArray();
        const studentData = await db.studentExamData.where({ examId: numericExamId, studentId: student.id! }).first();

        if (studentMarks.length === 0) {
            alert("No marks entered for this student.");
            setIsGeneratingPdf(null);
            return;
        }

        await generatePdfFromComponent(
            <ProgressCard
                student={student}
                marks={studentMarks}
                schoolDetails={schoolDetails}
                studentExamData={studentData || { examId: numericExamId, studentId: student.id! }}
                examName={exam.name}
            />,
            `Progress-Card-${student.admissionNo}`
        );
        setIsGeneratingPdf(null);
    };

    const markFields: (keyof Mark)[] = ['fa1', 'fa2', 'fa3', 'fa4', 'fa5', 'fa6', 'coCurricular', 'summative'];
    
    if (!exam || !students) {
        return <div className="p-4 text-center">Loading exam data...</div>;
    }

    return (
        <div className="h-full flex flex-col">
            <header className="flex-shrink-0 p-2 border-b border-border">
                <h2 className="text-lg font-bold">{exam.name} - Class {exam.className}</h2>
                <div className="flex items-center gap-2 mt-2">
                    <select value={activeSubject} onChange={e => setActiveSubject(e.target.value)} className="p-1 text-xs bg-background border border-input rounded-md w-full">
                        {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button onClick={handleSave} disabled={isSaving} className="py-1 px-3 text-xs font-semibold rounded-md bg-primary text-primary-foreground disabled:opacity-50 flex items-center gap-1">
                        <SaveIcon className="w-3 h-3" /> {isSaving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </header>
            
            <main className="flex-1 overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                    <thead className="sticky top-0 bg-card z-10">
                        <tr>
                            <th className="p-1 border border-border sticky left-0 bg-card z-20">Student</th>
                            {markFields.map(f => <th key={String(f)} className="p-1 border border-border">{String(f)}</th>)}
                            <th className="p-1 border border-border">Remarks</th>
                            <th className="p-1 border border-border">Proficiency</th>
                            <th className="p-1 border border-border">Card</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map(student => (
                            <tr key={student.id}>
                                <td className="p-1 border border-border font-semibold sticky left-0 bg-card z-10 whitespace-nowrap">{student.name}</td>
                                {markFields.map(field => (
                                    <td key={field} className="p-0 border border-border">
                                        <input
                                            type="number"
                                            value={marks[student.id!]?.[field] ?? ''}
                                            onChange={e => handleMarkChange(student.id!, field, e.target.value)}
                                            className="w-10 text-center bg-transparent focus:bg-background outline-none"
                                            min="0"
                                        />
                                    </td>
                                ))}
                                <td className="p-0 border border-border">
                                    <input
                                        type="text"
                                        value={studentExamData[student.id!]?.remarks ?? ''}
                                        onChange={e => handleStudentDataChange(student.id!, 'remarks', e.target.value)}
                                        className="w-24 text-center bg-transparent focus:bg-background outline-none"
                                    />
                                </td>
                                 <td className="p-0 border border-border">
                                    <select
                                        value={studentExamData[student.id!]?.proficiencyLevel ?? ''}
                                        onChange={e => handleStudentDataChange(student.id!, 'proficiencyLevel', e.target.value)}
                                        className="w-full bg-transparent text-xs"
                                    >
                                        <option value="">--</option>
                                        <option value="Stream">Stream</option>
                                        <option value="Mountain">Mountain</option>
                                        <option value="Sky">Sky</option>
                                    </select>
                                </td>
                                <td className="p-1 border border-border text-center">
                                     <button onClick={() => handleGenerateProgressCard(student)} disabled={isGeneratingPdf === student.id} className="disabled:opacity-50">
                                        {isGeneratingPdf === student.id ? '...' : <PrintIcon className="w-4 h-4" />}
                                    </button>
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