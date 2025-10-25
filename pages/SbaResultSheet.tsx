import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';
import { useAppData } from '../hooks/useAppData';
import { generatePdfFromComponent } from '../utils/pdfGenerator';
import { DownloadIcon } from '../components/icons';
import Card from '../components/Card';
import { useToast } from '../contexts/ToastContext';
import SbaResultSheetComponent from '../components/SbaResultSheetComponent';
import { Mark, Student } from '../types';

const SbaResultSheet: React.FC = () => {
    const [selectedClass, setSelectedClass] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const { schoolDetails } = useAppData();
    const { addToast } = useToast();

    const classOptions = useLiveQuery(
        () => db.students.orderBy('className').uniqueKeys()
            .then(keys => (keys as string[]).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))),
        []
    );

    const handleGenerateReport = async () => {
        if (!selectedClass) {
            addToast('Please select a class.', 'error');
            return;
        }
        if (!schoolDetails) {
            addToast('School details are not configured.', 'error');
            return;
        }

        setIsGenerating(true);
        addToast(`Generating SBA Result Sheet for Class ${selectedClass}...`, 'info');

        try {
            const students = await db.students.where({ className: selectedClass }).sortBy('rollNo');
            if (students.length === 0) {
                throw new Error("No students found in this class.");
            }
            const studentIds = students.map(s => s.id!);
            const allMarks = await db.marks.where('studentId').anyOf(studentIds).toArray();
            
            const marksMap = new Map<number, Map<string, Mark>>();
            students.forEach(student => {
                marksMap.set(student.id!, new Map<string, Mark>());
            });

            allMarks.forEach(mark => {
                const studentMarksMap = marksMap.get(mark.studentId);
                if (!studentMarksMap) return;

                const existingMark = studentMarksMap.get(mark.subject);
                const consolidatedMark: Mark = existingMark || {
                    studentId: mark.studentId,
                    examId: 0, // Not relevant for consolidated view
                    subject: mark.subject,
                };

                // Aggregate fields: add new values to existing ones.
                if (mark.fa1 !== undefined) consolidatedMark.fa1 = (consolidatedMark.fa1 || 0) + mark.fa1;
                if (mark.fa2 !== undefined) consolidatedMark.fa2 = (consolidatedMark.fa2 || 0) + mark.fa2;
                if (mark.fa3 !== undefined) consolidatedMark.fa3 = (consolidatedMark.fa3 || 0) + mark.fa3;
                if (mark.fa4 !== undefined) consolidatedMark.fa4 = (consolidatedMark.fa4 || 0) + mark.fa4;
                if (mark.fa5 !== undefined) consolidatedMark.fa5 = (consolidatedMark.fa5 || 0) + mark.fa5;
                if (mark.fa6 !== undefined) consolidatedMark.fa6 = (consolidatedMark.fa6 || 0) + mark.fa6;
                if (mark.coCurricular !== undefined) consolidatedMark.coCurricular = (consolidatedMark.coCurricular || 0) + mark.coCurricular;
                if (mark.summative !== undefined) consolidatedMark.summative = (consolidatedMark.summative || 0) + mark.summative;
                
                studentMarksMap.set(mark.subject, consolidatedMark);
            });


            await generatePdfFromComponent(
                <SbaResultSheetComponent
                    students={students}
                    schoolDetails={schoolDetails}
                    className={selectedClass}
                    marksMap={marksMap}
                    session="2025"
                />,
                `SBA-Result-Sheet-Class-${selectedClass}`,
                { orientation: 'landscape', format: 'a3' }
            );
            addToast('Report generated successfully!', 'success');

        } catch (error: any) {
            console.error("Report generation failed:", error);
            addToast(error.message || 'An error occurred while generating the report.', 'error');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="flex flex-col gap-4 animate-fade-in">
            <Card className="p-3">
                <h2 className="text-md font-semibold mb-2">Generate SBA Result Sheet</h2>
                <div className="space-y-3">
                    <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="p-3 bg-background border border-input rounded-md w-full text-sm">
                        <option value="">-- Select Class --</option>
                        {classOptions?.map(c => <option key={c} value={c}>Class {c}</option>)}
                    </select>
                </div>
            </Card>

            <button 
                onClick={handleGenerateReport}
                disabled={isGenerating || !selectedClass}
                className="w-full py-3 px-5 rounded-lg bg-accent text-accent-foreground hover:bg-accent-hover text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
            >
                <DownloadIcon className="w-5 h-5" />
                {isGenerating ? 'Generating...' : 'Generate A3 Report'}
            </button>
        </div>
    );
};

export default SbaResultSheet;