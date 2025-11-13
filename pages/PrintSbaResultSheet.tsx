
import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../services/db';
import { Student, StudentSessionInfo, Mark, Exam } from '../types';
import SbaResultSheet from '../components/SbaResultSheet';
import { useAppData } from '../hooks/useAppData';
import { generatePdfFromElement } from '../utils/pdfGenerator';
import { DownloadIcon, PrintIcon } from '../components/icons';
import { CLASS_OPTIONS } from '../constants';

type ReportData = {
    students: Student[];
    marks: Map<number, Mark[]>;
    exam: Exam | null;
};

const PrintSbaResultSheet: React.FC = () => {
    const { className, examId: examIdStr } = useParams<{ className: string; examId: string }>();
    const examId = useMemo(() => Number(examIdStr), [examIdStr]);
    const { schoolDetails, activeSession } = useAppData();
    const [reportData, setReportData] = useState<ReportData | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!className || !examId || !activeSession) return;

            const sessionInfos: StudentSessionInfo[] = await db.studentSessionInfo
                .where({ className, session: activeSession })
                .toArray();
            
            if (sessionInfos.length === 0) {
                setReportData({ students: [], marks: new Map(), exam: null });
                return;
            }

            const studentIds = sessionInfos.map(info => info.studentId);
            const sessionInfoMap = new Map(sessionInfos.map(info => [info.studentId, info]));
            const studentDetails = await db.students.where('id').anyOf(studentIds).toArray();
            
            const students = studentDetails.map(student => ({
                ...student,
                rollNo: sessionInfoMap.get(student.id!)?.rollNo || '',
            })).sort((a, b) => (a.rollNo || '').localeCompare(b.rollNo || '', undefined, { numeric: true, sensitivity: 'base' }));

            const allMarks = await db.marks.where({ examId }).toArray();
            const marksMap = new Map<number, Mark[]>();
            allMarks.forEach(mark => {
                if (!marksMap.has(mark.studentId)) {
                    marksMap.set(mark.studentId, []);
                }
                marksMap.get(mark.studentId)!.push(mark);
            });
            
            const exam = await db.exams.get(examId);

            setReportData({ students, marks: marksMap, exam });
        };
        fetchData();
    }, [className, examId, activeSession]);

    const handlePrint = () => window.print();

    const handleDownloadPdf = async () => {
        if (reportData?.exam) {
            await generatePdfFromElement('sba-result-sheet', `SBA-Result-Sheet-${className}-${reportData.exam.name}`, 'l');
        }
    };

    const maxTotal = useMemo(() => {
        if (!className) return 600;
        const classIndex = CLASS_OPTIONS.indexOf(className);
        // Assuming PP1, PP2, Balvatika, 1st-5th are primary/pre-primary
        // This corresponds to indices 0 through 8 in CLASS_OPTIONS
        return classIndex >= 0 && classIndex <= 8 ? 500 : 600;
    }, [className]);
    
    if (!schoolDetails || !reportData) {
        return <div className="p-4 text-center">Loading report data...</div>;
    }

    if (reportData.students.length === 0) {
        return <div className="p-4 text-center">No students found for this class in the current session.</div>;
    }

    return (
        <div className="bg-gray-200 min-h-screen p-4 sm:p-8 print:p-0 print:bg-white">
            <div className="max-w-4xl mx-auto mb-4 p-4 bg-white rounded-lg shadow-md print:hidden">
                <h1 className="text-2xl font-bold text-gray-800">SBA Result Sheet Preview</h1>
                <p className="text-gray-600 mb-4">Preview for Class {className} - {reportData.exam?.name}.</p>
                <div className="flex flex-wrap gap-4">
                    <button onClick={handleDownloadPdf} className="flex items-center gap-2 py-2 px-4 bg-green-600 text-white font-semibold rounded-md shadow-md hover:bg-green-700">
                        <DownloadIcon className="w-5 h-5"/> Download PDF
                    </button>
                    <button onClick={handlePrint} className="flex items-center gap-2 py-2 px-4 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700">
                        <PrintIcon className="w-5 h-5"/> Print
                    </button>
                </div>
            </div>

            <div className="flex justify-center items-start">
                <SbaResultSheet
                    students={reportData.students}
                    marks={reportData.marks}
                    schoolDetails={schoolDetails}
                    examName={reportData.exam?.name || 'Assessment'}
                    className={className!}
                    maxTotal={maxTotal}
                />
            </div>

            <style>{`
                body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                @page { size: A4 landscape; margin: 0; }
                @media print {
                    body * { visibility: hidden; }
                    #sba-result-sheet, #sba-result-sheet * { visibility: visible; }
                    #sba-result-sheet { position: absolute; left: 0; top: 0; width: 100%; height: auto; }
                    .A4-landscape-container { transform: scale(1.0) !important; margin: 0 !important; }
                }
                .A4-landscape-container {
                    transform-origin: top center;
                    margin: 1rem 0;
                    transform: scale(0.85);
                }
                 @media (max-width: 1200px) { .A4-landscape-container { transform: scale(0.7); } }
                 @media (max-width: 900px) { .A4-landscape-container { transform: scale(0.5); } }
                 @media (max-width: 640px) { .A4-landscape-container { transform: scale(0.35); } }
                 @media (max-width: 500px) { .A4-landscape-container { transform: scale(0.28); } }
                 @media (max-width: 400px) { .A4-landscape-container { transform: scale(0.22); } }
            `}</style>
        </div>
    );
};

export default PrintSbaResultSheet;
