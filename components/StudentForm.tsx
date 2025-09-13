import React, { useState, useEffect } from 'react';
import { Student } from '../types';

const CLASS_OPTIONS = ['PP1', 'PP2', 'Balvatika', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];
const CATEGORY_OPTIONS = ['General', 'SC', 'ST', 'OBC', 'Other'];

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

    const handleSaveClick = () => {
        if (!formData.name || !formData.rollNo || !formData.admissionNo || !formData.className || !formData.section || !formData.dob || !formData.fathersName) {
            alert('Please fill all required fields.');
            return;
        }
        onSave(formData as Student);
    };

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 space-y-4 flex-1">
                <div className="grid grid-cols-2 gap-4">
                   <div className="col-span-2">
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
                        <label htmlFor="dob" className={labelStyle}>D.O.B</label>
                        <input id="dob" name="dob" type="date" value={formData.dob || ''} onChange={handleChange} className={inputStyle} />
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
                   </div>
                   <div>
                       <label htmlFor="section" className={labelStyle}>Section</label>
                       <input id="section" name="section" value={formData.section || ''} onChange={handleChange} className={inputStyle} />
                   </div>
                   <div>
                       <label htmlFor="fathersName" className={labelStyle}>Father's Name</label>
                       <input id="fathersName" name="fathersName" value={formData.fathersName || ''} onChange={handleChange} className={inputStyle} />
                   </div>
                   <div>
                       <label htmlFor="mothersName" className={labelStyle}>Mother's Name</label>
                       <input id="mothersName" name="mothersName" value={formData.mothersName || ''} onChange={handleChange} className={inputStyle} />
                   </div>
                   <div className="col-span-2">
                       <label htmlFor="address" className={labelStyle}>Address</label>
                       <input id="address" name="address" value={formData.address || ''} onChange={handleChange} className={inputStyle} />
                   </div>
                </div>
            </div>
            <footer className="flex-shrink-0 flex items-center justify-end p-4 border-t border-border gap-2 bg-card">
                <button type="button" onClick={onClose} className={secondaryButtonStyle}>Cancel</button>
                <button type="button" onClick={handleSaveClick} className={successButtonStyle}>Save</button>
            </footer>
        </div>
    );
};

export default StudentForm;