

import React, { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
// FIX: Updated react-router-dom imports from v5 to v6 to resolve export errors. Using useNavigate instead of useHistory.
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import { db } from '../services/db';
import { useAppData } from '../hooks/useAppData';
import { generatePdfFromComponent } from '../utils/pdfGenerator';
import { BookmarkIcon, ClipboardListIcon } from '../components/icons';
import SubjectTopperList from '../components/SubjectTopperList';
import { Student } from '../types';
import { SUBJECTS } from '../constants';

const inputStyle = "p-3 w-full bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm transition-colors";

const Reports: React.FC = () => {
    const { schoolDetails } = useAppData();
    // FIX: Replaced v5 useHistory with v6 useNavigate.
    const navigate = useNavigate();

    const exams = useLiveQuery(() => db.exams.toArray(), []);
    
    const [selectedExamId, setSelectedExamId] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [isGeneratingTopperList, setIsGeneratingTopperList] = useState(false);
    const [topperListError, setTopperListError] = useState('');

    const [selectedClass, setSelectedClass] = useState('');

    const classOptions = useLiveQuery(
        () => db.students.orderBy('className').uniqueKeys()
            .then(keys => (keys as string[]).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))),
        []
    );

    const handleGenerateTopperList = async () => {
        if (!selectedExamId || !selectedSubject) {
            setTopperListError('Please select both an exam and a subject.');
            return;
        }
        setTopperListError('');
        setIsGeneratingTopperList(true);

        try {
            const examId = Number(selectedExamId);
            const exam = await db.exams.get(examId);
            if (!exam) throw new Error('Exam not found');

            const marksForSubject = await db.marks.where({ examId, subject: selectedSubject }).toArray();
            
            if (marksForSubject.length === 0) {
                setTopperListError(`No marks found for ${selectedSubject} in ${exam.name}.`);
                setIsGeneratingTopperList(false);
                return;
            }

            const studentIds = marksForSubject.map(m => m.studentId);
            const studentsData = await db.students.where('id').anyOf(studentIds).toArray();
            const studentsMap = new Map<number, Student>(studentsData.map(s => [s.id!, s]));

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
            setTopperListError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsGeneratingTopperList(false);
        }
    };

    const handleGenerateRollStatement = () => {
        if (selectedClass) {
            // FIX: Updated navigation call to use navigate() for v6.
            navigate(`/print/roll-statement/${selectedClass}`);
        }
    };

    return (
        <div className="flex flex-col gap-4 animate-fade-in">
            <Card className="p-3">
                <h2 className="text-md font-semibold mb-2 border-b border-border pb-1">Exam Reports</h2>
                <div className="space-y-3">
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-primary">
                        <BookmarkIcon className="w-4 h-4" />
                        <h3>Subject Topper List</h3>
                    </div>
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
                    {topperListError && <p className="text-red-500 text-xs text-center">{topperListError}</p>}
                    <button 
                        onClick={handleGenerateTopperList} 
                        disabled={isGeneratingTopperList}
                        className="w-full py-3 px-5 rounded-md bg-accent text-accent-foreground hover:bg-accent-hover text-sm font-semibold disabled:opacity-60"
                    >
                        {isGeneratingTopperList ? 'Generating...' : 'Generate Topper List PDF'}
                    </button>
                </div>
            </Card>
            
            <Card className="p-3">
                <h2 className="text-md font-semibold mb-2 border-b border-border pb-1">Class Reports</h2>
                <div className="space-y-3">
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-primary">
                        <ClipboardListIcon className="w-4 h-4" />
                        <h3>Class Roll Statement</h3>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-foreground/80 mb-1">Select Class</label>
                        <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className={inputStyle}>
                            <option value="">-- Choose Class --</option>
                            {classOptions?.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <button 
                        onClick={handleGenerateRollStatement} 
                        disabled={!selectedClass}
                        className="w-full py-3 px-5 rounded-md bg-accent text-accent-foreground hover:bg-accent-hover text-sm font-semibold disabled:opacity-60"
                    >
                        Generate Roll Statement PDF
                    </button>
                </div>
            </Card>
        </div>
    );
};

export default Reports;