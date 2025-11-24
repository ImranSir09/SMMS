
import React, { useState, useCallback } from 'react';
import Modal from './Modal';
import { db } from '../services/db';
import { Student, StudentSessionInfo } from '../types';
import { DownloadIcon, UploadIcon, AlertTriangleIcon } from './icons';
import { useToast } from '../contexts/ToastContext';
import { useAppData } from '../hooks/useAppData';

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
    const [importResult, setImportResult] = useState<{ success: number; failed: number, errors: string[] } | null>(null);
    const [replaceExisting, setReplaceExisting] = useState(false);
    
    const { addToast } = useToast();
    const { activeSession } = useAppData();

    const resetState = useCallback(() => {
        setStep('upload');
        setCsvHeaders([]);
        setCsvData([]);
        setMapping({});
        setError('');
        setIsLoading(false);
        setImportResult(null);
        setReplaceExisting(false);
    }, []);

    const handleClose = () => {
        resetState();
        onClose();
    };

    const parseCSV = (text: string) => {
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
        setIsLoading(true);
        const file = e.target.files?.[0];
        if (!file) {
            setIsLoading(false);
            return;
        }

        try {
            let headers: string[] = [];
            let data: string[][] = [];

            if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                // Dynamic import of XLSX to save bundle size
                // @ts-ignore
                const { read, utils } = await import('xlsx');
                const arrayBuffer = await file.arrayBuffer();
                const wb = read(arrayBuffer);
                const ws = wb.Sheets[wb.SheetNames[0]];
                // Get data as array of arrays, raw: false ensures we get strings/formatted text
                const rawData = utils.sheet_to_json(ws, { header: 1, raw: false, defval: '' }) as string[][];
                
                if (rawData.length < 2) {
                    throw new Error("Excel file must have a header row and at least one data row.");
                }
                
                headers = rawData[0].map(h => String(h).trim());
                // Filter out empty rows
                data = rawData.slice(1).filter(row => row.some(cell => cell.trim() !== '')).map(row => row.map(cell => String(cell).trim()));

            } else {
                // Fallback for CSV
                const text = await file.text();
                const parsed = parseCSV(text);
                headers = parsed.headers;
                data = parsed.data;
            }

            setCsvHeaders(headers);
            setCsvData(data);
            setStep('map');
        } catch (err: any) {
            console.error("File parse error:", err);
            const errorMessage = err.message || 'Failed to parse file.';
            setError(errorMessage);
            addToast(errorMessage, 'error');
        } finally {
            setIsLoading(false);
            // Reset input to allow re-uploading the same file if needed
            e.target.value = '';
        }
    };
    
    const handleDownloadTemplate = async () => {
        try {
            setIsLoading(true);
            // 1. Generate Headers
            const headers = STUDENT_FIELDS.map(field => `"${field.label.replace(/"/g, '""')}"`).join(',');
            
            // Add BOM for Excel compatibility in CSVs
            let csvContent = '\uFEFF' + headers;

            // 2. Fetch Existing Students if active session exists
            if (activeSession) {
                const sessionInfos: StudentSessionInfo[] = await db.studentSessionInfo.where({ session: activeSession }).toArray();
                
                if (sessionInfos.length > 0) {
                    const studentIds = sessionInfos.map(info => info.studentId);
                    const students = await db.students.where('id').anyOf(studentIds).toArray();
                    const sessionInfoMap = new Map(sessionInfos.map(info => [info.studentId, info]));

                    const rows = students.map(student => {
                        const sessionInfo = sessionInfoMap.get(student.id!);
                        // Merge student core data with session data (class, roll, section)
                        const fullStudentData = {
                            ...student,
                            className: sessionInfo?.className || '',
                            section: sessionInfo?.section || '',
                            rollNo: sessionInfo?.rollNo || ''
                        };

                        return STUDENT_FIELDS.map(field => {
                            // @ts-ignore
                            let value = fullStudentData[field.key];
                            if (value === undefined || value === null) value = '';
                            // Escape quotes and wrap in quotes
                            const stringValue = String(value).replace(/"/g, '""');
                            return `"${stringValue}"`;
                        }).join(',');
                    });

                    if (rows.length > 0) {
                        csvContent += '\n' + rows.join('\n');
                    }
                }
            }

            // 3. Create Blob
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            
            // 4. Use FileReader to create a Data URL (More compatible with Mobile WebViews/Median than blob: URLs)
            const reader = new FileReader();
            reader.onload = function(e) {
                const link = document.createElement('a');
                if (e.target?.result) {
                    link.setAttribute('href', e.target.result as string);
                    link.setAttribute('download', `student_list_${activeSession || 'template'}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    addToast("Student list downloaded successfully.", 'success');
                }
            };
            reader.readAsDataURL(blob);
            
        } catch (err) {
            console.error("Failed to download template", err);
            addToast("Failed to generate template.", 'error');
        } finally {
            setIsLoading(false);
        }
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
                    let value = row[headerIndexMap[csvHeader]] || '';
                    // Remove quotes if Excel added them during export (CSV specific, but doesn't hurt)
                    value = value.replace(/^"|"$/g, '').replace(/""/g, '"');

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
        let successCount = 0;
        let failedRecords: string[] = [];

        try {
            await db.transaction('rw', db.students, db.studentSessionInfo, async () => {
                
                // Clear existing data if "Replace All" is selected
                if (replaceExisting) {
                    await db.students.clear();
                    await db.studentSessionInfo.clear();
                }

                for (const studentData of studentsToImport) {
                    try {
                        const { className, section, rollNo, ...coreStudentData } = studentData;
                        
                        if (!coreStudentData.admissionNo) {
                             failedRecords.push(`${studentData.name || 'Unknown'} - Missing Admission No`);
                            continue;
                        }

                        if (!replaceExisting) {
                            const existingStudent = await db.students.where('admissionNo').equals(coreStudentData.admissionNo).first();
                            if (existingStudent) {
                                // Skip duplicates if NOT replacing
                                continue;
                            }
                        }
                        
                        // @ts-ignore
                        delete coreStudentData.id;
                        const studentId = await db.students.add(coreStudentData as Omit<Student, 'id'>);
                        
                        const sessionInfo: Omit<StudentSessionInfo, 'id'> = {
                            studentId,
                            session: activeSession,
                            className: className || '',
                            section: section || '',
                            rollNo: rollNo || '',
                        };
                        await db.studentSessionInfo.add(sessionInfo);
                        
                        successCount++;
                    } catch (e: any) {
                        failedRecords.push(`${studentData.name} - ${e.message}`);
                    }
                }
            });

            const failedCount = studentsToImport.length - successCount;
            setImportResult({ success: successCount, failed: failedCount, errors: failedRecords });
            setStep('result');
            addToast(`${successCount} students imported successfully!`, 'success');
            if (failedCount > 0 && !replaceExisting) {
                 addToast(`${failedCount} records were skipped (duplicates/errors).`, 'info');
            }

        } catch (err: any) {
            console.error("Bulk add transaction failed:", err);
            setError(`A critical error occurred during import: ${err.message}. Operation was rolled back.`);
            setImportResult({ success: successCount, failed: studentsToImport.length - successCount, errors: failedRecords });
            setStep('result');
            addToast('A critical error occurred. The import process was stopped.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const renderContent = () => {
        switch (step) {
            case 'upload':
                return (
                    <div className="text-center">
                        <h3 className="text-lg font-medium">Upload File</h3>
                        <p className="text-sm text-foreground/70 mt-1 mb-4">
                            Upload an Excel (.xlsx, .xls) or CSV file. Download the template to view existing data.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                             <label className={`cursor-pointer w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-5 rounded-lg bg-primary text-primary-foreground hover:bg-primary-hover transition-colors text-sm font-semibold ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
                                <UploadIcon className="w-5 h-5"/>
                                <span>{isLoading ? 'Processing...' : 'Choose File (Excel/CSV)'}</span>
                                {/* Extended accept attributes for Excel */}
                                <input 
                                    type="file" 
                                    accept=".csv,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain" 
                                    onChange={handleFileChange} 
                                    className="hidden" 
                                    disabled={isLoading}
                                />
                            </label>
                             <button type="button" onClick={handleDownloadTemplate} disabled={isLoading} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-5 rounded-lg bg-gray-600 hover:bg-gray-700 text-white transition-colors text-sm font-semibold disabled:opacity-70">
                                <DownloadIcon className="w-5 h-5"/>
                                <span>{isLoading ? 'Generating...' : 'Download Template'}</span>
                            </button>
                        </div>
                        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
                    </div>
                );
            case 'map':
                return (
                    <div>
                        <h3 className="text-lg font-medium">Map Columns</h3>
                        <p className="text-sm text-foreground/70 mt-1 mb-4">
                            Match columns from your file to the required fields. Session: <strong>{activeSession}</strong>.
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
                                        className="w-full p-3 bg-background border border-input rounded-md text-sm"
                                    >
                                       <option value="">-- Select Column --</option>
                                       {csvHeaders.map(header => <option key={header} value={header}>{header}</option>)}
                                   </select>
                               </div>
                           ))}
                        </div>
                        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
                        <div className="flex justify-end gap-2 mt-6">
                            <button onClick={resetState} className="py-3 px-5 rounded-lg bg-gray-500/80 hover:bg-gray-500 text-white transition-colors text-sm font-semibold">Start Over</button>
                            <button onClick={() => { if(validateMapping()) setStep('preview'); }} className="py-3 px-5 rounded-lg bg-primary text-primary-foreground hover:bg-primary-hover transition-colors text-sm font-semibold">Next: Preview</button>
                        </div>
                    </div>
                );
            case 'preview':
                const previewStudents = getMappedStudents().slice(0, 5);
                 return (
                    <div>
                        <h3 className="text-lg font-medium">Preview Data</h3>
                        <p className="text-sm text-foreground/70 mt-1 mb-4">
                            Review the first few records. A total of <strong>{csvData.length}</strong> students found.
                        </p>
                        
                        {/* Replace Toggle */}
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <label className="flex items-start gap-3 cursor-pointer">
                                <div className="relative flex items-center">
                                    <input 
                                        type="checkbox" 
                                        checked={replaceExisting} 
                                        onChange={e => setReplaceExisting(e.target.checked)} 
                                        className="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-500"
                                    />
                                </div>
                                <div className="flex-1">
                                    <span className="block font-bold text-red-700 dark:text-red-400 text-sm">Clear existing database and replace all?</span>
                                    <span className="block text-xs text-red-600/80 dark:text-red-400/80 mt-1">
                                        Warning: This will delete ALL current students and their class assignments.
                                        New students will get new IDs, which may unlink existing marks/results. Use only for initial setup or full roster updates.
                                    </span>
                                </div>
                            </label>
                        </div>

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
                            <button onClick={() => setStep('map')} className="py-3 px-5 rounded-lg bg-gray-500/80 hover:bg-gray-500 text-white transition-colors text-sm font-semibold">Back to Mapping</button>
                            <button 
                                onClick={handleImport} 
                                disabled={isLoading} 
                                className={`py-3 px-5 rounded-lg text-white transition-colors text-sm font-semibold flex items-center gap-2 ${replaceExisting ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                            >
                                {isLoading ? 'Importing...' : (
                                    replaceExisting ? <><AlertTriangleIcon className="w-4 h-4"/> Replace All</> : 'Append Students'
                                )}
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
                                {replaceExisting && <p className="text-xs text-red-500">(Database was cleared before import)</p>}
                                {importResult.failed > 0 && <p className="text-amber-500">Skipped/Failed: {importResult.failed}</p>}
                            </div>
                        )}
                        {importResult && importResult.errors.length > 0 && (
                            <div className="mt-4 text-left text-xs bg-background p-2 rounded-md max-h-32 overflow-y-auto">
                                <p className="font-semibold mb-1">Details (First 20):</p>
                                {importResult.errors.slice(0, 20).map((err, i) => <p key={i}>{err}</p>)}
                                {importResult.errors.length > 20 && <p>...and {importResult.errors.length - 20} more.</p>}
                            </div>
                        )}
                        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
                        <div className="flex justify-center mt-6">
                            <button onClick={handleClose} className="py-3 px-5 rounded-lg bg-primary text-primary-foreground hover:bg-primary-hover transition-colors text-sm font-semibold">Close</button>
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
