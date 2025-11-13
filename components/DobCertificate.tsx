import React from 'react';
import { Student, SchoolDetails } from '../types';
import { dateToWords, formatDateDDMMYYYY } from '../utils/formatters';

interface DobCertificateProps {
  student: Student;
  schoolDetails: SchoolDetails | null;
  photo?: string | null;
}

const DobCertificate: React.FC<DobCertificateProps> = ({ student, schoolDetails, photo }) => {
    
    const dobInWords = dateToWords(student.dob);
    const dobDdMmYyyy = formatDateDDMMYYYY(student.dob);
    const dateOfIssue = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
    const place = schoolDetails?.address.split(',').pop()?.trim() || '';

    return (
        <div className="A4-page-container">
            <div id="dob-certificate" className="w-[297mm] h-[210mm] bg-white p-4 flex flex-col text-black relative" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                {/* Ornate Border */}
                <div className="absolute inset-0 border-8 border-double border-gray-800 m-2"></div>
                <div className="absolute inset-2 border-2 border-gray-500 m-2"></div>

                {/* Watermark */}
                {schoolDetails?.logo && (
                    <div className="absolute inset-0 flex items-center justify-center z-0">
                        <img src={schoolDetails.logo} alt="Watermark" className="w-1/2 max-h-1/2 object-contain opacity-10" />
                    </div>
                )}

                <div className="relative z-10 flex flex-col h-full p-6">
                    {/* Header */}
                    <header className="text-center mb-4">
                        {schoolDetails?.logo && (
                            <img src={schoolDetails.logo} alt="School Logo" className="w-24 h-24 mx-auto mb-1 object-contain" />
                        )}
                        <h1 className="text-3xl font-bold tracking-wider text-gray-800">
                            {schoolDetails?.name || 'School Name'}
                        </h1>
                        <p className="text-sm text-gray-600">{schoolDetails?.address || 'School Address'}</p>
                    </header>
                    
                    {/* Title */}
                    <h2 className="text-2xl font-bold text-center my-4 underline underline-offset-8 tracking-widest">
                        DATE OF BIRTH CERTIFICATE
                    </h2>

                    {/* Main Content */}
                    <main className="flex-1 grid grid-cols-3 gap-6" style={{ fontSize: '12pt', lineHeight: 1.6 }}>
                        <div className="col-span-2">
                             <p className="indent-8">
                                This is to certify that according to the school Admission Register, the date of birth of the under mentioned student is as follows:
                            </p>
                            
                            <table className="w-full border-separate my-4" style={{ borderSpacing: '0 0.75rem', fontSize: '11pt' }}>
                                <tbody>
                                    <tr>
                                        <td className="font-semibold text-gray-700 w-[30%]">Name of Student</td>
                                        <td className="font-bold">: {student.name}</td>
                                    </tr>
                                    <tr>
                                        <td className="font-semibold text-gray-700">Father’s Name</td>
                                        <td className="font-bold">: {student.fathersName}</td>
                                    </tr>
                                    <tr>
                                        <td className="font-semibold text-gray-700">Mother’s Name</td>
                                        <td className="font-bold">: {student.mothersName}</td>
                                    </tr>
                                    <tr>
                                        <td className="font-semibold text-gray-700">Admission No.</td>
                                        <td className="font-bold">: {student.admissionNo}</td>
                                    </tr>
                                     <tr>
                                        <td className="font-semibold text-gray-700">Class/Section</td>
                                        <td className="font-bold">: {`${student.className} '${student.section}'`}</td>
                                    </tr>
                                    <tr>
                                        <td className="font-semibold text-gray-700">Date of Birth (in figures)</td>
                                        <td className="font-bold">: {dobDdMmYyyy}</td>
                                    </tr>
                                    <tr>
                                        <td className="font-semibold text-gray-700 align-baseline">Date of Birth (in words)</td>
                                        <td className="font-bold">: {dobInWords}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="col-span-1 flex flex-col items-center pt-8">
                             {photo ? (
                                <img src={photo} alt="Student" className="w-32 h-40 object-cover border-2 border-gray-700" />
                            ) : (
                                <div className="w-32 h-40 border-2 border-dashed border-gray-500 flex items-center justify-center text-center text-gray-500 text-xs p-2">
                                    <span>Affix Recent Passport Size Photograph</span>
                                </div>
                            )}
                        </div>
                    </main>

                    {/* Footer */}
                    <footer className="mt-auto flex justify-between items-end pt-8 pb-2">
                        <div className="text-left text-sm">
                            <p><span className="font-semibold">Place:</span> {place}</p>
                            <p><span className="font-semibold">Date of Issue:</span> {dateOfIssue}</p>
                        </div>
                        <div className="text-center">
                            <div className="border-t-2 border-gray-700 w-56 mt-16 mb-2"></div>
                            <p className="font-semibold text-base">Headmaster/Principal</p>
                            <p className="text-xs">(Signature with Official Seal)</p>
                        </div>
                    </footer>
                </div>
            </div>
        </div>
    );
};

export default DobCertificate;
