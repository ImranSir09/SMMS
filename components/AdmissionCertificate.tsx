
import React from 'react';
import { Student, SchoolDetails } from '../types';
import { formatDateLong } from '../utils/formatters';

interface AdmissionCertificateProps {
  student: Student;
  schoolDetails: SchoolDetails | null;
}

const AdmissionCertificate: React.FC<AdmissionCertificateProps> = ({ student, schoolDetails }) => {

    const DetailItem: React.FC<{ label: string; value: string | undefined | null; colSpan?: number }> = ({ label, value, colSpan }) => (
        <div className={`flex items-baseline ${colSpan === 2 ? 'col-span-2' : ''}`}>
            <span className="font-semibold w-1/3 flex-shrink-0 text-gray-700">{label}:</span>
            <span className="flex-1 font-bold border-b border-dotted border-gray-600 pl-2">{value || 'N/A'}</span>
        </div>
    );

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

            <main className="flex-1 text-base leading-relaxed">
                <p className="indent-8">
                    This is to certify that the student whose details are mentioned below has been granted admission to this institution for the academic session.
                </p>
                
                <div className="my-6 p-4 border-y-2 border-dashed border-gray-400 grid grid-cols-2 gap-x-8 gap-y-3">
                    <DetailItem label="Full Name" value={student.name} />
                    <DetailItem label="Father's Name" value={student.fathersName} />
                    
                    <DetailItem label="Admission No" value={student.admissionNo} />
                    <DetailItem label="Mother's Name" value={student.mothersName} />

                    <DetailItem label="Class Admitted To" value={`${student.className} '${student.section}'`} />
                    <DetailItem label="Contact Number" value={student.contact} />

                    <DetailItem label="Date of Admission" value={student.admissionDate ? formatDateLong(student.admissionDate) : undefined} />
                    <DetailItem label="Category" value={student.category} />
                    
                    <DetailItem label="Date of Birth" value={formatDateLong(student.dob)} />
                    <DetailItem label="Blood Group" value={student.bloodGroup} />
                    
                    <DetailItem label="Gender" value={student.gender} />
                    <DetailItem label="Aadhar Number" value={student.aadharNo} />
                    
                    <DetailItem label="Address" value={student.address} colSpan={2} />
                </div>
                
                <p className="mt-6">
                    The school administration extends a warm welcome to the student and looks forward to a fruitful association. We are committed to providing a nurturing and challenging environment for their holistic development.
                </p>
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
