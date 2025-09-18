
import React, { FC } from 'react';
import { HPCReportData, FoundationalData } from '../types';

interface Props {
    data: FoundationalData;
    summaries: HPCReportData['summaries'];
    attendance: HPCReportData['attendance'];
    setData: (key: 'foundationalData' | 'summaries' | 'attendance', value: any) => void;
}

const DOMAINS = ['Physical Development', 'Socio-emotional Development', 'Cognitive Development', 'Language and Literacy', 'Aesthetic & Cultural', 'Positive Learning Habits'];
const INTERESTS_CHECKLIST = ['Reading', 'Dancing/Singing', 'Sport/Games', 'Creative writing', 'Gardening', 'Yoga', 'Art', 'Craft', 'Cooking', 'Chores'];
const MONTHS = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];

const Section: FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <details className="bg-background/50 rounded-lg open:shadow-md" open>
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

export const HPCFoundationalForm: FC<Props> = ({ data, summaries, attendance, setData }) => {

    const handlePartA1Change = (field: keyof FoundationalData['partA1'], value: string) => {
        setData('foundationalData', { ...data, partA1: { ...data.partA1, [field]: value } });
    };

    const handleInterestChange = (interest: string, checked: boolean) => {
        const currentInterests = data.interests || [];
        const newInterests = checked ? [...currentInterests, interest] : currentInterests.filter(i => i !== interest);
        setData('foundationalData', { ...data, interests: newInterests });
    };

    const handleAttendanceChange = (month: string, field: 'working' | 'present', value: string) => {
        const numericValue = value ? parseInt(value, 10) : undefined;
        const monthKey = month.toLowerCase();
        setData('attendance', { ...attendance, [monthKey]: { ...attendance?.[monthKey], [field]: numericValue } });
    };
    
    const handleSummaryChange = (domain: string, field: 'awareness' | 'sensitivity' | 'creativity' | 'observationalNotes', value: any) => {
        setData('summaries', {
            ...summaries,
            [domain]: {
                ...summaries?.[domain],
                [field]: value
            }
        });
    };

    return (
        <div className="p-2 space-y-3 text-sm">
            <Section title="Part A(1): General Information">
                <div className="grid grid-cols-2 gap-3">
                    <TextInput label="Teacher Code" value={data.partA1?.teacherCode || ''} onChange={val => handlePartA1Change('teacherCode', val)} />
                    <TextInput label="APAAR ID" value={data.partA1?.apaarId || ''} onChange={val => handlePartA1Change('apaarId', val)} />
                    <TextInput label="Registration No." value={data.partA1?.registrationNo || ''} onChange={val => handlePartA1Change('registrationNo', val)} />
                    <TextInput label="Mother's Education" value={data.partA1?.motherEducation || ''} onChange={val => handlePartA1Change('motherEducation', val)} />
                    <TextInput label="Father's Education" value={data.partA1?.fatherEducation || ''} onChange={val => handlePartA1Change('fatherEducation', val)} />
                </div>
            </Section>

            <Section title="Part A(2): Attendance & Interests">
                 <h4 className="font-semibold mb-2">Attendance</h4>
                 <div className="grid grid-cols-4 gap-2">
                    {MONTHS.map(month => (
                        <div key={month} className="bg-background p-2 rounded-md">
                            <p className="font-bold text-center mb-1">{month}</p>
                            <TextInput label="Working" value={String(attendance?.[month.toLowerCase()]?.working || '')} onChange={val => handleAttendanceChange(month, 'working', val)} />
                            <TextInput label="Present" value={String(attendance?.[month.toLowerCase()]?.present || '')} onChange={val => handleAttendanceChange(month, 'present', val)} />
                        </div>
                    ))}
                 </div>
                 <h4 className="font-semibold mb-2 mt-4">Interests</h4>
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {INTERESTS_CHECKLIST.map(interest => (
                        <label key={interest} className="flex items-center gap-2 p-2 bg-background rounded-md">
                            <input type="checkbox" checked={data.interests?.includes(interest) || false} onChange={e => handleInterestChange(interest, e.target.checked)} />
                            <span>{interest}</span>
                        </label>
                    ))}
                 </div>
            </Section>

            <Section title="Part C: Summary for the Academic Year">
                {DOMAINS.map(domain => (
                    <div key={domain} className="p-2 rounded-md border border-border bg-background mb-3">
                        <h4 className="font-bold mb-2">{domain}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-foreground/80 mb-1">Proficiency Levels</label>
                                <div className="space-y-2">
                                    {['awareness', 'sensitivity', 'creativity'].map(aspect => (
                                        <div key={aspect}>
                                            <p className="capitalize text-xs font-semibold">{aspect}</p>
                                            <div className="flex items-center gap-4 p-2 bg-background/50 rounded-md">
                                                {['Stream', 'Mountain', 'Sky'].map(level => (
                                                    <label key={level} className="flex items-center gap-1 cursor-pointer">
                                                        <input 
                                                            type="radio"
                                                            name={`${domain}-${aspect}`}
                                                            value={level}
                                                            checked={summaries?.[domain]?.[aspect as 'awareness' | 'sensitivity' | 'creativity'] === level}
                                                            onChange={() => handleSummaryChange(domain, aspect as 'awareness' | 'sensitivity' | 'creativity', level)}
                                                        />
                                                        {level}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                 <label className="block text-xs font-medium text-foreground/80 mb-1">Teacher's Notes / Descriptors</label>
                                <textarea 
                                    className="w-full p-2 border border-input rounded bg-background text-sm min-h-[150px]"
                                    value={summaries?.[domain]?.observationalNotes || ''}
                                    onChange={e => handleSummaryChange(domain, 'observationalNotes', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </Section>
        </div>
    );
};
