import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../services/db';
import { Student } from '../types';
import DobCertificate from '../components/DobCertificate';
import { useAppData } from '../hooks/useAppData';
// FIX: Renamed function to generatePdfFromComponentAsImage to match the exported member from pdfGenerator.
import { generatePdfFromComponentAsImage } from '../utils/pdfGenerator';
import { DownloadIcon, PrintIcon } from '../components/icons';

const PrintDobCertificate: React.FC = () => {
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
        // FIX: Renamed function to generatePdfFromComponentAsImage to match the exported member from pdfGenerator.
        await generatePdfFromComponentAsImage(
            <DobCertificate student={student} schoolDetails={schoolDetails} />,
            `DOB-Certificate-${student.admissionNo}-${student.name}`
        );
    }
  };

  if (!student || !schoolDetails) {
    return <div>Loading student data...</div>;
  }

  const ControlPanel = () => (
      <div className="max-w-4xl mx-auto mb-4 p-4 bg-white rounded-lg shadow-md print:hidden">
        <h1 className="text-2xl font-bold text-gray-800">Document Preview</h1>
        <p className="text-gray-600 mb-4">Preview for {student.name}'s Date of Birth Certificate.</p>
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
             <DobCertificate student={student} schoolDetails={schoolDetails} />
        </div>

        <style>{`
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            @page { size: A4; margin: 0; }
            @media print {
                body * { visibility: hidden; }
                #dob-certificate, #dob-certificate * { visibility: visible; }
                #dob-certificate { position: absolute; left: 0; top: 0; width: 100%; height: 100%; }
            }
            .A4-page-container {
                display: flex;
                justify-content: center;
                align-items: flex-start;
                transform: scale(0.75);
                transform-origin: top center;
                print:transform: scale(1);
            }
        `}</style>
    </div>
  );
};

export default PrintDobCertificate;