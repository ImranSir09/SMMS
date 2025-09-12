import React from 'react';
import { Student, SchoolDetails } from '../types';
import { formatDateLong } from '../utils/formatters';

interface DobCertificateProps {
  student: Student;
  schoolDetails: SchoolDetails | null;
}

const DobCertificate: React.FC<DobCertificateProps> = ({ student, schoolDetails }) => {
    
  return (
    <div className="A4-page-container">
        <div id="dob-certificate" className="w-[210mm] h-[297mm] bg-white p-4 flex flex-col font-sans text-black relative">
            <div className="w-full h-full border-[10px] border-blue-900 p-2 flex flex-col relative">
                <div className="w-full h-full border-2 border-blue-900 flex flex-col p-6">
                    
                    {/* Background Logo */}
                    {schoolDetails?.logo && (
                        <div className="absolute inset-0 flex items-center justify-center z-0">
                            <img src={schoolDetails.logo} alt="Logo" className="w-1/2 h-1/2 object-contain opacity-10" />
                        </div>
                    )}

                    <header className="text-center mb-8 z-10">
                        {schoolDetails?.logo && (
                            <img src={schoolDetails.logo} alt="School Logo" className="w-20 h-20 mx-auto mb-2 object-contain" />
                        )}
                        <h1 className="text-3xl font-bold font-gothic text-blue-900 tracking-wider">
                            {schoolDetails?.name || 'School Name'}
                        </h1>
                        <p className="text-sm text-gray-600">{schoolDetails?.address || 'School Address'}</p>
                    </header>

                    <main className="flex-1 flex flex-col items-center z-10">
                        <h2 className="text-2xl font-semibold font-gothic tracking-widest text-gray-800 my-4">
                            CERTIFICATE OF DATE OF BIRTH
                        </h2>
                        
                        <div className="text-md leading-relaxed text-left max-w-2xl w-full mt-6 space-y-4">
                            <p>This is to certify that as per the school's general register, the particulars of the undermentioned student are as follows:</p>
                            
                            <div className="my-4 p-4 border-y-2 border-dashed border-gray-300 grid grid-cols-[max-content_auto] gap-x-4 gap-y-2">
                                <span className="font-semibold text-gray-600">Full Name:</span>
                                <span className="font-bold text-lg">{student.name}</span>

                                <span className="font-semibold text-gray-600">Guardian's Name:</span>
                                <span className="font-bold">{student.guardianInfo}</span>
                                
                                <span className="font-semibold text-gray-600">Admission Number:</span>
                                <span className="font-bold">{student.admissionNo}</span>
                            </div>

                            <p>
                                The student's recorded Date of Birth is the <strong className="text-xl font-bold">{formatDateLong(student.dob)}</strong>.
                            </p>
                        </div>

                    </main>

                    <footer className="mt-auto flex justify-between items-end z-10 pt-8 pb-2">
                        <div className="text-left text-xs text-gray-600">
                            <p>Place: {schoolDetails?.address.split(',').pop()?.trim() || 'School City'}</p>
                            <p>Date of Issue: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                        </div>
                        <div className="text-center">
                            <div className="border-t-2 border-gray-500 w-48 mt-16 mb-2"></div>
                            <p className="font-semibold">Principal</p>
                        </div>
                    </footer>
                </div>
            </div>
        </div>
    </div>
  );
};

export default DobCertificate;