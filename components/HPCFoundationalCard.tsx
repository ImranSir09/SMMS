
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
        const summary = hpcData.summaries[domain] || {};
        
        const renderCircles = (levelValue?: string) => (
             <div className="flex justify-center items-center gap-1">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center font-bold text-xs ${levelValue === 'Stream' ? 'bg-orange-400 border-orange-600' : 'border-gray-400'}`}></div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center font-bold text-xs ${levelValue === 'Mountain' ? 'bg-orange-400 border-orange-600' : 'border-gray-400'}`}></div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center font-bold text-xs ${levelValue === 'Sky' ? 'bg-orange-400 border-orange-600' : 'border-gray-400'}`}></div>
            </div>
        );

        return (
             <tr className="text-center">
                <td className="border p-1 text-left font-semibold">{domain}</td>
                <td className="border p-1">{renderCircles(summary?.awareness)}</td>
                <td className="border p-1">{renderCircles(summary?.sensitivity)}</td>
                <td className="border p-1">{renderCircles(summary?.creativity)}</td>
                <td className="border p-1 text-left text-[10px] leading-tight min-h-[3rem] align-top">{hpcData.foundationalData?.domainAssessments?.[domain]?.observationalNotes || ''}</td>
            </tr>
        );
    };

    return (
        <div className="text-black font-sans leading-tight text-[10px]">
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
                        <thead><tr className="bg-orange-100">{['Month', 'Working Days', 'Days Present'].map(h => <th key={h} className="border border-gray-400 p-1 font-semibold">{h}</th>)}</tr></thead>
                        <tbody>
                            {['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'].map(month => {
                                const data = hpcData.attendance?.[month.toLowerCase()];
                                return (<tr key={month} className="text-center"><td className="border border-gray-400 p-0.5 font-semibold">{month}</td><td className="border border-gray-400 p-0.5 h-6">{data?.working || ''}</td><td className="border border-gray-400 p-0.5">{data?.present || ''}</td></tr>);
                            })}
                        </tbody>
                     </table>
                 </section>

                  <section className="border-2 border-orange-500 p-3 rounded-md mt-3">
                    <h2 className="text-center font-bold text-base text-orange-700 mb-2">HEALTH STATUS / INTERESTS</h2>
                    <DetailBox label="Health Notes" value={hpcData.healthNotes} />
                    <div className="mt-2"><span className="font-semibold text-gray-800">Student's Interests:</span><p className="p-2 border border-dotted border-gray-500 min-h-[2rem] mt-1">{hpcData.foundationalData?.interests?.join(', ')}</p></div>
                  </section>
                 
                 <section className="mt-4 flex-grow flex flex-col">
                    <header className="text-center mb-2"><h1 className="text-lg font-bold">PART-C: SUMMARY FOR THE ACADEMIC YEAR</h1></header>
                     <table className="w-full border-collapse border border-gray-400">
                         <thead className="bg-orange-100 text-sm"><tr><th className="border p-1 w-1/4">Domains of Development</th><th className="border p-1">Awareness</th><th className="border p-1">Sensitivity</th><th className="border p-1">Creativity</th><th className="border p-1 w-1/3">Key Performance Descriptors (Teacher's Notes)</th></tr></thead>
                         <tbody>{STAGE_CONFIG.Foundational.domains.map(domain => (<SummaryRow key={domain} domain={domain} />))}</tbody>
                     </table>
                     <div className="mt-4"><p className="font-bold">Key:</p><p><span className="font-bold inline-block w-5 text-center">Circles represent proficiency:</span> 1st for Stream, 2nd for Mountain, 3rd for Sky.</p></div>
                 </section>

                 <footer className="mt-auto pt-8 flex justify-between items-end"><div className="text-center w-1/3"><div className="border-t-2 border-gray-500 mb-1"></div><p className="font-semibold">Parent's Signature</p></div><div className="text-center w-1/3"><div className="border-t-2 border-gray-500 mb-1"></div><p className="font-semibold">Teacher's Signature</p></div><div className="text-center w-1/3"><div className="border-t-2 border-gray-500 mb-1"></div><p className="font-semibold">Principal's Signature</p></div></footer>
            </div>
        </div>
    );
};

export default HPCFoundationalCard;
