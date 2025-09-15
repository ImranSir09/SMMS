import React from 'react';
import { Student, SchoolDetails, HPCReportData } from '../types';

interface HPCPreparatoryCardProps {
  student: Student;
  schoolDetails: SchoolDetails;
  hpcData: HPCReportData;
}

// FIX: Define STAGE_CONFIG to resolve reference error.
const STAGE_CONFIG = {
    Preparatory: {
        learningStandards: ['Language Education (R1)', 'Language Education (R2)', 'Mathematics', 'The World Around Us', 'Art Education', 'Physical Education'],
    },
};

const HPCPreparatoryCard: React.FC<HPCPreparatoryCardProps> = ({ student, schoolDetails, hpcData }) => {
    
    const DetailBox: React.FC<{ label: string; value: string | undefined; className?: string }> = ({ label, value, className }) => (
        <div className={`flex items-baseline ${className}`}><span className="font-semibold w-28 flex-shrink-0 text-gray-800">{label}:</span><span className="flex-1 border-b border-dotted border-gray-500 pl-1">{value || ''}</span></div>
    );
    
    const SummaryGauge: React.FC<{ level?: string }> = ({ level }) => {
        const levels = ['Beginner', 'Proficient', 'Advanced'];
        const activeIndex = levels.indexOf(level || '');
        const colors = ['bg-red-400', 'bg-yellow-400', 'bg-green-400'];
        return (
             <div className="flex items-center justify-center gap-0.5">
                {levels.map((l, i) => (
                    <div key={l} className="flex flex-col items-center gap-0.5 w-16">
                         <div className="w-full h-8 rounded-full flex items-center justify-center" style={{ background: `conic-gradient(${colors[i]} ${ (i + 1) * 33.3}%, #e5e7eb 0)`}}>
                            {i === activeIndex && <div className="w-2 h-2 rounded-full bg-black"></div>}
                        </div>
                        <span className="text-[8px]">{l}</span>
                    </div>
                ))}
            </div>
        );
    };

    const standards = ['Language Education (R1)', 'Language Education (R2)', 'Mathematics', 'The World Around Us', 'Art Education', 'Physical Education', 'Overall'];
    
    // Split standards for two pages if needed
    const summaryPage1Standards = standards.slice(0, 4);
    const summaryPage2Standards = standards.slice(4);


    return (
         <div className="text-black font-sans leading-tight text-xs">
            {/* Page 1: General Info */}
            <div className="A4-page bg-white shadow-lg p-6 flex flex-col my-4">
                 <header className="text-center mb-4"><h1 className="text-xl font-bold">HOLISTIC PROGRESS CARD (HPC) - PREPARATORY STAGE</h1><p className="text-base">Academic Year: {hpcData.academicYear}</p></header>
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
                    <div className="w-full h-full border border-dotted min-h-[10rem] p-2 space-y-2">
                        {hpcData.stage === 'Preparatory' && STAGE_CONFIG.Preparatory.learningStandards.map(standard => (
                            <div key={standard}>
                                <p className="font-semibold">{standard}:</p>
                                <p className="pl-2 text-gray-700">{hpcData.preparatoryData?.subjectAssessments?.[standard]?.observationalNotes || '...'}</p>
                            </div>
                        ))}
                    </div>
                  </section>
            </div>

            {/* Page 2 & 3: Summary */}
            {[summaryPage1Standards, summaryPage2Standards].map((pageStandards, pageIndex) => (
                <div key={pageIndex} className="A4-page bg-white shadow-lg p-6 flex flex-col text-sm my-4">
                     <header className="text-center mb-4"><h1 className="text-xl font-bold">PART-C: SUMMARY FOR THE ACADEMIC YEAR</h1></header>
                     <div className="space-y-3">
                        {pageStandards.map(standard => (
                             <div key={standard} className="border p-2 rounded-md">
                                <h3 className="font-bold mb-2 col-span-1">{standard}</h3>
                                <div className="grid grid-cols-3 gap-2 items-start">
                                    {(['awareness', 'sensitivity', 'creativity'] as const).map(ability => (
                                        <div key={ability} className="text-center">
                                            <p className="text-xs font-semibold capitalize">{ability}</p>
                                            <div className="mt-1">
                                                <input type="checkbox" checked={hpcData.summaries[standard]?.[ability] === 'Beginner'} readOnly className="mx-4"/>
                                                <input type="checkbox" checked={hpcData.summaries[standard]?.[ability] === 'Proficient'} readOnly className="mx-4"/>
                                                <input type="checkbox" checked={hpcData.summaries[standard]?.[ability] === 'Advanced'} readOnly className="mx-4"/>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-2 text-[10px] leading-tight border-t pt-1">
                                    <strong>Observational Note:</strong> {hpcData.summaries[standard]?.notes || '...'}
                                </div>
                            </div>
                        ))}
                     </div>
                     
                     {pageIndex === 1 && (
                        <>
                         <div className="mt-4 text-xs"><p className="font-bold">Performance Level Descriptors:</p><p>Beginner | Proficient | Advanced</p></div>
                         <footer className="mt-auto pt-16 flex justify-between items-end"><div className="text-center w-1/3"><div className="border-t-2 border-gray-500 mb-1"></div><p className="font-semibold">Parent's Signature</p></div><div className="text-center w-1/3"><div className="border-t-2 border-gray-500 mb-1"></div><p className="font-semibold">Teacher's Signature</p></div><div className="text-center w-1/3"><div className="border-t-2 border-gray-500 mb-1"></div><p className="font-semibold">Principal's Signature</p></div></footer>
                        </>
                     )}
                </div>
            ))}
         </div>
    );
};

export default HPCPreparatoryCard;
