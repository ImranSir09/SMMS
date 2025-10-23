

import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';
import { useAppData } from '../hooks/useAppData';
import { generatePdfFromComponent } from '../utils/pdfGenerator';
import { DownloadIcon } from '../components/icons';
import Card from '../components/Card';
import { useToast } from '../contexts/ToastContext';
import CoCurricularRecordSheet from '../components/CoCurricularRecordSheet';
import { SUBJECTS } from '../constants';

const CoCurricularReport: React.FC = () => {
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [selectedSubject, setSelectedSubject] = useState(SUBJECTS[0]);
    const [isGenerating, setIsGenerating] = useState(false);
    const { schoolDetails } = useAppData();
    const { addToast } = useToast();

    const classOptions = useLiveQuery(
        () => db.students.orderBy('className').uniqueKeys()
            .then(keys => (keys as string[]).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))),
        []
    );

    const studentsInClass = useLiveQuery(() => 
        selectedClass ? db.students.where({ className: selectedClass }).sortBy('rollNo') : Promise.resolve([]),
    [selectedClass]);

    const handleGenerateReport = async () => {
        if (!selectedStudentId || !selectedSubject) {
            addToast('Please select a student and a subject.', 'error');
            return;
        }
        if (!schoolDetails) {
            addToast('School details are not configured.', 'error');
            return;
        }

        setIsGenerating(true);
        addToast(`Generating report...`, 'info');

        try {
            const studentId = Number(selectedStudentId);
            const student = await db.students.get(studentId);
            if (!student) {
                throw new Error("Student not found.");
            }

            await generatePdfFromComponent(
                <CoCurricularRecordSheet
                    student={student}
                    schoolDetails={schoolDetails}
                    subject={selectedSubject}
                    session="2025"
                />,
                `CoCurricular-Record-${student.name}-${selectedSubject}`
            );
            addToast('Report generated successfully!', 'success');

        } catch (error) {
            console.error("Report generation failed:", error);
            addToast('An error occurred while generating the report.', 'error');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="flex flex-col gap-4 animate-fade-in">
            <Card className="p-3">
                <h2 className="text-md font-semibold mb-2">Generate Co-Curricular Report</h2>
                <div className="space-y-3">
                    <select value={selectedClass} onChange={e => { setSelectedClass(e.target.value); setSelectedStudentId(''); }} className="p-3 bg-background border border-input rounded-md w-full text-sm">
                        <option value="">-- Select Class --</option>
                        {classOptions?.map(c => <option key={c} value={c}>Class {c}</option>)}
                    </select>

                    <select value={selectedStudentId} onChange={e => setSelectedStudentId(e.target.value)} disabled={!selectedClass} className="p-3 bg-background border border-input rounded-md w-full text-sm disabled:opacity-50">
                        <option value="">-- Select Student --</option>
                        {studentsInClass?.map(s => <option key={s.id} value={s.id}>{s.name} (Roll: {s.rollNo})</option>)}
                    </select>
                    
                    <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className="p-3 bg-background border border-input rounded-md w-full text-sm">
                        <option value="">-- Select Subject --</option>
                        {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </Card>

            <button 
                onClick={handleGenerateReport}
                disabled={isGenerating || !selectedStudentId || !selectedSubject}
                className="w-full py-3 px-5 rounded-md bg-accent text-accent-foreground hover:bg-accent-hover text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
            >
                <DownloadIcon className="w-5 h-5" />
                {isGenerating ? 'Generating...' : 'Generate Report'}
            </button>
        </div>
    );
};

export default CoCurricularReport;