

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import { PieChartIcon, UserListIcon, BarChart3Icon, CertificateIcon, ClipboardCheckIcon, CameraIcon } from '../components/icons';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';
import { useAppData } from '../hooks/useAppData';
import { CLASS_OPTIONS } from '../constants';
import Modal from '../components/Modal';
import { Exam } from '../types';

const Reports: React.FC = () => {
    const navigate = useNavigate();
    const { activeSession } = useAppData();
    const [isSbaModalOpen, setIsSbaModalOpen] = useState(false);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedExamId, setSelectedExamId] = useState('');

    const classOptions = useLiveQuery(
        async () => {
            if (!activeSession) return [];
            const sessionInfos = await db.studentSessionInfo.where({ session: activeSession }).toArray();
            const classNames = [...new Set(sessionInfos.map(info => info.className))];
            return classNames.sort((a: string, b: string) => {
                const indexA = CLASS_OPTIONS.indexOf(a);
                const indexB = CLASS_OPTIONS.indexOf(b);
                if (indexA !== -1 && indexB !== -1) return indexA - indexB;
                if (indexA !== -1) return -1;
                if (indexB !== -1) return 1;
                return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
            });
        },
        [activeSession],
        []
    );
    
    const examsForClass = useLiveQuery(async () => {
        if (!selectedClass || !activeSession) return [];
        return db.exams.where({ className: selectedClass, session: activeSession }).toArray();
    }, [selectedClass, activeSession], []);

    const handlePrintRollStatement = () => {
        const className = prompt('Enter class name:', classOptions?.[0] || '1st');
        if (className) {
            navigate(`/print/roll-statement/${className}`);
        }
    };
    
    const handleOpenSbaModal = () => {
        if (classOptions && classOptions.length > 0) {
            setSelectedClass(classOptions[0]);
            setSelectedExamId('');
        }
        setIsSbaModalOpen(true);
    };

    const handleGenerateSbaSheet = () => {
        if (selectedClass && selectedExamId) {
            navigate(`/print/sba-result-sheet/${selectedClass}/${selectedExamId}`);
            setIsSbaModalOpen(false);
        }
    };

    return (
        <>
            <div className="flex flex-col gap-4 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Card onClick={handlePrintRollStatement} className="p-4 flex items-center gap-3 cursor-pointer hover-lift">
                        <UserListIcon className="w-8 h-8 text-primary" />
                        <div>
                            <h3 className="font-semibold">Roll Statement</h3>
                            <p className="text-xs text-foreground/70">List of students in a class.</p>
                        </div>
                    </Card>
                    <Card onClick={() => navigate('/print/category-roll-statement')} className="p-4 flex items-center gap-3 cursor-pointer hover-lift">
                        <PieChartIcon className="w-8 h-8 text-primary" />
                        <div>
                            <h3 className="font-semibold">Category-wise Roll Statement</h3>
                            <p className="text-xs text-foreground/70">Student counts by category and gender.</p>
                        </div>
                    </Card>
                    <Card onClick={handleOpenSbaModal} className="p-4 flex items-center gap-3 cursor-pointer hover-lift">
                        <ClipboardCheckIcon className="w-8 h-8 text-primary" />
                        <div>
                            <h3 className="font-semibold">SBA Result Sheet</h3>
                            <p className="text-xs text-foreground/70">Generate a class-wise result sheet.</p>
                        </div>
                    </Card>
                    <Card onClick={() => navigate('/reports/generate-certificate')} className="p-4 flex items-center gap-3 cursor-pointer hover-lift">
                        <CertificateIcon className="w-8 h-8 text-primary" />
                        <div>
                            <h3 className="font-semibold">Generate Certificates</h3>
                            <p className="text-xs text-foreground/70">Create Bonafide, D.O.B., etc.</p>
                        </div>
                    </Card>
                    <Card onClick={() => navigate('/extract-info')} className="p-4 flex items-center gap-3 cursor-pointer hover-lift">
                        <CameraIcon className="w-8 h-8 text-primary" />
                        <div>
                            <h3 className="font-semibold">Extract from Image</h3>
                            <p className="text-xs text-foreground/70">Use AI to add students from images.</p>
                        </div>
                    </Card>
                     <Card className="p-4 flex items-center gap-3 opacity-50">
                        <BarChart3Icon className="w-8 h-8 text-primary" />
                        <div>
                            <h3 className="font-semibold">Exam Performance</h3>
                            <p className="text-xs text-foreground/70">Coming soon.</p>
                        </div>
                    </Card>
                </div>
            </div>
            
            <Modal isOpen={isSbaModalOpen} onClose={() => setIsSbaModalOpen(false)} title="Generate SBA Result Sheet">
                <div className="p-4 space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-foreground/80 mb-1">Select Class</label>
                        <select
                            value={selectedClass}
                            onChange={e => {
                                setSelectedClass(e.target.value);
                                setSelectedExamId('');
                            }}
                            className="p-3 w-full bg-background border border-input rounded-md"
                        >
                            <option value="">-- Choose Class --</option>
                            {classOptions?.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-foreground/80 mb-1">Select Summative Assessment</label>
                        <select
                            value={selectedExamId}
                            onChange={e => setSelectedExamId(e.target.value)}
                            disabled={!selectedClass}
                            className="p-3 w-full bg-background border border-input rounded-md"
                        >
                            <option value="">-- Choose Assessment --</option>
                            {examsForClass?.map(exam => <option key={exam.id} value={String(exam.id!)}>{exam.name}</option>)}
                        </select>
                    </div>
                    <div className="flex justify-end pt-2">
                        <button
                            onClick={handleGenerateSbaSheet}
                            disabled={!selectedClass || !selectedExamId}
                            className="py-3 px-5 rounded-lg bg-primary text-primary-foreground hover:bg-primary-hover disabled:opacity-60"
                        >
                            Generate Sheet
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default Reports;