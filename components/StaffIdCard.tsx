import React from 'react';
import { Staff, SchoolDetails } from '../types';
import { SchoolIcon } from './icons';

interface StaffIdCardProps {
  staff: Staff;
  schoolDetails: SchoolDetails | null;
}

const StaffIdCard: React.FC<StaffIdCardProps> = ({ staff, schoolDetails }) => {
  return (
    <div className="w-[3.375in] h-[2.125in] bg-white rounded-xl flex font-sans text-xs shadow-lg text-slate-800 relative overflow-hidden">
      
      {/* Left Color Panel */}
      <div className="w-1/3 h-full bg-slate-800 flex flex-col justify-between items-center p-3">
         <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-md">
            {staff.photo ? (
                <img src={staff.photo} alt={staff.name} className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                </div>
            )}
         </div>
         <div className="text-center">
            {schoolDetails?.logo ? (
                <img src={schoolDetails.logo} alt="Logo" className="w-10 h-10 object-contain mx-auto" />
            ) : (
                <SchoolIcon className="w-10 h-10 text-white/80 mx-auto" />
            )}
         </div>
      </div>
      
      {/* Right Details Panel */}
      <div className="w-2/3 h-full flex flex-col p-3">
          <header className="text-right">
             <h1 className="font-gothic text-indigo-900 font-bold text-md leading-tight tracking-wider">
                {schoolDetails?.name || 'School Name'}
             </h1>
             <p className="text-[9px] text-slate-500 leading-tight">
                {schoolDetails?.address || 'School Address'}
             </p>
              <p className="text-[8px] text-slate-500 leading-tight">
                Ph: {schoolDetails?.phone || 'N/A'} | {schoolDetails?.email || 'N/A'}
             </p>
          </header>

          <main className="flex-1 flex flex-col justify-center">
              <div>
                  <p className="font-bold text-xl text-slate-900 leading-tight tracking-tight">{staff.name}</p>
                  <p className="font-semibold text-indigo-700">{staff.designation}</p>
              </div>
              <div className="mt-3 space-y-1 text-[10px] border-t border-slate-200 pt-2">
                  <div className="flex">
                      <p className="w-1/3 font-semibold text-slate-500">STAFF ID</p>
                      <p className="font-bold">{staff.staffId}</p>
                  </div>
                  <div className="flex">
                      <p className="w-1/3 font-semibold text-slate-500">D.O.B.</p>
                      <p className="font-bold">{staff.dob}</p>
                  </div>
                  <div className="flex">
                      <p className="w-1/3 font-semibold text-slate-500">CONTACT</p>
                      <p className="font-bold">{staff.contact}</p>
                  </div>
              </div>
          </main>

          <footer className="mt-auto h-4 bg-slate-800 -mx-3 -mb-3 flex items-center justify-center">
             <p className="text-white font-semibold text-[8px] tracking-[.2em]">STAFF IDENTITY CARD</p>
          </footer>
      </div>

    </div>
  );
};

export default StaffIdCard;