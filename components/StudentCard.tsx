
import React from 'react';
import { Student } from '../types';

interface StudentCardProps {
    student: Student;
    onClick: () => void;
}

const StudentCard: React.FC<StudentCardProps> = ({ student, onClick }) => {
    return (
        <div onClick={onClick} className="bg-card text-card-foreground p-2 rounded-lg flex items-center gap-2 border border-border shadow-sm cursor-pointer hover-lift">
            {student.photo ? (
                <img src={student.photo} alt={student.name} className="w-12 h-16 rounded-md object-cover flex-shrink-0" />
            ) : (
                <div className="w-12 h-16 rounded-md bg-gray-200 dark:bg-gray-700 flex-shrink-0"></div>
            )}
            <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{student.name}</p>
                <p className="text-xs text-foreground/70">Roll: {student.rollNo}</p>
                <p className="text-xs text-foreground/70">Adm: {student.admissionNo}</p>
            </div>
        </div>
    );
};

export default StudentCard;