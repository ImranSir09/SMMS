import React, { useMemo } from 'react';
import { Student, SchoolDetails } from '../types';
import { CATEGORY_OPTIONS } from '../constants';

interface RollStatementProps {
  students: Student[];
  className: string;
  schoolDetails: SchoolDetails | null;
}

type GroupedStudents = {
    [gender: string]: {
        [category: string]: Student[];
    }
}

const CategoryWiseRollStatement: React.FC<RollStatementProps> = ({ students, className, schoolDetails }) => {
    const GENDERS = ['Male', 'Female', 'Other'];
    
    const groupedData = useMemo(() => {
        const data: GroupedStudents = {};
        GENDERS.forEach(gender => data[gender] = {});

        for (const student of students) {
            const gender = student.gender || 'Other';
            const category = student.category || 'General';
            if (!data[gender][category]) {
                data[gender][category] = [];
            }
            data[gender][category].push(student);
        }
        return data;
    }, [students]);
    
    const grandTotal = students.length;

    return (
    <div className="A4-page-container">
      <div id="category-roll-statement" className="w-[210mm] h-auto min-h-[297mm] bg-white p-8 font-sans text-black flex flex-col">
        <header className="text-center mb-6">
          <h1 className="text-2xl font-bold uppercase">{schoolDetails?.name || 'School Name'}</h1>
          <p className="text-md">{schoolDetails?.address || 'School Address'}</p>
          <h2 className="text-xl font-semibold mt-4">Gender & Category Wise Roll Statement - Class {className}</h2>
        </header>
        
        <main className="flex-1 text-sm">
            {GENDERS.map(gender => {
                const genderCategories = Object.keys(groupedData[gender]);
                const genderTotal = genderCategories.reduce((sum, cat) => sum + groupedData[gender][cat].length, 0);
                if (genderTotal === 0) return null;

                return (
                    <div key={gender} className="mb-6">
                        <h3 className="text-lg font-bold bg-gray-200 p-2 my-2 text-center">{gender} (Total: {genderTotal})</h3>
                        {CATEGORY_OPTIONS.map(category => {
                            const studentList = groupedData[gender][category];
                            if (!studentList || studentList.length === 0) return null;

                            return (
                                <div key={category} className="mb-4">
                                    <h4 className="text-md font-semibold mb-1">Category: {category} (Count: {studentList.length})</h4>
                                    <table className="w-full border-collapse border border-gray-400 text-xs">
                                        <thead>
                                            <tr className="bg-gray-100">
                                                <th className="border border-gray-400 p-1 font-semibold">Roll No</th>
                                                <th className="border border-gray-400 p-1 font-semibold">Adm No</th>
                                                <th className="border border-gray-400 p-1 font-semibold text-left">Student Name</th>
                                                <th className="border border-gray-400 p-1 font-semibold text-left">Father's Name</th>
                                                <th className="border border-gray-400 p-1 font-semibold">D.O.B</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {studentList.map(student => (
                                                <tr key={student.id}>
                                                    <td className="border border-gray-400 p-1 text-center">{student.rollNo}</td>
                                                    <td className="border border-gray-400 p-1 text-center">{student.admissionNo}</td>
                                                    <td className="border border-gray-400 p-1 text-left">{student.name}</td>
                                                    <td className="border border-gray-400 p-1 text-left">{student.fathersName}</td>
                                                    <td className="border border-gray-400 p-1 text-center">{student.dob}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            );
                        })}
                    </div>
                )
            })}
        </main>
        
        <footer className="mt-auto pt-8 text-sm text-gray-600 flex justify-between">
          <span>Date: {new Date().toLocaleDateString('en-GB')}</span>
          <span>Grand Total Students: {grandTotal}</span>
        </footer>
        <p className="text-center text-[9px] text-gray-600 mt-2">This document was created from School Management Mobile System by Imran Gani Mugloo Teacher Zone Vailoo</p>
      </div>
    </div>
    );
};

export default CategoryWiseRollStatement;