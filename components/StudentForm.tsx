
import React, { useState, useEffect } from 'react';
import { Student } from '../types';
import PhotoUploadModal from './PhotoUploadModal';

const CLASS_OPTIONS = ['PP1', 'PP2', 'Balvatika', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];
const CATEGORY_OPTIONS = ['General', 'SC', 'ST', 'OBC', 'Other'];
const BLOOD_GROUP_OPTIONS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const inputStyle = "p-3 w-full bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm transition-colors";
const labelStyle = "block text-sm font-medium text-foreground/80 mb-1";
const buttonStyle = "py-3 px-5 rounded-md text-sm font-semibold transition-colors";
const successButtonStyle = `${buttonStyle} bg-success text-success-foreground hover:bg-success-hover`;
const secondaryButtonStyle = `${buttonStyle} bg-gray-500/80 hover:bg-gray-500 text-white`;

interface StudentFormProps {
    studentToEdit: Partial<Student>;
    onSave: (student: Student) => void;
    onClose: () => void;
}

const validateStudent = (student: Partial<Student>): { [key: string]: string } => {
    const errors: { [key: string]: string } = {};
    if (!student.name?.trim()) errors.name = "Name is required.";
    else if (student.name.trim().length < 3) errors.name = "Name must be at least 3 characters.";

    if (!student.rollNo?.trim()) errors.rollNo = "Roll No is required.";
    if (!student.admissionNo?.trim()) errors.admissionNo = "Admission No is required.";
    
    if (!student.dob) errors.dob = "Date of Birth is required.";
    else if (new Date(student.dob) >= new Date()) errors.dob = "Date of Birth must be in the past.";

    if (!student.className) errors.className = "Class is required.";
    if (!student.section?.trim()) errors.section = "Section is required.";

    if (!student.fathersName?.trim()) errors.fathersName = "Father's Name is required.";
    else if (student.fathersName.trim().length < 3) errors.fathersName = "Name must be at least 3 characters.";
    
    if (!student.mothersName?.trim()) errors.mothersName = "Mother's Name is required.";
    else if (student.mothersName.trim().length < 3) errors.mothersName = "Name must be at least 3 characters.";

    if (!student.contact?.trim()) {
        errors.contact = "Contact number is required.";
    } else if (!/^\d{10}$/.test(student.contact.trim())) {
        errors.contact = "Contact must be exactly 10 digits.";
    }

    if (!student.address?.trim()) errors.address = "Address is required.";

    if (student.aadharNo && !/^\d{12}$/.test(student.aadharNo)) errors.aadharNo = "Aadhar must be 12 digits.";
    if (student.accountNo && !/^\d{9,18}$/.test(student.accountNo)) errors.accountNo = "Account No. must be 9-18 digits.";
    if (student.ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(student.ifscCode.toUpperCase())) errors.ifscCode = "Invalid IFSC code format.";
    
    return errors;
};

