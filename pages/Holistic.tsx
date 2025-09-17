import React, { useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';
import { Student, HPCReportData, HpcPerformanceLevel, HpcSentiment, ParentFeedback, PreparatoryPartA3, HpcSubjectAssessment } from '../types';
import { useToast } from '../contexts/ToastContext';
import Card from '../components/Card';
import { SaveIcon, UsersIcon, PaletteIcon, HeartHandIcon, FlaskConicalIcon, ArrowRightIcon } from '../components/icons';
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
    attendance: {},
    foundationalData: { interests: [] },
    preparatoryData: { partA2: { thingsToLearn: [] }, partA3: {}, parentFeedback: {} },
    middleData: { 
        partA1: {}, 
        partA2: { academicGoalSteps: [], personalGoalSteps: [], thingsLearntAtSchool: [], thingsLearntOutsideSchool: [] }, 
        partA3: {}, 
        partA4: { resourcesAvailable: {}, understandingOfChild: {}, needsSupportWith: {} } 
    },
    subjectAssessments: {},
});

const inputStyle = "p-2 w-full bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary text-sm transition-colors";
const labelStyle = "block text-xs font-medium text-foreground/80 mb-1";
const checkboxLabelStyle = "flex items-center gap-2 text-sm cursor-pointer";

// Reusable Collapsible Section with its own state
const CollapsibleSection: React.FC<{ title: string; children: ReactNode, initiallyOpen?: boolean }> = ({ title, children, initiallyOpen = false }) => {
    const [isOpen, setIsOpen] = useState(initiallyOpen);
    return (
        <div className="border border-border rounded-lg">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-2 bg-background/50 hover:bg-black/5 dark:hover:bg-white/5"
            >
                <h3 className="font-semibold text-sm">{title}</h3>
                <ArrowRightIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
            </button>
            {isOpen && <div className="p-3 border-t border-border">{children}</div>}
        </div>
    );
};

// Foundational Stage Form
const FoundationalForm: React.FC<{ data: HPCReportData, setData: React.Dispatch<React.SetStateAction<HPCReportData | null>> }> = ({ data, setData }) => {
    // Component logic here...
    return <div>Foundational Stage Form Placeholder</div>;
};

// Preparatory Stage Form
const PreparatoryForm: React.FC<{ data: HPCReportData, setData: React.Dispatch<React.SetStateAction<HPCReportData | null>> }> = ({ data, setData }) => {
    // Component logic here...
    return <div>Preparatory Stage Form Placeholder</div>;
};

// Middle Stage Form
const MiddleForm: React.FC<{ data: HPCReportData, setData: React.Dispatch<React.SetStateAction<HPCReportData | null>> }> = ({ data, setData }) => {
    // Component logic here...
    return <div>Middle Stage Form Placeholder</div>;
};

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
    
    const renderFormForStage = () => {
        if (!selectedStudent || !hpcData) {
            return <div className="text-center p-4 text-sm text-foreground/60">Select a student to view or enter HPC data.</div>;
        }
        
        const stage = getStageForClass(selectedStudent.className);
        if (!stage) {
            return <div className="text-center p-4 text-sm text-red-500">HPC is not configured for class {selectedStudent.className}.</div>;
        }

        switch(stage) {
            case 'Foundational':
                return <FoundationalForm data={hpcData} setData={setHpcData} />;
            case 'Preparatory':
                 return <PreparatoryForm data={hpcData} setData={setHpcData} />;
            case 'Middle':
                 return <MiddleForm data={hpcData} setData={setHpcData} />;
            default:
                return null;
        }
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
                    <div className="p-2 border-b border-border">
                        <h3 className="font-bold text-md text-center">{hpcData.stage} Stage Entry for {selectedStudent?.name}</h3>
                    </div>
                    {renderFormForStage()}
                    <div className="p-4 border-t border-border flex justify-end items-center gap-2 bg-card">
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
                        Please select a class and then a student to begin.
                    </p>
                </Card>
            )}
        </div>
    );
};

export default Holistic;
