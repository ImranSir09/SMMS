import React from 'react';
import { Student } from '../types';
import { IdCardIcon } from './icons';
import Card from './Card';

interface StudentCardProps {
    student: Student;
    onEdit: (student: Student) => void;
    onDelete: (id: number) => void;
    onGenerateId: (student: Student) => void;
    isPdfGenerating: boolean;
}

const StudentCard: React.FC<StudentCardProps> = ({ student, onEdit, onDelete, onGenerateId, isPdfGenerating }) => {
    return (
        <Card className="flex flex-col p-4 hover-lift animate-fade-in-item">
            <div className="flex items-start gap-4">
                {student.photo ? (
                    <img src={student.photo} alt={student.name} className="w-16 h-16 rounded-full object-cover border-2 border-border"/>
                ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0"></div>
                )}
                <div className="flex-1 truncate">
                    <p className="font-bold text-md truncate text-primary">{student.name}</p>
                    <p className="text-sm text-foreground/70">Roll: {student.rollNo}</p>
                    <p className="text-xs text-foreground/60">Adm No: {student.admissionNo}</p>
                </div>
            </div>
            <div className="mt-4 pt-3 border-t border-border flex justify-end items-center gap-2">
                 <button 
                    onClick={() => onGenerateId(student)} 
                    disabled={isPdfGenerating} 
                    className="text-blue-600 dark:text-blue-400 hover:underline text-xs font-semibold inline-flex items-center gap-1 disabled:opacity-50"
                >
                    {isPdfGenerating ? '...' : <><IdCardIcon className="w-4 h-4"/> ID Card</>}
                </button>
                <button onClick={() => onEdit(student)} className="text-primary hover:underline text-xs font-semibold">Edit</button>
                <button onClick={() => onDelete(student.id!)} className="text-red-500 hover:underline text-xs font-semibold">Delete</button>
            </div>
        </Card>
    );
};

export default StudentCard;
