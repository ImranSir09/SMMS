
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { db } from '../services/db';
import { Student } from '../types';
import BonafideCertificate from '../components/BonafideCertificate';
import { useAppData } from '../hooks/useAppData';
import { PrintIcon } from '../components/icons';

const PrintBonafideCertificate: React.FC = () => {
    const { state } = useLocation();
    const studentId = state?.studentId;
    const [student, setStudent] = useState<Student | null>(null);
    const { schoolDetails, activeSession } = useAppData();

    useEffect(() => {
        const fetchStudent = async () => {
            if (studentId && activeSession) {
                const studentData = await db.students.get(studentId);
                if (studentData) {
                    const sessionInfo = await db.studentSessionInfo.where({ studentId, session: activeSession }).first();
                    setStudent({ ...studentData, ...sessionInfo });
                }
            }
        };
        fetchStudent();
    }, [studentId, activeSession]);

    const handlePrint = () => window.print();

    if (!student || !schoolDetails) return <div>Loading...</div>;

    return (
        <div className="bg-gray-200 min-h-screen p-4 sm:p-8 print:p-0 print:bg-white">
            <div className="max-w-4xl mx-auto mb-4 p-4 bg-white rounded-lg shadow-md print:hidden">
                <h1 className="text-2xl font-bold text-gray-800">Certificate Preview</h1>
                <p className="text-gray-600 mb-4">Preview for {student.name}'s Bonafide Certificate.</p>
                <div className="flex flex-wrap gap-4">
                    <button onClick={handlePrint} className="flex items-center gap-2 py-2 px-4 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700">
                        <PrintIcon className="w-5 h-5"/> Print
                    </button>
                </div>
            </div>
            <div className="flex justify-center items-start">
                <BonafideCertificate student={student} schoolDetails={schoolDetails} photo={student.photo} />
            </div>
             <style>{`
                body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                @page { size: A4; margin: 0; }
                @media print {
                    body * { visibility: hidden; }
                    #bonafide-certificate, #bonafide-certificate * { visibility: visible; }
                    #bonafide-certificate { position: absolute; left: 0; top: 0; width: 100%; height: auto; }
                    .A4-page-container { transform: scale(1.0) !important; margin: 0 !important; }
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

export default PrintBonafideCertificate;
