import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { Exam } from '../types';
import Card from '../components/Card';
import { ClipboardListIcon, ExamsIcon } from '../components/icons';
import Modal from '../components/Modal';

const CLASS_OPTIONS = ['PP1', 'PP2', 'Balvatika', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];
const EXAM_OPTIONS = ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'CCA', 'SA', 'Other'];

const inputStyle = "p-2 w-full bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm transition-colors";

const Exams: React.FC = () => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newExamData, setNewExamData] = useState({ name: '', className: '' });
    const [customExamName, setCustomExamName] = useState('');
    const exams = useLiveQuery(() => db.exams.toArray(), []);
    const navigate = useNavigate();
    
    const handleOpenCreateModal = () => {
        setNewExamData({ name: EXAM_OPTIONS[0], className: '' });
        setCustomExamName('');
        setIsCreateModalOpen(true);
    };

    const handleSaveExam = async () => {
        const examNameToSave = newExamData.name === 'Other' ? customExamName.trim() : newExamData.name;

        if (!examNameToSave || !newExamData.className) {
            alert("Please provide an exam name and select a class.");
            return;
        }
        const newId = await db.exams.add({ name: examNameToSave, className: newExamData.className });
        setIsCreateModalOpen(false);
        navigate(`/exams/${newId}`);
    };

    const handleDeleteExam = async (id: number) => {
        if(window.confirm('Are you sure you want to delete this exam? This will also delete all associated marks.')) {
            await db.transaction('rw', db.exams, db.marks, db.studentExamData, async () => {
                await db.exams.delete(id);
                await db.marks.where('examId').equals(id).delete();
                await db.studentExamData.where('examId').equals(id).delete();
            });
        }
    }

    return (
        <div className="h-full flex flex-col">
            <button onClick={handleOpenCreateModal} className="w-full mb-3 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary-hover text-sm font-semibold transition-colors">Create New Exam</button>
            
            <div className="flex-1 grid grid-cols-2 gap-3 overflow-y-auto">
                {exams?.map(exam => (
                    <Card key={exam.id} className="p-3 flex flex-col justify-between">
                       <div>
                         <h3 className="text-md font-semibold text-primary truncate">{exam.name}</h3>
                         <p className="text-foreground/80 text-xs">Class: {exam.className}</p>
                       </div>
                       <div className="mt-3 flex justify-between items-center">
                            <button onClick={() => navigate(`/exams/${exam.id}`)} className="flex items-center gap-1 py-1 px-2 rounded-md bg-green-600 hover:bg-green-700 text-white text-[10px] font-semibold transition-colors">
                                <ClipboardListIcon className="w-3 h-3" />
                                Marks
                            </button>
                            <button onClick={() => handleDeleteExam(exam.id!)} className="text-[10px] text-red-500 hover:underline font-semibold">Delete</button>
                       </div>
                    </Card>
                ))}
            </div>

             {(!exams || exams.length === 0) && (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4 border-2 border-dashed border-border rounded-lg">
                    <ExamsIcon className="w-10 h-10 text-foreground/20" />
                    <h3 className="text-md font-semibold mt-2">No Exams Found</h3>
                    <p className="mt-1 text-xs text-foreground/60">
                        Tap the button above to create one.
                    </p>
                </div>
            )}

            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Create New Exam"
            >
                <div className="p-4 space-y-4">
                    <select
                        name="name"
                        value={newExamData.name}
                        onChange={(e) => setNewExamData({...newExamData, name: e.target.value})}
                        required
                        className={inputStyle}
                    >
                        {EXAM_OPTIONS.map(opt => <option key={opt} value={opt}>{opt === 'Other' ? 'Other...' : opt}</option>)}
                    </select>

                    {newExamData.name === 'Other' && (
                        <input
                            type="text"
                            value={customExamName}
                            onChange={(e) => setCustomExamName(e.target.value)}
                            placeholder="Enter Custom Exam Name"
                            required
                            className={`${inputStyle} animate-fade-in`}
                        />
                    )}

                    <select
                        name="className"
                        value={newExamData.className}
                        onChange={(e) => setNewExamData({...newExamData, className: e.target.value})}
                        required
                        className={inputStyle}
                    >
                        <option value="" disabled>-- Select Class --</option>
                        {CLASS_OPTIONS.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                    </select>
                     <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={() => setIsCreateModalOpen(false)} className="py-2 px-4 rounded-md bg-gray-500/80 hover:bg-gray-500 text-white text-sm">Cancel</button>
                        <button type="button" onClick={handleSaveExam} className="py-2 px-4 rounded-md bg-success text-success-foreground hover:bg-success-hover text-sm">Create & Open</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Exams;