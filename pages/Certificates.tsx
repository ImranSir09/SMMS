
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { db } from '../services/db';
import { Student, Exam } from '../types';
import Card from '../components/Card';
import { ExamsIcon, CalendarIcon, CertificateIcon, BonafideIcon, SearchIcon, ClipboardListIcon } from '../components/icons';
import Modal from '../components/Modal';
import { useAppData } from '../hooks/useAppData';
import { generatePdfFromComponent } from '../utils/pdfGenerator';
import DobCertificate from '../components/DobCertificate';
import BonafideCertificate from '../components/BonafideCertificate';
import NepProgressCard from '../components/NepProgressCard';

const inputStyle = "p-3 w-full bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm transition-colors";
const labelStyle = "block text-xs font-medium text-foreground/80 mb-1";
const docButtonStyle = "flex items-center justify-center gap-1 py-3 px-2 rounded-lg text-white text-xs font-semibold transition-colors disabled:opacity-60 text-center";

const ACADEMIC_YEAR = '2024-25';

const Certificates: React.FC = () => {
  const location = useLocation();
  
  const [searchId, setSearchId] = useState(location.state?.searchId || '');
  const [foundStudent, setFoundStudent] = useState<Student | null>(null);
  const [error, setError] = useState('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const { schoolDetails } = useAppData();
  
  // NEP Modal States
  const [isNepCardModalOpen, setIsNepCardModalOpen] = useState(false);
  const [classExams, setClassExams] = useState<Exam[]>([]);
  const [selectedExamIdForNep, setSelectedExamIdForNep] = useState('');

  const handleSearch = useCallback(async () => {
    setError('');
    setFoundStudent(null);

    if (!searchId.trim()) {
      setError(`Please enter an ID.`);
      return;
    }

    const result = await db.students.where('admissionNo').equals(searchId).first();
    if (result) setFoundStudent(result);
    else setError('No student found.');
  }, [searchId]);
  
  useEffect(() => {
    if (location.state?.searchId) {
        handleSearch();
    }
  }, [location.state, handleSearch]);
  
  // Fetch exams when modal is opened for a student
  useEffect(() => {
      if (isNepCardModalOpen && foundStudent) {
          db.exams.where('className').equals(foundStudent.className).toArray()
              .then(exams => {
                  setClassExams(exams);
                  if (exams.length > 0) {
                      setSelectedExamIdForNep(String(exams[0].id!));
                  } else {
                      setSelectedExamIdForNep('');
                  }
              });
      }
  }, [isNepCardModalOpen, foundStudent]);

  const generateDoc = async (component: React.ReactElement, fileName: string) => {
      if (!schoolDetails) return;
      setIsGeneratingPdf(true);
      await generatePdfFromComponent(component, fileName);
      setIsGeneratingPdf(false);
  };
  
  const handleGenerateDobCert = () => {
      if (foundStudent) generateDoc(<DobCertificate student={foundStudent} schoolDetails={schoolDetails} />, `DOB-Cert-${foundStudent.admissionNo}`);
  };
  
  const handleGenerateBonafideCert = () => {
      if (foundStudent) generateDoc(<BonafideCertificate student={foundStudent} schoolDetails={schoolDetails} />, `Bonafide-Cert-${foundStudent.admissionNo}`);
  };

  const handleGenerateNepCard = async () => {
    if (!foundStudent || !selectedExamIdForNep || !schoolDetails) {
        alert("Required data is missing to generate the card.");
        return;
    }
    setIsGeneratingPdf(true);
    try {
        const examId = Number(selectedExamIdForNep);
        const exam = await db.exams.get(examId);
        if (!exam) throw new Error("Exam not found");

        const studentMarks = await db.marks.where({ studentId: foundStudent.id!, examId }).toArray();
        const studentHpcReport = await db.hpcReports.where({ studentId: foundStudent.id!, academicYear: ACADEMIC_YEAR }).first();
        
        if (studentMarks.length === 0) {
            alert(`No marks found for ${foundStudent.name} in the selected exam.`);
            setIsGeneratingPdf(false);
            return;
        }

        await generateDoc(
            <NepProgressCard 
                student={foundStudent}
                marks={studentMarks}
                hpcReport={studentHpcReport || null}
                schoolDetails={schoolDetails}
                examName={exam.name}
            />,
            `NEP-Card-${exam.name}-${foundStudent.admissionNo}`
        );
        
        setIsNepCardModalOpen(false);

    } catch (error) {
        console.error("NEP Card Generation failed:", error);
        alert("Failed to generate NEP Progress Card.");
    } finally {
        setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      <Card className="p-3">
        <div className="flex items-center gap-2 mb-2">
            <input id="searchId" type="text" value={searchId} onChange={(e) => setSearchId(e.target.value)} placeholder="Student Adm No." className={`${inputStyle} flex-1`} />
        </div>
        <button onClick={handleSearch} className="w-full py-3 px-5 rounded-md bg-primary text-primary-foreground hover:bg-primary-hover text-sm font-semibold flex items-center justify-center gap-2">
            <SearchIcon className="w-4 h-4" />
            Search Student
        </button>
        {error && <p className="text-red-500 text-xs mt-2 text-center">{error}</p>}
      </Card>

      {foundStudent && (
        <Card className="p-3 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
             {foundStudent.photo ? <img src={foundStudent.photo} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-border" /> : <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700"/>}
            <div>
              <h2 className="text-md font-bold">{foundStudent.name}</h2>
              <p className="text-xs text-foreground/80">Class: {foundStudent.className} | Roll: {foundStudent.rollNo}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
               <button onClick={handleGenerateDobCert} disabled={isGeneratingPdf} className={`${docButtonStyle} bg-purple-600`}>
                    <CalendarIcon className="w-3.5 h-3.5" /> DOB Cert
               </button>
               <button onClick={handleGenerateBonafideCert} disabled={isGeneratingPdf} className={`${docButtonStyle} bg-pink-600`}>
                    <BonafideIcon className="w-3.5 h-3.5" /> Bonafide
               </button>
               <button onClick={() => setIsNepCardModalOpen(true)} disabled={isGeneratingPdf} className={`${docButtonStyle} bg-green-600`}>
                    <ExamsIcon className="w-3.5 h-3.5" /> NEP Card
               </button>
          </div>
        </Card>
      )}

        <Modal
            isOpen={isNepCardModalOpen}
            onClose={() => setIsNepCardModalOpen(false)}
            title="Generate NEP Progress Card"
        >
            <div className="p-4 space-y-4">
                <p>Select an examination to generate the report card for <strong>{foundStudent?.name}</strong>.</p>
                <div>
                    <label htmlFor="examSelect" className={labelStyle}>Examination</label>
                    <select
                        id="examSelect"
                        value={selectedExamIdForNep}
                        onChange={e => setSelectedExamIdForNep(e.target.value)}
                        className={inputStyle}
                        disabled={classExams.length === 0}
                    >
                        {classExams.length > 0 ? (
                            classExams.map(exam => <option key={exam.id} value={String(exam.id)}>{exam.name}</option>)
                        ) : (
                            <option>No exams found for this class</option>
                        )}
                    </select>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                    <button type="button" onClick={() => setIsNepCardModalOpen(false)} className="py-3 px-5 rounded-md bg-gray-500/80 hover:bg-gray-500 text-white text-sm font-semibold">Cancel</button>
                    <button 
                        onClick={handleGenerateNepCard}
                        disabled={isGeneratingPdf || !selectedExamIdForNep} 
                        className="py-3 px-5 rounded-md bg-primary hover:bg-primary-hover text-primary-foreground text-sm font-semibold disabled:opacity-60"
                    >
                        {isGeneratingPdf ? 'Generating...' : 'Generate'}
                    </button>
                </div>
            </div>
        </Modal>
    </div>
  );
};

export default Certificates;