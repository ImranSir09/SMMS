import React, { useState, useEffect } from 'react';
import { Staff } from '../types';
import { CloseIcon, PlusIcon } from './icons';

const CLASS_OPTIONS = ['PP1', 'PP2', 'Balvatika', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];

const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
  
const inputStyle = "p-2 w-full bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm transition-colors";
const labelStyle = "block text-sm font-medium text-foreground/80 mb-1";
const buttonStyle = "py-2 px-4 rounded-md text-sm font-semibold transition-colors";
const successButtonStyle = `${buttonStyle} bg-success text-success-foreground hover:bg-success-hover`;
const secondaryButtonStyle = `${buttonStyle} bg-gray-500/80 hover:bg-gray-500 text-white`;

// Validation Functions
const validateStaffPersonalDetails = (data: Partial<Staff>): { [key: string]: string } => {
    const errors: { [key: string]: string } = {};
    if (!data.name?.trim()) errors.name = "Name is required.";
    if (!data.staffId?.trim()) errors.staffId = "Staff ID is required.";
    if (!data.dob) {
        errors.dob = "Date of Birth is required.";
    } else if (new Date(data.dob) >= new Date()) {
        errors.dob = "Date of Birth must be in the past.";
    }
    return errors;
};

const validateStaffProfessionalDetails = (data: Partial<Staff>): { [key: string]: string } => {
    const errors: { [key: string]: string } = {};
    if (!data.qualification?.trim()) errors.qualification = "Qualification is required.";
    if (!data.designation?.trim()) errors.designation = "Designation is required.";
    if (!data.contact?.trim()) {
        errors.contact = "Contact number is required.";
    } else if (!/^\d{10,}$/.test(data.contact.replace(/\s/g, ''))) {
        errors.contact = "Contact number must be at least 10 digits.";
    }
    if (!data.joiningDate) {
        errors.joiningDate = "Joining Date is required.";
    }
    return errors;
};

interface StaffFormProps {
    staffToEdit: Partial<Staff>;
    onSave: (staff: Staff) => void;
    onClose: () => void;
}

