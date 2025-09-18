
import React, { useState, useMemo, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';
import { Student } from '../types';
import { StudentsIcon, UploadIcon, PlusIcon, SearchIcon, ArrowLeftIcon, ArrowRightIcon } from '../components/icons';
import BulkAddStudentsModal from '../components/BulkAddStudentsModal';
import Modal from '../components/Modal';
import StudentForm from '../components/StudentForm';
// FIX: Updated react-router-dom imports from v5 to v6 to resolve export errors. Using useNavigate instead of useHistory.
import { useNavigate } from 'react-router-dom';
import StudentCard from '../components/StudentCard';
import { useToast } from '../contexts/ToastContext';

const CLASS_OPTIONS = ['PP1', 'PP2', 'Balvatika', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];

const buttonStyle = "py-3 px-4 rounded-md text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-1";
const accentButtonStyle = `${buttonStyle} bg-accent text-accent-foreground hover:bg-accent-hover`;
const secondaryButtonStyle = `${buttonStyle} bg-gray-600 hover:bg-gray-700 text-white`;

const STUDENTS_PER_PAGE = 8;

const Students: React.FC = () => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isBulkAddModalOpen, setIsBulkAddModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Partial<Student> | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeClass, setActiveClass] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const { addToast } = useToast();
    
    // FIX: Replaced v5 useHistory with v6 useNavigate.
    const navigate = useNavigate();

    const classTabs = useLiveQuery(
        () => db.students.orderBy('className').uniqueKeys()
            .then(keys => (keys as string[]).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))),
        []
    );

    const studentsInClass = useLiveQuery(
        () => activeClass ? db.students.where({ className: activeClass }).toArray() : [],
        [activeClass]
    );

    const totalStudentCount = useLiveQuery(() => db.students.count(), [], 0);

    useEffect(() => {
        if (classTabs && classTabs.length > 0 && !activeClass) {
            setActiveClass(classTabs[0]);
        }
    }, [classTabs, activeClass]);

    const filteredStudents = useMemo(() => {
        if (!studentsInClass) return [];
        const sorted = [...studentsInClass].sort((a, b) => a.rollNo.localeCompare(b.rollNo, undefined, { numeric: true, sensitivity: 'base' }));

        if (!searchTerm) return sorted;

        return sorted.filter(student =>
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.rollNo.includes(searchTerm)
        );
    }, [studentsInClass, searchTerm]);
    
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
        setEditingStudent({ gender: 'Male', photo: null, className: activeClass || '', section: 'A' });
        setIsFormOpen(true);
    };
    
    const handleSave = async (studentData: Student) => {
        try {
            const existingStudent = await db.students.where('admissionNo').equals(studentData.admissionNo).first();
            if (existingStudent && existingStudent.id !== studentData.id) {
                addToast(`Admission number '${studentData.admissionNo}' is already taken.`, 'error');
                return;
            }
    
            if (studentData.id) {
                await db.students.update(studentData.id, studentData);
            } else {
                await db.students.add(studentData);
            }
            handleCloseForm();
            addToast(`Student ${studentData.id ? 'updated' : 'added'} successfully.`, 'success');
            setActiveClass(studentData.className);
        } catch (error) {
            console.error("Failed to save student:", error);
            addToast("An error occurred while saving the student.", 'error');
        }
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingStudent(null);
    }

    const handleCardClick = (studentId: number) => {
        // FIX: Updated navigation call to use navigate() for v6.
        navigate(`/student/${studentId}`);
    };

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
                        onClick={() => handleCardClick(student.id!)}
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
