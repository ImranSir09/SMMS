import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';
import { useAppData } from '../hooks/useAppData';
import { DownloadIcon } from '../components/icons';
import Card from '../components/Card';
import { useToast } from '../contexts/ToastContext';
import { Mark } from '../types';
import { SUBJECTS } from '../constants';
import { exportToExcel } from '../utils/excelGenerator';

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

    const getGrade = (percentage: number): string => {
        if (percentage > 85) return 'A+';
        if (percentage > 70) return 'A';
        if (percentage > 55) return 'B';
        if (percentage > 40) return 'C';
        if (percentage >= 33) return 'D';
        return 'E';
    };

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
                    examId: 0, 
                    subject: mark.subject,
                };

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
            
            const excelData = students.map(student => {
                const studentMarks = marksMap.get(student.id!) || new Map();
                let grandTotal = 0;
                const grandMaxMarks = SUBJECTS.length * 100;

                const row: { [key: string]: any } = {
                    'Roll No': student.rollNo,
                    'Adm No': student.admissionNo,
                    'Aadhar No': student.aadharNo,
                    'Name': student.name,
                    "Father's Name": student.fathersName,
                    "Mother's Name": student.mothersName,
                    'Address': student.address,
                    'Category': student.category,
                    'D.O.B': student.dob,
                    'Contact No': student.contact,
                };

                SUBJECTS.forEach(subject => {
                    const mark = studentMarks.get(subject);
                    const faTotal = (mark?.fa1 || 0) + (mark?.fa2 || 0) + (mark?.fa3 || 0) + (mark?.fa4 || 0) + (mark?.fa5 || 0) + (mark?.fa6 || 0);
                    const subjectTotal = faTotal + (mark?.coCurricular || 0) + (mark?.summative || 0);
                    grandTotal += subjectTotal;

                    row[`${subject} - F1`] = mark?.fa1 ?? '';
                    row[`${subject} - F2`] = mark?.fa2 ?? '';
                    row[`${subject} - F3`] = mark?.fa3 ?? '';
                    row[`${subject} - F4`] = mark?.fa4 ?? '';
                    row[`${subject} - F5`] = mark?.fa5 ?? '';
                    row[`${subject} - F6`] = mark?.fa6 ?? '';
                    row[`${subject} - Total FA`] = faTotal || '';
                    row[`${subject} - Co-Curr`] = mark?.coCurricular ?? '';
                    row[`${subject} - Summative`] = mark?.summative ?? '';
                    row[`${subject} - Total`] = subjectTotal || '';
                });

                row['Grand Total'] = grandTotal || '';
                row['Grade'] = grandMaxMarks > 0 ? getGrade((grandTotal / grandMaxMarks) * 100) : '';
                row['Remarks'] = '';

                return row;
            });
            
            exportToExcel(excelData, `SBA-Result-Sheet-Class-${selectedClass}`);
            addToast('Excel file generated successfully!', 'success');

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
                {isGenerating ? 'Generating...' : 'Export to Excel'}
            </button>
        </div>
    );
};

export default SbaResultSheet;