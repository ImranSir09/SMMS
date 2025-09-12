import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';
import { Exam, Student, Mark } from '../types';
import Card from '../components/Card';

const inputStyle = "p-2 w-full bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm transition-colors";
const labelStyle = "block text-sm font-medium text-foreground/80 mb-1";
const buttonStyle = "py-2 px-4 rounded-md text-sm font-semibold transition-colors";

const ExamMarks: React.FC = () => {
    const { examId } = useParams<{ examId: string }>();
    const navigate = useNavigate();
    const numericExamId = Number(examId);

    const [newMark, setNewMark] = useState({ studentId: '', subject: '', assessment: '', marks: '' });

    const exam = useLiveQuery(() => db.exams.get(numericExamId), [numericExamId]);
    
    const students = useLiveQuery(async () => {
        if (!exam) return [];
        return db.students.where('className').equals(exam.className).sortBy('rollNo');
    }, [exam]);

    const marks = useLiveQuery(() => db.marks.where('examId').equals(numericExamId).toArray(), [numericExamId]);

    const marksByStudent = useMemo(() => {
        const map = new Map<number, Mark[]>();
        marks?.forEach(mark => {
            const list = map.get(mark.studentId) || [];
            list.push(mark);
            map.set(mark.studentId, list);
        });
        return map;
    }, [marks]);

    if (!exam || !students) {
        return <div>Loading exam details...</div>;
    }

    const handleNewMarkChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setNewMark({ ...newMark, [e.target.name]: e.target.value });
    };

    const handleAddMark = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMark.studentId || !newMark.subject.trim() || !newMark.assessment.trim() || newMark.marks === '') {
            alert('Please fill all fields for the new mark.');
            return;
        }
        await db.marks.add({
            examId: numericExamId,
            studentId: Number(newMark.studentId),
            subject: newMark.subject.trim(),
            assessment: newMark.assessment.trim(),
            marks: Number(newMark.marks),
        });
        setNewMark({ studentId: '', subject: '', assessment: '', marks: '' }); // Reset form
    };

    const handleDeleteMark = async (markId: number) => {
        if (window.confirm('Are you sure you want to delete this mark entry?')) {
            await db.marks.delete(markId);
        }
    };

    return (
        <div className="animate-fade-in space-y-6">
            <div>
                 <button onClick={() => navigate('/exams')} className="text-sm text-primary hover:underline mb-2">&larr; Back to all exams</button>
                 <h1 className="text-2xl font-bold">Manage Marks for {exam.name}</h1>
                 <p className="text-foreground/70">Class: {exam.className}</p>
            </div>

            <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Add New Mark</h2>
                <form onSubmit={handleAddMark} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div>
                        <label htmlFor="studentId" className={labelStyle}>Student</label>
                        <select id="studentId" name="studentId" value={newMark.studentId} onChange={handleNewMarkChange} className={inputStyle} required>
                            <option value="" disabled>-- Select Student --</option>
                            {students.map(s => <option key={s.id} value={s.id}>{s.name} (Roll: {s.rollNo})</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="assessment" className={labelStyle}>Assessment</label>
                        <input id="assessment" name="assessment" value={newMark.assessment} onChange={handleNewMarkChange} placeholder="e.g., Term 1" className={inputStyle} required/>
                    </div>
                    <div>
                        <label htmlFor="subject" className={labelStyle}>Subject</label>
                        <input id="subject" name="subject" value={newMark.subject} onChange={handleNewMarkChange} placeholder="e.g., Maths" className={inputStyle} required/>
                    </div>
                    <div>
                        <label htmlFor="marks" className={labelStyle}>Marks Obtained</label>
                        <input id="marks" name="marks" type="number" value={newMark.marks} onChange={handleNewMarkChange} placeholder="e.g., 85" className={inputStyle} required/>
                    </div>
                    <button type="submit" className={`${buttonStyle} bg-primary text-primary-foreground hover:bg-primary-hover`}>Add Mark</button>
                </form>
            </Card>

             <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Entered Marks</h2>
                <div className="space-y-4">
                   {students.map(student => {
                       const studentMarks = marksByStudent.get(student.id!) || [];
                       if (studentMarks.length === 0) return null;
                       
                       return (
                           <div key={student.id} className="p-3 bg-background/50 rounded-lg">
                               <p className="font-bold">{student.name}</p>
                               <table className="w-full text-left text-sm mt-2">
                                   <thead>
                                       <tr className="border-b border-border">
                                            <th className="p-2 font-semibold">Assessment</th>
                                            <th className="p-2 font-semibold">Subject</th>
                                            <th className="p-2 font-semibold">Marks</th>
                                            <th className="p-2"></th>
                                       </tr>
                                   </thead>
                                   <tbody>
                                       {studentMarks.map(mark => (
                                           <tr key={mark.id} className="border-b border-border/50 last:border-b-0">
                                               <td className="p-2">{mark.assessment}</td>
                                               <td className="p-2">{mark.subject}</td>
                                               <td className="p-2 font-medium">{mark.marks}</td>
                                               <td className="p-2 text-right">
                                                   <button onClick={() => handleDeleteMark(mark.id!)} className="text-red-500 hover:underline text-xs">Delete</button>
                                               </td>
                                           </tr>
                                       ))}
                                   </tbody>
                               </table>
                           </div>
                       )
                   })}
                   {(!marks || marks.length === 0) && <p className="text-center text-foreground/60 p-4">No marks have been entered for this exam yet.</p>}
                </div>
            </Card>
        </div>
    );
};

export default ExamMarks;
