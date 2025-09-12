import React from 'react';
import { Student, SchoolDetails } from '../types';
import { SchoolIcon } from './icons';

interface IdCardProps {
  student: Student;
  schoolDetails: SchoolDetails | null;
}

const IdCard: React.FC<IdCardProps> = ({ student, schoolDetails }) => {
  return (
    <div className="w-[3.375in] h-[2.125in] bg-white border border-gray-300 rounded-xl p-2 flex flex-col font-sans text-xs shadow-lg text-gray-800 relative overflow-hidden">
      {/* Background Watermark Logo */}
      {schoolDetails?.logo && (
        <img
          src={schoolDetails.logo}
          alt="Watermark"
          className="absolute inset-0 w-full h-full object-contain object-center opacity-10 z-0"
        />
      )}

      {/* Header */}
      <header className="flex items-center gap-2 pb-1 border-b-2 border-indigo-800 z-10">
        {schoolDetails?.logo ? (
          <img src={schoolDetails.logo} alt="Logo" className="w-10 h-10 object-contain" />
        ) : (
          <SchoolIcon className="w-10 h-10 text-indigo-800" />
        )}
        <div>
          <h1 className="text-sm font-extrabold text-indigo-900 uppercase tracking-wide leading-tight">
            {schoolDetails?.name || 'School Name'}
          </h1>
          <p className="text-[10px] text-gray-600 leading-tight">
            {schoolDetails?.address || 'School Address'}
          </p>
        </div>
      </header>

      {/* Body */}
      <main className="flex-1 flex pt-2 gap-2 z-10">
        <div className="w-1/3 flex flex-col items-center">
          {student.photo ? (
            <img
              src={student.photo}
              alt={student.name}
              className="w-20 h-24 object-cover border-2 border-indigo-200 rounded-md shadow-md"
            />
          ) : (
            <div className="w-20 h-24 bg-gray-200 flex items-center justify-center text-gray-500 rounded-md border-2 border-indigo-200">
              No Photo
            </div>
          )}
        </div>
        <div className="w-2/3 grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]">
          <div className="col-span-2">
            <p className="font-bold text-lg text-center text-indigo-900 leading-tight">{student.name}</p>
          </div>
          <div>
            <p className="font-semibold text-gray-500">Class:</p>
            <p className="font-bold">{student.className} '{student.section}'</p>
          </div>
          <div>
            <p className="font-semibold text-gray-500">Roll No:</p>
            <p className="font-bold">{student.rollNo}</p>
          </div>
          <div>
            <p className="font-semibold text-gray-500">Adm No:</p>
            <p className="font-bold">{student.admissionNo}</p>
          </div>
          <div>
            <p className="font-semibold text-gray-500">D.O.B:</p>
            <p className="font-bold">{student.dob}</p>
          </div>
          <div className="col-span-2">
            <p className="font-semibold text-gray-500">Guardian:</p>
            <p className="font-bold">{student.guardianInfo}</p>
          </div>
          <div className="col-span-2">
            <p className="font-semibold text-gray-500">Contact:</p>
            <p className="font-bold">{student.contact}</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center pt-1 mt-auto z-10 bg-indigo-800 text-white rounded-b-lg -m-2 mt-2 p-1">
        <p className="text-sm font-semibold tracking-wider">STUDENT IDENTITY CARD</p>
      </footer>
    </div>
  );
};

export default IdCard;
