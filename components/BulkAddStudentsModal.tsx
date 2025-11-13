
import React, { useState, useCallback, useRef, useEffect } from 'react';
import Modal from './Modal';
import { db } from '../services/db';
import { useAppData } from '../hooks/useAppData';
import { useToast } from '../contexts/ToastContext';
import { Student, StudentSessionInfo } from '../types';
import { UploadIcon, DownloadIcon, InfoIcon, ArrowRightIcon, CheckCircleIcon, AlertTriangleIcon } from './icons';

const STUDENT_FIELDS: { key: keyof Student; label: string; required: boolean }[] = [
    { key: 'name', label: 'Full Name', required: true },
    { key: 'rollNo', label: 'Roll No', required: true },
    { key: 'admissionNo', label: 'Admission No', required: true },
    { key: 'dob', label: 'Date of Birth (YYYY-MM-DD)', required: true },
    { key: 'gender', label: 'Gender (Male/Female/Other)', required: true },
    { key: 'fathersName', label: "Father's Name", required: true },
    { key: 'mothersName', label: "Mother's Name", required: true },
    { key: 'contact', label: 'Contact', required: true },
    { key: 'address', label: 'Address', required: true },
    { key: 'className', label: 'Class (e.g., 1st, Balvatika)', required: true },
    { key: 'section', label: 'Section', required: true },
    { key: 'admissionDate', label: 'Admission Date (YYYY-MM-DD)', required: false },
    { key: 'category', label: 'Category', required: false },
    { key: 'bloodGroup', label: 'Blood Group', required: false },
    { key: 'aadharNo', label: 'Aadhar Number', required: false },
    { key: 'accountNo', label: 'Bank Account Number', required: false },
    { key: 'ifscCode', label: 'IFSC Code', required: false },
];

const parseCSV = (csvText: string): { headers: string[], data: Record<string, string>[] } => {
    const lines = csvText.trim().split(/\r\n|\n/);
    if (lines.length < 1) return { headers: [], data: [] };
    const headerLine = lines.shift()!;
    const headers = headerLine.split(',').map(h => h.trim().replace(/"/g, ''));
    const data = lines.filter(line => line.trim()).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        return headers.reduce((obj, header, index) => {
            obj[header] = values[index] || '';
            return obj;
        }, {} as Record<string, string>);
    });
    return { headers, data };
};

const BulkAddStudentsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const [step, setStep] = useState(1);
    const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
    const [csvData, setCsvData] = useState<Record<string, string>[]>([]);
    const [columnMap, setColumnMap] = useState<Record<string, string>>({});
    const [processedData, setProcessedData] = useState<{ valid: Student[], errors: string[] }>({ valid: [], errors: [] });
    const [importSummary, setImportSummary] = useState<{ success: number; errors: string[] } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { activeSession } = useAppData();
    const { addToast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const reset = useCallback(() => {
        setStep(1);
        setCsvHeaders([]);
        setCsvData([]);
        setColumnMap({});
        setProcessedData({ valid: [], errors: [] });
        setImportSummary(null);
        setIsLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }, []);

    useEffect(() => { if (isOpen) reset(); }, [isOpen, reset]);
    const handleClose = () => { reset(); onClose(); };
    
    const handleDownloadTemplate = () => {
        const headers = STUDENT_FIELDS.map(field => `"${field.label.replace(/"/g, '""')}"`).join(',');
        const blob = new Blob([headers], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'student_upload_template.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            const { headers, data } = parseCSV(text);
            if (headers.length === 0 || data.length === 0) {
                addToast('Could not parse CSV file or file is empty.', 'error');
                return;
            }
            setCsvHeaders(headers);
            setCsvData(data);
            autoMapColumns(headers);
            setStep(2);
        };
        reader.readAsText(file);
    };

    const autoMapColumns = (headers: string[]) => {
        const newMap: Record<string, string> = {};
        const normalizedHeaders = headers.map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
        STUDENT_FIELDS.forEach(field => {
            const normalizedLabel = field.label.toLowerCase().replace(/[^a-z0-9]/g, '');
            const headerIndex = normalizedHeaders.findIndex(h => h.includes(normalizedLabel) || normalizedLabel.includes(h));
            if (headerIndex !== -1) newMap[field.key] = headers[headerIndex];
        });
        setColumnMap(newMap);
    };

    const handleProceedToReview = async () => {
        setIsLoading(true);
        const requiredFields = STUDENT_FIELDS.filter(f => f.required);
        const missingMappings = requiredFields.filter(f => !columnMap[f.key]);
        if (missingMappings.length > 0) {
            addToast(`Please map all required fields: ${missingMappings.map(f => f.label).join(', ')}`, 'error');
            setIsLoading(false);
            return;
        }

        const existingStudents = await db.students.toArray();
        const existingAdmissionNos = new Set(existingStudents.map(s => s.admissionNo));
        const admissionNosInFile = new Set<string>();
        const validStudents: Student[] = [];
        const errors: string[] = [];

        csvData.forEach((row, index) => {
            let hasError = false;
            const student: Partial<Student> = {};
            for (const field of STUDENT_FIELDS) {
                const csvHeader = columnMap[field.key];
                const value = csvHeader ? row[csvHeader] : undefined;
                if (field.required && !value) {
                    errors.push(`Row ${index + 2}: Missing required field '${field.label}'.`);
                    hasError = true;
                }
                if (value) (student as any)[field.key] = value;
            }

            if (hasError) return;

            const admNo = student.admissionNo!;
            if (existingAdmissionNos.has(admNo) || admissionNosInFile.has(admNo)) {
                errors.push(`Row ${index + 2}: Duplicate Admission No '${admNo}'.`);
                hasError = true;
            } else {
                admissionNosInFile.add(admNo);
            }
            
            if (student.gender && !['Male', 'Female', 'Other'].includes(student.gender)) {
                errors.push(`Row ${index + 2}: Invalid gender '${student.gender}'. Must be Male, Female, or Other.`);
                hasError = true;
            }
            if (student.dob && isNaN(new Date(student.dob).getTime())) {
                errors.push(`Row ${index + 2}: Invalid date format for DOB '${student.dob}'. Use YYYY-MM-DD.`);
                hasError = true;
            }

            if (!hasError) validStudents.push(student as Student);
        });

        setProcessedData({ valid: validStudents, errors });
        setIsLoading(false);
        setStep(3);
    };

    const handleImport = async () => {
        setIsLoading(true);
        const studentsToAdd = processedData.valid.map(s => {
            const { className, section, rollNo, ...coreData } = s;
            return coreData as Omit<Student, 'id'>;
        });
    
        try {
            if (studentsToAdd.length > 0) {
                await db.transaction('rw', db.students, db.studentSessionInfo, async () => {
                    const addedIds = await db.students.bulkAdd(studentsToAdd, { allKeys: true }) as number[];
                    const sessionInfoToAdd: Omit<StudentSessionInfo, 'id'>[] = addedIds.map((id, index) => {
                        const originalStudent = processedData.valid[index];
                        return { studentId: id, session: activeSession, className: originalStudent.className || '', section: originalStudent.section || '', rollNo: originalStudent.rollNo || '' };
                    });
                    await db.studentSessionInfo.bulkAdd(sessionInfoToAdd);
                });
            }
            setImportSummary({ success: processedData.valid.length, errors: processedData.errors });
            addToast(`${processedData.valid.length} students imported successfully.`, 'success');
        } catch (e: any) {
            const errorMsg = e.failures?.length > 0 ? e.failures.map((f: any) => f.message).join(', ') : e.message;
            setImportSummary({ success: 0, errors: [...processedData.errors, `Database error: ${errorMsg}`] });
            addToast('An error occurred during import.', 'error');
        }
        setIsLoading(false);
        setStep(4);
    };

    const renderStepContent = () => {
        switch (step) {
            case 1: return (
                <div className="p-4 text-center">
                    <div className="bg-primary/10 border border-primary/20 p-3 rounded-lg flex items-start gap-3 text-sm text-left mb-4">
                        <InfoIcon className="w-5 h-5 flex-shrink-0 mt-0.5 text-primary"/>
                        <div>
                            <p className="font-semibold">Instructions</p>
                            <p className="mt-1">Upload a CSV file with student data. Ensure the column headers match the template. Required fields must be filled for all students.</p>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                        <button onClick={handleDownloadTemplate} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-5 rounded-lg bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors text-sm font-semibold">
                            <DownloadIcon className="w-5 h-5"/> Download Template
                        </button>
                        <label className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-5 rounded-lg bg-primary text-primary-foreground hover:bg-primary-hover transition-colors text-sm font-semibold cursor-pointer">
                            <UploadIcon className="w-5 h-5"/> Choose CSV File
                            <input type="file" accept=".csv,text/csv" ref={fileInputRef} onChange={handleFileChange} className="hidden"/>
                        </label>
                    </div>
                </div>
            );
            case 2: return (
                <div className="p-4">
                    <h3 className="font-semibold mb-2">Map CSV Columns to Student Fields</h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-2 text-sm">
                        {STUDENT_FIELDS.map(field => (
                            <div key={field.key} className="grid grid-cols-2 items-center gap-2 p-2 bg-background rounded-md">
                                <label htmlFor={field.key} className="font-medium">{field.label}{field.required && <span className="text-red-500">*</span>}</label>
                                <select id={field.key} value={columnMap[field.key] || ''} onChange={e => setColumnMap(prev => ({ ...prev, [field.key]: e.target.value }))} className="p-2 w-full bg-white dark:bg-slate-800 border border-input rounded-md">
                                    <option value="">-- Select Column --</option>
                                    {csvHeaders.map(header => <option key={header} value={header}>{header}</option>)}
                                </select>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-4">
                        <button onClick={() => setStep(1)} className="py-2 px-4 rounded-md bg-slate-200 dark:bg-slate-700 text-sm">Back</button>
                        <button onClick={handleProceedToReview} disabled={isLoading} className="py-2 px-4 rounded-md bg-primary text-primary-foreground text-sm flex items-center gap-2">
                            {isLoading ? 'Validating...' : 'Review Data'} <ArrowRightIcon className="w-4 h-4"/>
                        </button>
                    </div>
                </div>
            );
            case 3: return (
                <div className="p-4">
                    <h3 className="font-semibold mb-2">Review Import</h3>
                    <div className="bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-300 p-2 rounded-md text-sm mb-2 flex items-center gap-2"><CheckCircleIcon className="w-5 h-5"/>{processedData.valid.length} students are ready to be imported.</div>
                    {processedData.errors.length > 0 && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400 p-2 rounded-md text-sm mb-2 flex items-start gap-2">
                            <AlertTriangleIcon className="w-5 h-5 flex-shrink-0 mt-0.5"/>
                            <div>{processedData.errors.length} rows have errors and will be skipped. <br/> <span className="text-xs">({processedData.errors.slice(0, 2).join(', ')}{processedData.errors.length > 2 ? '... etc.' : ''})</span></div>
                        </div>
                    )}
                    <div className="text-xs max-h-64 overflow-y-auto border border-border rounded-md p-2 bg-background">
                        <p className="font-semibold mb-1">Preview of first 5 valid students:</p>
                        <ul className="list-disc list-inside">
                            {processedData.valid.slice(0, 5).map((s, i) => <li key={i}>{s.name} (Adm: {s.admissionNo})</li>)}
                        </ul>
                    </div>
                    <div className="flex justify-between mt-4">
                        <button onClick={() => setStep(2)} className="py-2 px-4 rounded-md bg-slate-200 dark:bg-slate-700 text-sm">Back</button>
                        <button onClick={handleImport} disabled={isLoading || processedData.valid.length === 0} className="py-2 px-4 rounded-md bg-success text-success-foreground text-sm">{isLoading ? 'Importing...' : 'Import Students'}</button>
                    </div>
                </div>
            );
            case 4: return (
                <div className="p-4 text-center">
                    <CheckCircleIcon className="w-16 h-16 text-success mx-auto"/>
                    <h3 className="text-lg font-bold mt-2">Import Complete</h3>
                    <p>{importSummary?.success || 0} students imported successfully.</p>
                    {importSummary && importSummary.errors.length > 0 && (
                        <div className="mt-4 text-left text-sm bg-red-500/10 p-2 rounded-md max-h-48 overflow-y-auto">
                            <p className="font-semibold text-red-700 dark:text-red-300">{importSummary.errors.length} errors occurred:</p>
                            <ul className="list-disc list-inside text-xs mt-1">
                                {importSummary.errors.slice(0, 10).map((err, i) => <li key={i}>{err}</li>)}
                                {importSummary.errors.length > 10 && <li>... and {importSummary.errors.length - 10} more.</li>}
                            </ul>
                        </div>
                    )}
                    <button onClick={handleClose} className="mt-4 py-2 px-6 rounded-md bg-primary text-primary-foreground text-sm">Finish</button>
                </div>
            );
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Bulk Add Students">
            {renderStepContent()}
        </Modal>
    );
};

export default BulkAddStudentsModal;
