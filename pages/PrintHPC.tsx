
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../services/db';
import { Student, SbaReportData, HPCReportData, Mark, DetailedFormativeAssessment, StudentExamData, Exam } from '../types';
import HolisticProgressCard from '../components/HolisticProgressCard';
import { useAppData } from '../hooks/useAppData';
import { DownloadIcon, PrintIcon } from '../components/icons';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

type AllData = {
    student: Student | null;
    sbaData: SbaReportData | null;
    hpcData: HPCReportData | null;
    allMarks: Mark[];
    allDetailedFA: DetailedFormativeAssessment[];
    allStudentExamData: StudentExamData[];
    allExams: Exam[];
};

const PrintHPC: React.FC = () => {
    const { studentId: studentIdStr } = useParams<{ studentId: string }>();
    const studentId = Number(studentIdStr);
    const { schoolDetails, activeSession } = useAppData();
    const [data, setData] = useState<AllData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        const fetchData = async () => {
            if (!studentId || !activeSession) return;
            setIsLoading(true);
            try {
                const studentPromise = db.students.get(studentId);
                const sessionInfoPromise = db.studentSessionInfo.where({ studentId, session: activeSession }).first();
                const sbaPromise = db.sbaReports.where({ studentId, session: activeSession }).first();
                const hpcPromise = db.hpcReports.where({ studentId, session: activeSession }).first();
                const marksPromise = db.marks.where({ studentId }).toArray();
                const faPromise = db.detailedFormativeAssessments.where({ studentId, session: activeSession }).toArray();
                const studentExamPromise = db.studentExamData.where({ studentId }).toArray();
                
                const [studentData, sessionInfo, sbaData, hpcData, allMarks, allDetailedFA, allStudentExamData] = await Promise.all([
                    studentPromise, sessionInfoPromise, sbaPromise, hpcPromise, marksPromise, faPromise, studentExamPromise
                ]);
                
                if (!studentData) {
                    setData(null);
                    return;
                }

                const examIds = [...new Set(allMarks.map(m => m.examId))];
                const allExams = await db.exams.where('id').anyOf(examIds).toArray();

                setData({
                    student: { ...studentData, ...sessionInfo },
                    sbaData: sbaData || null,
                    hpcData: hpcData || null,
                    allMarks, allDetailedFA, allStudentExamData, allExams
                });
            } catch (error) {
                console.error("Failed to fetch data for HPC", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [studentId, activeSession]);

    const handleDownloadPdf = async () => {
        if (!data?.student) return;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageIds = [`hpc-page1-${studentId}`, `hpc-page2-${studentId}`, `hpc-page3-${studentId}`, `hpc-page4-${studentId}`];
        
        for (let i = 0; i < pageIds.length; i++) {
            const element = document.getElementById(pageIds[i]);
            if (element) {
                const canvas = await html2canvas(element, { scale: 3 });
                const imgData = canvas.toDataURL('image/png');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                if (i > 0) pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            }
        }
        pdf.save(`HPC-${data.student.name}.pdf`);
    };

    if (isLoading) return <div>Loading Holistic Progress Card data...</div>;
    if (!data || !data.student || !schoolDetails) return <div>Student not found or data missing.</div>;
    
    return (
        <div className="bg-gray-200 min-h-screen p-4 sm:p-8 print:p-0 print:bg-white">
            <div className="max-w-4xl mx-auto mb-4 p-4 bg-white rounded-lg shadow-md print:hidden">
                 <h1 className="text-2xl font-bold text-gray-800">Holistic Progress Card</h1>
                 <p className="text-gray-600 mb-4">Preview for {data.student.name}.</p>
                 <div className="flex flex-wrap gap-4">
                    <button onClick={handleDownloadPdf} className="flex items-center gap-2 py-2 px-4 bg-green-600 text-white font-semibold rounded-md shadow-md hover:bg-green-700">
                        <DownloadIcon className="w-5 h-5"/> Download as PDF
                    </button>
                    <button onClick={() => window.print()} className="flex items-center gap-2 py-2 px-4 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700">
                        <PrintIcon className="w-5 h-5"/> Print
                    </button>
                 </div>
            </div>
            <div className="flex flex-col items-center gap-4">
                <HolisticProgressCard {...data} schoolDetails={schoolDetails} />
            </div>
        </div>
    );
};

export default PrintHPC;
