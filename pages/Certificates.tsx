import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { db } from '../services/db';
import { Student, Staff, Exam, HolisticRecord } from '../types';
import Card from '../components/Card';
import { IdCardIcon, ExamsIcon, CalendarIcon, CertificateIcon, LeavingIcon, AdmissionIcon, BonafideIcon, SearchIcon, ClipboardListIcon } from '../components/icons';
import Modal from '../components/Modal';
import { useAppData } from '../hooks/useAppData';
import { generatePdfFromComponent } from '../utils/pdfGenerator';
import IdCard from '../components/IdCard';
import DobCertificate from '../components/DobCertificate';
import StaffIdCard from '../components/StaffIdCard';
import DutySlip from '../components/DutySlip';
import ChargeCertificate from '../components/ChargeCertificate';
import SchoolLeavingCertificate from '../components/SchoolLeavingCertificate';
import AdmissionCertificate from '../components/AdmissionCertificate';
import PhotoUploadModal from '../components/PhotoUploadModal';
import BonafideCertificate from '../components/BonafideCertificate';
import NepProgressCard from '../components/NepProgressCard';

const inputStyle = "p-2 w-full bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-xs transition-colors";
const labelStyle = "block text-xs font-medium text-foreground/80 mb-1";
const docButtonStyle = "flex items-center justify-center gap-1 py-2 px-1 rounded-md text-white text-[10px] font-semibold transition-colors disabled:opacity-60 text-center";

type SearchType = 'student' | 'staff';

