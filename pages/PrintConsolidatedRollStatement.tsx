
import React, { useEffect, useState } from 'react';
import { db } from '../services/db';
import { Student, StudentSessionInfo } from '../types';
import ConsolidatedRollStatement from '../components/ConsolidatedRollStatement';
import { useAppData } from '../hooks/useAppData';
import { DownloadIcon, PrintIcon } from '../components/icons';
import { generateConsolidatedRollStatementPdf } from '../utils/pdfGenerator';

const PrintConsolidatedRollStatement: React.FC = () => {
    const [studentsByClass, setStudentsByClass] = useState<Map<string, Student[]>>(new Map());
    const { schoolDetails, activeSession } = useAppData();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStudents = async () => {
            if (activeSession) {
                const sessionInfos: StudentSessionInfo[] = await db.studentSessionInfo.where({ session: activeSession }).toArray();
                
                if (sessionInfos.length === 0) {
                    setStudentsByClass(new Map());
                    setIsLoading(false);
                    return;
                }

                const studentIds = sessionInfos.map(info => info.studentId);
                const studentDetails: Student[] = await db.students.where('id').anyOf(studentIds).toArray();
                const studentMap = new Map(studentDetails.map(s => [s.id!, s]));

                const groupedByClass = new Map<string, Student[]>();
                
                sessionInfos.forEach(info => {
                    const student = studentMap.get(info.studentId);
                    if (student) {
                        // Merge session info into student object for the component
                        const fullStudent = { ...student, ...info };
                        if (!groupedByClass.has(info.className)) {
                            groupedByClass.set(info.className, []);
                        }
                        groupedByClass.get(info.className)?.push(fullStudent);
                    }
                });

                setStudentsByClass(groupedByClass);
            }
            setIsLoading(false);
        };
        fetchStudents();
    }, [activeSession]);

    const handlePrint = () => window.print();

    const handleDownloadPdf = async () => {
        if (schoolDetails && activeSession) {
            await generateConsolidatedRollStatementPdf(studentsByClass, schoolDetails, activeSession);
        }
    };
    
    if (isLoading) return <div className="p-8 text-center">Loading Data...</div>;
    if (!schoolDetails) return <div className="p-8 text-center">School details missing.</div>;

    return (
        <div className="bg-gray-200 min-h-screen p-4 sm:p-8 print:p-0 print:bg-white">
            <div className="max-w-6xl mx-auto mb-4 p-4 bg-white rounded-lg shadow-md print:hidden flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Consolidated Roll Statement</h1>
                    <p className="text-sm text-gray-600">Session: {activeSession}</p>
                </div>
                <div className="flex gap-4">
                    <button onClick={handleDownloadPdf} className="flex items-center gap-2 py-2 px-4 bg-green-600 text-white font-semibold rounded-md shadow-md hover:bg-green-700">
                        <DownloadIcon className="w-5 h-5"/> Download PDF
                    </button>
                    <button onClick={handlePrint} className="flex items-center gap-2 py-2 px-4 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700">
                        <PrintIcon className="w-5 h-5"/> Print
                    </button>
                </div>
            </div>

            <div className="flex justify-center items-start overflow-auto">
                <ConsolidatedRollStatement studentsByClass={studentsByClass} schoolDetails={schoolDetails} session={activeSession} />
            </div>
             <style>{`
                @media print {
                    body * { visibility: hidden; }
                    #consolidated-roll-statement, #consolidated-roll-statement * { visibility: visible; }
                    #consolidated-roll-statement { position: absolute; left: 0; top: 0; width: 100%; height: 100%; }
                    @page { size: landscape; }
                }
            `}</style>
        </div>
    );
};

export default PrintConsolidatedRollStatement;
