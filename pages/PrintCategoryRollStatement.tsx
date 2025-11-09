
import React, { useEffect, useState } from 'react';
import { db } from '../services/db';
import { Student, StudentSessionInfo } from '../types';
import { useAppData } from '../hooks/useAppData';
import { generatePdfFromComponent } from '../utils/pdfGenerator';
import { DownloadIcon, PrintIcon } from '../components/icons';
import ConsolidatedRollStatement from '../components/Wizard'; // Renamed from CategoryWiseRollStatement
import { CLASS_OPTIONS } from '../constants';

const PrintCategoryRollStatement: React.FC = () => {
  const [studentsByClass, setStudentsByClass] = useState<Map<string, Student[]>>(new Map());
  const { schoolDetails, activeSession } = useAppData();
  const [isProcessing, setIsProcessing] = useState(false);

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
        const sessionInfoMap = new Map(sessionInfos.map(info => [info.studentId, info]));

        // FIX: Reworked logic to iterate over student details first, ensuring the spread operator is always used on a valid Student object.
        const allStudentsForSession = allStudentDetails.map(student => {
            const info = sessionInfoMap.get(student.id!);
            if (!info) return null;
            return {
                ...student,
                className: info.className,
                section: info.section,
                rollNo: info.rollNo,
            };
        // FIX: Replaced a potentially problematic filter with an explicit type guard to ensure nulls are removed and the type is correctly narrowed.
        }).filter((student): student is NonNullable<typeof student> => student != null);

        const classNames = [...new Set(allStudentsForSession.map(s => s.className!))]
            .sort((a: string, b: string) => {
                const indexA = CLASS_OPTIONS.indexOf(a);
                const indexB = CLASS_OPTIONS.indexOf(b);
                if (indexA !== -1 && indexB !== -1) return indexA - indexB;
                if (indexA !== -1) return -1;
                if (indexB !== -1) return 1;
                return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
            });

        const grouped = new Map<string, Student[]>();
        // FIX: Add explicit string type to forEach callback parameter to resolve index type error on 'grouped.set'.
        classNames.forEach((className: string) => {
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
        setIsProcessing(true);
        await generatePdfFromComponent(
            <ConsolidatedRollStatement
                studentsByClass={studentsByClass}
                schoolDetails={schoolDetails}
                session={activeSession}
            />,
            `Consolidated-Roll-Statement-${activeSession}`,
            { orientation: 'l' } // Landscape orientation
        );
        setIsProcessing(false);
    }
  };

  if (studentsByClass.size === 0 || !schoolDetails) {
    return <div className="p-4 text-center">Loading student data for the active session...</div>;
  }
  
  const ControlPanel = () => (
      <div className="control-panel w-full bg-card p-3 mb-4 rounded-lg shadow-md print:hidden">
        <h1 className="text-lg font-bold">Document Preview</h1>
        <p className="text-sm text-foreground/70 mb-3">Preview for Consolidated Roll Statement for session {activeSession}.</p>
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
            <ConsolidatedRollStatement
                studentsByClass={studentsByClass}
                schoolDetails={schoolDetails}
                session={activeSession}
            />
        </div>

        <style>{`
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            @page { size: A4 landscape; margin: 0; }
            
            .A4-page-container {
                margin: 0 auto;
                transform-origin: top;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            .A4-page-container.landscape {
                transform: scale(0.35);
                margin-bottom: calc(-210mm * 0.65 + 1rem);
            }

            @media (min-width: 500px) {
                 .A4-page-container.landscape {
                    transform: scale(0.5);
                    margin-bottom: calc(-210mm * 0.5 + 1rem);
                 }
            }
            @media (min-width: 768px) {
                 .A4-page-container.landscape {
                    transform: scale(0.7);
                    margin-bottom: calc(-210mm * 0.3 + 1rem);
                }
            }
            @media (min-width: 1024px) {
                 .A4-page-container.landscape {
                    transform: scale(0.9);
                    margin-bottom: calc(-210mm * 0.1 + 1rem);
                }
            }
            
            @media print {
                body { background-color: white; }
                .control-panel { display: none; }
                .A4-page-container.landscape {
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

export default PrintCategoryRollStatement;
