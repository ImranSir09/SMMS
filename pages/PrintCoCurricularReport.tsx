import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../services/db';
import { Student } from '../types';
import CoCurricularReport from '../components/CoCurricularReport';
import { useAppData } from '../hooks/useAppData';
import { generatePdfFromComponent } from '../utils/pdfGenerator';
import { DownloadIcon, PrintIcon } from '../components/icons';

const PrintCoCurricularReport: React.FC = () => {
  const { studentId, subject } = useParams<{ studentId: string; subject: string }>();
  const [student, setStudent] = useState<Student | null>(null);
  const { schoolDetails, activeSession } = useAppData();

  useEffect(() => {
    if (studentId) {
      db.students.get(Number(studentId)).then(setStudent);
    }
  }, [studentId]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (student && schoolDetails && subject) {
      await generatePdfFromComponent(
        <CoCurricularReport student={student} schoolDetails={schoolDetails} subject={subject} session={activeSession} />,
        `CoCurricular-Report-${student.admissionNo}-${subject}`
      );
    }
  };

  if (!student || !schoolDetails || !subject) {
    return <div>Loading data...</div>;
  }

  const ControlPanel = () => (
    <div className="max-w-4xl mx-auto mb-4 p-4 bg-white rounded-lg shadow-md print:hidden">
      <h1 className="text-2xl font-bold text-gray-800">Document Preview</h1>
      <p className="text-gray-600 mb-4">Preview for {student.name}'s Co-Curricular Report for {subject}.</p>
      <div className="flex flex-wrap gap-4">
        <button
          onClick={handleDownloadPdf}
          className="flex items-center gap-2 py-2 px-4 bg-green-600 text-white font-semibold rounded-md shadow-md hover:bg-green-700 focus:outline-none"
        >
          <DownloadIcon className="w-5 h-5" /> Download PDF
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 py-2 px-4 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 focus:outline-none"
        >
          <PrintIcon className="w-5 h-5" /> Print
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-200 min-h-screen p-4 sm:p-8 print:p-0 print:bg-white">
      <ControlPanel />
      <div className="flex justify-center items-start">
        <CoCurricularReport student={student} schoolDetails={schoolDetails} subject={subject} session={activeSession} />
      </div>
      <style>{`
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        @page { size: A4; margin: 0; }
        @media print {
          body * { visibility: hidden; }
          #fa-report, #fa-report * { visibility: visible; }
          #fa-report { position: absolute; left: 0; top: 0; width: 100%; height: 100%; }
          .A4-page-container { transform: scale(1.0); }
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

export default PrintCoCurricularReport;