
import React from 'react';
import { Staff, SchoolDetails } from '../types';
import { formatDateLong } from '../utils/formatters';

interface ChargeCertificateProps {
  staff: Staff;
  schoolDetails: SchoolDetails | null;
  chargeDetails: { chargeName: string; date: string };
}

const ChargeCertificate: React.FC<ChargeCertificateProps> = ({ staff, schoolDetails, chargeDetails }) => {
  return (
    <div className="A4-page-container">
      <div id="charge-certificate" className="w-[210mm] h-auto min-h-[297mm] bg-white p-10 font-serif text-black flex flex-col relative">
        {/* Watermark Logo */}
        {schoolDetails?.logo && (
            <div className="absolute inset-0 flex items-center justify-center z-0">
                <img src={schoolDetails.logo} alt="Logo" className="w-1/2 max-h-1/2 object-contain opacity-10" />
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
          <h2 className="text-2xl font-semibold mt-8 underline decoration-double underline-offset-4">Charge Certificate</h2>
        </header>

        <main className="flex-1 text-lg leading-loose z-10">
            <div className="flex justify-between items-center mb-10">
                <span>Ref. No.: ............</span>
                <span>Date: {formatDateLong(new Date().toISOString().split('T')[0])}</span>
            </div>
            <p>
                This is to certify that <strong className="font-bold">{staff.name}</strong>, ({staff.designation}), has been handed over the charge of <strong className="font-bold">{chargeDetails.chargeName}</strong> with effect from <strong className="font-bold">{formatDateLong(chargeDetails.date)}</strong>.
            </p>
            
            <p className="mt-6">
                All relevant documents, records, and responsibilities associated with this charge have been transferred to him/her. He/She is now fully responsible for the duties and functions pertaining to this role.
            </p>
        </main>
        
        <footer className="mt-auto pt-24 flex justify-between items-end z-10">
            <div className="text-center">
                 <div className="border-t-2 border-gray-600 w-56 mb-2"></div>
                 <p className="font-semibold">Signature</p>
                 <p>({staff.name}, {staff.designation})</p>
            </div>
             <div className="text-center">
                 <div className="border-t-2 border-gray-600 w-56 mb-2"></div>
                 <p className="font-semibold">Signature</p>
                 <p>(Head of Institution)</p>
            </div>
        </footer>
      </div>
    </div>
  );
};

export default ChargeCertificate;
