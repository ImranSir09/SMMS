
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../services/db';
import { Student } from '../types';
import { useAppData } from '../hooks/useAppData';
import { DownloadIcon, PrintIcon } from '../components/icons';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import CoCurricularReport from '../components/CoCurricularReport';

const PrintCoCurricularReport: React.FC = () => {
    const { studentId: studentIdStr, subject } = useParams<{ studentId: string, subject: string }>();
    const studentId = Number(studentIdStr);
    const [student, setStudent] = useState<Student | null>(null);
    const { schoolDetails, activeSession } = useAppData();

    useEffect(() => {
        const fetchStudent = async () => {
            if (studentId && activeSession) {
                const studentData = await db.students.get(studentId);
                if (studentData) {
                    const sessionInfo = await db.studentSessionInfo.where({ studentId, session: activeSession }).first();
                    setStudent({ ...studentData, ...sessionInfo });
                }
            }
        };
        fetchStudent();
    }, [studentId, activeSession]);

    const handlePrint = () => window.print();

    const handleDownloadPdf = async () => {
        const element = document.getElementById('fa-report');
        if (element && student && subject) {
            const canvas = await html2canvas(element, { scale: 3 });
            const data = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgProperties = pdf.getImageProperties(data);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProperties.height * pdfWidth) / imgProperties.width;
            pdf.addImage(data, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Co-Curricular-${subject}-${student.name}.pdf`);
        }
    };
    
    if (!student || !schoolDetails || !subject || !activeSession) return <div>Loading...</div>;

    return (
        <div className="bg-gray-200 min-h-screen p-4 sm:p-8 print:p-0 print:bg-white">
            <div className="max-w-4xl mx-auto mb-4 p-4 bg-white rounded-lg shadow-md print:hidden">
                <h1 className="text-2xl font-bold text-gray-800">Co-Curricular Report</h1>
                <p className="text-gray-600 mb-4">Preview for {student.name} ({subject}).</p>
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
                <CoCurricularReport student={student} schoolDetails={schoolDetails} subject={subject} session={activeSession} />
            </div>
             <style>{`
                @media print {
                    body * { visibility: hidden; }
                    #fa-report, #fa-report * { visibility: visible; }
                    #fa-report { position: absolute; left: 0; top: 0; width: 100%; }
                }
            `}</style>
        </div>
    );
};

export default PrintCoCurricularReport;
