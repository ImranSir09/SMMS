
import React from 'react';
import { Student, SchoolDetails } from '../types';
import { formatDateLong } from '../utils/formatters';

interface AdmissionCertificateProps {
  student: Student;
  schoolDetails: SchoolDetails | null;
}

const AdmissionCertificate: React.FC<AdmissionCertificateProps> = ({ student, schoolDetails }) => {
  return (
    <div className="A4-page-container">
      <div id="admission-certificate" className="w-[210mm] h-[297mm] bg-white p-8 flex flex-col font-serif text-black relative">
        {/* Watermark Logo */}
        {schoolDetails?.logo && (
            <div className="absolute inset-0 flex items-center justify-center z-0">
                <img src={schoolDetails.logo} alt="Logo" className="w-2/3 max-h-2/3 object-contain opacity-10" />
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
                    STUDENT ADMISSION CERTIFICATE
                </h2>
                <p className="text-sm mt-1">Academic Year: 2024-25</p>
            </header>

            <main className="flex-1 text-lg leading-relaxed">
                <p className="indent-8">
                    This is to certify that the student whose details are mentioned below has been granted admission to this institution for the academic session.
                </p>
                
                <div className="my-6 p-4 border-y-2 border-dashed border-gray-300 grid grid-cols-[max-content_auto] gap-x-6 gap-y-4">
                    <span className="font-semibold">Full Name:</span>
                    <span className="font-bold">{student.name}</span>

                    <span className="font-semibold">Admission Number:</span>
                    <span>{student.admissionNo}</span>
                    
                    <span className="font-semibold">Class & Section:</span>
                    <span>{student.className} '{student.section}'</span>
                    
                    <span className="font-semibold">Date of Admission:</span>
                    <span>{student.admissionDate ? formatDateLong(student.admissionDate) : 'N/A'}</span>
                    
                    <span className="font-semibold">Date of Birth:</span>
                    <span>{formatDateLong(student.dob)}</span>
                </div>
                
                <p className="mt-8">The school administration extends a warm welcome to the student and looks forward to a fruitful association. We are committed to providing a nurturing and challenging environment for their holistic development.</p>
            </main>

            <footer className="mt-auto flex justify-between items-end pt-8 pb-2">
                <div className="text-center">
                    <div className="border-t-2 border-gray-500 w-56 mt-16 mb-2"></div>
                    <p className="font-semibold">Guardian's Signature</p>
                </div>
                <div className="text-center">
                    <div className="border-t-2 border-gray-500 w-56 mt-16 mb-2"></div>
                    <p className="font-semibold">Principal</p>
                </div>
            </footer>
        </div>
      </div>
    </div>
  );
};

export default AdmissionCertificate;
