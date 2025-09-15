import React from 'react';
import { Student, SchoolDetails, HPCReportData } from '../types';

interface HPCMiddleCardProps {
  student: Student;
  schoolDetails: SchoolDetails;
  hpcData: HPCReportData;
}

const STAGE_CONFIG = {
    Middle: {
        learningStandards: ['Language 1 (R1)', 'Language 2 (R2)', 'Language 3 (R3)', 'Mathematics', 'Science', 'Social Science', 'Art Education', 'Physical Education', 'Skill Education', 'Overall'],
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
            <h3 className="font-bold mb-2 col-span-full">{standard}</h3>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-2">
                <div>
                    <h4 className="font-semibold text-center text-xs mb-1">Performance Level Descriptors</h4>
                    <div className="flex justify-around items-center bg-gray-50 p-1 rounded">
                        <Gauge level={summary.awareness} />
                        <Gauge level={summary.sensitivity} />
                        <Gauge level={summary.creativity} />
                    </div>
                     <div className="grid grid-cols-3 gap-1 text-center text-[9px] mt-1">
                        <span>Beginner</span>
                        <span>Proficient</span>
                        <span>Advanced</span>
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
    
    const DetailBox: React.FC<{ label: string; value: string | undefined | null; className?: string }> = ({ label, value, className }) => (
        <div className={`flex items-baseline ${className}`}><span className="font-semibold w-28 flex-shrink-0 text-gray-800">{label}:</span><span className="flex-1 border-b border-dotted border-gray-500 pl-1">{value || ''}</span></div>
    );
    
    const allStandards = STAGE_CONFIG.Middle.learningStandards;
    const page1Standards = allStandards.slice(0, 5);
    const page2Standards = allStandards.slice(5);
    
    return (
         <div className="text-black font-sans leading-tight text-xs">
            <div className="A4-page bg-white shadow-lg p-6 flex flex-col my-4">
                 <header className="text-center mb-4"><h1 className="text-xl font-bold">HOLISTIC PROGRESS CARD (HPC) - MIDDLE STAGE</h1><p className="text-base">Academic Year: {hpcData.academicYear}</p></header>
                 <section className="border-2 border-orange-500 p-3 rounded-md">
                    <h2 className="text-center font-bold text-base text-orange-700 mb-2">PART-A: GENERAL INFORMATION</h2>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                        <DetailBox label="School Name" value={schoolDetails.name} className="col-span-2" />
                        <DetailBox label="Student's Name" value={student.name} />
                        <DetailBox label="Admission No." value={student.admissionNo} />
                        <DetailBox label="Date of Birth" value={student.dob} />
                        <DetailBox label="Class" value={student.className} />
                        <DetailBox label="Father's Name" value={student.fathersName} />
                        <DetailBox label="Mother's Name" value={student.mothersName} />
                        <DetailBox label="Address" value={student.address} className="col-span-2" />
                        <DetailBox label="Contact No." value={student.contact} />
                        <DetailBox label="UDISE Code" value={schoolDetails.udiseCode} />
                    </div>
                 </section>
                  <section className="border-2 border-orange-500 p-3 rounded-md mt-4 flex-grow">
                    <h2 className="text-center font-bold text-base text-orange-700 mb-2">TEACHER'S OBSERVATIONAL NOTES / REMARKS</h2>
                    <div className="w-full h-full border border-dotted min-h-[10rem] p-2 space-y-2 text-[10px]">
                        {allStandards.map(standard => (
                            <div key={standard}>
                                <p className="font-semibold">{standard}:</p>
                                <p className="pl-2 text-gray-700">{hpcData.middleData?.subjectAssessments?.[standard]?.observationalNotes || '...'}</p>
                            </div>
                        ))}
                    </div>
                  </section>
            </div>

            {/* Page 2 */}
            <div className="A4-page bg-white shadow-lg p-6 flex flex-col text-sm my-4">
                 <header className="text-center mb-4"><h1 className="text-xl font-bold">PART-C: SUMMARY FOR THE ACADEMIC YEAR</h1></header>
                 <div className="space-y-3">
                    {page1Standards.map(standard => (
                        <SummarySection key={standard} standard={standard} hpcData={hpcData} />
                    ))}
                 </div>
            </div>

            {/* Page 3 */}
             <div className="A4-page bg-white shadow-lg p-6 flex flex-col text-sm my-4">
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