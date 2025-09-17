import React from 'react';
import { Student, SchoolDetails, HPCReportData } from '../types';

interface HPCMiddleCardProps {
  student: Student;
  schoolDetails: SchoolDetails;
  hpcData: HPCReportData;
}

const STAGE_CONFIG = {
    Middle: {
        learningStandards: ['Language (R1)', 'Language (R2)', 'Language (R3)', 'Mathematics', 'Science', 'Social Science', 'Art Education', 'Physical Education', 'Skill Education', 'Overall'],
    }
};

const Gauge: React.FC<{ level?: string }> = ({ level }) => {
    const levels = ['Beginner', 'Proficient', 'Advanced'];
    const activeIndex = levels.indexOf(level || '');
    const rotation = activeIndex === 0 ? -55 : activeIndex === 1 ? 0 : 55;
    
    return (
        <div className="relative w-20 h-10">
            <svg viewBox="0 0 100 50" className="w-full h-full">
                <path d="M 10 50 A 40 40 0 0 1 90 50" strokeWidth="10" stroke="#e5e7eb" fill="none" />
                <path d="M 10 50 A 40 40 0 0 1 36.6 15" strokeWidth="10" stroke="#ef4444" fill="none" />
                <path d="M 36.6 15 A 40 40 0 0 1 63.4 15" strokeWidth="10" stroke="#facc15" fill="none" />
                <path d="M 63.4 15 A 40 40 0 0 1 90 50" strokeWidth="10" stroke="#4ade80" fill="none" />
                <polygon points="50,45 48,10 52,10" fill="#374151" transform={`rotate(${rotation}, 50, 45)`} style={{ transition: 'transform 0.5s ease' }} />
                <circle cx="50" cy="45" r="4" fill="#374151" />
            </svg>
        </div>
    );
};

const SummarySection: React.FC<{ standard: string; hpcData: HPCReportData }> = ({ standard, hpcData }) => {
    const summary = hpcData.summaries[standard] || {};
    const notes = hpcData.middleData?.subjectAssessments?.[standard]?.observationalNotes;

    return (
        <div className="border border-gray-400 p-2 rounded-md break-inside-avoid-page">
            <h3 className="font-bold mb-2 col-span-full">{standard.replace('Education', '')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-4">
                <div className="flex flex-col items-center">
                    <h4 className="font-semibold text-center text-xs mb-1">Performance Level Descriptors</h4>
                    <div className="flex justify-around items-center bg-gray-50 p-1 rounded">
                        <Gauge level={summary.awareness} />
                        <Gauge level={summary.sensitivity} />
                        <Gauge level={summary.creativity} />
                    </div>
                     <div className="grid grid-cols-3 gap-1 text-center text-[9px] mt-1 w-full px-2">
                        <span>Awareness</span>
                        <span>Sensitivity</span>
                        <span>Creativity</span>
                    </div>
                </div>
                <div>
                     <div className="grid grid-cols-3 gap-2 items-start text-xs">
                        {(['awareness', 'sensitivity', 'creativity'] as const).map(ability => (
                            <div key={ability}>
                                <p className="font-semibold capitalize mb-1">{ability}</p>
                                {['Beginner', 'Proficient', 'Advanced'].map(level => (
                                    <div key={level} className="flex items-center gap-1">
                                        <input type="checkbox" checked={summary[ability] === level} readOnly className="w-3 h-3"/>
                                        <label className="text-[10px]">{level}</label>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="mt-2 text-[10px] leading-tight border-t pt-1">
                <strong>Observational Note:</strong>
                <p className="pl-2 h-8">{notes || '...'}</p>
            </div>
        </div>
    );
};


const HPCMiddleCard: React.FC<HPCMiddleCardProps> = ({ student, schoolDetails, hpcData }) => {
    
    const allStandards = STAGE_CONFIG.Middle.learningStandards;
    const page1Standards = allStandards.slice(0, 5);
    const page2Standards = allStandards.slice(5);
    
    return (
         <div className="text-black font-sans leading-tight text-xs">
            <div className="A4-page bg-white shadow-lg p-6 flex flex-col my-4">
                 <header className="text-center mb-4"><h1 className="text-xl font-bold">HOLISTIC PROGRESS CARD (HPC) - MIDDLE STAGE</h1><p className="text-base">Academic Year: {hpcData.academicYear}</p></header>
                 <section>
                    <h2 className="text-center font-bold text-base text-orange-700 mb-2">PART-A: GENERAL INFORMATION (Summary)</h2>
                    <div className="text-center text-sm p-2 border rounded-md">
                        <p><strong>Student:</strong> {student.name} | <strong>Class:</strong> {student.className} | <strong>Adm No:</strong> {student.admissionNo}</p>
                        <p className="mt-2 italic">Note: Full Part A & B details are available in the comprehensive school record.</p>
                    </div>
                 </section>
                 
                 <section className="flex-grow mt-4">
                     <h1 className="text-xl font-bold text-center mb-2">PART-C: SUMMARY FOR THE ACADEMIC YEAR (Page 1 of 2)</h1>
                     <div className="space-y-3">
                        {page1Standards.map(standard => (
                            <SummarySection key={standard} standard={standard} hpcData={hpcData} />
                        ))}
                     </div>
                 </section>
            </div>

            <div className="A4-page bg-white shadow-lg p-6 flex flex-col text-sm my-4">
                 <header className="text-center mb-4"><h1 className="text-xl font-bold">PART-C: SUMMARY (Page 2 of 2)</h1></header>
                 <div className="space-y-3">
                    {page2Standards.map(standard => (
                        <SummarySection key={standard} standard={standard} hpcData={hpcData} />
                    ))}
                 </div>
                 <footer className="mt-auto pt-16 flex justify-between items-end"><div className="text-center w-1/3"><div className="border-t-2 border-gray-500 mb-1"></div><p className="font-semibold">Parent's Signature</p></div><div className="text-center w-1/3"><div className="border-t-2 border-gray-500 mb-1"></div><p className="font-semibold">Teacher's Signature</p></div><div className="text-center w-1/3"><div className="border-t-2 border-gray-500 mb-1"></div><p className="font-semibold">Principal's Signature</p></div></footer>
            </div>
         </div>
    );
};

export default HPCMiddleCard;