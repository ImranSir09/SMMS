import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenAI, Type } from "@google/genai";
import { useToast } from '../contexts/ToastContext';
import { useAppData } from '../hooks/useAppData';
import { db } from '../services/db';
import { Student } from '../types';
import Card from '../components/Card';
import { UploadIcon, SaveIcon, InfoIcon, AlertTriangleIcon } from '../components/icons';

const inputStyle = "p-3 w-full bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm transition-colors";
const labelStyle = "block text-sm font-medium text-foreground/80 mb-1";

const ExtractInfo: React.FC = () => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [extractedData, setExtractedData] = useState<Partial<Student> | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { addToast } = useToast();
    const { activeSession } = useAppData();
    const navigate = useNavigate();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 4 * 1024 * 1024) {
                setError('File is too large. Please select an image under 4MB.');
                return;
            }
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
            setExtractedData(null);
            setError(null);
        }
    };

    const handleExtract = async () => {
        if (!imageFile) return;
        setIsLoading(true);
        setError(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const reader = new FileReader();
            reader.readAsDataURL(imageFile);
            reader.onload = async () => {
                const base64Data = (reader.result as string).split(',')[1];
                
                try {
                    const response = await ai.models.generateContent({
                        model: 'gemini-2.5-flash',
                        contents: {
                            parts: [
                                { text: "Extract the following details from the certificate image and return them as a JSON object. If a field is not present, use an empty string for its value. The date of birth should be in YYYY-MM-DD format if possible, otherwise as it appears on the document. The fields to extract are: name, fathersName, mothersName, admissionNo, className, section, and dob." },
                                { inlineData: { mimeType: imageFile.type, data: base64Data } }
                            ]
                        },
                        config: {
                            responseMimeType: "application/json",
                            responseSchema: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    fathersName: { type: Type.STRING },
                                    mothersName: { type: Type.STRING },
                                    admissionNo: { type: Type.STRING },
                                    className: { type: Type.STRING },
                                    section: { type: Type.STRING },
                                    dob: { type: Type.STRING, description: "Date of birth in YYYY-MM-DD format if possible" },
                                }
                            }
                        }
                    });
                    
                    const text = response.text;
                    const data = JSON.parse(text);

                    // Basic validation
                    if (data && typeof data === 'object') {
                        setExtractedData(data);
                        addToast('Information extracted successfully!', 'success');
                    } else {
                        throw new Error("Invalid response format from API.");
                    }

                } catch (apiError) {
                    console.error("Gemini API Error:", apiError);
                    setError("Failed to extract information from the image. The AI model could not process it. Please try a clearer image.");
                    addToast("Failed to extract information.", "error");
                } finally {
                    setIsLoading(false);
                }
            };
            reader.onerror = () => {
                setError("Failed to read the image file.");
                setIsLoading(false);
            };
        } catch (e) {
            console.error(e);
            setError("An unexpected error occurred during initialization.");
            setIsLoading(false);
        }
    };

    const handleDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setExtractedData(prev => prev ? { ...prev, [name]: value } : null);
    };

    const handleSaveStudent = async () => {
        if (!extractedData || !extractedData.name || !extractedData.admissionNo) {
            addToast('Required fields like Name and Admission No are missing.', 'error');
            return;
        }

        setIsLoading(true);
        try {
            const existingStudent = await db.students.where('admissionNo').equals(extractedData.admissionNo).first();
            if (existingStudent) {
                addToast(`A student with Admission No ${extractedData.admissionNo} already exists.`, 'error');
                setIsLoading(false);
                return;
            }
            
            const { className, section, rollNo, ...coreStudentData } = extractedData;

            const studentToAdd: Omit<Student, 'id'> = {
                name: coreStudentData.name || '',
                admissionNo: coreStudentData.admissionNo || '',
                dob: coreStudentData.dob || '',
                gender: 'Male', // Default, as it's not extracted
                fathersName: coreStudentData.fathersName || '',
                mothersName: coreStudentData.mothersName || '',
                contact: '', // Not extracted
                address: '', // Not extracted
            };
            
            const studentId = await db.students.add(studentToAdd);

            await db.studentSessionInfo.add({
                studentId,
                session: activeSession,
                className: className || '',
                section: section || '',
                rollNo: rollNo || '', // Not extracted
            });

            addToast('Student saved successfully!', 'success');
            navigate(`/student/${studentId}`);

        } catch (error) {
            console.error("Failed to save student:", error);
            addToast('An error occurred while saving the student.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-4 animate-fade-in">
            <Card className="p-4">
                <div className="flex items-start gap-3 p-3 bg-primary/10 border border-primary/20 rounded-lg text-sm">
                    <InfoIcon className="w-6 h-6 flex-shrink-0 text-primary" />
                    <p>Upload a clear image of a student's Date of Birth (D.O.B) certificate. The AI will attempt to extract the information automatically. Review the data before saving.</p>
                </div>

                <div className="mt-4">
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-lg cursor-pointer bg-background hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        {imagePreview ? (
                            <img src={imagePreview} alt="Certificate preview" className="h-full w-full object-contain p-2" />
                        ) : (
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <UploadIcon className="w-8 h-8 mb-2 text-foreground/60" />
                                <p className="mb-2 text-sm text-foreground/80"><span className="font-semibold">Click to upload</span></p>
                                <p className="text-xs text-foreground/60">PNG, JPG, or WEBP (MAX. 4MB)</p>
                            </div>
                        )}
                        <input type="file" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} className="hidden" />
                    </label>
                </div>

                {error && (
                    <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400 rounded-lg text-sm flex items-center gap-2">
                        <AlertTriangleIcon className="w-5 h-5" />
                        {error}
                    </div>
                )}

                {imageFile && !extractedData && (
                    <button onClick={handleExtract} disabled={isLoading} className="w-full mt-4 py-3 bg-accent text-accent-foreground font-semibold rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-60">
                        {isLoading ? 'Extracting...' : 'Extract Information'}
                    </button>
                )}
            </Card>

            {extractedData && (
                <Card className="p-4 animate-fade-in">
                    <h3 className="text-lg font-semibold mb-3 border-b border-border pb-2">Review Extracted Data</h3>
                    <div className="space-y-3">
                        <div>
                            <label htmlFor="name" className={labelStyle}>Name</label>
                            <input id="name" name="name" value={extractedData.name || ''} onChange={handleDataChange} className={inputStyle} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label htmlFor="fathersName" className={labelStyle}>Father's Name</label>
                                <input id="fathersName" name="fathersName" value={extractedData.fathersName || ''} onChange={handleDataChange} className={inputStyle} />
                            </div>
                             <div>
                                <label htmlFor="mothersName" className={labelStyle}>Mother's Name</label>
                                <input id="mothersName" name="mothersName" value={extractedData.mothersName || ''} onChange={handleDataChange} className={inputStyle} />
                            </div>
                             <div>
                                <label htmlFor="admissionNo" className={labelStyle}>Admission No</label>
                                <input id="admissionNo" name="admissionNo" value={extractedData.admissionNo || ''} onChange={handleDataChange} className={inputStyle} />
                            </div>
                             <div>
                                <label htmlFor="dob" className={labelStyle}>Date of Birth</label>
                                <input id="dob" name="dob" type="text" value={extractedData.dob || ''} onChange={handleDataChange} className={inputStyle} placeholder="YYYY-MM-DD"/>
                            </div>
                            <div>
                                <label htmlFor="className" className={labelStyle}>Class</label>
                                <input id="className" name="className" value={extractedData.className || ''} onChange={handleDataChange} className={inputStyle} />
                            </div>
                             <div>
                                <label htmlFor="section" className={labelStyle}>Section</label>
                                <input id="section" name="section" value={extractedData.section || ''} onChange={handleDataChange} className={inputStyle} />
                            </div>
                        </div>
                        <button onClick={handleSaveStudent} disabled={isLoading} className="w-full mt-4 py-3 bg-success text-success-foreground font-semibold rounded-lg hover:bg-success-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                            <SaveIcon className="w-5 h-5"/>
                            {isLoading ? 'Saving...' : 'Save as New Student'}
                        </button>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default ExtractInfo;