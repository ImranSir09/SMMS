
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../services/db';
import { Student, SbaReportData, Mark, DetailedFormativeAssessment } from '../types';
import FormativeAssessmentReport from '../components/FormativeAssessmentReport';
import { useAppData } from '../hooks/useAppData';
import { DownloadIcon, PrintIcon } from '../components/icons';
import { generateFormativeAssessmentReportPdf } from '../utils/pdfGenerator';

type AllData = {
    student: Student | null;
    sbaData: SbaReportData | null;
    allMarks: Mark[];
    allDetailedFA: DetailedFormativeAssessment[];
};

const PrintFormativeAssessmentReport: React.FC = () => {
    const { studentId: studentIdStr } = useParams<{ studentId: string }>();
    const studentId = Number(studentIdStr);
    const { schoolDetails, activeSession } = useAppData();
    const [data, setData] = useState<AllData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        const fetchData = async () => {
            if (!studentId || !activeSession) return;
            setIsLoading(true);
            try {
                const studentPromise = db.students.get(studentId);
                const sessionInfoPromise = db.studentSessionInfo.where({ studentId, session: activeSession }).first();
                const sbaPromise = db.sbaReports.where({ studentId, session: activeSession }).first();
                const marksPromise = db.marks.where({ studentId }).toArray();
                const faPromise = db.detailedFormativeAssessments.where({ studentId, session: activeSession }).toArray();
                
                const [studentData, sessionInfo, sbaData, allMarks, allDetailedFA] = await Promise.all([
                    studentPromise, sessionInfoPromise, sbaPromise, marksPromise, faPromise
                ]);
                
                if (!studentData) {
                    setData(null);
                    return;
                }

                setData({
                    student: { ...studentData, ...sessionInfo },
                    sbaData: sbaData || null,
                    allMarks, allDetailedFA
                });
            } catch (error) {
                console.error("Failed to fetch data for FA Report", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [studentId, activeSession]);

    const handleDownloadPdf = async () => {
        if (data?.student && schoolDetails) {
            await generateFormativeAssessmentReportPdf(
                data.student,
                schoolDetails,
                data.sbaData,
                data.allMarks,
                data.allDetailedFA,
                data.student.photo
            );
        }
    };

    if (isLoading) return <div>Loading Formative Assessment Report data...</div>;
    if (!data || !data.student || !schoolDetails) return <div>Student not found or data missing.</div>;
    
    return (
        <div className="bg-gray-200 min-h-screen p-4 sm:p-8 print:p-0 print:bg-white">
            <div className="max-w-4xl mx-auto mb-4 p-4 bg-white rounded-lg shadow-md print:hidden">
                 <h1 className="text-2xl font-bold text-gray-800">Formative Assessment Report</h1>
                 <p className="text-gray-600 mb-4">Preview for {data.student.name}.</p>
                 <div className="flex flex-wrap gap-4">
                    <button onClick={handleDownloadPdf} className="flex items-center gap-2 py-2 px-4 bg-green-600 text-white font-semibold rounded-md shadow-md hover:bg-green-700">
                        <DownloadIcon className="w-5 h-5"/> Download as PDF
                    </button>
                    <button onClick={() => window.print()} className="flex items-center gap-2 py-2 px-4 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700">
                        <PrintIcon className="w-5 h-5"/> Print
                    </button>
                 </div>
            </div>
            <div className="flex flex-col items-center gap-4">
                <FormativeAssessmentReport {...data} schoolDetails={schoolDetails} />
            </div>
        </div>
    );
};

export default PrintFormativeAssessmentReport;
