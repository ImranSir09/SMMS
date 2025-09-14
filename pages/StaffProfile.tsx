
import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';
import { Staff } from '../types';
import Card from '../components/Card';
import { EditIcon, TrashIcon, CertificateIcon, BriefcaseIcon } from '../components/icons';
import Modal from '../components/Modal';
import StaffForm from '../components/StaffForm';
import { useToast } from '../contexts/ToastContext';

const buttonStyle = "py-2 px-3 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-colors";

const StaffProfile: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { addToast } = useToast();

    const staffId = useMemo(() => {
        const numId = Number(id);
        return isNaN(numId) ? null : numId;
    }, [id]);
    
    const [isFormOpen, setIsFormOpen] = useState(false);

    const staff = useLiveQuery(() => staffId ? db.staff.get(staffId) : undefined, [staffId]);

    const handleEdit = () => {
        setIsFormOpen(true);
    };

    const handleSave = async (staffData: Staff) => {
        if (staffId) {
            try {
                await db.staff.put(staffData);
                setIsFormOpen(false);
                addToast('Staff details updated successfully!', 'success');
            } catch (error) {
                console.error("Failed to update staff:", error);
                addToast("An error occurred while updating staff details.", 'error');
            }
        }
    };

    const handleDelete = async () => {
        if (staff && staffId && window.confirm(`Are you sure you want to delete ${staff.name}? This action cannot be undone.`)) {
            try {
                await db.staff.delete(staffId);
                navigate('/staff');
                addToast(`${staff.name} was deleted successfully.`, 'success');
            } catch (error) {
                console.error("Failed to delete staff member:", error);
                addToast("An error occurred while deleting the staff member.", 'error');
            }
        }
    };

    if (!staff) {
        return <div className="p-4 text-center">Loading staff profile...</div>;
    }

    return (
        <div className="flex flex-col gap-3 animate-fade-in">
            {/* Profile Header */}
            <Card className="flex-shrink-0 flex items-center gap-3 p-3">
                {staff.photo ? (
                    <img src={staff.photo} alt={staff.name} className="w-16 h-20 object-cover rounded-md border-2 border-border" />
                ) : (
                    <div className="w-16 h-20 rounded-md bg-gray-200 dark:bg-gray-700 flex-shrink-0"></div>
                )}
                <div className="flex-1">
                    <h2 className="text-xl font-bold">{staff.name}</h2>
                    <p className="text-sm text-foreground/80">{staff.designation}</p>
                </div>
            </Card>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-2">
                <button onClick={handleEdit} className={`${buttonStyle} bg-blue-600 text-white`}><EditIcon className="w-3 h-3" /> Edit</button>
                <button onClick={() => navigate('/certificates', { state: { searchId: staff.staffId, searchType: 'staff' } })} className={`${buttonStyle} bg-green-600 text-white`}><CertificateIcon className="w-3 h-3" /> Certificates</button>
                <button onClick={handleDelete} className={`${buttonStyle} bg-red-600 text-white`}><TrashIcon className="w-3 h-3" /> Delete</button>
            </div>

            <Card className="p-3">
                <div className="flex items-center gap-1.5 font-semibold text-md mb-2 border-b border-border pb-1">
                    <BriefcaseIcon className="w-4 h-4 text-foreground/60" />
                    <h3>Professional Details</h3>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <span><strong className="font-medium text-foreground/70">Staff ID:</strong> {staff.staffId}</span>
                    <span><strong className="font-medium text-foreground/70">CPIS Code:</strong> {staff.cpisCode || 'N/A'}</span>
                    <span><strong className="font-medium text-foreground/70">Qualification:</strong> {staff.qualification}</span>
                    <span><strong className="font-medium text-foreground/70">Joining Date:</strong> {staff.joiningDate}</span>
                    <span><strong className="font-medium text-foreground/70">Contact:</strong> {staff.contact}</span>
                    <span><strong className="font-medium text-foreground/70">Subjects:</strong> {staff.subjects || 'N/A'}</span>
                </div>
            </Card>
            
            <Modal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                title={`Edit ${staff.name}`}
            >
                <StaffForm
                    staffToEdit={staff}
                    onSave={handleSave}
                    onClose={() => setIsFormOpen(false)}
                />
            </Modal>
        </div>
    );
};

export default StaffProfile;