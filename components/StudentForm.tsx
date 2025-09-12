import React, { useState, useEffect } from 'react';
import { Student } from '../types';

const CLASS_OPTIONS = ['PP1', 'PP2', 'Balvatika', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];
const CATEGORY_OPTIONS = ['General', 'SC', 'ST', 'OBC', 'Other'];

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

interface StudentFormProps {
    studentToEdit: Partial<Student>;
    onSave: (student: Student) => void;
    onClose: () => void;
}

const StudentForm: React.FC<StudentFormProps> = ({ studentToEdit, onSave, onClose }) => {
    const [formData, setFormData] = useState<Partial<Student>>({});
    
    useEffect(() => {
        setFormData(studentToEdit);
    }, [studentToEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const base64 = await toBase64(file);
            setFormData({ ...formData, photo: base64 });
        }
    };

    const handleSaveClick = () => {
        if (!formData.name || !formData.rollNo || !formData.admissionNo || !formData.className || !formData.section || !formData.dob) {
            alert('Please fill all required fields.');
            return;
        }
        onSave(formData as Student);
    };

    return (
        <>
            <main className="flex-1 p-6 overflow-y-auto space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div className="sm:col-span-2">
                       <label htmlFor="name" className={labelStyle}>Name</label>
                       <input id="name" name="name" value={formData.name || ''} onChange={handleChange} className={inputStyle} />
                   </div>
                    <div>
                        <label htmlFor="rollNo" className={labelStyle}>Roll No</label>
                        <input id="rollNo" name="rollNo" value={formData.rollNo || ''} onChange={handleChange} className={inputStyle} />
                    </div>
                    <div>
                        <label htmlFor="admissionNo" className={labelStyle}>Admission No</label>
                        <input id="admissionNo" name="admissionNo" value={formData.admissionNo || ''} onChange={handleChange} className={inputStyle} />
                    </div>
                    <div>
                        <label htmlFor="dob" className={labelStyle}>Date of Birth</label>
                        <input id="dob" name="dob" type="date" value={formData.dob || ''} onChange={handleChange} className={inputStyle} />
                    </div>
                    <div>
                        <label htmlFor="gender" className={labelStyle}>Gender</label>
                        <select id="gender" name="gender" value={formData.gender || 'Male'} onChange={handleChange} className={inputStyle}>
                            <option>Male</option><option>Female</option><option>Other</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="category" className={labelStyle}>Category</label>
                        <select id="category" name="category" value={formData.category || 'General'} onChange={handleChange} className={inputStyle}>
                            {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="bloodGroup" className={labelStyle}>Blood Group</label>
                        <select id="bloodGroup" name="bloodGroup" value={formData.bloodGroup || ''} onChange={handleChange} className={inputStyle}>
                            <option value="">-- Select --</option>
                            <option>A+</option><option>A-</option><option>B+</option><option>B-</option>
                            <option>AB+</option><option>AB-</option><option>O+</option><option>O-</option>
                        </select>
                    </div>
                     <div>
                        <label htmlFor="admissionDate" className={labelStyle}>Admission Date</label>
                        <input id="admissionDate" name="admissionDate" type="date" value={formData.admissionDate || ''} onChange={handleChange} className={inputStyle} />
                   </div>
                    <div className="sm:col-span-2">
                       <label htmlFor="guardianInfo" className={labelStyle}>Guardian Info</label>
                       <input id="guardianInfo" name="guardianInfo" value={formData.guardianInfo || ''} onChange={handleChange} className={inputStyle} />
                   </div>
                   <div>
                       <label htmlFor="contact" className={labelStyle}>Parent's Contact No</label>
                       <input id="contact" name="contact" value={formData.contact || ''} onChange={handleChange} className={inputStyle} />
                   </div>
                    <div className="sm:col-span-2">
                       <label htmlFor="address" className={labelStyle}>Address</label>
                       <input id="address" name="address" value={formData.address || ''} onChange={handleChange} className={inputStyle} />
                   </div>
                    <div>
                       <label htmlFor="className" className={labelStyle}>Class</label>
                       <select id="className" name="className" value={formData.className || ''} onChange={handleChange} className={inputStyle}>
                           <option value="" disabled>-- Select Class --</option>
                           {CLASS_OPTIONS.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                       </select>
                   </div>
                   <div>
                       <label htmlFor="section" className={labelStyle}>Section</label>
                       <input id="section" name="section" value={formData.section || ''} onChange={handleChange} className={inputStyle} />
                   </div>
                   <div className="sm:col-span-2">
                       <label className={labelStyle}>Photo</label>
                       <input type="file" onChange={handlePhotoChange} accept="image/*" className="block w-full text-sm"/>
                       {formData.photo && <img src={formData.photo} alt="preview" className="mt-2 w-24 h-24 object-cover rounded-md"/>}
                   </div>
                </div>
            </main>
            <footer className="flex items-center justify-end p-4 border-t border-border gap-2 flex-shrink-0">
                <button type="button" onClick={onClose} className={secondaryButtonStyle}>Cancel</button>
                <button type="button" onClick={handleSaveClick} className={successButtonStyle}>Save Student</button>
            </footer>
        </>
    );
};

export default StudentForm;
