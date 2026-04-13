
import React from 'react';
import { Student, SchoolDetails } from '../types';

interface CoCurricularReportProps {
  student: Student;
  schoolDetails: SchoolDetails;
  subject: string;
  session: string;
}

const CoCurricularReport: React.FC<CoCurricularReportProps> = ({ student, schoolDetails, subject, session }) => {
  const sessionEndYear = parseInt(session.split('-')[0]) + 1;

  return (
    <div className="A4-page-container">
      <div id="co-curricular-report" className="w-[210mm] h-[297mm] bg-white p-4 font-sans text-black flex flex-col">
        <div className="w-full h-full border-4 border-dashed border-black p-4 flex flex-col relative">
          
          {schoolDetails.logo && (
            <img src={schoolDetails.logo} alt="School Logo" className="w-20 h-20 object-contain absolute top-6 left-8" />
          )}

          <header className="text-center mb-4 mt-2">
            <p className="font-semibold text-lg">Govt. of Jammu and Kashmir</p>
            <h1 className="text-4xl font-bold mt-2">{schoolDetails.name}</h1>
            <h2 className="text-lg font-semibold mt-4 border-b-2 border-black inline-block px-4">
              Format for recording Co-Curricular activities session: {sessionEndYear}
            </h2>
          </header>

          <section className="text-lg mb-4 space-y-1 mt-8">
            <p><strong className="font-semibold w-48 inline-block">Name of the Student:</strong> <span className="underline font-bold">{student.name}</span></p>
            <p><strong className="font-semibold w-48 inline-block">Class:</strong> <span className="underline font-bold">{student.className}</span></p>
            <p><strong className="font-semibold w-48 inline-block">Subject:</strong> <span className="underline font-bold">{subject}</span></p>
            <p><strong className="font-semibold w-48 inline-block">Roll No:</strong> <span className="underline font-bold">{student.rollNo}</span></p>
          </section>

          <main className="flex-1">
            <table className="w-full border-collapse border-2 border-black text-lg">
              <thead>
                <tr style={{ backgroundColor: '#a0e9e7' }}>
                  <th className="border-2 border-black p-2 font-bold w-[20%]">Domain</th>
                  <th className="border-2 border-black p-2 font-bold w-[30%]">Aspects Assessed</th>
                  <th className="border-2 border-black p-2 font-bold w-[15%]">Max. Marks</th>
                  <th className="border-2 border-black p-2 font-bold w-[15%]">Marks Obtained</th>
                  <th className="border-2 border-black p-2 font-bold w-[20%]">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {/* Render empty rows as it's a template */}
                {Array.from({ length: 15 }).map((_, index) => (
                  <tr key={index}>
                    <td className="border-2 border-black p-2 h-10">&nbsp;</td>
                    <td className="border-2 border-black p-2">&nbsp;</td>
                    <td className="border-2 border-black p-2">&nbsp;</td>
                    <td className="border-2 border-black p-2">&nbsp;</td>
                    <td className="border-2 border-black p-2">&nbsp;</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </main>

          <footer className="mt-auto pt-16 flex justify-between items-end text-lg">
            <div>
              <p className="font-semibold">Signature of Incharge Teacher</p>
            </div>
            <div className="text-center">
              <p className="font-semibold">Principal/Headmaster</p>
              <p className="text-base">{schoolDetails.name}</p>
            </div>
          </footer>
          <p className="text-center text-[9px] text-gray-600 mt-2">This document was created from School Management Mobile System by Imran Gani Mugloo Teacher Zone Vailoo</p>
        </div>
      </div>
    </div>
  );
};

export default CoCurricularReport;
