
import React, { FC } from 'react';
import { MiddleData, HpcPreparatoryPerformanceLevel } from '../types';

interface Props {
    data: MiddleData;
    setData: (data: MiddleData) => void;
}

const MIDDLE_STAGE_SUBJECTS = ['Language 1 (R1)', 'Language 2 (R2)', 'Language 3 (R3)', 'Mathematics', 'Science', 'Social Science', 'Art Education', 'Physical Education', 'Skill Education'];
const PERFORMANCE_LEVELS: HpcPreparatoryPerformanceLevel[] = ['Beginner', 'Proficient', 'Advanced'];
const YES_NO_OPTIONS = ['Yes', 'To an extent', 'No', 'Not sure'];

const Section: FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => (
    <details className="bg-background/50 rounded-lg open:shadow-md" open={defaultOpen}>
        <summary className="p-3 font-semibold cursor-pointer select-none">{title}</summary>
        <div className="p-3 border-t border-border space-y-3">{children}</div>
    </details>
);

const TextInput: FC<{ label: string; value: string; onChange: (val: string) => void }> = ({ label, value, onChange }) => (
    <div>
        <label className="block text-xs font-medium text-foreground/80 mb-1">{label}</label>
        <input type="text" className="w-full p-2 border border-input rounded bg-background text-sm" value={value || ''} onChange={e => onChange(e.target.value)} />
    </div>
);

const TextArea: FC<{ label: string; value: string; onChange: (val: string) => void, rows?: number }> = ({ label, value, onChange, rows=2 }) => (
    <div>
        <label className="block text-xs font-medium text-foreground/80 mb-1">{label}</label>
        <textarea className="w-full p-2 border border-input rounded bg-background text-sm" rows={rows} value={value || ''} onChange={e => onChange(e.target.value)} />
    </div>
);

const RadioGroup: FC<{ legend: string; value: string; options: string[]; onChange: (val: string) => void }> = ({ legend, value, options, onChange }) => (
    <div>
        <p className="block text-xs font-medium text-foreground/80 mb-1">{legend}</p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 p-2 bg-background/50 rounded-md">
            {options.map(opt => (
                <label key={opt} className="flex items-center gap-1 cursor-pointer">
                    <input type="radio" value={opt} checked={value === opt} onChange={() => onChange(opt)} />
                    {opt}
                </label>
            ))}
        </div>
    </div>
);

