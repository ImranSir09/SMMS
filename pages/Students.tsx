import React, { useState, useMemo, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';
import { Student } from '../types';
import { UploadIcon, IdCardIcon, PrintIcon, StudentsIcon } from '../components/icons';
import BulkAddStudentsModal from '../components/BulkAddStudentsModal';
import SlideOutPanel from '../components/SlideOutPanel';
import StudentForm from '../components/StudentForm';
import { useAppData } from '../hooks/useAppData';
import { generatePdfFromComponent } from '../utils/pdfGenerator';
import IdCard from '../components/IdCard';
import RollStatement from '../components/RollStatement';

const CLASS_OPTIONS = ['PP1', 'PP2', 'Balvatika', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];

const buttonStyle = "py-2 px-4 rounded-md text-sm font-semibold transition-colors disabled:opacity-60";
const accentButtonStyle = `${buttonStyle} bg-accent text-accent-foreground hover:bg-accent-hover`;
const successButtonStyle = `${buttonStyle} bg-success text-success-foreground hover:bg-success-hover`;

const Students: React.FC = () => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isBulkAddModalOpen, setIsBulkAddModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Partial<Student> | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeClass, setActiveClass] = useState<string | null>(null);
    const [generatingPdf, setGeneratingPdf] = useState<string | number | null>(null); // 'roll' or student.id
    
    const { schoolDetails } = useAppData();
    const students = useLiveQuery(() => db.students.toArray(), []);

    const { groupedStudents, classTabs } = useMemo(() => {
        if (!students) return { groupedStudents: new Map(), classTabs: [] };

        const grouped = new Map<string, Student[]>();
        students.forEach(student => {
            const classList = grouped.get(student.className) || [];
            classList.push(student);
            grouped.set(student.className, classList);
        });

        grouped.forEach(list => {
            list.sort((a, b) => a.rollNo.localeCompare(b.rollNo, undefined, { numeric: true, sensitivity: 'base' }));
        });

        const tabs = Array.from(grouped.keys()).sort((a, b) => {
            const indexA = CLASS_OPTIONS.indexOf(a);
            const indexB = CLASS_OPTIONS.indexOf(b);
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        });

        return { groupedStudents: grouped, classTabs: tabs };
    }, [students]);

    useEffect(() => {
        if (classTabs.length > 0 && !activeClass) {
            setActiveClass(classTabs[0]);
        }
    }, [classTabs, activeClass]);

    const filteredStudents = useMemo(() => {
        if (!activeClass || !groupedStudents.has(activeClass)) return [];
        const classStudents = groupedStudents.get(activeClass) || [];
        if (!searchTerm) return classStudents;

        return classStudents.filter(student =>
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.rollNo.includes(searchTerm) ||
            student.admissionNo.includes(searchTerm)
        );
    }, [activeClass, groupedStudents, searchTerm]);

    const handleGenerateIdCard = async (student: Student) => {
        if (!schoolDetails || !student.id) return;
        setGeneratingPdf(student.id);
        await generatePdfFromComponent(
            <IdCard student={student} schoolDetails={schoolDetails} />,
            `ID-Card-${student.admissionNo}-${student.name}`
        );
        setGeneratingPdf(null);
    };

    const handleGenerateRollStatement = async (className: string) => {
        if (!schoolDetails || !className) return;
        setGeneratingPdf('roll');
        const classStudents = await db.students.where('className').equals(className).sortBy('rollNo');
        await generatePdfFromComponent(
            <RollStatement students={classStudents} className={className} schoolDetails={schoolDetails} />,
            `Roll-Statement-Class-${className}`
        );
        setGeneratingPdf(null);
    };


    const handleAdd = () => {
        setEditingStudent({ gender: 'Male', photo: null, className: activeClass || '', category: 'General', admissionDate: '' });
        setIsFormOpen(true);
    };

    const handleEdit = (student: Student) => {
        setEditingStudent(student);
        setIsFormOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this student?')) {
            await db.students.delete(id);
        }
    };
    
    const handleSave = async (studentData: Student) => {
        if (studentData.id) {
            await db.students.update(studentData.id, studentData);
        } else {
            await db.students.add(studentData);
        }
        handleCloseForm();
        setActiveClass(studentData.className); // Switch to the class of the saved student
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingStudent(null);
    }

    return (
        <div className="animate-fade-in">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <h1 className="text-2xl font-bold">Student Database</h1>
                <div className="flex gap-2">
                    <button onClick={() => setIsBulkAddModalOpen(true)} className={`${successButtonStyle} flex items-center gap-2`}>
                        <UploadIcon className="w-4 h-4"/> Bulk Add
                    </button>
                    <button onClick={handleAdd} className={accentButtonStyle}>Add Student</button>
                </div>
            </div>
            
            <div className="border-b border-border mb-4">
                <nav className="-mb-px flex space-x-4 overflow-x-auto" aria-label="Tabs">
                    {classTabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveClass(tab)}
                            className={`whitespace-nowrap py-2 px-3 border-b-2 font-medium text-sm transition-colors ${
                                activeClass === tab
                                ? 'border-primary text-primary'
                                : 'border-transparent text-foreground/60 hover:text-foreground/80 hover:border-gray-300'
                            }`}
                        >
                            Class {tab}
                        </button>
                    ))}
                </nav>
            </div>
            
            {activeClass && (
                <div>
                     <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                         <input
                            type="text"
                            placeholder={`Search in Class ${activeClass}...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="p-2 bg-background border border-input rounded-md w-full sm:w-auto"
                        />
                         <button 
                            onClick={() => handleGenerateRollStatement(activeClass)}
                            disabled={!!generatingPdf}
                            className="flex items-center gap-2 py-2 px-4 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors disabled:opacity-60">
                            <PrintIcon className="w-4 h-4" />
                            {generatingPdf === 'roll' ? 'Generating...' : 'Generate Roll Statement'}
                         </button>
                     </div>

                    <div className="overflow-x-auto border border-border rounded-lg">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-background border-b border-border">
                                <tr>
                                    <th className="p-3 font-semibold">Roll No</th>
                                    <th className="p-3 font-semibold">Name</th>
                                    <th className="p-3 font-semibold">Contact</th>
                                    <th className="p-3 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.map((student, index) => (
                                    <tr 
                                        key={student.id} 
                                        className="border-b last:border-b-0 hover:bg-background animate-fade-in-item"
                                        style={{ animationDelay: `${index * 30}ms` }}
                                    >
                                        <td className="p-3 font-medium">{student.rollNo}</td>
                                        <td className="p-3">{student.name}</td>
                                        <td className="p-3">{student.contact}</td>
                                        <td className="p-3 text-right">
                                            <button 
                                                onClick={() => handleGenerateIdCard(student)} 
                                                disabled={!!generatingPdf} 
                                                className="mr-2 text-blue-600 dark:text-blue-400 hover:underline font-semibold inline-flex items-center gap-1 disabled:opacity-50"
                                            >
                                                {generatingPdf === student.id ? '...' : <><IdCardIcon className="w-4 h-4"/> ID Card</>}
                                            </button>
                                            <button onClick={() => handleEdit(student)} className="mr-2 text-primary hover:underline font-semibold">Edit</button>
                                            <button onClick={() => handleDelete(student.id!)} className="text-red-500 hover:underline font-semibold">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredStudents.length === 0 && <p className="text-center p-6 text-foreground/60">No students found for this class.</p>}
                    </div>
                </div>
            )}
            
            {!activeClass && students && students.length > 0 && (
                <p className="text-center p-6 text-foreground/60">Select a class tab to view students.</p>
            )}

            {(!students || students.length === 0) && (
                 <div className="text-center p-10 border-2 border-dashed border-border rounded-lg mt-6">
                    <div className="flex justify-center mb-4">
                        <StudentsIcon className="w-12 h-12 text-foreground/20" />
                    </div>
                    <h3 className="text-xl font-semibold">No Students Found</h3>
                    <p className="mt-2 text-foreground/60">
                        Get started by adding your first student to the database.
                    </p>
                    <button onClick={handleAdd} className={`${accentButtonStyle} mt-4`}>
                        Add First Student
                    </button>
                </div>
            )}

            {editingStudent && (
                <SlideOutPanel
                    isOpen={isFormOpen}
                    onClose={handleCloseForm}
                    title={editingStudent.id ? 'Edit Student' : 'Add New Student'}
                >
                    <StudentForm 
                        studentToEdit={editingStudent}
                        onSave={handleSave}
                        onClose={handleCloseForm}
                    />
                </SlideOutPanel>
            )}
            
            <BulkAddStudentsModal isOpen={isBulkAddModalOpen} onClose={() => setIsBulkAddModalOpen(false)} />
        </div>
    );
};

export default Students;