
import React, { useState, useEffect, useMemo, ReactNode } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';
import { Student, HPCReportData, HpcPerformanceLevel, FoundationalData, PreparatoryData, MiddleData, HpcDomainSummary, HpcSentiment } from '../types';
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

const TextInput: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }> = ({ label, value, onChange }) => (
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
const SentimentSelector: React.FC<{ label: string; value: HpcSentiment; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void }> = ({ label, value, onChange }) => (
    <div className="flex items-center justify-between py-1 border-b border-border">
        <label className={`${labelStyle} mb-0 flex-1`}>{label}</label>
        <select value={value || ''} onChange={onChange} className={`${inputStyle} w-1/2 p-1`}>
            <option value="">--</option>
            <option value="Yes">Yes</option><option value="Sometimes">Sometimes</option><option value="No">No</option><option value="Not sure">Not sure</option>
        </select>
    </div>
);
const CheckboxInput: React.FC<{ label: string; checked: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ label, checked, onChange }) => (
    <div className="flex items-center gap-2"><input type="checkbox" checked={checked || false} onChange={onChange} className="rounded" /><label className="text-sm">{label}</label></div>
);

// --- STAGE-SPECIFIC FORMS ---
const FoundationalForm: React.FC<{ data: HPCReportData, setData: React.Dispatch<React.SetStateAction<HPCReportData | null>> }> = ({ data, setData }) => {
    // ... (rest of the component remains the same)
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
    // ... (rest of the component remains the same)
    const handleSummaryChange = (domain: string, field: 'teacherRemarks' | 'parentRemarks', value: string) => {
        setData(p => p && ({ ...p, summaries: { ...p.summaries, [domain]: { ...p.summaries[domain], [field]: value } } }));
    };
    const handleAssessmentChange = (type: 'selfAssessment' | 'peerAssessment', aspect: string, value: string) => {
        setData(p => p && ({ ...p, preparatoryData: { ...p.preparatoryData, [type]: { ...p.preparatoryData?.[type], [aspect]: value } } }));
    };
    const handlePartA2Change = (field: string, value: string, subField?: string) => {
        setData(p => {
            if (!p) return p;
            const partA2 = p.preparatoryData?.partA2 || {};
            if(subField) {
                // @ts-ignore
                partA2[field] = { ...partA2[field], [subField]: value };
            } else {
                 // @ts-ignore
                partA2[field] = value;
            }
            return { ...p, preparatoryData: { ...p.preparatoryData, partA2 } };
        });
    };
    const handlePartA3Change = (field: keyof NonNullable<PreparatoryData['partA3']>, value: HpcSentiment) => {
        setData(p => p && ({ ...p, preparatoryData: { ...p.preparatoryData, partA3: { ...p.preparatoryData?.partA3, [field]: value } } }));
    };
    const handleParentFeedbackChange = (field: keyof NonNullable<PreparatoryData['parentFeedback']>, value: HpcSentiment | string) => {
        setData(p => p && ({ ...p, preparatoryData: { ...p.preparatoryData, parentFeedback: { ...p.preparatoryData?.parentFeedback, [field]: value } } }));
    };


    const domains = ['Cognitive Development', 'Affective Development', 'Psychomotor Development'];
    const selfAspects = ['My Strengths', 'My Dreams', 'How I Can Improve'];
    const peerAspects = ['What I Like About My Friend', 'What I Want To Tell My Friend'];
    const partA3Questions = {
        participatesInClass: "Participates in class discussions", asksQuestions: "Asks questions", listensAttentively: "Listens attentively", takesInitiative: "Takes initiative",
        worksIndependently: "Works independently", worksInGroups: "Works well in groups", isOrganized: "Is neat and organized", isPunctual: "Is punctual",
        respectsOthers: "Respects others' opinions", isResponsible: "Is responsible and helpful",
    };
    const parentFeedbackQuestions = {
        childIsHappy: "Is your child happy at school?", childSharesLearning: "Does your child share about their learning?", childFeelsSafe: "Does your child feel safe at school?",
        childGetsHelp: "Does your child get help when needed?", parentObservesGrowth: "Have you observed any positive changes?"
    };

    return (
        <div className="p-3 space-y-3">
            <CollapsibleSection title="Domain Summaries" initiallyOpen>
                {/* ... (this section remains the same) ... */}
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
             <CollapsibleSection title="Part A2: All About Me">
                <div className="space-y-3">
                    <TextAreaInput label="My Family" value={data.preparatoryData?.partA2?.myFamily || ''} onChange={e => handlePartA2Change('myFamily', e.target.value)} />
                    <TextInput label="My Favorite Food" value={data.preparatoryData?.partA2?.myFavoriteThings?.food || ''} onChange={e => handlePartA2Change('myFavoriteThings', e.target.value, 'food')} />
                    <TextInput label="My Favorite Games" value={data.preparatoryData?.partA2?.myFavoriteThings?.games || ''} onChange={e => handlePartA2Change('myFavoriteThings', e.target.value, 'games')} />
                    <TextInput label="My Favorite Festivals" value={data.preparatoryData?.partA2?.myFavoriteThings?.festivals || ''} onChange={e => handlePartA2Change('myFavoriteThings', e.target.value, 'festivals')} />
                    <TextAreaInput label="When I grow up, I want to be..." value={data.preparatoryData?.partA2?.whenIGrowUp || ''} onChange={e => handlePartA2Change('whenIGrowUp', e.target.value)} />
                </div>
            </CollapsibleSection>
            <CollapsibleSection title="Part A3: My Habits & Dispositions">
                 <div className="space-y-1">
                    {Object.entries(partA3Questions).map(([key, label]) => (
                        <SentimentSelector key={key} label={label} value={data.preparatoryData?.partA3?.[key as keyof typeof partA3Questions] || ''} onChange={e => handlePartA3Change(key as keyof typeof partA3Questions, e.target.value as HpcSentiment)} />
                    ))}
                </div>
            </CollapsibleSection>
            <CollapsibleSection title="Parent Feedback">
                 <div className="space-y-1">
                    {Object.entries(parentFeedbackQuestions).map(([key, label]) => (
                        <SentimentSelector key={key} label={label} value={data.preparatoryData?.parentFeedback?.[key as keyof typeof parentFeedbackQuestions] as HpcSentiment || ''} onChange={e => handleParentFeedbackChange(key as keyof typeof parentFeedbackQuestions, e.target.value as HpcSentiment)} />
                    ))}
                    <TextAreaInput label="Suggestions for Improvement" value={data.preparatoryData?.parentFeedback?.parentSuggestions || ''} onChange={e => handleParentFeedbackChange('parentSuggestions', e.target.value)} />
                </div>
            </CollapsibleSection>
            <CollapsibleSection title="Self & Peer Assessment">
                 {/* ... (this section remains the same) ... */}
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
    const handleSummaryChange = (domain: string, value: string) => {
        setData(p => p && ({ ...p, summaries: { ...p.summaries, [domain]: { ...p.summaries[domain], teacherRemarks: value } } }));
    };
    const handleAssessmentChange = (type: 'selfAssessment' | 'peerAssessment' | 'teacherAssessment', aspect: string, value: string) => {
        setData(p => p && ({ ...p, middleData: { ...p.middleData, [type]: { ...p.middleData?.[type], [aspect]: value } } }));
    };
    
    // Generic handler for nested data structures
    const handleDataChange = <T extends keyof MiddleData, K extends keyof NonNullable<MiddleData[T]>>(
        part: T, field: K, value: NonNullable<MiddleData[T]>[K]
    ) => {
        setData(p => {
            if (!p) return null;
            const middleData = p.middleData || {};
            const partData = middleData[part] || {};
            // @ts-ignore
            partData[field] = value;
            return { ...p, middleData: { ...middleData, [part]: partData } };
        });
    };

    const domains = ['Humanities', 'Science', 'Mathematics', 'Vocational Education', 'Arts', 'Sports'];
    const selfAspects = ['My Strengths', 'My Barriers', 'My Goals'];
    const peerAspects = ['Strengths of My Friend', 'Suggestions for My Friend'];
    const teacherAspects = ["Teacher's Observations on Student's Personality Traits"];

    const partA4Resources = { books: "Books at home", internet: "Internet", newspaper: "Newspaper/Magazines", tv: "TV", adults: "Adults for discussion" };
    const partA4Support = { studyHabits: "Study habits", emotionalSupport: "Emotional support", healthNutrition: "Health and nutrition", socialSkills: "Social skills", careerGuidance: "Career guidance" };
    const partA4Understanding = { childsStrengths: "Child's strengths", childsInterests: "Child's interests", childsNeeds: "Child's needs", childsLearningStyle: "Child's learning style" };

    return (
        <div className="p-3 space-y-3">
            <CollapsibleSection title="Part A1: Basic Information">
                <div className="grid grid-cols-2 gap-3">
                    <TextInput label="No. of Siblings" value={data.middleData?.partA1?.siblings || ''} onChange={e => handleDataChange('partA1', 'siblings', e.target.value)} />
                    <TextInput label="Ages of Siblings" value={data.middleData?.partA1?.siblingsAge || ''} onChange={e => handleDataChange('partA1', 'siblingsAge', e.target.value)} />
                    <TextInput label="Mother Tongue" value={data.middleData?.partA1?.motherTongue || ''} onChange={e => handleDataChange('partA1', 'motherTongue', e.target.value)} />
                    <TextInput label="Medium of Instruction" value={data.middleData?.partA1?.mediumOfInstruction || ''} onChange={e => handleDataChange('partA1', 'mediumOfInstruction', e.target.value)} />
                    <div className="col-span-2">
                        <label className={labelStyle}>Area</label>
                        <select value={data.middleData?.partA1?.ruralOrUrban || ''} onChange={e => handleDataChange('partA1', 'ruralOrUrban', e.target.value as 'Rural' | 'Urban')} className={inputStyle}>
                            <option value="">-- Select --</option><option value="Rural">Rural</option><option value="Urban">Urban</option>
                        </select>
                    </div>
                </div>
            </CollapsibleSection>
            <CollapsibleSection title="Part A2: Self-Perception & Goals">
                <div className="space-y-3">
                    <TextAreaInput label="Academic Goal for the Year" value={data.middleData?.partA2?.academicGoal || ''} onChange={e => handleDataChange('partA2', 'academicGoal', e.target.value)} />
                    <TextAreaInput label="Personal/Social Goal for the Year" value={data.middleData?.partA2?.personalGoal || ''} onChange={e => handleDataChange('partA2', 'personalGoal', e.target.value)} />
                    <TextAreaInput label="Things I have learnt in school" value={data.middleData?.partA2?.thingsLearntAtSchool?.join('\n') || ''} onChange={e => handleDataChange('partA2', 'thingsLearntAtSchool', e.target.value.split('\n'))} rows={3} />
                    <TextAreaInput label="Things I have learnt outside school" value={data.middleData?.partA2?.thingsLearntOutsideSchool?.join('\n') || ''} onChange={e => handleDataChange('partA2', 'thingsLearntOutsideSchool', e.target.value.split('\n'))} rows={3} />
                </div>
            </CollapsibleSection>
             <CollapsibleSection title="Part A3: My Ambition in Life">
                <div className="space-y-3">
                    <TextInput label="My Ambition" value={data.middleData?.partA3?.myAmbition || ''} onChange={e => handleDataChange('partA3', 'myAmbition', e.target.value)} />
                    <TextAreaInput label="Skills I need for my ambition" value={data.middleData?.partA3?.skillsForAmbition || ''} onChange={e => handleDataChange('partA3', 'skillsForAmbition', e.target.value)} />
                    <TextAreaInput label="Habits I need to develop" value={data.middleData?.partA3?.habitsForAmbition || ''} onChange={e => handleDataChange('partA3', 'habitsForAmbition', e.target.value)} />
                </div>
            </CollapsibleSection>
             <CollapsibleSection title="Part A4: Parent Feedback">
                <div className="space-y-4">
                    <div>
                        <h4 className="font-semibold text-sm mb-2">Resources available for child at home</h4>
                        {Object.entries(partA4Resources).map(([key, label]) => (
                            <CheckboxInput key={key} label={label} checked={!!data.middleData?.partA4?.resourcesAvailable?.[key as keyof typeof partA4Resources]} onChange={e => handleDataChange('partA4', 'resourcesAvailable', { ...data.middleData?.partA4?.resourcesAvailable, [key]: e.target.checked })} />
                        ))}
                    </div>
                    <div>
                        <h4 className="font-semibold text-sm mb-2">Parent's understanding of the child</h4>
                         {Object.entries(partA4Understanding).map(([key, label]) => (
                            <SentimentSelector key={key} label={label} value={data.middleData?.partA4?.understandingOfChild?.[key as keyof typeof partA4Understanding] || ''} onChange={e => handleDataChange('partA4', 'understandingOfChild', { ...data.middleData?.partA4?.understandingOfChild, [key]: e.target.value as HpcSentiment })} />
                         ))}
                    </div>
                    <div>
                        <h4 className="font-semibold text-sm mb-2">Child needs support with</h4>
                         {Object.entries(partA4Support).map(([key, label]) => (
                            <CheckboxInput key={key} label={label} checked={!!data.middleData?.partA4?.needsSupportWith?.[key as keyof typeof partA4Support]} onChange={e => handleDataChange('partA4', 'needsSupportWith', { ...data.middleData?.partA4?.needsSupportWith, [key]: e.target.checked })} />
                        ))}
                    </div>
                    <TextAreaInput label="How parent(s) will support the child" value={data.middleData?.partA4?.howParentWillSupport || ''} onChange={e => handleDataChange('partA4', 'howParentWillSupport', e.target.value)} />
                </div>
            </CollapsibleSection>
            <CollapsibleSection title="Domain Progress">
                 <div className="space-y-3">
                    {domains.map(domain => (
                        <TextAreaInput key={domain} label={`${domain} - Teacher's Remarks`} value={data.summaries[domain]?.teacherRemarks || ''} onChange={e => handleSummaryChange(domain, e.target.value)} />
                    ))}
                </div>
            </CollapsibleSection>
            <CollapsibleSection title="Self, Peer & Teacher Assessment">
                {/* ... (this section remains the same) ... */}
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
    // ... (rest of the component remains the same)
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
