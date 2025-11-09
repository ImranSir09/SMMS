
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../services/db';
import { Student, SbaReportData, HPCReportData, Mark, DetailedFormativeAssessment, StudentExamData, Exam } from '../types';
import { useAppData } from '../hooks/useAppData';
import { generatePdfFromComponent } from '../utils/pdfGenerator';
import { DownloadIcon, PrintIcon } from '../components/icons';
import HolisticProgressCard from '../components/HolisticProgressCard';

// A type to hold all the fetched data for a student
interface StudentReportBundle {
    student: Student;
    sbaData: SbaReportData | null;
    hpcData: HPCReportData | null;
    allMarks: Mark[];
    allDetailedFA: DetailedFormativeAssessment[];
    allStudentExamData: StudentExamData[];
}

const PrintHPC: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const [reportData, setReportData] = useState<StudentReportBundle | null>(null);
  const [allExams, setAllExams] = useState<Exam[]>([]);
  const { schoolDetails, activeSession } = useAppData();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const studentNumId = Number(studentId);
    if (isNaN(studentNumId)) return;

    const fetchData = async () => {
        const [student, sbaData, hpcData, allMarks, allDetailedFA, allStudentExamData, exams] = await Promise.all([
            db.students.get(studentNumId),
            db.sbaReports.where({ studentId: studentNumId, session: activeSession }).first(),
            db.hpcReports.where({ studentId: studentNumId, session: activeSession }).first(),
            db.marks.where({ studentId: studentNumId }).toArray(),
            db.detailedFormativeAssessments.where({ studentId: studentNumId, session: activeSession }).toArray(),
            db.studentExamData.where({ studentId: studentNumId }).toArray(),
            db.exams.toArray()
        ]);

        if (student) {
            setReportData({
                student,
                sbaData: sbaData || null,
                hpcData: hpcData || null,
                allMarks,
                allDetailedFA,
                allStudentExamData
            });
            setAllExams(exams);
        }
    };

    fetchData();
  }, [studentId, activeSession]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (reportData && schoolDetails && allExams) {
        setIsProcessing(true);
        await generatePdfFromComponent(
            <HolisticProgressCard
                {...reportData}
                schoolDetails={schoolDetails}
                allExams={allExams}
            />,
            `HPC-${reportData.student.name}-${reportData.student.admissionNo}`
        );
        setIsProcessing(false);
    }
  };

  if (!reportData || !schoolDetails) {
    return <div className="p-4 text-center">Loading Report Data...</div>;
  }
  
  const student = reportData.student;

  const ControlPanel = () => (
      <div className="control-panel w-full bg-card p-3 mb-4 rounded-lg shadow-md print:hidden">
        <h1 className="text-lg font-bold">Document Preview</h1>
        <p className="text-sm text-foreground/70 mb-3">Preview for {student.name}'s Holistic Progress Card.</p>
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
             <HolisticProgressCard 
                {...reportData}
                schoolDetails={schoolDetails}
                allExams={allExams}
             />
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
                .page-break { page-break-after: always; }
                .page-break:last-child { page-break-after: auto; }
            }
        `}</style>
    </div>
  );
};

export default PrintHPC;
