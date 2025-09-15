import React from 'react';
import { Student, SchoolDetails, HPCReportData } from '../types';

interface HPCMiddleCardProps {
  student: Student;
  schoolDetails: SchoolDetails;
  hpcData: HPCReportData;
}

const HPCMiddleCard: React.FC<HPCMiddleCardProps> = ({ student, schoolDetails, hpcData }) => {
    
    const DetailBox: React.FC<{ label: string; value: string | undefined; className?: string }> = ({ label, value, className }) => (
        <div className={`flex items-baseline ${className}`}><span className="font-semibold w-28 flex-shrink-0 text-gray-800">{label}:</span><span className="flex-1 border-b border-dotted border-gray-500 pl-1">{value || ''}</span></div>
    );
    
     const SummaryRow: React.FC<{ standard: string }> = ({ standard }) => {
        const summary = hpcData.summaries[standard];
        return (
            <tr>
                <td className="border p-1 font-semibold text-left">{standard}</td>
                { (['Beginner', 'Proficient', 'Advanced'] as const).map(level => <td key={level} className="border p-1 text-center">{summary?.awareness === level ? '✔️' : ''}</td>) }
                { (['Beginner', 'Proficient', 'Advanced'] as const).map(level => <td key={level} className="border p-1 text-center">{summary?.sensitivity === level ? '✔️' : ''}</td>) }
                { (['Beginner', 'Proficient', 'Advanced'] as const).map(level => <td key={level} className="border p-1 text-center">{summary?.creativity === level ? '✔️' : ''}</td>) }
            </tr>
        );
     };

    const standards = ['Language 1 (R1)', 'Language 2 (R2)', 'Language 3 (R3)', 'Mathematics', 'Science', 'Social Science', 'Art Education', 'Physical Education', 'Skill Education'];

    return (
         <div className="text-black font-sans leading-tight text-xs">
            {/* Page 1: General Info */}
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
                     <div className="w-full h-full border border-dotted min-h-[10rem] p-2 space-y-2">
                        {hpcData.stage === 'Middle' && standards.map(standard => (
                            <div key={standard}>
                                <p className="font-semibold">{standard}:</p>
                                <p className="pl-2 text-gray-700">{hpcData.middleData?.subjectAssessments?.[standard]?.observationalNotes || '...'}</p>
                            </div>
                        ))}
                    </div>
                  </section>
            </div>

            {/* Page 2: Summary */}
            <div className="A4-page bg-white shadow-lg p-6 flex flex-col text-sm my-4">
                 <header className="text-center mb-4"><h1 className="text-xl font-bold">PART-C: SUMMARY FOR THE ACADEMIC YEAR</h1></header>
                 <table className="w-full border-collapse border">
                    <thead>
                        <tr className="bg-orange-100">
                            <th rowSpan={2} className="border p-1">Learning Areas</th>
                            <th colSpan={3} className="border p-1">Awareness</th>
                            <th colSpan={3} className="border p-1">Sensitivity</th>
                            <th colSpan={3} className="border p-1">Creativity</th>
                        </tr>
                        <tr className="bg-orange-50">
                           {['B', 'P', 'A', 'B', 'P', 'A', 'B', 'P', 'A'].map((l,i) => <th key={i} className="border p-1 font-semibold">{l}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {standards.map(standard => <SummaryRow key={standard} standard={standard}/>)}
                    </tbody>
                 </table>
                 <div className="mt-4 text-xs"><p className="font-bold">Key:</p><p>B: Beginner | P: Proficient | A: Advanced</p></div>
                 <footer className="mt-auto pt-16 flex justify-between items-end"><div className="text-center w-1/3"><div className="border-t-2 border-gray-500 mb-1"></div><p className="font-semibold">Parent's Signature</p></div><div className="text-center w-1/3"><div className="border-t-2 border-gray-500 mb-1"></div><p className="font-semibold">Teacher's Signature</p></div><div className="text-center w-1/3"><div className="border-t-2 border-gray-500 mb-1"></div><p className="font-semibold">Principal's Signature</p></div></footer>
            </div>
         </div>
    );
};

export default HPCMiddleCard;