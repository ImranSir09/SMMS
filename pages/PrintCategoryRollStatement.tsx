
import React, { useEffect, useState } from 'react';
import { db } from '../services/db';
// FIX: Import StudentSessionInfo to explicitly type Dexie query results.
import { Student, StudentSessionInfo } from '../types';
import CategoryWiseRollStatement from '../components/CategoryWiseRollStatement';
import { useAppData } from '../hooks/useAppData';
import { generatePdfFromComponent } from '../utils/pdfGenerator';
import { DownloadIcon, PrintIcon } from '../components/icons';

const PrintCategoryRollStatement: React.FC = () => {
  const [studentsByClass, setStudentsByClass] = useState<Map<string, Student[]>>(new Map());
  const { schoolDetails, activeSession } = useAppData();

  useEffect(() => {
    const fetchData = async () => {
        if (!activeSession) return;

        // FIX: Explicitly type sessionInfos to prevent it from being inferred as 'unknown[]'.
        const sessionInfos: StudentSessionInfo[] = await db.studentSessionInfo.where({ session: activeSession }).toArray();
        if (sessionInfos.length === 0) {
            setStudentsByClass(new Map());
            return;
        }

        const studentIds = sessionInfos.map(info => info.studentId);
        const allStudentDetails = await db.students.where('id').anyOf(studentIds).toArray();
        const studentDetailsMap = new Map(allStudentDetails.map(s => [s.id!, s]));

        const allStudentsForSession = sessionInfos.map(info => {
            const details = studentDetailsMap.get(info.studentId);
            // FIX: Ensure student details exist before spreading to prevent error on undefined.
            if (!details) return null;
            return {
                ...details,
                ...info,
            };
        }).filter(Boolean);

        const classNames = [...new Set(allStudentsForSession.map(s => s!.className))]
            // FIX: Add explicit string types to sort callback parameters to resolve 'unknown' type error.
            .sort((a: string, b: string) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

        const grouped = new Map<string, Student[]>();
        classNames.forEach(className => {
            const classStudents = allStudentsForSession
                .filter(s => s!.className === className)
                .sort((a, b) => (a!.rollNo || '').localeCompare(b!.rollNo || '', undefined, { numeric: true, sensitivity: 'base' }));
            grouped.set(className, classStudents as Student[]);
        });
        setStudentsByClass(grouped);
    };
    fetchData();
  }, [activeSession]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (studentsByClass.size > 0 && schoolDetails) {
        await generatePdfFromComponent(
            <div id="pdf-content">
                {Array.from(studentsByClass.entries()).map(([className, classStudents]) => (
                    <CategoryWiseRollStatement
                        key={className}
                        students={classStudents}
                        className={className}
                        schoolDetails={schoolDetails}
                    />
                ))}
            </div>,
            `Category-Roll-Statement-All-Classes`
        );
    }
  };

  if (studentsByClass.size === 0 || !schoolDetails) {
    return <div className="p-4 text-center">Loading student data for the active session...</div>;
  }
  
  const ControlPanel = () => (
      <div className="max-w-4xl mx-auto mb-4 p-4 bg-white rounded-lg shadow-md print:hidden">
        <h1 className="text-2xl font-bold text-gray-800">Document Preview</h1>
        <p className="text-gray-600 mb-4">Preview for All Classes: Gender & Category Wise Roll Statement.</p>
        <div className="flex flex-wrap gap-4">
             <button
                onClick={handleDownloadPdf}
                className="flex items-center gap-2 py-2 px-4 bg-green-600 text-white font-semibold rounded-md shadow-md hover:bg-green-700 focus:outline-none"
             >
                <DownloadIcon className="w-5 h-5"/> Download PDF
            </button>
            <button
                onClick={handlePrint}
                className="flex items-center gap-2 py-2 px-4 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 focus:outline-none"
            >
                <PrintIcon className="w-5 h-5"/> Print
            </button>
        </div>
      </div>
  );


  return (
    <div className="bg-gray-200 min-h-screen p-4 sm:p-8 print:p-0 print:bg-white">
        <ControlPanel />
      
        <div id="printable-area" className="flex flex-col items-center justify-start gap-4 print:gap-0">
             {Array.from(studentsByClass.entries()).map(([className, classStudents]) => (
                <CategoryWiseRollStatement
                    key={className}
                    students={classStudents}
                    // FIX: Error on this line is resolved by type fixes above.
                    className={className}
                    schoolDetails={schoolDetails}
                />
            ))}
        </div>

        <style>{`
             body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            @page { size: A4; margin: 0; }
            @media print {
                body * { visibility: hidden; }
                #printable-area, #printable-area * { visibility: visible; }
                #printable-area { position: absolute; left: 0; top: 0; width: 100%; height: auto; }
                .A4-page-container {
                    transform: scale(1.0);
                    box-shadow: none;
                    margin: 0;
                    page-break-after: always;
                }
            }
        `}</style>
    </div>
  );
};

export default PrintCategoryRollStatement;
