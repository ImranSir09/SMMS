
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { BarChart3Icon, ClipboardListIcon, EditIcon, ExamsIcon, HolisticIcon } from '../components/icons';
import Modal from '../components/Modal';
import { db } from '../services/db';
import { SUBJECTS } from '../constants';
import { useAppData } from '../hooks/useAppData';
import { StudentSessionInfo } from '../types';

const SbaButton: React.FC<{ title: string; onClick: () => void; icon: React.ReactNode }> = ({ title, onClick, icon }) => (
    <button onClick={onClick} className="w-full bg-card text-card-foreground p-4 rounded-lg flex items-center gap-4 border border-border shadow-sm hover-lift text-left">
        <div className="text-primary">
            {icon}
        </div>
        <span className="font-semibold">{title}</span>
    </button>
);

const inputStyle = "p-3 w-full bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm transition-colors";

const SBA: React.FC = () => {
    const navigate = useNavigate();
    const { activeSession } = useAppData();
    
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

    const [reportType, setReportType] = useState<'Formative' | 'Co-Curricular' | null>(null);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    
    const classOptions = useLiveQuery(async () => {
        if (!activeSession) return [];
        const sessionInfos = await db.studentSessionInfo.where({ session: activeSession }).toArray();
        const classNames = [...new Set(sessionInfos.map(info => info.className))];
        return classNames.sort((a: string, b: string) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
    }, [activeSession]);
    
    const studentsInClass = useLiveQuery(async () => {
        if (!selectedClass || !activeSession) return [];
        
        const sessionInfos: StudentSessionInfo[] = await db.studentSessionInfo.where({ className: selectedClass, session: activeSession }).toArray();
        if (sessionInfos.length === 0) return [];

        const studentIds = sessionInfos.map(info => info.studentId);
        const studentDetails = await db.students.where('id').anyOf(studentIds).toArray();
        const sessionInfoMap = new Map(sessionInfos.map(info => [info.studentId, info]));
        
        const mergedStudents = studentDetails.map(student => ({
            ...student,
            rollNo: sessionInfoMap.get(student.id!)?.rollNo || '',
        }));

        return mergedStudents.sort((a, b) => (a.rollNo || '').localeCompare(b.rollNo || '', undefined, { numeric: true, sensitivity: 'base' }));
    }, [selectedClass, activeSession]);

    useEffect(() => {
        if (classOptions && classOptions.length > 0 && !selectedClass) {
            setSelectedClass(classOptions[0]);
        }
    }, [classOptions, selectedClass]);

    useEffect(() => {
        setSelectedStudentId('');
    }, [selectedClass]);

    const handleOpenReportModal = (type: 'Formative' | 'Co-Curricular') => {
        setReportType(type);
        if (classOptions && classOptions.length > 0) {
            setSelectedClass(classOptions[0]);
        }
        setSelectedStudentId('');
        setSelectedSubject(SUBJECTS[0] || '');
        setIsReportModalOpen(true);
    };

    const handleGenerateReport = () => {
        if (reportType === 'Formative' && selectedStudentId) {
            navigate(`/print/formative-assessment-report/${selectedStudentId}`);
            setIsReportModalOpen(false);
        } else if (reportType === 'Co-Curricular' && selectedStudentId && selectedSubject) {
            navigate(`/print/co-curricular-report/${selectedStudentId}/${selectedSubject}`);
            setIsReportModalOpen(false);
        }
    };

    const menuItems = [
        {
            title: "School Based Assessment Entry",
            icon: <ClipboardListIcon className="w-6 h-6" />,
            action: () => navigate("/sba-entry")
        },
        {
            title: "Formative Assessment Entry",
            icon: <EditIcon className="w-6 h-6" />,
            action: () => navigate("/formative-entry")
        },
        {
            title: "Summative Assessment",
            icon: <ExamsIcon className="w-6 h-6" />,
            action: () => navigate("/exams")
        },
        {
            title: "Holistic Progress Card",
            icon: <HolisticIcon className="w-6 h-6" />,
            action: () => navigate("/student-report")
        },
        {
            title: "Formative Assessment Report",
            icon: <BarChart3Icon className="w-6 h-6" />,
            action: () => handleOpenReportModal('Formative')
        },
        {
            title: "Co-Curricular Activity Report",
            icon: <BarChart3Icon className="w-6 h-6" />,
            action: () => handleOpenReportModal('Co-Curricular')
        }
    ];

    return (
        <>
            <div className="flex flex-col gap-4 animate-fade-in">
                <header className="p-3 bg-card rounded-lg shadow-sm text-center">
                    <h1 className="text-xl font-bold">School Based Assessment</h1>
                </header>
                <div className="flex flex-col gap-3">
                    {menuItems.map(item => (
                        <SbaButton
                            key={item.title}
                            title={item.title}
                            icon={item.icon}
                            onClick={item.action}
                        />
                    ))}
                </div>
            </div>

            <Modal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                title={`Generate ${reportType} Report Sheet`}
            >
                <div className="p-4 space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-foreground/80 mb-1">Select Class</label>
                        <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className={inputStyle}>
                            <option value="">-- Choose Class --</option>
                            {classOptions?.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-foreground/80 mb-1">Select Student</label>
                        <select value={selectedStudentId} onChange={e => setSelectedStudentId(e.target.value)} disabled={!selectedClass} className={inputStyle}>
                            <option value="">-- Choose Student --</option>
                            {studentsInClass?.map(s => <option key={s.id} value={String(s.id!)}>{s.name} (Roll: {s.rollNo})</option>)}
                        </select>
                    </div>
                    {reportType === 'Co-Curricular' && (
                        <div>
                            <label className="block text-xs font-medium text-foreground/80 mb-1">Select Subject</label>
                            <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className={inputStyle}>
                                <option value="">-- Choose Subject --</option>
                                {SUBJECTS.map(subject => <option key={subject} value={subject}>{subject}</option>)}
                            </select>
                        </div>
                    )}
                    <div className="flex justify-end pt-2">
                        <button 
                            onClick={handleGenerateReport} 
                            disabled={
                                (reportType === 'Formative' && !selectedStudentId) ||
                                (reportType === 'Co-Curricular' && (!selectedStudentId || !selectedSubject))
                            }
                            className="py-3 px-5 rounded-lg bg-accent text-accent-foreground hover:bg-accent-hover text-sm font-semibold disabled:opacity-60"
                        >
                            Generate Report Sheet
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default SBA;