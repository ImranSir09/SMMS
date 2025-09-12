import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';
import { Exam, Student, Mark, StudentExamData, SchoolDetails } from '../types';
import Card from '../components/Card';
import { useAppData } from '../hooks/useAppData';
import { generatePdfFromComponent } from '../utils/pdfGenerator';
import ProgressCard from '../components/ProgressCard';
import { ProgressCardIcon } from '../components/icons';

const inputStyle = "p-1 w-full bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-xs transition-colors";
const labelStyle = "block text-xs font-medium text-foreground/80 mb-1";
const buttonStyle = "py-2 px-4 rounded-md text-sm font-semibold transition-colors";

const ExamMarks: React.FC = () => {
    const { examId } = useParams<{ examId: string }>();
    const navigate = useNavigate();
    const numericExamId = Number(examId);
    const { schoolDetails } = useAppData();

    const [selectedStudentId, setSelectedStudentId] = useState<string>('');
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [newMark, setNewMark] = useState<Partial<Mark>>({ subject: '' });
    const [studentExamData, setStudentExamData] = useState<Partial<StudentExamData>>({});

    const exam = useLiveQuery(() => db.exams.get(numericExamId), [numericExamId]);
    const students = useLiveQuery(() => exam ? db.students.where('className').equals(exam.className).sortBy('rollNo') : [], [exam]);
    const marks = useLiveQuery(() => db.marks.where({ examId: numericExamId, studentId: Number(selectedStudentId) }).toArray(), [numericExamId, selectedStudentId]);
    
    const studentExamDataFromDb = useLiveQuery(() => db.studentExamData.where({ examId: numericExamId, studentId: Number(selectedStudentId) }).first(), [numericExamId, selectedStudentId]);

    useEffect(() => {
        if (students && students.length > 0 && !selectedStudentId) {
            setSelectedStudentId(String(students[0].id));
        }
    }, [students, selectedStudentId]);

    useEffect(() => {
        setStudentExamData(studentExamDataFromDb || { proficiencyLevel: '', remarks: '' });
    }, [studentExamDataFromDb]);
    
    const handleStudentExamDataChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) => {
        setStudentExamData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const saveStudentExamData = useCallback(async () => {
        if (!selectedStudentId) return;
        const dataToSave: StudentExamData = {
            ...studentExamData,
            examId: numericExamId,
            studentId: Number(selectedStudentId),
        };
        await db.studentExamData.put(dataToSave);
    }, [studentExamData, numericExamId, selectedStudentId]);

    const handleNewMarkChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        // @ts-ignore
        setNewMark({ ...newMark, [name]: value === '' ? undefined : (name === 'subject' ? value : Number(value)) });
    };

    const handleAddMark = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStudentId || !newMark.subject?.trim()) {
            alert('Please provide a subject.');
            return;
        }
        await db.marks.put({
            examId: numericExamId,
            studentId: Number(selectedStudentId),
            ...newMark
        } as Mark);
        setNewMark({ subject: '' });
    };

    const handleDeleteMark = async (markId: number) => {
        if (window.confirm('Are you sure you want to delete this mark entry?')) {
            await db.marks.delete(markId);
        }
    };

    const handleGenerateProgressCard = async () => {
        const student = students?.find(s => s.id === Number(selectedStudentId));
        if (!student || !marks || !schoolDetails) {
            alert("Missing data to generate card.");
            return;
        }
        setIsGeneratingPdf(true);
        await generatePdfFromComponent(
            <ProgressCard 
                student={student} 
                marks={marks} 
                schoolDetails={schoolDetails as SchoolDetails}
                studentExamData={studentExamData as StudentExamData}
                examName={exam?.name || 'Progress Report'}
            />,
            `Progress-Card-${student.admissionNo}`
        );
        setIsGeneratingPdf(false);
    };

    if (!exam || !students) return <div>Loading...</div>;
    const selectedStudent = students.find(s => s.id === Number(selectedStudentId));

    return (
        <div className="h-full flex flex-col gap-2 animate-fade-in">
             <button onClick={() => navigate('/exams')} className="text-sm text-primary hover:underline self-start">&larr; Back to exams</button>
            <div className="flex-shrink-0 grid grid-cols-2 gap-2">
                 <select value={selectedStudentId} onChange={e => setSelectedStudentId(e.target.value)} className={`${inputStyle} w-full text-sm col-span-2`}>
                     {students.map(s => <option key={s.id} value={s.id}>{s.rollNo}. {s.name}</option>)}
                 </select>
                 <button onClick={handleGenerateProgressCard} disabled={isGeneratingPdf} className="flex items-center justify-center gap-2 col-span-2 py-2 px-3 rounded-md text-xs font-semibold transition-colors bg-green-600 text-white hover:bg-green-700 disabled:opacity-50">
                    <ProgressCardIcon className="w-4 h-4" />
                    {isGeneratingPdf ? 'Generating...' : 'Download Progress Card'}
                 </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <Card className="p-2">
                    <label className={labelStyle}>Proficiency</label>
                    <select name="proficiencyLevel" value={studentExamData.proficiencyLevel || ''} onChange={handleStudentExamDataChange} onBlur={saveStudentExamData} className={inputStyle}>
                        <option value="">-- Select --</option>
                        <option value="Stream">Stream</option>
                        <option value="Mountain">Mountain</option>
                        <option value="Sky">Sky</option>
                    </select>
                </Card>
                 <Card className="p-2">
                     <label className={labelStyle}>Remarks</label>
                     <textarea name="remarks" value={studentExamData.remarks || ''} onChange={handleStudentExamDataChange} onBlur={saveStudentExamData} rows={1} className={`${inputStyle} resize-none`} />
                </Card>
            </div>
            
             <Card className="p-2">
                <h2 className="text-sm font-semibold mb-1">Add Subject Marks</h2>
                <form onSubmit={handleAddMark} className="space-y-1">
                    <input name="subject" value={newMark.subject || ''} onChange={handleNewMarkChange} placeholder="Subject Name" className={inputStyle} required/>
                    <div className="grid grid-cols-4 gap-1">
                        <input name="fa1" type="number" value={newMark.fa1 ?? ''} onChange={handleNewMarkChange} placeholder="FA1" className={inputStyle}/>
                        <input name="fa2" type="number" value={newMark.fa2 ?? ''} onChange={handleNewMarkChange} placeholder="FA2" className={inputStyle}/>
                        <input name="fa3" type="number" value={newMark.fa3 ?? ''} onChange={handleNewMarkChange} placeholder="FA3" className={inputStyle}/>
                        <input name="fa4" type="number" value={newMark.fa4 ?? ''} onChange={handleNewMarkChange} placeholder="FA4" className={inputStyle}/>
                        <input name="fa5" type="number" value={newMark.fa5 ?? ''} onChange={handleNewMarkChange} placeholder="FA5" className={inputStyle}/>
                        <input name="fa6" type="number" value={newMark.fa6 ?? ''} onChange={handleNewMarkChange} placeholder="FA6" className={inputStyle}/>
                        <input name="coCurricular" type="number" value={newMark.coCurricular ?? ''} onChange={handleNewMarkChange} placeholder="CCA" className={inputStyle}/>
                        <input name="summative" type="number" value={newMark.summative ?? ''} onChange={handleNewMarkChange} placeholder="SA" className={inputStyle}/>
                    </div>
                    <button type="submit" className="w-full mt-1 py-2 px-3 rounded-md text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary-hover">Add/Update Subject</button>
                </form>
            </Card>
            
            <div className="flex-1 overflow-y-auto">
                {marks && marks.length > 0 ? (
                    <div className="text-[10px] space-y-1">
                        {marks.map(mark => (
                           <Card key={mark.id} className="p-1.5">
                               <div className="flex items-center justify-between">
                                   <p className="font-bold text-xs">{mark.subject}</p>
                                   <div>
                                       <button onClick={() => setNewMark(mark)} className="text-primary font-semibold px-1">Edit</button>
                                       <button onClick={() => handleDeleteMark(mark.id!)} className="text-red-500 font-semibold px-1">Del</button>
                                   </div>
                               </div>
                                <div className="grid grid-cols-4 gap-x-2 gap-y-1 mt-1 text-center">
                                    <span>FA1: {mark.fa1 ?? '-'}</span>
                                    <span>FA2: {mark.fa2 ?? '-'}</span>
                                    <span>FA3: {mark.fa3 ?? '-'}</span>
                                    <span>FA4: {mark.fa4 ?? '-'}</span>
                                    <span>FA5: {mark.fa5 ?? '-'}</span>
                                    <span>FA6: {mark.fa6 ?? '-'}</span>
                                    <span className="font-semibold">CCA: {mark.coCurricular ?? '-'}</span>
                                    <span className="font-semibold">SA: {mark.summative ?? '-'}</span>
                               </div>
                           </Card>
                       ))}
                   </div>
                ) : (
                    <p className="text-center text-xs text-foreground/60 p-4">No marks entered for {selectedStudent?.name || 'this student'} yet.</p>
                )}
            </div>
        </div>
    );
};

export default ExamMarks;