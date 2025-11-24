
import React, { useMemo } from 'react';
import { Student, SchoolDetails } from '../types';
import { CATEGORY_OPTIONS, CLASS_OPTIONS } from '../constants';

interface ConsolidatedRollStatementProps {
  studentsByClass: Map<string, Student[]>;
  schoolDetails: SchoolDetails | null;
  session: string;
}

const GENDERS: ('Male' | 'Female' | 'Other')[] = ['Male', 'Female', 'Other'];
type GenderCounts = { Male: number; Female: number; Other: number; };

const ConsolidatedRollStatement: React.FC<ConsolidatedRollStatementProps> = ({ studentsByClass, schoolDetails, session }) => {

    const summaryData = useMemo(() => {
        // Sort classes logically using the constant
        const classNames = Array.from(studentsByClass.keys()).sort((a: string, b: string) => {
            const indexA = CLASS_OPTIONS.indexOf(a);
            const indexB = CLASS_OPTIONS.indexOf(b);
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
        });

        const data: { [className: string]: { [category: string]: GenderCounts } } = {};
        const categoryTotals: { [category: string]: GenderCounts } = {};
        
        // Initialize totals
        CATEGORY_OPTIONS.forEach(cat => {
            categoryTotals[cat] = { Male: 0, Female: 0, Other: 0 };
        });

        classNames.forEach((className: string) => {
            data[className] = {};
            CATEGORY_OPTIONS.forEach(cat => {
                data[className][cat] = { Male: 0, Female: 0, Other: 0 };
            });

            const students = studentsByClass.get(className) || [];
            students.forEach(student => {
                const category = student.category && CATEGORY_OPTIONS.includes(student.category) ? student.category : 'General';
                const gender = student.gender === 'Male' || student.gender === 'Female' ? student.gender : 'Other';
                
                data[className][category][gender]++;
                categoryTotals[category][gender]++;
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
              <h2 className="text-lg font-semibold mt-2 border-b-2 border-black inline-block">Consolidated Category & Gender Wise Roll Statement ({session})</h2>
            </header>
            
            <main className="flex-1 overflow-x-auto">
                <table className="w-full border-collapse border border-black">
                    <thead>
                        <tr>
                            <Td isHeader rowSpan={2} className="w-24">Class</Td>
                            {CATEGORY_OPTIONS.map(cat => (
                                <Td isHeader colSpan={4} key={cat}>{cat}</Td>
                            ))}
                            <Td isHeader colSpan={4} className="bg-gray-200">Grand Total</Td>
                        </tr>
                        <tr>
                            {CATEGORY_OPTIONS.concat('Grand Total').flatMap(cat => [
                                <Td isHeader key={`${cat}-M`} className="w-8">M</Td>,
                                <Td isHeader key={`${cat}-F`} className="w-8">F</Td>,
                                <Td isHeader key={`${cat}-O`} className="w-8">O</Td>,
                                <Td isHeader key={`${cat}-T`} className="w-10 bg-gray-200">T</Td>
                            ])}
                        </tr>
                    </thead>
                    <tbody>
                        {summaryData.classNames.map(className => {
                            let classMaleTotal = 0;
                            let classFemaleTotal = 0;
                            let classOtherTotal = 0;
                            
                            return (
                                <tr key={className}>
                                    <Td isHeader>{className}</Td>
                                    {CATEGORY_OPTIONS.map(cat => {
                                        const counts = summaryData.data[className][cat];
                                        const catTotal = counts.Male + counts.Female + counts.Other;
                                        classMaleTotal += counts.Male;
                                        classFemaleTotal += counts.Female;
                                        classOtherTotal += counts.Other;
                                        return (
                                            <React.Fragment key={cat}>
                                                <Td>{counts.Male || ''}</Td>
                                                <Td>{counts.Female || ''}</Td>
                                                <Td>{counts.Other || ''}</Td>
                                                <Td isTotal>{catTotal || ''}</Td>
                                            </React.Fragment>
                                        );
                                    })}
                                    <Td className="bg-gray-50 font-bold">{classMaleTotal}</Td>
                                    <Td className="bg-gray-50 font-bold">{classFemaleTotal}</Td>
                                    <Td className="bg-gray-50 font-bold">{classOtherTotal}</Td>
                                    <Td isTotal className="bg-gray-200">{classMaleTotal + classFemaleTotal + classOtherTotal}</Td>
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot>
                        <tr className="border-t-2 border-black">
                           <Td isTotal isHeader>TOTAL</Td>
                           {CATEGORY_OPTIONS.map(cat => {
                               const totals = summaryData.categoryTotals[cat];
                               const catGrandTotal = totals.Male + totals.Female + totals.Other;
                               return (
                                   <React.Fragment key={cat}>
                                       <Td isTotal>{totals.Male}</Td>
                                       <Td isTotal>{totals.Female}</Td>
                                       <Td isTotal>{totals.Other}</Td>
                                       <Td isTotal className="bg-gray-200">{catGrandTotal}</Td>
                                   </React.Fragment>
                               );
                           })}
                           {(() => {
                               const grandMale = Object.keys(summaryData.categoryTotals).reduce((sum, key) => sum + summaryData.categoryTotals[key].Male, 0);
                               const grandFemale = Object.keys(summaryData.categoryTotals).reduce((sum, key) => sum + summaryData.categoryTotals[key].Female, 0);
                               const grandOther = Object.keys(summaryData.categoryTotals).reduce((sum, key) => sum + summaryData.categoryTotals[key].Other, 0);
                               return (
                                   <React.Fragment>
                                       <Td isTotal className="bg-gray-200">{grandMale}</Td>
                                       <Td isTotal className="bg-gray-200">{grandFemale}</Td>
                                       <Td isTotal className="bg-gray-200">{grandOther}</Td>
                                       <Td isTotal className="bg-black text-white">{grandMale + grandFemale + grandOther}</Td>
                                   </React.Fragment>
                               );
                           })()}
                        </tr>
                    </tfoot>
                </table>
            </main>
            
            <footer className="mt-auto pt-8 text-xs text-gray-600 flex justify-between items-end">
              <div>
                  <p>Generated on: {new Date().toLocaleDateString('en-GB')}</p>
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
