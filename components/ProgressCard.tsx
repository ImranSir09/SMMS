import React from 'react';
import { Student, SchoolDetails, Mark, StudentExamData } from '../types';
import { formatDateLong } from '../utils/formatters';
import { MountainIcon, SkyIcon, StreamIcon } from './icons';

interface ProgressCardProps {
  student: Student;
  marks: Mark[];
  schoolDetails: SchoolDetails;
  studentExamData: StudentExamData;
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

const ProgressCard: React.FC<ProgressCardProps> = ({ student, marks, schoolDetails, studentExamData, examName }) => {
    
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
                fa1: mark.fa1, fa2: mark.fa2, fa3: mark.fa3, fa4: mark.fa4, fa5: mark.fa5, fa6: mark.fa6,
                faTotal,
                coCurricular: mark.coCurricular,
                summative: mark.summative,
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
    <div id="progress-card" className="w-[210mm] h-[297mm] bg-white p-4 font-sans text-slate-900">
        <div className="w-full h-full border-2 border-slate-800 p-3 flex flex-col relative">
            <div className="absolute inset-2 border border-slate-400"></div>

            <header className="text-center mb-2 z-10">
                {schoolDetails.logo && <img src={schoolDetails.logo} alt="School Logo" className="h-28 w-28 mx-auto object-contain mb-1" />}
                <h1 className="text-2xl font-bold font-gothic tracking-wide">{schoolDetails.name.toUpperCase()}</h1>
                <p className="text-xs">Email: {schoolDetails.email} | UDISE: {schoolDetails.udiseCode}</p>
            </header>

            <div className="text-center border-y-2 border-slate-800 py-1 mb-2 z-10">
                <h2 className="text-lg font-semibold tracking-widest">ACADEMIC PROGRESS REPORT</h2>
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

            <table className="w-full border-collapse border border-slate-500 text-xs z-10">
                <thead className="bg-slate-100">
                    <tr>
                        <th className={headerCellStyle} rowSpan={2}>Subject</th>
                        <th className={headerCellStyle} colSpan={6}>Formative Assessment (out of 5 each)</th>
                        <th className="border-r border-slate-500" />
                        <th className={headerCellStyle} rowSpan={2}>Co-Curricular (20)</th>
                        <th className={headerCellStyle} rowSpan={2}>Summative (50)</th>
                        <th className={headerCellStyle} rowSpan={2}>Total (100)</th>
                        <th className={headerCellStyle} rowSpan={2}>Grade</th>
                    </tr>
                    <tr className="bg-slate-50">
                        {[1,2,3,4,5,6].map(i => <th key={i} className={`${headerCellStyle} font-medium`}>FA{i}</th>)}
                        <th className={`${headerCellStyle} font-semibold`}>Total FA (30)</th>
                    </tr>
                </thead>
                <tbody>
                    {processedMarks.map(m => (
                        <tr key={m.id}>
                            <td className={labelCellStyle}>{m.subject}</td>
                            <td className={cellStyle}>{m.fa1 ?? '-'}</td><td className={cellStyle}>{m.fa2 ?? '-'}</td>
                            <td className={cellStyle}>{m.fa3 ?? '-'}</td><td className={cellStyle}>{m.fa4 ?? '-'}</td>
                            <td className={cellStyle}>{m.fa5 ?? '-'}</td><td className={cellStyle}>{m.fa6 ?? '-'}</td>
                            <td className={`${cellStyle} font-semibold`}>{m.faTotal ?? '-'}</td>
                            <td className={cellStyle}>{m.coCurricular ?? '-'}</td>
                            <td className={cellStyle}>{m.summative ?? '-'}</td>
                            <td className={`${cellStyle} font-bold bg-slate-50`}>{m.total100 ?? '-'}</td>
                            <td className={`${cellStyle} font-bold`}>{m.grade ?? '-'}</td>
                        </tr>
                    ))}
                     {Array.from({ length: Math.max(0, 6 - processedMarks.length) }).map((_, i) => (
                        <tr key={`empty-${i}`}><td className={labelCellStyle}>&nbsp;</td>{Array.from({ length: 11 }).map((_, j) => <td key={j} className={cellStyle}></td>)}</tr>
                    ))}
                </tbody>
            </table>
            
            <div className="flex-grow mt-2 grid grid-cols-2 gap-x-4 text-xs z-10">
                <div className="flex flex-col gap-y-2">
                    <table className="w-full border-collapse border border-slate-500">
                         <tbody>
                            <tr><td className={labelCellStyle}>Total Marks Obtained</td><td className={`${cellStyle} font-bold`}>{grandTotalObtained} / {grandMaxMarks}</td></tr>
                            <tr><td className={labelCellStyle}>Overall Percentage</td><td className={`${cellStyle} font-bold`}>{overallPercentage.toFixed(2)}%</td></tr>
                            <tr><td className={labelCellStyle}>Overall Grade</td><td className={`${cellStyle} font-bold`}>{overallGrade}</td></tr>
                            <tr><td className={labelCellStyle}>Attendance</td><td className={`${cellStyle} font-semibold`}>___ / ___</td></tr>
                            <tr><td className={labelCellStyle}>Result</td><td className={`${cellStyle} font-bold text-base`}>{result}</td></tr>
                         </tbody>
                    </table>
                     <div className="flex-grow border border-slate-500 p-1">
                        <p className="font-semibold">Teacher's Remarks:</p>
                        <p className="pt-1">{studentExamData.remarks || '...'}</p>
                    </div>
                </div>
                <div className="flex flex-col gap-y-2">
                    <table className="w-full border-collapse border border-slate-500">
                         <thead><tr><th colSpan={2} className={headerCellStyle}>Grade Key</th></tr></thead>
                         <tbody>
                            <tr><td className={labelCellStyle}>&gt;85% : A+ (Excellent)</td><td className={labelCellStyle}>&gt;70% : A (Very Good)</td></tr>
                            <tr><td className={labelCellStyle}>&gt;55% : B (Good)</td><td className={labelCellStyle}>&gt;40% : C (Fair)</td></tr>
                            <tr><td className={labelCellStyle}>&gt;33% : D (Satisfactory)</td><td className={labelCellStyle}>&lt;33% : E (Needs Improvement)</td></tr>
                         </tbody>
                    </table>
                     <div className="border border-slate-500 p-1">
                        <p className="font-semibold text-center bg-slate-100">Proficiency Level Achieved</p>
                        <div className="flex justify-around items-center pt-2">
                            <div className="flex flex-col items-center gap-1">
                                <StreamIcon className={`w-6 h-6 ${studentExamData.proficiencyLevel === 'Stream' ? 'text-blue-600' : 'text-slate-300'}`} />
                                <p className={studentExamData.proficiencyLevel === 'Stream' ? 'font-bold' : ''}>Stream</p>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <MountainIcon className={`w-6 h-6 ${studentExamData.proficiencyLevel === 'Mountain' ? 'text-blue-600' : 'text-slate-300'}`} />
                                <p className={studentExamData.proficiencyLevel === 'Mountain' ? 'font-bold' : ''}>Mountain</p>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <SkyIcon className={`w-6 h-6 ${studentExamData.proficiencyLevel === 'Sky' ? 'text-blue-600' : 'text-slate-300'}`} />
                                <p className={studentExamData.proficiencyLevel === 'Sky' ? 'font-bold' : ''}>Sky</p>
                            </div>
                        </div>
                    </div>
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

export default ProgressCard;