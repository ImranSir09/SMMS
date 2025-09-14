
import React from 'react';
import { Student, SchoolDetails } from '../types';

interface DobCertificateProps {
  student: Student;
  schoolDetails: SchoolDetails | null;
}

const DobCertificate: React.FC<DobCertificateProps> = ({ student, schoolDetails }) => {
    
    // Helper function to convert a date string into a formatted word string
    const dateToWords = (dateString: string): string => {
        if (!dateString) return '_______________________';
        const date = new Date(dateString + 'T00:00:00');
        if (isNaN(date.getTime())) return '_______________________';
        
        const day = date.getDate();
        const month = date.toLocaleString('en-US', { month: 'long' });
        const year = date.getFullYear();

        const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
        const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        
        const dayToOrdinalWord = (d: number): string => {
            const ordinals = ['','First','Second','Third','Fourth','Fifth','Sixth','Seventh','Eighth','Ninth','Tenth','Eleventh','Twelfth','Thirteenth','Fourteenth','Fifteenth','Sixteenth','Seventeenth','Eighteenth','Nineteenth','Twentieth','Twenty-First','Twenty-Second','Twenty-Third','Twenty-Fourth','Twenty-Fifth','Twenty-Sixth','Twenty-Seventh','Twenty-Eighth','Twenty-Ninth','Thirtieth','Thirty-First'];
            return ordinals[d] || d.toString();
        };
        
        const yearToWords = (y: number): string => {
            const yStr = y.toString();
            let word = '';
            if (y >= 2000) {
                 word = "Two Thousand";
                 const remainder = y % 100;
                 if (remainder > 0) {
                     word += ' and ';
                     if (remainder < 10) word += ones[remainder];
                     else if (remainder < 20) word += teens[remainder-10];
                     else {
                         word += tens[Math.floor(remainder/10)];
                         if (remainder % 10 > 0) word += ` ${ones[remainder % 10]}`;
                     }
                 }
                 return word;
            }
            if (y >= 1900) {
                 word = 'Nineteen Hundred';
                 const remainder = y % 100;
                 if (remainder > 0) {
                     word += ' and ';
                     if (remainder < 10) word += ones[remainder];
                     else if (remainder < 20) word += teens[remainder-10];
                     else {
                         word += tens[Math.floor(remainder/10)];
                         if (remainder % 10 > 0) word += ` ${ones[remainder % 10]}`;
                     }
                 }
                 return word;
            }
            return y.toString();
        };
        
        return `${dayToOrdinalWord(day)} ${month}, ${yearToWords(year)}`;
    };
    
    const formatDateDDMMYYYY = (dateString: string): string => {
        if (!dateString) return '';
        const date = new Date(dateString + 'T00:00:00');
        if (isNaN(date.getTime())) return '';
        return date.toLocaleDateString('en-GB');
    };

    const dobInWords = dateToWords(student.dob);
    const dobDdMmYyyy = formatDateDDMMYYYY(student.dob);
    const dateOfIssue = new Date().toLocaleDateString('en-GB');
    const place = schoolDetails?.address.split(',').pop()?.trim() || '';
    
    const DetailItem: React.FC<{ label: string; value?: string | null; fullWidth?: boolean }> = ({ label, value, fullWidth }) => (
        <div className={`flex items-baseline ${fullWidth ? 'col-span-2' : ''}`}>
            <span className="w-2/5 font-semibold text-gray-700">{label}:</span>
            <span className="flex-1 font-bold border-b border-dotted border-black text-left pl-2">{value || ''}</span>
        </div>
    );

    return (
        <div className="A4-page-container">
            <div id="dob-certificate" className="w-[210mm] h-[297mm] bg-white p-6 flex flex-col font-serif text-black">
                
                <header className="text-center mb-4 border-b-2 border-black pb-2">
                    <h1 className="text-2xl font-bold uppercase">{schoolDetails?.name || 'School Name'}</h1>
                    <p className="text-sm">{schoolDetails?.address || 'School Address'}</p>
                    <p className="text-xs">
                        Phone: {schoolDetails?.phone || 'N/A'} | Email: {schoolDetails?.email || 'N/A'} | UDISE: {schoolDetails?.udiseCode || 'N/A'}
                    </p>
                </header>

                <h2 className="text-xl font-bold text-center my-3 underline underline-offset-4">Date of Birth Certificate</h2>

                <main className="flex-1 text-md leading-relaxed">
                    <p className="mb-4 text-center italic text-sm">
                        This is to certify that according to the school records, the particulars of the student are as under:
                    </p>
                    
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm mt-6">
                        <DetailItem label="Name of Student" value={student.name} />
                        <DetailItem label="Admission No." value={student.admissionNo} />
                        <DetailItem label="Father’s Name" value={student.fathersName} />
                        <DetailItem label="Mother’s Name" value={student.mothersName} />
                        <DetailItem label="Gender" value={student.gender} />
                        <DetailItem label="Date of Birth" value={dobDdMmYyyy} />
                        <DetailItem label="Date of Birth (in words)" value={dobInWords} fullWidth={true} />
                        <DetailItem label="Place of Birth" value="" />
                        <DetailItem label="Date of Admission" value={formatDateDDMMYYYY(student.admissionDate || '')} />
                        <DetailItem label="Class at Admission" value="" />
                        <DetailItem label="Birth Verified From" value="School Record" />
                        <DetailItem label="Residential Address" value={student.address} fullWidth={true} />
                    </div>

                    <div className="mt-6">
                        <span className="italic text-sm">Remarks (if any):</span>
                        <div className="w-full border-b border-dotted border-black mt-1 h-5"></div>
                    </div>
                </main>

                <footer className="mt-auto pt-10 text-sm">
                    <div className="flex justify-between items-start mb-12">
                         <div>
                            <p><span className="font-semibold">Date of Issue:</span> {dateOfIssue}</p>
                            <p><span className="font-semibold">Place:</span> {place}</p>
                        </div>
                        <div className="text-center">
                            <div className="w-56 h-16"></div> {/* Space for signature */}
                            <div className="border-t border-black w-56"></div>
                            <p className="font-semibold">Signature of Head of School / Principal</p>
                            <p>Name: ____________________________</p>
                            <p>Designation: _______________________</p>
                        </div>
                    </div>
                     <div className="text-center">
                        <p className="font-semibold">School Seal:</p>
                    </div>
                </footer>
                
                <div className="text-xs text-gray-700 mt-4 border-t pt-2">
                    <p className="font-bold">Note:</p>
                    <ol className="list-decimal list-inside">
                        <li>This certificate is issued on the basis of records and documents provided by the parent or guardian.</li>
                        <li>This certificate does not serve as a legal birth certificate for government use unless specifically authorized by the issuing authority.</li>
                    </ol>
                </div>
            </div>
        </div>
    );
};

export default DobCertificate;
