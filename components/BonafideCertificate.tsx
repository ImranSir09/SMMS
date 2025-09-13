
import React from 'react';
import { Student, SchoolDetails } from '../types';
import { formatDateLong } from '../utils/formatters';

interface BonafideCertificateProps {
  student: Student;
  schoolDetails: SchoolDetails | null;
}

const BonafideCertificate: React.FC<BonafideCertificateProps> = ({ student, schoolDetails }) => {
    const genderPronoun = student.gender === 'Female' ? 'she' : 'he';
    const relationPronoun = student.gender === 'Female' ? 'Daughter' : 'Son';

    return (
        <div className="A4-page-container">
            <div id="bonafide-certificate" className="w-[210mm] h-[297mm] bg-white p-8 flex flex-col font-serif text-black relative">
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
                    </header>
                    
                    <div className="flex justify-between text-lg mb-10">
                        <span>S. No: ............</span>
                        <span>Date: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                    </div>

                    <h2 className="text-3xl font-semibold tracking-widest text-center text-gray-800 my-8 underline">
                        BONAFIDE CERTIFICATE
                    </h2>

                    <main className="flex-1 text-xl leading-loose">
                        <p className="indent-12">
                            This is to certify that <strong className="font-bold">{student.name}</strong>, 
                            {relationPronoun} of <strong className="font-bold">{student.fathersName}</strong>, is a bonafide student
                            of this institution.
                        </p>
                        
                        <p className="mt-6 indent-12">
                            At present, {genderPronoun} is studying in Class <strong className="font-bold">{student.className} '{student.section}'</strong> under Admission
                            Number <strong className="font-bold">{student.admissionNo}</strong>.
                        </p>

                        <p className="mt-6 indent-12">
                            According to our school records, {genderPronoun}r Date of Birth is <strong className="font-bold">{formatDateLong(student.dob)}</strong>.
                        </p>

                        <p className="mt-8">
                            This certificate is issued upon the request of the parent/guardian for all legitimate purposes.
                        </p>

                        <p className="mt-6">
                            We wish {genderPronoun}m all the best for {genderPronoun}r future endeavors.
                        </p>
                    </main>

                    <footer className="mt-auto flex justify-between items-end pt-16 pb-2">
                        <div className="text-center text-gray-600">
                            <p className="font-semibold">(Official Seal)</p>
                        </div>
                        <div className="text-center">
                            <div className="border-t-2 border-gray-500 w-64 mt-16 mb-2"></div>
                            <p className="font-semibold text-lg">Principal / Headmaster</p>
                            <p className="text-sm">{schoolDetails?.name}</p>
                        </div>
                    </footer>
                </div>
            </div>
        </div>
    );
};

export default BonafideCertificate;