const StaffForm: React.FC<StaffFormProps> = ({ staffToEdit, onSave, onClose }) => {
    const [formData, setFormData] = useState<Partial<Staff>>({ teachingAssignments: [], ...staffToEdit });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    useEffect(() => {
        setFormData({ teachingAssignments: [], ...staffToEdit });
        setPhotoPreview(staffToEdit.photo || null);
        setErrors({});
    }, [staffToEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const base64 = await toBase64(file);
            setFormData({ ...formData, photo: base64 });
            setPhotoPreview(base64);
        }
    };
    
    const handleSaveClick = () => {
        const personalErrors = validateStaffPersonalDetails(formData);
        const professionalErrors = validateStaffProfessionalDetails(formData);
        const allErrors = { ...personalErrors, ...professionalErrors };

        if (Object.keys(allErrors).length > 0) {
            setErrors(allErrors);
            return;
        }
        onSave(formData as Staff);
    };

    const handleAssignmentChange = (index: number, field: 'className' | 'subject', value: string) => {
        const newAssignments = [...(formData.teachingAssignments || [])];
        newAssignments[index] = { ...newAssignments[index], [field]: value };
        setFormData({ ...formData, teachingAssignments: newAssignments });
    };

    const addAssignment = () => {
        const newAssignments = [...(formData.teachingAssignments || []), { className: '', subject: '' }];
        setFormData({ ...formData, teachingAssignments: newAssignments });
    };

    const removeAssignment = (index: number) => {
        const newAssignments = [...(formData.teachingAssignments || [])];
        newAssignments.splice(index, 1);
        setFormData({ ...formData, teachingAssignments: newAssignments });
    };

    return (
        <>
            <main className="flex-1 p-6 overflow-y-auto space-y-6">
                <section>
                    <h3 className="text-md font-semibold text-foreground border-b border-border pb-2 mb-4">Personal & Employment Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <label htmlFor="name" className={labelStyle}>Name</label>
                            <input id="name" name="name" value={formData.name || ''} onChange={handleChange} placeholder="Full Name" required className={inputStyle} />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>
                        <div>
                            <label htmlFor="staffId" className={labelStyle}>Staff ID</label>
                            <input id="staffId" name="staffId" value={formData.staffId || ''} onChange={handleChange} placeholder="Staff ID" required className={inputStyle} />
                            {errors.staffId && <p className="text-red-500 text-xs mt-1">{errors.staffId}</p>}
                        </div>
                        <div>
                            <label htmlFor="cpisCode" className={labelStyle}>CPIS Code (Optional)</label>
                            <input id="cpisCode" name="cpisCode" value={formData.cpisCode || ''} onChange={handleChange} placeholder="CPIS Code" className={inputStyle} />
                        </div>
                        <div>
                            <label htmlFor="dob" className={labelStyle}>Date of Birth</label>
                            <input id="dob" name="dob" type="date" value={formData.dob || ''} onChange={handleChange} required className={inputStyle} />
                            {errors.dob && <p className="text-red-500 text-xs mt-1">{errors.dob}</p>}
                        </div>
                         <div>
                            <label htmlFor="joiningDate" className={labelStyle}>Joining Date</label>
                            <input id="joiningDate" name="joiningDate" type="date" value={formData.joiningDate || ''} onChange={handleChange} required className={inputStyle} />
                            {errors.joiningDate && <p className="text-red-500 text-xs mt-1">{errors.joiningDate}</p>}
                        </div>
                    </div>
                </section>
                
                <section>
                    <h3 className="text-md font-semibold text-foreground border-b border-border pb-2 mb-4">Professional Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <div>
                            <label htmlFor="designation" className={labelStyle}>Designation</label>
                            <input id="designation" name="designation" value={formData.designation || ''} onChange={handleChange} placeholder="e.g., TGT Science" required className={inputStyle} />
                            {errors.designation && <p className="text-red-500 text-xs mt-1">{errors.designation}</p>}
                        </div>
                        <div>
                            <label htmlFor="qualification" className={labelStyle}>Qualification</label>
                            <input id="qualification" name="qualification" value={formData.qualification || ''} onChange={handleChange} placeholder="e.g., M.Sc, B.Ed" required className={inputStyle} />
                            {errors.qualification && <p className="text-red-500 text-xs mt-1">{errors.qualification}</p>}
                        </div>
                        <div>
                            <label htmlFor="contact" className={labelStyle}>Contact No</label>
                            <input id="contact" name="contact" value={formData.contact || ''} onChange={handleChange} placeholder="Contact Number" required className={inputStyle} />
                            {errors.contact && <p className="text-red-500 text-xs mt-1">{errors.contact}</p>}
                        </div>
                         <div>
                            <label htmlFor="subjects" className={labelStyle}>Subjects (comma-separated)</label>
                            <input id="subjects" name="subjects" value={formData.subjects || ''} onChange={handleChange} placeholder="e.g., Physics, Chemistry" className={inputStyle} />
                        </div>
                    </div>
                </section>

                <section>
                    <h3 className="text-md font-semibold text-foreground border-b border-border pb-2 mb-4">Teaching Assignments</h3>
                    <div className="space-y-3">
                        {formData.teachingAssignments?.map((assignment, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 bg-background/50 rounded-md">
                                <select
                                    value={assignment.className}
                                    onChange={(e) => handleAssignmentChange(index, 'className', e.target.value)}
                                    className={inputStyle}
                                >
                                    <option value="">-- Class --</option>
                                    {CLASS_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <input
                                    type="text"
                                    placeholder="Subject"
                                    value={assignment.subject}
                                    onChange={(e) => handleAssignmentChange(index, 'subject', e.target.value)}
                                    className={inputStyle}
                                />
                                <button
                                    type="button"
                                    onClick={() => removeAssignment(index)}
                                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-full"
                                >
                                    <CloseIcon className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                    <button
                        type="button"
                        onClick={addAssignment}
                        className="mt-3 flex items-center gap-2 text-sm text-primary font-semibold"
                    >
                        <PlusIcon className="w-4 h-4" /> Add Assignment
                    </button>
                </section>
                
                 <section>
                    <h3 className="text-md font-semibold text-foreground border-b border-border pb-2 mb-4">Photo</h3>
                    <div className="grid grid-cols-1">
                        <div>
                            <label className={labelStyle}>Staff Photo</label>
                            <input type="file" onChange={handlePhotoChange} accept="image/*" className="block w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-colors"/>
                            {photoPreview && <img src={photoPreview} alt="preview" className="mt-2 w-24 h-24 object-cover rounded-md border border-border"/>}
                        </div>
                    </div>
                </section>
            </main>

            <footer className="flex items-center justify-end p-4 border-t border-border gap-2 flex-shrink-0">
                <button type="button" onClick={onClose} className={secondaryButtonStyle}>Cancel</button>
                <button type="button" onClick={handleSaveClick} className={successButtonStyle}>Save Staff</button>
            </footer>
        </>
    );
};

export default StaffForm;
