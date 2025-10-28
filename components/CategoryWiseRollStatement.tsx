import React, { useMemo } from 'react';
import { Student, SchoolDetails } from '../types';
import { CATEGORY_OPTIONS } from '../constants';

interface RollStatementProps {
  students: Student[];
  className: string;
  schoolDetails: SchoolDetails | null;
}

const CategoryWiseRollStatement: React.FC<RollStatementProps> = ({ students, className, schoolDetails }) => {
    const GENDERS = ['Male', 'Female', 'Other'];
    
    const summaryData = useMemo(() => {
        const summary: { [category: string]: { [gender: string]: number } } = {};
        CATEGORY_OPTIONS.forEach(cat => {
            summary[cat] = { Male: 0, Female: 0, Other: 0 };
        });

        students.forEach(student => {
            const category = student.category && CATEGORY_OPTIONS.includes(student.category) ? student.category : 'General';
            const gender = student.gender && GENDERS.includes(student.gender) ? student.gender : 'Other';
            if (summary[category]) { // Ensure category exists
                summary[category][gender]++;
            }
        });

        const genderTotals = { Male: 0, Female: 0, Other: 0 };
        GENDERS.forEach(gender => {
            genderTotals[gender as keyof typeof genderTotals] = CATEGORY_OPTIONS.reduce((acc, category) => acc + summary[category][gender], 0);
        });

        const categoryTotals: { [category: string]: number } = {};
        CATEGORY_OPTIONS.forEach(category => {
            categoryTotals[category] = GENDERS.reduce((acc, gender) => acc + summary[category][gender], 0);
        });
        
        const grandTotal = students.length;

        return { summary, genderTotals, categoryTotals, grandTotal };
    }, [students]);

    return (
    <div className="A4-page-container">
      <div id="category-roll-statement" className="w-[210mm] h-auto min-h-[297mm] bg-white p-8 font-sans text-black flex flex-col">
        <header className="text-center mb-6">
          <h1 className="text-2xl font-bold uppercase">{schoolDetails?.name || 'School Name'}</h1>
          <p className="text-md">{schoolDetails?.address || 'School Address'}</p>
          <h2 className="text-xl font-semibold mt-4">Gender & Category Wise Roll Statement - Class {className}</h2>
        </header>
        
        <main className="flex-1">
            <h3 className="text-lg font-bold text-center mb-2">Numerical Summary</h3>
            <table className="w-full border-collapse border border-gray-400 text-sm">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="border border-gray-400 p-2 font-semibold">Category</th>
                        {GENDERS.map(gender => <th key={gender} className="border border-gray-400 p-2 font-semibold">{gender}</th>)}
                        <th className="border border-gray-400 p-2 font-semibold">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {CATEGORY_OPTIONS.map(category => (
                        <tr key={category}>
                            <td className="border border-gray-400 p-2 font-semibold text-left">{category}</td>
                            {GENDERS.map(gender => <td key={gender} className="border border-gray-400 p-2 text-center">{summaryData.summary[category]?.[gender] ?? 0}</td>)}
                            <td className="border border-gray-400 p-2 text-center font-bold">{summaryData.categoryTotals[category] ?? 0}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr className="bg-gray-200 font-bold">
                        <td className="border border-gray-400 p-2 text-left">Total</td>
                        {GENDERS.map(gender => <td key={gender} className="border border-gray-400 p-2 text-center">{summaryData.genderTotals[gender as keyof typeof summaryData.genderTotals]}</td>)}
                        <td className="border border-gray-400 p-2 text-center">{summaryData.grandTotal}</td>
                    </tr>
                </tfoot>
            </table>
        </main>
        
        <footer className="mt-auto pt-8 text-sm text-gray-600 flex justify-between">
          <span>Date: {new Date().toLocaleDateString('en-GB')}</span>
          <span>Grand Total Students: {summaryData.grandTotal}</span>
        </footer>
        <p className="text-center text-[9px] text-gray-600 mt-2">This document was created from School Management Mobile System by Imran Gani Mugloo Teacher Zone Vailoo</p>
      </div>
    </div>
    );
};

export default CategoryWiseRollStatement;