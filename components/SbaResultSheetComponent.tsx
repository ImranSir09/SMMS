import React from 'react';
import { Student, SchoolDetails, Mark } from '../types';

interface ReportProps {
    students: Student[];
    schoolDetails: SchoolDetails;
    className: string;
    marksMap: Map<number, Map<string, Mark>>;
    session: string;
}

const SUBJECTS = ['English', 'Mathematics', 'Science', 'Social Science/EVS', 'Urdu/Hindi', 'Kashmiri/Dogri/Punjabi'];

const SbaResultSheetComponent: React.FC<ReportProps> = ({ students, schoolDetails, className, marksMap, session }) => {

    const thStyle = "p-1 border border-black font-semibold text-[9px] align-middle";
    const tdStyle = "p-1 border border-black text-center text-[8px] align-middle";

    return (
        <div className="bg-white text-black font-sans" style={{ width: '420mm', minHeight: '297mm', padding: '1cm' }}>
            <header className="text-center mb-2">
                {schoolDetails.logo && <img src={schoolDetails.logo} alt="logo" className="w-20 h-20 mx-auto" />}
                <h1 className="text-2xl font-bold">{schoolDetails.name}</h1>
                <h2 className="text-lg font-semibold">Result register for Class: {className} for the Session {session}</h2>
            </header>
            <table className="w-full border-collapse border border-black">
                <thead>
                    <tr>
                        {['Roll No', 'Reg No', 'Adm No', 'Aadhar No', 'Name', 'Father\'s Name', 'Mother\'s Name', 'Address', 'Category', 'D.O.B', 'Contact No'].map(h => 
                            <th key={h} className={thStyle} style={{ writingMode: 'vertical-rl' }}>{h}</th>
                        )}
                        {SUBJECTS.map(subject => (
                            <React.Fragment key={subject}>
                                <th colSpan={9} className={`${thStyle} bg-gray-200`}>{subject}</th>
                            </React.Fragment>
                        ))}
                        <th className={thStyle} style={{ writingMode: 'vertical-rl' }}>Grand Total</th>
                        <th className={thStyle} style={{ writingMode: 'vertical-rl' }}>Grade</th>
                        <th className={thStyle} style={{ writingMode: 'vertical-rl' }}>Remarks</th>
                    </tr>
                    <tr>
                         {Array(11).fill(null).map((_, i) => <th key={i} className={thStyle}></th>)}
                         {SUBJECTS.map(subject => (
                            <React.Fragment key={subject}>
                                {['F1', 'F2', 'F3', 'F4', 'F5', 'F6'].map(fa => <th key={fa} className={thStyle}>{fa}</th>)}
                                <th className={`${thStyle} bg-gray-100`}>Total FA</th>
                                <th className={thStyle}>Co-Curr</th>
                                <th className={thStyle}>Summative</th>
                            </React.Fragment>
                         ))}
                         {Array(3).fill(null).map((_, i) => <th key={i} className={thStyle}></th>)}
                    </tr>
                </thead>
                <tbody>
                    {students.map(student => {
                        const studentMarks = marksMap.get(student.id!) || new Map();
                        let grandTotal = 0;
                        const totalSubjects = SUBJECTS.length;
                        
                        return (
                            <tr key={student.id}>
                                <td className={tdStyle}>{student.rollNo}</td>
                                <td className={tdStyle}>{/* Reg No not in model */}</td>
                                <td className={tdStyle}>{student.admissionNo}</td>
                                <td className={tdStyle}>{student.aadharNo}</td>
                                <td className={`${tdStyle} text-left`}>{student.name}</td>
                                <td className={`${tdStyle} text-left`}>{student.fathersName}</td>
                                <td className={`${tdStyle} text-left`}>{student.mothersName}</td>
                                <td className={`${tdStyle} text-left`}>{student.address}</td>
                                <td className={tdStyle}>{student.category}</td>
                                <td className={tdStyle}>{student.dob}</td>
                                <td className={tdStyle}>{student.contact}</td>
                                {SUBJECTS.map(subject => {
                                    const mark = studentMarks.get(subject);
                                    const faTotal = (mark?.fa1||0) + (mark?.fa2||0) + (mark?.fa3||0) + (mark?.fa4||0) + (mark?.fa5||0) + (mark?.fa6||0);
                                    const subjectTotal = faTotal + (mark?.coCurricular||0) + (mark?.summative||0);
                                    grandTotal += subjectTotal;
                                    return (
                                        <React.Fragment key={subject}>
                                            <td className={tdStyle}>{mark?.fa1}</td>
                                            <td className={tdStyle}>{mark?.fa2}</td>
                                            <td className={tdStyle}>{mark?.fa3}</td>
                                            <td className={tdStyle}>{mark?.fa4}</td>
                                            <td className={tdStyle}>{mark?.fa5}</td>
                                            <td className={tdStyle}>{mark?.fa6}</td>
                                            <td className={`${tdStyle} font-bold bg-gray-100`}>{faTotal || ''}</td>
                                            <td className={tdStyle}>{mark?.coCurricular}</td>
                                            <td className={tdStyle}>{mark?.summative}</td>
                                        </React.Fragment>
                                    )
                                })}
                                <td className={`${tdStyle} font-bold`}>{grandTotal || ''}</td>
                                <td className={tdStyle}>{/* Grade logic here */}</td>
                                <td className={tdStyle}>{/* Remarks logic here */}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default SbaResultSheetComponent;
