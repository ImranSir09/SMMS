
import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';
import { Student, HPCReportData } from '../types';
import { HolisticIcon, PlusIcon, SaveIcon } from '../components/icons';
import Modal from '../components/Modal';
import { useToast } from '../contexts/ToastContext';

const ACADEMIC_YEAR = '2024-25';

// Expanded configuration to drive form generation
const STAGE_CONFIG = {
    Foundational: {
        domains: ['Physical Development', 'Socio-emotional Development', 'Cognitive Development', 'Language and Literacy', 'Aesthetic & Cultural', 'Positive Learning Habits'],
        scale: ['Stream', 'Mountain', 'Sky'],
        interests: ['Reading', 'Creative writing', 'Dancing or Singing or Playing a musical instrument', 'Gardening', 'Yoga', 'Art', 'Craft', 'Sport or Games', 'Cooking', 'Regular chores at home with significant others']
    },
    Preparatory: {
        learningStandards: ['Language Education (R1)', 'Language Education (R2)', 'Mathematics', 'The World Around Us', 'Art Education', 'Physical Education'],
        scale: ['Beginner', 'Proficient', 'Advanced'],
    },
    Middle: {
        learningStandards: ['Language 1 (R1)', 'Language 2 (R2)', 'Language 3 (R3)', 'Mathematics', 'Science', 'Social Science', 'Art Education', 'Physical Education', 'Skill Education'],
        scale: ['Beginner', 'Proficient', 'Advanced'],
    }
};

