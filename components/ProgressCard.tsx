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

const cellStyle = "border border-black p-1 text-center align-middle text-xs";
const headerCellStyle = `${cellStyle} font-semibold bg-gray-200`;
const labelCellStyle = `${cellStyle} font-semibold text-left`;

const getGrade = (percentage: number): string => {
    if (percentage > 85) return 'A+';
    if (percentage > 70) return 'A';
    if (percentage > 55) return 'B';
    if (percentage > 40) return 'C';
    if (percentage >= 33) return 'D';
    return 'E';
};

const ProgressCard: React.FC<ProgressCardProps> = ({ student, marks, schoolDetails, studentExamData, examName }) => {
    
    let grandTotalObtained = 0;
    const maxMarksPerSubject = 100;
    const grandMaxMarks = marks.length * maxMarksPerSubject;

    const processedMarks = marks.map(mark => {
        const faTotal = (mark.fa1 || 0) + (mark.fa2 || 0) + (mark.fa3 || 0) + (mark.fa4 || 0) + (mark.fa5 || 0) + (mark.fa6 || 0);
        const total100 = faTotal + (mark.coCurricular || 0) + (mark.summative || 0);
        grandTotalObtained += total100;
        return {
            ...mark,
            faTotal,
            total100,
            grade: getGrade(total100),
        };
    });
    
    const overallPercentage = grandMaxMarks > 0 ? (grandTotalObtained / grandMaxMarks) * 100 : 0;
    const overallGrade = getGrade(overallPercentage);
    const result = overallPercentage >= 33 ? 'Passed' : 'Failed';

    return (
    <div id="progress-card" className="w-[210mm] h-[297mm] bg-white p-4 font-sans text-black">
        <div className="w-full h-full border-2 border-black p-2 flex flex-col">
            <header className="text-center border-b-2 border-black pb-1">
                <p className="text-xs">UDISE: {schoolDetails.udiseCode}</p>
                <h1 className="text-xl font-bold">OFFICE OF THE {schoolDetails.name.toUpperCase()}</h1>
                <h2 className="text-lg font-bold">HOLISTIC PROGRESS CARD FOR THE YEAR {new Date().getFullYear()}</h2>
            </header>

            {/* Student Details */}
            <table className="w-full my-1 border-collapse text-xs">
                <tbody>
                    <tr>
                        <td className="font-bold p-1 w-1/5">Student Name:</td>
                        <td className="border-b border-black w-2/5">{student.name}</td>
                        <td className="font-bold p-1 w-1/5 text-right">Adm. No:</td>
                        <td className="border-b border-black w-1/5">{student.admissionNo}</td>
                    </tr>
                    <tr>
                        <td className="font-bold p-1">Father's Name:</td>
                        <td className="border-b border-black">{student.guardianInfo.split(',')[0]}</td>
                        <td className="font-bold p-1 text-right">D.O.B:</td>
                        <td className="border-b border-black">{formatDateLong(student.dob)}</td>
                    </tr>
                    <tr>
                        <td className="font-bold p-1">Mother's Name:</td>
                        <td className="border-b border-black"></td>
                        <td className="font-bold p-1 text-right">Class:</td>
                        <td className="border-b border-black">{student.className}</td>
                    </tr>
                     <tr>
                        <td className="font-bold p-1">Academic Session:</td>
                        <td className="border-b border-black">{examName}</td>
                        <td className="font-bold p-1 text-right">Roll No:</td>
                        <td className="border-b border-black">{student.rollNo}</td>
                    </tr>
                </tbody>
            </table>

            {/* Marks Table */}
            <table className="w-full border-collapse border border-black">
                <thead>
                    <tr className="bg-blue-100">
                        <th className={headerCellStyle} rowSpan={2}>Subject</th>
                        <th className={headerCellStyle} colSpan={6}>Formative Assessment</th>
                        <th className={headerCellStyle} rowSpan={2}>Total<br/>(30)</th>
                        <th className={headerCellStyle} rowSpan={2}>Co-Curricular<br/>Activities (20)</th>
                        <th className={headerCellStyle} rowSpan={2}>Summative<br/>Assessment (50)</th>
                        <th className={headerCellStyle} rowSpan={2}>Total<br/>(FA+CCA+SA)<br/>(100)</th>
                        <th className={headerCellStyle} rowSpan={2}>Grade</th>
                        <th className={headerCellStyle} rowSpan={2}>Proficiency Level<br/>(Stream/Mountain/Sky)</th>
                    </tr>
                    <tr className="bg-blue-100">
                        <th className={headerCellStyle}>FA1<br/>(5)</th>
                        <th className={headerCellStyle}>FA2<br/>(5)</th>
                        <th className={headerCellStyle}>FA3<br/>(5)</th>
                        <th className={headerCellStyle}>FA4<br/>(5)</th>
                        <th className={headerCellStyle}>FA5<br/>(5)</th>
                        <th className={headerCellStyle}>FA6<br/>(5)</th>
                    </tr>
                </thead>
                <tbody>
                    {processedMarks.map(m => (
                        <tr key={m.id}>
                            <td className={labelCellStyle}>{m.subject}</td>
                            <td className={cellStyle}>{m.fa1 ?? ''}</td>
                            <td className={cellStyle}>{m.fa2 ?? ''}</td>
                            <td className={cellStyle}>{m.fa3 ?? ''}</td>
                            <td className={cellStyle}>{m.fa4 ?? ''}</td>
                            <td className={cellStyle}>{m.fa5 ?? ''}</td>
                            <td className={cellStyle}>{m.fa6 ?? ''}</td>
                            <td className={cellStyle}>{m.faTotal}</td>
                            <td className={cellStyle}>{m.coCurricular ?? ''}</td>
                            <td className={cellStyle}>{m.summative ?? ''}</td>
                            <td className={cellStyle}>{m.total100}</td>
                            <td className={cellStyle}>{m.grade}</td>
                            <td className={cellStyle}>
                                {m.grade === 'A+' ? studentExamData.proficiencyLevel : ''}
                            </td>
                        </tr>
                    ))}
                    <tr className="bg-blue-200 font-bold">
                        <td colSpan={10} className={`${cellStyle} text-xl italic text-right pr-4`}>Grand Total</td>
                        <td className={cellStyle}>{grandTotalObtained}</td>
                        <td className={cellStyle}></td>
                        <td className={cellStyle}></td>
                    </tr>
                </tbody>
            </table>
            
            {/* Bottom Section */}
            <div className="flex-grow mt-2 grid grid-cols-3 gap-2 text-xs">
                {/* Left Side */}
                <div className="col-span-1 space-y-2">
                    <table className="w-full border-collapse border border-black">
                         <thead className="bg-green-100"><tr ><th colSpan={2} className={headerCellStyle}>Percentage/Grade Key</th></tr></thead>
                         <tbody>
                            <tr><td className={labelCellStyle}>&gt;85% to 100%</td><td className={cellStyle}>A+</td></tr>
                            <tr><td className={labelCellStyle}>&gt;70% to 85%</td><td className={cellStyle}>A</td></tr>
                            <tr><td className={labelCellStyle}>&gt;55% to 70%</td><td className={cellStyle}>B</td></tr>
                            <tr><td className={labelCellStyle}>&gt;40% to 55%</td><td className={cellStyle}>C</td></tr>
                            <tr><td className={labelCellStyle}>&gt;33% to 40%</td><td className={cellStyle}>D</td></tr>
                         </tbody>
                    </table>
                     <table className="w-full border-collapse border border-black">
                         <thead className="bg-green-100"><tr><th colSpan={3} className={headerCellStyle}>Level of Proficiency</th></tr></thead>
                         <tbody>
                            <tr>
                                <td className={labelCellStyle}>Stream</td>
                                <td className={`${cellStyle} w-1/3`}><StreamIcon className="w-8 h-8 mx-auto"/></td>
                                <td className={`${cellStyle} w-1/6`}>{studentExamData.proficiencyLevel === 'Stream' ? '✔️' : ''}</td>
                            </tr>
                             <tr>
                                <td className={labelCellStyle}>Mountain</td>
                                <td className={cellStyle}><MountainIcon className="w-8 h-8 mx-auto"/></td>
                                <td className={cellStyle}>{studentExamData.proficiencyLevel === 'Mountain' ? '✔️' : ''}</td>
                            </tr>
                             <tr>
                                <td className={labelCellStyle}>Sky</td>
                                <td className={cellStyle}><SkyIcon className="w-8 h-8 mx-auto"/></td>
                                <td className={cellStyle}>{studentExamData.proficiencyLevel === 'Sky' ? '✔️' : ''}</td>
                            </tr>
                         </tbody>
                    </table>
                </div>

                {/* Right Side */}
                <div className="col-span-2 space-y-2">
                     <table className="w-full border-collapse border border-black">
                         <tbody>
                            <tr><td className={labelCellStyle}>Total Marks Obtained</td><td className={`${cellStyle} bg-green-100`}>{grandTotalObtained}</td></tr>
                            <tr><td className={labelCellStyle}>Max. Marks</td><td className={`${cellStyle} bg-yellow-100`}>{grandMaxMarks}</td></tr>
                            <tr><td className={labelCellStyle}>Overall Percentage</td><td className={`${cellStyle} bg-green-100`}>{overallPercentage.toFixed(2)}%</td></tr>
                            <tr><td className={labelCellStyle}>Overall Grade</td><td className={`${cellStyle} bg-green-100`}>{overallGrade}</td></tr>
                            <tr><td className={labelCellStyle}>Result</td><td className={`${cellStyle} font-bold bg-blue-100`}>{result}</td></tr>
                         </tbody>
                    </table>
                    <table className="w-full h-24 border-collapse border border-black">
                         <tbody>
                            <tr><td className={`${labelCellStyle} w-2/5`}>Form Teacher Remarks</td><td className={cellStyle}>{studentExamData.remarks}</td></tr>
                         </tbody>
                    </table>
                     <table className="w-full flex-grow border-collapse border border-black">
                         <tbody>
                            <tr><td className={`${labelCellStyle} h-8`}>Sign. Class Teacher:</td></tr>
                            <tr><td className={`${labelCellStyle} h-8`}>Sign. Exam I/C:</td></tr>
                            <tr><td className={`${labelCellStyle} h-8`}>Parents Signature:</td></tr>
                         </tbody>
                    </table>
                </div>
            </div>
            <footer className="mt-auto text-right font-semibold italic text-sm pt-1">
                Seal & Signature of HOI
            </footer>
        </div>
    </div>
  );
};

export default ProgressCard;