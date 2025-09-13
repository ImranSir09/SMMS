import React from 'react';
import { Student, SchoolDetails } from '../types';

interface DobCertificateProps {
  student: Student;
  schoolDetails: SchoolDetails | null;
}

const DobCertificate: React.FC<DobCertificateProps> = ({ student, schoolDetails }) => {
    const dob = new Date(student.dob + 'T00:00:00');
    const day = !isNaN(dob.getTime()) ? dob.getDate() : '';
    const month = !isNaN(dob.getTime()) ? dob.toLocaleString('en-US', { month: 'long' }) : '';
    const year = !isNaN(dob.getTime()) ? dob.getFullYear() : '';
    const classAndSection = `${student.className} ${student.section || ''}`.trim();

    return (
        <div className="A4-page-container">
            <div id="dob-certificate" className="w-[210mm] h-[297mm] bg-white p-4 flex flex-col font-serif text-black relative">
                <div className="w-full h-full border-2 border-black p-4 flex flex-col relative">
                    {/* Background Logo */}
                    {schoolDetails?.logo && (
                        <div className="absolute inset-0 flex items-center justify-center z-0">
                            <img src={schoolDetails.logo} alt="Logo" className="w-1/2 h-1/2 object-contain opacity-10" />
                        </div>
                    )}

                    <header className="relative z-10">
                        <div className="flex justify-between items-start">
                             <div className="flex flex-col items-center">
                               {schoolDetails?.logo && (
                                    <img src={schoolDetails.logo} alt="School Logo" className="w-16 h-16 object-contain" />
                                )}
                                <div className="text-sm font-bold font-gothic mt-1">
                                    <p>Be Elite</p>
                                </div>
                            </div>
                            <div className="text-center">
                                <h1 className="text-2xl font-bold font-gothic text-black tracking-wider">
                                    {schoolDetails?.name || 'School Name'}
                                </h1>
                                <p className="text-sm">{schoolDetails?.address || 'School Address'}</p>
                                <p className="text-sm">
                                  {schoolDetails?.phone && <span>Ph: {schoolDetails.phone}</span>}
                                </p>
                            </div>
                            <div>
                                {student.photo ? (
                                    <img src={student.photo} alt={student.name} className="w-20 h-24 object-cover border-2 border-gray-400" />
                                ) : (
                                    <div className="w-20 h-24 border-2 border-gray-400 bg-gray-200 flex items-center justify-center text-xs text-gray-500">No Photo</div>
                                )}
                            </div>
                        </div>
                        <h2 className="text-2xl font-semibold font-gothic text-center my-4 underline underline-offset-4">
                            Birth Certificate
                        </h2>
                    </header>

                    <main className="flex-1 flex flex-col z-10 text-md leading-relaxed">
                        <h3 className="text-center font-bold underline underline-offset-2 my-6">
                            TO WHOM IT MAY CONCERN
                        </h3>
                        
                        <div className="space-y-8 mt-4 text-base">
                            <p className="flex items-end flex-wrap">
                                This is to certify that Mr./Miss. 
                                <span className="font-semibold border-b border-black flex-grow text-center mx-2">{student.name}</span>
                            </p>
                            <p className="flex items-end flex-wrap">
                                Son / Daughter of
                                <span className="font-semibold border-b border-black flex-grow text-center mx-2">{student.fathersName}</span>
                            </p>
                             <p className="flex items-end flex-wrap">
                                is a regular student of this institution. At present, he/she is reading in
                                <span className="font-semibold border-b border-black flex-grow text-center mx-2">{classAndSection}</span>
                            </p>
                            <p className="flex items-end flex-wrap">
                                Under Admission No.
                                <span className="font-semibold border-b border-black flex-grow text-center mx-2">{student.admissionNo}</span>
                            </p>
                            <p className="flex items-end flex-wrap">
                                According to the school record, his/her date of birth is
                                <span className="font-semibold border-b border-black w-16 text-center mx-2">{day}</span>
                                <span className="font-semibold border-b border-black w-32 text-center mx-2">{month}</span>
                                <span className="font-semibold border-b border-black w-24 text-center mx-2">{year}</span>
                            </p>
                        </div>
                    </main>

                    <footer className="mt-auto flex justify-end items-end z-10 pt-16 pb-2">
                        <div className="text-center">
                            <div className="border-t border-black w-56 mb-1"></div>
                            <p className="font-semibold text-sm">Managing Director Signature</p>
                        </div>
                    </footer>
                </div>
            </div>
        </div>
    );
};

export default DobCertificate;
