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
            <div id="dob-certificate" className="w-[210mm] h-[297mm] bg-white p-8 flex flex-col font-serif text-black relative">
                
                 {/* Photo */}
                <div className="absolute top-36 right-8 z-20">
                    {photo ? (
                        <img src={photo} alt="Student" className="w-28 h-36 object-cover border-2 border-gray-700" />
                    ) : (
                        <div className="w-28 h-36 border-2 border-dashed border-gray-500 flex items-center justify-center text-center text-gray-500 text-sm p-2">
                            <span>Affix Recent Passport Size Photograph</span>
                        </div>
                    )}
                </div>

                {/* Watermark */}
                {schoolDetails?.logo && (
                    <div className="absolute inset-0 flex items-center justify-center z-0">
                        <img src={schoolDetails.logo} alt="Watermark" className="w-2/3 max-h-2/3 object-contain opacity-10" />
                    </div>
                )}

                <div className="relative z-10 flex flex-col h-full">
                    {/* Header */}
                    <header className="text-center mb-8">
                        {schoolDetails?.logo && (
                            <img src={schoolDetails.logo} alt="School Logo" className="w-28 h-28 mx-auto mb-2 object-contain" />
                        )}
                        <h1 className="text-3xl font-bold tracking-wider">
                            {schoolDetails?.name || 'School Name'}
                        </h1>
                        <p className="text-md text-gray-600">{schoolDetails?.address || 'School Address'}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {schoolDetails?.phone && <span>Ph: {schoolDetails.phone}</span>}
                          {schoolDetails?.email && <span className="mx-2">| Email: {schoolDetails.email}</span>}
                          {schoolDetails?.udiseCode && <span>| UDISE: {schoolDetails.udiseCode}</span>}
                        </p>
                    </header>
                    
                    {/* Title */}
                    <h2 className="text-2xl font-bold text-center my-6 underline underline-offset-4 tracking-widest">
                        DATE OF BIRTH CERTIFICATE
                    </h2>

                    {/* Main Content */}
                    <main className="flex-1 text-lg leading-relaxed">
                        <p className="text-center mb-6">
                            This is to certify that:
                        </p>
                        
                        <table className="w-full border-separate text-base my-4" style={{ borderSpacing: '1rem 0.5rem' }}>
                            <tbody>
                                <tr>
                                    <td className="font-semibold text-gray-700 whitespace-nowrap pr-2 w-[25%]">Name of Student:</td>
                                    <td className="font-bold border-b border-dotted border-gray-600">{student.name}</td>
                                    <td className="font-semibold text-gray-700 whitespace-nowrap pl-8 pr-2 w-[25%]">Admission No.:</td>
                                    <td className="font-bold border-b border-dotted border-gray-600">{student.admissionNo}</td>
                                </tr>
                                <tr>
                                    <td className="font-semibold text-gray-700 whitespace-nowrap pr-2">Father’s Name:</td>
                                    <td className="font-bold border-b border-dotted border-gray-600">{student.fathersName}</td>
                                    <td className="font-semibold text-gray-700 whitespace-nowrap pl-8 pr-2">Class/Section:</td>
                                    <td className="font-bold border-b border-dotted border-gray-600">{`${student.className} '${student.section}'`}</td>
                                </tr>
                                <tr>
                                    <td className="font-semibold text-gray-700 whitespace-nowrap pr-2">Mother’s Name:</td>
                                    <td className="font-bold border-b border-dotted border-gray-600">{student.mothersName}</td>
                                    <td className="font-semibold text-gray-700 whitespace-nowrap pl-8 pr-2">Date of Birth (figures):</td>
                                    <td className="font-bold border-b border-dotted border-gray-600">{dobDdMmYyyy}</td>
                                </tr>
                                <tr>
                                    <td className="font-semibold text-gray-700 whitespace-nowrap pr-2 align-baseline">Date of Birth (words):</td>
                                    <td className="font-bold border-b border-dotted border-gray-600" colSpan={3}>{dobInWords}</td>
                                </tr>
                            </tbody>
                        </table>

                        <p className="mt-8 text-center text-base italic">
                            The above particulars have been taken from the Admission Register of the school and are correct to the best of my knowledge.
                        </p>
                        
                        <div className="mt-10 text-xs border-t border-dashed pt-2">
                            <p className="font-bold">Certificate Note:</p>
                            <p>This certificate is issued for official purposes only. It is based on the records maintained in the school admission register and is not valid for claiming age in a court of law.</p>
                        </div>
                    </main>

                    {/* Footer */}
                    <footer className="mt-auto flex justify-between items-end pt-12 pb-2">
                        <div className="text-left text-base">
                            <p><span className="font-semibold">Place:</span> {place}</p>
                            <p><span className="font-semibold">Date:</span> {dateOfIssue}</p>
                        </div>
                        <div className="text-center">
                            <div className="border-t-2 border-gray-700 w-64 mt-24 mb-2"></div>
                            <p className="font-semibold text-lg">Headmaster/Principal</p>
                            <p>(Signature with Seal)</p>
                        </div>
                    </footer>
                    <p className="text-center text-[9px] text-gray-600 mt-2">This document was created from School Management Mobile System by Imran Gani Mugloo Teacher Zone Vailoo</p>
                </div>
            </div>
        </div>
    );
};

export default DobCertificate;
