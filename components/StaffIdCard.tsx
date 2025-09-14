import React from 'react';
import { Staff, SchoolDetails } from '../types';

interface StaffIdCardProps {
  staff: Staff;
  schoolDetails: SchoolDetails | null;
}

const StaffIdCard: React.FC<StaffIdCardProps> = ({ staff, schoolDetails }) => {

  const CardFront = () => (
    <div className="w-[3.375in] h-[2.125in] bg-white rounded-lg shadow-xl flex flex-col font-sans text-slate-900 overflow-hidden border border-slate-200">
      {/* Top Bar */}
      <div className="flex items-center p-2 bg-gradient-to-r from-slate-50 to-gray-100">
        {schoolDetails?.logo && (
          <img src={schoolDetails.logo} alt="Logo" className="w-10 h-10 object-contain" />
        )}
        <div className="ml-2 text-right flex-1">
          <p className="font-bold text-sm text-gray-800 leading-tight">
            {schoolDetails?.name || 'School Name'}
          </p>
        </div>
      </div>

      {/* Center Section */}
      <main className="flex-1 flex flex-col items-center justify-center pt-1 text-center bg-gray-50">
        <div className="w-24 h-24 rounded-full p-1 border-2 border-gray-500 shadow-lg">
          {staff.photo ? (
            <img src={staff.photo} alt={staff.name} className="w-full h-full object-cover rounded-full" />
          ) : (
            <div className="w-full h-full rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-xs">No Photo</div>
          )}
        </div>
        <h2 className="text-xl font-bold mt-2 text-slate-800">{staff.name}</h2>
        <p className="text-sm text-slate-500">{staff.designation}</p>
      </main>

      {/* Bottom Bar */}
      <footer className="p-2 flex items-center justify-between bg-slate-100 text-xs">
        <div>
          <p className="font-semibold text-slate-500">Staff ID</p>
          <p className="font-bold">{staff.staffId}</p>
        </div>
        <div>
          <img 
            src={`https://api.qrserver.com/v1/create-qr-code/?size=40x40&data=${staff.staffId}`} 
            alt="QR Code"
            className="w-10 h-10"
          />
        </div>
        <div className="text-right">
            <p className="font-semibold text-slate-500">CPIS Code</p>
            <p className="font-bold">{staff.cpisCode || 'N/A'}</p>
        </div>
      </footer>
    </div>
  );

  const CardBack = () => (
    <div className="w-[3.375in] h-[2.125in] bg-white rounded-lg shadow-xl flex flex-col font-sans text-slate-900 overflow-hidden border border-slate-200 relative">
        {/* Watermark */}
        {schoolDetails?.logo && (
            <div className="absolute inset-0 flex items-center justify-center z-0">
                <img src={schoolDetails.logo} alt="Watermark" className="w-32 h-32 object-contain opacity-10" />
            </div>
        )}

      {/* Header */}
      <div className="text-center py-1 bg-slate-100 border-b border-slate-200 z-10">
        <p className="text-xs font-semibold text-slate-600">STAFF INFORMATION</p>
      </div>

      {/* Details Block */}
      <main className="flex-1 p-3 text-xs z-10 space-y-2">
        <div className="grid grid-cols-[max-content_auto] gap-x-2 gap-y-1">
          <strong className="text-slate-500">Date of Birth:</strong>
          <span>{staff.dob}</span>
          <strong className="text-slate-500">Contact:</strong>
          <span>{staff.contact}</span>
          <strong className="text-slate-500">Joining Date:</strong>
          <span>{staff.joiningDate}</span>
          <strong className="text-slate-500">Qualification:</strong>
          <span className="truncate">{staff.qualification}</span>
        </div>
        <div className="pt-4">
          <p className="text-[10px] text-center italic text-slate-500">This card is the property of {schoolDetails?.name} and must be returned upon cessation of employment.</p>
        </div>
      </main>

      {/* Footer Bar */}
      <footer className="p-2 border-t border-slate-200 bg-slate-100 flex justify-between items-center z-10">
        <div className="text-xs">
          <p className="font-bold text-slate-600">{schoolDetails?.name}</p>
          <p className="text-slate-500">Ph: {schoolDetails?.phone}</p>
        </div>
        <div className="text-right">
          {/* Placeholder for signature */}
          <div className="w-24 h-6"></div> 
          <p className="text-[10px] border-t border-slate-400 font-semibold">Principal's Signature</p>
        </div>
      </footer>
    </div>
  );
  
  return (
    <div className="flex flex-col sm:flex-row gap-4 p-2">
      <CardFront />
      <CardBack />
    </div>
  );
};

export default StaffIdCard;