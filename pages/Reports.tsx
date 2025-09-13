import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import Card from '../components/Card';
import { db } from '../services/db';
import { useAppData } from '../hooks/useAppData';
import { generatePdfFromComponent } from '../utils/pdfGenerator';
import SubjectTopperList from '../components/SubjectTopperList';
import { Student } from '../types';

const SUBJECTS = ['English', 'Math', 'Science', 'Social Science', 'Urdu', 'Kashmiri'];
const inputStyle = "p-2 w-full bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-xs transition-colors";

const Reports: React.FC = () => {
    const { schoolDetails } = useAppData();
    const exams = useLiveQuery(() => db.exams.toArray(), []);
    
    const [selectedExamId, setSelectedExamId] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');

    const handleGenerateTopperList = async () => {
        if (!selectedExamId || !selectedSubject) {
            setError('Please select both an exam and a subject.');
            return;
        }
        setError('');
        setIsGenerating(true);

        try {
            const examId = Number(selectedExamId);
            const exam = await db.exams.get(examId);
            if (!exam) throw new Error('Exam not found');

            const marksForSubject = await db.marks.where({ examId, subject: selectedSubject }).toArray();
            
            if (marksForSubject.length === 0) {
                setError(`No marks found for ${selectedSubject} in ${exam.name}.`);
                setIsGenerating(false);
                return;
            }

            const studentIds = marksForSubject.map(m => m.studentId);
            const students = await db.students.where('id').anyOf(studentIds).toArray();
            const studentsMap = new Map<number, Student>(students.map(s => [s.id!, s]));

            const rankedStudents = marksForSubject.map(mark => {
                const faTotal = (mark.fa1 || 0) + (mark.fa2 || 0) + (mark.fa3 || 0) + (mark.fa4 || 0) + (mark.fa5 || 0) + (mark.fa6 || 0);
                const totalScore = faTotal + (mark.coCurricular || 0) + (mark.summative || 0);
                return {
                    student: studentsMap.get(mark.studentId),
                    totalScore,
                };
            })
            .filter(item => item.student) // Filter out any marks where student wasn't found
            .sort((a, b) => b.totalScore - a.totalScore)
            .slice(0, 5); // Get top 5

            await generatePdfFromComponent(
                <SubjectTopperList
                    toppers={rankedStudents as { student: Student; totalScore: number }[]}
                    examName={exam.name}
                    subjectName={selectedSubject}
                    schoolDetails={schoolDetails!}
                />,
                `Topper-List-${exam.name}-${selectedSubject}`
            );

        } catch (err: any) {
            console.error("Failed to generate topper list:", err);
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="h-full flex flex-col gap-4 animate-fade-in">
            <Card className="p-3">
                <h2 className="text-md font-semibold mb-2 border-b border-border pb-1">Generate Reports</h2>
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-primary">Subject Topper List</h3>
                    <div>
                        <label className="block text-xs font-medium text-foreground/80 mb-1">Select Exam</label>
                        <select value={selectedExamId} onChange={e => setSelectedExamId(e.target.value)} className={inputStyle}>
                            <option value="">-- Choose Exam --</option>
                            {exams?.map(exam => <option key={exam.id} value={exam.id}>{exam.name} - Class {exam.className}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-xs font-medium text-foreground/80 mb-1">Select Subject</label>
                        <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className={inputStyle}>
                            <option value="">-- Choose Subject --</option>
                            {SUBJECTS.map(subject => <option key={subject} value={subject}>{subject}</option>)}
                        </select>
                    </div>
                    {error && <p className="text-red-500 text-xs text-center">{error}</p>}
                    <button 
                        onClick={handleGenerateTopperList} 
                        disabled={isGenerating}
                        className="w-full py-2 px-4 rounded-md bg-accent text-accent-foreground hover:bg-accent-hover text-sm font-semibold disabled:opacity-60"
                    >
                        {isGenerating ? 'Generating...' : 'Generate PDF'}
                    </button>
                </div>
            </Card>
        </div>
    );
};

export default Reports;
