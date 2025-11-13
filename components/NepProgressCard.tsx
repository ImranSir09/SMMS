

import React from 'react';
import { Student, SchoolDetails, Mark, HPCReportData } from '../types';
import { formatDateLong } from '../utils/formatters';

interface NepProgressCardProps {
  student: Student;
  marks: Mark[];
  schoolDetails: SchoolDetails;
  hpcReport: HPCReportData | null;
  examName: string;
}

const cellStyle = "border border-slate-500 p-1 text-center align-middle";
const headerCellStyle = `${cellStyle} font-semibold bg-slate-100`;
const labelCellStyle = `${cellStyle} font-semibold text-left`;

const getGradeAndColor = (percentage: number): { grade: string; color: string } => {
    if (percentage > 85) return { grade: 'A+', color: 'bg-green-600' };
    if (percentage > 70) return { grade: 'A', color: 'bg-green-500' };
    if (percentage > 55) return { grade: 'B', color: 'bg-blue-500' };
    if (percentage > 40) return { grade: 'C', color: 'bg-yellow-500' };
    if (percentage >= 33) return { grade: 'D', color: 'bg-orange-500' };
    return { grade: 'E', color: 'bg-red-500' };
};

const NepProgressCard: React.FC<NepProgressCardProps> = ({ student, marks, schoolDetails, hpcReport, examName }) => {
    
    const SUBJECT_ORDER = ['English', 'Math', 'Science', 'Social Science', 'Urdu', 'Kashmiri'];
    const displayedSubjects = marks.length > 0 ? SUBJECT_ORDER.filter(s => marks.some(m => m.subject === s)) : [];

    let grandTotalObtained = 0;
    const maxMarksPerSubject = 100;
    let grandMaxMarks = 0;

    const processedMarks = displayedSubjects.map(subjectName => {
        const mark = marks.find(m => m.subject === subjectName);
        if (mark) {
            grandMaxMarks += maxMarksPerSubject;
            const faTotal = (mark.fa1 || 0) + (mark.fa2 || 0) + (mark.fa3 || 0) + (mark.fa4 || 0) + (mark.fa5 || 0) + (mark.fa6 || 0);
            const total100 = faTotal + (mark.coCurricular || 0) + (mark.summative || 0);
            grandTotalObtained += total100;
            const { grade } = getGradeAndColor(total100);
            return {
                id: mark.id,
                subject: mark.subject,
                total100,
                grade,
            };
        }
        return null; 
    }).filter(Boolean) as (NonNullable<ReturnType<typeof processedMarks[number]>>)[];
    
    const overallPercentage = grandMaxMarks > 0 ? (grandTotalObtained / grandMaxMarks) * 100 : 0;
    const { grade: overallGrade } = getGradeAndColor(overallPercentage);
    const result = overallPercentage >= 33 ? 'Passed' : 'Failed';

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
            </header>

            <div className="text-center border-y-2 border-slate-800 py-1 mb-2 z-10">
                <h2 className="text-lg font-semibold tracking-widest">NEP PROGRESS REPORT</h2>
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
            
            <h3 className="text-sm font-bold text-center bg-slate-100 border border-slate-500 py-1">Scholastic Areas</h3>
            <table className="w-full border-collapse border border-slate-500 text-xs z-10">
                <thead>
                    <tr>
                        <th className={headerCellStyle}>Subject</th>
                        <th className={headerCellStyle}>Marks (100)</th>
                        <th className={headerCellStyle}>Grade</th>
                    </tr>
                </thead>
                <tbody>
                    {processedMarks.map(m => (
                        <tr key={m.id}>
                            <td className={labelCellStyle}>{m.subject}</td>
                            <td className={`${cellStyle} font-bold bg-slate-50`}>{m.total100 ?? '-'}</td>
                            <td className={`${cellStyle} font-bold`}>{m.grade ?? '-'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <h3 className="text-sm font-bold text-center bg-slate-100 border border-slate-500 py-1 mt-2">Co-Scholastic & Holistic Progress</h3>
            {hpcReport ? (
                <table className="w-full border-collapse border border-slate-500 text-xs z-10">
                    <thead>
                        <tr>
                            <th className={headerCellStyle}>Domain/Subject</th>
                            <th className={headerCellStyle}>Awareness</th>
                            <th className="headerCellStyle">Sensitivity</th>
                            <th className={headerCellStyle}>Creativity</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.keys(hpcReport.summaries).map((domain) => {
                            const summary = hpcReport.summaries[domain];
                            return (
                                <tr key={domain}>
                                    <td className={labelCellStyle}>{domain}</td>
                                    <td className={cellStyle}>{summary.awareness || '-'}</td>
                                    <td className={cellStyle}>{summary.sensitivity || '-'}</td>
                                    <td className={cellStyle}>{summary.creativity || '-'}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            ) : <p className="text-center text-xs p-2 border border-slate-500">No holistic data available.</p>}
            
            <div className="flex-grow mt-2 grid grid-cols-2 gap-x-4 text-xs z-10">
                 <table className="w-full border-collapse border border-slate-500 h-fit">
                     <tbody>
                        <tr><td className={labelCellStyle}>Total Marks</td><td className={`${cellStyle} font-bold`}>{grandTotalObtained} / {grandMaxMarks}</td></tr>
                        <tr><td className={labelCellStyle}>Percentage</td><td className={`${cellStyle} font-bold`}>{overallPercentage.toFixed(2)}%</td></tr>
                        <tr><td className={labelCellStyle}>Grade</td><td className={`${cellStyle} font-bold`}>{overallGrade}</td></tr>
                        <tr><td className={labelCellStyle}>Result</td><td className={`${cellStyle} font-bold text-base`}>{result}</td></tr>
                     </tbody>
                </table>
                 <div className="border border-slate-500 p-1">
                    <p className="font-semibold">Teacher's Remarks:</p>
                    <p className="pt-1">{hpcReport?.summaries['Overall']?.observationalNotes || '...'}</p>
                </div>
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
            <p className="text-center text-[9px] text-gray-600 mt-1 z-10">This document was created from School Management Mobile System by Imran Gani Mugloo Teacher Zone Vailoo</p>
        </div>
    </div>
  );
};

export default NepProgressCard;