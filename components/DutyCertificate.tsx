
import React from 'react';
import { Staff, SchoolDetails } from '../types';
import { formatDateLong } from '../utils/formatters';

interface DutyCertificateProps {
  staff: Staff;
  schoolDetails: SchoolDetails | null;
  dutyDetails: { description: string; date: string };
}

const DutyCertificate: React.FC<DutyCertificateProps> = ({ staff, schoolDetails, dutyDetails }) => {
  return (
    <div className="A4-page-container">
      <div id="duty-certificate" className="w-[210mm] h-[297mm] bg-white p-10 font-serif text-black flex flex-col">
        {/* Watermark Logo */}
        {schoolDetails?.logo && (
            <div className="absolute inset-0 flex items-center justify-center z-0">
                <img src={schoolDetails.logo} alt="Logo" className="w-1/2 max-h-1/2 object-contain opacity-10" />
            </div>
        )}
        <header className="text-center mb-12 z-10">
            {schoolDetails?.logo && (
                <img src={schoolDetails.logo} alt="School Logo" className="w-20 h-20 mx-auto mb-2 object-contain" />
            )}
            <h1 className="text-3xl font-bold uppercase">{schoolDetails?.name || 'School Name'}</h1>
            <p className="text-lg">{schoolDetails?.address || 'School Address'}</p>
            <p className="text-xs text-gray-500 mt-1">
              {schoolDetails?.phone && <span>Ph: {schoolDetails.phone}</span>}
              {schoolDetails?.email && <span className="mx-2">| Email: {schoolDetails.email}</span>}
              {schoolDetails?.udiseCode && <span>| UDISE: {schoolDetails.udiseCode}</span>}
            </p>
        </header>

        <main className="flex-1 text-lg leading-loose z-10">
            <div className="flex justify-between items-center mb-10">
                <span>Certificate No: ............</span>
                <span>Date: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
            </div>
            
            <h2 className="text-2xl font-bold text-center underline decoration-double underline-offset-4 mb-10">
                DUTY CERTIFICATE
            </h2>
            
            <p className="indent-8">
                This is to certify that <strong className="font-bold">{staff.name}</strong>, serving as <strong className="font-bold">{staff.designation}</strong> at this institution, has successfully performed the duty of <strong className="font-bold">{dutyDetails.description}</strong> on <strong className="font-bold">{formatDateLong(dutyDetails.date)}</strong>.
            </p>
            
            <p className="mt-8 indent-8">
                His/Her dedication and commitment to the assigned responsibility are highly appreciated.
            </p>
            
            <p className="mt-8 indent-8">
                This certificate is issued in appreciation of his/her contribution and may be used for all official purposes.
            </p>
        </main>
        
        <footer className="mt-auto pt-24 text-right z-10">
            <div className="inline-block text-center">
                 <div className="border-t-2 border-gray-600 w-64 mb-2"></div>
                 <p className="font-semibold">(Signature)</p>
                 <p className="font-bold">Principal / Head of Institution</p>
                 <p className="text-sm">{schoolDetails?.name || 'School Name'}</p>
            </div>
        </footer>
      </div>
    </div>
  );
};

export default DutyCertificate;
