
import React, { useMemo } from 'react';
import { Student, SchoolDetails } from '../types';
import { CATEGORY_OPTIONS, CLASS_OPTIONS } from '../constants';

interface ConsolidatedRollStatementProps {
  studentsByClass: Map<string, Student[]>;
  schoolDetails: SchoolDetails | null;
  session: string;
}

const GENDERS: ('Male' | 'Female' | 'Other')[] = ['Male', 'Female', 'Other'];

// FIX: Moved GenderCounts type out of useMemo to make it accessible for typing and improve inference.
type GenderCounts = { Male: number; Female: number; Other: number; };

const ConsolidatedRollStatement: React.FC<ConsolidatedRollStatementProps> = ({ studentsByClass, schoolDetails, session }) => {

    const summaryData = useMemo(() => {
        // FIX: Add explicit string types to sort callback parameters to resolve 'unknown' type error.
        const classNames = Array.from(studentsByClass.keys()).sort((a: string, b: string) => {
            const indexA = CLASS_OPTIONS.indexOf(a);
            const indexB = CLASS_OPTIONS.indexOf(b);
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
        });

        // FIX: Use a more specific type for gender counts to allow direct property access.
        const data: { [className: string]: { [category: string]: GenderCounts } } = {};
        const categoryTotals: { [category: string]: GenderCounts } = {};
        CATEGORY_OPTIONS.forEach(cat => {
            categoryTotals[cat] = { Male: 0, Female: 0, Other: 0 };
        });

        // FIX: Add explicit string type to forEach callback parameter to resolve index type errors.
        classNames.forEach((className: string) => {
            data[className] = {};
            CATEGORY_OPTIONS.forEach(cat => {
                data[className][cat] = { Male: 0, Female: 0, Other: 0 };
            });

            const students = studentsByClass.get(className) || [];
            students.forEach(student => {
                const category = student.category && CATEGORY_OPTIONS.includes(student.category) ? student.category : 'General';
                const gender = student.gender;
                
                data[className][category][gender]++;
                categoryTotals[category][gender]++;
            });
        });

        return { classNames, data, categoryTotals };
    }, [studentsByClass]);

    // FIX: Changed Td to be a React.FC to properly handle props like 'key' and improve type safety.
    const Td: React.FC<{ children: React.ReactNode, isHeader?: boolean, isTotal?: boolean, colSpan?: number, rowSpan?: number }> = ({ children, isHeader = false, isTotal = false, colSpan, rowSpan }) => (
        <td className={`border border-gray-400 p-1 text-center ${isHeader ? 'font-semibold' : ''} ${isTotal ? 'font-bold bg-gray-100' : ''}`} colSpan={colSpan} rowSpan={rowSpan}>{children}</td>
    );

    return (
        <div className="A4-page-container landscape">
          <div id="consolidated-roll-statement" className="w-[297mm] h-auto min-h-[210mm] bg-white p-6 font-sans text-black flex flex-col">
            <header className="text-center mb-4">
              <h1 className="text-xl font-bold uppercase">{schoolDetails?.name || 'School Name'}</h1>
              <p className="text-sm">{schoolDetails?.address || 'School Address'}</p>
              <h2 className="text-lg font-semibold mt-2">Consolidated Category & Gender Wise Roll Statement for Session {session}</h2>
            </header>
            
            <main className="flex-1">
                <table className="w-full border-collapse border border-gray-400 text-[10px]">
                    <thead>
                        <tr className="bg-gray-200">
                            <Td isHeader rowSpan={2}>Class</Td>
                            {CATEGORY_OPTIONS.map(cat => (
                                <Td isHeader colSpan={4} key={cat}>{cat}</Td>
                            ))}
                            <Td isHeader colSpan={4}>Grand Total</Td>
                        </tr>
                        <tr className="bg-gray-200">
                            {CATEGORY_OPTIONS.concat('Grand Total').flatMap(cat => [
                                <Td isHeader key={`${cat}-M`}>M</Td>,
                                <Td isHeader key={`${cat}-F`}>F</Td>,
                                <Td isHeader key={`${cat}-O`}>O</Td>,
                                <Td isHeader key={`${cat}-T`}>Total</Td>
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
                                                <Td>{counts.Male || 0}</Td>
                                                <Td>{counts.Female || 0}</Td>
                                                <Td>{counts.Other || 0}</Td>
                                                <Td isTotal>{catTotal}</Td>
                                            </React.Fragment>
                                        );
                                    })}
                                    <Td>{classMaleTotal}</Td>
                                    <Td>{classFemaleTotal}</Td>
                                    <Td>{classOtherTotal}</Td>
                                    <Td isTotal>{classMaleTotal + classFemaleTotal + classOtherTotal}</Td>
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot>
                        <tr className="bg-gray-200 font-bold">
                           <Td isTotal isHeader>Total</Td>
                           {CATEGORY_OPTIONS.map(cat => {
                               const totals = summaryData.categoryTotals[cat];
                               const catGrandTotal = totals.Male + totals.Female + totals.Other;
                               return (
                                   <React.Fragment key={cat}>
                                       <Td isTotal>{totals.Male || 0}</Td>
                                       <Td isTotal>{totals.Female || 0}</Td>
                                       <Td isTotal>{totals.Other || 0}</Td>
                                       <Td isTotal>{catGrandTotal}</Td>
                                   </React.Fragment>
                               );
                           })}
                           {(() => {
                               // FIX: Changed from Object.values to Object.keys to avoid type inference issues on indexed objects.
                               const grandMale = Object.keys(summaryData.categoryTotals).reduce((sum, key) => sum + summaryData.categoryTotals[key].Male, 0);
                               const grandFemale = Object.keys(summaryData.categoryTotals).reduce((sum, key) => sum + summaryData.categoryTotals[key].Female, 0);
                               const grandOther = Object.keys(summaryData.categoryTotals).reduce((sum, key) => sum + summaryData.categoryTotals[key].Other, 0);
                               return (
                                   <React.Fragment>
                                       <Td isTotal>{grandMale}</Td>
                                       <Td isTotal>{grandFemale}</Td>
                                       <Td isTotal>{grandOther}</Td>
                                       <Td isTotal>{grandMale + grandFemale + grandOther}</Td>
                                   </React.Fragment>
                               );
                           })()}
                        </tr>
                    </tfoot>
                </table>
            </main>
            
            <footer className="mt-auto pt-4 text-xs text-gray-600 flex justify-between">
              <span>Date: {new Date().toLocaleDateString('en-GB')}</span>
              <span className="font-semibold">Signature of Head of Institution</span>
            </footer>
          </div>
        </div>
    );
};

export default ConsolidatedRollStatement;
