import React, { useState } from 'react';
import { db } from '../services/db';
import { Student, Staff } from '../types';
import Card from '../components/Card';
import { IdCardIcon, ExamsIcon, CalendarIcon, CertificateIcon, LeavingIcon, AdmissionIcon } from '../components/icons';
import Modal from '../components/Modal';
import { useAppData } from '../hooks/useAppData';
import { generatePdfFromComponent } from '../utils/pdfGenerator';
import IdCard from '../components/IdCard';
import DobCertificate from '../components/DobCertificate';
import StaffIdCard from '../components/StaffIdCard';
import DutySlip from '../components/DutySlip';
import ChargeCertificate from '../components/ChargeCertificate';
import SchoolLeavingCertificate from '../components/SchoolLeavingCertificate';
import DutyCertificate from '../components/DutyCertificate';
import AdmissionCertificate from '../components/AdmissionCertificate';
import PhotoUploadModal from '../components/PhotoUploadModal';

const inputStyle = "p-2 w-full bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-xs transition-colors";
const labelStyle = "block text-xs font-medium text-foreground/80 mb-1";
const docButtonStyle = "flex items-center justify-center gap-1 py-2 px-1 rounded-md text-white text-[10px] font-semibold transition-colors disabled:opacity-60 text-center";

type SearchType = 'student' | 'staff';

