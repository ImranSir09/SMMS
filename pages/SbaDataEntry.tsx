import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';
import { Student, SbaReportData, SbaProficiencyLevel, SbaTalentLevel } from '../types';
import { useToast } from '../contexts/ToastContext';
import { ACADEMIC_YEAR } from '../constants';
import SectionCard from '../components/SectionCard';

const DEBOUNCE_DELAY = 1500;

const PHYSICAL_WELLBEING_OPTIONS = [
  'Normal and Healthy',
  'Not Well groomed',
  'Lethargic or Lazy',
  'Consuming unhealthy food',
  'Listening or Speaking Problem',
  'Heart related issue',
  'Kidney related issue',
  'Persistent Cough',
  'Dry skin, lips and infrequent urination',
  'Excessive Sleep',
  'Observed musculoskeletal issue',
  'Allergic to food or Medicines',
  'Chronic Condition (Asthma, Diabetes, Thyroid)',
  'Slow recovery from injuries or illness',
  'Under weight or Under growth',
  'Dental issue',
  'Vision Problem',
  'Headaches, Stomachaches or other discomforts',
  'Multiple physical disorder',
];

const MENTAL_WELLBEING_OPTIONS = [
  'Normal and Healthy',
  'Irritative or Aggressive',
  'Consistently Sad, Anxious or excessively moody',
  'Remain isolated and avoiding Social relations',
  'Showing lack of interest in school work',
  'Changes in sleep patterns and appetite',
  'Neglecting personal hygiene or self-care routines',
  'Loss of interest in activities',
  'Unable to communicate their thoughts and feelings',
  'Stressed (Nail-biting, Hair-pulling or other nervous habits)',
  'Observed suicidal thoughts or self harming behaviour',
  'Stressful in exams, conflicts or changes in their life',
  'Frequent absence from school',
  'Smoker or Drug abuser',
  'Multiple Mental disorders',
];

const DISEASE_FOUND_OPTIONS = [
  'Normal and Healthy',
  'Infectious disease',
  'Deficiency disease',
  'Genetic disease',
  'Other Fatal disease',
];

const PROFICIENCY_OPTIONS: SbaProficiencyLevel[] = ['High', 'Medium', 'Low'];
const TALENT_OPTIONS: SbaTalentLevel[] = ['Highly Talented', 'Talented', 'No talent'];

const defaultFormData = (studentId: number): Omit<SbaReportData, 'id'> => ({
    studentId,
    academicYear: ACADEMIC_YEAR,
    physicalWellbeing: 'Normal and Healthy',
    mentalWellbeing: 'Normal and Healthy',
    diseaseFound: 'Normal and Healthy',
    creativity: 'Medium',
    criticalThinking: 'Medium',
    communicationSkill: 'Medium',
    problemSolvingAbility: 'Medium',
    collaboration: 'Medium',
    studentsTalent: 'Talented',
    participationInActivities: 'Medium',
    attitudeAndValues: 'Medium',
    presentationSkill: 'Medium',
    writingSkill: 'Medium',
    comprehensionSkill: 'Medium',
});

