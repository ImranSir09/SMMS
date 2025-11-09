import React from 'react';
import { Student, SchoolDetails } from '../types';

interface Topper {
  student: Student;
  totalScore: number;
}

interface SubjectTopperListProps {
  toppers: Topper[];
  examName: string;
  subjectName: string;
  schoolDetails: SchoolDetails;
}

const SubjectTopperList: React.FC<SubjectTopperListProps> = ({ toppers, examName, subjectName, schoolDetails }) => {
  return (
    <div className="A4-page-container">
      <div id="topper-list" className="w-[210mm] h-[297mm] bg-white p-6 font-serif text-black flex flex-col relative">
        {/* Decorative Border */}
        <div className="absolute inset-0 border-4 border-blue-800 rounded-lg"></div>
        <div className="absolute inset-2 border-2 border-blue-400 rounded-sm"></div>
        
        {/* Watermark Logo */}
        {schoolDetails?.logo && (
            <div className="absolute inset-0 flex items-center justify-center z-0">
                <img src={schoolDetails.logo} alt="Logo" className="w-1/2 max-h-1/2 object-contain opacity-10" />
            </div>
        )}

        <div className="relative z-10 flex flex-col h-full p-4">
            <header className="text-center mb-10">
                {schoolDetails?.logo && (
                    <img src={schoolDetails.logo} alt="School Logo" className="w-28 h-28 mx-auto mb-2 object-contain" />
                )}
              <h1 className="text-3xl font-bold font-gothic text-blue-900 tracking-wider">{schoolDetails.name}</h1>
              <p className="text-md text-gray-700">Email: {schoolDetails.email} | UDISE: {schoolDetails.udiseCode}</p>
              <h2 className="text-2xl font-semibold mt-8 text-gray-800">Certificate of Academic Excellence</h2>
            </header>

            <main className="flex-1 flex flex-col items-center">
                <p className="text-lg mb-2 text-center max-w-2xl mx-auto">This certificate is proudly awarded in recognition of outstanding academic performance and dedication demonstrated by the following student(s).</p>
                <p className="text-3xl font-bold text-blue-800 mt-4">{subjectName}</p>
                <p className="text-lg mt-1">for the <span className="font-semibold">{examName}</span> examination.</p>
                
                <table className="w-4/5 mt-8 border-collapse text-lg">
                    <thead>
                        <tr className="border-b-2 border-gray-400">
                            <th className="p-2 text-left font-bold w-1/6">Rank</th>
                            <th className="p-2 text-left font-bold">Student Name</th>
                            <th className="p-2 text-right font-bold w-1/4">Score (out of 100)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {toppers.map((topper, index) => (
                            <tr key={topper.student.id} className="border-b border-gray-300">
                                <td className="p-3 font-semibold">{index + 1}</td>
                                <td className="p-3">{topper.student.name}</td>
                                <td className="p-3 text-right font-semibold">{topper.totalScore}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </main>
            
            <footer className="mt-auto pt-16 flex justify-between items-end">
                <div className="text-center text-sm">
                    <p>{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                    <div className="border-t-2 border-gray-500 w-48 mb-1 mt-1"></div>
                    <p className="font-semibold">Date</p>
                </div>
                 <div className="text-center text-sm">
                     <div className="border-t-2 border-gray-500 w-48 mb-1"></div>
                     <p className="font-semibold">Head of Institution</p>
                </div>
            </footer>
            <p className="text-center text-[9px] text-gray-600 mt-2">This document was created from School Management Mobile System by Imran Gani Mugloo Teacher Zone Vailoo</p>
        </div>
      </div>
    </div>
  );
};

export default SubjectTopperList;