

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';
import { Student, SbaReportData, SbaWellbeingStatus, SbaProficiencyLevel, SbaTalentLevel } from '../types';
import { useToast } from '../contexts/ToastContext';
import { SearchIcon } from '../components/icons';
import { ACADEMIC_YEAR } from '../constants';
import SectionCard from '../components/SectionCard';

const DEBOUNCE_DELAY = 1500;

const WELLBEING_OPTIONS: SbaWellbeingStatus[] = ['Normal and Healthy', 'Needs Attention'];
const PROFICIENCY_OPTIONS: SbaProficiencyLevel[] = ['High', 'Medium', 'Low'];
const TALENT_OPTIONS: SbaTalentLevel[] = ['No talent', 'Talented', 'Highly Talented'];

const defaultSbaData = (studentId: number): Omit<SbaReportData, 'id'> => ({
    studentId,
    academicYear: ACADEMIC_YEAR,
    physicalWellbeing: 'Normal and Healthy',
    mentalWellbeing: 'Normal and Healthy',
    diseaseFound: 'Normal and Healthy',
    creativity: 'High',
    criticalThinking: 'High',
    communicationSkill: 'High',
    problemSolvingAbility: 'High',
    collaboration: 'High',
    studentsTalent: 'No talent',
    participationInActivities: 'High',
    attitudeAndValues: 'High',
    presentationSkill: 'High',
    writingSkill: 'High',
    comprehensionSkill: 'High',
});

const SelectInput: React.FC<{ label: string; value: string; options: readonly string[]; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; }> = ({ label, value, options, onChange }) => (
    <div>
        <label className="block text-xs font-semibold text-foreground/80 mb-1">{label}</label>
        <select
            value={value}
            onChange={onChange}
            className="p-2 w-full bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm transition-colors"
        >
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);

const StudentListItem: React.FC<{ student: Student; onClick: () => void; isSelected: boolean }> = ({ student, onClick, isSelected }) => (
    <div
        onClick={onClick}
        className={`p-2 rounded-lg flex items-center gap-2 cursor-pointer transition-colors ${
            isSelected ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-primary/10'
        }`}
    >
        {student.photo ? (
            <img src={student.photo} alt={student.name} className="w-10 h-12 rounded-md object-cover flex-shrink-0" />
        ) : (
            <div className="w-10 h-12 rounded-md bg-gray-200 dark:bg-gray-700 flex-shrink-0"></div>
        )}
        <div className="flex-1 min-w-0">
            <p className="font-bold text-sm truncate">{student.name}</p>
            <p className="text-xs opacity-80">Roll: {student.rollNo} | Adm: {student.admissionNo}</p>
        </div>
    </div>
);


