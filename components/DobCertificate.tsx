
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
            if (y >= 2000) {
                 let word = "Two Thousand";
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
                 let word = 'Nineteen Hundred';
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
    const dateOfIssue = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
    const place = schoolDetails?.address.split(',').pop()?.trim() || '';

    const DetailItem: React.FC<{ label: string; value: string | undefined | null; colSpan?: number }> = ({ label, value, colSpan }) => (
        <div className={`flex items-baseline ${colSpan === 2 ? 'col-span-2' : ''}`}>
            <span className="font-semibold w-1/3 flex-shrink-0 text-gray-700">{label}:</span>
            <span className="flex-1 font-bold border-b border-dotted border-gray-600 pl-2">{value || '________________'}</span>
        </div>
    );

    return (
        <div className="A4-page-container">
            <div id="dob-certificate" className="w-[210mm] h-[297mm] bg-white p-8 flex flex-col font-serif text-black relative">
                
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
                        
                        <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-base my-4">
                            <DetailItem label="Name of Student" value={student.name} />
                            <DetailItem label="Admission No." value={student.admissionNo} />
                            <DetailItem label="Father’s Name" value={student.fathersName} />
                            <DetailItem label="Class/Section" value={`${student.className} '${student.section}'`} />
                            <DetailItem label="Mother’s Name" value={student.mothersName} />
                            <DetailItem label="Date of Birth (figures)" value={dobDdMmYyyy} />
                            <DetailItem label="Date of Birth (words)" value={dobInWords} colSpan={2} />
                        </div>

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
                </div>
            </div>
        </div>
    );
};

export default DobCertificate;
