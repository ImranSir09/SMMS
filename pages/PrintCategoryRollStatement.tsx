import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../services/db';
import { Student } from '../types';
import CategoryWiseRollStatement from '../components/CategoryWiseRollStatement';
import { useAppData } from '../hooks/useAppData';
import { generatePdfFromComponent } from '../utils/pdfGenerator';
import { DownloadIcon, PrintIcon } from '../components/icons';

const PrintCategoryRollStatement: React.FC = () => {
  const { className } = useParams<{ className: string }>();
  const [students, setStudents] = useState<Student[]>([]);
  const { schoolDetails } = useAppData();

  useEffect(() => {
    if (className) {
      db.students
        .where('className')
        .equals(className)
        .sortBy('rollNo')
        .then(setStudents);
    }
  }, [className]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (className) {
        await generatePdfFromComponent(
            <CategoryWiseRollStatement students={students} className={className} schoolDetails={schoolDetails} />,
            `Category-Roll-Statement-Class-${className}`
        );
    }
  };

  if (!students.length || !schoolDetails) {
    return <div className="p-4 text-center">Loading student data or no students found for this class...</div>;
  }
  
  const ControlPanel = () => (
      <div className="max-w-4xl mx-auto mb-4 p-4 bg-white rounded-lg shadow-md print:hidden">
        <h1 className="text-2xl font-bold text-gray-800">Document Preview</h1>
        <p className="text-gray-600 mb-4">Preview for Class {className} Category Wise Roll Statement.</p>
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
             <CategoryWiseRollStatement students={students} className={className!} schoolDetails={schoolDetails} />
        </div>

        <style>{`
             body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            @page { size: A4; margin: 0; }
            @media print {
                body * { visibility: hidden; }
                #category-roll-statement, #category-roll-statement * { visibility: visible; }
                #category-roll-statement { position: absolute; left: 0; top: 0; width: 100%; height: auto; }
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

export default PrintCategoryRollStatement;