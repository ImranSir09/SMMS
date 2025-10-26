
import React from 'react';
import { Student } from '../types';

interface StudentCardProps {
    student: Student;
    onClick: () => void;
}

const StudentCard: React.FC<StudentCardProps> = ({ student, onClick }) => {
    return (
        <div onClick={onClick} className="bg-card text-card-foreground p-3 rounded-lg border border-border shadow-sm cursor-pointer hover-lift">
            <p className="font-bold text-sm truncate">{student.name}</p>
            <p className="text-xs text-foreground/70">Roll: {student.rollNo}</p>
            <p className="text-xs text-foreground/70">Adm: {student.admissionNo}</p>
        </div>
    );
};

export default StudentCard;