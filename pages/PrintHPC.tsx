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
        await generatePdfFromComponent(
            <HolisticProgressCard
                {...reportData}
                schoolDetails={schoolDetails}
                allExams={allExams}
            />,
            `HPC-${reportData.student.name}-${reportData.student.admissionNo}`
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
        <p className="text-gray-600 mb-4">Preview for {student.name}'s Holistic Progress Card.</p>
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
             <HolisticProgressCard 
                {...reportData}
                schoolDetails={schoolDetails}
                allExams={allExams}
             />
        </div>

        <style>{`
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            @page { size: A4; margin: 0; }
            @media print {
                body * { visibility: hidden; }
                .A4-page-container, .A4-page-container * { visibility: visible; }
                .A4-page-container { 
                    position: absolute; left: 0; top: 0; 
                    transform: scale(1.0);
                    box-shadow: none;
                    margin: 0;
                }
            }
            .A4-page-container {
                display: flex;
                justify-content: center;
                align-items: flex-start;
                transform: scale(0.75);
                transform-origin: top center;
            }
        `}</style>
    </div>
  );
};

export default PrintHPC;