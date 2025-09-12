import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { Exam } from '../types';
import Card from '../components/Card';
import Wizard, { WizardStepProps } from '../components/Wizard';
import { ClipboardListIcon, ExamsIcon } from '../components/icons';

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
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Examination Management</h1>
                <button onClick={() => setIsWizardOpen(true)} className="py-2 px-4 rounded-md bg-primary text-primary-foreground hover:bg-primary-hover text-sm font-semibold transition-colors">Create New Exam</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {exams?.map(exam => (
                    <Card key={exam.id} className="p-4 flex flex-col justify-between hover-lift">
                       <div>
                         <h3 className="text-lg font-semibold text-primary">{exam.name}</h3>
                         <p className="text-foreground/80">Class: {exam.className}</p>
                       </div>
                       <div className="mt-4 flex justify-between items-center">
                            <button onClick={() => navigate(`/exams/${exam.id}`)} className="flex items-center gap-2 py-2 px-3 rounded-md bg-green-600 hover:bg-green-700 text-white text-xs font-semibold transition-colors">
                                <ClipboardListIcon className="w-4 h-4" />
                                Manage Marks
                            </button>
                            <button onClick={() => handleDeleteExam(exam.id!)} className="text-sm text-red-500 hover:underline font-semibold">Delete</button>
                       </div>
                    </Card>
                ))}
            </div>

             {(!exams || exams.length === 0) && (
                <div className="text-center p-10 border-2 border-dashed border-border rounded-lg mt-6">
                    <div className="flex justify-center mb-4">
                        <ExamsIcon className="w-12 h-12 text-foreground/20" />
                    </div>
                    <h3 className="text-xl font-semibold">No Exams Found</h3>
                    <p className="mt-2 text-foreground/60">
                        Get started by creating your first exam.
                    </p>
                </div>
            )}

            <Wizard
                isOpen={isWizardOpen}
                onClose={() => setIsWizardOpen(false)}
                title="Create New Exam"
                steps={examSteps}
                initialData={{ className: '', name: '' }}
                onSave={handleSaveExam}
            />
        </div>
    );
};

export default Exams;