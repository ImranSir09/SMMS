import React from 'react';
import { Student, SchoolDetails, Mark } from '../types';
import { SUBJECTS } from '../constants';

interface ReportProps {
    students: Student[];
    schoolDetails: SchoolDetails;
    className: string;
    marksMap: Map<number, Map<string, Mark>>;
    session: string;
}

const SbaResultSheetComponent: React.FC<ReportProps> = ({ students, schoolDetails, className, marksMap, session }) => {

    const thStyle: React.CSSProperties = {
        padding: '4px',
        border: '1px solid black',
        fontWeight: 'bold',
        fontSize: '9px',
        verticalAlign: 'middle',
    };
    const tdStyle: React.CSSProperties = {
        padding: '4px',
        border: '1px solid black',
        textAlign: 'center',
        fontSize: '8px',
        verticalAlign: 'middle',
    };
    const verticalThStyle: React.CSSProperties = { ...thStyle, writingMode: 'vertical-rl', textOrientation: 'mixed' };

    const getGrade = (percentage: number): string => {
        if (percentage > 85) return 'A+';
        if (percentage > 70) return 'A';
        if (percentage > 55) return 'B';
        if (percentage > 40) return 'C';
        if (percentage >= 33) return 'D';
        return 'E';
    };

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
                            <th key={h} style={verticalThStyle}>{h}</th>
                        )}
                        {SUBJECTS.map(subject => (
                            <th colSpan={10} key={subject} style={{...thStyle, backgroundColor: '#e5e7eb'}}>{subject}</th>
                        ))}
                        <th style={verticalThStyle}>Grand Total</th>
                        <th style={verticalThStyle}>Grade</th>
                        <th style={verticalThStyle}>Remarks</th>
                    </tr>
                    <tr>
                         {Array(11).fill(null).map((_, i) => <th key={i} style={thStyle}></th>)}
                         {SUBJECTS.map(subject => (
                            <React.Fragment key={subject}>
                                {['F1', 'F2', 'F3', 'F4', 'F5', 'F6'].map(fa => <th key={fa} style={verticalThStyle}>{fa}</th>)}
                                <th style={{...verticalThStyle, backgroundColor: '#f3f4f6'}}>Total FA</th>
                                <th style={verticalThStyle}>Co-Curr</th>
                                <th style={verticalThStyle}>Summative</th>
                                <th style={{...verticalThStyle, backgroundColor: '#f3f4f6'}}>Total</th>
                            </React.Fragment>
                         ))}
                         {Array(3).fill(null).map((_, i) => <th key={i} style={thStyle}></th>)}
                    </tr>
                </thead>
                <tbody>
                    {students.map(student => {
                        const studentMarks = marksMap.get(student.id!) || new Map();
                        let grandTotal = 0;
                        const grandMaxMarks = SUBJECTS.length * 100;
                        
                        return (
                            <tr key={student.id}>
                                <td style={tdStyle}>{student.rollNo}</td>
                                <td style={tdStyle}>{/* Reg No not in model */}</td>
                                <td style={tdStyle}>{student.admissionNo}</td>
                                <td style={tdStyle}>{student.aadharNo}</td>
                                <td style={{...tdStyle, textAlign: 'left'}}>{student.name}</td>
                                <td style={{...tdStyle, textAlign: 'left'}}>{student.fathersName}</td>
                                <td style={{...tdStyle, textAlign: 'left'}}>{student.mothersName}</td>
                                <td style={{...tdStyle, textAlign: 'left'}}>{student.address}</td>
                                <td style={tdStyle}>{student.category}</td>
                                <td style={tdStyle}>{student.dob}</td>
                                <td style={tdStyle}>{student.contact}</td>
                                {SUBJECTS.map(subject => {
                                    const mark = studentMarks.get(subject);
                                    const faTotal = (mark?.fa1||0) + (mark?.fa2||0) + (mark?.fa3||0) + (mark?.fa4||0) + (mark?.fa5||0) + (mark?.fa6||0);
                                    const subjectTotal = faTotal + (mark?.coCurricular||0) + (mark?.summative||0);
                                    grandTotal += subjectTotal;
                                    return (
                                        <React.Fragment key={subject}>
                                            <td style={tdStyle}>{mark?.fa1 ?? ''}</td>
                                            <td style={tdStyle}>{mark?.fa2 ?? ''}</td>
                                            <td style={tdStyle}>{mark?.fa3 ?? ''}</td>
                                            <td style={tdStyle}>{mark?.fa4 ?? ''}</td>
                                            <td style={tdStyle}>{mark?.fa5 ?? ''}</td>
                                            <td style={tdStyle}>{mark?.fa6 ?? ''}</td>
                                            <td style={{...tdStyle, fontWeight: 'bold', backgroundColor: '#f3f4f6'}}>{faTotal || ''}</td>
                                            <td style={tdStyle}>{mark?.coCurricular ?? ''}</td>
                                            <td style={tdStyle}>{mark?.summative ?? ''}</td>
                                            <td style={{...tdStyle, fontWeight: 'bold', backgroundColor: '#f3f4f6'}}>{subjectTotal || ''}</td>
                                        </React.Fragment>
                                    )
                                })}
                                <td style={{...tdStyle, fontWeight: 'bold'}}>{grandTotal || ''}</td>
                                <td style={{...tdStyle, fontWeight: 'bold'}}>{grandMaxMarks > 0 ? getGrade((grandTotal / grandMaxMarks) * 100) : ''}</td>
                                <td style={tdStyle}>{/* Remarks logic here */}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default SbaResultSheetComponent;