import React, { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';
import { Staff } from '../types';
import { StaffIcon } from '../components/icons';
import SlideOutPanel from '../components/SlideOutPanel';
import StaffForm from '../components/StaffForm';
import { useAppData } from '../hooks/useAppData';
import { generatePdfFromComponent } from '../utils/pdfGenerator';
import StaffIdCard from '../components/StaffIdCard';
import StaffCard from '../components/StaffCard';

const buttonStyle = "py-2 px-4 rounded-md text-sm font-semibold transition-colors";
const accentButtonStyle = `${buttonStyle} bg-accent text-accent-foreground hover:bg-accent-hover`;

const Staff: React.FC = () => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState<Partial<Staff> | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isGeneratingPdf, setIsGeneratingPdf] = useState<number | null>(null);
    
    const { schoolDetails } = useAppData();
    const staff = useLiveQuery(() => db.staff.toArray(), []);

    const filteredStaff = useMemo(() => {
        if (!staff) return [];
        return staff.filter(member =>
            member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.staffId.includes(searchTerm) ||
            member.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.subjects.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [staff, searchTerm]);
    
    const handleGenerateIdCard = async (staffMember: Staff) => {
        if (!schoolDetails || !staffMember.id) return;
        setIsGeneratingPdf(staffMember.id);
        await generatePdfFromComponent(
            <StaffIdCard staff={staffMember} schoolDetails={schoolDetails} />,
            `ID-Card-${staffMember.staffId}-${staffMember.name}`
        );
        setIsGeneratingPdf(null);
    };

    const handleAdd = () => {
        setEditingStaff({ photo: null, teachingAssignments: [] });
        setIsFormOpen(true);
    };

    const handleEdit = (staffMember: Staff) => {
        setEditingStaff(staffMember);
        setIsFormOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this staff member? This action cannot be undone.')) {
            await db.staff.delete(id);
        }
    };
    
    const handleSave = async (staffMember: Staff) => {
        const staffToSave = { ...staffMember, teachingAssignments: staffMember.teachingAssignments || [] };
        if (staffToSave.id) {
            await db.staff.update(staffToSave.id, staffToSave);
        } else {
            await db.staff.add(staffToSave);
        }
        handleCloseForm();
    };

     const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingStaff(null);
    }

    return (
        <div className="animate-fade-in">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <h1 className="text-2xl font-bold">Staff Database</h1>
                <button onClick={handleAdd} className={accentButtonStyle}>Add Staff Member</button>
            </div>
            
            <input
                type="text"
                placeholder="Search by name, ID, designation, subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 mb-6 bg-background border border-input rounded-md"
            />

            {staff && staff.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredStaff.map(member => (
                       <StaffCard
                            key={member.id}
                            staffMember={member}
                            isPdfGenerating={isGeneratingPdf === member.id}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onGenerateId={handleGenerateIdCard}
                       />
                    ))}
                     {filteredStaff.length === 0 && <p className="text-center p-6 text-foreground/60 col-span-full">No staff members found matching your search.</p>}
                </div>
            ) : (
                <div className="text-center p-10 border-2 border-dashed border-border rounded-lg mt-6">
                    <div className="flex justify-center mb-4">
                        <StaffIcon className="w-12 h-12 text-foreground/20" />
                    </div>
                    <h3 className="text-xl font-semibold">No Staff Found</h3>
                    <p className="mt-2 text-foreground/60">
                        Add your first staff member to the database to get started.
                    </p>
                    <button onClick={handleAdd} className={`${accentButtonStyle} mt-4`}>
                        Add First Staff Member
                    </button>
                </div>
            )}
            
            {editingStaff && (
                <SlideOutPanel
                    isOpen={isFormOpen}
                    onClose={handleCloseForm}
                    title={editingStaff.id ? 'Edit Staff Member' : 'Add New Staff Member'}
                >
                    <StaffForm
                        staffToEdit={editingStaff}
                        onSave={handleSave}
                        onClose={handleCloseForm}
                    />
                </SlideOutPanel>
            )}
        </div>
    );
};

export default Staff;