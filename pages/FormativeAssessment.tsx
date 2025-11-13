

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';
import { Student, DetailedFormativeAssessment, FormativeProficiencyLevel, StudentSessionInfo } from '../types';
import { useToast } from '../contexts/ToastContext';
import { SearchIcon } from '../components/icons';
import { CLASS_OPTIONS, SUBJECTS } from '../constants';
import SectionCard from '../components/SectionCard';
import { useAppData } from '../hooks/useAppData';

const DEBOUNCE_DELAY = 1500;

const FA_OPTIONS = ['F1', 'F2', 'F3', 'F4', 'F5', 'F6'];
const PROFICIENCY_LEVELS: FormativeProficiencyLevel[] = ['Sky', 'Mountain', 'Stream', 'Not-Satisfied'];

const COCURRICULAR_FIELDS = [
    { key: 'physicalActivity', label: 'Physical Activity' },
    { key: 'participationInSchoolActivities', label: 'Participation in School Activities' },
    { key: 'culturalAndCreativeActivities', label: 'Cultural and Creative Activities' },
    { key: 'healthAndHygiene', label: 'Health and Hygiene' },
    { key: 'environmentAndITAwareness', label: 'Environment / IT Awareness' },
    { key: 'discipline', label: 'Discipline' },
    { key: 'attendance', label: 'Attendance' },
];

const defaultFormData = (studentId: number, subject: string, assessmentName: string, session: string): Omit<DetailedFormativeAssessment, 'id'> => ({
    studentId,
    session,
    subject,
    assessmentName,
    examRollNo: '0',
    registrationNo: '0',
    date: new Date().toISOString().split('T')[0],
    teacherName: '',
    learningOutcomeCode: '',
    academicProficiency: 'Sky',
    cocurricularRatings: {
        physicalActivity: 'Sky', participationInSchoolActivities: 'Sky', culturalAndCreativeActivities: 'Sky',
        healthAndHygiene: 'Sky', environmentAndITAwareness: 'Sky', discipline: 'Sky', attendance: 'Sky',
    },
    anecdotalRecord: { date: new Date().toISOString().split('T')[0], observation: '' },
});

