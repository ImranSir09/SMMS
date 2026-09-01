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
      <div id="roll-statement" className="w-[210mm] h-auto min-h-[297mm] bg-white p-8 font-sans text-slate-900 flex flex-col border border-slate-200">
        
        {/* Header */}
        <header className="text-center mb-6 border-b-2 border-slate-800 pb-4">
          <div className="flex flex-col items-center">
            {schoolDetails?.logo && (
              <img src={schoolDetails.logo} alt="School Logo" className="w-20 h-20 mb-2 object-contain" />
            )}
            <h1 className="text-2xl font-bold uppercase tracking-wider text-slate-900 font-serif">
              {schoolDetails?.name || 'School Name'}
            </h1>
            <p className="text-sm text-slate-700 mt-1 font-medium">{schoolDetails?.address || 'School Address'}</p>
            <div className="flex items-center justify-center gap-3 text-xs text-slate-500 mt-1">
              {schoolDetails?.udiseCode && <span>UDISE: <strong>{schoolDetails.udiseCode}</strong></span>}
              {schoolDetails?.phone && <span>| Ph: <strong>{schoolDetails.phone}</strong></span>}
              {schoolDetails?.email && <span>| Email: <strong>{schoolDetails.email}</strong></span>}
            </div>
            <div className="mt-4 inline-block bg-slate-900 text-white text-sm font-semibold px-5 py-1 rounded-full uppercase tracking-wider">
              Class Roll Statement — Class {className}
            </div>
          </div>
        </header>
        
        {/* Main Table */}
        <main className="flex-1 my-2">
          <div className="flex justify-between items-center mb-2 px-1">
            <span className="text-xs font-semibold uppercase text-slate-600">Student Roster</span>
            <span className="text-xs font-bold text-slate-700">Total: {students.length} Students</span>
          </div>

          <table className="w-full border-collapse border border-slate-300 text-xs">
            <thead>
              <tr className="bg-slate-800 text-white">
                <th className="border border-slate-400 p-2 font-semibold text-center w-14">Roll No</th>
                <th className="border border-slate-400 p-2 font-semibold text-center w-20">Adm. No</th>
                <th className="border border-slate-400 p-2 font-semibold text-left">Student Name</th>
                <th className="border border-slate-400 p-2 font-semibold text-left">Father's Name</th>
                <th className="border border-slate-400 p-2 font-semibold text-center w-16">Gender</th>
                <th className="border border-slate-400 p-2 font-semibold text-center w-20">Category</th>
                <th className="border border-slate-400 p-2 font-semibold text-center w-24">D.O.B</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, idx) => (
                <tr key={student.id || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="border border-slate-300 p-2 text-center font-bold text-slate-800">{student.rollNo || '-'}</td>
                  <td className="border border-slate-300 p-2 text-center text-slate-700">{student.admissionNo || '-'}</td>
                  <td className="border border-slate-300 p-2 text-left font-bold text-slate-900">{student.name}</td>
                  <td className="border border-slate-300 p-2 text-left text-slate-700">{student.fathersName}</td>
                  <td className="border border-slate-300 p-2 text-center text-slate-700">{student.gender || '-'}</td>
                  <td className="border border-slate-300 p-2 text-center text-slate-700">{student.category || 'General'}</td>
                  <td className="border border-slate-300 p-2 text-center text-slate-700">{student.dob || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </main>
        
        {/* Footer */}
        <footer className="mt-auto pt-8 text-xs text-slate-600 flex justify-between items-end">
          <div className="space-y-1">
            <p><span className="font-semibold text-slate-800">Date:</span> {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
            <p><span className="font-semibold text-slate-800">Total Enrolled:</span> {students.length} Students</p>
          </div>
          <div className="text-center">
            <div className="border-t-2 border-slate-800 w-48 mb-1"></div>
            <p className="font-bold text-sm text-slate-900">Principal / Headmaster</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">(Signature & Seal)</p>
          </div>
        </footer>
        <p className="text-center text-[8px] text-slate-400 mt-4 border-t border-slate-200 pt-1">
          School Management Mobile System — Official Report
        </p>
      </div>
    </div>
  );
};

export default RollStatement;
