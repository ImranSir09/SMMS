import React from 'react';
import { Student, SchoolDetails } from '../types';

interface RollStatementProps {
  students: Student[];
  className: string;
  schoolDetails: SchoolDetails | null;
}

const RollStatement: React.FC<RollStatementProps> = ({ students, className, schoolDetails }) => {
  return (
    <div className="A4-page-container">
      <div id="roll-statement" className="w-[210mm] h-auto min-h-[297mm] bg-white p-8 font-sans text-black flex flex-col">
        <header className="text-center mb-6">
          <h1 className="text-2xl font-bold uppercase">{schoolDetails?.name || 'School Name'}</h1>
          <p className="text-md">{schoolDetails?.address || 'School Address'}</p>
          <p className="text-xs text-gray-600 mt-1">
            Ph: {schoolDetails?.phone} | Email: {schoolDetails?.email} | UDISE: {schoolDetails?.udiseCode}
          </p>
          <h2 className="text-xl font-semibold mt-4">Roll Statement - Class {className}</h2>
        </header>
        
        <main className="flex-1">
          <table className="w-full border-collapse border border-gray-400 text-sm">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-400 p-2 font-semibold">Roll No</th>
                <th className="border border-gray-400 p-2 font-semibold">Admission No</th>
                <th className="border border-gray-400 p-2 font-semibold text-left">Student Name</th>
                <th className="border border-gray-400 p-2 font-semibold text-left">Guardian Info</th>
                <th className="border border-gray-400 p-2 font-semibold">D.O.B</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <tr key={student.id} className="odd:bg-white even:bg-gray-50">
                  <td className="border border-gray-400 p-2 text-center">{student.rollNo}</td>
                  <td className="border border-gray-400 p-2 text-center">{student.admissionNo}</td>
                  <td className="border border-gray-400 p-2 text-left">{student.name}</td>
                  <td className="border border-gray-400 p-2 text-left">{student.guardianInfo}</td>
                  <td className="border border-gray-400 p-2 text-center">{student.dob}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </main>
        
        <footer className="mt-auto pt-8 text-sm text-gray-600 flex justify-between">
          <span>Date: {new Date().toLocaleDateString('en-GB')}</span>
          <span>Total Students: {students.length}</span>
        </footer>
      </div>
    </div>
  );
};

export default RollStatement;