

import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
// FIX: Updated react-router-dom imports from v5 to v6 to resolve export errors. Using useNavigate instead of useHistory.
import { useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { Exam } from '../types';
import Card from '../components/Card';
import { ClipboardListIcon, ExamsIcon, PlusIcon, TrashIcon } from '../components/icons';
import Modal from '../components/Modal';
import { useToast } from '../contexts/ToastContext';
import { CLASS_OPTIONS, EXAM_OPTIONS } from '../constants';

const inputStyle = "p-3 w-full bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm transition-colors";

const Exams: React.FC = () => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newExamData, setNewExamData] = useState({ name: '', className: '' });
    const exams = useLiveQuery(() => db.exams.toArray(), []);
    // FIX: Replaced v5 useHistory with v6 useNavigate.
    const navigate = useNavigate();
    const { addToast } = useToast();
    
    const handleOpenCreateModal = () => {
        setNewExamData({ name: EXAM_OPTIONS[0], className: '' });
        setIsCreateModalOpen(true);
    };

    const handleSaveExam = async () => {
        try {
            const examNameToSave = newExamData.name;
    
            if (!examNameToSave || !newExamData.className) {
                addToast("Please provide an exam name and select a class.", 'error');
                return;
            }
            const newId = await db.exams.add({ name: examNameToSave, className: newExamData.className });
            setIsCreateModalOpen(false);
            addToast('Exam created successfully!', 'success');
            // FIX: Updated navigation call to use navigate() for v6.
            navigate(`/exams/${newId}`);
        } catch (error) {
            console.error("Failed to save exam:", error);
            addToast("An error occurred while creating the exam.", 'error');
        }
    };

    const handleDeleteExam = async (id: number) => {
        if(window.confirm('Are you sure you want to delete this exam? This will also delete all associated marks.')) {
            try {
                await db.transaction('rw', db.exams, db.marks, db.studentExamData, async () => {
                    await db.exams.delete(id);
                    await db.marks.where('examId').equals(id).delete();
                    await db.studentExamData.where('examId').equals(id).delete();
                });
                addToast('Exam and all associated marks deleted.', 'success');
            } catch (error) {
                console.error("Failed to delete exam:", error);
                addToast("An error occurred while deleting the exam.", 'error');
            }
        }
    }

    return (
        <div className="flex flex-col">
            <button onClick={handleOpenCreateModal} className="w-full mb-3 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary-hover text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                <PlusIcon className="w-5 h-5"/>
                Create New Exam
            </button>
            
            <div className="flex-1 grid grid-cols-2 gap-3 overflow-y-auto">
                {exams?.map(exam => (
                    <Card key={exam.id} className="p-3 flex flex-col justify-between">
                       <div>
                         <h3 className="text-md font-semibold text-primary truncate">{exam.name}</h3>
                         <p className="text-foreground/80 text-xs">Class: {exam.className}</p>
                       </div>
                       <div className="mt-3 flex justify-between items-center">
                            {/* FIX: Updated navigation call to use navigate() for v6. */}
                            <button onClick={() => navigate(`/exams/${exam.id}`)} className="flex items-center gap-1 py-2 px-3 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-semibold transition-colors">
                                <ClipboardListIcon className="w-3.5 h-3.5" />
                                Marks
                            </button>
                            <button onClick={() => handleDeleteExam(exam.id!)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-full transition-colors">
                                <TrashIcon className="w-4 h-4" />
                            </button>
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
                        {EXAM_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                    <select
                        name="className"
                        value={newExamData.className}
                        onChange={(e) => setNewExamData({...newExamData, className: e.target.value})}
                        required
                        className={inputStyle}
                    >
                        <option value="">-- Select Class --</option>
                        {CLASS_OPTIONS.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                    </select>
                    <div className="flex justify-end pt-2">
                        <button 
                            onClick={handleSaveExam}
                            className="py-3 px-5 rounded-lg bg-primary text-primary-foreground hover:bg-primary-hover text-sm font-semibold transition-colors"
                        >
                            Create & Go to Marks
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Exams;