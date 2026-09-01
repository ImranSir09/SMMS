import React, { useMemo } from 'react';
import { Student, SchoolDetails } from '../types';
import { CLASS_OPTIONS } from '../constants';

interface ConsolidatedRollStatementProps {
  studentsByClass: Map<string, Student[]>;
  schoolDetails: SchoolDetails | null;
  session: string;
}

const TARGET_CATEGORIES = ['General', 'ST'];

const ConsolidatedRollStatement: React.FC<ConsolidatedRollStatementProps> = ({ studentsByClass, schoolDetails, session }) => {

    const summaryData = useMemo(() => {
        const classNames = Array.from(studentsByClass.keys()).sort((a: string, b: string) => {
            const indexA = CLASS_OPTIONS.indexOf(a);
            const indexB = CLASS_OPTIONS.indexOf(b);
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
        });

        const data: { [className: string]: { [category: string]: { Male: number; Female: number; Other: number } } } = {};
        
        const categoryTotals: { [category: string]: { Male: number; Female: number; Other: number } } = {};
        [...TARGET_CATEGORIES, 'Grand Total'].forEach(cat => {
            categoryTotals[cat] = { Male: 0, Female: 0, Other: 0 };
        });

        classNames.forEach((className: string) => {
            data[className] = {};
            [...TARGET_CATEGORIES, 'Grand Total'].forEach(cat => {
                data[className][cat] = { Male: 0, Female: 0, Other: 0 };
            });

            const students = studentsByClass.get(className) || [];
            
            students.forEach(student => {
                const gender = (student.gender === 'Male' || student.gender === 'Female') ? student.gender : 'Other';
                const rawCategory = student.category || 'General';
                const categoryBucket = rawCategory === 'ST' ? 'ST' : 'General';

                data[className][categoryBucket][gender]++;
                categoryTotals[categoryBucket][gender]++;

                data[className]['Grand Total'][gender]++;
                categoryTotals['Grand Total'][gender]++;
            });
        });

        return { classNames, data, categoryTotals };
    }, [studentsByClass]);

    const Td: React.FC<{ children: React.ReactNode, isHeader?: boolean, isTotal?: boolean, colSpan?: number, rowSpan?: number, className?: string }> = ({ children, isHeader = false, isTotal = false, colSpan, rowSpan, className = '' }) => (
        <td 
            className={`border border-slate-300 p-1.5 text-center text-xs align-middle ${isHeader ? 'font-bold bg-slate-800 text-white' : ''} ${isTotal ? 'font-bold bg-slate-100' : ''} ${className}`} 
            colSpan={colSpan} 
            rowSpan={rowSpan}
        >
            {children}
        </td>
    );

    return (
        <div className="A4-page-container landscape">
          <div id="consolidated-roll-statement" className="w-[297mm] h-auto min-h-[210mm] bg-white p-8 font-sans text-slate-900 flex flex-col border border-slate-200">
            
            {/* Header */}
            <header className="text-center mb-4 border-b-2 border-slate-800 pb-3">
              <h1 className="text-2xl font-bold uppercase tracking-wider text-slate-900 font-serif">{schoolDetails?.name || 'School Name'}</h1>
              <p className="text-sm text-slate-700 font-medium">{schoolDetails?.address || 'School Address'}</p>
              <div className="flex items-center justify-center gap-3 text-xs text-slate-500 mt-1">
                {schoolDetails?.udiseCode && <span>UDISE: <strong>{schoolDetails.udiseCode}</strong></span>}
                {schoolDetails?.phone && <span>| Ph: <strong>{schoolDetails.phone}</strong></span>}
                {schoolDetails?.email && <span>| Email: <strong>{schoolDetails.email}</strong></span>}
              </div>
              <div className="mt-2 inline-block bg-slate-900 text-white text-xs font-semibold px-4 py-1 rounded-full uppercase tracking-wider">
                Consolidated Roll Statement (General / ST & Total) — Session {session}
              </div>
            </header>
            
            {/* Table */}
            <main className="flex-1 overflow-x-auto my-2">
                <table className="w-full border-collapse border border-slate-400">
                    <thead>
                        <tr>
                            <Td isHeader rowSpan={2} className="w-36 text-left pl-3">Class</Td>
                            {TARGET_CATEGORIES.map(cat => (
                                <Td isHeader colSpan={3} key={cat} className="bg-slate-800 border-x border-slate-600">{cat}</Td>
                            ))}
                            <Td isHeader colSpan={3} className="bg-slate-950 border-l-2 border-slate-700">Grand Total</Td>
                        </tr>
                        <tr className="bg-slate-700 text-white text-[11px]">
                            {TARGET_CATEGORIES.map(cat => (
                                <React.Fragment key={cat}>
                                    <td className="border border-slate-500 p-1 text-center bg-slate-700 text-white font-semibold w-12">M</td>
                                    <td className="border border-slate-500 p-1 text-center bg-slate-700 text-white font-semibold w-12">F</td>
                                    <td className="border border-slate-500 p-1 text-center bg-slate-600 text-white font-bold w-14">Total</td>
                                </React.Fragment>
                            ))}
                            <td className="border border-slate-600 p-1 text-center bg-slate-900 text-white font-semibold w-12">M</td>
                            <td className="border border-slate-600 p-1 text-center bg-slate-900 text-white font-semibold w-12">F</td>
                            <td className="border border-slate-600 p-1 text-center bg-slate-950 text-white font-bold w-16 border-l-2 border-slate-400">Total</td>
                        </tr>
                    </thead>
                    <tbody>
                        {summaryData.classNames.map((className, idx) => {
                            return (
                                <tr key={className} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                                    <td className="border border-slate-300 p-1.5 font-bold text-slate-800 text-left pl-3">{className}</td>
                                    {TARGET_CATEGORIES.map(cat => {
                                        const counts = summaryData.data[className][cat];
                                        const total = counts.Male + counts.Female + counts.Other;
                                        return (
                                            <React.Fragment key={cat}>
                                                <td className="border border-slate-300 p-1.5 text-center text-slate-700">{counts.Male || '-'}</td>
                                                <td className="border border-slate-300 p-1.5 text-center text-slate-700">{counts.Female || '-'}</td>
                                                <td className="border border-slate-300 p-1.5 text-center font-bold text-slate-900 bg-slate-100/60">{total || '-'}</td>
                                            </React.Fragment>
                                        );
                                    })}
                                    {(() => {
                                        const counts = summaryData.data[className]['Grand Total'];
                                        const total = counts.Male + counts.Female + counts.Other;
                                        return (
                                            <React.Fragment>
                                                <td className="border border-slate-300 p-1.5 text-center bg-slate-100 font-semibold text-slate-800">{counts.Male || '-'}</td>
                                                <td className="border border-slate-300 p-1.5 text-center bg-slate-100 font-semibold text-slate-800">{counts.Female || '-'}</td>
                                                <td className="border border-slate-300 p-1.5 text-center bg-slate-200 font-black text-slate-950 border-l-2 border-slate-400">{total || '-'}</td>
                                            </React.Fragment>
                                        )
                                    })()}
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot>
                        <tr className="bg-slate-200 font-bold border-t-2 border-slate-800 text-slate-950">
                            <td className="border border-slate-400 p-2 text-left pl-3 uppercase tracking-wider font-black">TOTAL</td>
                            {TARGET_CATEGORIES.map(cat => {
                                const counts = summaryData.categoryTotals[cat];
                                const total = counts.Male + counts.Female + counts.Other;
                                return (
                                    <React.Fragment key={cat}>
                                        <td className="border border-slate-400 p-2 text-center">{counts.Male}</td>
                                        <td className="border border-slate-400 p-2 text-center">{counts.Female}</td>
                                        <td className="border border-slate-400 p-2 text-center bg-slate-300 font-black">{total}</td>
                                    </React.Fragment>
                                );
                            })}
                            {(() => {
                                const counts = summaryData.categoryTotals['Grand Total'];
                                const total = counts.Male + counts.Female + counts.Other;
                                return (
                                    <React.Fragment>
                                        <td className="border border-slate-400 p-2 text-center bg-slate-300 font-bold">{counts.Male}</td>
                                        <td className="border border-slate-400 p-2 text-center bg-slate-300 font-bold">{counts.Female}</td>
                                        <td className="border border-slate-400 p-2 text-center bg-slate-400 font-black text-sm border-l-2 border-slate-600">{total}</td>
                                    </React.Fragment>
                                );
                            })()}
                        </tr>
                    </tfoot>
                </table>
            </main>
            
            {/* Footer */}
            <footer className="mt-auto pt-6 text-xs text-slate-600 flex justify-between items-end">
              <div className="space-y-1">
                <p><span className="font-semibold text-slate-800">Date of Report:</span> {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                <p><span className="font-semibold text-slate-800">Session:</span> {session}</p>
              </div>
              <div className="text-center">
                <div className="border-t-2 border-slate-800 w-52 mb-1"></div>
                <p className="font-bold text-sm text-slate-900">Signature of Head of Institution</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">(with Official Seal)</p>
              </div>
            </footer>
            <p className="text-center text-[8px] text-slate-400 mt-2 border-t border-slate-200 pt-1">
              School Management Mobile System — Official Consolidated Record
            </p>
          </div>
        </div>
    );
};

export default ConsolidatedRollStatement;
