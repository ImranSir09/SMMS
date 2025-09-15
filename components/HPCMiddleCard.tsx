import React from 'react';
import { Student, SchoolDetails, HPCReportData } from '../types';

interface HPCMiddleCardProps {
  student: Student;
  schoolDetails: SchoolDetails;
  hpcData: HPCReportData;
}

const HPCMiddleCard: React.FC<HPCMiddleCardProps> = ({ student, schoolDetails, hpcData }) => {
    
    const DetailBox: React.FC<{ label: string; value: string | undefined; className?: string }> = ({ label, value, className }) => (
        <div className={`flex items-baseline ${className}`}><span className="font-semibold w-1/3 text-gray-700">{label}:</span><span className="flex-1 border-b border-dotted border-gray-500 pl-1">{value || ''}</span></div>
    );
    
    const SummaryGauge: React.FC<{ level?: string }> = ({ level }) => {
        const levels = ['Beginner', 'Proficient', 'Advanced'];
        const activeIndex = levels.indexOf(level || '');
        return (
            <div className="flex items-center justify-center gap-1">
                {levels.map((l, i) => (
                    <div key={l} className={`w-8 h-4 rounded-full ${i === activeIndex ? 'bg-green-500' : 'bg-gray-200'}`} title={l}></div>
                ))}
            </div>
        );
    };

    const standards = ['Language 1 (R1)', 'Language 2 (R2)', 'Language 3 (R3)', 'Mathematics', 'Science', 'Social Science', 'Art Education', 'Physical Education', 'Skill Education', 'Overall'];

    return (
         <div className="text-black font-sans leading-tight">
            {/* Page 1: General Info */}
            <div className="A4-page bg-white shadow-lg p-6 flex flex-col text-sm my-4">
                 <header className="text-center mb-4"><h1 className="text-xl font-bold">HOLISTIC PROGRESS CARD (HPC) - MIDDLE STAGE</h1><p className="text-md">Academic Year: {hpcData.academicYear}</p></header>
                 <section className="border-2 border-orange-500 p-2 rounded-md">
                    <h2 className="text-center font-bold text-lg text-orange-700 mb-2">PART-A: GENERAL INFORMATION</h2>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2">
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
                  <section className="border-2 border-orange-500 p-2 rounded-md mt-4 flex-grow">
                    <h2 className="text-center font-bold text-md text-orange-700 mb-2">TEACHER'S OBSERVATIONAL NOTES / REMARKS</h2>
                    <div className="w-full h-full border border-dotted min-h-[10rem]"></div>
                  </section>
            </div>

            {/* Page 2: Summary */}
            <div className="A4-page bg-white shadow-lg p-6 flex flex-col text-sm my-4">
                 <header className="text-center mb-4"><h1 className="text-xl font-bold">PART-C: SUMMARY FOR THE ACADEMIC YEAR</h1></header>
                 <div className="space-y-4">
                    {standards.map(standard => (
                        <div key={standard} className="grid grid-cols-4 gap-2 items-center border p-1 rounded-md">
                            <h3 className="font-bold col-span-1 text-xs">{standard}</h3>
                            <div className="text-center">
                                <p className="text-xs font-semibold">Awareness</p>
                                <SummaryGauge level={hpcData.summaries[standard]?.awareness} />
                            </div>
                            <div className="text-center">
                                <p className="text-xs font-semibold">Sensitivity</p>
                                <SummaryGauge level={hpcData.summaries[standard]?.sensitivity} />
                            </div>
                            <div className="text-center">
                                <p className="text-xs font-semibold">Creativity</p>
                                <SummaryGauge level={hpcData.summaries[standard]?.creativity} />
                            </div>
                        </div>
                    ))}
                 </div>
                 <div className="mt-4 text-xs"><p className="font-bold">Key:</p><p>Beginner (Developing) | Proficient (Meeting Expectations) | Advanced (Exceeding Expectations)</p></div>
                 <footer className="mt-auto pt-16 flex justify-between items-end"><div className="text-center w-1/3"><div className="border-t-2 border-gray-500 mb-1"></div><p className="font-semibold">Parent's Signature</p></div><div className="text-center w-1/3"><div className="border-t-2 border-gray-500 mb-1"></div><p className="font-semibold">Teacher's Signature</p></div><div className="text-center w-1/3"><div className="border-t-2 border-gray-500 mb-1"></div><p className="font-semibold">Principal's Signature</p></div></footer>
            </div>
         </div>
    );
};

export default HPCMiddleCard;
