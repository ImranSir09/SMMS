import React from 'react';
import { Student, SchoolDetails } from '../types';

interface ReportProps {
    student: Student;
    schoolDetails: SchoolDetails;
    subject: string;
    session: string;
}

const CoCurricularRecordSheet: React.FC<ReportProps> = ({ student, schoolDetails, subject, session }) => {

    const DetailItem: React.FC<{ label: string; value: string | undefined | null; bold?: boolean }> = ({ label, value, bold }) => (
        <p className="text-lg">
            <span className="font-semibold">{label}:</span>
            <span className={`ml-2 ${bold ? 'font-bold' : ''} underline underline-offset-4 decoration-dotted`}>{value || '___________'}</span>
        </p>
    );

    return (
        <div className="A4-page-container">
            <div id="cocurricular-record-sheet" className="w-[210mm] h-[297mm] bg-white p-6 font-serif text-black flex flex-col relative">
                <div className="absolute inset-2 border-2 border-dashed border-black"></div>
                
                <div className="relative z-10 flex flex-col h-full p-4">
                    <header className="text-center mb-6">
                        {schoolDetails?.logo && (
                            <img src={schoolDetails.logo} alt="School Logo" className="w-24 h-24 mx-auto mb-2 object-contain" />
                        )}
                        <p className="text-sm">Govt. of Jammu and Kashmir</p>
                        <h1 className="text-4xl font-bold tracking-wider">{schoolDetails.name}</h1>
                        <hr className="w-1/2 mx-auto my-2 border-black" />
                        <h2 className="text-xl font-semibold">Format for recording Co-Curricular activities session: {session}</h2>
                    </header>

                    <main className="flex-1">
                        <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-6">
                            <DetailItem label="Name of the Student" value={student.name} bold />
                            <DetailItem label="Class" value={student.className} bold />
                            <DetailItem label="Subject" value={subject} bold />
                            <DetailItem label="Roll No" value={student.rollNo} bold />
                        </div>
                        
                        <table className="w-full border-collapse border border-black text-sm">
                            <thead className="bg-cyan-200">
                                <tr>
                                    <th className="border border-black p-1 font-semibold w-1/5">Domain</th>
                                    <th className="border border-black p-1 font-semibold w-2/5">Aspects Assessed</th>
                                    <th className="border border-black p-1 font-semibold">Max. Marks</th>
                                    <th className="border border-black p-1 font-semibold">Marks Obtained</th>
                                    <th className="border border-black p-1 font-semibold">Remarks</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.from({ length: 15 }).map((_, i) => (
                                    <tr key={`empty-${i}`} style={{ height: '2.5em' }}>
                                        {Array.from({ length: 5 }).map((_, j) => <td key={j} className="border border-black"></td>)}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </main>

                    <footer className="mt-auto pt-24 flex justify-between items-end">
                         <div className="text-center">
                            <p className="border-t border-black pt-1 px-8 font-semibold">Signature of Incharge Teacher</p>
                        </div>
                        <div className="text-center">
                            <p className="border-t border-black pt-1 px-8 font-semibold">Principal/Headmaster</p>
                            <p>{schoolDetails.name}</p>
                        </div>
                    </footer>
                </div>
            </div>
        </div>
    );
};

export default CoCurricularRecordSheet;