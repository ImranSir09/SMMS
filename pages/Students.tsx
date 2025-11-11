
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';
// FIX: Import StudentSessionInfo to explicitly type Dexie query results.
import { Student, StudentSessionInfo } from '../types';
import { StudentsIcon, UploadIcon, PlusIcon, SearchIcon, ArrowLeftIcon, ArrowRightIcon } from '../components/icons';
import BulkAddStudentsModal from '../components/BulkAddStudentsModal';
import Modal from '../components/Modal';
import { StudentForm } from '../components/StudentForm';
import { useNavigate, useLocation } from 'react-router-dom';
import StudentCard from '../components/StudentCard';
import { useToast } from '../contexts/ToastContext';
import { useAppData } from '../hooks/useAppData';

const buttonStyle = "py-3 px-4 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5";
const accentButtonStyle = `${buttonStyle} bg-accent text-accent-foreground hover:bg-accent-hover`;
const secondaryButtonStyle = `${buttonStyle} bg-slate-200 text-slate-800 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600`;

const STUDENTS_PER_PAGE = 8;

const Students: React.FC = () => {
    const { state } = useLocation();
    const preselectedClass = state?.preselectedClass;
    
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isBulkAddModalOpen, setIsBulkAddModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Partial<Student> | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeClass, setActiveClass] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    
    const { addToast } = useToast();
    const { activeSession } = useAppData();
    const navigate = useNavigate();

    const classTabs = useLiveQuery(
        async () => {
            if (!activeSession) return [];
            const sessionInfos = await db.studentSessionInfo.where({ session: activeSession }).toArray();
            const classNames = [...new Set(sessionInfos.map(info => info.className))];
            // FIX: Add explicit string types to sort callback parameters to resolve 'unknown' type error.
            return classNames.sort((a: string, b: string) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
        },
        [activeSession],
        []
    );

    const studentsWithSessionInfo = useLiveQuery(
        async () => {
            if (!activeClass || !activeSession) return [];
            
            // FIX: Explicitly type sessionInfos to prevent it from being inferred as 'unknown[]'.
            const sessionInfos: StudentSessionInfo[] = await db.studentSessionInfo
                .where({ className: activeClass, session: activeSession })
                .toArray();
            
            if (sessionInfos.length === 0) return [];
            
            const studentIds = sessionInfos.map(info => info.studentId);
            const sessionInfoMap = new Map(sessionInfos.map(info => [info.studentId, info]));
            
            const students = await db.students.where('id').anyOf(studentIds).toArray();
            
            return students.map(student => {
                const sessionInfo = sessionInfoMap.get(student.id!);
                return {
                    ...student,
                    // FIX: Errors on these lines are resolved by typing `sessionInfos` above.
                    className: sessionInfo?.className,
                    section: sessionInfo?.section,
                    rollNo: sessionInfo?.rollNo,
                };
            });
        },
        [activeClass, activeSession],
        []
    );

    const totalStudentCount = useLiveQuery(() => 
        activeSession ? db.studentSessionInfo.where({ session: activeSession }).count() : Promise.resolve(0), 
    [activeSession], 0);

    useEffect(() => {
        if (preselectedClass) {
            setActiveClass(preselectedClass);
        } else if (classTabs && classTabs.length > 0 && !activeClass) {
            setActiveClass(classTabs[0]);
        }
    }, [classTabs, activeClass, preselectedClass]);

    const filteredStudents = useMemo(() => {
        if (!studentsWithSessionInfo) return [];
        const sorted = [...studentsWithSessionInfo].sort((a, b) => (a.rollNo || '').localeCompare(b.rollNo || '', undefined, { numeric: true, sensitivity: 'base' }));

        if (!searchTerm) return sorted;

        return sorted.filter(student =>
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (student.rollNo || '').includes(searchTerm)
        );
    }, [studentsWithSessionInfo, searchTerm]);
    
    const totalPages = Math.ceil((filteredStudents?.length || 0) / STUDENTS_PER_PAGE);
    const paginatedStudents = useMemo(() => {
        if (!filteredStudents) return [];
        const startIndex = (currentPage - 1) * STUDENTS_PER_PAGE;
        return filteredStudents.slice(startIndex, startIndex + STUDENTS_PER_PAGE);
    }, [filteredStudents, currentPage]);
    
    useEffect(() => {
        setCurrentPage(1); 
    }, [activeClass, searchTerm]);

    const handleAdd = () => {
        setEditingStudent({ gender: 'Male', className: activeClass || '', section: 'A' });
        setIsFormOpen(true);
    };
    
    const handleSave = async (studentData: Student) => {
        try {
            const existingStudentByAdmNo = await db.students.where('admissionNo').equals(studentData.admissionNo).first();
            if (existingStudentByAdmNo && existingStudentByAdmNo.id !== studentData.id) {
                addToast(`Admission number '${studentData.admissionNo}' is already taken.`, 'error');
                return;
            }

            const { className, section, rollNo, ...coreStudentData } = studentData;
            
            await db.transaction('rw', db.students, db.studentSessionInfo, async () => {
                let studentIdToUse: number;

                if (coreStudentData.id) {
                    studentIdToUse = coreStudentData.id;
                    await db.students.update(studentIdToUse, coreStudentData);
                } else {
                    // @ts-ignore
                    delete coreStudentData.id;
                    studentIdToUse = await db.students.add(coreStudentData as Omit<Student, 'id'>);
                }

                const existingSessionInfo = await db.studentSessionInfo
                    .where({ studentId: studentIdToUse, session: activeSession })
                    .first();
                
                const sessionInfoPayload = {
                    studentId: studentIdToUse,
                    session: activeSession,
                    className: className || '',
                    section: section || '',
                    rollNo: rollNo || '',
                };

                if (existingSessionInfo?.id) {
                    await db.studentSessionInfo.update(existingSessionInfo.id, sessionInfoPayload);
                } else {
                    await db.studentSessionInfo.add(sessionInfoPayload);
                }
            });
    
            handleCloseForm();
            addToast(`Student ${studentData.id ? 'updated' : 'added'} successfully.`, 'success');
            if(className) setActiveClass(className);

        } catch (error) {
            console.error("Failed to save student:", error);
            addToast("An error occurred while saving the student.", 'error');
        }
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingStudent(null);
    }

    const handleCardClick = useCallback((studentId: number) => {
        navigate(`/student/${studentId}`);
    }, [navigate]);

    return (
        <div className="flex flex-col">
            <div className="flex-shrink-0 flex items-center justify-between gap-2 mb-2">
                <select 
                    value={activeClass || ''} 
                    onChange={e => setActiveClass(e.target.value)}
                    className="p-3 text-sm bg-background border border-input rounded-md w-full focus:outline-none focus:ring-2 focus:ring-primary"
                >
                    <option value="" disabled>-- Select a Class --</option>
                    {classTabs?.map(c => <option key={c} value={c}>Class {c}</option>)}
                </select>
                <div className="flex-shrink-0 flex items-center gap-2">
                    <button onClick={() => setIsBulkAddModalOpen(true)} className={secondaryButtonStyle}><UploadIcon className="w-4 h-4"/> Bulk</button>
                    <button onClick={handleAdd} className={accentButtonStyle}><PlusIcon className="w-4 h-4"/> Add</button>
                </div>
            </div>
             <div className="relative mb-2">
                <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/50"/>
                <input
                    type="text"
                    placeholder={`Search in Class ${activeClass}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="p-3 pl-10 text-sm bg-background border border-input rounded-md w-full"
                />
            </div>

            <div className="flex-1 grid grid-cols-2 gap-2">
                {paginatedStudents.map((student) => (
                   <StudentCard
                        key={student.id}
                        student={student}
                        onClick={handleCardClick}
                   />
                ))}
            </div>
            
            {(paginatedStudents.length === 0 && totalStudentCount > 0) && (
                <div className="flex-1 flex items-center justify-center text-center">
                    <p className="text-sm text-foreground/60">No students found for this class or search term.</p>
                </div>
            )}
            
            {(totalStudentCount === 0) && (
                 <div className="flex-1 flex flex-col items-center justify-center text-center p-4 border-2 border-dashed border-border rounded-lg">
                    <StudentsIcon className="w-10 h-10 text-foreground/20" />
                    <h3 className="text-md font-semibold mt-2">No Students Added</h3>
                    <p className="mt-1 text-xs text-foreground/60">
                        Add your first student to the database.
                    </p>
                </div>
            )}

            <div className="flex-shrink-0 flex items-center justify-center gap-2 pt-2 text-sm">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-3 rounded-full disabled:opacity-50"><ArrowLeftIcon className="w-5 h-5"/></button>
                <span className="text-foreground/80 font-semibold">Page {currentPage} of {totalPages || 1}</span>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="p-3 rounded-full disabled:opacity-50"><ArrowRightIcon className="w-5 h-5"/></button>
            </div>
            
            <Modal
                isOpen={isFormOpen}
                onClose={handleCloseForm}
                title={editingStudent?.id ? 'Edit Student' : 'Add New Student'}
            >
                <StudentForm 
                    studentToEdit={editingStudent!}
                    onSave={handleSave}
                    onClose={handleCloseForm}
                />
            </Modal>
            
            <BulkAddStudentsModal isOpen={isBulkAddModalOpen} onClose={() => setIsBulkAddModalOpen(false)} />
        </div>
    );
};

export default Students;
