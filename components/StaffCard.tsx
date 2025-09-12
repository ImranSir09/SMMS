import React from 'react';
import { Staff } from '../types';
import { IdCardIcon } from './icons';
import Card from './Card';

interface StaffCardProps {
    staffMember: Staff;
    onEdit: (staffMember: Staff) => void;
    onDelete: (id: number) => void;
    onGenerateId: (staffMember: Staff) => void;
    isPdfGenerating: boolean;
}

const StaffCard: React.FC<StaffCardProps> = ({ staffMember, onEdit, onDelete, onGenerateId, isPdfGenerating }) => {
    return (
        <Card className="p-2 flex flex-col items-center justify-center text-center">
            {staffMember.photo ? (
                <img src={staffMember.photo} alt={staffMember.name} className="w-10 h-10 rounded-full object-cover border-2 border-border"/>
            ) : (
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0"></div>
            )}
            <p className="font-bold text-xs mt-1 truncate w-full">{staffMember.name}</p>
            <p className="text-[10px] text-foreground/70 truncate w-full">{staffMember.designation}</p>
            <div className="mt-1 flex justify-center items-center gap-2">
                 <button onClick={() => onGenerateId(staffMember)} disabled={isPdfGenerating} className="disabled:opacity-50">
                    <IdCardIcon className="w-4 h-4 text-blue-500"/>
                </button>
                <button onClick={() => onEdit(staffMember)} className="text-[10px] font-semibold text-primary">Edit</button>
                <button onClick={() => onDelete(staffMember.id!)} className="text-[10px] font-semibold text-red-500">Del</button>
            </div>
        </Card>
    );
};

export default StaffCard;