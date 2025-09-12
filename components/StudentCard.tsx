import React from 'react';
import { Student } from '../types';
import { IdCardIcon, ExamsIcon } from '../components/icons';
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
        <Card className="p-2 flex flex-col items-center justify-center text-center">
            {student.photo ? (
                <img src={student.photo} alt={student.name} className="w-10 h-10 rounded-full object-cover border-2 border-border"/>
            ) : (
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0"></div>
            )}
            <p className="font-bold text-xs mt-1 truncate w-full">{student.name}</p>
            <p className="text-[10px] text-foreground/70">Roll: {student.rollNo}</p>
            <div className="mt-1 flex justify-center items-center gap-2">
                 <button onClick={() => onGenerateId(student)} disabled={isPdfGenerating} className="disabled:opacity-50">
                    <IdCardIcon className="w-4 h-4 text-blue-500"/>
                </button>
                <button onClick={() => onEdit(student)} className="text-[10px] font-semibold text-primary">Edit</button>
                <button onClick={() => onDelete(student.id!)} className="text-[10px] font-semibold text-red-500">Del</button>
            </div>
        </Card>
    );
};

export default StudentCard;