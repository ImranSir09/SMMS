
import React, { useState, useEffect, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';
import { Student, HPCReportData } from '../types';
import { useToast } from '../contexts/ToastContext';
import Card from '../components/Card';
import { SaveIcon, UsersIcon } from '../components/icons';
import { useNavigate } from 'react-router-dom';

const ACADEMIC_YEAR = '2024-25';

const getStageForClass = (className: string): 'Foundational' | 'Preparatory' | 'Middle' | null => {
    const foundational = ['PP1', 'PP2', 'Balvatika', '1st', '2nd'];
    const preparatory = ['3rd', '4th', '5th'];
    const middle = ['6th', '7th', '8th'];

    if (foundational.includes(className)) return 'Foundational';
    if (preparatory.includes(className)) return 'Preparatory';
    if (middle.includes(className)) return 'Middle';
    return null;
};

const defaultHpcData = (student: Student, stage: 'Foundational' | 'Preparatory' | 'Middle'): HPCReportData => ({
    studentId: student.id!,
    academicYear: ACADEMIC_YEAR,
    stage,
    summaries: {},
    healthNotes: '',
    attendance: {},
    foundationalData: { interests: [], domainAssessments: {} },
    preparatoryData: { selfAssessment: {}, peerAssessment: {} },
    middleData: { selfAssessment: {}, peerAssessment: {}, teacherAssessment: {} }
});


const Holistic: React.FC = () => {
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
    const [hpcData, setHpcData] = useState<HPCReportData | null>(null);

    const classOptions = useLiveQuery(() => db.students.orderBy('className').uniqueKeys()
        .then(keys => (keys as string[]).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))), []);
    
    const studentsInClass = useLiveQuery(() => selectedClass ? db.students.where({ className: selectedClass }).sortBy('rollNo') : Promise.resolve([]), [selectedClass]);

    const selectedStudent = useMemo(() => studentsInClass?.find(s => s.id === selectedStudentId), [studentsInClass, selectedStudentId]);

    useEffect(() => {
        if (selectedStudent) {
            const stage = getStageForClass(selectedStudent.className);
            if (!stage) {
                setHpcData(null);
                return;
            }
            db.hpcReports.where({ studentId: selectedStudent.id!, academicYear: ACADEMIC_YEAR }).first()
                .then(data => {
                    setHpcData(data || defaultHpcData(selectedStudent, stage));
                });
        } else {
            setHpcData(null);
        }
    }, [selectedStudent]);

    const handleSave = async () => {
        if (hpcData) {
            try {
                await db.hpcReports.put(hpcData);
                addToast('HPC data saved successfully!', 'success');
            } catch (error) {
                console.error('Failed to save HPC data:', error);
                addToast('Error saving HPC data.', 'error');
            }
        }
    };
    
    // Placeholder for stage-specific forms
    const renderFormForStage = () => {
        if (!selectedStudent || !hpcData) {
            return <div className="text-center p-4 text-sm text-foreground/60">Select a student to view or enter HPC data.</div>;
        }
        
        const stage = getStageForClass(selectedStudent.className);
        if (!stage) {
            return <div className="text-center p-4 text-sm text-red-500">HPC is not configured for class {selectedStudent.className}.</div>;
        }

        // Here you would render a specific form component for each stage
        // For simplicity, we'll use a placeholder.
        return (
            <div className="p-4 space-y-4">
                <h3 className="font-bold text-lg">{stage} Stage Entry</h3>
                <p>Editing data for <span className="font-semibold">{selectedStudent.name}</span>.</p>
                <textarea 
                    className="p-3 w-full bg-background border border-input rounded-md text-sm h-48"
                    placeholder="Enter observational notes, assessments, etc. here. This is a placeholder for the detailed form."
                    value={hpcData.healthNotes || ''}
                    onChange={e => setHpcData(prev => prev ? {...prev, healthNotes: e.target.value} : null)}
                />
                <p className="text-xs text-foreground/60">
                    Note: This is a simplified form. The full HPC includes detailed domains, assessments, and attendance. You can view the full card by printing it.
                </p>
            </div>
        );
    };


    return (
        <div className="flex flex-col gap-3">
            <Card className="p-3">
                <h2 className="text-md font-semibold mb-2 border-b border-border pb-1">Select Student</h2>
                <div className="grid grid-cols-2 gap-2">
                    <select
                        value={selectedClass}
                        onChange={e => { setSelectedClass(e.target.value); setSelectedStudentId(null); }}
                        className="p-3 text-sm bg-background border border-input rounded-md w-full"
                    >
                        <option value="">-- Select Class --</option>
                        {classOptions?.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                     <select
                        value={selectedStudentId || ''}
                        onChange={e => setSelectedStudentId(Number(e.target.value))}
                        disabled={!selectedClass}
                        className="p-3 text-sm bg-background border border-input rounded-md w-full"
                    >
                        <option value="">-- Select Student --</option>
                        {studentsInClass?.map(s => <option key={s.id} value={s.id}>{s.rollNo}. {s.name}</option>)}
                    </select>
                </div>
            </Card>

            {hpcData ? (
                 <Card>
                    {renderFormForStage()}
                    <div className="p-4 border-t border-border flex justify-end items-center gap-2">
                         <button onClick={() => navigate(`/print/hpc/${selectedStudentId}`)} className="py-2 px-4 text-sm font-semibold rounded-md bg-purple-600 text-white">
                            Print HPC
                        </button>
                        <button onClick={handleSave} className="py-2 px-4 text-sm font-semibold rounded-md bg-primary text-primary-foreground flex items-center gap-2">
                            <SaveIcon className="w-4 h-4" /> Save
                        </button>
                    </div>
                 </Card>
            ) : (
                 <Card className="flex flex-col items-center justify-center text-center p-8 min-h-[300px]">
                    <UsersIcon className="w-12 h-12 text-foreground/20 mb-2" />
                    <h3 className="text-md font-semibold">Holistic Progress Card Entry</h3>
                    <p className="mt-1 text-xs text-foreground/60">
                        Please select a class and then a student to begin entering their holistic development data for the year.
                    </p>
                </Card>
            )}
        </div>
    );
};

export default Holistic;
