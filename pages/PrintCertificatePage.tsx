
import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { db } from '../services/db';
import { Student } from '../types';
import { useAppData } from '../hooks/useAppData';
import { DownloadIcon, PrintIcon } from '../components/icons';
import { generatePdfFromElement } from '../utils/pdfGenerator';
import DobCertificate from '../components/DobCertificate';
import BonafideCertificate from '../components/BonafideCertificate';

const PrintCertificatePage: React.FC = () => {
    const { type } = useParams<{ type: string }>();
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

    const handleDownloadPdf = async () => {
        if (student && type) {
            const orientation = (type === 'dob' || type === 'bonafide') ? 'l' : 'p';
            await generatePdfFromElement(`${type}-certificate`, `${type.toUpperCase()}-Certificate-${student.name}`, orientation);
        }
    };
    
    if (!student || !schoolDetails || !type) {
        return <div className="p-4 text-center">Loading certificate data...</div>;
    }

    const CertificateComponent = {
        dob: DobCertificate,
        bonafide: BonafideCertificate,
    }[type];

    if (!CertificateComponent) {
        return <div className="p-4 text-center">Invalid certificate type requested.</div>;
    }
    
    const certificateId = `${type}-certificate`;
    const isLandscape = type === 'dob' || type === 'bonafide';
    const containerClass = isLandscape ? 'A4-landscape-container' : 'A4-page-container';

    return (
        <div className="bg-gray-200 min-h-screen p-4 sm:p-8 print:p-0 print:bg-white">
            <div className="max-w-4xl mx-auto mb-4 p-4 bg-white rounded-lg shadow-md print:hidden">
                <h1 className="text-2xl font-bold text-gray-800">Certificate Preview</h1>
                <p className="text-gray-600 mb-4">Preview for {student.name}'s {type.toUpperCase()} Certificate.</p>
                <div className="flex flex-wrap gap-4">
                    <button onClick={handleDownloadPdf} className="flex items-center gap-2 py-2 px-4 bg-green-600 text-white font-semibold rounded-md shadow-md hover:bg-green-700">
                        <DownloadIcon className="w-5 h-5"/> Download PDF
                    </button>
                    <button onClick={handlePrint} className="flex items-center gap-2 py-2 px-4 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700">
                        <PrintIcon className="w-5 h-5"/> Print
                    </button>
                </div>
            </div>

            <div className="flex justify-center items-start">
                <CertificateComponent student={student} schoolDetails={schoolDetails} photo={student.photo} />
            </div>

            <style>{`
                body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                @page { 
                    size: ${isLandscape ? 'A4 landscape' : 'A4 portrait'}; 
                    margin: 0; 
                }
                @media print {
                    body * { visibility: hidden; }
                    #${certificateId}, #${certificateId} * { visibility: visible; }
                    #${certificateId} { position: absolute; left: 0; top: 0; width: 100%; height: auto; }
                    .${containerClass} { transform: scale(1.0) !important; margin: 0 !important; }
                }
                .A4-page-container, .A4-landscape-container {
                    transform-origin: top center;
                    margin: 1rem 0;
                }
                .A4-page-container { transform: scale(0.85); }
                .A4-landscape-container { transform: scale(0.85); }
                
                 @media (max-width: 1200px) { .A4-landscape-container { transform: scale(0.7); } }
                 @media (max-width: 900px) { .A4-landscape-container { transform: scale(0.5); } .A4-page-container { transform: scale(0.7); } }
                 @media (max-width: 640px) { .A4-landscape-container { transform: scale(0.35); } .A4-page-container { transform: scale(0.55); } }
                 @media (max-width: 500px) { .A4-landscape-container { transform: scale(0.28); } .A4-page-container { transform: scale(0.45); } }
                 @media (max-width: 400px) { .A4-landscape-container { transform: scale(0.22); } .A4-page-container { transform: scale(0.4); } }
            `}</style>
        </div>
    );
};

export default PrintCertificatePage;
