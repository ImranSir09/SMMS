
import React from 'react';
import { Staff } from '../types';

interface StaffCardProps {
    staffMember: Staff;
    onClick: () => void;
}

const StaffCard: React.FC<StaffCardProps> = ({ staffMember, onClick }) => {
    return (
        <div onClick={onClick} className="bg-card text-card-foreground p-2 rounded-lg flex items-center gap-2 border border-border shadow-sm cursor-pointer hover-lift">
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
        </div>
    );
};

export default StaffCard;