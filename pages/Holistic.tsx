import React, { useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';
import { Student, HPCReportData, HpcPerformanceLevel, HpcSentiment, FoundationalData, PreparatoryData, MiddleData, HpcDomainSummary } from '../types';
import { useToast } from '../contexts/ToastContext';
import Card from '../components/Card';
import { SaveIcon, UsersIcon, ArrowRightIcon } from '../components/icons';
import { useNavigate } from 'react-router-dom';

const ACADEMIC_YEAR = '2024-25';

// --- UTILS & CONSTANTS ---

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
    preparatoryData: { partA2: { thingsToLearn: [] }, partA3: {}, parentFeedback: {}, selfAssessment: {}, peerAssessment: {} },
    middleData: { 
        partA1: {}, 
        partA2: { academicGoalSteps: [], personalGoalSteps: [], thingsLearntAtSchool: [], thingsLearntOutsideSchool: [] }, 
        partA3: {}, 
        partA4: { resourcesAvailable: {}, understandingOfChild: {}, needsSupportWith: {} },
        selfAssessment: {}, peerAssessment: {}, teacherAssessment: {}
    },
    subjectAssessments: {},
});

const inputStyle = "p-2 w-full bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary text-sm transition-colors";
const labelStyle = "block text-xs font-medium text-foreground/80 mb-1";

// --- REUSABLE FORM COMPONENTS ---

const CollapsibleSection: React.FC<{ title: string; children: ReactNode, initiallyOpen?: boolean }> = ({ title, children, initiallyOpen = false }) => {
    const [isOpen, setIsOpen] = useState(initiallyOpen);
    return (
        <div className="border border-border rounded-lg">
            <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-2 bg-background/50 hover:bg-black/5 dark:hover:bg-white/5">
                <h3 className="font-semibold text-sm">{title}</h3>
                <ArrowRightIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
            </button>
            {isOpen && <div className="p-3 border-t border-border">{children}</div>}
        </div>
    );
};

const TextInput: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ label, value, onChange }) => (
    <div><label className={labelStyle}>{label}</label><input type="text" value={value || ''} onChange={onChange} className={inputStyle} /></div>
);
const TextAreaInput: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; rows?: number }> = ({ label, value, onChange, rows = 2 }) => (
    <div><label className={labelStyle}>{label}</label><textarea value={value || ''} onChange={onChange} className={inputStyle} rows={rows} /></div>
);
const PerformanceLevelSelector: React.FC<{ label: string; value: HpcPerformanceLevel; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void }> = ({ label, value, onChange }) => (
    <div>
        <label className={labelStyle}>{label}</label>
        <select value={value || ''} onChange={onChange} className={inputStyle}>
            <option value="">-- Select --</option>
            <option value="Stream">Stream</option><option value="Mountain">Mountain</option><option value="Sky">Sky</option>
        </select>
    </div>
);

// --- STAGE-SPECIFIC FORMS ---

