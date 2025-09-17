import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';
import { Student, HPCReportData, HpcSentiment, ParentFeedback } from '../types';
import { HolisticIcon, PlusIcon, SaveIcon } from '../components/icons';
import Modal from '../components/Modal';
import { useToast } from '../contexts/ToastContext';

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

// Reusable Form Components
const CollapsibleSection: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border border-border rounded-md bg-card">
            <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-2 bg-background/50">
                <span className="font-semibold text-sm">{title}</span>
                <PlusIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-45' : ''}`} />
            </button>
            {isOpen && <div className="p-2 border-t border-border">{children}</div>}
        </div>
    );
};

const TextInput: React.FC<{ path: string; label: string; placeholder?: string; data: any; onChange: (path: string, value: any) => void; }> = ({ path, label, placeholder, data, onChange }) => (
    <div>
        <label className="font-semibold text-xs mb-1 block">{label}</label>
        <input 
            type="text"
            placeholder={placeholder} 
            className="w-full p-2 text-sm bg-background border border-input rounded"
            value={path.split('.').reduce((o: any, k) => o?.[k], data) || ''}
            onChange={e => onChange(path, e.target.value)}
        />
    </div>
);

const TextareaInput: React.FC<{ path: string, placeholder: string, label: string, rows?: number; data: any; onChange: (path: string, value: any) => void; }> = ({path, placeholder, label, rows=3, data, onChange}) => (
    <div>
        <label className="font-semibold text-xs mb-1 block">{label}</label>
        <textarea 
            placeholder={placeholder} 
            className="w-full p-2 text-sm bg-background border border-input rounded"
            style={{ minHeight: `${rows * 1.5}rem`}}
            value={path.split('.').reduce((o: any, k) => o?.[k], data) || ''}
            onChange={e => onChange(path, e.target.value)}
        />
    </div>
);

const SentimentRadioGroup: React.FC<{ path: string, question: string, data: any, onChange: (path: string, value: any) => void; }> = ({ path, question, data, onChange }) => (
    <div className="p-2 border rounded-md my-1">
        <p className="text-xs font-medium mb-1">{question}</p>
        <div className="flex items-center justify-around text-xs">
            {(['Yes', 'Sometimes', 'No', 'Not sure'] as HpcSentiment[]).map(option => (
                <label key={option} className="flex items-center gap-1">
                    <input type="radio" name={path} value={option} 
                        checked={path.split('.').reduce((o: any, k) => o?.[k], data) === option}
                        onChange={() => onChange(path, option)}
                    />
                    {option}
                </label>
            ))}
        </div>
    </div>
);

