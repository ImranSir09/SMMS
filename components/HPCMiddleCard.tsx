

import React from 'react';
import { Student, SchoolDetails, HPCReportData } from '../types';

interface HPCMiddleCardProps {
  student: Student;
  schoolDetails: SchoolDetails;
  hpcData: HPCReportData;
}

const STAGE_CONFIG = {
    Middle: {
        domains: ['Humanities', 'Science', 'Mathematics', 'Vocational Education', 'Arts', 'Sports'],
        aspects: {
            self: ['My Strengths', 'My Barriers', 'My Goals'],
            peer: ['Strengths of My Friend', 'Suggestions for My Friend'],
            teacher: ['Teacher\'s Observations on Student\'s Personality Traits']
        }
    },
};

const HPCMiddleCard: React.FC<HPCMiddleCardProps> = ({ student, schoolDetails, hpcData }) => {

    const DetailBox: React.FC<{ label: string; value: string | undefined; className?: string }> = ({ label, value, className }) => (
        <div className={`flex items-baseline ${className}`}>
            <span className="font-semibold w-28 flex-shrink-0 text-gray-800">{label}:</span>
            <span className="flex-1 border-b border-dotted border-gray-500 pl-1">{value || ''}</span>
        </div>
    );
    
    const SummaryRow: React.FC<{ domain: string }> = ({ domain }) => {
        const summary = hpcData.summaries[domain] || {};
        return (
             <tr className="text-center">
                <td className="border p-1 text-left font-semibold">{domain}</td>
                <td className="border p-1 h-10 text-left align-top text-[10px] leading-tight">{summary.awareness}</td>
            </tr>
        );
    };

    const AssessmentBox: React.FC<{ title: string; aspects: string[]; data: { [key: string]: string } | undefined }> = ({ title, aspects, data }) => (
        <div className="border border-gray-400 p-2 h-full flex flex-col">
            <h4 className="font-bold text-center mb-1">{title}</h4>
            <div className="flex-grow space-y-1">
                {aspects.map(aspect => (
                    <div key={aspect}>
                        <p className="font-semibold mt-1">{aspect}:</p>
                        <p className="border-b border-dotted min-h-[1.5rem]">{data?.[aspect] || ''}</p>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="text-black font-sans leading-tight text-[10px]">
            <div className="A4-page bg-white shadow-lg p-6 flex flex-col my-4">
                 <header className="text-center mb-4">
                    <h1 className="text-lg font-bold">HOLISTIC PROGRESS CARD (HPC) - MIDDLE STAGE</h1>
                    <p className="text-base">Academic Year: {hpcData.academicYear}</p>
                 </header>

                 <section className="border-2 border-purple-600 p-3 rounded-md">
                    <h2 className="text-center font-bold text-base text-purple-700 mb-2">PART-A: GENERAL INFORMATION</h2>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                        <DetailBox label="School Name" value={schoolDetails.name} className="col-span-2" />
                        <DetailBox label="Student's Name" value={student.name} />
                        <DetailBox label="Admission No." value={student.admissionNo} />
                    </div>
                 </section>
                 
                 <section className="border-2 border-purple-600 p-2 rounded-md mt-3">
                    <h2 className="text-center font-bold text-base text-purple-700 mb-2">PART-B: STUDENT'S PROGRESS IN VARIOUS DOMAINS</h2>
                     <table className="w-full border-collapse border border-gray-400">
                         <thead className="bg-purple-100 text-sm">
                            <tr>
                                <th className="border p-1 w-1/4">Domains</th>
                                <th className="border p-1">Teacher's Remarks on Progress</th>
                            </tr>
                        </thead>
                         <tbody>{STAGE_CONFIG.Middle.domains.map(domain => (<SummaryRow key={domain} domain={domain} />))}</tbody>
                     </table>
                 </section>

                  <section className="border-2 border-purple-600 p-3 rounded-md mt-3 flex-grow">
                    <h2 className="text-center font-bold text-base text-purple-700 mb-2">PART-C: STUDENT'S SELF, PEER & TEACHER ASSESSMENT</h2>
                    <div className="grid grid-cols-3 gap-2 h-full">
                        <AssessmentBox title="Self Assessment" aspects={STAGE_CONFIG.Middle.aspects.self} data={hpcData.middleData?.selfAssessment} />
                        <AssessmentBox title="Peer Assessment" aspects={STAGE_CONFIG.Middle.aspects.peer} data={hpcData.middleData?.peerAssessment} />
                        <AssessmentBox title="Teacher Assessment" aspects={STAGE_CONFIG.Middle.aspects.teacher} data={hpcData.middleData?.teacherAssessment} />
                    </div>
                  </section>
                 
                 <footer className="mt-auto pt-8 flex justify-between items-end">
                    <div className="text-center w-1/3"><div className="border-t-2 border-gray-500 mb-1"></div><p className="font-semibold">Parent's Signature</p></div>
                    <div className="text-center w-1/3"><div className="border-t-2 border-gray-500 mb-1"></div><p className="font-semibold">Teacher's Signature</p></div>
                    <div className="text-center w-1/3"><div className="border-t-2 border-gray-500 mb-1"></div><p className="font-semibold">Principal's Signature</p></div>
                </footer>
            </div>
        </div>
    );
};

export default HPCMiddleCard;