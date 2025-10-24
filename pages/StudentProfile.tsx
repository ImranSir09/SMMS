

import React, { useState, useMemo } from 'react';
// FIX: Updated react-router-dom imports from v5 to v6 to resolve export errors. Using useNavigate instead of useHistory.
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';
import { Student, Mark, Exam } from '../types';
import Card from '../components/Card';
import { EditIcon, TrashIcon, CertificateIcon, UserIcon, HeartHandIcon, CreditCardIcon, BarChart3Icon, HolisticIcon } from '../components/icons';
import LineChart from '../components/LineChart';
import Modal from '../components/Modal';
import { StudentForm } from '../components/StudentForm';
import { useToast } from '../contexts/ToastContext';

const buttonStyle = "py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors";

const StudentProfile: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    // FIX: Replaced v5 useHistory with v6 useNavigate.
    const navigate = useNavigate();
    const { addToast } = useToast();

    const studentId = useMemo(() => {
        const numId = Number(id);
        return isNaN(numId) ? null : numId;
    }, [id]);

    const [isFormOpen, setIsFormOpen] = useState(false);
    
    const student = useLiveQuery(() => studentId ? db.students.get(studentId) : undefined, [studentId]);
    const marks = useLiveQuery(() => studentId ? db.marks.where('studentId').equals(studentId).toArray() : [], [studentId]);
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
        if (studentId) {
            try {
                await db.students.update(studentId, studentData);
                setIsFormOpen(false);
                addToast('Student details updated successfully!', 'success');
            } catch (error) {
                console.error("Failed to update student:", error);
                addToast("An error occurred while updating student details.", 'error');
            }
        }
    };

    const handleDelete = async () => {
        if (student && studentId && window.confirm(`Are you sure you want to delete ${student.name}? This will also delete all associated marks and cannot be undone.`)) {
            try {
                await db.transaction('rw', db.students, db.marks, db.studentExamData, db.hpcReports, async () => {
                    await db.marks.where('studentId').equals(studentId).delete();
                    await db.studentExamData.where('studentId').equals(studentId).delete();
                    await db.hpcReports.where('studentId').equals(studentId).delete();
                    await db.students.delete(studentId);
                });
                // FIX: Updated navigation call to use navigate() for v6.
                navigate('/students');
                addToast(`${student.name} was deleted successfully.`, 'success');
            } catch (error) {
                console.error("Failed to delete student:", error);
                addToast("An error occurred while deleting the student.", 'error');
            }
        }
    };
    
    if (!student) {
        return <div className="p-4 text-center">Loading student profile...</div>;
    }
    
    const InfoItem: React.FC<{ label: string; value: string | undefined | null; fullWidth?: boolean }> = ({ label, value, fullWidth }) => (
        <div className={fullWidth ? 'col-span-2' : ''}>
            <strong className="font-medium text-foreground/70">{label}:</strong> {value || 'N/A'}
        </div>
    );

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
            <div className="grid grid-cols-2 gap-2">
                <button onClick={handleEdit} className={`${buttonStyle} bg-blue-600 text-white`}><EditIcon className="w-3 h-3" /> Edit</button>
                {/* FIX: Updated navigation call to use navigate() for v6. */}
                <button onClick={() => navigate(`/print/hpc/${student.id}`)} className={`${buttonStyle} bg-purple-600 text-white`}><HolisticIcon className="w-3 h-3" /> HPC Report</button>
                {/* FIX: Updated navigation call to use navigate() for v6. */}
                <button onClick={() => navigate('/certificates', { state: { searchId: student.admissionNo } })} className={`${buttonStyle} bg-green-600 text-white col-span-2`}><CertificateIcon className="w-3 h-3" /> Other Certificates</button>
                {/* FIX: Corrected the corrupted button element and completed the component structure. */}
                <button onClick={handleDelete} className={`${buttonStyle} bg-red-600 text-white col-span-2`}><TrashIcon className="w-3 h-3" /> Delete</button>
            </div>

            <Card className="p-3">
                <h3 className="flex items-center gap-1.5 font-semibold text-sm mb-2"><UserIcon className="w-4 h-4" /> Personal Information</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    <InfoItem label="Admission No" value={student.admissionNo} />
                    <InfoItem label="Gender" value={student.gender} />
                    <InfoItem label="Date of Birth" value={student.dob} />
                    <InfoItem label="Admission Date" value={student.admissionDate} />
                    <InfoItem label="Category" value={student.category} />
                    <InfoItem label="Blood Group" value={student.bloodGroup} />
                    <InfoItem label="Address" value={student.address} fullWidth />
                </div>
            </Card>

            <Card className="p-3">
                <h3 className="flex items-center gap-1.5 font-semibold text-sm mb-2"><HeartHandIcon className="w-4 h-4" /> Guardian Information</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    <InfoItem label="Father's Name" value={student.fathersName} />
                    <InfoItem label="Mother's Name" value={student.mothersName} />
                    <InfoItem label="Contact No" value={student.contact} />
                </div>
            </Card>

            <Card className="p-3">
                <h3 className="flex items-center gap-1.5 font-semibold text-sm mb-2"><CreditCardIcon className="w-4 h-4" /> Financial Information</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    <InfoItem label="Aadhar No" value={student.aadharNo} />
                    <InfoItem label="Account No" value={student.accountNo} />
                    <InfoItem label="IFSC Code" value={student.ifscCode} />
                </div>
            </Card>

            <Card className="p-3">
                <h3 className="flex items-center gap-1.5 font-semibold text-sm mb-2"><BarChart3Icon className="w-4 h-4" /> Performance Overview</h3>
                <LineChart data={performanceData} title="Average Score per Exam" />
            </Card>

            <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title="Edit Student">
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