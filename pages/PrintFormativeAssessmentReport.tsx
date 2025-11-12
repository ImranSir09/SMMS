

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../services/db';
import { Student, SbaReportData, Mark, DetailedFormativeAssessment } from '../types';
import { useAppData } from '../hooks/useAppData';
// FIX: Renamed function to generatePdfFromComponentAsImage to match the exported member from pdfGenerator.
import { generatePdfFromComponentAsImage } from '../utils/pdfGenerator';
import { DownloadIcon, PrintIcon } from '../components/icons';
import FormativeAssessmentReport from '../components/FormativeAssessmentReport';

interface ReportBundle {
    student: Student;
    sbaData: SbaReportData | null;
    allMarks: Mark[];
    allDetailedFA: DetailedFormativeAssessment[];
}

const PrintFormativeAssessmentReport: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const [reportData, setReportData] = useState<ReportBundle | null>(null);
  const { schoolDetails, activeSession } = useAppData();

  useEffect(() => {
    const studentNumId = Number(studentId);
    if (isNaN(studentNumId)) return;

    const fetchData = async () => {
        const [student, sbaData, allMarks, allDetailedFA] = await Promise.all([
            db.students.get(studentNumId),
            // FIX: Rename 'academicYear' to 'session' to match the updated database schema.
            db.sbaReports.where({ studentId: studentNumId, session: activeSession }).first(),
            db.marks.where({ studentId: studentNumId }).toArray(),
            // FIX: Rename 'academicYear' to 'session' to match the updated database schema.
            db.detailedFormativeAssessments.where({ studentId: studentNumId, session: activeSession }).toArray(),
        ]);

        if (student) {
            setReportData({
                student,
                sbaData: sbaData || null,
                allMarks,
                allDetailedFA
            });
        }
    };

    fetchData();
  }, [studentId, activeSession]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (reportData && schoolDetails) {
        // FIX: Renamed function to generatePdfFromComponentAsImage to match the exported member from pdfGenerator.
        await generatePdfFromComponentAsImage(
            <FormativeAssessmentReport
                {...reportData}
                schoolDetails={schoolDetails}
            />,
            `Formative-Report-${reportData.student.name}-${reportData.student.admissionNo}`
        );
    }
  };

  if (!reportData || !schoolDetails) {
    return <div className="p-4 text-center">Loading Report Data...</div>;
  }
  
  const student = reportData.student;

  const ControlPanel = () => (
      <div className="max-w-4xl mx-auto mb-4 p-4 bg-white rounded-lg shadow-md print:hidden">
        <h1 className="text-2xl font-bold text-gray-800">Document Preview</h1>
        <p className="text-gray-600 mb-4">Preview for {student.name}'s Formative Assessment Report.</p>
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
            <div className="A4-page-container">
                 <FormativeAssessmentReport 
                    {...reportData}
                    schoolDetails={schoolDetails}
                 />
            </div>
        </div>

        <style>{`
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            @page { size: A4; margin: 0; }
            @media print {
                .print\\:hidden { display: none; }
                body * { visibility: hidden; }
                .A4-page-container, .A4-page-container * { visibility: visible; }
                .A4-page-container { 
                    position: static;
                    transform: scale(1.0);
                    margin: 0;
                    box-shadow: none;
                }
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

export default PrintFormativeAssessmentReport;