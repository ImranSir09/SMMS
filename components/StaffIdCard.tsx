import React from 'react';
import { Staff, SchoolDetails } from '../types';

interface StaffIdCardProps {
  staff: Staff;
  schoolDetails: SchoolDetails | null;
}

const StaffIdCard: React.FC<StaffIdCardProps> = ({ staff, schoolDetails }) => {
  return (
    <div className="w-[3.375in] h-[2.125in] bg-white rounded-lg shadow-xl flex flex-col font-sans text-slate-900 overflow-hidden border border-slate-200">
      
      {/* Header */}
      <header className="p-2 bg-slate-800 text-white text-center text-[9px] font-bold tracking-widest">
         STAFF IDENTITY CARD
      </header>
      
      {/* Body Content */}
      <main className="flex-1 p-3 flex items-center gap-3">
          {/* Photo */}
          <div className="w-24 h-24 flex-shrink-0">
            {staff.photo ? (
                <img src={staff.photo} alt={staff.name} className="w-full h-full rounded-full object-cover border-4 border-slate-200" />
            ) : (
                <div className="w-full h-full rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                </div>
            )}
          </div>
          
          {/* Details */}
          <div className="flex-1 text-[10px]">
              <p className="font-bold text-lg text-slate-800 leading-tight tracking-tight">{staff.name}</p>
              <p className="font-semibold text-indigo-700 mb-2">{staff.designation}</p>

              <div className="grid grid-cols-[max-content_auto] gap-x-3 gap-y-1">
                  <p className="font-semibold text-slate-500">STAFF ID:</p>
                  <p className="font-bold">{staff.staffId}</p>
                  
                  <p className="font-semibold text-slate-500">D.O.B:</p>
                  <p className="font-bold">{staff.dob}</p>

                  <p className="font-semibold text-slate-500">CONTACT:</p>
                  <p className="font-bold">{staff.contact}</p>
              </div>
          </div>
      </main>
      
      {/* Footer */}
      <footer className="flex items-center gap-2 p-2 bg-slate-100 border-t border-slate-200">
          {schoolDetails?.logo ? (
              <img src={schoolDetails.logo} alt="Logo" className="w-8 h-8 object-contain flex-shrink-0" />
          ) : (
              <div className="w-8 h-8 bg-slate-200 rounded-md"></div>
          )}
          <div>
            <p className="font-gothic font-bold text-xs leading-tight text-slate-800">
                {schoolDetails?.name || 'School Name'}
            </p>
            <p className="text-[8px] text-slate-600 leading-tight">
                {schoolDetails?.phone || ''}
            </p>
          </div>
      </footer>
    </div>
  );
};

export default StaffIdCard;