// Full HPC Form Component
const HpcForm: React.FC<{ hpcData: Partial<HPCReportData>; onDataChange: (path: string, value: any) => void; onCheckboxChange: (path: string, value: string, checked: boolean) => void; }> = ({ hpcData, onDataChange, onCheckboxChange }) => {
    if (!hpcData || !hpcData.stage) return null;

    const renderParentPartnershipForm = (stage: 'preparatory' | 'middle') => {
        const parentData = (hpcData as any)[`${stage}Data`]?.parentFeedback || {};
        const path = `${stage}Data.parentFeedback`;
        
        const resourceOptions = ["Books and Magazines", "Newspapers", "Toys, Games and sports", "Phone and Computer", "Internet", "Public Broadcast System", "Resources for CWSN"];
        const middleSupportOptions = ["Languages (R1, R2, R3)", "Building self-belief & self-reliance", "Managing difficult emotions like anger", "Skill Guidance/Digital Literacy", "Mathematics", "Science", "Social Science", "Developing social skills & conflict resolution", "Developing effective study skills like time management"];
        const prepSupportOptions = ["Oral communication (R1 or R2)", "Reading", "Numbers and Math", "Self-confidence", "Working with other children", "Working independently at home"];

        const middleUnderstandingQuestions: { key: keyof NonNullable<ParentFeedback['childUnderstanding']>, label: string }[] = [
            { key: 'motivated', label: "1. My child seems motivated to learn and engage with new concepts learnt at school." },
            { key: 'followsSchedule', label: "2. My child follows a schedule at home that includes curriculum and other activities, social connectivity, and screen time." },
            { key: 'findsDifficult', label: "3. My child finds the grade-level curriculum difficult and needs additional support." },
            { key: 'makingProgress', label: "4. My child is making good progress as per his/her grade." },
        ];
        
         const prepUnderstandingQuestions: { key: keyof NonNullable<ParentFeedback['childUnderstanding']>, label: string }[] = [
            { key: 'findsWelcoming', label: "1. My child finds the classroom and school a welcoming and safe space." },
            { key: 'participates', label: "2. My child participates in academic and other activities in school." },
            { key: 'findsDifficult', label: "3. My child finds the grade-level curriculum difficult." },
            { key: 'makingProgress', label: "4. My child is making good progress as per their grade." },
            { key: 'gettingSupport', label: "5. My child is getting the support needed from school." },
        ];
        
        return (
             <CollapsibleSection title="Part A(4): Parent-Teacher Partnership Card">
                <div className="space-y-3 text-xs">
                    <div>
                        <p className="font-semibold mb-1">Resources available to your child at home:</p>
                        <div className="grid grid-cols-2 gap-1">
                            {resourceOptions.map(res => (
                                <label key={res} className="flex items-center gap-2 p-1 bg-background/50 rounded">
                                    <input type="checkbox" checked={parentData.resourcesAvailable?.includes(res) || false} onChange={e => onCheckboxChange(`${path}.resourcesAvailable`, res, e.target.checked)} /> {res}
                                </label>
                            ))}
                        </div>
                         <TextInput path={`${path}.otherResource`} label="Any other resource:" data={hpcData} onChange={onDataChange} />
                    </div>
                    <div>
                        <p className="font-semibold mb-1">Understanding of my Child:</p>
                        {(stage === 'middle' ? middleUnderstandingQuestions : prepUnderstandingQuestions).map(q => <SentimentRadioGroup key={q.key} path={`${path}.childUnderstanding.${q.key}`} question={q.label} data={hpcData} onChange={onDataChange} />)}
                    </div>
                    <div>
                        <p className="font-semibold mb-1">At school, my child needs support with:</p>
                        <div className="grid grid-cols-2 gap-1">
                            {(stage === 'middle' ? middleSupportOptions : prepSupportOptions).map(opt => (
                                <label key={opt} className="flex items-center gap-2 p-1 bg-background/50 rounded">
                                    <input type="checkbox" checked={parentData.supportNeeded?.includes(opt) || false} onChange={e => onCheckboxChange(`${path}.supportNeeded`, opt, e.target.checked)} /> {opt}
                                </label>
                            ))}
                        </div>
                        <TextInput path={`${path}.otherSupport`} label="Any other support needed:" data={hpcData} onChange={onDataChange} />
                    </div>
                    <TextareaInput path={`${path}.supportAtHome`} placeholder='...' label="Based on my discussion with the teacher, I will support my child at home by:" data={hpcData} onChange={onDataChange} />
                </div>
             </CollapsibleSection>
        )
    };

    switch(hpcData.stage) {
        case 'Preparatory':
            const prepQuestionsA3 = [
                { key: 'canTalkAboutFeelings', label: '1. I can talk about how I feel, e.g., happy, confident, upset, or angry.' },
                { key: 'canCalmDown', label: '2. I can calm myself down during difficult situations.' },
                { key: 'understandsFriends', label: '3. I can understand how my friends feel.' },
                { key: 'respectsOpinions', label: "4. I respect everyone's opinions." },
                { key: 'canHelpFriends', label: "5. I can help my friends make up after a fight." },
                { key: 'canMakeFeelBetter', label: "6. When someone is sad, I can make them feel better." },
                { key: 'doesWell', label: "7. I think I do well at school." }
            ];
             return (
                <div className="space-y-2">
                    <CollapsibleSection title="Part A(2): All About Me">
                        <TextareaInput path="preparatoryData.partA2.whenIGrowUp" label="When I grow up I want to be..." placeholder="..." data={hpcData} onChange={onDataChange} />
                        <TextareaInput path="preparatoryData.partA2.myIdol" label="One person who inspires me is..." placeholder="..." data={hpcData} onChange={onDataChange} />
                        <TextareaInput path="preparatoryData.partA2.threeThingsToLearn" label="Three things I want to learn this school year:" placeholder="..." data={hpcData} onChange={onDataChange} />
                    </CollapsibleSection>
                    <CollapsibleSection title="Part A(3): How do I feel at school?">
                        {prepQuestionsA3.map(q => <SentimentRadioGroup key={q.key} path={`preparatoryData.partA3.${q.key}`} question={q.label} data={hpcData} onChange={onDataChange} />)}
                    </CollapsibleSection>
                    {renderParentPartnershipForm('preparatory')}
                </div>
            );
        case 'Middle':
             return (
                <div className="space-y-2">
                     <CollapsibleSection title="Part A(2): All About Me!">
                         <div className="space-y-2">
                             <TextInput path="middleData.partA2.iLiveWith" label="I live with my..." data={hpcData} onChange={onDataChange} />
                             <TextInput path="middleData.partA2.weStayAt" label="We stay at..." data={hpcData} onChange={onDataChange} />
                             <TextareaInput path="middleData.partA2.freeTimeDoing" label="I spend my free time doing..." placeholder="..." data={hpcData} onChange={onDataChange} rows={2} />
                             <TextareaInput path="middleData.partA2.iAmResponsible" label="I am responsible..." placeholder="..." data={hpcData} onChange={onDataChange} rows={2} />
                             <TextareaInput path="middleData.partA2.couldDoBetter" label="I could do better specially when it comes to..." placeholder="..." data={hpcData} onChange={onDataChange} rows={2} />
                             <TextareaInput path="middleData.partA2.iCareAboutOthers" label="I care about others. I show it by..." placeholder="..." data={hpcData} onChange={onDataChange} rows={2} />
                             <TextareaInput path="middleData.partA2.feelProud" label="I feel proud of myself when..." placeholder="..." data={hpcData} onChange={onDataChange} rows={2} />
                         </div>
                     </CollapsibleSection>
                      <CollapsibleSection title="Part A(3): My Ambition Card">
                        <div className="space-y-2">
                            <TextInput path="middleData.partA3.myAmbitionIs" label="My ambition is..." data={hpcData} onChange={onDataChange} />
                            <TextareaInput path="middleData.partA3.fiveSkills" label="5 skills I need to achieve my ambition:" placeholder="..." data={hpcData} onChange={onDataChange} rows={3} />
                            <TextareaInput path="middleData.partA3.habitsToBe" label="To achieve my ambition, I need my habits to be:" placeholder="..." data={hpcData} onChange={onDataChange} rows={3} />
                            <TextareaInput path="middleData.partA3.achieveAmbitionBy" label="I will achieve my ambition by:" placeholder="..." data={hpcData} onChange={onDataChange} rows={3} />
                            <TextareaInput path="middleData.partA3.subjectsToFocusOn" label="Subjects I need to focus on:" placeholder="..." data={hpcData} onChange={onDataChange} rows={3} />
                        </div>
                     </CollapsibleSection>
                     {renderParentPartnershipForm('middle')}
                </div>
             )
        default:
            // The Foundational form is simple enough to not need its own component
            const interests = ['Reading', 'Creative writing', 'Dancing or Singing or Playing a musical instrument', 'Gardening', 'Yoga', 'Art', 'Craft', 'Sport or Games', 'Cooking', 'Regular chores at home with significant others'];
            const domains = ['Physical Development', 'Socio-emotional Development', 'Cognitive Development', 'Language and Literacy', 'Aesthetic & Cultural', 'Positive Learning Habits'];
            return (
                <div className="space-y-2">
                    <TextareaInput path="healthNotes" label="Health Notes" placeholder="Any specific health information..." data={hpcData} onChange={onDataChange} />
                    <CollapsibleSection title="Student's Interests" defaultOpen={true}>
                         <div className="grid grid-cols-2 gap-1 text-xs">
                            {interests.map(interest => (
                                <label key={interest} className="flex items-center gap-2 p-2 bg-background/50 rounded">
                                    <input type="checkbox"
                                        checked={hpcData.foundationalData?.interests?.includes(interest) || false}
                                        onChange={e => onCheckboxChange('foundationalData.interests', interest, e.target.checked)}
                                    />
                                    {interest}
                                </label>
                            ))}
                        </div>
                        <TextInput path="foundationalData.otherInterest" label="Other interests:" data={hpcData} onChange={onDataChange} />
                    </CollapsibleSection>
                    <CollapsibleSection title="Teacher's Observational Notes">
                        {domains.map(domain => (
                            <TextareaInput key={domain} path={`foundationalData.domainAssessments.${domain}.observationalNotes`} label={domain} placeholder="Observational notes..." rows={2} data={hpcData} onChange={onDataChange} />
                        ))}
                    </CollapsibleSection>
                </div>
            );
    }
};

