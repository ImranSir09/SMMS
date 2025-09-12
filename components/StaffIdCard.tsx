import React from 'react';
import { Staff, SchoolDetails } from '../types';
import { SchoolIcon } from './icons';

interface StaffIdCardProps {
  staff: Staff;
  schoolDetails: SchoolDetails | null;
}

const StaffIdCard: React.FC<StaffIdCardProps> = ({ staff, schoolDetails }) => {
  return (
    <div className="w-[2.125in] h-[3.375in] bg-white rounded-lg flex flex-col font-sans text-xs shadow-xl text-black overflow-hidden">
      {/* Header Bar */}
      <div className="h-28 bg-slate-800 flex flex-col items-center justify-center p-2 text-white text-center">
        {schoolDetails?.logo ? (
            <img src={schoolDetails.logo} alt="Logo" className="w-12 h-12 object-contain" />
        ) : (
            <SchoolIcon className="w-12 h-12" />
        )}
         <h1 className="text-sm font-bold uppercase leading-tight mt-1">{schoolDetails?.name || 'School Name'}</h1>
      </div>
      
      {/* Photo Section */}
      <div className="flex-shrink-0 flex justify-center -mt-12">
        {staff.photo ? (
            <img src={staff.photo} alt={staff.name} className="w-24 h-24 object-cover border-4 border-white rounded-full shadow-lg" />
        ) : (
            <div className="w-24 h-24 bg-gray-200 flex items-center justify-center text-gray-500 rounded-full border-4 border-white shadow-lg">No Photo</div>
        )}
      </div>

      {/* Body */}
      <main className="flex-1 flex flex-col items-center p-2 text-center">
        <div className="mt-1">
            <p className="font-bold text-lg text-slate-900 leading-tight">{staff.name}</p>
            <p className="font-semibold text-indigo-700">{staff.designation}</p>
        </div>
        <div className="text-left w-full mt-4 space-y-2 text-[11px] px-2">
             <div className="border-b border-slate-200 pb-1">
                <p className="font-semibold text-gray-500">Staff ID:</p>
                <p className="font-bold">{staff.staffId}</p>
            </div>
             <div className="border-b border-slate-200 pb-1">
                <p className="font-semibold text-gray-500">D.O.B:</p>
                <p className="font-bold">{staff.dob}</p>
            </div>
             <div className="border-b border-slate-200 pb-1">
                <p className="font-semibold text-gray-500">Contact:</p>
                <p className="font-bold">{staff.contact}</p>
            </div>
        </div>
      </main>

       {/* Footer */}
       <footer className="text-center p-2 mt-auto bg-slate-100">
         <p className="text-sm font-semibold text-slate-800">STAFF IDENTITY CARD</p>
       </footer>
    </div>
  );
};

export default StaffIdCard;