const FoundationalForm: React.FC<{ data: HPCReportData, setData: React.Dispatch<React.SetStateAction<HPCReportData | null>> }> = ({ data, setData }) => {
    const handleSummaryChange = (domain: string, field: keyof HpcDomainSummary, value: string) => {
        setData(p => p && ({ ...p, summaries: { ...p.summaries, [domain]: { ...p.summaries[domain], [field]: value } } }));
    };
    const handleDataChange = (field: keyof FoundationalData, value: any) => {
        setData(p => p && ({ ...p, foundationalData: { ...p.foundationalData, [field]: value } }));
    };

    const domains = ['Physical Development', 'Socio-emotional Development', 'Cognitive Development', 'Language and Literacy', 'Aesthetic & Cultural', 'Positive Learning Habits'];

    return (
        <div className="p-3 space-y-3">
            <CollapsibleSection title="General & Health" initiallyOpen>
                <div className="space-y-3">
                    <TextAreaInput label="Health Notes" value={data.healthNotes || ''} onChange={e => setData(p => p && ({ ...p, healthNotes: e.target.value }))} />
                    <TextAreaInput label="Student's Interests (comma separated)" value={data.foundationalData?.interests?.join(', ') || ''} onChange={e => handleDataChange('interests', e.target.value.split(',').map(s => s.trim()))} />
                </div>
            </CollapsibleSection>
            <CollapsibleSection title="Domain Summaries">
                <div className="space-y-4">
                    {domains.map(domain => (
                        <div key={domain} className="p-2 border border-border rounded-md">
                            <h4 className="font-semibold text-sm mb-2">{domain}</h4>
                            <div className="grid grid-cols-1 gap-2">
                                <PerformanceLevelSelector label="Awareness" value={data.summaries[domain]?.awareness || ''} onChange={e => handleSummaryChange(domain, 'awareness', e.target.value)} />
                                <PerformanceLevelSelector label="Sensitivity" value={data.summaries[domain]?.sensitivity || ''} onChange={e => handleSummaryChange(domain, 'sensitivity', e.target.value)} />
                                <PerformanceLevelSelector label="Creativity" value={data.summaries[domain]?.creativity || ''} onChange={e => handleSummaryChange(domain, 'creativity', e.target.value)} />
                                <TextAreaInput label="Key Performance Descriptors (Teacher's Notes)" value={data.summaries[domain]?.observationalNotes || ''} onChange={e => handleSummaryChange(domain, 'observationalNotes', e.target.value)} rows={3} />
                            </div>
                        </div>
                    ))}
                </div>
            </CollapsibleSection>
        </div>
    );
};

const PreparatoryForm: React.FC<{ data: HPCReportData, setData: React.Dispatch<React.SetStateAction<HPCReportData | null>> }> = ({ data, setData }) => {
     const handleSummaryChange = (domain: string, field: 'teacherRemarks' | 'parentRemarks', value: string) => {
        setData(p => p && ({ ...p, summaries: { ...p.summaries, [domain]: { ...p.summaries[domain], [field]: value } } }));
    };
    const handleAssessmentChange = (type: 'selfAssessment' | 'peerAssessment', aspect: string, value: string) => {
        setData(p => p && ({ ...p, preparatoryData: { ...p.preparatoryData, [type]: { ...p.preparatoryData?.[type], [aspect]: value } } }));
    };

    const domains = ['Cognitive Development', 'Affective Development', 'Psychomotor Development'];
    const selfAspects = ['My Strengths', 'My Dreams', 'How I Can Improve'];
    const peerAspects = ['What I Like About My Friend', 'What I Want To Tell My Friend'];

    return (
        <div className="p-3 space-y-3">
            <CollapsibleSection title="Domain Summaries" initiallyOpen>
                <div className="space-y-4">
                    {domains.map(domain => (
                        <div key={domain} className="p-2 border border-border rounded-md">
                            <h4 className="font-semibold text-sm mb-2">{domain}</h4>
                            <div className="space-y-2">
                                <TextAreaInput label="Teacher's Remarks" value={data.summaries[domain]?.teacherRemarks || ''} onChange={e => handleSummaryChange(domain, 'teacherRemarks', e.target.value)} />
                                <TextAreaInput label="Parent's Remarks" value={data.summaries[domain]?.parentRemarks || ''} onChange={e => handleSummaryChange(domain, 'parentRemarks', e.target.value)} />
                            </div>
                        </div>
                    ))}
                </div>
            </CollapsibleSection>
            <CollapsibleSection title="Self & Peer Assessment">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                        <h4 className="font-semibold text-sm text-center">Self Assessment</h4>
                        {selfAspects.map(aspect => (
                            <TextAreaInput key={aspect} label={aspect} value={data.preparatoryData?.selfAssessment?.[aspect] || ''} onChange={e => handleAssessmentChange('selfAssessment', aspect, e.target.value)} />
                        ))}
                    </div>
                     <div className="space-y-2">
                        <h4 className="font-semibold text-sm text-center">Peer Assessment</h4>
                        {peerAspects.map(aspect => (
                            <TextAreaInput key={aspect} label={aspect} value={data.preparatoryData?.peerAssessment?.[aspect] || ''} onChange={e => handleAssessmentChange('peerAssessment', aspect, e.target.value)} />
                        ))}
                    </div>
                </div>
            </CollapsibleSection>
        </div>
    );
};

