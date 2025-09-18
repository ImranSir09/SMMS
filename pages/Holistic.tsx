
import React, { useState, useEffect, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';
import { HPCReportData, Stage } from '../types';
import Card from '../components/Card';
import { useToast } from '../contexts/ToastContext';
import { SaveIcon } from '../components/icons';
import { HPCFoundationalForm } from '../components/HPCFoundationalForm';
import { HPCPreparatoryForm } from '../components/HPCPreparatoryForm';
import { HPCMiddleForm } from '../components/HPCMiddleForm';

const ACADEMIC_YEAR = '2024-25';

const getStageForClass = (className: string): Stage | null => {
    const foundational = ['PP1', 'PP2', 'Balvatika', '1st', '2nd'];
    const preparatory = ['3rd', '4th', '5th'];
    const middle = ['6th', '7th', '8th'];

    if (foundational.includes(className)) return 'Foundational';
    if (preparatory.includes(className)) return 'Preparatory';
    if (middle.includes(className)) return 'Middle';
    return null;
};

const defaultHpcData = (studentId: number, stage: Stage): Partial<HPCReportData> => {
    const baseData: Partial<HPCReportData> = {
        studentId,
        academicYear: ACADEMIC_YEAR,
        stage,
        summaries: {},
        attendance: {},
    };
    if (stage === 'Foundational') {
        baseData.foundationalData = { partA1: {}, interests: [] };
    }
    if (stage === 'Preparatory') {
        baseData.preparatoryData = { partA1: {}, partA2: {handDiagram: {}, myFavoriteThings: {}, thingsToLearn: []}, partA3: {}, peerFeedback: {}, parentGuardianFeedback: {resources:[], questions: {}, supportNeeded: []} };
    }
    if (stage === 'Middle') {
        baseData.middleData = {
            partA1: {},
            partA2: { academicGoal: {steps:[]}, personalGoal: {steps:[]}, learnings: {atSchool:[], outsideSchool:[]}, forTeacher: {} },
            partA3: {},
            partA4: { resources: [], understanding: {}, supportNeeded: [] },
            subjectAssessments: {}
        };
    }
    return baseData;
};

const Holistic: React.FC = () => {
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
    const [hpcData, setHpcData] = useState<Partial<HPCReportData> | null>(null);
    const { addToast } = useToast();

    const classOptions = useLiveQuery(
        () => db.students.orderBy('className').uniqueKeys()
            .then(keys => (keys as string[]).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))),
        []
    );

    const studentsInClass = useLiveQuery(() => 
        selectedClass ? db.students.where({ className: selectedClass }).sortBy('rollNo') : Promise.resolve([]),
    [selectedClass]);

    const stage = useMemo(() => selectedClass ? getStageForClass(selectedClass) : null, [selectedClass]);

    useEffect(() => {
        setSelectedStudentId(null);
    }, [selectedClass]);

    useEffect(() => {
        const loadData = async () => {
            if (selectedStudentId && stage) {
                const existingData = await db.hpcReports.where({ studentId: selectedStudentId, academicYear: ACADEMIC_YEAR }).first();
                if (existingData) {
                    setHpcData(existingData);
                } else {
                    setHpcData(defaultHpcData(selectedStudentId, stage));
                }
            } else {
                setHpcData(null);
            }
        };
        loadData();
    }, [selectedStudentId, stage]);
    
    const handleSave = async () => {
        if (!hpcData || !hpcData.studentId) {
            addToast('No student selected or data is missing.', 'error');
            return;
        }
        try {
            await db.hpcReports.put(hpcData as HPCReportData);
            addToast('Holistic Progress Card data saved successfully!', 'success');
        } catch (error) {
            console.error("Failed to save HPC data:", error);
            addToast('An error occurred while saving the data.', 'error');
        }
    };
    
    const renderFormForStage = () => {
        if (!stage || !hpcData) return <p className="text-center text-sm text-foreground/60 p-4">Select a student to begin.</p>;
        
        switch (stage) {
            case 'Foundational':
                return <HPCFoundationalForm 
                            data={hpcData.foundationalData!}
                            summaries={hpcData.summaries!}
                            attendance={hpcData.attendance!}
                            setData={(key, value) => setHpcData(prev => ({ ...prev!, [key]: value }))}
                        />;
            case 'Preparatory':
                 return <HPCPreparatoryForm 
                            data={hpcData.preparatoryData!} 
                            setData={(newData) => setHpcData(prev => ({ ...prev!, preparatoryData: newData }))} 
                        />;
            case 'Middle':
                return <HPCMiddleForm 
                            data={hpcData.middleData!} 
                            setData={(newData) => setHpcData(prev => ({ ...prev!, middleData: newData }))} 
                        />;
            default:
                 return (
                    <div className="p-4 space-y-4">
                        <h3 className="text-lg font-semibold">{stage} Stage Entry</h3>
                        <p className="text-sm text-center text-foreground/70">Data entry for this stage is not yet implemented.</p>
                    </div>
                );
        }
    };

    return (
        <div className="flex flex-col gap-3">
            <Card className="p-3">
                <h2 className="text-md font-semibold mb-2">Select Student</h2>
                <div className="grid grid-cols-2 gap-2">
                    <select
                        value={selectedClass}
                        onChange={e => setSelectedClass(e.target.value)}
                        className="p-3 bg-background border border-input rounded-md w-full"
                    >
                        <option value="">-- Select Class --</option>
                        {classOptions?.map(c => <option key={c} value={c}>Class {c}</option>)}
                    </select>
                    <select
                        value={selectedStudentId || ''}
                        onChange={e => setSelectedStudentId(Number(e.target.value))}
                        disabled={!selectedClass}
                        className="p-3 bg-background border border-input rounded-md w-full disabled:opacity-50"
                    >
                        <option value="">-- Select Student --</option>
                        {studentsInClass?.map(s => <option key={s.id} value={s.id}>{s.name} (R: {s.rollNo})</option>)}
                    </select>
                </div>
            </Card>
            
            {hpcData && (
                <Card>
                    {renderFormForStage()}
                    <div className="p-4 border-t border-border flex justify-end">
                        <button onClick={handleSave} className="py-2 px-4 rounded-md bg-primary text-primary-foreground font-semibold flex items-center gap-2">
                            <SaveIcon className="w-4 h-4" /> Save Data
                        </button>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default Holistic;
