

import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../services/db';
import { Student, HPCReportData } from '../types';
import { useAppData } from '../hooks/useAppData';
import { generatePdfFromComponent } from '../utils/pdfGenerator';
import { DownloadIcon, PrintIcon } from '../components/icons';
import HPCFoundationalCard from '../components/HPCFoundationalCard';
import HPCPreparatoryCard from '../components/HPCPreparatoryCard';
import HPCMiddleCard from '../components/HPCMiddleCard';
import { ACADEMIC_YEAR } from '../constants';


const getStageForClass = (className: string): 'Foundational' | 'Preparatory' | 'Middle' | null => {
    const foundational = ['PP1', 'PP2', 'Balvatika', '1st', '2nd'];
    const preparatory = ['3rd', '4th', '5th'];
    const middle = ['6th', '7th', '8th'];

    if (foundational.includes(className)) return 'Foundational';
    if (preparatory.includes(className)) return 'Preparatory';
    if (middle.includes(className)) return 'Middle';
    return null;
};

const PrintHPC: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const numericStudentId = useMemo(() => Number(studentId), [studentId]);
  
  const [student, setStudent] = useState<Student | null>(null);
  const [hpcData, setHpcData] = useState<HPCReportData | null>(null);
  
  const { schoolDetails } = useAppData();

  useEffect(() => {
    if (numericStudentId) {
      db.students.get(numericStudentId).then(setStudent);
      db.hpcReports.where({ studentId: numericStudentId, academicYear: ACADEMIC_YEAR }).first().then(data => setHpcData(data || null));
    }
  }, [numericStudentId]);

  const handlePrint = () => {
    window.print();
  };
  
  const handleDownloadPdf = async () => {
    if (student && hpcData && schoolDetails) {
        let cardComponent;
        switch(hpcData.stage) {
            case 'Foundational':
                cardComponent = <HPCFoundationalCard student={student} schoolDetails={schoolDetails} hpcData={hpcData} />;
                break;
            case 'Preparatory':
                cardComponent = <HPCPreparatoryCard student={student} schoolDetails={schoolDetails} hpcData={hpcData} />;
                break;
            case 'Middle':
                cardComponent = <HPCMiddleCard student={student} schoolDetails={schoolDetails} hpcData={hpcData} />;
                break;
            default:
                alert(`HPC Card for ${hpcData.stage} stage is not yet implemented.`);
                return;
        }

        await generatePdfFromComponent(
            cardComponent,
            `HPC-${hpcData.stage}-${student.admissionNo}`
        );
    }
  };

  const stage = student ? getStageForClass(student.className) : null;
  let cardToRender = null;
  if (student && hpcData && schoolDetails && stage) {
      if (stage === 'Foundational') {
          cardToRender = <HPCFoundationalCard student={student} schoolDetails={schoolDetails} hpcData={hpcData} />;
      } else if (stage === 'Preparatory') {
          cardToRender = <HPCPreparatoryCard student={student} schoolDetails={schoolDetails} hpcData={hpcData} />;
      } else if (stage === 'Middle') {
          cardToRender = <HPCMiddleCard student={student} schoolDetails={schoolDetails} hpcData={hpcData} />;
      }
  }

  if (!student || !schoolDetails) {
    return <div>Loading data...</div>;
  }
  
  if (!hpcData) {
      return <div className="p-4 text-center">No Holistic Progress Card data found for <strong>{student.name}</strong> for the {ACADEMIC_YEAR} academic year. Please enter data on the Holistic page.</div>;
  }
  
  if (!stage) {
      return <div>Holistic Progress Card is not configured for student's class ({student.className}).</div>;
  }
  
  if (!cardToRender) {
       return <div>HPC Report for the {stage} stage is not yet implemented.</div>;
  }

  const ControlPanel = () => (
      <div className="w-full mx-auto mb-4 p-4 bg-white rounded-lg shadow-md print:hidden">
        <h1 className="text-2xl font-bold text-gray-800">HPC Preview</h1>
        <p className="text-gray-600 mb-4">Preview for {student.name}'s {stage} Stage HPC.</p>
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
      
      <div id="hpc-printable-area">
         {cardToRender}
      </div>

      <style>{`
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        @page { size: A4 portrait; margin: 0; }
        @media print {
          body, html { background-color: white; }
          body * { visibility: hidden; }
          #hpc-printable-area, #hpc-printable-area * { visibility: visible; }
          #hpc-printable-area { position: absolute; left: 0; top: 0; width: 100%; height: auto; }
          .A4-page { box-shadow: none !important; margin: 0 !important; page-break-after: always; }
          .A4-page:last-child { page-break-after: auto; }
        }
        .A4-page {
          width: 210mm;
          min-height: 297mm;
        }
      `}</style>
    </div>
  );
};

export default PrintHPC;