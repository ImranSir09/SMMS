import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';
import { Student, Mark, Exam } from '../types';
import Card from '../components/Card';
import { EditIcon, TrashIcon, IdCardIcon } from '../components/icons';
import LineChart from '../components/LineChart';
import Modal from '../components/Modal';
import StudentForm from '../components/StudentForm';

const buttonStyle = "py-2 px-3 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-colors";

const StudentProfile: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const studentId = Number(id);
    const navigate = useNavigate();

    const [isFormOpen, setIsFormOpen] = useState(false);
    
    const student = useLiveQuery(() => db.students.get(studentId), [studentId]);
    const marks = useLiveQuery(() => db.marks.where('studentId').equals(studentId).toArray(), [studentId]);
    const exams = useLiveQuery(() => db.exams.toArray(), []);

    const performanceData = useMemo(() => {
        if (!marks || !exams) return [];
        
        const examsMap = new Map<number, Exam>(exams.map(e => [e.id!, e]));
        const examResults: { [examId: number]: { total: number, count: number } } = {};

        marks.forEach(mark => {
            if (!examResults[mark.examId]) {
                examResults[mark.examId] = { total: 0, count: 0 };
            }
            const faTotal = (mark.fa1 || 0) + (mark.fa2 || 0) + (mark.fa3 || 0) + (mark.fa4 || 0) + (mark.fa5 || 0) + (mark.fa6 || 0);
            const total100 = faTotal + (mark.coCurricular || 0) + (mark.summative || 0);
            examResults[mark.examId].total += total100;
            examResults[mark.examId].count++;
        });

        return Object.entries(examResults)
            .map(([examId, data]) => {
                const exam = examsMap.get(Number(examId));
                if (!exam || data.count === 0) return null;
                return {
                    label: exam.name,
                    value: Math.round(data.total / data.count)
                };
            })
            .filter(Boolean) as { label: string, value: number }[];

    }, [marks, exams]);

    const handleEdit = () => {
        setIsFormOpen(true);
    };

    const handleSave = async (studentData: Student) => {
        await db.students.update(studentId, studentData);
        setIsFormOpen(false);
    };

    const handleDelete = async () => {
        if (student && window.confirm(`Are you sure you want to delete ${student.name}? This will also delete all associated marks and cannot be undone.`)) {
            await db.transaction('rw', db.students, db.marks, db.studentExamData, async () => {
                await db.marks.where('studentId').equals(studentId).delete();
                await db.studentExamData.where('studentId').equals(studentId).delete();
                await db.students.delete(studentId);
            });
            navigate('/students');
        }
    };
    
    if (!student) {
        return <div className="p-4 text-center">Loading student profile...</div>;
    }

    return (
        <div className="flex flex-col gap-3 animate-fade-in">
            {/* Profile Header */}
            <Card className="flex-shrink-0 flex items-center gap-3 p-3">
                {student.photo ? (
                    <img src={student.photo} alt={student.name} className="w-16 h-20 object-cover rounded-md border-2 border-border" />
                ) : (
                    <div className="w-16 h-20 rounded-md bg-gray-200 dark:bg-gray-700 flex-shrink-0"></div>
                )}
                <div className="flex-1">
                    <h2 className="text-xl font-bold">{student.name}</h2>
                    <p className="text-sm text-foreground/80">Class {student.className} '{student.section}' | Roll No: {student.rollNo}</p>
                </div>
            </Card>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-2">
                <button onClick={handleEdit} className={`${buttonStyle} bg-blue-600 text-white`}><EditIcon className="w-3 h-3" /> Edit</button>
                <button onClick={() => navigate('/certificates', { state: { searchId: student.admissionNo, searchType: 'student' } })} className={`${buttonStyle} bg-green-600 text-white`}><IdCardIcon className="w-3 h-3" /> Certificates</button>
                <button onClick={handleDelete} className={`${buttonStyle} bg-red-600 text-white`}><TrashIcon className="w-3 h-3" /> Delete</button>
            </div>
            
            {/* Details Cards */}
            <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
                <Card className="p-3">
                    <h3 className="font-semibold text-md mb-2 border-b border-border pb-1">Academic Performance</h3>
                    {performanceData.length > 0 ? (
                        <LineChart data={performanceData} title="Overall Percentage per Exam" />
                    ) : (
                        <p className="text-sm text-center text-foreground/60 py-4">No exam data available to show trends.</p>
                    )}
                </Card>

                <Card className="p-3">
                    <h3 className="font-semibold text-md mb-2 border-b border-border pb-1">Personal Information</h3>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <span><strong className="font-medium text-foreground/70">Admission No:</strong> {student.admissionNo}</span>
                        <span><strong className="font-medium text-foreground/70">Gender:</strong> {student.gender}</span>
                        <span><strong className="font-medium text-foreground/70">Date of Birth:</strong> {student.dob}</span>
                        <span><strong className="font-medium text-foreground/70">Category:</strong> {student.category || 'N/A'}</span>
                        <span><strong className="font-medium text-foreground/70">Blood Group:</strong> {student.bloodGroup || 'N/A'}</span>
                        <span><strong className="font-medium text-foreground/70">Admission Date:</strong> {student.admissionDate || 'N/A'}</span>
                    </div>
                </Card>

                <Card className="p-3">
                    <h3 className="font-semibold text-md mb-2 border-b border-border pb-1">Parent & Contact Information</h3>
                    <div className="grid grid-cols-1 gap-y-2 text-sm">
                        <span><strong className="font-medium text-foreground/70">Father's Name:</strong> {student.fathersName}</span>
                        <span><strong className="font-medium text-foreground/70">Mother's Name:</strong> {student.mothersName}</span>
                        <span><strong className="font-medium text-foreground/70">Contact:</strong> {student.contact}</span>
                        <span><strong className="font-medium text-foreground/70">Address:</strong> {student.address}</span>
                    </div>
                </Card>
            </div>
            
             <Modal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                title={`Edit ${student.name}`}
            >
                <StudentForm 
                    studentToEdit={student}
                    onSave={handleSave}
                    onClose={() => setIsFormOpen(false)}
                />
            </Modal>
        </div>
    );
};

export default StudentProfile;