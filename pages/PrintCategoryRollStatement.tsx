

import React, { useEffect, useState } from 'react';
import { db } from '../services/db';
import { Student, StudentSessionInfo } from '../types';
import CategoryWiseRollStatement from '../components/CategoryWiseRollStatement';
import { useAppData } from '../hooks/useAppData';
import { DownloadIcon, PrintIcon } from '../components/icons';
import { generateCategoryRollStatementVectorPdf } from '../utils/pdfGenerator';

const PrintCategoryRollStatement: React.FC = () => {
    const [studentsByClass, setStudentsByClass] = useState<Map<string, Student[]>>(new Map());
    const [activeClassName, setActiveClassName] = useState<string>('');
    const { schoolDetails, activeSession } = useAppData();

    useEffect(() => {
        const fetchStudents = async () => {
            if (activeSession) {
                const sessionInfos: StudentSessionInfo[] = await db.studentSessionInfo.where({ session: activeSession }).toArray();
                if (sessionInfos.length === 0) {
                    setStudentsByClass(new Map());
                    return;
                }
                const studentIds = sessionInfos.map(info => info.studentId);
                const studentDetails: Student[] = await db.students.where('id').anyOf(studentIds).toArray();
                const studentMap = new Map(studentDetails.map(s => [s.id!, s]));

                const groupedByClass = new Map<string, Student[]>();
                sessionInfos.forEach(info => {
                    const student = studentMap.get(info.studentId);
                    if (student) {
                        const studentWithSessionInfo = {
                            ...student,
                            className: info.className,
                            section: info.section,
                            rollNo: info.rollNo,
                        };
                        if (!groupedByClass.has(info.className)) {
                            groupedByClass.set(info.className, []);
                        }
                        groupedByClass.get(info.className)?.push(studentWithSessionInfo);
                    }
                });

                groupedByClass.forEach(students => students.sort((a, b) => (a.rollNo || '').localeCompare(b.rollNo || '', undefined, { numeric: true, sensitivity: 'base' })));
                
                const sortedClassNames = Array.from(groupedByClass.keys()).sort((a,b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
                
                const sortedMap = new Map<string, Student[]>();
                sortedClassNames.forEach(name => {
                    sortedMap.set(name, groupedByClass.get(name)!);
                });

                setStudentsByClass(sortedMap);
                setActiveClassName(sortedClassNames[0] || '');
            }
        };
        fetchStudents();
    }, [activeSession]);

    const handlePrint = () => window.print();

    const handleDownloadPdf = async () => {
        const studentsForSelectedClass = studentsByClass.get(activeClassName) || [];
        if (schoolDetails && studentsForSelectedClass.length > 0) {
             await generateCategoryRollStatementVectorPdf(
                studentsForSelectedClass, 
                activeClassName, 
                schoolDetails,
                `Category-Roll-Statement-${activeClassName}`
            );
        }
    };
    
    if (!schoolDetails || studentsByClass.size === 0) return <div>Loading...</div>;

    const studentsForSelectedClass = studentsByClass.get(activeClassName) || [];
    
    return (
        <div className="bg-gray-200 min-h-screen p-4 sm:p-8 print:p-0 print:bg-white">
            <div className="max-w-4xl mx-auto mb-4 p-4 bg-white rounded-lg shadow-md print:hidden">
                <h1 className="text-2xl font-bold text-gray-800">Category-wise Roll Statement</h1>
                <div className="flex flex-wrap items-center gap-4 mt-2">
                    <div>
                        <label htmlFor="class-select" className="text-sm font-medium mr-2">Select Class:</label>
                        <select id="class-select" value={activeClassName} onChange={e => setActiveClassName(e.target.value)} className="p-2 border border-gray-300 rounded-md">
                            {Array.from(studentsByClass.keys()).map(name => <option key={name} value={name}>{name}</option>)}
                        </select>
                    </div>
                    <button onClick={handleDownloadPdf} className="flex items-center gap-2 py-2 px-4 bg-green-600 text-white font-semibold rounded-md shadow-md hover:bg-green-700">
                        <DownloadIcon className="w-5 h-5"/> Download PDF
                    </button>
                    <button onClick={handlePrint} className="flex items-center gap-2 py-2 px-4 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700">
                        <PrintIcon className="w-5 h-5"/> Print
                    </button>
                </div>
            </div>

            <div className="flex justify-center items-start">
                <CategoryWiseRollStatement students={studentsForSelectedClass} className={activeClassName} schoolDetails={schoolDetails} />
            </div>
             <style>{`
                @media print {
                    body * { visibility: hidden; }
                    #category-roll-statement, #category-roll-statement * { visibility: visible; }
                    #category-roll-statement { position: absolute; left: 0; top: 0; width: 100%; }
                }
            `}</style>
        </div>
    );
};

export default PrintCategoryRollStatement;