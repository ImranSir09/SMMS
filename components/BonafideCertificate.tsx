import React from 'react';
import { Student, SchoolDetails } from '../types';
import { formatDateLong } from '../utils/formatters';
import { useAppData } from '../hooks/useAppData';

interface BonafideCertificateProps {
  student: Student;
  schoolDetails: SchoolDetails | null;
  photo?: string | null;
}

const BonafideCertificate: React.FC<BonafideCertificateProps> = ({ student, schoolDetails, photo }) => {
    const { activeSession } = useAppData();
    const genderPronoun = student.gender === 'Female' ? 'she' : 'he';
    const relationPronoun = student.gender === 'Female' ? 'Daughter' : 'Son';
    const possessivePronoun = student.gender === 'Female' ? 'her' : 'his';

    return (
        <div className="A4-page-container">
            <div id="bonafide-certificate" className="w-[297mm] h-[210mm] bg-white p-4 flex flex-col text-black relative" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                 {/* Ornate Border */}
                 <div className="absolute inset-0 border-2 border-gray-700 m-2">
                    <div className="w-full h-full border-4 border-gray-400"></div>
                 </div>

                {/* Watermark */}
                {schoolDetails?.logo && (
                    <div className="absolute inset-0 flex items-center justify-center z-0">
                        <img src={schoolDetails.logo} alt="Watermark" className="w-1/2 max-h-1/2 object-contain opacity-10" />
                    </div>
                )}

                <div className="relative z-10 flex flex-col h-full p-6">
                     {/* Photo */}
                    <div className="absolute top-24 right-12 z-20">
                        {photo ? (
                            <img src={photo} alt="Student" className="w-32 h-40 object-cover border-2 border-gray-700" />
                        ) : (
                            <div className="w-32 h-40 border-2 border-dashed border-gray-500 flex items-center justify-center text-center text-gray-500 text-sm p-2">
                                <span>Affix Recent Passport Size Photograph</span>
                            </div>
                        )}
                    </div>
                    {/* Header */}
                    <header className="text-center mb-6">
                        {schoolDetails?.logo && (
                            <img src={schoolDetails.logo} alt="School Logo" className="w-24 h-24 mx-auto mb-1 object-contain" />
                        )}
                        <h1 className="text-4xl font-bold text-gray-800 tracking-wider">
                            {schoolDetails?.name || 'School Name'}
                        </h1>
                        <p className="text-sm text-gray-600">{schoolDetails?.address || 'School Address'}</p>
                    </header>
                    
                    <div className="flex justify-between text-base mb-6">
                        <span>Ref No: ............</span>
                        <span>Date: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                    </div>

                    <h2 className="text-3xl font-semibold tracking-widest text-center text-gray-800 my-6 underline underline-offset-8">
                        BONAFIDE CERTIFICATE
                    </h2>

                    <main className="flex-1 pr-48" style={{ fontSize: '15pt', lineHeight: 1.8 }}>
                        <p className="indent-12">
                            This is to certify that <strong className="font-bold">{student.name}</strong>, 
                            {relationPronoun} of Mr. <strong className="font-bold">{student.fathersName}</strong>, is a bonafide student
                            of this institution. According to our school records, {possessivePronoun} date of birth is <strong className="font-bold">{formatDateLong(student.dob)}</strong>.
                        </p>
                        
                        <p className="mt-4 indent-12">
                             At present, {genderPronoun} is studying in Class <strong className="font-bold">{student.className} '{student.section}'</strong> with Admission
                            Number <strong className="font-bold">{student.admissionNo}</strong> during the academic session <strong className="font-bold">{activeSession}</strong>.
                        </p>
                        <p className="mt-4 indent-12">
                           To the best of our knowledge, {possessivePronoun} character and conduct are good. We wish {genderPronoun} every success in life.
                        </p>
                    </main>

                    <footer className="mt-auto flex justify-end items-end pt-12 pb-2 pr-16">
                        <div className="text-center">
                            <div className="border-t-2 border-gray-700 w-64 mt-16 mb-2"></div>
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
