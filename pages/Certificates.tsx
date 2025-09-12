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

const inputStyle = "p-2 w-full bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm transition-colors";
const labelStyle = "block text-sm font-medium text-foreground/80 mb-1";
const docButtonStyle = "flex items-center justify-center gap-2 py-2 px-4 rounded-md text-white text-sm font-semibold transition-colors disabled:opacity-60";

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

  const handleSearch = async () => {
    setError('');
    setFoundStudent(null);
    setFoundStaff(null);

    if (!searchId.trim()) {
      setError(`Please enter a ${searchType === 'student' ? 'admission' : 'staff'} ID.`);
      return;
    }

    if (searchType === 'student') {
        const result = await db.students.where('admissionNo').equals(searchId).first();
        if (result) {
            setFoundStudent(result);
        } else {
            setError('No student found with that admission number.');
        }
    } else {
        const result = await db.staff.where('staffId').equals(searchId).first();
        if (result) {
            setFoundStaff(result);
        } else {
            setError('No staff member found with that ID.');
        }
    }
  };
  
  const generateDoc = async (component: React.ReactElement, fileName: string) => {
      if (!schoolDetails) return;
      setIsGeneratingPdf(true);
      await generatePdfFromComponent(component, fileName);
      setIsGeneratingPdf(false);
  };

  const handleGenerateStudentIdCard = () => {
      if (foundStudent && schoolDetails) {
          generateDoc(
              <IdCard student={foundStudent} schoolDetails={schoolDetails} />,
              `ID-Card-${foundStudent.admissionNo}-${foundStudent.name}`
          );
      }
  };
  
  const handleGenerateDobCert = () => {
      if (foundStudent && schoolDetails) {
          generateDoc(
              <DobCertificate student={foundStudent} schoolDetails={schoolDetails} />,
              `DOB-Certificate-${foundStudent.admissionNo}-${foundStudent.name}`
          );
      }
  };

  const handleGenerateAdmissionCert = () => {
      if (foundStudent && schoolDetails) {
          generateDoc(
              <AdmissionCertificate student={foundStudent} schoolDetails={schoolDetails} />,
              `Admission-Certificate-${foundStudent.admissionNo}-${foundStudent.name}`
          );
      }
  };

  const handleGenerateLeavingCertificate = () => {
    if (foundStudent && schoolDetails) {
        generateDoc(
            <SchoolLeavingCertificate student={foundStudent} schoolDetails={schoolDetails} leavingDetails={leavingCertDetails} />,
            `Leaving-Certificate-${foundStudent.admissionNo}-${foundStudent.name}`
        );
        setIsLeavingCertModalOpen(false);
        setLeavingCertDetails({ leavingDate: '', reasonForLeaving: '' });
    }
  };

  const handleGenerateStaffIdCard = () => {
      if (foundStaff && schoolDetails) {
          generateDoc(
              <StaffIdCard staff={foundStaff} schoolDetails={schoolDetails} />,
              `ID-Card-${foundStaff.staffId}-${foundStaff.name}`
          );
      }
  };

  const handleGenerateDutySlip = () => {
    if (foundStaff && schoolDetails) {
      generateDoc(
          <DutySlip staff={foundStaff} schoolDetails={schoolDetails} dutyDetails={dutySlipDetails} />,
          `Duty-Slip-${foundStaff.staffId}-${dutySlipDetails.date}`
      );
      setIsDutySlipModalOpen(false);
      setDutySlipDetails({ description: '', date: '' });
    }
  };
  
  const handleGenerateChargeCertificate = () => {
    if (foundStaff && schoolDetails) {
      generateDoc(
          <ChargeCertificate staff={foundStaff} schoolDetails={schoolDetails} chargeDetails={chargeDetails} />,
          `Charge-Certificate-${foundStaff.staffId}-${chargeDetails.date}`
      );
      setIsChargeModalOpen(false);
      setChargeDetails({ chargeName: '', date: '' });
    }
  };

  const handleGenerateDutyCertificate = () => {
    if (foundStaff && schoolDetails) {
      generateDoc(
          <DutyCertificate staff={foundStaff} schoolDetails={schoolDetails} dutyDetails={dutyCertDetails} />,
          `Duty-Certificate-${foundStaff.staffId}-${dutyCertDetails.date}`
      );
      setIsDutyCertModalOpen(false);
      setDutyCertDetails({ description: '', date: '' });
    }
  };


  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Generate Certificates & Documents</h1>
        <p className="text-foreground/70 mt-1">
          Search for a student or staff member to generate available documents.
        </p>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-4 mb-4">
            <span className="text-sm font-medium">Search for:</span>
            <div className="flex rounded-md bg-background border border-input p-1 text-sm">
                <button onClick={() => { setSearchType('student'); setSearchId(''); }} className={`px-3 py-1 rounded ${searchType === 'student' ? 'bg-primary text-primary-foreground shadow' : ''}`}>Student</button>
                <button onClick={() => { setSearchType('staff'); setSearchId(''); }} className={`px-3 py-1 rounded ${searchType === 'staff' ? 'bg-primary text-primary-foreground shadow' : ''}`}>Staff</button>
            </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 items-end">
          <div className="flex-1 w-full">
            <label htmlFor="searchId" className={labelStyle}>
                {searchType === 'student' ? 'Student Admission Number' : 'Staff ID'}
            </label>
            <input
              id="searchId"
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder={`Enter ${searchType === 'student' ? 'Admission No.' : 'Staff ID'}`}
              className={inputStyle}
            />
          </div>
          <button onClick={handleSearch} className="py-2 px-4 w-full sm:w-auto rounded-md bg-primary text-primary-foreground hover:bg-primary-hover text-sm font-semibold transition-colors">
            Search
          </button>
        </div>
        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
      </Card>

      {foundStudent && (
        <Card className="p-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-center gap-6">
             {foundStudent.photo ? (
                <img src={foundStudent.photo} alt={foundStudent.name} className="w-24 h-24 rounded-full object-cover border-4 border-border" />
             ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs">No Photo</div>
             )}
            <div>
              <h2 className="text-xl font-bold">{foundStudent.name}</h2>
              <p className="text-foreground/80">Class: {foundStudent.className} {foundStudent.section}</p>
              <p className="text-foreground/80">Roll No: {foundStudent.rollNo}</p>
              <p className="text-foreground/80">Guardian: {foundStudent.guardianInfo}</p>
            </div>
          </div>
          <div className="border-t border-border mt-6 pt-6">
            <h3 className="font-semibold mb-4">Available Documents:</h3>
            <div className="grid grid-cols-2 gap-4">
               <button onClick={handleGenerateAdmissionCert} disabled={isGeneratingPdf} className={`${docButtonStyle} bg-teal-600 hover:bg-teal-700`}>
                    <AdmissionIcon className="w-4 h-4"/>
                    <span>{isGeneratingPdf ? 'Generating...' : 'Admission Cert.'}</span>
               </button>
               <button onClick={handleGenerateStudentIdCard} disabled={isGeneratingPdf} className={`${docButtonStyle} bg-blue-600 hover:bg-blue-700`}>
                    <IdCardIcon className="w-4 h-4"/>
                    <span>{isGeneratingPdf ? 'Generating...' : 'Generate ID Card'}</span>
               </button>
                <button onClick={handleGenerateDobCert} disabled={isGeneratingPdf} className={`${docButtonStyle} bg-purple-600 hover:bg-purple-700`}>
                    <CalendarIcon className="w-4 h-4"/>
                    <span>{isGeneratingPdf ? 'Generating...' : 'DOB Certificate'}</span>
               </button>
                <button onClick={() => setIsLeavingCertModalOpen(true)} disabled={isGeneratingPdf} className={`${docButtonStyle} bg-red-600 hover:bg-red-700`}>
                    <LeavingIcon className="w-4 h-4"/>
                    <span>School Leaving Cert.</span>
               </button>
               <button onClick={() => alert(`Generating NEP 2020 Marks Card for ${foundStudent.name}. Feature coming soon!`)} disabled={isGeneratingPdf} className={`${docButtonStyle} bg-green-600 hover:bg-green-700 col-span-2`}>
                    <ExamsIcon className="w-4 h-4"/>
                    <span>NEP 2020 Marks Card</span>
               </button>
            </div>
          </div>
        </Card>
      )}

      {foundStaff && (
        <Card className="p-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-center gap-6">
             {foundStaff.photo ? (
                <img src={foundStaff.photo} alt={foundStaff.name} className="w-24 h-24 rounded-full object-cover border-4 border-border" />
             ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs">No Photo</div>
             )}
            <div>
              <h2 className="text-xl font-bold">{foundStaff.name}</h2>
              <p className="text-foreground/80">Designation: {foundStaff.designation}</p>
              <p className="text-foreground/80">Staff ID: {foundStaff.staffId}</p>
              <p className="text-foreground/80">Contact: {foundStaff.contact}</p>
            </div>
          </div>
          <div className="border-t border-border mt-6 pt-6">
            <h3 className="font-semibold mb-4">Available Documents:</h3>
            <div className="grid grid-cols-2 gap-4">
               <button onClick={handleGenerateStaffIdCard} disabled={isGeneratingPdf} className={`${docButtonStyle} bg-blue-600 hover:bg-blue-700`}>
                    <IdCardIcon className="w-4 h-4"/>
                    <span>{isGeneratingPdf ? 'Generating...' : 'Generate ID Card'}</span>
               </button>
               <button onClick={() => setIsDutySlipModalOpen(true)} disabled={isGeneratingPdf} className={`${docButtonStyle} bg-teal-600 hover:bg-teal-700`}>
                    <CalendarIcon className="w-4 h-4"/>
                    <span>Duty Slip</span>
               </button>
               <button onClick={() => setIsChargeModalOpen(true)} disabled={isGeneratingPdf} className={`${docButtonStyle} bg-orange-600 hover:bg-orange-700`}>
                    <CertificateIcon className="w-4 h-4"/>
                    <span>Charge Certificate</span>
               </button>
               <button onClick={() => setIsDutyCertModalOpen(true)} disabled={isGeneratingPdf} className={`${docButtonStyle} bg-indigo-600 hover:bg-indigo-700`}>
                    <CertificateIcon className="w-4 h-4"/>
                    <span>Duty Certificate</span>
               </button>
            </div>
          </div>
        </Card>
      )}

       {/* Modals for Document Generation */}
      <Modal isOpen={isDutySlipModalOpen} onClose={() => setIsDutySlipModalOpen(false)} title="Create Duty Slip">
        <form onSubmit={e => { e.preventDefault(); handleGenerateDutySlip(); }} className="space-y-4">
            <div>
                <label htmlFor="dutyDesc" className={labelStyle}>Duty Description</label>
                <input id="dutyDesc" type="text" value={dutySlipDetails.description} onChange={e => setDutySlipDetails({...dutySlipDetails, description: e.target.value})} className={inputStyle} required />
            </div>
             <div>
                <label htmlFor="dutyDate" className={labelStyle}>Date of Duty</label>
                <input id="dutyDate" type="date" value={dutySlipDetails.date} onChange={e => setDutySlipDetails({...dutySlipDetails, date: e.target.value})} className={inputStyle} required />
            </div>
            <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setIsDutySlipModalOpen(false)} className="py-2 px-4 rounded-md bg-gray-500/80 hover:bg-gray-500 text-white">Cancel</button>
                <button type="submit" disabled={isGeneratingPdf} className="py-2 px-4 rounded-md bg-primary hover:bg-primary-hover text-primary-foreground disabled:opacity-60">{isGeneratingPdf ? 'Generating...' : 'Generate PDF'}</button>
            </div>
        </form>
      </Modal>

      <Modal isOpen={isChargeModalOpen} onClose={() => setIsChargeModalOpen(false)} title="Create Charge Certificate">
        <form onSubmit={e => { e.preventDefault(); handleGenerateChargeCertificate(); }} className="space-y-4">
            <div>
                <label htmlFor="chargeName" className={labelStyle}>Name of Charge / Responsibility</label>
                <input id="chargeName" type="text" value={chargeDetails.chargeName} onChange={e => setChargeDetails({...chargeDetails, chargeName: e.target.value})} className={inputStyle} required />
            </div>
             <div>
                <label htmlFor="chargeDate" className={labelStyle}>Date of Handover</label>
                <input id="chargeDate" type="date" value={chargeDetails.date} onChange={e => setChargeDetails({...chargeDetails, date: e.target.value})} className={inputStyle} required />
            </div>
            <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setIsChargeModalOpen(false)} className="py-2 px-4 rounded-md bg-gray-500/80 hover:bg-gray-500 text-white">Cancel</button>
                <button type="submit" disabled={isGeneratingPdf} className="py-2 px-4 rounded-md bg-primary hover:bg-primary-hover text-primary-foreground disabled:opacity-60">{isGeneratingPdf ? 'Generating...' : 'Generate PDF'}</button>
            </div>
        </form>
      </Modal>

      <Modal isOpen={isLeavingCertModalOpen} onClose={() => setIsLeavingCertModalOpen(false)} title="Create School Leaving Certificate">
        <form onSubmit={e => { e.preventDefault(); handleGenerateLeavingCertificate(); }} className="space-y-4">
            <div>
                <label htmlFor="leavingDate" className={labelStyle}>Date of Leaving</label>
                <input id="leavingDate" type="date" value={leavingCertDetails.leavingDate} onChange={e => setLeavingCertDetails({...leavingCertDetails, leavingDate: e.target.value})} className={inputStyle} required />
            </div>
            <div>
                <label htmlFor="reasonForLeaving" className={labelStyle}>Reason for Leaving (Optional)</label>
                <input id="reasonForLeaving" type="text" value={leavingCertDetails.reasonForLeaving} onChange={e => setLeavingCertDetails({...leavingCertDetails, reasonForLeaving: e.target.value})} className={inputStyle} placeholder="e.g., Parent's Transfer" />
            </div>
            <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setIsLeavingCertModalOpen(false)} className="py-2 px-4 rounded-md bg-gray-500/80 hover:bg-gray-500 text-white">Cancel</button>
                <button type="submit" disabled={isGeneratingPdf} className="py-2 px-4 rounded-md bg-primary hover:bg-primary-hover text-primary-foreground disabled:opacity-60">{isGeneratingPdf ? 'Generating...' : 'Generate PDF'}</button>
            </div>
        </form>
      </Modal>
      
      <Modal isOpen={isDutyCertModalOpen} onClose={() => setIsDutyCertModalOpen(false)} title="Create Duty Certificate">
        <form onSubmit={e => { e.preventDefault(); handleGenerateDutyCertificate(); }} className="space-y-4">
            <div>
                <label htmlFor="dutyCertDesc" className={labelStyle}>Duty Description</label>
                <input id="dutyCertDesc" type="text" value={dutyCertDetails.description} onChange={e => setDutyCertDetails({...dutyCertDetails, description: e.target.value})} className={inputStyle} placeholder="e.g., Examination Invigilator" required />
            </div>
             <div>
                <label htmlFor="dutyCertDate" className={labelStyle}>Date of Duty</label>
                <input id="dutyCertDate" type="date" value={dutyCertDetails.date} onChange={e => setDutyCertDetails({...dutyCertDetails, date: e.target.value})} className={inputStyle} required />
            </div>
            <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setIsDutyCertModalOpen(false)} className="py-2 px-4 rounded-md bg-gray-500/80 hover:bg-gray-500 text-white">Cancel</button>
                <button type="submit" disabled={isGeneratingPdf} className="py-2 px-4 rounded-md bg-primary hover:bg-primary-hover text-primary-foreground disabled:opacity-60">{isGeneratingPdf ? 'Generating...' : 'Generate PDF'}</button>
            </div>
        </form>
      </Modal>

    </div>
  );
};

export default Certificates;