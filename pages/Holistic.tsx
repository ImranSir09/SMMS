import React, { useState, useEffect, useMemo, useCallback, FC } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';
import { Student, HPCReportData, Stage, FoundationalData, PreparatoryData, MiddleData, HpcMiddleSubjectAssessment } from '../types';
import Card from '../components/Card';
import { useToast } from '../contexts/ToastContext';
import { SaveIcon } from '../components/icons';

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

const MIDDLE_STAGE_SUBJECTS = ['Language 1 (R1)', 'Language 2 (R2)', 'Language 3 (R3)', 'Mathematics', 'Science', 'Social Science', 'Art Education', 'Physical Education', 'Skill Education'];


const MiddleForm: FC<{ data: MiddleData, setData: (data: MiddleData) => void }> = ({ data, setData }) => {

    // FIX: Corrected handleDataChange to not use a functional update, which was causing a type error.
    const handleDataChange = (path: string, value: any) => {
        const keys = path.split('.');
        let temp = { ...data };
        let current = temp as any;
        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) {
                current[keys[i]] = {};
            }
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        setData(temp);
    };
    
     const handleCheckboxChange = (path: string, value: string, checked: boolean) => {
        const keys = path.split('.');
        let temp = { ...data };
        let current = temp as any;
        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) current[keys[i]] = {};
            current = current[keys[i]];
        }
        
        const currentArray = current[keys[keys.length - 1]] || [];
        const newArray = checked ? [...currentArray, value] : currentArray.filter((item: string) => item !== value);
        current[keys[keys.length - 1]] = newArray;

        setData(temp);
    };

    return (
        <div className="p-4 space-y-4">
            <details className="bg-background/50 rounded-lg">
                <summary className="p-2 font-semibold cursor-pointer">Part A: Student Profile</summary>
                <div className="p-2 border-t border-border space-y-2">
                    <h4 className="font-semibold text-sm">All About Me & Goal Setting</h4>
                    <input className="w-full p-2 border rounded" placeholder="I live with my..." value={data.partA2?.liveWith || ''} onChange={e => handleDataChange('partA2.liveWith', e.target.value)} />
                    <textarea className="w-full p-2 border rounded" placeholder="My Academic Goal description..." value={data.partA2?.academicGoal?.description || ''} onChange={e => handleDataChange('partA2.academicGoal.description', e.target.value)} />
                    
                    <h4 className="font-semibold text-sm mt-2">My Ambition Card</h4>
                    <input className="w-full p-2 border rounded" placeholder="My ambition is..." value={data.partA3?.ambition || ''} onChange={e => handleDataChange('partA3.ambition', e.target.value)} />
                    <textarea className="w-full p-2 border rounded" placeholder="5 skills I need to achieve my ambition..." value={data.partA3?.skillsNeeded || ''} onChange={e => handleDataChange('partA3.skillsNeeded', e.target.value)} />

                    <h4 className="font-semibold text-sm mt-2">Parent-Teacher Partnership</h4>
                    <textarea className="w-full p-2 border rounded" placeholder="Based on my discussion with the teacher, I will support my child at home by..." value={data.partA4?.supportAtHome || ''} onChange={e => handleDataChange('partA4.supportAtHome', e.target.value)} />
                </div>
            </details>

            <details className="bg-background/50 rounded-lg">
                <summary className="p-2 font-semibold cursor-pointer">Part B: Subject Assessments</summary>
                <div className="p-2 border-t border-border space-y-4">
                    {MIDDLE_STAGE_SUBJECTS.map(subject => (
                        <details key={subject} className="bg-background/70 rounded">
                            <summary className="p-2 font-semibold text-sm cursor-pointer">{subject}</summary>
                            <div className="p-2 border-t border-border space-y-2">
                                <h5 className="font-bold">Activity</h5>
                                <textarea className="w-full p-2 border rounded" placeholder="Activity Description..." value={data.subjectAssessments?.[subject]?.activity || ''} onChange={e => handleDataChange(`subjectAssessments.${subject}.activity`, e.target.value)} />
                                <h5 className="font-bold mt-2">Teacher's Feedback</h5>
                                 <textarea className="w-full p-2 border rounded" placeholder="Teacher's Observations and Recommendations..." value={data.subjectAssessments?.[subject]?.teacherFeedback?.observations || ''} onChange={e => handleDataChange(`subjectAssessments.${subject}.teacherFeedback.observations`, e.target.value)} />
                            </div>
                        </details>
                    ))}
                </div>
            </details>
        </div>
    );
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
            case 'Middle':
                return <MiddleForm 
                            data={hpcData.middleData!} 
                            setData={(newData) => setHpcData(prev => ({ ...prev!, middleData: newData }))} 
                        />;
            // Other stages would be here
            default:
                 return (
                    <div className="p-4 space-y-4">
                        <h3 className="text-lg font-semibold">{stage} Stage Entry</h3>
                        <textarea
                            className="w-full p-2 border border-input rounded-md bg-background min-h-[10rem]"
                            placeholder={`Enter notes for ${stage} stage...`}
                            value={hpcData.summaries?.['Overall']?.observationalNotes || ''}
                            onChange={(e) => {
                                setHpcData(prev => ({
                                    ...prev!,
                                    summaries: {
                                        ...prev!.summaries,
                                        'Overall': { ...prev!.summaries?.['Overall'], observationalNotes: e.target.value }
                                    }
                                }));
                            }}
                        />
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