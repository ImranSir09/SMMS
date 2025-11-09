import React from 'react';
import { Student, SchoolDetails } from '../types';

interface DobCertificateProps {
  student: Student;
  schoolDetails: SchoolDetails | null;
  photo?: string | null;
}

const DobCertificate: React.FC<DobCertificateProps> = ({ student, schoolDetails, photo }) => {
    
    // Helper function to convert a date string into a formatted word string
    const dateToWords = (dateString: string): string => {
        if (!dateString) return '_______________________';
        const date = new Date(dateString + 'T00:00:00');
        if (isNaN(date.getTime())) return '_______________________';

        const day = date.getDate();
        const month = date.toLocaleString('en-US', { month: 'long' });
        const year = date.getFullYear();

        const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
        const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

        const numberToWords = (num: number): string => {
            if (num === 0) return '';
            if (num < 20) return ones[num];
            if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + ones[num % 10] : '');
            if (num < 1000) return ones[Math.floor(num / 100)] + ' hundred' + (num % 100 !== 0 ? ' ' + numberToWords(num % 100) : '');
            return numberToWords(Math.floor(num / 1000)) + ' thousand' + (num % 1000 !== 0 ? ' ' + numberToWords(num % 1000) : '');
        };

        const dayToOrdinalWord = (d: number): string => {
            if (d === 0) return '';
            const ordinals = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteen', 'seventeenth', 'eighteenth', 'nineteenth', 'twentieth', 'twenty-first', 'twenty-second', 'twenty-third', 'twenty-fourth', 'twenty-fifth', 'twenty-sixth', 'twenty-seventh', 'twenty-eighth', 'twenty-ninth', 'thirtieth', 'thirty-first'];
            return ordinals[d - 1] || d.toString();
        };
        
        const yearToWords = (y: number): string => {
            if (y >= 1900 && y < 2000) {
                const firstPart = Math.floor(y / 100); // e.g., 19
                const secondPart = y % 100; // e.g., 99
                let yearText = numberToWords(firstPart) + ' hundred';
                if (secondPart > 0) {
                    yearText += ' ' + numberToWords(secondPart);
                }
                return yearText;
            }
            if (y >= 2000 && y < 2100) {
                 return numberToWords(y);
            }
            return y.toString();
        };

        const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

        const dayInWords = capitalize(dayToOrdinalWord(day));
        const yearInWords = yearToWords(year);
        
        return `${dayInWords} of ${month}, ${yearInWords}`;
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
                        <h1 className="text-3xl font-bold tracking-wider font-gothic">
                            {schoolDetails?.name || 'School Name'}
                        </h1>
                        <p className="text-sm text-gray-600">Email: {schoolDetails?.email} | UDISE: {schoolDetails?.udiseCode}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {schoolDetails?.phone && <span>Ph: {schoolDetails.phone}</span>}
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
                    <p className="text-center text-[9px] text-gray-600 mt-2">This document was created from School Management Mobile System by Imran Gani Mugloo Teacher Zone Vailoo</p>
                </div>
            </div>
        </div>
    );
};

export default DobCertificate;