const SbaDataEntry: React.FC = () => {
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
    const [formData, setFormData] = useState<Partial<SbaReportData> | null>(null);
    const [saveStatus, setSaveStatus] = useState<'synced' | 'pending' | 'saving' | 'error'>('synced');
    const { addToast } = useToast();
    const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const classOptions = useLiveQuery(
        () => db.students.orderBy('className').uniqueKeys()
            .then(keys => (keys as string[]).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))),
        []
    );
    
    const studentsInClass = useLiveQuery(() => 
        selectedClass ? db.students.where({ className: selectedClass }).sortBy('rollNo') : Promise.resolve([]),
    [selectedClass]);
    
     useEffect(() => {
        if (classOptions && classOptions.length > 0 && !selectedClass) {
            setSelectedClass(classOptions[0]);
        }
    }, [classOptions, selectedClass]);
    
    useEffect(() => {
        setSelectedStudentId(null);
        setFormData(null);
    }, [selectedClass]);

    useEffect(() => {
        const loadData = async () => {
            if (!selectedStudentId) {
                setFormData(null);
                return;
            }
            const existingData = await db.sbaReports.where({ studentId: selectedStudentId, academicYear: ACADEMIC_YEAR }).first();
            setFormData(existingData || defaultFormData(selectedStudentId));
            setSaveStatus('synced');
        };
        loadData();
    }, [selectedStudentId]);

    const saveData = useCallback(async (dataToSave: Partial<SbaReportData>) => {
        if (!dataToSave || !dataToSave.studentId) return;
        setSaveStatus('saving');
        try {
            await db.sbaReports.put(dataToSave as SbaReportData);
            setSaveStatus('synced');
            addToast('Changes saved automatically', 'success');
        } catch (error) {
            console.error("Failed to save data:", error);
            setSaveStatus('error');
            addToast('Failed to save changes', 'error');
        }
    }, [addToast]);

    const handleDataChange = (field: keyof SbaReportData, value: any) => {
        setFormData(prev => {
            if (!prev) return null;
            const newData = { ...prev, [field]: value };
            
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
            saveTimeoutRef.current = setTimeout(() => saveData(newData), DEBOUNCE_DELAY);
            setSaveStatus('pending');

            return newData;
        });
    };

    const renderSelect = (label: string, field: keyof SbaReportData, options: string[]) => (
        <div>
            <label className="block text-xs font-semibold text-foreground/80 mb-1">{label}</label>
            <select
                value={formData?.[field] as string || ''}
                onChange={e => handleDataChange(field, e.target.value)}
                className="p-2 w-full bg-background border border-input rounded-md text-sm"
            >
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
        </div>
    );

    return (
        <div className="animate-fade-in-up p-2">
            <div className="bg-card p-3 rounded-lg shadow-sm">
                <div className="grid grid-cols-2 gap-2">
                    <select
                        value={selectedClass}
                        onChange={e => setSelectedClass(e.target.value)}
                        className="p-3 bg-background border border-input rounded-md w-full text-sm"
                    >
                        <option value="">-- Select Class --</option>
                        {classOptions?.map(c => <option key={c} value={c}>Class {c}</option>)}
                    </select>
                </div>
                 <div className="text-xs font-semibold mt-2 text-right h-4">
                    {formData && saveStatus === 'synced' && <span className="text-green-500">Synced</span>}
                    {formData && saveStatus === 'pending' && <span className="text-yellow-500">Pending changes...</span>}
                    {formData && saveStatus === 'saving' && <span className="text-blue-500">Saving...</span>}
                    {formData && saveStatus === 'error' && <span className="text-red-500">Error saving!</span>}
                </div>
                {selectedClass && (
                    <div className="mt-2 max-h-48 overflow-y-auto space-y-1">
                        {studentsInClass?.map(student => (
                             <button
                                key={student.id}
                                onClick={() => setSelectedStudentId(student.id!)}
                                className={`w-full text-left p-2 rounded-lg flex items-center gap-2 cursor-pointer transition-colors ${
                                    selectedStudentId === student.id ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-primary/10'
                                }`}
                            >
                                <p className="font-bold text-sm truncate">{student.name} (R: {student.rollNo})</p>
                             </button>
                        ))}
                    </div>
                )}
            </div>
            
            {!selectedStudentId || !formData ? (
                 <div className="text-center p-8 text-foreground/60">
                    <p>Please select a student to begin.</p>
                </div>
            ) : (
                <div>
                    <SectionCard title="Health & Wellbeing" colorClasses="bg-green-700 border-green-500 text-white">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {renderSelect('Physical Wellbeing', 'physicalWellbeing', PHYSICAL_WELLBEING_OPTIONS)}
                            {renderSelect('Mental Wellbeing', 'mentalWellbeing', MENTAL_WELLBEING_OPTIONS)}
                            {renderSelect('Disease Found', 'diseaseFound', DISEASE_FOUND_OPTIONS)}
                        </div>
                    </SectionCard>
                    <SectionCard title="Life Skills" colorClasses="bg-blue-700 border-blue-500 text-white">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {renderSelect('Creativity', 'creativity', PROFICIENCY_OPTIONS)}
                            {renderSelect('Critical Thinking', 'criticalThinking', PROFICIENCY_OPTIONS)}
                            {renderSelect('Communication Skill', 'communicationSkill', PROFICIENCY_OPTIONS)}
                            {renderSelect('Problem Solving', 'problemSolvingAbility', PROFICIENCY_OPTIONS)}
                            {renderSelect('Collaboration', 'collaboration', PROFICIENCY_OPTIONS)}
                        </div>
                    </SectionCard>
                    <SectionCard title="Talents, Attitudes & Other Skills" colorClasses="bg-purple-700 border-purple-500 text-white">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {renderSelect("Student's Talent", 'studentsTalent', TALENT_OPTIONS)}
                            {renderSelect('Participation', 'participationInActivities', PROFICIENCY_OPTIONS)}
                            {renderSelect('Attitude & Values', 'attitudeAndValues', PROFICIENCY_OPTIONS)}
                            {renderSelect('Presentation Skill', 'presentationSkill', PROFICIENCY_OPTIONS)}
                            {renderSelect('Writing Skill', 'writingSkill', PROFICIENCY_OPTIONS)}
                            {renderSelect('Comprehension', 'comprehensionSkill', PROFICIENCY_OPTIONS)}
                        </div>
                    </SectionCard>
                </div>
            )}
        </div>
    );
};

export default SbaDataEntry;