import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { Exam } from '../types';
import Card from '../components/Card';
import Wizard, { WizardStepProps } from '../components/Wizard';
import { ClipboardListIcon, ExamsIcon } from '../components/icons';
import Modal from '../components/Modal';

const CLASS_OPTIONS = ['PP1', 'PP2', 'Balvatika', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];

const inputStyle = "p-2 w-full bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm transition-colors";

const CreateExamStep: React.FC<WizardStepProps> = ({ data, setData }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setData({ ...data, [e.target.name]: e.target.value });
    };
    
    return (
        <div className="space-y-4">
            <input
                name="name"
                type="text"
                value={data.name || ''}
                onChange={handleChange}
                placeholder="Exam Name (e.g., Mid-Term)"
                required
                className={inputStyle}
            />
            <select
                name="className"
                value={data.className || ''}
                onChange={handleChange}
                required
                className={inputStyle}
            >
                <option value="" disabled>-- Select Class --</option>
                {CLASS_OPTIONS.map(cls => <option key={cls} value={cls}>{cls}</option>)}
            </select>
        </div>
    );
};

const Exams: React.FC = () => {
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const exams = useLiveQuery(() => db.exams.toArray(), []);
    const navigate = useNavigate();
    
    const examSteps = [
        { title: 'Exam Details', content: CreateExamStep }
    ];

    const handleSaveExam = async (exam: Omit<Exam, 'id'>) => {
        const newId = await db.exams.add(exam as Exam);
        setIsWizardOpen(false);
        navigate(`/exams/${newId}`);
    };

    const handleDeleteExam = async (id: number) => {
        if(window.confirm('Are you sure you want to delete this exam? This will also delete all associated marks.')) {
            await db.transaction('rw', db.exams, db.marks, async () => {
                await db.exams.delete(id);
                await db.marks.where('examId').equals(id).delete();
            });
        }
    }

    return (
        <div className="h-full flex flex-col">
            <button onClick={() => setIsWizardOpen(true)} className="w-full mb-3 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary-hover text-sm font-semibold transition-colors">Create New Exam</button>
            
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

            {isWizardOpen && (
                <Modal
                    isOpen={isWizardOpen}
                    onClose={() => setIsWizardOpen(false)}
                    title="Create New Exam"
                >
                    <div className="p-4">
                        <CreateExamStep data={{ className: '', name: '' }} setData={() => {}} />
                        <p className="text-xs text-foreground/60 mt-4">Wizard functionality disabled in this view. Use modal form.</p>
                        <button onClick={() => handleSaveExam({name: 'New Exam', className: '1st'})} className="mt-4 py-2 px-4 rounded-md bg-green-600 text-white">Save (Temp)</button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default Exams;