const MiddleForm: React.FC<{ data: HPCReportData, setData: React.Dispatch<React.SetStateAction<HPCReportData | null>> }> = ({ data, setData }) => {
    // FIX: Changed handleSummaryChange to update the 'teacherRemarks' field, which is a string, instead of 'awareness', which has a specific enum type, to resolve the TypeScript error.
    const handleSummaryChange = (domain: string, value: string) => {
        setData(p => p && ({ ...p, summaries: { ...p.summaries, [domain]: { ...p.summaries[domain], teacherRemarks: value } } }));
    };
    const handleAssessmentChange = (type: 'selfAssessment' | 'peerAssessment' | 'teacherAssessment', aspect: string, value: string) => {
        setData(p => p && ({ ...p, middleData: { ...p.middleData, [type]: { ...p.middleData?.[type], [aspect]: value } } }));
    };

    const domains = ['Humanities', 'Science', 'Mathematics', 'Vocational Education', 'Arts', 'Sports'];
    const selfAspects = ['My Strengths', 'My Barriers', 'My Goals'];
    const peerAspects = ['Strengths of My Friend', 'Suggestions for My Friend'];
    const teacherAspects = ["Teacher's Observations on Student's Personality Traits"];

    return (
        <div className="p-3 space-y-3">
            <CollapsibleSection title="Domain Progress" initiallyOpen>
                <div className="space-y-3">
                    {domains.map(domain => (
                        // FIX: Updated the value of the text area to read from 'teacherRemarks' to match the updated handleSummaryChange function.
                        <TextAreaInput key={domain} label={`${domain} - Teacher's Remarks`} value={data.summaries[domain]?.teacherRemarks || ''} onChange={e => handleSummaryChange(domain, e.target.value)} />
                    ))}
                </div>
            </CollapsibleSection>
            <CollapsibleSection title="Self, Peer & Teacher Assessment">
                <div className="space-y-4">
                    <div>
                        <h4 className="font-semibold text-sm text-center mb-2">Self Assessment</h4>
                        {selfAspects.map(aspect => (
                            <TextAreaInput key={aspect} label={aspect} value={data.middleData?.selfAssessment?.[aspect] || ''} onChange={e => handleAssessmentChange('selfAssessment', aspect, e.target.value)} />
                        ))}
                    </div>
                    <div>
                        <h4 className="font-semibold text-sm text-center mb-2">Peer Assessment</h4>
                        {peerAspects.map(aspect => (
                            <TextAreaInput key={aspect} label={aspect} value={data.middleData?.peerAssessment?.[aspect] || ''} onChange={e => handleAssessmentChange('peerAssessment', aspect, e.target.value)} />
                        ))}
                    </div>
                    <div>
                        <h4 className="font-semibold text-sm text-center mb-2">Teacher Assessment</h4>
                        {teacherAspects.map(aspect => (
                            <TextAreaInput key={aspect} label={aspect} value={data.middleData?.teacherAssessment?.[aspect] || ''} onChange={e => handleAssessmentChange('teacherAssessment', aspect, e.target.value)} />
                        ))}
                    </div>
                </div>
            </CollapsibleSection>
        </div>
    );
};

// --- MAIN COMPONENT ---

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
            case 'Foundational': return <FoundationalForm data={hpcData} setData={setHpcData} />;
            case 'Preparatory': return <PreparatoryForm data={hpcData} setData={setHpcData} />;
            case 'Middle': return <MiddleForm data={hpcData} setData={setHpcData} />;
            default: return null;
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
                    <div className="p-2 border-b border-border flex justify-between items-center">
                        <h3 className="font-bold text-md text-center flex-1">{hpcData.stage} Stage Entry for {selectedStudent?.name}</h3>
                         <button onClick={handleSave} className="py-2 px-4 text-sm font-semibold rounded-md bg-primary text-primary-foreground flex items-center gap-2">
                            <SaveIcon className="w-4 h-4" /> Save
                        </button>
                    </div>
                    {renderFormForStage()}
                    <div className="p-2 border-t border-border flex justify-end items-center gap-2 bg-card">
                         <button onClick={() => navigate(`/print/hpc/${selectedStudentId}`)} className="py-2 px-4 text-sm font-semibold rounded-md bg-purple-600 text-white">
                            Print HPC
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