const FormativeAssessment: React.FC = () => {
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
    const [studentProfile, setStudentProfile] = useState<Student | null>(null);
    const [formData, setFormData] = useState<Partial<DetailedFormativeAssessment> | null>(null);
    const [saveStatus, setSaveStatus] = useState<'synced' | 'pending' | 'saving' | 'error'>('synced');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubject, setSelectedSubject] = useState(SUBJECTS[0]);
    const [selectedAssessmentName, setSelectedAssessmentName] = useState(FA_OPTIONS[0]);

    const { addToast } = useToast();
    const { activeSession } = useAppData();
    const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const classOptions = useLiveQuery(async () => {
        if (!activeSession) return [];
        const sessionInfos = await db.studentSessionInfo.where({ session: activeSession }).toArray();
        const classNames = [...new Set(sessionInfos.map(info => info.className))];
        return classNames.sort((a: string, b: string) => {
            const indexA = CLASS_OPTIONS.indexOf(a);
            const indexB = CLASS_OPTIONS.indexOf(b);
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
        });
    }, [activeSession]);
    
    const studentsInClass = useLiveQuery(async () => {
        if (!selectedClass || !activeSession) return [];
        const sessionInfos: StudentSessionInfo[] = await db.studentSessionInfo.where({ className: selectedClass, session: activeSession }).toArray();
        if (sessionInfos.length === 0) return [];
        const studentIds = sessionInfos.map(info => info.studentId);
        const studentDetails = await db.students.where('id').anyOf(studentIds).toArray();
        const sessionInfoMap = new Map(sessionInfos.map(info => [info.studentId, info]));
        
        const mergedStudents = studentDetails.map(student => ({ ...student, rollNo: sessionInfoMap.get(student.id!)?.rollNo || '' }));
        return mergedStudents.sort((a, b) => (a.rollNo || '').localeCompare(b.rollNo || '', undefined, { numeric: true, sensitivity: 'base' }));
    }, [selectedClass, activeSession]);

    const filteredStudents = useMemo(() => {
        if (!studentsInClass) return [];
        if (!searchTerm) return studentsInClass;
        const lowercasedTerm = searchTerm.toLowerCase();
        return studentsInClass.filter(student =>
            student.name.toLowerCase().includes(lowercasedTerm) ||
            (student.rollNo || '').includes(lowercasedTerm) ||
            student.admissionNo.includes(lowercasedTerm)
        );
    }, [studentsInClass, searchTerm]);
    
     useEffect(() => {
        if (classOptions && classOptions.length > 0 && !selectedClass) {
            setSelectedClass(classOptions[0]);
        }
    }, [classOptions, selectedClass]);

    useEffect(() => {
        setSelectedStudentId(null);
        setStudentProfile(null);
        setFormData(null);
        setSearchTerm('');
        setSelectedSubject(SUBJECTS[0]);
        setSelectedAssessmentName(FA_OPTIONS[0]);
    }, [selectedClass]);

    useEffect(() => {
        const loadData = async () => {
            if (!selectedStudentId || !activeSession) {
                setStudentProfile(null);
                setFormData(null);
                return;
            }
            
            const student = await db.students.get(selectedStudentId);
            if (student) {
                const sessionInfo = await db.studentSessionInfo.where({ studentId: selectedStudentId, session: activeSession }).first();
                setStudentProfile({ ...student, ...sessionInfo });
            } else {
                setStudentProfile(null);
            }

            const existingData = await db.detailedFormativeAssessments
                .where({ studentId: selectedStudentId, subject: selectedSubject, assessmentName: selectedAssessmentName, session: activeSession })
                .first();

            setFormData(existingData || defaultFormData(selectedStudentId, selectedSubject, selectedAssessmentName, activeSession));
            setSaveStatus('synced');
        };
        loadData();
    }, [selectedStudentId, selectedSubject, selectedAssessmentName, activeSession]);

    const saveData = useCallback(async (dataToSave: Partial<DetailedFormativeAssessment>) => {
        if (!dataToSave || !dataToSave.studentId) return;
        setSaveStatus('saving');
        try {
            await db.detailedFormativeAssessments.put(dataToSave as DetailedFormativeAssessment);
            setSaveStatus('synced');
            addToast('Changes saved automatically', 'success');
        } catch (error) {
            console.error("Failed to save data:", error);
            setSaveStatus('error');
            addToast('Failed to save changes', 'error');
        }
    }, [addToast]);

    const handleDataChange = (path: string, value: any) => {
        setFormData(prev => {
            if (!prev) return null;
            const newData = JSON.parse(JSON.stringify(prev)); // Deep copy
            const keys = path.split('.');
            let current = newData;
            for (let i = 0; i < keys.length - 1; i++) {
                if (current[keys[i]] === undefined) current[keys[i]] = {};
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;
            
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
            saveTimeoutRef.current = setTimeout(() => saveData(newData), DEBOUNCE_DELAY);
            setSaveStatus('pending');

            return newData;
        });
    };

    return (
        <div className="animate-fade-in-up p-2">
            <div className="bg-card p-3 rounded-lg shadow-sm">
                <div className="grid grid-cols-2 gap-2">
                    <select
                        value={selectedClass}
                        onChange={e => setSelectedClass(e.target.value)}
                        className="p-3 bg-background border border-input rounded-md w-full text-sm"
                    >
                        <option value="">-- Select Class --</option>
                        {classOptions?.map(c => <option key={c} value={c}>Class {c}</option>)}
                    </select>
                    <div className="relative">
                        <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/50"/>
                        <input
                            type="text"
                            placeholder="Search Student..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            disabled={!selectedClass}
                            className="p-3 pl-10 text-sm bg-background border border-input rounded-md w-full"
                        />
                    </div>
                </div>
                 <div className="text-xs font-semibold mt-2 text-right h-4">
                    {formData && saveStatus === 'synced' && <span className="text-green-500">Synced</span>}
                    {formData && saveStatus === 'pending' && <span className="text-yellow-500">Pending changes...</span>}
                    {formData && saveStatus === 'saving' && <span className="text-blue-500">Saving...</span>}
                    {formData && saveStatus === 'error' && <span className="text-red-500">Error saving!</span>}
                </div>
                {selectedClass && (
                    <div className="mt-2 max-h-48 overflow-y-auto space-y-1">
                        {filteredStudents?.map(student => (
                             <button
                                key={student.id}
                                onClick={() => setSelectedStudentId(student.id!)}
                                className={`w-full text-left p-2 rounded-lg flex items-center gap-2 cursor-pointer transition-colors ${
                                    selectedStudentId === student.id ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-primary/10'
                                }`}
                            >
                                <p className="font-bold text-sm truncate">{student.name} (R: {student.rollNo})</p>
                             </button>
                        ))}
                    </div>
                )}
            </div>
            
            {!selectedStudentId || !studentProfile || !formData ? (
                 <div className="text-center p-8 text-foreground/60">
                    <p>Please select a student to begin.</p>
                </div>
            ) : (
                <div>
                    <SectionCard title="1. Student Profile" colorClasses="bg-purple-700 border-purple-500 text-white">
                        <div className="overflow-x-auto text-xs">
                           <table className="w-full border-collapse">
                                <thead className="bg-purple-100 dark:bg-purple-900/50">
                                    <tr>
                                       {['Adm No', 'Aadhar No', 'Name', "Father's Name", "Mother's Name", 'Address', 'Class', 'Category', 'D.O.B', 'Contact'].map(h => 
                                            <th key={h} className="p-1 border border-purple-300 font-semibold">{h}</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        {[studentProfile.admissionNo, studentProfile.aadharNo, studentProfile.name, studentProfile.fathersName, studentProfile.mothersName, studentProfile.address, studentProfile.className, studentProfile.category, studentProfile.dob, studentProfile.contact].map((d, i) =>
                                            <td key={i} className="p-1 border border-purple-300 text-center bg-blue-50 dark:bg-blue-900/20 h-8">{d || '-'}</td>
                                        )}
                                    </tr>
                                </tbody>
                           </table>
                        </div>
                    </SectionCard>

                    <SectionCard title="2. Formative Assessment (Academic Performance)" colorClasses="bg-orange-700 border-orange-500 text-white">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <input type="text" placeholder="Exam Roll No" value={formData.examRollNo || ''} onChange={e => handleDataChange('examRollNo', e.target.value)} className="p-2 bg-background border border-input rounded-md"/>
                            <input type="text" placeholder="Registration No" value={formData.registrationNo || ''} onChange={e => handleDataChange('registrationNo', e.target.value)} className="p-2 bg-background border border-input rounded-md"/>
                            <input type="date" value={formData.date || ''} onChange={e => handleDataChange('date', e.target.value)} className="p-2 bg-background border border-input rounded-md"/>
                            <select value={selectedAssessmentName} onChange={e => setSelectedAssessmentName(e.target.value)} className="p-2 bg-background border border-input rounded-md">
                                {FA_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                            <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className="p-2 bg-background border border-input rounded-md">
                                {SUBJECTS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                            <input type="text" placeholder="Name of Teacher" value={formData.teacherName || ''} onChange={e => handleDataChange('teacherName', e.target.value)} className="p-2 bg-background border border-input rounded-md"/>
                            <input type="text" placeholder="Assessed Learning Outcome Code" value={formData.learningOutcomeCode || ''} onChange={e => handleDataChange('learningOutcomeCode', e.target.value)} className="p-2 bg-background border border-input rounded-md"/>
                            <select value={formData.academicProficiency} onChange={e => handleDataChange('academicProficiency', e.target.value)} className="p-2 bg-background border border-input rounded-md">
                                {PROFICIENCY_LEVELS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                    </SectionCard>

                    <SectionCard title="3. Formative Assessment (Cocurricular Activities)" colorClasses="bg-cyan-700 border-cyan-500 text-white">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {COCURRICULAR_FIELDS.map(field => (
                                <div key={field.key}>
                                    <label className="block text-xs font-semibold text-foreground/80 mb-1">{field.label}</label>
                                    <select
                                        value={formData.cocurricularRatings?.[field.key as keyof typeof formData.cocurricularRatings] || 'Sky'}
                                        onChange={e => handleDataChange(`cocurricularRatings.${field.key}`, e.target.value)}
                                        className="p-2 w-full bg-background border border-input rounded-md text-sm"
                                    >
                                        {PROFICIENCY_LEVELS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs mt-3 text-foreground/70 italic">*Sky=Excellent, Mountain=Satisfied, Stream=Not-Satisfied</p>
                    </SectionCard>

                    <SectionCard title="4. Other snapshot detail of student (Anecdotal record)" colorClasses="bg-green-700 border-green-500 text-white">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                             <div>
                                <label className="block text-xs font-semibold text-foreground/80 mb-1">Date</label>
                                <input type="date" value={formData.anecdotalRecord?.date || ''} onChange={e => handleDataChange('anecdotalRecord.date', e.target.value)} className="p-2 w-full bg-background border border-input rounded-md text-sm" />
                             </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-semibold text-foreground/80 mb-1">Teacher's Observation</label>
                                <textarea
                                    value={formData.anecdotalRecord?.observation || ''}
                                    onChange={e => handleDataChange('anecdotalRecord.observation', e.target.value)}
                                    rows={3}
                                    className="p-2 w-full bg-background border border-input rounded-md text-sm"
                                />
                            </div>
                        </div>
                    </SectionCard>
                </div>
            )}
        </div>
    );
};

export default FormativeAssessment;