

import React, { useState, useMemo, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';
import { Staff } from '../types';
import { StaffIcon } from '../components/icons';
import Modal from '../components/Modal';
import StaffForm from '../components/StaffForm';
import { useNavigate } from 'react-router-dom';
import StaffCard from '../components/StaffCard';

const buttonStyle = "py-2 px-3 rounded-md text-xs font-semibold transition-colors";
const accentButtonStyle = `${buttonStyle} bg-accent text-accent-foreground hover:bg-accent-hover`;

const STAFF_PER_PAGE = 8;

const Staff: React.FC = () => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState<Partial<Staff> | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    
    const staff = useLiveQuery(() => db.staff.toArray(), []);
    const navigate = useNavigate();

    const filteredStaff = useMemo(() => {
        if (!staff) return [];
        return staff.filter(member =>
            member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.designation.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [staff, searchTerm]);

    const totalPages = Math.ceil((filteredStaff?.length || 0) / STAFF_PER_PAGE);
    const paginatedStaff = useMemo(() => {
        if (!filteredStaff) return [];
        const startIndex = (currentPage - 1) * STAFF_PER_PAGE;
        return filteredStaff.slice(startIndex, startIndex + STAFF_PER_PAGE);
    }, [filteredStaff, currentPage]);
    
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const handleAdd = () => {
        setEditingStaff({ photo: null, teachingAssignments: [] });
        setIsFormOpen(true);
    };
    
    const handleSave = async (staffMember: Staff) => {
        const existingStaff = await db.staff.where('staffId').equals(staffMember.staffId).first();
        if (existingStaff && existingStaff.id !== staffMember.id) {
            alert(`Staff ID '${staffMember.staffId}' is already taken.`);
            return;
        }

        const staffToSave = { ...staffMember, teachingAssignments: staffMember.teachingAssignments || [] };
        // FIX: Replaced the conditional add/update logic with `db.staff.put`.
        // `put` handles both creating new records and updating existing ones, simplifying the code.
        // This also resolves a latent TypeScript error similar to the one in StaffProfile,
        // caused by Dexie's `update` typings with nested arrays.
        await db.staff.put(staffToSave);
        handleCloseForm();
    };

     const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingStaff(null);
    }

    const handleCardClick = (staffId: number) => {
        navigate(`/staff/${staffId}`);
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex-shrink-0 flex items-center gap-2 mb-2">
                <input
                    type="text"
                    placeholder="Search by name, designation..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="p-2 text-sm bg-background border border-input rounded-md w-full"
                />
                <button onClick={handleAdd} className={accentButtonStyle}>Add</button>
            </div>

            <div className="flex-1 grid grid-cols-2 grid-rows-4 gap-2">
                {paginatedStaff.map(member => (
                   <StaffCard
                        key={member.id}
                        staffMember={member}
                        onClick={() => handleCardClick(member.id!)}
                   />
                ))}
            </div>

            {(paginatedStaff.length === 0 && staff && staff.length > 0) && (
                <div className="flex-1 flex items-center justify-center text-center">
                    <p className="text-sm text-foreground/60">No staff found matching search.</p>
                </div>
            )}
            
            {(!staff || staff.length === 0) && (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4 border-2 border-dashed border-border rounded-lg">
                    <StaffIcon className="w-10 h-10 text-foreground/20" />
                    <h3 className="text-md font-semibold mt-2">No Staff Added</h3>
                    <p className="mt-1 text-xs text-foreground/60">
                        Add your first staff member.
                    </p>
                </div>
            )}
            
            <div className="flex-shrink-0 flex items-center justify-center gap-4 pt-2 text-sm">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="font-semibold disabled:opacity-50">Prev</button>
                <span className="text-foreground/80">Page {currentPage} of {totalPages || 1}</span>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="font-semibold disabled:opacity-50">Next</button>
            </div>
            
            <Modal
                isOpen={isFormOpen}
                onClose={handleCloseForm}
                title={editingStaff?.id ? 'Edit Staff Member' : 'Add New Staff Member'}
            >
                <StaffForm
                    staffToEdit={editingStaff!}
                    onSave={handleSave}
                    onClose={handleCloseForm}
                />
            </Modal>
        </div>
    );
};

export default Staff;