const Holistic: React.FC = () => {
    const [activeClass, setActiveClass] = useState<string | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [hpcData, setHpcData] = useState<Partial<HPCReportData> | null>(null);
    const { addToast } = useToast();

    const classTabs = useLiveQuery(
        () => db.students.orderBy('className').uniqueKeys()
            .then(keys => (keys as string[]).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))),
        []
    );

    useEffect(() => {
        if (classTabs && classTabs.length > 0 && !activeClass) {
            setActiveClass(classTabs[0]);
        }
    }, [classTabs, activeClass]);

    const studentsInClass = useLiveQuery(() => 
        activeClass ? db.students.where('className').equals(activeClass).sortBy('rollNo') : Promise.resolve([]),
    [activeClass]);

    const handleStudentClick = async (student: Student) => {
        const stage = getStageForClass(student.className);
        if (!stage) {
            addToast(`Holistic assessment not configured for Class ${student.className}.`, 'error');
            return;
        }

        let data = await db.hpcReports.where({ studentId: student.id!, academicYear: ACADEMIC_YEAR }).first();
        if (!data) {
            data = {
                studentId: student.id!,
                academicYear: ACADEMIC_YEAR,
                stage,
                grade: student.className,
                summaries: {},
                attendance: {},
                foundationalData: stage === 'Foundational' ? { interests: [] } : {},
                preparatoryData: stage === 'Preparatory' ? {} : {},
                middleData: stage === 'Middle' ? {} : {},
            };
        }
        setHpcData(data);
        setSelectedStudent(student);
    };

    const handleCloseModal = () => {
        setSelectedStudent(null);
        setHpcData(null);
    };

    const handleDataChange = (path: string, value: any) => {
        setHpcData(prev => {
            if (!prev) return null;
            const keys = path.split('.');
            const newState = JSON.parse(JSON.stringify(prev));
            let current: any = newState;
            for (let i = 0; i < keys.length - 1; i++) {
                if (current[keys[i]] === undefined || current[keys[i]] === null) current[keys[i]] = {};
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;
            return newState;
        });
    };
    
    const handleCheckboxChange = (path: string, value: string, checked: boolean) => {
        setHpcData(prev => {
            if (!prev) return null;
            const keys = path.split('.');
            const newState = JSON.parse(JSON.stringify(prev));
            let current: any = newState;
             for (let i = 0; i < keys.length - 1; i++) {
                if (current[keys[i]] === undefined || current[keys[i]] === null) current[keys[i]] = {};
                current = current[keys[i]];
            }
            const arrayKey = keys[keys.length - 1];
            let currentArray = current[arrayKey] || [];
            if(checked) currentArray = [...currentArray, value];
            else currentArray = currentArray.filter((item: string) => item !== value);
            current[arrayKey] = [...new Set(currentArray)];
            return newState;
        });
    }

    const handleSave = async () => {
        if (!hpcData) return;
        try {
            await db.hpcReports.put(hpcData as HPCReportData);
            addToast('Holistic data saved successfully!', 'success');
            handleCloseModal();
        } catch (error) {
            console.error("Failed to save HPC data:", error);
            addToast('Failed to save data.', 'error');
        }
    };

    return (
        <div className="flex flex-col">
            <h2 className="text-md font-semibold mb-2">Holistic Progress Card Entry ({ACADEMIC_YEAR})</h2>
             <select 
                value={activeClass || ''} 
                onChange={e => setActiveClass(e.target.value)}
                className="p-3 text-sm bg-background border border-input rounded-md w-full focus:outline-none focus:ring-2 focus:ring-primary mb-2"
            >
                <option value="" disabled>-- Select a Class --</option>
                {classTabs?.map(c => <option key={c} value={c}>Class {c}</option>)}
            </select>
            
            <div className="flex-1 space-y-2">
                {studentsInClass?.map(student => (
                    <div key={student.id} onClick={() => handleStudentClick(student)} className="bg-card p-2 rounded-md flex items-center justify-between cursor-pointer hover:bg-primary/10">
                        <div>
                            <p className="font-semibold text-sm">{student.name}</p>
                            <p className="text-xs text-foreground/70">Roll: {student.rollNo}</p>
                        </div>
                        <HolisticIcon className="w-5 h-5 text-primary"/>
                    </div>
                ))}
            </div>

            <Modal
                isOpen={!!selectedStudent}
                onClose={handleCloseModal}
                title={`HPC Entry for ${selectedStudent?.name}`}
            >
                <div className="p-2 space-y-4">
                    {hpcData && <HpcForm hpcData={hpcData} onDataChange={handleDataChange} onCheckboxChange={handleCheckboxChange} />}
                </div>
                 <footer className="flex-shrink-0 flex items-center justify-end p-2 border-t border-border gap-2 bg-card">
                    <button onClick={handleSave} className="py-2 px-4 rounded-md bg-success text-success-foreground hover:bg-success-hover text-sm font-semibold flex items-center gap-1.5">
                        <SaveIcon className="w-4 h-4"/> Save Data
                    </button>
                </footer>
            </Modal>
        </div>
    );
};

export default Holistic;