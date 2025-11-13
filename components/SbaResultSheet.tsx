
import React from 'react';
import { Student, SchoolDetails, Mark } from '../types';
import { getGrade } from '../utils/formatters';
import { SUBJECTS } from '../constants';

interface SbaResultSheetProps {
  students: Student[];
  marks: Map<number, Mark[]>;
  schoolDetails: SchoolDetails;
  examName: string;
  className: string;
  maxTotal: number;
}

const SbaResultSheet: React.FC<SbaResultSheetProps> = ({ students, marks, schoolDetails, examName, className, maxTotal }) => {
    const relevantSubjects = SUBJECTS.slice(0, maxTotal === 500 ? 5 : 6);
    const subHeaders = ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'CCA', 'SA', 'Total'];

    return (
        <div className="A4-landscape-container">
            <div id="sba-result-sheet" className="w-[297mm] h-auto min-h-[210mm] bg-white p-4 font-sans text-black flex flex-col text-[8px]">
                <header className="text-center mb-2">
                    <h1 className="text-xl font-bold uppercase">{schoolDetails?.name || 'School Name'}</h1>
                    <p className="text-sm">{schoolDetails?.address || 'School Address'}</p>
                    <h2 className="text-lg font-semibold mt-2">Result Sheet - {examName} - Class {className}</h2>
                </header>

                <main className="flex-1">
                    <table className="w-full border-collapse border border-gray-600">
                        <thead>
                            <tr className="bg-gray-200">
                                <th rowSpan={2} className="border border-gray-600 p-1 font-bold">R.No</th>
                                <th rowSpan={2} className="border border-gray-600 p-1 font-bold text-left">Student Name</th>
                                {relevantSubjects.map(subject => (
                                    <th key={subject} colSpan={subHeaders.length} className="border border-gray-600 p-1 font-bold">{subject}</th>
                                ))}
                                <th rowSpan={2} className="border border-gray-600 p-1 font-bold">G.Total</th>
                                <th rowSpan={2} className="border border-gray-600 p-1 font-bold">Percent</th>
                                <th rowSpan={2} className="border border-gray-600 p-1 font-bold">Grade</th>
                            </tr>
                            <tr className="bg-gray-100">
                                {relevantSubjects.flatMap(subject => 
                                    subHeaders.map(sh => <th key={`${subject}-${sh}`} className="border border-gray-600 p-1 font-semibold">{sh}</th>)
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {students.map(student => {
                                const studentMarks = marks.get(student.id!) || [];
                                let grandTotal = 0;

                                return (
                                    <tr key={student.id} className="odd:bg-white even:bg-gray-50">
                                        <td className="border border-gray-600 p-1 text-center">{student.rollNo}</td>
                                        <td className="border border-gray-600 p-1 text-left">{student.name}</td>
                                        {relevantSubjects.map(subject => {
                                            const mark = studentMarks.find(m => m.subject === subject);
                                            const fa1 = mark?.fa1 || 0; const fa2 = mark?.fa2 || 0; const fa3 = mark?.fa3 || 0;
                                            const fa4 = mark?.fa4 || 0; const fa5 = mark?.fa5 || 0; const fa6 = mark?.fa6 || 0;
                                            const cca = mark?.coCurricular || 0; const sa = mark?.summative || 0;
                                            const total = fa1 + fa2 + fa3 + fa4 + fa5 + fa6 + cca + sa;
                                            grandTotal += total;

                                            return (
                                                <React.Fragment key={subject}>
                                                    <td className="border border-gray-600 p-1 text-center">{mark?.fa1 || '-'}</td>
                                                    <td className="border border-gray-600 p-1 text-center">{mark?.fa2 || '-'}</td>
                                                    <td className="border border-gray-600 p-1 text-center">{mark?.fa3 || '-'}</td>
                                                    <td className="border border-gray-600 p-1 text-center">{mark?.fa4 || '-'}</td>
                                                    <td className="border border-gray-600 p-1 text-center">{mark?.fa5 || '-'}</td>
                                                    <td className="border border-gray-600 p-1 text-center">{mark?.fa6 || '-'}</td>
                                                    <td className="border border-gray-600 p-1 text-center">{mark?.coCurricular || '-'}</td>
                                                    <td className="border border-gray-600 p-1 text-center">{mark?.summative || '-'}</td>
                                                    <td className="border border-gray-600 p-1 text-center font-bold">{total}</td>
                                                </React.Fragment>
                                            );
                                        })}
                                        <td className="border border-gray-600 p-1 text-center font-bold">{grandTotal}</td>
                                        <td className="border border-gray-600 p-1 text-center font-bold">
                                            {maxTotal > 0 ? ((grandTotal / maxTotal) * 100).toFixed(2) : '0.00'}%
                                        </td>
                                        <td className="border border-gray-600 p-1 text-center font-bold">
                                            {getGrade((grandTotal / maxTotal) * 100)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </main>
                 <footer className="mt-auto pt-8 text-xs text-gray-600 flex justify-between">
                    <span>Date: {new Date().toLocaleDateString('en-GB')}</span>
                    <span>Class Incharge</span>
                    <span>Headmaster/Principal</span>
                </footer>
                 <p className="text-center text-[7px] text-gray-600 mt-1">This document was created from School Management Mobile System by Imran Gani Mugloo Teacher Zone Vailoo</p>
            </div>
        </div>
    );
};

export default SbaResultSheet;
