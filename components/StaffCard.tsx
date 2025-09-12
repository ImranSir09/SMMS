import React from 'react';
import { Staff } from '../types';
import { EditIcon, TrashIcon, IdCardIcon } from './icons';

interface StaffCardProps {
    staffMember: Staff;
    isPdfGenerating: boolean;
    onEdit: (staff: Staff) => void;
    onDelete: (id: number) => void;
    onGenerateId: (staff: Staff) => void;
}

const StaffCard: React.FC<StaffCardProps> = ({ staffMember, isPdfGenerating, onEdit, onDelete, onGenerateId }) => {
    return (
        <div className="bg-card text-card-foreground p-2 rounded-lg flex items-center gap-2 border border-border shadow-sm">
            {staffMember.photo ? (
                <img src={staffMember.photo} alt={staffMember.name} className="w-12 h-16 rounded-md object-cover flex-shrink-0" />
            ) : (
                <div className="w-12 h-16 rounded-md bg-gray-200 dark:bg-gray-700 flex-shrink-0"></div>
            )}
            <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{staffMember.name}</p>
                <p className="text-xs text-foreground/70">{staffMember.designation}</p>
                <p className="text-xs text-foreground/70">ID: {staffMember.staffId}</p>
            </div>
             <div className="flex flex-col gap-1">
                <button onClick={() => onEdit(staffMember)} className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10"><EditIcon className="w-3 h-3" /></button>
                <button onClick={() => onGenerateId(staffMember)} disabled={isPdfGenerating} className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-50"><IdCardIcon className="w-3 h-3" /></button>
                <button onClick={() => onDelete(staffMember.id!)} className="p-1.5 rounded-full text-red-500 hover:bg-red-500/10"><TrashIcon className="w-3 h-3" /></button>
            </div>
        </div>
    );
};

export default StaffCard;