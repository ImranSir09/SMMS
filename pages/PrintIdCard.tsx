import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../services/db';
import { Student } from '../types';
import IdCard from '../components/IdCard';
import { useAppData } from '../hooks/useAppData';
import { generatePdfFromComponent } from '../utils/pdfGenerator';
import { DownloadIcon, PrintIcon } from '../components/icons';

const PrintIdCard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [student, setStudent] = useState<Student | null>(null);
  const { schoolDetails } = useAppData();

  useEffect(() => {
    if (id) {
      db.students.get(Number(id)).then(setStudent);
    }
  }, [id]);

  const handlePrint = () => {
    window.print();
  };
  
  const handleDownloadPdf = async () => {
    if (student && schoolDetails) {
        // The generatePdfFromComponent will capture the new two-sided component layout
        await generatePdfFromComponent(
            <IdCard student={student} schoolDetails={schoolDetails} />,
            `ID-Card-${student.admissionNo}-${student.name}`
        );
    }
  };

  if (!student || !schoolDetails) {
    return <div>Loading student data...</div>;
  }

  const ControlPanel = () => (
      <div className="w-full mx-auto mb-4 p-4 bg-white rounded-lg shadow-md print:hidden">
        <h1 className="text-2xl font-bold text-gray-800">ID Card Preview</h1>
        <p className="text-gray-600 mb-4">Preview for {student.name}'s ID Card (Front & Back).</p>
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
    <div className="bg-gray-200 min-h-screen p-4 sm:p-8 print:p-0 print:bg-white flex flex-col items-center">
      <ControlPanel />
      
      {/* This div is the target for both printing and PDF generation */}
      <div id="student-id-card-printable">
         <IdCard student={student} schoolDetails={schoolDetails} />
      </div>

      <style>{`
        @media print {
          body, html {
            background-color: white;
          }
          body * {
             visibility: hidden;
          }
          #student-id-card-printable, #student-id-card-printable * {
            visibility: visible;
          }
          #student-id-card-printable {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: auto;
            transform: scale(0.95); /* Scale down slightly to fit on one page */
            transform-origin: top left;
          }
        }
      `}</style>
    </div>
  );
};

export default PrintIdCard;