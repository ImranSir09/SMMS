import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';
import { Student, HPCReportData, FoundationalData, PreparatoryData } from '../types';
import { HolisticIcon, PlusIcon, SaveIcon } from '../components/icons';
import Modal from '../components/Modal';
import { useToast } from '../contexts/ToastContext';

const ACADEMIC_YEAR = '2024-25';

const STAGE_CONFIG = {
    Foundational: {
        domains: ['Physical Development', 'Socio-emotional Development', 'Cognitive Development', 'Language and Literacy', 'Aesthetic & Cultural', 'Positive Learning Habits'],
        scale: ['Stream', 'Mountain', 'Sky'],
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

const CollapsibleSection: React.FC<{ title: string; children: React.ReactNode; }> = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border border-border rounded-md">
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
                foundationalData: stage === 'Foundational' ? {} : undefined,
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
            let current = newState;
            for (let i = 0; i < keys.length - 1; i++) {
                if (current[keys[i]] === undefined) {
                    current[keys[i]] = {};
                }
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;
            return newState;
        });
    };

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

        switch(hpcData.stage) {
            case 'Foundational':
                return (
                    <div className="space-y-2">
                        <CollapsibleSection title="Domain Assessments">
                            {STAGE_CONFIG.Foundational.domains.map(domain => (
                                <div key={domain} className="p-1 my-1 border rounded">
                                    <h5 className="font-semibold text-xs mb-1">{domain}</h5>
                                    <textarea 
                                        placeholder="Teacher's Notes..." 
                                        className="w-full p-1 text-xs bg-background border border-input rounded h-14"
                                        value={hpcData.foundationalData?.domainAssessments?.[domain]?.teacherFeedback || ''}
                                        onChange={e => handleDataChange(`foundationalData.domainAssessments.${domain}.teacherFeedback`, e.target.value)}
                                    />
                                </div>
                            ))}
                        </CollapsibleSection>
                         <CollapsibleSection title="Part C: Summary">
                            {STAGE_CONFIG.Foundational.domains.map(domain => (
                                <div key={domain} className="p-1 my-1 border rounded">
                                    <h5 className="font-semibold text-xs mb-1">{domain}</h5>
                                     <div className="grid grid-cols-3 gap-1">
                                         {['awareness', 'sensitivity', 'creativity'].map(ability => (
                                            <select
                                                key={ability}
                                                value={hpcData.summaries?.[domain]?.[ability as keyof typeof hpcData.summaries[string]] || ''}
                                                onChange={e => handleDataChange(`summaries.${domain}.${ability}`, e.target.value)}
                                                className="w-full p-1 text-xs bg-background border border-input rounded"
                                            >
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
             // Add cases for Preparatory and Middle stages here
            case 'Preparatory':
            case 'Middle':
                const standards = hpcData.stage === 'Preparatory' ? STAGE_CONFIG.Preparatory.learningStandards : STAGE_CONFIG.Middle.learningStandards;
                 const scale = hpcData.stage === 'Preparatory' ? STAGE_CONFIG.Preparatory.scale : STAGE_CONFIG.Middle.scale;
                 return (
                     <div className="space-y-2">
                        <CollapsibleSection title="Part B: Learning Standards">
                             {standards.map(standard => (
                                <div key={standard} className="p-1 my-1 border rounded">
                                     <h5 className="font-semibold text-xs mb-1">{standard}</h5>
                                     <textarea 
                                        placeholder="Observational Notes..." 
                                        className="w-full p-1 text-xs bg-background border border-input rounded h-14"
                                        value={hpcData.preparatoryData?.learningStandardAssessments?.[standard]?.teacherFeedback || ''}
                                        onChange={e => handleDataChange(`preparatoryData.learningStandardAssessments.${standard}.teacherFeedback`, e.target.value)}
                                    />
                                </div>
                            ))}
                        </CollapsibleSection>
                         <CollapsibleSection title="Part C: Summary">
                             {standards.map(standard => (
                                <div key={standard} className="p-1 my-1 border rounded">
                                     <h5 className="font-semibold text-xs mb-1">{standard}</h5>
                                     <div className="grid grid-cols-3 gap-1">
                                         {['awareness', 'sensitivity', 'creativity'].map(ability => (
                                            <select
                                                key={ability}
                                                value={hpcData.summaries?.[standard]?.[ability as keyof typeof hpcData.summaries[string]] || ''}
                                                onChange={e => handleDataChange(`summaries.${standard}.${ability}`, e.target.value)}
                                                className="w-full p-1 text-xs bg-background border border-input rounded"
                                            >
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
                    className="p-2 text-sm bg-background border border-input rounded-md w-full"
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
                <div className="p-2 flex-1">
                    {renderForm()}
                </div>
                <footer className="p-2 border-t border-border flex justify-end">
                    <button onClick={handleSave} className="py-2 px-4 rounded-md bg-primary text-primary-foreground flex items-center gap-2">
                        <SaveIcon className="w-4 h-4"/> Save Data
                    </button>
                </footer>
            </Modal>
        </div>
    );
};

export default Holistic;
