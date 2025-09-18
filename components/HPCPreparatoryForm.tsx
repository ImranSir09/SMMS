
import React, { FC } from 'react';
import { PreparatoryData } from '../types';

interface Props {
    data: PreparatoryData;
    setData: (data: PreparatoryData) => void;
}

const Section: FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen=false }) => (
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

const TextArea: FC<{ label: string; value: string; onChange: (val: string) => void }> = ({ label, value, onChange }) => (
    <div>
        <label className="block text-xs font-medium text-foreground/80 mb-1">{label}</label>
        <textarea className="w-full p-2 border border-input rounded bg-background text-sm" rows={2} value={value || ''} onChange={e => onChange(e.target.value)} />
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


export const HPCPreparatoryForm: FC<Props> = ({ data, setData }) => {

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

    const handleCheckboxChange = (path: string, value: string, checked: boolean) => {
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

    const FEEDBACK_QUESTIONS = [
        'Is your child happy at school?',
        'Does your child feel safe and secure at school?',
        'Does your child talk about things they learn at school?',
        'Does your child understand and follow school/classroom rules?',
    ];
    
    return (
        <div className="p-2 space-y-3 text-sm">
            <Section title="Part A(1): General Information" defaultOpen>
                <div className="grid grid-cols-2 gap-3">
                    <TextInput label="Teacher Code" value={data.partA1?.teacherCode || ''} onChange={val => handleDataChange('partA1.teacherCode', val)} />
                    <TextInput label="Registration No." value={data.partA1?.registrationNo || ''} onChange={val => handleDataChange('partA1.registrationNo', val)} />
                    <TextInput label="Mother's Occupation" value={data.partA1?.motherOccupation || ''} onChange={val => handleDataChange('partA1.motherOccupation', val)} />
                    <TextInput label="Father's Occupation" value={data.partA1?.fatherOccupation || ''} onChange={val => handleDataChange('partA1.fatherOccupation', val)} />
                </div>
            </Section>

            <Section title="Part A(2): All About Me">
                <TextInput label="I am ___ years old" value={data.partA2?.iAmYearsOld || ''} onChange={val => handleDataChange('partA2.iAmYearsOld', val)} />
                <TextArea label="My Family" value={data.partA2?.myFamily || ''} onChange={val => handleDataChange('partA2.myFamily', val)} />
                <div className="p-2 border border-border rounded-md">
                    <h4 className="font-semibold mb-2">Things about me...</h4>
                    <TextArea label="I am good at" value={data.partA2?.handDiagram?.goodAt || ''} onChange={val => handleDataChange('partA2.handDiagram.goodAt', val)} />
                    <TextArea label="I am not so good at" value={data.partA2?.handDiagram?.notSoGoodAt || ''} onChange={val => handleDataChange('partA2.handDiagram.notSoGoodAt', val)} />
                    <TextArea label="I would like to improve my skill of" value={data.partA2?.handDiagram?.improveSkill || ''} onChange={val => handleDataChange('partA2.handDiagram.improveSkill', val)} />
                    <TextArea label="I like to" value={data.partA2?.handDiagram?.likeToDo || ''} onChange={val => handleDataChange('partA2.handDiagram.likeToDo', val)} />
                    <TextArea label="I don't like to" value={data.partA2?.handDiagram?.dontLikeToDo || ''} onChange={val => handleDataChange('partA2.handDiagram.dontLikeToDo', val)} />
                </div>
                <div className="p-2 border border-border rounded-md">
                    <h4 className="font-semibold mb-2">Some of my favorite things...</h4>
                    <TextInput label="Food" value={data.partA2?.myFavoriteThings?.food || ''} onChange={val => handleDataChange('partA2.myFavoriteThings.food', val)} />
                    <TextInput label="Games" value={data.partA2?.myFavoriteThings?.games || ''} onChange={val => handleDataChange('partA2.myFavoriteThings.games', val)} />
                    <TextInput label="Festivals" value={data.partA2?.myFavoriteThings?.festivals || ''} onChange={val => handleDataChange('partA2.myFavoriteThings.festivals', val)} />
                </div>
                <TextArea label="When I grow up, I want to be" value={data.partA2?.whenIGrowUp || ''} onChange={val => handleDataChange('partA2.whenIGrowUp', val)} />
                <TextArea label="One person who inspires me is" value={data.partA2?.myIdol || ''} onChange={val => handleDataChange('partA2.myIdol', val)} />
                <div>
                     <label className="block text-xs font-medium text-foreground/80 mb-1">Things I want to learn this year</label>
                     <input type="text" placeholder="Add a goal and press Enter" className="w-full p-2 border border-input rounded bg-background text-sm" onKeyDown={e => {
                         if (e.key === 'Enter' && e.currentTarget.value) {
                             e.preventDefault();
                             handleCheckboxChange('partA2.thingsToLearn', e.currentTarget.value, true);
                             e.currentTarget.value = '';
                         }
                     }} />
                     <div className="mt-1 space-y-1">
                        {(data.partA2?.thingsToLearn || []).map((thing, i) => <div key={i} className="flex items-center justify-between bg-background p-1 rounded-md text-xs"><span>{thing}</span><button onClick={() => handleCheckboxChange('partA2.thingsToLearn', thing, false)}>&#x2715;</button></div>)}
                     </div>
                </div>
            </Section>
            
            <Section title="Part A(4): Parent/Guardian Partnership">
                 <div className="space-y-3">
                    {FEEDBACK_QUESTIONS.map((q, i) => (
                        <RadioGroup key={i} legend={q} value={data.parentGuardianFeedback?.questions?.[`q${i+1}`] || ''} options={['Yes', 'Sometimes', 'No', 'Not sure']} onChange={val => handleDataChange(`parentGuardianFeedback.questions.q${i+1}`, val)} />
                    ))}
                    <TextArea label="Based on my discussion with the teacher, I will support my child at home by..." value={data.parentGuardianFeedback?.otherSupport || ''} onChange={val => handleDataChange(`parentGuardianFeedback.otherSupport`, val)} />
                 </div>
            </Section>
        </div>
    );
};
