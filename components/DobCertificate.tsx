
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
            <div id="dob-certificate" className="w-[210mm] h-[297mm] bg-white p-10 flex flex-col font-serif text-black relative">
                
                {/* Watermark */}
                {schoolDetails?.logo && (
                    <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
                        <img src={schoolDetails.logo} alt="Watermark" className="w-3/4 max-h-3/4 object-contain opacity-[0.03]" />
                    </div>
                )}

                {/* Decorative Border */}
                <div className="absolute inset-4 border-[6px] border-double border-slate-900 pointer-events-none"></div>
                <div className="absolute inset-2 border border-slate-300 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col h-full p-6">
                    {/* Header */}
                    <header className="text-center mb-8 border-b border-gray-300 pb-6">
                        <div className="flex flex-col items-center">
                            {schoolDetails?.logo && (
                                <img src={schoolDetails.logo} alt="School Logo" className="w-24 h-24 mb-2 object-contain" />
                            )}
                            <h1 className="text-4xl font-bold tracking-wide text-slate-900 font-serif uppercase">
                                {schoolDetails?.name || 'School Name'}
                            </h1>
                            <p className="text-base text-slate-700 mt-2 font-medium">{schoolDetails?.address || 'School Address'}</p>
                            <p className="text-sm text-slate-500 mt-1 font-medium">
                              {schoolDetails?.phone && <span>Ph: {schoolDetails.phone}</span>}
                              {schoolDetails?.email && <span className="mx-2">| Email: {schoolDetails.email}</span>}
                              {schoolDetails?.udiseCode && <span>| UDISE: {schoolDetails.udiseCode}</span>}
                            </p>
                        </div>
                    </header>
                    
                    {/* Photo Placeholder */}
                    <div className="absolute top-60 right-10">
                        {photo ? (
                            <img src={photo} alt="Student" className="w-28 h-32 object-cover border border-gray-400 shadow-sm" />
                        ) : (
                            <div className="w-28 h-32 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-center text-gray-400 text-xs p-2 bg-gray-50">
                                <span className="font-semibold">Affix Photo</span>
                                <span className="text-[10px] mt-1">(Passport Size)</span>
                            </div>
                        )}
                    </div>

                    {/* Title */}
                    <div className="text-center my-8">
                        <span className="text-3xl font-bold text-slate-900 uppercase tracking-widest border-b-4 border-double border-slate-900 py-1">
                            Date of Birth Certificate
                        </span>
                    </div>

                    {/* Main Content */}
                    <main className="flex-1 text-lg leading-relaxed px-2">
                        <p className="text-center mb-8 text-slate-700 italic">
                            This is to certify that the following information has been taken from the original Admission Register of the school.
                        </p>
                        
                        <div className="w-full my-6">
                            <div className="grid grid-cols-[200px_1fr] gap-y-6 items-center">
                                
                                <div className="font-bold text-slate-800 uppercase text-sm tracking-wide">Name of Student:</div>
                                <div className="font-bold text-xl border-b-2 border-dotted border-slate-400 pb-1">{student.name}</div>

                                <div className="font-bold text-slate-800 uppercase text-sm tracking-wide">Admission No.:</div>
                                <div className="font-bold text-lg border-b-2 border-dotted border-slate-400 pb-1">{student.admissionNo}</div>

                                <div className="font-bold text-slate-800 uppercase text-sm tracking-wide">Father’s Name:</div>
                                <div className="font-bold text-lg border-b-2 border-dotted border-slate-400 pb-1">{student.fathersName}</div>

                                <div className="font-bold text-slate-800 uppercase text-sm tracking-wide">Mother’s Name:</div>
                                <div className="font-bold text-lg border-b-2 border-dotted border-slate-400 pb-1">{student.mothersName}</div>

                                <div className="font-bold text-slate-800 uppercase text-sm tracking-wide">Class / Section:</div>
                                <div className="font-bold text-lg border-b-2 border-dotted border-slate-400 pb-1">{`${student.className} '${student.section}'`}</div>

                                <div className="font-bold text-slate-800 uppercase text-sm tracking-wide">D.O.B (Figures):</div>
                                <div className="font-bold text-lg border-b-2 border-dotted border-slate-400 pb-1">{dobDdMmYyyy}</div>

                                <div className="font-bold text-slate-800 uppercase text-sm tracking-wide self-start pt-2">D.O.B (Words):</div>
                                <div className="font-bold text-lg border-b-2 border-dotted border-slate-400 pb-1 italic leading-relaxed">{dobInWords}</div>
                            </div>
                        </div>

                        <div className="mt-12 p-4 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900 text-center">
                            <strong>Note:</strong> This certificate is issued for official purposes only based on school records.
                        </div>
                    </main>

                    {/* Footer */}
                    <footer className="mt-auto flex justify-between items-end pt-12 pb-4 px-2">
                        <div className="text-left text-base font-medium">
                            <p><span className="font-bold text-slate-700">Place:</span> {place}</p>
                            <p><span className="font-bold text-slate-700">Date:</span> {dateOfIssue}</p>
                        </div>
                        <div className="text-center">
                            <div className="border-t-2 border-slate-800 w-56 mt-24 mb-2"></div>
                            <p className="font-bold text-lg text-slate-900">Principal / Headmaster</p>
                            <p className="text-xs uppercase tracking-wider text-slate-600">(Signature with Seal)</p>
                        </div>
                    </footer>
                </div>
            </div>
        </div>
    );
};

export default DobCertificate;
