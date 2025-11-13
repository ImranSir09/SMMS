

import React, { useState, useMemo, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate, useLocation } from 'react-router-dom';
import { db } from '../services/db';
import { Student, StudentSessionInfo } from '../types';
import Card from '../components/Card';
import { SearchIcon, BonafideIcon, CertificateIcon, SchoolIcon } from '../components/icons';
import { useAppData } from '../hooks/useAppData';

const Certificates: React.FC = () => {
    const { state } = useLocation();
    const searchId = state?.searchId;
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const navigate = useNavigate();
    const { activeSession } = useAppData();

    const students = useLiveQuery(async () => {
        if (!activeSession) return [];
        const sessionInfos: StudentSessionInfo[] = await db.studentSessionInfo.where({ session: activeSession }).toArray();
        const studentIds = sessionInfos.map(s => s.studentId);
        const studentDetails = await db.students.where('id').anyOf(studentIds).toArray();
        const sessionInfoMap = new Map(sessionInfos.map(info => [info.studentId, info]));
        
        return studentDetails.map(student => ({
            ...student,
            className: sessionInfoMap.get(student.id!)?.className,
            section: sessionInfoMap.get(student.id!)?.section,
            rollNo: sessionInfoMap.get(student.id!)?.rollNo,
        }));
    }, [activeSession], []);
    
    const handleSelectStudent = (student: Student) => {
        setSelectedStudent(student);
        setSearchTerm('');
    };

    useEffect(() => {
        if (searchId && students) {
            const studentToSelect = students.find(s => s.admissionNo === searchId);
            if (studentToSelect) {
                handleSelectStudent(studentToSelect);
            }
        }
    }, [searchId, students]);


    const filteredStudents = useMemo(() => {
        if (!searchTerm) return [];
        if (!students) return [];
        const lowercasedTerm = searchTerm.toLowerCase();
        return students.filter(student =>
            student.name.toLowerCase().includes(lowercasedTerm) ||
            student.admissionNo.includes(searchTerm) ||
            student.fathersName.toLowerCase().includes(lowercasedTerm) ||
            (student.dob || '').includes(searchTerm) ||
            (student.contact || '').includes(searchTerm)
        ).slice(0, 5); // Limit results for performance
    }, [students, searchTerm]);
    
    const handleGenerateCertificate = (type: 'dob' | 'bonafide' | 'leaving' | 'admission') => {
        if (!selectedStudent) return;
        
        const routeMap: { [key: string]: string } = {
            dob: `/print/certificate/dob`,
            bonafide: `/print/certificate/bonafide`
        };

        if (routeMap[type]) {
            navigate(routeMap[type], { state: { studentId: selectedStudent.id } });
        } else {
            alert('This certificate is not available for printing yet.');
        }
    };

    return (
        <div className="flex flex-col gap-4 animate-fade-in">
            <div className="relative">
                <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/50" />
                <input
                    type="text"
                    placeholder="Search Student by Name or Admission No..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="p-3 pl-10 text-sm bg-background border border-input rounded-md w-full"
                />
                {searchTerm && (
                    <div className="absolute top-full mt-1 w-full bg-card border border-border rounded-lg shadow-lg z-10">
                        {filteredStudents?.length > 0 ? (
                            filteredStudents.map(student => (
                                <div key={student.id} onClick={() => handleSelectStudent(student)} className="p-3 cursor-pointer hover:bg-primary/10">
                                    <p className="font-semibold">{student.name}</p>
                                    <p className="text-xs text-foreground/70">
                                        S/O: {student.fathersName} | DOB: {student.dob} | Contact: {student.contact}
                                    </p>
                                    <p className="text-xs text-foreground/70">Adm No: {student.admissionNo} | Class: {student.className}</p>
                                </div>
                            ))
                        ) : (
                            <p className="p-3 text-sm text-foreground/60">No students found.</p>
                        )}
                    </div>
                )}
            </div>

            {selectedStudent && (
                <Card className="p-4">
                    <h2 className="text-lg font-bold">Selected Student:</h2>
                    <p className="text-primary font-semibold">{selectedStudent.name}</p>
                    <p className="text-sm text-foreground/80">Class {selectedStudent.className} | Adm No: {selectedStudent.admissionNo}</p>
                    
                    <div className="grid grid-cols-2 gap-3 mt-4">
                        <button onClick={() => handleGenerateCertificate('dob')} className="p-3 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2 text-xs"><CertificateIcon className="w-4 h-4"/> D.O.B Certificate</button>
                        <button onClick={() => handleGenerateCertificate('bonafide')} className="p-3 bg-green-600 text-white rounded-lg flex items-center justify-center gap-2 text-xs"><BonafideIcon className="w-4 h-4"/> Bonafide</button>
                        <button onClick={() => handleGenerateCertificate('leaving')} className="p-3 bg-orange-600 text-white rounded-lg flex items-center justify-center gap-2 text-xs opacity-50" disabled><SchoolIcon className="w-4 h-4"/> School Leaving</button>
                        <button onClick={() => handleGenerateCertificate('admission')} className="p-3 bg-purple-600 text-white rounded-lg flex items-center justify-center gap-2 text-xs opacity-50" disabled><SchoolIcon className="w-4 h-4"/> Admission</button>
                    </div>
                </Card>
            )}

            {!selectedStudent && (
                <div className="text-center p-8 text-foreground/60">
                    <p>Search for a student to generate certificates.</p>
                </div>
            )}
        </div>
    );
};

export default Certificates;