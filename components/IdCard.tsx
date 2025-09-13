import React from 'react';
import { Student, SchoolDetails } from '../types';

interface IdCardProps {
  student: Student;
  schoolDetails: SchoolDetails | null;
}

const IdCard: React.FC<IdCardProps> = ({ student, schoolDetails }) => {
  return (
    <div className="w-[3.375in] h-[2.125in] bg-white rounded-lg shadow-xl flex flex-col font-sans text-slate-900 overflow-hidden border border-slate-200">
      
      {/* Header */}
      <header className="flex items-center gap-2 p-2 bg-indigo-700 text-white">
          {schoolDetails?.logo ? (
              <div className="w-10 h-10 bg-white rounded-md p-1 flex-shrink-0">
                <img src={schoolDetails.logo} alt="Logo" className="w-full h-full object-contain" />
              </div>
          ) : (
              <div className="w-10 h-10 bg-white rounded-md"></div>
          )}
          <div>
            <p className="font-gothic font-bold text-sm leading-tight tracking-wider">
                {schoolDetails?.name || 'School Name'}
            </p>
            <p className="text-[8px] text-indigo-200 leading-tight">
                {schoolDetails?.address || 'School Address'}
            </p>
          </div>
      </header>
      
      {/* Body Content */}
      <main className="flex flex-1 p-2 gap-2 min-h-0">
          {/* Photo */}
          <div className="w-1/3 flex-shrink-0">
             {student.photo ? (
                <img
                  src={student.photo}
                  alt={student.name}
                  className="w-full h-full object-cover rounded-md border-2 border-slate-200"
                />
              ) : (
                <div className="w-full h-full rounded-md bg-slate-200 flex items-center justify-center text-slate-500 text-center text-xs p-2">
                  No Photo
                </div>
              )}
          </div>

          {/* Details */}
          <div className="flex-1 text-[10px] grid grid-cols-2 gap-x-2 content-start">
              <div className="col-span-2 mb-1">
                  <p className="font-bold text-lg text-indigo-800 leading-tight tracking-tight">{student.name}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-500">CLASS</p>
                <p className="font-bold text-xs">{student.className} '{student.section}'</p>
              </div>
              <div>
                <p className="font-semibold text-slate-500">ROLL NO.</p>
                <p className="font-bold text-xs">{student.rollNo}</p>
              </div>
              <div className="mt-1">
                <p className="font-semibold text-slate-500">ADM. NO.</p>
                <p className="font-bold text-xs">{student.admissionNo}</p>
              </div>
              <div className="mt-1">
                <p className="font-semibold text-slate-500">D.O.B.</p>
                <p className="font-bold text-xs">{student.dob}</p>
              </div>
               <div className="col-span-2 mt-1">
                <p className="font-semibold text-slate-500">FATHER'S NAME</p>
                <p className="font-bold text-xs">{student.fathersName}</p>
              </div>
          </div>
      </main>

      {/* Footer */}
      <footer className="bg-indigo-700 text-white text-center text-[9px] font-bold p-1 tracking-widest">
         STUDENT IDENTITY CARD
      </footer>
    </div>
  );
};

export default IdCard;