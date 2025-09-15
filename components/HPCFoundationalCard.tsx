import React from 'react';
import { Student, SchoolDetails, HPCReportData } from '../types';

interface HPCFoundationalCardProps {
  student: Student;
  schoolDetails: SchoolDetails;
  hpcData: HPCReportData;
}

const STAGE_CONFIG = {
    Foundational: {
        domains: ['Physical Development', 'Socio-emotional Development', 'Cognitive Development', 'Language and Literacy', 'Aesthetic & Cultural', 'Positive Learning Habits'],
    },
};

const HPCFoundationalCard: React.FC<HPCFoundationalCardProps> = ({ student, schoolDetails, hpcData }) => {

    const DetailBox: React.FC<{ label: string; value: string | undefined; className?: string }> = ({ label, value, className }) => (
        <div className={`flex items-baseline ${className}`}>
            <span className="font-semibold w-28 flex-shrink-0 text-gray-800">{label}:</span>
            <span className="flex-1 border-b border-dotted border-gray-500 pl-1">{value || ''}</span>
        </div>
    );
    
    const SummaryRow: React.FC<{ domain: string }> = ({ domain }) => {
        const summary = hpcData.summaries[domain];
        const ratingMap = { Stream: 'S', Mountain: 'M', Sky: 'A' }; // Short codes for the circles
        return (
             <tr className="text-center">
                <td className="border p-1 text-left font-semibold">{domain}</td>
                <td className="border p-1">
                    <div className="flex justify-center items-center gap-1">
                        {['Stream', 'Mountain', 'Sky'].map(level => (
                            <div key={level} className={`w-5 h-5 rounded-full border-2 flex items-center justify-center font-bold text-xs ${summary?.awareness === level ? 'bg-orange-400 border-orange-600 text-white' : 'border-gray-400'}`}>
                                {ratingMap[level as keyof typeof ratingMap]}
                            </div>
                        ))}
                    </div>
                </td>
                <td className="border p-1">
                     <div className="flex justify-center items-center gap-1">
                        {['Stream', 'Mountain', 'Sky'].map(level => (
                            <div key={level} className={`w-5 h-5 rounded-full border-2 flex items-center justify-center font-bold text-xs ${summary?.sensitivity === level ? 'bg-orange-400 border-orange-600 text-white' : 'border-gray-400'}`}>
                                {ratingMap[level as keyof typeof ratingMap]}
                            </div>
                        ))}
                    </div>
                </td>
                <td className="border p-1">
                    <div className="flex justify-center items-center gap-1">
                        {['Stream', 'Mountain', 'Sky'].map(level => (
                            <div key={level} className={`w-5 h-5 rounded-full border-2 flex items-center justify-center font-bold text-xs ${summary?.creativity === level ? 'bg-orange-400 border-orange-600 text-white' : 'border-gray-400'}`}>
                                {ratingMap[level as keyof typeof ratingMap]}
                            </div>
                        ))}
                    </div>
                </td>
                <td className="border p-1 text-left text-[10px] leading-tight min-h-[3rem] align-top">{hpcData.foundationalData?.domainAssessments?.[domain]?.observationalNotes || ''}</td>
            </tr>
        );
    };

    return (
        <div className="text-black font-sans leading-tight text-[10px]">
            {/* Page 1: General Information */}
            <div className="A4-page bg-white shadow-lg p-6 flex flex-col my-4">
                 <header className="text-center mb-4">
                    <h1 className="text-lg font-bold">HOLISTIC PROGRESS CARD (HPC) - FOUNDATIONAL STAGE</h1>
                    <p className="text-base">Academic Year: {hpcData.academicYear}</p>
                 </header>

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
                 
                 <section className="border-2 border-orange-500 p-2 rounded-md mt-3">
                    <h2 className="text-center font-bold text-base text-orange-700 mb-2">ATTENDANCE</h2>
                     <table className="w-full border-collapse border border-gray-400">
                        <thead><tr className="bg-orange-100">{['Month', 'Working Days', 'Days Present', '%'].map(h => <th key={h} className="border border-gray-400 p-1 font-semibold">{h}</th>)}</tr></thead>
                        <tbody>
                            {['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'].map(month => {
                                const data = hpcData.attendance?.[month.toLowerCase()];
                                const percentage = (data && data.working && data.working > 0) ? (((data.present || 0) / data.working) * 100).toFixed(0) + '%' : '-';
                                return (<tr key={month} className="text-center"><td className="border border-gray-400 p-0.5 font-semibold">{month}</td><td className="border border-gray-400 p-0.5 h-6">{data?.working || ''}</td><td className="border border-gray-400 p-0.5">{data?.present || ''}</td><td className="border border-gray-400 p-0.5">{percentage}</td></tr>);
                            })}
                        </tbody>
                     </table>
                 </section>

                  <section className="border-2 border-orange-500 p-3 rounded-md mt-3 flex-grow flex flex-col">
                    <h2 className="text-center font-bold text-base text-orange-700 mb-2">HEALTH STATUS / INTERESTS</h2>
                    <DetailBox label="Health Notes" value={hpcData.healthNotes} />
                    <div className="mt-2 flex-grow"><span className="font-semibold text-gray-800">Student's Interests:</span><p className="p-2 border border-dotted border-gray-500 min-h-[4rem] mt-1">{hpcData.foundationalData?.interests?.join(', ')}</p></div>
                  </section>
            </div>

            {/* Page 2: Summary */}
            <div className="A4-page bg-white shadow-lg p-6 flex flex-col my-4">
                 <header className="text-center mb-4"><h1 className="text-lg font-bold">PART-C: SUMMARY FOR THE ACADEMIC YEAR</h1></header>
                 <table className="w-full border-collapse border border-gray-400">
                     <thead className="bg-orange-100 text-sm"><tr><th className="border p-1 w-1/4">Domains of Development</th><th className="border p-1">Awareness</th><th className="border p-1">Sensitivity</th><th className="border p-1">Creativity</th><th className="border p-1 w-1/3">Key Performance Descriptors (Teacher's Notes)</th></tr></thead>
                     <tbody>{STAGE_CONFIG.Foundational.domains.map(domain => (<SummaryRow key={domain} domain={domain} />))}</tbody>
                 </table>
                 <div className="mt-4"><p className="font-bold">Key:</p><p><span className="font-bold inline-block w-5 text-center">S</span> = Stream (Beginning to develop ability)</p><p><span className="font-bold inline-block w-5 text-center">M</span> = Mountain (Developing ability well)</p><p><span className="font-bold inline-block w-5 text-center">A</span> = Sky (Achieved desired learning outcome)</p></div>
                 <footer className="mt-auto pt-16 flex justify-between items-end"><div className="text-center w-1/3"><div className="border-t-2 border-gray-500 mb-1"></div><p className="font-semibold">Parent's Signature</p></div><div className="text-center w-1/3"><div className="border-t-2 border-gray-500 mb-1"></div><p className="font-semibold">Teacher's Signature</p></div><div className="text-center w-1/3"><div className="border-t-2 border-gray-500 mb-1"></div><p className="font-semibold">Principal's Signature</p></div></footer>
            </div>
        </div>
    );
};

export default HPCFoundationalCard;