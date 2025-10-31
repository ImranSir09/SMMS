
import React, { useEffect, useState } from 'react';
import { db } from '../services/db';
import { Student, StudentSessionInfo } from '../types';
import { useAppData } from '../hooks/useAppData';
import { generatePdfFromComponent } from '../utils/pdfGenerator';
import { DownloadIcon, PrintIcon } from '../components/icons';
import ConsolidatedRollStatement from '../components/Wizard'; // Renamed from CategoryWiseRollStatement

const PrintCategoryRollStatement: React.FC = () => {
  const [studentsByClass, setStudentsByClass] = useState<Map<string, Student[]>>(new Map());
  const { schoolDetails, activeSession } = useAppData();

  useEffect(() => {
    const fetchData = async () => {
        if (!activeSession) return;

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
            if (!details) return null;
            // FIX: Reverted to spread syntax for better type inference.
            return {
                ...details,
                className: info.className,
                section: info.section,
                rollNo: info.rollNo,
            };
        // FIX: Removed invalid type predicate. `filter(Boolean)` correctly removes nulls and preserves the inferred type.
        }).filter(Boolean);

        const classNames = [...new Set(allStudentsForSession.map(s => s.className!))]
            .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

        const grouped = new Map<string, Student[]>();
        classNames.forEach(className => {
            const classStudents = allStudentsForSession
                .filter(s => s.className === className)
                .sort((a, b) => (a.rollNo || '').localeCompare(b.rollNo || '', undefined, { numeric: true, sensitivity: 'base' }));
            // FIX: The type of classStudents is now correctly inferred and assignable to Student[].
            grouped.set(className, classStudents);
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
            <ConsolidatedRollStatement
                studentsByClass={studentsByClass}
                schoolDetails={schoolDetails}
                session={activeSession}
            />,
            `Consolidated-Roll-Statement-${activeSession}`,
            { orientation: 'l' } // Landscape orientation
        );
    }
  };

  if (studentsByClass.size === 0 || !schoolDetails) {
    return <div className="p-4 text-center">Loading student data for the active session...</div>;
  }
  
  const ControlPanel = () => (
      <div className="max-w-4xl mx-auto mb-4 p-4 bg-white rounded-lg shadow-md print:hidden">
        <h1 className="text-2xl font-bold text-gray-800">Document Preview</h1>
        <p className="text-gray-600 mb-4">Preview for Consolidated Roll Statement for session {activeSession}.</p>
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
      
        <div id="printable-area" className="flex flex-col items-center justify-start">
            <ConsolidatedRollStatement
                studentsByClass={studentsByClass}
                schoolDetails={schoolDetails}
                session={activeSession}
            />
        </div>

        <style>{`
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            @page { size: A4 landscape; margin: 0; }
            @media print {
                body * { visibility: hidden; }
                #printable-area, #printable-area * { visibility: visible; }
                #printable-area { position: absolute; left: 0; top: 0; width: 100%; height: auto; }
                .A4-page-container {
                    transform: scale(1.0);
                    box-shadow: none;
                    margin: 0;
                }
            }
            .A4-page-container.landscape {
                transform: scale(0.75) rotate(0);
                transform-origin: top center;
            }
        `}</style>
    </div>
  );
};

export default PrintCategoryRollStatement;