export const HPCMiddleForm: FC<Props> = ({ data, setData }) => {

    const handleDataChange = (path: string, value: any) => {
        const newData = JSON.parse(JSON.stringify(data)); // Deep copy
        const keys = path.split('.');
        let current = newData;
        for (let i = 0; i < keys.length - 1; i++) {
            if (current[keys[i]] === undefined) current[keys[i]] = {};
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        setData(newData);
    };

    const handleListChange = (path: string, value: string, checked: boolean) => {
        const keys = path.split('.');
        const newData = JSON.parse(JSON.stringify(data)); // Deep copy
        let current = newData;
        for (let i = 0; i < keys.length - 1; i++) {
             if (current[keys[i]] === undefined) current[keys[i]] = {};
            current = current[keys[i]];
        }
        
        const currentArray = current[keys[keys.length - 1]] || [];
        const newArray = checked ? [...currentArray, value] : currentArray.filter((item: string) => item !== value);
        current[keys[keys.length - 1]] = newArray;
        setData(newData);
    };

    const SubjectAssessmentForm: FC<{ subject: string }> = ({ subject }) => {
        const subjectData = data.subjectAssessments?.[subject] || {};
        const subjectPath = `subjectAssessments.${subject}`;

        return (
            <details className="bg-background/70 rounded-md">
                <summary className="p-2 font-semibold text-sm cursor-pointer select-none">{subject}</summary>
                <div className="p-2 border-t border-border space-y-4">
                    <TextArea label="Activity" value={subjectData.activity || ''} onChange={val => handleDataChange(`${subjectPath}.activity`, val)} rows={3} />
                    
                    <Section title="Self Reflection">
                        <RadioGroup legend="Am I proud of my effort?" value={subjectData.selfReflection?.proudOfEffort || ''} options={YES_NO_OPTIONS} onChange={val => handleDataChange(`${subjectPath}.selfReflection.proudOfEffort`, val)} />
                        <TextArea label="One new and interesting thing I learned is..." value={subjectData.selfReflection?.interestingThing || ''} onChange={val => handleDataChange(`${subjectPath}.selfReflection.interestingThing`, val)} />
                        <TextArea label="I need to practice..." value={subjectData.selfReflection?.needPracticeOn || ''} onChange={val => handleDataChange(`${subjectPath}.selfReflection.needPracticeOn`, val)} />
                        <TextArea label="I need help with..." value={subjectData.selfReflection?.needHelpWith || ''} onChange={val => handleDataChange(`${subjectPath}.selfReflection.needHelpWith`, val)} />
                    </Section>
                    
                    <Section title="Teacher Feedback">
                        <TextArea label="Student's Strengths" value={(subjectData.teacherFeedback?.strengths || []).join('\n')} onChange={val => handleDataChange(`${subjectPath}.teacherFeedback.strengths`, val.split('\n'))} rows={3} />
                        <TextArea label="Barriers to Learning" value={(subjectData.teacherFeedback?.barriers || []).join('\n')} onChange={val => handleDataChange(`${subjectPath}.teacherFeedback.barriers`, val.split('\n'))} rows={3} />
                        <TextArea label="How Teacher and Parent Can Help" value={subjectData.teacherFeedback?.howToHelp || ''} onChange={val => handleDataChange(`${subjectPath}.teacherFeedback.howToHelp`, val)} rows={3} />
                        <TextArea label="Other Observations/Recommendations" value={subjectData.teacherFeedback?.observations || ''} onChange={val => handleDataChange(`${subjectPath}.teacherFeedback.observations`, val)} rows={4} />
                    </Section>
                </div>
            </details>
        );
    };

    return (
        <div className="p-2 space-y-3 text-sm">
            <Section title="Part A(2): All About Me & Goal Setting" defaultOpen>
                <TextInput label="I live with my..." value={data.partA2?.liveWith || ''} onChange={val => handleDataChange('partA2.liveWith', val)} />
                <TextArea label="My Academic Goal" value={data.partA2?.academicGoal?.description || ''} onChange={val => handleDataChange('partA2.academicGoal.description', val)} />
                <TextArea label="My Personal Goal" value={data.partA2?.personalGoal?.description || ''} onChange={val => handleDataChange('partA2.personalGoal.description', val)} />
                <TextArea label="I would appreciate my teacher’s help with..." value={data.partA2?.forTeacher?.helpWith || ''} onChange={val => handleDataChange('partA2.forTeacher.helpWith', val)} />
            </Section>

            <Section title="Part A(3): My Ambition Card">
                <TextInput label="My ambition is..." value={data.partA3?.ambition || ''} onChange={val => handleDataChange('partA3.ambition', val)} />
                <TextArea label="5 skills I need to achieve my ambition..." value={data.partA3?.skillsNeeded || ''} onChange={val => handleDataChange('partA3.skillsNeeded', val)} />
                <TextArea label="Subjects I should focus on..." value={data.partA3?.subjectsToFocus || ''} onChange={val => handleDataChange('partA3.subjectsToFocus', val)} />
            </Section>
            
             <Section title="Part A(4): Parent-Teacher Partnership">
                <TextArea label="Based on my discussion with the teacher, I will support my child at home by..." value={data.partA4?.supportAtHome || ''} onChange={val => handleDataChange('partA4.supportAtHome', val)} />
             </Section>

            <Section title="Part B: Subject Assessments">
                <div className="space-y-2">
                    {MIDDLE_STAGE_SUBJECTS.map(subject => <SubjectAssessmentForm key={subject} subject={subject} />)}
                </div>
            </Section>
        </div>
    );
};
