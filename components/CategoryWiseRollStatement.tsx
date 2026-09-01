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
            if (summary[category]) {
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
      <div id="category-roll-statement" className="w-[210mm] h-auto min-h-[297mm] bg-white p-10 font-sans text-slate-900 flex flex-col border border-slate-200">
        
        {/* Header */}
        <header className="text-center mb-6 border-b-2 border-slate-800 pb-4">
          <div className="flex flex-col items-center">
            <img 
              src={schoolDetails?.logo || '/icon.png'} 
              alt="School Logo" 
              className="w-20 h-20 mb-2 object-contain" 
              onError={(e) => { (e.target as HTMLImageElement).src = '/icon.png'; }}
            />
            <h1 className="text-2xl font-bold uppercase tracking-wider text-slate-900 font-serif">
              {schoolDetails?.name || 'School Name'}
            </h1>
            <p className="text-sm text-slate-700 mt-1 font-medium">{schoolDetails?.address || 'School Address'}</p>
            <div className="flex items-center justify-center gap-3 text-xs text-slate-500 mt-1">
              {schoolDetails?.udiseCode && <span>UDISE: <strong>{schoolDetails.udiseCode}</strong></span>}
              {schoolDetails?.phone && <span>| Ph: <strong>{schoolDetails.phone}</strong></span>}
              {schoolDetails?.email && <span>| Email: <strong>{schoolDetails.email}</strong></span>}
            </div>
            <div className="mt-4 inline-block bg-slate-900 text-white text-sm font-semibold px-4 py-1 rounded-full uppercase tracking-wider">
              Gender & Category Wise Roll Statement — Class {className}
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="flex-1 my-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">Category Breakdown Matrix</h3>
              <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-3 py-1 rounded border border-slate-300">
                Class: {className} | Enrolled: {summaryData.grandTotal}
              </span>
            </div>

            <table className="w-full border-collapse border border-slate-300 text-sm">
                <thead>
                    <tr className="bg-slate-800 text-white">
                        <th className="border border-slate-400 p-2.5 font-semibold text-left">Category</th>
                        {GENDERS.map(gender => (
                          <th key={gender} className="border border-slate-400 p-2.5 font-semibold text-center w-24">
                            {gender}
                          </th>
                        ))}
                        <th className="border border-slate-400 p-2.5 font-bold text-center bg-slate-900 w-28">
                          Total
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {CATEGORY_OPTIONS.map((category, idx) => (
                        <tr key={category} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                            <td className="border border-slate-300 p-2.5 font-semibold text-slate-800 text-left">
                              {category}
                            </td>
                            {GENDERS.map(gender => (
                              <td key={gender} className="border border-slate-300 p-2.5 text-center text-slate-700">
                                {summaryData.summary[category]?.[gender] ?? 0}
                              </td>
                            ))}
                            <td className="border border-slate-300 p-2.5 text-center font-bold text-slate-900 bg-slate-100/70">
                              {summaryData.categoryTotals[category] ?? 0}
                            </td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr className="bg-slate-200 font-bold border-t-2 border-slate-800 text-slate-900">
                        <td className="border border-slate-400 p-2.5 text-left uppercase tracking-wider">Total</td>
                        {GENDERS.map(gender => (
                          <td key={gender} className="border border-slate-400 p-2.5 text-center">
                            {summaryData.genderTotals[gender as keyof typeof summaryData.genderTotals]}
                          </td>
                        ))}
                        <td className="border border-slate-400 p-2.5 text-center bg-slate-300 font-black text-base">
                          {summaryData.grandTotal}
                        </td>
                    </tr>
                </tfoot>
            </table>
        </main>
        
        {/* Footer */}
        <footer className="mt-auto pt-10 text-xs text-slate-600 flex justify-between items-end">
          <div className="space-y-1">
            <p><span className="font-semibold text-slate-800">Date of Report:</span> {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
            <p><span className="font-semibold text-slate-800">Total Enrollment:</span> {summaryData.grandTotal} Students</p>
          </div>
          <div className="text-center">
            <div className="border-t-2 border-slate-800 w-48 mb-1"></div>
            <p className="font-bold text-sm text-slate-900">Principal / Headmaster</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">(Signature & Seal)</p>
          </div>
        </footer>
        <p className="text-center text-[8px] text-slate-400 mt-4 border-t border-slate-200 pt-1">
          School Management Mobile System — Official Report
        </p>
      </div>
    </div>
    );
};

export default CategoryWiseRollStatement;
