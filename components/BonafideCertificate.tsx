
import React from 'react';
import { Student, SchoolDetails } from '../types';
import { formatDateLong } from '../utils/formatters';

interface BonafideCertificateProps {
  student: Student;
  schoolDetails: SchoolDetails | null;
  photo?: string | null;
}

const BonafideCertificate: React.FC<BonafideCertificateProps> = ({ student, schoolDetails, photo }) => {
    const genderPronoun = student.gender === 'Female' ? 'Daughter' : 'Son';
    const startDate = student.admissionDate ? formatDateLong(student.admissionDate) : 'Session Start';
    const dobFormatted = student.dob ? formatDateLong(student.dob) : 'N/A';

    return (
        <div className="A4-page-container">
            <div id="bonafide-certificate" className="w-[210mm] h-[297mm] bg-white p-12 flex flex-col font-serif text-black relative">
                {/* Watermark Logo */}
                {schoolDetails?.logo && (
                    <div className="absolute inset-0 flex items-center justify-center z-0">
                        <img src={schoolDetails.logo} alt="Logo" className="w-2/3 max-h-2/3 object-contain opacity-5" />
                    </div>
                )}
                
                <div className="w-full h-full border-4 border-double border-gray-800 p-8 flex flex-col z-10 relative">
                    
                    {/* Header */}
                    <header className="text-center mb-8 border-b-2 border-gray-300 pb-4">
                        <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-wider mb-2">
                            {schoolDetails?.name || 'Institution Name'}
                        </h1>
                        <p className="text-base text-gray-700 whitespace-pre-wrap">{schoolDetails?.address || 'Institution Address'}</p>
                         <p className="text-sm text-gray-600 mt-1">
                          {schoolDetails?.phone && <span>Phone: {schoolDetails.phone}</span>}
                          {schoolDetails?.phone && schoolDetails?.email && <span> | </span>}
                          {schoolDetails?.email && <span>Email: {schoolDetails.email}</span>}
                        </p>
                    </header>
                    
                    {/* Photo (Optional position based on new layout, keeping it top right of content) */}
                    <div className="absolute top-40 right-12">
                        {photo ? (
                            <img src={photo} alt="Student" className="w-24 h-32 object-cover border border-gray-400" />
                        ) : (
                            <div className="w-24 h-32 border border-dashed border-gray-400 flex items-center justify-center text-center text-gray-400 text-xs p-1">
                                <span>Affix Photo</span>
                            </div>
                        )}
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl font-bold text-center text-black my-6 underline underline-offset-4 uppercase">
                        BONAFIDE CERTIFICATE
                    </h2>

                    {/* Body Paragraphs */}
                    <main className="flex-1 text-lg leading-relaxed text-justify"> 
                        <p className="mb-4 pr-28">
                            This is to certify that <strong className="font-bold">{student.name}</strong>, 
                            {genderPronoun} of <strong className="font-bold">{student.fathersName}</strong>, has been a bonafide student
                            of <strong className="font-bold">{schoolDetails?.name}</strong> from <strong className="font-bold">{startDate}</strong> to <strong className="font-bold">--------------------------</strong>.
                        </p>
                        
                        <p className="mb-4">
                            The student was enrolled in Class <strong className="font-bold">{student.className}</strong> and bears Enrollment/Admission Number <strong className="font-bold">{student.admissionNo}</strong>.
                        </p>

                        <p className="mb-8">
                            During the period of study, the student has conducted themselves in a disciplined manner and is pursuing studies in accordance with the rules and regulations of the institution. This certificate is issued upon their request for whatever purpose it may serve.
                        </p>

                        {/* Details Section */}
                        <div className="mb-8 ml-4">
                            <h3 className="text-lg font-bold underline mb-4">Details:</h3>
                            <table className="w-full text-lg">
                                <tbody>
                                    <tr className="h-8">
                                        <td className="font-semibold w-64">Name of Student:</td>
                                        <td>{student.name}</td>
                                    </tr>
                                    <tr className="h-8">
                                        <td className="font-semibold">Enrollment/Admission No:</td>
                                        <td>{student.admissionNo}</td>
                                    </tr>
                                    <tr className="h-8">
                                        <td className="font-semibold">Course/Class:</td>
                                        <td>{student.className}</td>
                                    </tr>
                                    <tr className="h-8">
                                        <td className="font-semibold">Duration:</td>
                                        <td>{startDate} to --------------------------</td>
                                    </tr>
                                    <tr className="h-8">
                                        <td className="font-semibold">Date of Birth:</td>
                                        <td>{dobFormatted}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <p className="mt-8 text-base">
                            We hereby confirm that the above-mentioned particulars are true to the best of our knowledge and records.
                        </p>
                    </main>

                    {/* Footer */}
                    <div className="mt-auto">
                        <p className="mb-12 font-semibold">Issued on: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        
                        <div className="flex justify-between items-end">
                            <div className="text-left">
                                <p>Authorized Signatory: ____________________</p>
                                <p className="mt-2 font-bold">Principal / Head of Institution</p>
                                <p className="text-sm">Designation: Principal/Headmaster</p>
                            </div>
                            
                            <div className="text-center w-48">
                                <p className="mb-2 text-sm text-gray-500">(Seal/Stamp of Institution)</p>
                                <div className="h-20 w-20 border-2 border-dashed border-gray-400 rounded-full mx-auto flex items-center justify-center">
                                    <span className="text-xs text-gray-400">Seal</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BonafideCertificate;