const HolisticAssessment: React.FC = () => {
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
    const [studentProfile, setStudentProfile] = useState<Student | null>(null);
    const [sbaData, setSbaData] = useState<Partial<SbaReportData> | null>(null);
    const [saveStatus, setSaveStatus] = useState<'synced' | 'pending' | 'saving' | 'error'>('synced');
    const [searchTerm, setSearchTerm] = useState('');

    const { addToast } = useToast();

    const classOptions = useLiveQuery(
        () => db.students.orderBy('className').uniqueKeys()
            .then(keys => (keys as string[]).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))),
        []
    );

    const studentsInClass = useLiveQuery(() =>
        selectedClass ? db.students.where({ className: selectedClass }).sortBy('rollNo') : Promise.resolve([]),
        [selectedClass]
    );
    
    const filteredStudents = useMemo(() => {
        if (!studentsInClass) return [];
        if (!searchTerm) return studentsInClass;
        const lowercasedTerm = searchTerm.toLowerCase();
        return studentsInClass.filter(student =>
            student.name.toLowerCase().includes(lowercasedTerm) ||
            student.rollNo.includes(searchTerm) ||
            student.admissionNo.includes(searchTerm)
        );
    }, [studentsInClass, searchTerm]);

    useEffect(() => {
        setSelectedStudentId(null);
        setStudentProfile(null);
        setSbaData(null);
        setSearchTerm('');
    }, [selectedClass]);

    useEffect(() => {
        const loadData = async () => {
            if (selectedStudentId) {
                const student = await db.students.get(selectedStudentId);
                setStudentProfile(student || null);

                const existingData = await db.sbaReports.where({ studentId: selectedStudentId, academicYear: ACADEMIC_YEAR }).first();
                if (existingData) {
                    setSbaData(existingData);
                } else {
                    setSbaData(defaultSbaData(selectedStudentId));
                }
            } else {
                setStudentProfile(null);
                setSbaData(null);
            }
        };
        loadData();
    }, [selectedStudentId]);

    const saveData = useCallback(async (dataToSave: Partial<SbaReportData>) => {
        if (!dataToSave) return;
        setSaveStatus('saving');
        try {
            if (dataToSave.id) {
                await db.sbaReports.put(dataToSave as SbaReportData);
            } else {
                const newId = await db.sbaReports.add(dataToSave as SbaReportData);
                setSbaData(prev => prev ? { ...prev, id: newId } : null); // Update state with new ID
            }
            setSaveStatus('synced');
            addToast('Changes saved automatically', 'success');
        } catch (error) {
            console.error("Failed to save SBA data:", error);
            setSaveStatus('error');
            addToast('Failed to save changes', 'error');
        }
    }, [addToast]);
    
    const debouncedSave = useMemo(() => {
        // FIX: Replaced NodeJS.Timeout with ReturnType<typeof setTimeout> to resolve the "Cannot find namespace 'NodeJS'" error, which is common in browser-only TypeScript environments.
        let timeout: ReturnType<typeof setTimeout>;
        return (dataToSave: Partial<SbaReportData>) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                saveData(dataToSave);
            }, DEBOUNCE_DELAY);
        };
    }, [saveData]);

    const handleDataChange = (field: keyof SbaReportData, value: string) => {
        setSbaData(prev => {
            if (!prev) return null;
            const updatedData = { ...prev, [field]: value };
            setSaveStatus('pending');
            debouncedSave(updatedData);
            return updatedData;
        });
    };
    
    return (
        <div className="animate-fade-in-up p-2">
            <div className="bg-card p-3 rounded-lg shadow-sm">
                 <div className="grid grid-cols-1 gap-2">
                    <select
                        value={selectedClass}
                        onChange={e => setSelectedClass(e.target.value)}
                        className="p-3 bg-background border border-input rounded-md w-full text-sm"
                    >
                        <option value="">-- Select Class --</option>
                        {classOptions?.map(c => <option key={c} value={c}>Class {c}</option>)}
                    </select>

                    {selectedClass && (
                        <div className="relative">
                            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/50"/>
                            <input
                                type="text"
                                placeholder={`Search in Class ${selectedClass}...`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="p-3 pl-10 text-sm bg-background border border-input rounded-md w-full"
                            />
                        </div>
                    )}
                </div>
                <div className="text-xs font-semibold mt-2 text-right h-4">
                    {sbaData && saveStatus === 'synced' && <span className="text-green-500">Synced</span>}
                    {sbaData && saveStatus === 'pending' && <span className="text-yellow-500">Pending changes...</span>}
                    {sbaData && saveStatus === 'saving' && <span className="text-blue-500">Saving...</span>}
                    {sbaData && saveStatus === 'error' && <span className="text-red-500">Error saving!</span>}
                </div>
            </div>
            
             {selectedClass && (
                 <div className="mt-3 bg-card p-2 rounded-lg shadow-sm max-h-48 overflow-y-auto">
                    {filteredStudents.length > 0 ? (
                        <div className="grid grid-cols-1 gap-1">
                            {filteredStudents.map(student => (
                                <StudentListItem
                                    key={student.id}
                                    student={student}
                                    isSelected={student.id === selectedStudentId}
                                    onClick={() => setSelectedStudentId(student.id!)}
                                />
                            ))}
                        </div>
                    ) : (
                         <p className="text-center text-sm text-foreground/60 p-4">No students found.</p>
                    )}
                 </div>
            )}

            {!selectedStudentId || !studentProfile || !sbaData ? (
                <div className="text-center p-8 text-foreground/60">
                    <p>Please select a class and a student to begin.</p>
                </div>
            ) : (
                <div>
                    <SectionCard title="1. Student Profile" colorClasses="bg-purple-700 border-purple-500 text-white">
                        <div className="overflow-x-auto text-xs">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-purple-100 dark:bg-purple-900/50">
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

                    <SectionCard title="2. Student Physical and Mental Wellbeing" colorClasses="bg-green-700 border-green-500 text-white">
                        <div className="grid grid-cols-3 gap-3">
                            <SelectInput label="Physical Wellbeing" value={sbaData.physicalWellbeing!} options={WELLBEING_OPTIONS} onChange={e => handleDataChange('physicalWellbeing', e.target.value)} />
                            <SelectInput label="Mental Wellbeing" value={sbaData.mentalWellbeing!} options={WELLBEING_OPTIONS} onChange={e => handleDataChange('mentalWellbeing', e.target.value)} />
                            <SelectInput label="Disease Found" value={sbaData.diseaseFound!} options={WELLBEING_OPTIONS} onChange={e => handleDataChange('diseaseFound', e.target.value)} />
                        </div>
                    </SectionCard>
                    
                    <SectionCard title="3. 21st Century Learning Skills" colorClasses="bg-orange-700 border-orange-500 text-white">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                             <SelectInput label="Creativity" value={sbaData.creativity!} options={PROFICIENCY_OPTIONS} onChange={e => handleDataChange('creativity', e.target.value)} />
                             <SelectInput label="Critical Thinking" value={sbaData.criticalThinking!} options={PROFICIENCY_OPTIONS} onChange={e => handleDataChange('criticalThinking', e.target.value)} />
                             <SelectInput label="Communication Skill" value={sbaData.communicationSkill!} options={PROFICIENCY_OPTIONS} onChange={e => handleDataChange('communicationSkill', e.target.value)} />
                             <SelectInput label="Problem Solving Ability" value={sbaData.problemSolvingAbility!} options={PROFICIENCY_OPTIONS} onChange={e => handleDataChange('problemSolvingAbility', e.target.value)} />
                             <SelectInput label="Collaboration" value={sbaData.collaboration!} options={PROFICIENCY_OPTIONS} onChange={e => handleDataChange('collaboration', e.target.value)} />
                        </div>
                    </SectionCard>

                     <SectionCard title="4. Other domains" colorClasses="bg-blue-700 border-blue-500 text-white">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                             <SelectInput label="Student's Talent" value={sbaData.studentsTalent!} options={TALENT_OPTIONS} onChange={e => handleDataChange('studentsTalent', e.target.value)} />
                             <SelectInput label="Participation" value={sbaData.participationInActivities!} options={PROFICIENCY_OPTIONS} onChange={e => handleDataChange('participationInActivities', e.target.value)} />
                             <SelectInput label="Attitude & Values" value={sbaData.attitudeAndValues!} options={PROFICIENCY_OPTIONS} onChange={e => handleDataChange('attitudeAndValues', e.target.value)} />
                             <SelectInput label="Presentation Skill" value={sbaData.presentationSkill!} options={PROFICIENCY_OPTIONS} onChange={e => handleDataChange('presentationSkill', e.target.value)} />
                             <SelectInput label="Writing Skill" value={sbaData.writingSkill!} options={PROFICIENCY_OPTIONS} onChange={e => handleDataChange('writingSkill', e.target.value)} />
                             <SelectInput label="Comprehension Skill" value={sbaData.comprehensionSkill!} options={PROFICIENCY_OPTIONS} onChange={e => handleDataChange('comprehensionSkill', e.target.value)} />
                        </div>
                    </SectionCard>
                </div>
            )}
        </div>
    );
};

export default HolisticAssessment;