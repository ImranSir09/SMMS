

import React from 'react';
// FIX: Changed import from HolisticRecord to HPCReportData to align with the updated types and database schema.
import { Student, SchoolDetails, Mark, HPCReportData } from '../types';
import { formatDateLong } from '../utils/formatters';

interface NepProgressCardProps {
  student: Student;
  marks: Mark[];
  hpcReport: HPCReportData | null;
  schoolDetails: SchoolDetails;
  examName: string;
}

const cellStyle = "border border-slate-500 p-1 text-center align-middle";
const headerCellStyle = `${cellStyle} font-semibold bg-slate-100`;
const labelCellStyle = `${cellStyle} font-semibold text-left`;

const getGrade = (percentage: number): string => {
    if (percentage > 90) return 'A+';
    if (percentage > 80) return 'A';
    if (percentage > 70) return 'B+';
    if (percentage > 60) return 'B';
    if (percentage > 50) return 'C+';
    if (percentage > 40) return 'C';
    if (percentage >= 33) return 'D';
    return 'E';
};

const NepProgressCard: React.FC<NepProgressCardProps> = ({ student, marks, hpcReport, schoolDetails, examName }) => {
    
    const SUBJECT_ORDER = ['English', 'Math', 'Science', 'Social Science', 'Urdu', 'Kashmiri'];
    const displayedSubjects = marks.length > 0 ? SUBJECT_ORDER.filter(s => marks.some(m => m.subject === s)) : [];

    let grandTotalObtained = 0;
    const maxMarksPerSubject = 50; // As per NEP, usually out of 50 for terms
    let grandMaxMarks = 0;

    const processedMarks = displayedSubjects.map(subjectName => {
        const mark = marks.find(m => m.subject === subjectName);
        if (mark) {
            grandMaxMarks += maxMarksPerSubject;
            // Assuming summative is the term mark for this card
            const total50 = (mark.summative || 0); 
            grandTotalObtained += total50;
            const grade = getGrade((total50 / maxMarksPerSubject) * 100);
            return {
                subject: mark.subject,
                total50,
                grade,
            };
        }
        return null; 
    }).filter(Boolean) as (NonNullable<ReturnType<typeof processedMarks[number]>>)[];
    
    const overallPercentage = grandMaxMarks > 0 ? (grandTotalObtained / grandMaxMarks) * 100 : 0;
    const overallGrade = getGrade(overallPercentage);
    const result = overallPercentage >= 33 ? 'Passed' : 'Needs Improvement';

    const getHolisticGradeForAspect = (aspect: string) => {
        const summary = hpcReport?.summaries?.[aspect];
        // This is a simplification; we're just picking one of the ability ratings.
        // A more complex mapping from Awareness/Sensitivity/Creativity to a single grade might be needed.
        return summary?.awareness || '-'; 
    };

    const DetailItem: React.FC<{ label: string; value: string | undefined }> = ({ label, value }) => (
        <>
            <span className="font-semibold text-slate-600">{label}:</span>
            <span className="font-bold text-slate-800">{value}</span>
        </>
    );

    return (
    <div id="nep-progress-card" className="w-[210mm] h-[297mm] bg-white p-4 font-sans text-slate-900">
        <div className="w-full h-full border-2 border-slate-800 p-3 flex flex-col relative">
            
            <header className="text-center mb-2 z-10">
                {schoolDetails.logo && <img src={schoolDetails.logo} alt="School Logo" className="h-28 w-28 mx-auto object-contain mb-1" />}
                <h1 className="text-2xl font-bold font-gothic tracking-wide">{schoolDetails.name.toUpperCase()}</h1>
                <p className="text-xs">{schoolDetails.address}</p>
                 <p className="text-xs text-gray-500 mt-1">UDISE: {schoolDetails.udiseCode}</p>
            </header>

            <div className="text-center border-y-2 border-slate-800 py-1 mb-2 z-10">
                <h2 className="text-lg font-semibold tracking-widest">HOLISTIC PROGRESS CARD</h2>
                <p className="text-sm">SESSION 2024-25 ({examName})</p>
            </div>

            <div className="grid grid-cols-4 gap-x-4 gap-y-1 text-xs mb-2 z-10">
                <DetailItem label="Student's Name" value={student.name} />
                <DetailItem label="Admission No." value={student.admissionNo} />
                <DetailItem label="Father's Name" value={student.fathersName} />
                <DetailItem label="Roll No." value={student.rollNo} />
                <DetailItem label="Class & Section" value={`${student.className} '${student.section}'`} />
                <DetailItem label="Date of Birth" value={formatDateLong(student.dob)} />
            </div>
            
            <div className="grid grid-cols-2 gap-x-4 text-xs z-10">
                {/* Part 1: Scholastic Areas */}
                <div>
                    <h3 className={headerCellStyle}>Part-1: Scholastic Areas</h3>
                    <table className="w-full border-collapse border border-slate-500">
                        <thead>
                            <tr>
                                <th className={headerCellStyle}>Subject</th>
                                <th className={headerCellStyle}>Marks Obtd. (50)</th>
                                <th className="border border-slate-500 p-1 text-center align-middle font-semibold bg-slate-100">Grade</th>
                            </tr>
                        </thead>
                         <tbody>
                            {processedMarks.map(m => (
                                <tr key={m.subject}>
                                    <td className={labelCellStyle}>{m.subject}</td>
                                    <td className={cellStyle}>{m.total50}</td>
                                    <td className={`${cellStyle} font-bold`}>{m.grade}</td>
                                </tr>
                            ))}
                             {Array.from({ length: Math.max(0, 6 - processedMarks.length) }).map((_, i) => (
                                <tr key={`empty-${i}`}><td className={labelCellStyle}>&nbsp;</td><td className={cellStyle}></td><td className={cellStyle}></td></tr>
                            ))}
                             <tr className="bg-slate-100 font-bold">
                                <td className={labelCellStyle}>Grand Total</td>
                                <td className={cellStyle}>{grandTotalObtained} / {grandMaxMarks}</td>
                                <td className={cellStyle}>{overallGrade}</td>
                             </tr>
                        </tbody>
                    </table>
                </div>

                {/* Part 2: Co-Scholastic Areas */}
                 <div>
                    <h3 className={headerCellStyle}>Part-2: Co-Scholastic Areas</h3>
                     <table className="w-full border-collapse border border-slate-500">
                        <thead>
                            <tr>
                                <th className={headerCellStyle}>Area</th>
                                <th className={headerCellStyle}>Grade (A/B/C)</th>
                            </tr>
                        </thead>
                         <tbody>
                            <tr><td className={`${labelCellStyle} bg-slate-50`} colSpan={2}>Co-Curricular Activities</td></tr>
                            <tr><td className={labelCellStyle}>Art Education</td><td className={cellStyle}>{getHolisticGradeForAspect('Art Education')}</td></tr>
                            <tr><td className={labelCellStyle}>Health & Physical Ed.</td><td className={cellStyle}>{getHolisticGradeForAspect('Health & Physical Ed.')}</td></tr>
                            
                            <tr><td className={`${labelCellStyle} bg-slate-50`} colSpan={2}>Personal & Social Qualities</td></tr>
                            <tr><td className={labelCellStyle}>Discipline</td><td className={cellStyle}>{getHolisticGradeForAspect('Discipline')}</td></tr>
                            <tr><td className={labelCellStyle}>Punctuality</td><td className={cellStyle}>{getHolisticGradeForAspect('Punctuality')}</td></tr>
                            <tr><td className={labelCellStyle}>Collaboration</td><td className={cellStyle}>{getHolisticGradeForAspect('Collaboration')}</td></tr>
                            <tr><td className={labelCellStyle}>Leadership</td><td className={cellStyle}>{getHolisticGradeForAspect('Leadership')}</td></tr>
                            <tr><td className={labelCellStyle}>Curiosity</td><td className={cellStyle}>{getHolisticGradeForAspect('Curiosity')}</td></tr>
                         </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-2 text-xs border border-slate-500 p-1 z-10">
                <p className="font-semibold">Teacher's Remarks:</p>
                <p className="pt-1 h-8">...</p>
            </div>
             <div className="mt-2 text-center text-xs z-10">
                 <strong>Result:</strong> <span className="font-bold text-sm tracking-wider">{result}</span>
            </div>

            <footer className="mt-auto flex justify-between items-end z-10 pt-4 text-xs">
                <div className="text-left">
                    <p className="font-semibold">Date of Issue:</p>
                    <p>{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                </div>
                <div className="text-center">
                    <div className="border-t-2 border-slate-600 w-40 mt-8 mb-1"></div>
                    <p className="font-semibold">Class Teacher</p>
                </div>
                 <div className="text-center">
                    <div className="border-t-2 border-slate-600 w-40 mt-8 mb-1"></div>
                    <p className="font-semibold">Principal / Headmaster</p>
                </div>
            </footer>
        </div>
    </div>
  );
};

export default NepProgressCard;
