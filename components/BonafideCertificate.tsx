
import React from 'react';
import { Student, SchoolDetails } from '../types';
import { formatDateLong } from '../utils/formatters';

interface BonafideCertificateProps {
  student: Student;
  schoolDetails: SchoolDetails | null;
  photo?: string | null;
}

const BonafideCertificate: React.FC<BonafideCertificateProps> = ({ student, schoolDetails, photo }) => {
    const genderPronoun = student.gender === 'Female' ? 'daughter' : 'son';
    const dobFormatted = student.dob ? formatDateLong(student.dob) : 'N/A';

    return (
        <div className="A4-page-container">
            <div id="bonafide-certificate" className="w-[210mm] h-[297mm] bg-white p-10 flex flex-col font-serif text-black relative">
                {/* Watermark Logo */}
                {schoolDetails?.logo && (
                    <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
                        <img src={schoolDetails.logo} alt="Logo" className="w-3/4 max-h-3/4 object-contain opacity-[0.03]" />
                    </div>
                )}
                
                {/* Decorative Border */}
                <div className="absolute inset-4 border-4 border-double border-slate-800 pointer-events-none"></div>
                <div className="absolute inset-6 border border-slate-600 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col h-full p-6">
                    
                    {/* Header */}
                    <header className="text-center mb-8 border-b-2 border-gray-800 pb-6">
                        <div className="flex flex-col items-center">
                            {schoolDetails?.logo && (
                                <img src={schoolDetails.logo} alt="School Logo" className="h-24 w-24 object-contain mb-3" />
                            )}
                            <h1 className="text-4xl font-bold text-slate-900 uppercase tracking-wide font-serif">
                                {schoolDetails?.name || 'Institution Name'}
                            </h1>
                            <p className="text-base text-slate-700 mt-2 whitespace-pre-wrap font-medium">{schoolDetails?.address || 'Institution Address'}</p>
                            <div className="flex items-center justify-center gap-4 text-sm text-slate-600 mt-1 font-medium">
                                {schoolDetails?.phone && <span>Ph: {schoolDetails.phone}</span>}
                                {schoolDetails?.email && <span>Email: {schoolDetails.email}</span>}
                                {schoolDetails?.udiseCode && <span>UDISE: {schoolDetails.udiseCode}</span>}
                            </div>
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
                    <div className="text-center my-10">
                        <span className="px-8 py-2 text-2xl font-bold text-slate-900 border-y-2 border-slate-900 uppercase tracking-widest bg-slate-50/50">
                            Bonafide Certificate
                        </span>
                    </div>

                    {/* Body Paragraphs */}
                    <main className="flex-1 text-lg leading-relaxed text-justify px-4"> 
                        <p className="mb-6 indent-8">
                            This is to certify that <strong className="font-bold uppercase">{student.name}</strong>, 
                            {genderPronoun} of Mr. <strong className="font-bold uppercase">{student.fathersName}</strong>, is a bonafide student
                            of this institution.
                        </p>
                        
                        <p className="mb-6">
                            The student is studying in Class <strong className="font-bold">{student.className}</strong> (Section <strong className="font-bold">'{student.section}'</strong>) and bears Enrollment/Admission Number <strong className="font-bold">{student.admissionNo}</strong> for the academic session <strong className="font-bold border-b border-dashed border-black inline-block w-24 text-center">&nbsp;{/*Session*/}&nbsp;</strong>.
                        </p>

                        <p className="mb-8">
                            During the period of study, the student has conducted themselves in a disciplined manner and is pursuing studies in accordance with the rules and regulations of the institution. This certificate is issued upon their request for whatever purpose it may serve.
                        </p>

                        {/* Details Section */}
                        <div className="my-8 p-6 bg-slate-50 border border-slate-200 rounded-lg mx-4">
                            <h3 className="text-lg font-bold border-b border-slate-300 pb-2 mb-4 uppercase tracking-wide text-slate-700">Student Particulars</h3>
                            <table className="w-full text-base">
                                <tbody>
                                    <tr className="h-10">
                                        <td className="font-bold text-slate-700 w-48">Name of Student:</td>
                                        <td className="font-medium border-b border-dashed border-slate-300">{student.name}</td>
                                    </tr>
                                    <tr className="h-10">
                                        <td className="font-bold text-slate-700">Admission No:</td>
                                        <td className="font-medium border-b border-dashed border-slate-300">{student.admissionNo}</td>
                                    </tr>
                                    <tr className="h-10">
                                        <td className="font-bold text-slate-700">Class / Course:</td>
                                        <td className="font-medium border-b border-dashed border-slate-300">{student.className}</td>
                                    </tr>
                                    <tr className="h-10">
                                        <td className="font-bold text-slate-700">Date of Birth:</td>
                                        <td className="font-medium border-b border-dashed border-slate-300">{dobFormatted}</td>
                                    </tr>
                                    <tr className="h-10">
                                        <td className="font-bold text-slate-700">Duration:</td>
                                        <td className="font-medium tracking-widest">_________________ to _________________</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <p className="mt-8 text-sm italic text-center text-slate-600">
                            "We hereby confirm that the above-mentioned particulars are true to the best of our knowledge and school records."
                        </p>
                    </main>

                    {/* Footer */}
                    <div className="mt-auto px-4">
                        <div className="mb-12 text-base">
                            <span className="font-bold">Issued on:</span> {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                        
                        <div className="flex justify-between items-end">
                            <div className="text-center">
                                <div className="w-48 border-b border-slate-800 mb-1"></div>
                                <p className="font-bold text-slate-800">Prepared By</p>
                            </div>
                            
                            <div className="text-center">
                                <div className="w-48 border-b border-slate-800 mb-1"></div>
                                <p className="font-bold text-slate-800">Principal / Headmaster</p>
                                <p className="text-xs text-slate-600 uppercase tracking-wider">(Seal & Signature)</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BonafideCertificate;
