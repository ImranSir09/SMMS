
import React, { useState, useMemo, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';
import { Student } from '../types';
import { StudentsIcon } from '../components/icons';
import BulkAddStudentsModal from '../components/BulkAddStudentsModal';
import Modal from '../components/Modal';
import StudentForm from '../components/StudentForm';
import { useNavigate } from 'react-router-dom';
import StudentCard from '../components/StudentCard';

const CLASS_OPTIONS = ['PP1', 'PP2', 'Balvatika', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];

const buttonStyle = "py-2 px-3 rounded-md text-xs font-semibold transition-colors disabled:opacity-60";
const accentButtonStyle = `${buttonStyle} bg-accent text-accent-foreground hover:bg-accent-hover`;
const secondaryButtonStyle = `${buttonStyle} bg-gray-500/80 hover:bg-gray-500 text-white`;

const STUDENTS_PER_PAGE = 8;

const Students: React.FC = () => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isBulkAddModalOpen, setIsBulkAddModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Partial<Student> | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeClass, setActiveClass] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    
    const students = useLiveQuery(() => db.students.toArray(), []);
    const navigate = useNavigate();

    const classTabs = useMemo(() => {
        if (!students) return [];
        const classSet = new Set(students.map(s => s.className));
        // Create tabs from all unique classes found in the DB and sort them naturally.
        return Array.from(classSet).sort((a, b) => 
            a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
        );
    }, [students]);

    useEffect(() => {
        if (classTabs.length > 0 && !activeClass) {
            setActiveClass(classTabs[0]);
        }
    }, [classTabs, activeClass]);

    const filteredStudents = useMemo(() => {
        if (!activeClass || !students) return [];
        const classStudents = students
            .filter(s => s.className === activeClass)
            .sort((a, b) => a.rollNo.localeCompare(b.rollNo, undefined, { numeric: true, sensitivity: 'base' }));

        if (!searchTerm) return classStudents;
        return classStudents.filter(student =>
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.rollNo.includes(searchTerm)
        );
    }, [activeClass, students, searchTerm]);
    
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
        const existingStudent = await db.students.where('admissionNo').equals(studentData.admissionNo).first();
        if (existingStudent && existingStudent.id !== studentData.id) {
            alert(`Admission number '${studentData.admissionNo}' is already taken.`);
            return;
        }

        if (studentData.id) {
            await db.students.update(studentData.id, studentData);
        } else {
            await db.students.add(studentData);
        }
        handleCloseForm();
        setActiveClass(studentData.className);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingStudent(null);
    }

    const handleCardClick = (studentId: number) => {
        navigate(`/student/${studentId}`);
    };

    return (
        <div className="flex flex-col">
            <div className="flex-shrink-0 flex items-center justify-between gap-2 mb-2">
                <select 
                    value={activeClass || ''} 
                    onChange={e => setActiveClass(e.target.value)}
                    className="p-2 text-sm bg-background border border-input rounded-md w-full focus:outline-none focus:ring-2 focus:ring-primary"
                >
                    <option value="" disabled>-- Select a Class --</option>
                    {classTabs.map(c => <option key={c} value={c}>Class {c}</option>)}
                </select>
                <div className="flex-shrink-0 flex items-center gap-2">
                    <button onClick={() => setIsBulkAddModalOpen(true)} className={secondaryButtonStyle}>Bulk</button>
                    <button onClick={handleAdd} className={accentButtonStyle}>Add</button>
                </div>
            </div>
             <input
                type="text"
                placeholder={`Search in Class ${activeClass}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="p-2 text-sm bg-background border border-input rounded-md w-full mb-2"
            />

            <div className="flex-1 grid grid-cols-2 gap-2">
                {paginatedStudents.map((student) => (
                   <StudentCard
                        key={student.id}
                        student={student}
                        onClick={() => handleCardClick(student.id!)}
                   />
                ))}
            </div>
            
            {(paginatedStudents.length === 0 && students && students.length > 0) && (
                <div className="flex-1 flex items-center justify-center text-center">
                    <p className="text-sm text-foreground/60">No students found for this class or search term.</p>
                </div>
            )}
            
            {(!students || students.length === 0) && (
                 <div className="flex-1 flex flex-col items-center justify-center text-center p-4 border-2 border-dashed border-border rounded-lg">
                    <StudentsIcon className="w-10 h-10 text-foreground/20" />
                    <h3 className="text-md font-semibold mt-2">No Students Added</h3>
                    <p className="mt-1 text-xs text-foreground/60">
                        Add your first student to the database.
                    </p>
                </div>
            )}

            <div className="flex-shrink-0 flex items-center justify-center gap-4 pt-2 text-sm">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="font-semibold disabled:opacity-50">Prev</button>
                <span className="text-foreground/80">Page {currentPage} of {totalPages || 1}</span>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="font-semibold disabled:opacity-50">Next</button>
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
