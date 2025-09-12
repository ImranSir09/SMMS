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
      <div id="charge-certificate" className="w-[210mm] h-auto min-h-[297mm] bg-white p-10 font-serif text-black flex flex-col">
        <header className="text-center mb-10">
          <h1 className="text-3xl font-bold uppercase">{schoolDetails?.name || 'School Name'}</h1>
          <p className="text-lg">{schoolDetails?.address || 'School Address'}</p>
           <p className="text-xs text-gray-500 mt-1">
              {schoolDetails?.phone && <span>Ph: {schoolDetails.phone}</span>}
              {schoolDetails?.email && <span className="mx-2">| Email: {schoolDetails.email}</span>}
              {schoolDetails?.udiseCode && <span>| UDISE: {schoolDetails.udiseCode}</span>}
            </p>
          <h2 className="text-2xl font-semibold mt-8 underline decoration-double underline-offset-4">Charge Certificate</h2>
        </header>

        <main className="flex-1 text-lg leading-loose">
            <p className="mb-6 text-right">Date: {formatDateLong(new Date().toISOString().split('T')[0])}</p>
            <p>
                This is to certify that <strong className="font-bold">{staff.name}</strong>, ({staff.designation}), has been handed over the charge of <strong className="font-bold">{chargeDetails.chargeName}</strong> with effect from <strong className="font-bold">{formatDateLong(chargeDetails.date)}</strong>.
            </p>
            
            <p className="mt-6">
                All relevant documents, records, and responsibilities associated with this charge have been transferred to him/her.
            </p>
        </main>
        
        <footer className="mt-auto pt-24 flex justify-between items-end">
            <div className="text-center">
                 <div className="border-t-2 border-gray-600 w-56 mb-2"></div>
                 <p className="font-semibold">Signature of Employee</p>
                 <p>({staff.name})</p>
            </div>
             <div className="text-center">
                 <div className="border-t-2 border-gray-600 w-56 mb-2"></div>
                 <p className="font-semibold">Signature of Head of Institution</p>
            </div>
        </footer>
      </div>
    </div>
  );
};

export default ChargeCertificate;