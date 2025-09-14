
import React, { useState, useCallback } from 'react';
import Modal from './Modal';
import { db } from '../services/db';
import { Student } from '../types';
import { DownloadIcon, UploadIcon } from './icons';
import { useToast } from '../contexts/ToastContext';

// Define the fields we want to map from the CSV
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

type Step = 'upload' | 'map' | 'preview' | 'result';
type Mapping = { [K in keyof Student]?: string };

const BulkAddStudentsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const [step, setStep] = useState<Step>('upload');
    const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
    const [csvData, setCsvData] = useState<string[][]>([]);
    const [mapping, setMapping] = useState<Mapping>({});
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [importResult, setImportResult] = useState<{ success: number; failed: number } | null>(null);
    const { addToast } = useToast();

    const resetState = useCallback(() => {
        setStep('upload');
        setCsvHeaders([]);
        setCsvData([]);
        setMapping({});
        setError('');
        setIsLoading(false);
        setImportResult(null);
    }, []);

    const handleClose = () => {
        resetState();
        onClose();
    };

    const parseCSV = (text: string) => {
        // Basic parser, may not handle all edge cases like commas in quoted fields.
        const lines = text.trim().replace(/\r\n/g, '\n').split('\n');
        if (lines.length < 2) {
            throw new Error("CSV must have a header row and at least one data row.");
        }
        const headers = lines[0].split(',').map(h => h.trim());
        const data = lines.slice(1).map(line => line.split(',').map(cell => cell.trim()));
        return { headers, data };
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setError('');
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            const { headers, data } = parseCSV(text);
            setCsvHeaders(headers);
            setCsvData(data);
            setStep('map');
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to parse CSV file.';
            setError(errorMessage);
            addToast(errorMessage, 'error');
        }
    };
    
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
        URL.revokeObjectURL(url);
    };

    const handleMappingChange = (fieldKey: keyof Student, csvHeader: string) => {
        setMapping(prev => ({ ...prev, [fieldKey]: csvHeader }));
    };

    const validateMapping = () => {
        for (const field of STUDENT_FIELDS) {
            if (field.required && !mapping[field.key]) {
                setError(`'${field.label}' is a required field but has not been mapped.`);
                return false;
            }
        }
        setError('');
        return true;
    };

    const getMappedStudents = (): Student[] => {
        const headerIndexMap: { [key: string]: number } = {};
        csvHeaders.forEach((h, i) => { headerIndexMap[h] = i; });

        return csvData.map(row => {
            const student: Partial<Student> = { photo: null };
            for (const field of STUDENT_FIELDS) {
                const csvHeader = mapping[field.key];
                if (csvHeader) {
                    const value = row[headerIndexMap[csvHeader]] || '';
                    if (field.key === 'gender') {
                        const genderValue = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
                        student.gender = ['Male', 'Female', 'Other'].includes(genderValue) ? (genderValue as 'Male' | 'Female' | 'Other') : 'Other';
                    } else {
                        // @ts-ignore
                        student[field.key] = value;
                    }
                }
            }
            return student as Student;
        });
    };

    const handleImport = async () => {
        setIsLoading(true);
        setError('');
        const studentsToImport = getMappedStudents();
        try {
            await db.students.bulkAdd(studentsToImport);
            setImportResult({ success: studentsToImport.length, failed: 0 });
            setStep('result');
            addToast(`${studentsToImport.length} students imported successfully!`, 'success');
        } catch (err) {
            console.error("Bulk add failed:", err);
            setError("An error occurred during import. Check console for details. Some records may not have been saved.");
            setImportResult({ success: 0, failed: studentsToImport.length });
            setStep('result');
            addToast('An error occurred during import.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const renderContent = () => {
        switch (step) {
            case 'upload':
                return (
                    <div className="text-center">
                        <h3 className="text-lg font-medium">Upload a CSV file</h3>
                        <p className="text-sm text-foreground/70 mt-1 mb-4">
                            Ensure the first row matches the template.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                             <label className="cursor-pointer w-full sm:w-auto inline-flex items-center justify-center gap-2 py-2 px-4 rounded-md bg-primary text-primary-foreground hover:bg-primary-hover transition-colors">
                                <UploadIcon className="w-5 h-5"/>
                                <span>Choose File</span>
                                <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
                            </label>
                             <button onClick={handleDownloadTemplate} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-2 px-4 rounded-md bg-gray-600 hover:bg-gray-700 text-white transition-colors">
                                <DownloadIcon className="w-5 h-5"/>
                                <span>Download Template</span>
                            </button>
                        </div>
                        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
                    </div>
                );
            case 'map':
                return (
                    <div>
                        <h3 className="text-lg font-medium">Map CSV Columns to Student Fields</h3>
                        <p className="text-sm text-foreground/70 mt-1 mb-4">
                            Match the columns from your CSV file to the required student information fields.
                        </p>
                        <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                           {STUDENT_FIELDS.map(field => (
                               <div key={field.key}>
                                   <label className="font-medium text-sm block mb-1">
                                       {field.label} {field.required && <span className="text-red-500">*</span>}
                                   </label>
                                   <select
                                        value={mapping[field.key] || ''}
                                        onChange={(e) => handleMappingChange(field.key, e.target.value)}
                                        className="w-full p-2 bg-background border border-input rounded-md text-sm"
                                    >
                                       <option value="">-- Select Column --</option>
                                       {csvHeaders.map(header => <option key={header} value={header}>{header}</option>)}
                                   </select>
                               </div>
                           ))}
                        </div>
                        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
                        <div className="flex justify-end gap-2 mt-6">
                            <button onClick={resetState} className="py-2 px-4 rounded-md bg-gray-500/80 hover:bg-gray-500 text-white transition-colors">Start Over</button>
                            <button onClick={() => { if(validateMapping()) setStep('preview'); }} className="py-2 px-4 rounded-md bg-primary text-primary-foreground hover:bg-primary-hover transition-colors">Next: Preview</button>
                        </div>
                    </div>
                );
            case 'preview':
                const previewStudents = getMappedStudents().slice(0, 5); // Show first 5 records
                 return (
                    <div>
                        <h3 className="text-lg font-medium">Preview Data</h3>
                        <p className="text-sm text-foreground/70 mt-1 mb-4">
                            Review the first few records to ensure the mapping is correct. A total of <strong>{csvData.length}</strong> students will be imported.
                        </p>
                        <div className="overflow-x-auto max-h-64 border border-border rounded-md">
                           <table className="w-full text-left text-sm">
                               <thead className="bg-background border-b border-border sticky top-0">
                                   <tr>
                                       {STUDENT_FIELDS.map(f => f.required || mapping[f.key] ? <th key={f.key} className="p-2 font-semibold">{f.label.split(' ')[0]}</th> : null)}
                                   </tr>
                               </thead>
                               <tbody>
                                    {previewStudents.map((student, index) => (
                                        <tr key={index} className="border-b border-border last:border-b-0">
                                           {STUDENT_FIELDS.map(f => f.required || mapping[f.key] ? <td key={f.key} className="p-2 truncate max-w-xs">{String(student[f.key] || '')}</td> : null)}
                                        </tr>
                                    ))}
                               </tbody>
                           </table>
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <button onClick={() => setStep('map')} className="py-2 px-4 rounded-md bg-gray-500/80 hover:bg-gray-500 text-white transition-colors">Back to Mapping</button>
                            <button onClick={handleImport} disabled={isLoading} className="py-2 px-4 rounded-md bg-green-600 hover:bg-green-700 text-white disabled:bg-green-800 transition-colors">
                                {isLoading ? 'Importing...' : `Import ${csvData.length} Students`}
                            </button>
                        </div>
                    </div>
                );
            case 'result':
                return (
                    <div className="text-center">
                        <h3 className="text-lg font-medium mb-2">Import Complete</h3>
                        {importResult && (
                             <div className="space-y-1">
                                <p className="text-green-600 dark:text-green-400">Successfully imported: {importResult.success} students</p>
                                {importResult.failed > 0 && <p className="text-red-500">Failed to import: {importResult.failed} students</p>}
                            </div>
                        )}
                        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
                        <div className="flex justify-center mt-6">
                            <button onClick={handleClose} className="py-2 px-4 rounded-md bg-primary text-primary-foreground hover:bg-primary-hover transition-colors">Close</button>
                        </div>
                    </div>
                )
        }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Bulk Add Students">
            <div className="p-4">
                {renderContent()}
            </div>
        </Modal>
    );
};

export default BulkAddStudentsModal;
