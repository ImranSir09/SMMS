
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import { CertificateIcon, BarChart3Icon, GridIcon } from '../components/icons';
import { useAppData } from '../hooks/useAppData';

const Reports: React.FC = () => {
    const navigate = useNavigate();
    const { activeSession } = useAppData();

    return (
        <div className="flex flex-col gap-4 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Card onClick={() => navigate('/print/consolidated-roll-statement')} className="p-4 flex items-center gap-3 cursor-pointer hover-lift">
                    <GridIcon className="w-8 h-8 text-primary" />
                    <div>
                        <h3 className="font-semibold">Consolidated Roll Statement</h3>
                        <p className="text-xs text-foreground/70">All classes with gender & category breakdown.</p>
                    </div>
                </Card>
                <Card onClick={() => navigate('/certificates')} className="p-4 flex items-center gap-3 cursor-pointer hover-lift">
                    <CertificateIcon className="w-8 h-8 text-primary" />
                    <div>
                        <h3 className="font-semibold">Certificates</h3>
                        <p className="text-xs text-foreground/70">Generate DOB, Bonafide & other documents.</p>
                    </div>
                </Card>
                 <Card onClick={() => navigate('/exams')} className="p-4 flex items-center gap-3 cursor-pointer hover-lift">
                    <BarChart3Icon className="w-8 h-8 text-primary" />
                    <div>
                        <h3 className="font-semibold">Exam Performance</h3>
                        <p className="text-xs text-foreground/70">Manage marks and view results.</p>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Reports;