const Certificates: React.FC = () => {
  const location = useLocation();
  
  const [searchId, setSearchId] = useState(location.state?.searchId || '');
  const [searchType, setSearchType] = useState<SearchType>(location.state?.searchType || 'student');
  const [foundStudent, setFoundStudent] = useState<Student | null>(null);
  const [foundStaff, setFoundStaff] = useState<Staff | null>(null);
  const [error, setError] = useState('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const { schoolDetails } = useAppData();
  
  // Modal States
  const [isDutySlipModalOpen, setIsDutySlipModalOpen] = useState(false);
  const [dutySlipDetails, setDutySlipDetails] = useState({ description: '', date: '' });
  const [isChargeModalOpen, setIsChargeModalOpen] = useState(false);
  const [chargeDetails, setChargeDetails] = useState({ chargeName: '', date: '' });
  const [isLeavingCertModalOpen, setIsLeavingCertModalOpen] = useState(false);
  const [leavingCertDetails, setLeavingCertDetails] = useState({ leavingDate: '', reasonForLeaving: '', conduct: 'Good', promotionGranted: 'Yes' as 'Yes' | 'No' | 'N/A' });
  const [photoUploadTarget, setPhotoUploadTarget] = useState<Student | Staff | null>(null);
  
  // NEP Modal States
  const [isNepCardModalOpen, setIsNepCardModalOpen] = useState(false);
  const [classExams, setClassExams] = useState<Exam[]>([]);
  const [selectedExamIdForNep, setSelectedExamIdForNep] = useState('');

  const handleSearch = useCallback(async () => {
    setError('');
    setFoundStudent(null);
    setFoundStaff(null);

    if (!searchId.trim()) {
      setError(`Please enter an ID.`);
      return;
    }

    if (searchType === 'student') {
        const result = await db.students.where('admissionNo').equals(searchId).first();
        if (result) setFoundStudent(result);
        else setError('No student found.');
    } else {
        const result = await db.staff.where('staffId').equals(searchId).first();
        if (result) setFoundStaff(result);
        else setError('No staff member found.');
    }
  }, [searchId, searchType]);
  
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

  const handleGenerateStudentIdCard = () => {
      if (foundStudent) {
        if (foundStudent.photo) {
          generateDoc(<IdCard student={foundStudent} schoolDetails={schoolDetails} />, `ID-Card-${foundStudent.admissionNo}`);
        } else {
          setPhotoUploadTarget(foundStudent);
        }
      }
  };
  
  const handleGenerateDobCert = () => {
      if (foundStudent) generateDoc(<DobCertificate student={foundStudent} schoolDetails={schoolDetails} />, `DOB-Cert-${foundStudent.admissionNo}`);
  };
  
  const handleGenerateBonafideCert = () => {
      if (foundStudent) generateDoc(<BonafideCertificate student={foundStudent} schoolDetails={schoolDetails} />, `Bonafide-Cert-${foundStudent.admissionNo}`);
  };

  const handleGenerateAdmissionCert = () => {
      if (foundStudent) generateDoc(<AdmissionCertificate student={foundStudent} schoolDetails={schoolDetails} />, `Admission-Cert-${foundStudent.admissionNo}`);
  };

  const handleGenerateLeavingCertificate = () => {
    if (foundStudent) {
        if (!leavingCertDetails.leavingDate || !leavingCertDetails.conduct || !leavingCertDetails.promotionGranted) {
            alert('Please fill all required fields.');
            return;
        }
        if (foundStudent.admissionDate && new Date(leavingCertDetails.leavingDate) < new Date(foundStudent.admissionDate)) {
            alert('Leaving date cannot be before the admission date.');
            return;
        }
        generateDoc(<SchoolLeavingCertificate student={foundStudent} schoolDetails={schoolDetails} leavingDetails={leavingCertDetails} />, `Leaving-Cert-${foundStudent.admissionNo}`);
        setIsLeavingCertModalOpen(false);
    }
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
        const studentHolisticRecords = await db.holisticRecords.where({ studentId: foundStudent.id! }).toArray();
        
        if (studentMarks.length === 0) {
            alert(`No marks found for ${foundStudent.name} in the selected exam.`);
            setIsGeneratingPdf(false);
            return;
        }

        await generateDoc(
            <NepProgressCard 
                student={foundStudent}
                marks={studentMarks}
                holisticRecords={studentHolisticRecords}
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

  const handleGenerateStaffIdCard = () => {
      if (foundStaff) {
          if (foundStaff.photo) {
              generateDoc(<StaffIdCard staff={foundStaff} schoolDetails={schoolDetails} />, `ID-Card-${foundStaff.staffId}`);
          } else {
              setPhotoUploadTarget(foundStaff);
          }
      }
  };

  const handleGenerateDutySlip = () => {
    if (foundStaff) {
      if (!dutySlipDetails.description.trim() || !dutySlipDetails.date) {
            alert('Please fill all required fields.');
            return;
      }
      generateDoc(<DutySlip staff={foundStaff} schoolDetails={schoolDetails} dutyDetails={dutySlipDetails} />, `Duty-Slip-${foundStaff.staffId}`);
      setIsDutySlipModalOpen(false);
    }
  };
  
  const handleGenerateChargeCertificate = () => {
    if (foundStaff) {
      if (!chargeDetails.chargeName.trim() || !chargeDetails.date) {
            alert('Please fill all required fields.');
            return;
      }
      generateDoc(<ChargeCertificate staff={foundStaff} schoolDetails={schoolDetails} chargeDetails={chargeDetails} />, `Charge-Cert-${foundStaff.staffId}`);
      setIsChargeModalOpen(false);
    }
  };
  
  const handlePhotoSaveAndGenerate = async (photoBase64: string) => {
    if (!photoUploadTarget || !photoUploadTarget.id || !schoolDetails) return;

    const isStudent = 'admissionNo' in photoUploadTarget;
    const updatedEntity = { ...photoUploadTarget, photo: photoBase64 };
    setPhotoUploadTarget(null); // Close modal

    // The uploaded photo is used for one-time generation and is not saved to the database.
    if (isStudent) {
      const studentEntity = updatedEntity as Student;
      generateDoc(<IdCard student={studentEntity} schoolDetails={schoolDetails} />, `ID-Card-${studentEntity.admissionNo}`);
    } else {
      const staffEntity = updatedEntity as Staff;
      generateDoc(<StaffIdCard staff={staffEntity} schoolDetails={schoolDetails} />, `ID-Card-${staffEntity.staffId}`);
    }
  };

  const renderModalForm = (
    title: string, 
    details: any, 
    setDetailsState: (details: any) => void, 
    setModalOpen: (isOpen: boolean) => void, 
    onSubmit: () => void, 
    fields: {id: string, label: string, type: string, placeholder?: string, required?: boolean}[]
  ) => (
    <Modal isOpen={true} onClose={() => setModalOpen(false)} title={title}>
        <form onSubmit={e => { e.preventDefault(); onSubmit(); }} className="p-4 space-y-4">
            {fields.map(field => (
                <div key={field.id}>
                    <label htmlFor={field.id} className={labelStyle}>{field.label}</label>
                    <input 
                        id={field.id} 
                        type={field.type} 
                        value={details[field.id] || ''} 
                        onChange={e => setDetailsState({...details, [field.id]: e.target.value})} 
                        className={inputStyle} 
                        required={field.required !== false} 
                        placeholder={field.placeholder}
                    />
                </div>
            ))}
            <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setModalOpen(false)} className="py-2 px-4 rounded-md bg-gray-500/80 hover:bg-gray-500 text-white text-sm">Cancel</button>
                <button type="submit" disabled={isGeneratingPdf} className="py-2 px-4 rounded-md bg-primary hover:bg-primary-hover text-primary-foreground text-sm disabled:opacity-60">{isGeneratingPdf ? 'Generating...' : 'Generate'}</button>
            </div>
        </form>
    </Modal>
  );

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      <Card className="p-3">
        <div className="flex items-center gap-2 mb-2">
            <div className="flex rounded-md bg-background border border-input p-1 text-xs">
                <button onClick={() => { setSearchType('student'); }} className={`px-2 py-1 rounded ${searchType === 'student' ? 'bg-primary text-primary-foreground shadow' : ''}`}>Student</button>
                <button onClick={() => { setSearchType('staff'); }} className={`px-2 py-1 rounded ${searchType === 'staff' ? 'bg-primary text-primary-foreground shadow' : ''}`}>Staff</button>
            </div>
            <input id="searchId" type="text" value={searchId} onChange={(e) => setSearchId(e.target.value)} placeholder={`${searchType === 'student' ? 'Adm No.' : 'Staff ID'}`} className={`${inputStyle} flex-1`} />
        </div>
        <button onClick={handleSearch} className="w-full py-2 px-4 rounded-md bg-primary text-primary-foreground hover:bg-primary-hover text-sm font-semibold flex items-center justify-center gap-2">
            <SearchIcon className="w-4 h-4" />
            Search
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
               <button onClick={handleGenerateAdmissionCert} disabled={isGeneratingPdf} className={`${docButtonStyle} bg-teal-600`}>
                    <AdmissionIcon className="w-3.5 h-3.5" /> Adm. Cert
               </button>
               <button onClick={handleGenerateStudentIdCard} disabled={isGeneratingPdf} className={`${docButtonStyle} bg-blue-600`}>
                    <IdCardIcon className="w-3.5 h-3.5" /> ID Card
               </button>
               <button onClick={handleGenerateDobCert} disabled={isGeneratingPdf} className={`${docButtonStyle} bg-purple-600`}>
                    <CalendarIcon className="w-3.5 h-3.5" /> DOB Cert
               </button>
               <button onClick={handleGenerateBonafideCert} disabled={isGeneratingPdf} className={`${docButtonStyle} bg-pink-600`}>
                    <BonafideIcon className="w-3.5 h-3.5" /> Bonafide
               </button>
               <button onClick={() => setIsLeavingCertModalOpen(true)} disabled={isGeneratingPdf} className={`${docButtonStyle} bg-red-600`}>
                    <LeavingIcon className="w-3.5 h-3.5" /> Leaving Cert
               </button>
               <button onClick={() => setIsNepCardModalOpen(true)} disabled={isGeneratingPdf} className={`${docButtonStyle} bg-green-600`}>
                    <ExamsIcon className="w-3.5 h-3.5" /> NEP Card
               </button>
          </div>
        </Card>
      )}

      {foundStaff && (
        <Card className="p-3 animate-fade-in">
           <div className="flex items-center gap-3 mb-2">
             {foundStaff.photo ? <img src={foundStaff.photo} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-border" /> : <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700"/>}
            <div>
              <h2 className="text-md font-bold">{foundStaff.name}</h2>
              <p className="text-xs text-foreground/80">{foundStaff.designation}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
               <button onClick={handleGenerateStaffIdCard} disabled={isGeneratingPdf} className={`${docButtonStyle} bg-blue-600`}>
                    <IdCardIcon className="w-3.5 h-3.5" /> ID Card
                </button>
               <button onClick={() => setIsDutySlipModalOpen(true)} disabled={isGeneratingPdf} className={`${docButtonStyle} bg-teal-600`}>
                    <ClipboardListIcon className="w-3.5 h-3.5" /> Duty Slip
                </button>
               <button onClick={() => setIsChargeModalOpen(true)} disabled={isGeneratingPdf} className={`${docButtonStyle} bg-orange-600`}>
                    <CertificateIcon className="w-3.5 h-3.5" /> Charge Cert
                </button>
            </div>
        </Card>
      )}

       {isDutySlipModalOpen && renderModalForm("Create Duty Slip", dutySlipDetails, setDutySlipDetails, setIsDutySlipModalOpen, handleGenerateDutySlip, [{id: 'description', label: 'Duty Description', type: 'text', required: true}, {id: 'date', label: 'Date of Duty', type: 'date', required: true}])}
       {isChargeModalOpen && renderModalForm("Create Charge Certificate", chargeDetails, setChargeDetails, setIsChargeModalOpen, handleGenerateChargeCertificate, [{id: 'chargeName', label: 'Name of Charge', type: 'text', required: true}, {id: 'date', label: 'Date of Handover', type: 'date', required: true}])}
       
       {isLeavingCertModalOpen && (
            <Modal isOpen={true} onClose={() => setIsLeavingCertModalOpen(false)} title="Create Leaving Certificate">
                <form onSubmit={e => { e.preventDefault(); handleGenerateLeavingCertificate(); }} className="p-4 space-y-4">
                    <div>
                        <label htmlFor="leavingDate" className={labelStyle}>Date of Leaving</label>
                        <input id="leavingDate" type="date" value={leavingCertDetails.leavingDate} onChange={e => setLeavingCertDetails({...leavingCertDetails, leavingDate: e.target.value})} className={inputStyle} required />
                    </div>
                    <div>
                        <label htmlFor="conduct" className={labelStyle}>General Conduct</label>
                        <select id="conduct" value={leavingCertDetails.conduct} onChange={e => setLeavingCertDetails({...leavingCertDetails, conduct: e.target.value})} className={inputStyle} required>
                            <option>Good</option>
                            <option>Satisfactory</option>
                            <option>Excellent</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="promotionGranted" className={labelStyle}>Qualified for Promotion</label>
                        <select id="promotionGranted" value={leavingCertDetails.promotionGranted} onChange={e => setLeavingCertDetails({...leavingCertDetails, promotionGranted: e.target.value as any})} className={inputStyle} required>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                            <option value="N/A">N/A (e.g., mid-session)</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="reasonForLeaving" className={labelStyle}>Reason for Leaving (Optional)</label>
                        <input id="reasonForLeaving" type="text" placeholder="Parent's Transfer" value={leavingCertDetails.reasonForLeaving} onChange={e => setLeavingCertDetails({...leavingCertDetails, reasonForLeaving: e.target.value})} className={inputStyle} />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={() => setIsLeavingCertModalOpen(false)} className="py-2 px-4 rounded-md bg-gray-500/80 hover:bg-gray-500 text-white text-sm">Cancel</button>
                        <button type="submit" disabled={isGeneratingPdf} className="py-2 px-4 rounded-md bg-primary hover:bg-primary-hover text-primary-foreground text-sm disabled:opacity-60">{isGeneratingPdf ? 'Generating...' : 'Generate'}</button>
                    </div>
                </form>
            </Modal>
        )}
       
       <PhotoUploadModal
            isOpen={!!photoUploadTarget}
            onClose={() => setPhotoUploadTarget(null)}
            title={`Upload Photo for ${photoUploadTarget?.name}`}
            onSave={handlePhotoSaveAndGenerate}
            aspectRatio={4 / 5}
        />

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
                    <button type="button" onClick={() => setIsNepCardModalOpen(false)} className="py-2 px-4 rounded-md bg-gray-500/80 hover:bg-gray-500 text-white text-sm">Cancel</button>
                    <button 
                        onClick={handleGenerateNepCard}
                        disabled={isGeneratingPdf || !selectedExamIdForNep} 
                        className="py-2 px-4 rounded-md bg-primary hover:bg-primary-hover text-primary-foreground text-sm disabled:opacity-60"
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
