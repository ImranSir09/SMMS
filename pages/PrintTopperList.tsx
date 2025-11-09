
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppData } from '../hooks/useAppData';
import { generatePdfFromComponent } from '../utils/pdfGenerator';
import { DownloadIcon, PrintIcon } from '../components/icons';
import SubjectTopperList from '../components/SubjectTopperList';
import { Student } from '../types';

const PrintTopperList: React.FC = () => {
  const location = useLocation();
  const { schoolDetails } = useAppData();
  const { toppers, examName, subjectName } = location.state as {
      toppers: { student: Student; totalScore: number }[];
      examName: string;
      subjectName: string;
  } || {};
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePrint = () => window.print();

  const handleDownloadPdf = async () => {
    if (toppers && schoolDetails) {
      setIsProcessing(true);
      await generatePdfFromComponent(
        <SubjectTopperList toppers={toppers} examName={examName} subjectName={subjectName} schoolDetails={schoolDetails} />,
        `Topper-List-${examName}-${subjectName}`
      );
      setIsProcessing(false);
    }
  };

  if (!toppers || !schoolDetails) {
    return <div className="p-4 text-center">Loading report data...</div>;
  }

  const ControlPanel = () => (
      <div className="control-panel w-full bg-card p-3 mb-4 rounded-lg shadow-md print:hidden">
        <h1 className="text-lg font-bold">Document Preview</h1>
        <p className="text-sm text-foreground/70 mb-3">Preview for {subjectName} Topper List in {examName}.</p>
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
            <SubjectTopperList toppers={toppers} examName={examName} subjectName={subjectName} schoolDetails={schoolDetails} />
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
                #printable-content {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                    height: 100%;
                }
            }
        `}</style>
    </div>
  );
};

export default PrintTopperList;
