
import React from 'react';
import { Staff, SchoolDetails } from '../types';
import { formatDateLong } from '../utils/formatters';

interface DutySlipProps {
  staff: Staff;
  schoolDetails: SchoolDetails | null;
  dutyDetails: { description: string; date: string };
}

const DutySlip: React.FC<DutySlipProps> = ({ staff, schoolDetails, dutyDetails }) => {
  return (
    <div className="A4-page-container">
      <div id="duty-slip" className="w-[210mm] h-auto min-h-[297mm] bg-white p-10 font-serif text-black flex flex-col relative">
        {/* Watermark Logo */}
        {schoolDetails?.logo && (
            <div className="absolute inset-0 flex items-center justify-center z-0">
                <img src={schoolDetails.logo} alt="Logo" className="w-1/2 h-1/2 object-contain opacity-10" />
            </div>
        )}
        <header className="text-center mb-10 z-10">
            {schoolDetails?.logo && (
                <img src={schoolDetails.logo} alt="School Logo" className="w-24 h-24 mx-auto mb-2 object-contain" />
            )}
          <h1 className="text-3xl font-bold uppercase">{schoolDetails?.name || 'School Name'}</h1>
          <p className="text-lg">{schoolDetails?.address || 'School Address'}</p>
           <p className="text-xs text-gray-500 mt-1">
              {schoolDetails?.phone && <span>Ph: {schoolDetails.phone}</span>}
              {schoolDetails?.email && <span className="mx-2">| Email: {schoolDetails.email}</span>}
              {schoolDetails?.udiseCode && <span>| UDISE: {schoolDetails.udiseCode}</span>}
            </p>
          <h2 className="text-2xl font-semibold mt-8 underline decoration-wavy underline-offset-4">Duty Slip</h2>
        </header>

        <main className="flex-1 text-lg leading-relaxed z-10">
            <p className="mb-6">Date: {formatDateLong(new Date().toISOString().split('T')[0])}</p>
            <p className="mb-4">This is to certify that <strong className="font-bold">{staff.name}</strong>, {staff.designation}, is assigned the following duty:</p>
            
            <div className="my-6 p-4 border-2 border-dashed border-gray-400">
                <p><strong className="font-semibold">Duty:</strong> {dutyDetails.description}</p>
                <p><strong className="font-semibold">Date of Duty:</strong> {formatDateLong(dutyDetails.date)}</p>
            </div>

            <p>He/She is requested to perform the above-mentioned duty with utmost sincerity and diligence.</p>
        </main>
        
        <footer className="mt-auto pt-24 text-right z-10">
            <div className="inline-block text-center">
                 <div className="border-t-2 border-gray-600 w-56 mb-2"></div>
                 <p className="font-semibold">Signature of Head of Institution</p>
            </div>
        </footer>
      </div>
    </div>
  );
};

export default DutySlip;