const StudentForm: React.FC<StudentFormProps> = ({ studentToEdit, onSave, onClose }) => {
    const [formData, setFormData] = useState<Partial<Student>>({});
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
    
    useEffect(() => {
        setFormData(studentToEdit);
        setErrors({});
    }, [studentToEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };
    
    const handlePhotoSave = (photoBase64: string) => {
        setFormData(prev => ({ ...prev, photo: photoBase64 }));
        setIsPhotoModalOpen(false);
    };

    const handleSaveClick = () => {
        const validationErrors = validateStudent(formData);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        onSave(formData as Student);
    };

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 space-y-4 flex-1">
                <div className="flex items-center gap-4 border-b border-border pb-4">
                    {formData.photo ? (
                        <img src={formData.photo} alt="Student" className="w-24 h-32 object-cover rounded-md border border-border" />
                    ) : (
                        <div className="w-24 h-32 rounded-md bg-background flex items-center justify-center text-xs text-foreground/50 border border-border">No Photo</div>
                    )}
                    <div className="flex flex-col gap-2">
                        <label className={labelStyle}>Student Photo</label>
                        <button type="button" onClick={() => setIsPhotoModalOpen(true)} className={`${secondaryButtonStyle} text-sm`}>
                            Upload / Crop Photo
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="col-span-2">
                       <label htmlFor="name" className={labelStyle}>Name</label>
                       <input id="name" name="name" value={formData.name || ''} onChange={handleChange} className={inputStyle} />
                       {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                   </div>
                    <div>
                        <label htmlFor="rollNo" className={labelStyle}>Roll No</label>
                        <input id="rollNo" name="rollNo" value={formData.rollNo || ''} onChange={handleChange} className={inputStyle} />
                        {errors.rollNo && <p className="text-red-500 text-xs mt-1">{errors.rollNo}</p>}
                    </div>
                    <div>
                        <label htmlFor="admissionNo" className={labelStyle}>Admission No</label>
                        <input id="admissionNo" name="admissionNo" value={formData.admissionNo || ''} onChange={handleChange} className={inputStyle} />
                        {errors.admissionNo && <p className="text-red-500 text-xs mt-1">{errors.admissionNo}</p>}
                    </div>
                    <div>
                        <label htmlFor="dob" className={labelStyle}>D.O.B</label>
                        <input id="dob" name="dob" type="date" value={formData.dob || ''} onChange={handleChange} className={inputStyle} />
                        {errors.dob && <p className="text-red-500 text-xs mt-1">{errors.dob}</p>}
                    </div>
                    <div>
                        <label htmlFor="gender" className={labelStyle}>Gender</label>
                        <select id="gender" name="gender" value={formData.gender || 'Male'} onChange={handleChange} className={inputStyle}>
                            <option>Male</option><option>Female</option><option>Other</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="className" className={labelStyle}>Class</label>
                       <select id="className" name="className" value={formData.className || ''} onChange={handleChange} className={inputStyle}>
                           <option value="">-- Select --</option>
                           {CLASS_OPTIONS.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                       </select>
                       {errors.className && <p className="text-red-500 text-xs mt-1">{errors.className}</p>}
                   </div>
                   <div>
                       <label htmlFor="section" className={labelStyle}>Section</label>
                       <input id="section" name="section" value={formData.section || ''} onChange={handleChange} className={inputStyle} />
                       {errors.section && <p className="text-red-500 text-xs mt-1">{errors.section}</p>}
                   </div>
                   <div className="col-span-2">
                       <label htmlFor="fathersName" className={labelStyle}>Father's Name</label>
                       <input id="fathersName" name="fathersName" value={formData.fathersName || ''} onChange={handleChange} className={inputStyle} />
                       {errors.fathersName && <p className="text-red-500 text-xs mt-1">{errors.fathersName}</p>}
                   </div>
                   <div className="col-span-2">
                       <label htmlFor="mothersName" className={labelStyle}>Mother's Name</label>
                       <input id="mothersName" name="mothersName" value={formData.mothersName || ''} onChange={handleChange} className={inputStyle} />
                       {errors.mothersName && <p className="text-red-500 text-xs mt-1">{errors.mothersName}</p>}
                   </div>
                   <div className="col-span-2">
                       <label htmlFor="contact" className={labelStyle}>Contact</label>
                       <input id="contact" name="contact" value={formData.contact || ''} onChange={handleChange} className={inputStyle} />
                       {errors.contact && <p className="text-red-500 text-xs mt-1">{errors.contact}</p>}
                   </div>
                   <div className="col-span-2">
                       <label htmlFor="address" className={labelStyle}>Address</label>
                       <input id="address" name="address" value={formData.address || ''} onChange={handleChange} className={inputStyle} />
                       {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                   </div>
                </div>
                
                <h3 className="text-md font-semibold text-foreground border-b border-border pb-1 mt-4">Additional Details</h3>
                <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                        <label htmlFor="admissionDate" className={labelStyle}>Admission Date</label>
                        <input id="admissionDate" name="admissionDate" type="date" value={formData.admissionDate || ''} onChange={handleChange} className={inputStyle} />
                    </div>
                    <div>
                        <label htmlFor="category" className={labelStyle}>Category</label>
                        <select id="category" name="category" value={formData.category || ''} onChange={handleChange} className={inputStyle}>
                           <option value="">-- Select --</option>
                           {CATEGORY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                       </select>
                    </div>
                    <div>
                        <label htmlFor="bloodGroup" className={labelStyle}>Blood Group</label>
                        <select id="bloodGroup" name="bloodGroup" value={formData.bloodGroup || ''} onChange={handleChange} className={inputStyle}>
                           <option value="">-- Select --</option>
                           {BLOOD_GROUP_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                       </select>
                    </div>
                    <div className="col-span-2">
                        <label htmlFor="aadharNo" className={labelStyle}>Aadhar No (Optional)</label>
                        <input id="aadharNo" name="aadharNo" value={formData.aadharNo || ''} onChange={handleChange} className={inputStyle} placeholder="12-digit Aadhar Number" />
                        {errors.aadharNo && <p className="text-red-500 text-xs mt-1">{errors.aadharNo}</p>}
                    </div>
                    <div className="col-span-2">
                        <label htmlFor="accountNo" className={labelStyle}>Account No (Optional)</label>
                        <input id="accountNo" name="accountNo" value={formData.accountNo || ''} onChange={handleChange} className={inputStyle} placeholder="Bank Account Number" />
                        {errors.accountNo && <p className="text-red-500 text-xs mt-1">{errors.accountNo}</p>}
                    </div>
                    <div className="col-span-2">
                        <label htmlFor="ifscCode" className={labelStyle}>IFSC Code (Optional)</label>
                        <input id="ifscCode" name="ifscCode" value={formData.ifscCode || ''} onChange={handleChange} className={`${inputStyle} uppercase`} placeholder="Bank IFSC Code" />
                        {errors.ifscCode && <p className="text-red-500 text-xs mt-1">{errors.ifscCode}</p>}
                    </div>
                </div>
            </div>
            <footer className="flex-shrink-0 flex items-center justify-end p-4 border-t border-border gap-2 bg-card">
                <button type="button" onClick={onClose} className={secondaryButtonStyle}>Cancel</button>
                <button type="button" onClick={handleSaveClick} className={successButtonStyle}>Save</button>
            </footer>
            <PhotoUploadModal
                isOpen={isPhotoModalOpen}
                onClose={() => setIsPhotoModalOpen(false)}
                onSave={handlePhotoSave}
                title="Upload Student Photo"
                aspectRatio={4 / 5}
            />
        </div>
    );
};

export default StudentForm;