const getStageForClass = (className: string): 'Foundational' | 'Preparatory' | 'Middle' | null => {
    const foundational = ['PP1', 'PP2', 'Balvatika', '1st', '2nd'];
    const preparatory = ['3rd', '4th', '5th'];
    const middle = ['6th', '7th', '8th'];

    if (foundational.includes(className)) return 'Foundational';
    if (preparatory.includes(className)) return 'Preparatory';
    if (middle.includes(className)) return 'Middle';
    return null;
};

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
                foundationalData: stage === 'Foundational' ? { interests: [] } : undefined,
                preparatoryData: stage === 'Preparatory' ? {} : undefined,
                middleData: stage === 'Middle' ? {} : undefined,
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
            const newState = JSON.parse(JSON.stringify(prev)); // Deep copy
            let current: any = newState;
            for (let i = 0; i < keys.length - 1; i++) {
                if (current[keys[i]] === undefined || current[keys[i]] === null) {
                    current[keys[i]] = {};
                }
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
            const newState = JSON.parse(JSON.stringify(prev)); // Deep copy
            let current: any = newState;
             for (let i = 0; i < keys.length - 1; i++) {
                if (current[keys[i]] === undefined || current[keys[i]] === null) current[keys[i]] = {};
                current = current[keys[i]];
            }
            const arrayKey = keys[keys.length - 1];
            let currentArray = current[arrayKey] || [];
            if(checked) {
                currentArray = [...currentArray, value];
            } else {
                currentArray = currentArray.filter((item: string) => item !== value);
            }
            current[arrayKey] = [...new Set(currentArray)]; // Ensure unique values
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

    const renderForm = () => {
        if (!hpcData) return null;
        const TextareaInput: React.FC<{ path: string, placeholder: string, label: string, rows?: number }> = ({path, placeholder, label, rows=3}) => (
            <div>
                <label className="font-semibold text-xs mb-1 block">{label}</label>
                <textarea 
                    placeholder={placeholder} 
                    className="w-full p-2 text-sm bg-background border border-input rounded"
                    style={{ height: `${rows * 1.5}rem`}}
                    value={path.split('.').reduce((o, k) => o?.[k], hpcData) || ''}
                    onChange={e => handleDataChange(path, e.target.value)}
                />
            </div>
        );
        
        switch(hpcData.stage) {
            case 'Foundational':
                 const MONTHS = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
                return (
                    <div className="space-y-2">
                        <CollapsibleSection title="Part A: Health & Interests" defaultOpen={true}>
                            <div className="space-y-2">
                                <TextareaInput path="healthNotes" label="Health Notes" placeholder="Any specific health information..." />
                                <div>
                                    <label className="font-semibold text-xs mb-1 block">Student's Interests</label>
                                    <div className="grid grid-cols-2 gap-1 text-xs">
                                        {STAGE_CONFIG.Foundational.interests.map(interest => (
                                            <label key={interest} className="flex items-center gap-2 p-2 bg-background/50 rounded">
                                                <input type="checkbox"
                                                    checked={hpcData.foundationalData?.interests?.includes(interest) || false}
                                                    onChange={e => handleCheckboxChange('foundationalData.interests', interest, e.target.checked)}
                                                    className="w-4 h-4"
                                                />
                                                {interest}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CollapsibleSection>
                         <CollapsibleSection title="Part A: Attendance" defaultOpen={true}>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                                <div className="font-bold">Month</div><div className="font-bold text-center">Working</div><div className="font-bold text-center">Present</div>
                                {MONTHS.map(month => {
                                    const monthKey = month.toLowerCase();
                                    return (
                                        <React.Fragment key={month}>
                                            <div className="font-semibold flex items-center">{month}</div>
                                            <div><input type="number" placeholder="WD" className="w-full p-2 text-sm text-center bg-background border border-input rounded" value={hpcData.attendance?.[monthKey]?.working ?? ''} onChange={e => handleDataChange(`attendance.${monthKey}.working`, e.target.valueAsNumber)} /></div>
                                            <div><input type="number" placeholder="PD" className="w-full p-2 text-sm text-center bg-background border border-input rounded" value={hpcData.attendance?.[monthKey]?.present ?? ''} onChange={e => handleDataChange(`attendance.${monthKey}.present`, e.target.valueAsNumber)} /></div>
                                        </React.Fragment>
                                    );
                                })}
                            </div>
                        </CollapsibleSection>
                        <CollapsibleSection title="Part B: Domain Assessments (Teacher's Notes)">
                            {STAGE_CONFIG.Foundational.domains.map(domain => (
                                <div key={domain} className="p-1 my-1 border rounded">
                                    <TextareaInput path={`foundationalData.domainAssessments.${domain}.observationalNotes`} label={domain} placeholder="Observational notes..." rows={2} />
                                </div>
                            ))}
                        </CollapsibleSection>
                         <CollapsibleSection title="Part C: Summary Assessment">
                            {STAGE_CONFIG.Foundational.domains.map(domain => (
                                <div key={domain} className="p-1 my-1 border rounded">
                                    <h5 className="font-semibold text-xs mb-1">{domain}</h5>
                                     <div className="grid grid-cols-3 gap-1">
                                         {['awareness', 'sensitivity', 'creativity'].map(ability => (
                                            <select key={ability} value={hpcData.summaries?.[domain]?.[ability as keyof typeof hpcData.summaries[string]] || ''} onChange={e => handleDataChange(`summaries.${domain}.${ability}`, e.target.value)} className="w-full p-2 text-sm bg-background border border-input rounded">
                                                 <option value="">{ability.charAt(0).toUpperCase() + ability.slice(1)}</option>
                                                 {STAGE_CONFIG.Foundational.scale.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                            </select>
                                         ))}
                                     </div>
                                </div>
                            ))}
                        </CollapsibleSection>
                    </div>
                );
            case 'Preparatory':
            case 'Middle':
                const standards = hpcData.stage === 'Preparatory' ? STAGE_CONFIG.Preparatory.learningStandards : STAGE_CONFIG.Middle.learningStandards;
                const scale = hpcData.stage === 'Preparatory' ? STAGE_CONFIG.Preparatory.scale : STAGE_CONFIG.Middle.scale;
                 return (
                     <div className="space-y-2">
                        <CollapsibleSection title="Part B: Teacher's Observational Notes" defaultOpen={true}>
                             {standards.map(standard => (
                                <div key={standard} className="p-1 my-1 border rounded">
                                    <TextareaInput path={`${hpcData.stage!.toLowerCase()}Data.subjectAssessments.${standard}.observationalNotes`} label={standard} placeholder="Observational notes..." rows={2}/>
                                </div>
                            ))}
                        </CollapsibleSection>
                         <CollapsibleSection title="Part C: Summary">
                             {standards.map(standard => (
                                <div key={standard} className="p-1 my-1 border rounded">
                                     <h5 className="font-semibold text-xs mb-1">{standard}</h5>
                                     <div className="grid grid-cols-3 gap-1">
                                         {['awareness', 'sensitivity', 'creativity'].map(ability => (
                                            <select key={ability} value={hpcData.summaries?.[standard]?.[ability as keyof typeof hpcData.summaries[string]] || ''} onChange={e => handleDataChange(`summaries.${standard}.${ability}`, e.target.value)} className="w-full p-2 text-sm bg-background border border-input rounded">
                                                 <option value="">{ability.charAt(0).toUpperCase() + ability.slice(1)}</option>
                                                 {scale.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                            </select>
                                         ))}
                                     </div>
                                </div>
                             ))}
                        </CollapsibleSection>
                     </div>
                 );
            default:
                return <p>This stage is not configured for data entry.</p>;
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex-shrink-0 p-1">
                <select 
                    value={activeClass || ''} 
                    onChange={e => setActiveClass(e.target.value)}
                    className="p-3 text-sm bg-background border border-input rounded-md w-full"
                >
                    <option value="" disabled>-- Select a Class --</option>
                    {classTabs?.map(c => <option key={c} value={c}>Class {c}</option>)}
                </select>
            </div>

            {studentsInClass && studentsInClass.length > 0 ? (
                <div className="flex-1 overflow-auto grid grid-cols-2 gap-2 p-1">
                    {studentsInClass.map(student => (
                        <div key={student.id} onClick={() => handleStudentClick(student)} className="bg-card p-2 rounded-lg flex items-center gap-2 cursor-pointer hover-lift">
                            <div className="font-bold text-sm text-primary w-8 h-8 flex items-center justify-center bg-primary/10 rounded-full">{student.rollNo}</div>
                            <div className="truncate text-sm font-medium">{student.name}</div>
                        </div>
                    ))}
                </div>
            ) : (
                 <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                    <HolisticIcon className="w-12 h-12 text-foreground/20" />
                    <h3 className="text-md font-semibold mt-2">No Students Found</h3>
                    <p className="mt-1 text-xs text-foreground/60">
                        {activeClass ? `Add students to Class ${activeClass} to begin.` : 'Please select a class.'}
                    </p>
                </div>
            )}
            
            <Modal isOpen={!!selectedStudent} onClose={handleCloseModal} title={`HPC Data for ${selectedStudent?.name}`}>
                <div className="p-2 flex-1 overflow-y-auto">
                    {renderForm()}
                </div>
                <footer className="p-2 border-t border-border flex justify-end">
                    <button onClick={handleSave} className="py-3 px-5 rounded-md bg-primary text-primary-foreground flex items-center gap-2 text-sm font-semibold">
                        <SaveIcon className="w-4 h-4"/> Save Data
                    </button>
                </footer>
            </Modal>
        </div>
    );
};

export default Holistic;