const Certificates: React.FC = () => {
  const [searchId, setSearchId] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('student');
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
  const [leavingCertDetails, setLeavingCertDetails] = useState({ leavingDate: '', reasonForLeaving: '' });
  const [isDutyCertModalOpen, setIsDutyCertModalOpen] = useState(false);
  const [dutyCertDetails, setDutyCertDetails] = useState({ description: '', date: '' });
  const [photoUploadTarget, setPhotoUploadTarget] = useState<Student | Staff | null>(null);

  const handleSearch = async () => {
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
  };
  
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

  const handleGenerateAdmissionCert = () => {
      if (foundStudent) generateDoc(<AdmissionCertificate student={foundStudent} schoolDetails={schoolDetails} />, `Admission-Cert-${foundStudent.admissionNo}`);
  };

  const handleGenerateLeavingCertificate = () => {
    if (foundStudent) {
        generateDoc(<SchoolLeavingCertificate student={foundStudent} schoolDetails={schoolDetails} leavingDetails={leavingCertDetails} />, `Leaving-Cert-${foundStudent.admissionNo}`);
        setIsLeavingCertModalOpen(false);
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
      generateDoc(<DutySlip staff={foundStaff} schoolDetails={schoolDetails} dutyDetails={dutySlipDetails} />, `Duty-Slip-${foundStaff.staffId}`);
      setIsDutySlipModalOpen(false);
    }
  };
  
  const handleGenerateChargeCertificate = () => {
    if (foundStaff) {
      generateDoc(<ChargeCertificate staff={foundStaff} schoolDetails={schoolDetails} chargeDetails={chargeDetails} />, `Charge-Cert-${foundStaff.staffId}`);
      setIsChargeModalOpen(false);
    }
  };

  const handleGenerateDutyCertificate = () => {
    if (foundStaff) {
      generateDoc(<DutyCertificate staff={foundStaff} schoolDetails={schoolDetails} dutyDetails={dutyCertDetails} />, `Duty-Cert-${foundStaff.staffId}`);
      setIsDutyCertModalOpen(false);
    }
  };
  
  const handlePhotoSaveAndGenerate = async (photoBase64: string) => {
    if (!photoUploadTarget || !photoUploadTarget.id || !schoolDetails) return;

    const isStudent = 'admissionNo' in photoUploadTarget;
    const updatedEntity = { ...photoUploadTarget, photo: photoBase64 };
    setPhotoUploadTarget(null); // Close modal

    if (isStudent) {
      const studentEntity = updatedEntity as Student;
      generateDoc(<IdCard student={studentEntity} schoolDetails={schoolDetails} />, `ID-Card-${studentEntity.admissionNo}`);
      await db.students.update(studentEntity.id, { photo: photoBase64 });
      if (foundStudent?.id === studentEntity.id) {
        setFoundStudent(studentEntity);
      }
    } else {
      const staffEntity = updatedEntity as Staff;
      generateDoc(<StaffIdCard staff={staffEntity} schoolDetails={schoolDetails} />, `ID-Card-${staffEntity.staffId}`);
      await db.staff.update(staffEntity.id, { photo: photoBase64 });
      if (foundStaff?.id === staffEntity.id) {
          setFoundStaff(staffEntity);
      }
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
    <div className="h-full flex flex-col gap-4 animate-fade-in">
      <Card className="p-3">
        <div className="flex items-center gap-2 mb-2">
            <div className="flex rounded-md bg-background border border-input p-1 text-xs">
                <button onClick={() => { setSearchType('student'); }} className={`px-2 py-1 rounded ${searchType === 'student' ? 'bg-primary text-primary-foreground shadow' : ''}`}>Student</button>
                <button onClick={() => { setSearchType('staff'); }} className={`px-2 py-1 rounded ${searchType === 'staff' ? 'bg-primary text-primary-foreground shadow' : ''}`}>Staff</button>
            </div>
            <input id="searchId" type="text" value={searchId} onChange={(e) => setSearchId(e.target.value)} placeholder={`${searchType === 'student' ? 'Adm No.' : 'Staff ID'}`} className={`${inputStyle} flex-1`} />
        </div>
        <button onClick={handleSearch} className="w-full py-2 px-4 rounded-md bg-primary text-primary-foreground hover:bg-primary-hover text-sm font-semibold">Search</button>
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
               <button onClick={handleGenerateAdmissionCert} disabled={isGeneratingPdf} className={`${docButtonStyle} bg-teal-600`}>Adm. Cert</button>
               <button onClick={handleGenerateStudentIdCard} disabled={isGeneratingPdf} className={`${docButtonStyle} bg-blue-600`}>ID Card</button>
               <button onClick={handleGenerateDobCert} disabled={isGeneratingPdf} className={`${docButtonStyle} bg-purple-600`}>DOB Cert</button>
               <button onClick={() => setIsLeavingCertModalOpen(true)} disabled={isGeneratingPdf} className={`${docButtonStyle} bg-red-600`}>Leaving Cert</button>
               <button disabled className={`${docButtonStyle} bg-green-600 col-span-2`}>NEP Marks Card</button>
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
          <div className="grid grid-cols-2 gap-2">
               <button onClick={handleGenerateStaffIdCard} disabled={isGeneratingPdf} className={`${docButtonStyle} bg-blue-600`}>ID Card</button>
               <button onClick={() => setIsDutySlipModalOpen(true)} disabled={isGeneratingPdf} className={`${docButtonStyle} bg-teal-600`}>Duty Slip</button>
               <button onClick={() => setIsChargeModalOpen(true)} disabled={isGeneratingPdf} className={`${docButtonStyle} bg-orange-600`}>Charge Cert</button>
               <button onClick={() => setIsDutyCertModalOpen(true)} disabled={isGeneratingPdf} className={`${docButtonStyle} bg-indigo-600`}>Duty Cert</button>
            </div>
        </Card>
      )}

       {isDutySlipModalOpen && renderModalForm("Create Duty Slip", dutySlipDetails, setDutySlipDetails, setIsDutySlipModalOpen, handleGenerateDutySlip, [{id: 'description', label: 'Duty Description', type: 'text', required: true}, {id: 'date', label: 'Date of Duty', type: 'date', required: true}])}
       {isChargeModalOpen && renderModalForm("Create Charge Certificate", chargeDetails, setChargeDetails, setIsChargeModalOpen, handleGenerateChargeCertificate, [{id: 'chargeName', label: 'Name of Charge', type: 'text', required: true}, {id: 'date', label: 'Date of Handover', type: 'date', required: true}])}
       {isLeavingCertModalOpen && renderModalForm("Create Leaving Certificate", leavingCertDetails, setLeavingCertDetails, setIsLeavingCertModalOpen, handleGenerateLeavingCertificate, [{id: 'leavingDate', label: 'Date of Leaving', type: 'date', required: true}, {id: 'reasonForLeaving', label: 'Reason for Leaving (Optional)', type: 'text', placeholder: "Parent's Transfer", required: false}])}
       {isDutyCertModalOpen && renderModalForm("Create Duty Certificate", dutyCertDetails, setDutyCertDetails, setIsDutyCertModalOpen, handleGenerateDutyCertificate, [{id: 'description', label: 'Duty Description', type: 'text', required: true}, {id: 'date', label: 'Date of Duty', type: 'date', required: true}])}
       
       <PhotoUploadModal
            isOpen={!!photoUploadTarget}
            onClose={() => setPhotoUploadTarget(null)}
            title={`Upload Photo for ${photoUploadTarget?.name}`}
            onSave={handlePhotoSaveAndGenerate}
        />
    </div>
  );
};

export default Certificates;