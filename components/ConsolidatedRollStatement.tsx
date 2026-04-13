
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
        // Sort classes logically
        const classNames = Array.from(studentsByClass.keys()).sort((a: string, b: string) => {
            const indexA = CLASS_OPTIONS.indexOf(a);
            const indexB = CLASS_OPTIONS.indexOf(b);
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
        });

        // Data structure: Class -> Category -> Gender -> Count
        const data: { [className: string]: { [category: string]: { Male: number; Female: number; Other: number } } } = {};
        
        // Totals
        const categoryTotals: { [category: string]: { Male: number; Female: number; Other: number } } = {};
        [...TARGET_CATEGORIES, 'Grand Total'].forEach(cat => {
            categoryTotals[cat] = { Male: 0, Female: 0, Other: 0 };
        });

        classNames.forEach((className: string) => {
            data[className] = {};
            // Initialize rows
            [...TARGET_CATEGORIES, 'Grand Total'].forEach(cat => {
                data[className][cat] = { Male: 0, Female: 0, Other: 0 };
            });

            const students = studentsByClass.get(className) || [];
            
            students.forEach(student => {
                const gender = (student.gender === 'Male' || student.gender === 'Female') ? student.gender : 'Other';
                const rawCategory = student.category || 'General';
                
                // Determine bucket: If it's ST, go to ST. Everyone else goes to General (as per typical consolidated view logic if only these 2 exist), 
                // OR strict filtering. Given the request "General, ST and Total", usually 'General' implies 'Others' here or strict General.
                // Let's map: ST -> ST, Everything else -> General (to ensure totals match). 
                const categoryBucket = rawCategory === 'ST' ? 'ST' : 'General';

                // Increment Specific Category
                data[className][categoryBucket][gender]++;
                categoryTotals[categoryBucket][gender]++;

                // Increment Grand Total (Always counts everyone)
                data[className]['Grand Total'][gender]++;
                categoryTotals['Grand Total'][gender]++;
            });
        });

        return { classNames, data, categoryTotals };
    }, [studentsByClass]);

    const Td: React.FC<{ children: React.ReactNode, isHeader?: boolean, isTotal?: boolean, colSpan?: number, rowSpan?: number, className?: string }> = ({ children, isHeader = false, isTotal = false, colSpan, rowSpan, className = '' }) => (
        <td 
            className={`border border-black p-1 text-center text-[10px] align-middle ${isHeader ? 'font-bold bg-gray-100' : ''} ${isTotal ? 'font-bold bg-gray-50' : ''} ${className}`} 
            colSpan={colSpan} 
            rowSpan={rowSpan}
        >
            {children}
        </td>
    );

    return (
        <div className="A4-page-container landscape">
          <div id="consolidated-roll-statement" className="w-[297mm] h-auto min-h-[210mm] bg-white p-6 font-sans text-black flex flex-col">
            <header className="text-center mb-4">
              <h1 className="text-xl font-bold uppercase">{schoolDetails?.name || 'School Name'}</h1>
              <p className="text-sm">{schoolDetails?.address || 'School Address'}</p>
              <h2 className="text-lg font-semibold mt-2 border-b-2 border-black inline-block">Consolidated Roll Statement (General / ST) - Session {session}</h2>
            </header>
            
            <main className="flex-1 overflow-x-auto">
                <table className="w-full border-collapse border border-black">
                    <thead>
                        <tr>
                            <Td isHeader rowSpan={2} className="w-32">Class</Td>
                            {TARGET_CATEGORIES.map(cat => (
                                <Td isHeader colSpan={3} key={cat}>{cat}</Td>
                            ))}
                            <Td isHeader colSpan={3} className="bg-gray-200">Grand Total</Td>
                        </tr>
                        <tr>
                            {/* General & ST Columns */}
                            {TARGET_CATEGORIES.map(cat => (
                                <React.Fragment key={cat}>
                                    <Td isHeader className="w-10">M</Td>
                                    <Td isHeader className="w-10">F</Td>
                                    <Td isHeader className="w-12 bg-gray-50">T</Td>
                                </React.Fragment>
                            ))}
                            {/* Grand Total Columns */}
                            <Td isHeader className="w-10 bg-gray-200">M</Td>
                            <Td isHeader className="w-10 bg-gray-200">F</Td>
                            <Td isHeader className="w-12 bg-gray-300 border-l-2 border-black">Total</Td>
                        </tr>
                    </thead>
                    <tbody>
                        {summaryData.classNames.map(className => {
                            return (
                                <tr key={className}>
                                    <Td isHeader>{className}</Td>
                                    {TARGET_CATEGORIES.map(cat => {
                                        const counts = summaryData.data[className][cat];
                                        const total = counts.Male + counts.Female + counts.Other;
                                        return (
                                            <React.Fragment key={cat}>
                                                <Td>{counts.Male || ''}</Td>
                                                <Td>{counts.Female || ''}</Td>
                                                <Td className="font-bold bg-gray-50">{total || ''}</Td>
                                            </React.Fragment>
                                        );
                                    })}
                                    {/* Row Grand Total */}
                                    {(() => {
                                        const counts = summaryData.data[className]['Grand Total'];
                                        const total = counts.Male + counts.Female + counts.Other;
                                        return (
                                            <React.Fragment>
                                                <Td className="bg-gray-100 font-bold">{counts.Male}</Td>
                                                <Td className="bg-gray-100 font-bold">{counts.Female}</Td>
                                                <Td className="bg-gray-200 font-bold border-l-2 border-black">{total}</Td>
                                            </React.Fragment>
                                        )
                                    })()}
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot>
                        <tr className="border-t-2 border-black">
                           <Td isTotal isHeader>TOTAL</Td>
                           {TARGET_CATEGORIES.map(cat => {
                               const totals = summaryData.categoryTotals[cat];
                               const total = totals.Male + totals.Female + totals.Other;
                               return (
                                   <React.Fragment key={cat}>
                                       <Td isTotal>{totals.Male}</Td>
                                       <Td isTotal>{totals.Female}</Td>
                                       <Td isTotal className="bg-gray-100">{total}</Td>
                                   </React.Fragment>
                               );
                           })}
                           {(() => {
                               const totals = summaryData.categoryTotals['Grand Total'];
                               const total = totals.Male + totals.Female + totals.Other;
                               return (
                                   <React.Fragment>
                                       <Td isTotal className="bg-gray-200">{totals.Male}</Td>
                                       <Td isTotal className="bg-gray-200">{totals.Female}</Td>
                                       <Td isTotal className="bg-black text-white border-l-2 border-white">{total}</Td>
                                   </React.Fragment>
                               );
                           })()}
                        </tr>
                    </tfoot>
                </table>
            </main>
            
            <footer className="mt-auto pt-8 text-xs text-gray-600 flex justify-between items-end">
              <div>
                  <p>Date: {new Date().toLocaleDateString('en-GB')}</p>
              </div>
              <div className="text-center">
                  <div className="w-48 border-b border-black mb-1"></div>
                  <p className="font-bold">Signature of Head of Institution</p>
              </div>
            </footer>
          </div>
        </div>
    );
};

export default ConsolidatedRollStatement;
