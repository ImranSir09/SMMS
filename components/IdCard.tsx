import React from 'react';
import { Student, SchoolDetails } from '../types';
import { SchoolIcon } from './icons';

interface IdCardProps {
  student: Student;
  schoolDetails: SchoolDetails | null;
}

const IdCard: React.FC<IdCardProps> = ({ student, schoolDetails }) => {
  return (
    <div className="w-[3.375in] h-[2.125in] bg-slate-50 rounded-xl p-0 flex font-sans text-xs shadow-lg text-slate-800 relative overflow-hidden">
      {/* Background Gradient & Shape */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-50 via-white to-white z-0"></div>
      <svg className="absolute bottom-0 left-0 w-full h-full z-10" viewBox="0 0 324 204" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M-50 204C-50 204 193.185 244.333 301.5 133.5C409.815 22.6667 324 0 324 0V204H-50Z" fill="url(#paint0_linear_1_2)"/>
          <defs>
            <linearGradient id="paint0_linear_1_2" x1="137" y1="0" x2="137" y2="204" gradientUnits="userSpaceOnUse">
              <stop stopColor="#4338CA" stopOpacity="0.1"/>
              <stop offset="1" stopColor="#6366F1" stopOpacity="0"/>
            </linearGradient>
          </defs>
      </svg>
      
      {/* Content */}
      <div className="w-full h-full flex z-20">
          {/* Left Side - Details */}
          <div className="w-2/3 flex flex-col p-3">
              <header className="flex items-center gap-2">
                  {schoolDetails?.logo ? (
                      <img src={schoolDetails.logo} alt="Logo" className="w-8 h-8 object-contain" />
                  ) : (
                      <SchoolIcon className="w-8 h-8 text-indigo-700" />
                  )}
                  <div>
                    <p className="font-gothic text-indigo-900 font-bold text-sm leading-tight tracking-wider">
                        {schoolDetails?.name || 'School Name'}
                    </p>
                    <p className="text-[8px] text-indigo-800/90 leading-tight">
                        {schoolDetails?.phone || ''}
                    </p>
                  </div>
              </header>

              <main className="flex-1 flex flex-col justify-center mt-2">
                 <div className="space-y-3">
                    <p className="font-bold text-2xl text-slate-900 leading-tight tracking-tight">{student.name}</p>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px]">
                      <div>
                        <p className="font-semibold text-gray-500">CLASS</p>
                        <p className="font-bold">{student.className} '{student.section}'</p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-500">ROLL NO.</p>
                        <p className="font-bold">{student.rollNo}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-500">ADM. NO.</p>
                        <p className="font-bold">{student.admissionNo}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-500">D.O.B.</p>
                        <p className="font-bold">{student.dob}</p>
                      </div>
                    </div>
                 </div>
              </main>

              <footer className="mt-auto pt-2">
                 <p className="font-semibold text-indigo-800/80 text-[9px] tracking-widest border-t border-indigo-200 pt-1">STUDENT IDENTITY CARD</p>
              </footer>
          </div>
          
          {/* Right Side - Photo */}
          <div className="w-1/3 flex-shrink-0">
             {student.photo ? (
                <img
                  src={student.photo}
                  alt={student.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-500 text-center p-2">
                  No Photo
                </div>
              )}
          </div>
      </div>
    </div>
  );
};

export default IdCard;