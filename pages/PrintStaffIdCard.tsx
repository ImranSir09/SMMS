import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../services/db';
import { Staff } from '../types';
import StaffIdCard from '../components/StaffIdCard';
import { useAppData } from '../hooks/useAppData';
// FIX: Changed import from 'generatePdf' to 'generatePdfFromComponent' and updated the function call to pass the component directly.
import { generatePdfFromComponent } from '../utils/pdfGenerator';
import { DownloadIcon, PrintIcon } from '../components/icons';

const PrintStaffIdCard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [staff, setStaff] = useState<Staff | null>(null);
  const { schoolDetails } = useAppData();

  useEffect(() => {
    if (id) {
      db.staff.get(Number(id)).then(setStaff);
    }
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (staff && schoolDetails) {
        await generatePdfFromComponent(
            <StaffIdCard staff={staff} schoolDetails={schoolDetails} />,
            `ID-Card-${staff.staffId}-${staff.name}`
        );
    }
  };

  if (!staff || !schoolDetails) {
    return <div>Loading staff data or staff member not found...</div>;
  }
  
  const ControlPanel = () => (
      <div className="max-w-4xl mx-auto mb-4 p-4 bg-white rounded-lg shadow-md print:hidden">
        <h1 className="text-2xl font-bold text-gray-800">Document Preview</h1>
        <p className="text-gray-600 mb-4">Preview for {staff.name}'s ID Card.</p>
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
        <div id="staff-id-card-printable">
            <StaffIdCard staff={staff} schoolDetails={schoolDetails} />
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #staff-id-card-printable, #staff-id-card-printable * { visibility: visible; }
          #staff-id-card-printable { position: absolute; left: 0; top: 0; width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; }
        }
      `}</style>
    </div>
  );
};

export default PrintStaffIdCard;