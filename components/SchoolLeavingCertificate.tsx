import React from 'react';
import { Student, SchoolDetails } from '../types';
import { formatDateLong } from '../utils/formatters';

interface SchoolLeavingCertificateProps {
  student: Student;
  schoolDetails: SchoolDetails | null;
  leavingDetails: { leavingDate: string; reasonForLeaving: string };
}

const SchoolLeavingCertificate: React.FC<SchoolLeavingCertificateProps> = ({ student, schoolDetails, leavingDetails }) => {
  return (
    <div className="A4-page-container">
      <div id="school-leaving-certificate" className="w-[210mm] h-[297mm] bg-white p-8 flex flex-col font-serif text-black relative">
        {/* Watermark Logo */}
        {schoolDetails?.logo && (
            <div className="absolute inset-0 flex items-center justify-center z-0">
                <img src={schoolDetails.logo} alt="Logo" className="w-2/3 h-2/3 object-contain opacity-10" />
            </div>
        )}
        <div className="w-full h-full border-4 border-double border-gray-800 p-6 flex flex-col z-10">
            <header className="text-center mb-8">
                {schoolDetails?.logo && (
                    <img src={schoolDetails.logo} alt="School Logo" className="w-24 h-24 mx-auto mb-2 object-contain" />
                )}
                <h1 className="text-4xl font-bold text-gray-900 tracking-wider">
                    {schoolDetails?.name || 'School Name'}
                </h1>
                <p className="text-md text-gray-600">{schoolDetails?.address || 'School Address'}</p>
                 <p className="text-xs text-gray-500 mt-1">
                  {schoolDetails?.phone && <span>Ph: {schoolDetails.phone}</span>}
                  {schoolDetails?.email && <span className="mx-2">| Email: {schoolDetails.email}</span>}
                  {schoolDetails?.udiseCode && <span>| UDISE: {schoolDetails.udiseCode}</span>}
                </p>
                <h2 className="text-2xl font-semibold tracking-widest text-gray-800 mt-10 underline">
                    SCHOOL LEAVING CERTIFICATE
                </h2>
                <p className="text-sm mt-1">(Also known as Transfer Certificate)</p>
            </header>

            <main className="flex-1 text-lg leading-relaxed">
                <div className="grid grid-cols-[max-content_auto] gap-x-6 gap-y-4">
                    <span className="font-semibold">Admission No:</span>
                    <span className="border-b border-dotted border-gray-500">{student.admissionNo}</span>
                    
                    <span className="font-semibold">Student Name:</span>
                    <span className="border-b border-dotted border-gray-500 font-bold">{student.name}</span>

                    <span className="font-semibold">Father's Name:</span>
                    <span className="border-b border-dotted border-gray-500">{student.fathersName}</span>
                    
                    <span className="font-semibold">Date of Birth:</span>
                    <span className="border-b border-dotted border-gray-500">{formatDateLong(student.dob)}</span>
                    
                    <span className="font-semibold">Date of Admission:</span>
                    <span className="border-b border-dotted border-gray-500">{student.admissionDate ? formatDateLong(student.admissionDate) : 'N/A'}</span>
                    
                    <span className="font-semibold">Class Last Attended:</span>
                    <span className="border-b border-dotted border-gray-500">{student.className}</span>

                    <span className="font-semibold">Date of Leaving:</span>
                    <span className="border-b border-dotted border-gray-500">{formatDateLong(leavingDetails.leavingDate)}</span>
                    
                    <span className="font-semibold">Reason for Leaving:</span>
                    <span className="border-b border-dotted border-gray-500">{leavingDetails.reasonForLeaving || 'Personal'}</span>
                </div>
                 <p className="mt-8">This certificate is issued upon the request of the guardian.</p>
                 <p className="mt-2">I wish the student all the best in their future endeavors.</p>
            </main>

            <footer className="mt-auto flex justify-between items-end pt-8 pb-2">
                <div className="text-left text-sm text-gray-600">
                    <p>Place: {schoolDetails?.address.split(',').pop()?.trim() || 'School City'}</p>
                    <p>Date of Issue: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                </div>
                <div className="text-center">
                    <div className="border-t-2 border-gray-500 w-56 mt-16 mb-2"></div>
                    <p className="font-semibold">Principal / Headmaster</p>
                </div>
            </footer>
        </div>
      </div>
    </div>
  );
};

export default SchoolLeavingCertificate;