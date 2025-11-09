
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
  const [isProcessing, setIsProcessing] = useState(false);

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
        setIsProcessing(true);
        await generatePdfFromComponent(
            <RollStatement students={students} className={className} schoolDetails={schoolDetails} />,
            `Roll-Statement-Class-${className}`
        );
        setIsProcessing(false);
    }
  };

  if (!schoolDetails || !activeSession) {
    return <div>Loading...</div>;
  }
  
  if (students.length === 0) {
      return <div>Loading student data or no students found for this class in the current session...</div>;
  }
  
  const ControlPanel = () => (
      <div className="control-panel w-full bg-card p-3 mb-4 rounded-lg shadow-md print:hidden">
        <h1 className="text-lg font-bold">Document Preview</h1>
        <p className="text-sm text-foreground/70 mb-3">Preview for Class {className} Roll Statement.</p>
        <div className="flex flex-wrap gap-2">
             <button
                onClick={handleDownloadPdf}
                disabled={isProcessing}
                className="flex items-center gap-2 py-2 px-4 bg-green-600 text-white font-semibold rounded-md shadow-sm hover:bg-green-700 disabled:opacity-60"
             >
                <DownloadIcon className="w-4 h-4"/> {isProcessing ? 'Downloading...' : 'Download PDF'}
            </button>
            <button
                onClick={handlePrint}
                className="flex items-center gap-2 py-2 px-4 bg-primary text-primary-foreground font-semibold rounded-md shadow-sm hover:bg-primary-hover"
            >
                <PrintIcon className="w-4 h-4"/> Print
            </button>
        </div>
      </div>
  );


  return (
    <div className="bg-gray-200 min-h-screen p-2 sm:p-4 print:p-0 print:bg-white flex flex-col items-center">
        <ControlPanel />
      
        <div id="printable-content" className="w-full">
             <RollStatement students={students} className={className!} schoolDetails={schoolDetails} />
        </div>

        <style>{`
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            @page { size: A4; margin: 0; }
            
            .A4-page-container {
                margin: 0 auto;
                transform-origin: top;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
                transform: scale(0.45);
                margin-bottom: calc(-297mm * 0.55 + 1rem);
            }

            @media (min-width: 500px) {
                .A4-page-container {
                    transform: scale(0.65);
                    margin-bottom: calc(-297mm * 0.35 + 1rem);
                }
            }
            @media (min-width: 768px) {
                .A4-page-container {
                    transform: scale(0.8);
                    margin-bottom: calc(-297mm * 0.2 + 1rem);
                }
            }
            @media (min-width: 1024px) {
                .A4-page-container {
                    transform: scale(0.9);
                    margin-bottom: calc(-297mm * 0.1 + 1rem);
                }
            }
            
            @media print {
                body { background-color: white; }
                .control-panel { display: none; }
                .A4-page-container {
                    transform: scale(1);
                    margin: 0;
                    box-shadow: none;
                }
                #printable-content {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                    height: 100%;
                }
            }
        `}</style>
    </div>
  );
};

export default PrintRollStatement;
