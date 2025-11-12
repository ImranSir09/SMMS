
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../services/db';
// FIX: Import StudentSessionInfo to explicitly type Dexie query results.
import { Student, StudentSessionInfo } from '../types';
import RollStatement from '../components/RollStatement';
import { useAppData } from '../hooks/useAppData';
import { generatePdfFromComponent } from '../utils/pdfGenerator';
import { DownloadIcon, PrintIcon } from '../components/icons';

const PrintRollStatement: React.FC = () => {
  const { className } = useParams<{ className: string }>();
  const [students, setStudents] = useState<Student[]>([]);
  const { schoolDetails, activeSession } = useAppData();

  useEffect(() => {
    const fetchStudents = async () => {
        if (className && activeSession) {
            // FIX: Explicitly type sessionInfos to prevent it from being inferred as 'unknown[]'.
            const sessionInfos: StudentSessionInfo[] = await db.studentSessionInfo
                .where({ className, session: activeSession })
                .toArray();
            
            if (sessionInfos.length === 0) {
                setStudents([]);
                return;
            }

            const studentIds = sessionInfos.map(info => info.studentId);
            const sessionInfoMap = new Map(sessionInfos.map(info => [info.studentId, info]));
            const studentDetails = await db.students.where('id').anyOf(studentIds).toArray();

            const mergedStudents = studentDetails.map(student => {
                const sessionInfo = sessionInfoMap.get(student.id!);
                return {
                    ...student,
                    // FIX: Errors on these lines are resolved by typing `sessionInfos` above.
                    className: sessionInfo?.className,
                    section: sessionInfo?.section,
                    rollNo: sessionInfo?.rollNo,
                };
            }).sort((a, b) => (a.rollNo || '').localeCompare(b.rollNo || '', undefined, { numeric: true, sensitivity: 'base' }));
            
            setStudents(mergedStudents);
        }
    };
    fetchStudents();
  }, [className, activeSession]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (className) {
        await generatePdfFromComponent(
            <RollStatement students={students} className={className} schoolDetails={schoolDetails} />,
            `Roll-Statement-Class-${className}`
        );
    }
  };

  if (!schoolDetails || !activeSession) {
    return <div>Loading...</div>;
  }
  
  if (students.length === 0) {
      return <div>Loading student data or no students found for this class in the current session...</div>;
  }
  
  const ControlPanel = () => (
      <div className="max-w-4xl mx-auto mb-4 p-4 bg-white rounded-lg shadow-md print:hidden">
        <h1 className="text-2xl font-bold text-gray-800">Document Preview</h1>
        <p className="text-gray-600 mb-4">Preview for Class {className} Roll Statement.</p>
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
      
        <div className="flex justify-center items-start">
             <RollStatement students={students} className={className!} schoolDetails={schoolDetails} />
        </div>

        <style>{`
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            @page { size: A4; margin: 0; }
            @media print {
                body * { visibility: hidden; }
                #roll-statement, #roll-statement * { visibility: visible; }
                #roll-statement { position: absolute; left: 0; top: 0; width: 100%; height: auto; }
                .A4-page-container { transform: scale(1.0); }
            }
            .A4-page-container {
                transform-origin: top center;
                margin: 1rem 0;
                transform: scale(0.85);
            }
            @media (max-width: 900px) { .A4-page-container { transform: scale(0.7); } }
            @media (max-width: 640px) { .A4-page-container { transform: scale(0.55); } }
            @media (max-width: 500px) { .A4-page-container { transform: scale(0.45); } }
            @media (max-width: 400px) { .A4-page-container { transform: scale(0.4); } }
        `}</style>
    </div>
  );
};

export default PrintRollStatement;