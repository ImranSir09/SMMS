
import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';
// FIX: Import StudentSessionInfo to explicitly type Dexie query results.
import { Student, StudentSessionInfo } from '../types';
import { useAppData } from '../hooks/useAppData';
import { generatePdfFromComponent } from '../utils/pdfGenerator';
import HolisticProgressCard from '../components/HolisticProgressCard';
import { DownloadIcon, UploadIcon } from '../components/icons';
import Card from '../components/Card';
import { useToast } from '../contexts/ToastContext';
import PhotoUploadModal from '../components/PhotoUploadModal';

const StudentReport: React.FC = () => {
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedStudentIds, setSelectedStudentIds] = useState<Set<number>>(new Set());
    const [isGenerating, setIsGenerating] = useState(false);
    const { schoolDetails, activeSession } = useAppData();
    const { addToast } = useToast();
    
    const [tempPhotos, setTempPhotos] = useState<Map<number, string | null>>(new Map());
    const [photoModalStudentId, setPhotoModalStudentId] = useState<number | null>(null);

    const classOptions = useLiveQuery(async () => {
        if (!activeSession) return [];
        const sessionInfos = await db.studentSessionInfo.where({ session: activeSession }).toArray();
        const classNames = [...new Set(sessionInfos.map(info => info.className))];
        // FIX: Add explicit string types to sort callback parameters to resolve 'unknown' type error.
        return classNames.sort((a: string, b: string) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
    }, [activeSession]);

    const studentsInClass = useLiveQuery(async () => {
        if (!selectedClass || !activeSession) return [];
        
        // FIX: Explicitly type sessionInfos to prevent it from being inferred as 'unknown[]'.
        const sessionInfos: StudentSessionInfo[] = await db.studentSessionInfo.where({ className: selectedClass, session: activeSession }).toArray();
        if (sessionInfos.length === 0) return [];

        const studentIds = sessionInfos.map(info => info.studentId);
        const studentDetails = await db.students.where('id').anyOf(studentIds).toArray();
        const sessionInfoMap = new Map(sessionInfos.map(info => [info.studentId, info]));

        // FIX: The error on rollNo is resolved by typing `sessionInfos` above.
        const mergedStudents = studentDetails.map(s => ({ ...s, rollNo: sessionInfoMap.get(s.id!)?.rollNo || '' }));
        return mergedStudents.sort((a, b) => a.rollNo.localeCompare(b.rollNo, undefined, { numeric: true, sensitivity: 'base' }));
    }, [selectedClass, activeSession]);

    const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedClass(e.target.value);
        setSelectedStudentIds(new Set());
    };

    const handleStudentSelect = (studentId: number) => {
        setSelectedStudentIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(studentId)) {
                newSet.delete(studentId);
            } else {
                newSet.add(studentId);
            }
            return newSet;
        });
    };
    
    const handleSelectAll = () => {
        if (studentsInClass && selectedStudentIds.size === studentsInClass.length) {
            setSelectedStudentIds(new Set());
        } else if (studentsInClass) {
            setSelectedStudentIds(new Set(studentsInClass.map(s => s.id!)));
        }
    };

    const handleGenerateReports = async () => {
        if (selectedStudentIds.size === 0) {
            addToast('Please select at least one student.', 'error');
            return;
        }
        if (!schoolDetails) {
            addToast('School details are not configured.', 'error');
            return;
        }

        setIsGenerating(true);
        addToast(`Generating ${selectedStudentIds.size} report(s)... This may take a moment.`, 'info');

        try {
            const allExams = await db.exams.toArray();

            for (const studentId of Array.from(selectedStudentIds)) {
                const student = await db.students.get(studentId);
                if (!student) continue;

                const [sbaData, hpcData, allMarks, allDetailedFA, allStudentExamData] = await Promise.all([
                    db.sbaReports.where({ studentId, session: activeSession }).first(),
                    db.hpcReports.where({ studentId, session: activeSession }).first(),
                    db.marks.where({ studentId }).toArray(),
                    db.detailedFormativeAssessments.where({ studentId, session: activeSession }).toArray(),
                    db.studentExamData.where({ studentId }).toArray()
                ]);

                const photoOverride = tempPhotos.has(studentId) ? tempPhotos.get(studentId) : undefined;

                await generatePdfFromComponent(
                    <HolisticProgressCard
                        student={student}
                        schoolDetails={schoolDetails}
                        sbaData={sbaData || null}
                        hpcData={hpcData || null}
                        allMarks={allMarks}
                        allDetailedFA={allDetailedFA}
                        allStudentExamData={allStudentExamData}
                        allExams={allExams}
                        photoOverride={photoOverride}
                    />,
                    `Holistic-Progress-Card-${student.name}-${student.admissionNo}`
                );
            }
            addToast('Reports generated successfully!', 'success');
        } catch (error) {
            console.error("Report generation failed:", error);
            addToast('An error occurred while generating reports.', 'error');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="flex flex-col gap-4 animate-fade-in">
            <Card className="p-3">
                <h2 className="text-md font-semibold mb-2">Generate Holistic Progress Card</h2>
                <select value={selectedClass} onChange={handleClassChange} className="p-3 bg-background border border-input rounded-md w-full text-sm mb-2">
                    <option value="">-- Select Class --</option>
                    {classOptions?.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {studentsInClass && studentsInClass.length > 0 && (
                    <div className="mb-2">
                        <label className="flex items-center gap-2 text-sm p-2 bg-background/50 rounded-lg">
                            <input
                                type="checkbox"
                                checked={selectedStudentIds.size === studentsInClass.length}
                                onChange={handleSelectAll}
                            />
                            Select All Students ({selectedStudentIds.size} / {studentsInClass.length})
                        </label>
                    </div>
                )}
                <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
                    {studentsInClass?.map(student => (
                         <div key={student.id} className="flex items-center justify-between p-2 bg-background rounded-lg">
                            <label className="flex items-center gap-3 cursor-pointer flex-grow">
                                <input
                                    type="checkbox"
                                    checked={selectedStudentIds.has(student.id!)}
                                    onChange={() => handleStudentSelect(student.id!)}
                                />
                                <p className="font-semibold text-sm">{student.name} <span className="font-normal text-xs text-foreground/70">(Roll: {student.rollNo})</span></p>
                            </label>
                            <button
                                onClick={() => setPhotoModalStudentId(student.id!)}
                                className="p-2 rounded-md hover:bg-black/10 dark:hover:bg-white/10 flex-shrink-0"
                                aria-label="Change photo for this report"
                            >
                                <UploadIcon className="w-4 h-4 text-foreground/70" />
                            </button>
                        </div>
                    ))}
                </div>
            </Card>

            <button 
                onClick={handleGenerateReports}
                disabled={isGenerating || selectedStudentIds.size === 0}
                className="w-full py-3 px-5 rounded-lg bg-accent text-accent-foreground hover:bg-accent-hover text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
            >
                <DownloadIcon className="w-5 h-5" />
                {isGenerating ? 'Generating...' : `Generate HPC for ${selectedStudentIds.size} Student(s)`}
            </button>
            
            <PhotoUploadModal
                isOpen={photoModalStudentId !== null}
                onClose={() => setPhotoModalStudentId(null)}
                onSave={(photo) => {
                    if (photoModalStudentId !== null) {
                        setTempPhotos(prev => new Map(prev).set(photoModalStudentId, photo));
                    }
                    setPhotoModalStudentId(null);
                }}
                title="Set Temporary Photo for Report"
                aspectRatio={4 / 5}
            />
        </div>
    );
};

export default StudentReport;