import React from 'react';
import { Student } from '../types';
import { UserIcon } from './icons';

interface StudentCardProps {
    student: Student;
    onClick: (id: number) => void;
}

const StudentCard: React.FC<StudentCardProps> = ({ student, onClick }) => {
    const handleClick = () => {
        if (student.id) {
            onClick(student.id);
        }
    };
    
    return (
        <div 
            onClick={handleClick} 
            className="bg-card text-card-foreground p-3 rounded-xl border border-border/50 shadow-sm cursor-pointer hover-lift group flex items-center gap-3"
        >
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-grow overflow-hidden">
                <p className="font-bold text-sm truncate">{student.name}</p>
                <p className="text-xs text-foreground/70">Roll: {student.rollNo} | Adm: {student.admissionNo}</p>
            </div>
        </div>
    );
};

export default React.memo(StudentCard);