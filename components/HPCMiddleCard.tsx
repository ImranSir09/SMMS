
import React from 'react';
import { Student, SchoolDetails, HPCReportData } from '../types';

interface HPCMiddleCardProps {
  student: Student;
  schoolDetails: SchoolDetails;
  hpcData: HPCReportData;
  photo?: string | null;
}

const SUBJECTS = ['Language (R1)', 'Language (R2)', 'Language (R3)', 'Mathematics', 'Science', 'Social Science', 'Art Education', 'Physical Education', 'Skill Education', 'Overall'];

const DetailItem: React.FC<{ label: string; value: string | undefined | null; className?: string }> = ({ label, value, className }) => (
    <div className={`flex items-baseline ${className}`}>
        <span className="font-semibold w-28 flex-shrink-0 text-gray-800">{label}</span>
        <span className="flex-1 border-b border-dotted border-gray-500 pl-1 font-mono">{value || ''}</span>
    </div>
);

const SummaryRow: React.FC<{ subject: string; summary: HPCReportData['summaries'][string] }> = ({ subject, summary }) => {
    const ProficiencyCheckbox: React.FC<{ level: string, selected: boolean }> = ({ level, selected }) => (
        <div className="flex flex-col items-center">
             <div className="w-3 h-3 border border-black flex items-center justify-center text-sm">
                {selected && <span className="font-bold">✓</span>}
            </div>
        </div>
    );

    return (
        <tr className="text-center">
            <td className="border border-black p-1 text-left font-semibold align-top">{subject}</td>
            <td className="border border-black p-1"><ProficiencyCheckbox level="Beginner" selected={summary?.awareness === 'Beginner'} /></td>
            <td className="border border-black p-1"><ProficiencyCheckbox level="Proficient" selected={summary?.awareness === 'Proficient'} /></td>
            <td className="border border-black p-1"><ProficiencyCheckbox level="Advanced" selected={summary?.awareness === 'Advanced'} /></td>
            <td className="border border-black p-1"><ProficiencyCheckbox level="Beginner" selected={summary?.sensitivity === 'Beginner'} /></td>
            <td className="border border-black p-1"><ProficiencyCheckbox level="Proficient" selected={summary?.sensitivity === 'Proficient'} /></td>
            <td className="border border-black p-1"><ProficiencyCheckbox level="Advanced" selected={summary?.sensitivity === 'Advanced'} /></td>
            <td className="border border-black p-1"><ProficiencyCheckbox level="Beginner" selected={summary?.creativity === 'Beginner'} /></td>
            <td className="border border-black p-1"><ProficiencyCheckbox level="Proficient" selected={summary?.creativity === 'Proficient'} /></td>
            <td className="border border-black p-1"><ProficiencyCheckbox level="Advanced" selected={summary?.creativity === 'Advanced'} /></td>
            <td className="border border-black p-1 text-left align-top min-h-[2rem] text-[9px] leading-tight">{summary?.observationalNotes || ''}</td>
        </tr>
    );
};

const HPCMiddleCard: React.FC<HPCMiddleCardProps> = ({ student, schoolDetails, hpcData, photo }) => {
    const grade = student.className.replace(/[^0-9]/g, '');

    const getCreditData = (grade: string) => {
        switch(grade) {
            case '6': return { level: 1.33, points: 4.1, totalCredits: 53, hpcCredits: 37 };
            case '7': return { level: 1.67, points: 5.19, totalCredits: 67, hpcCredits: 47 };
            case '8': return { level: 2.0, points: 6.2, totalCredits: 80, hpcCredits: 56 };
            default: return { level: 0, points: 0, totalCredits: 0, hpcCredits: 0 };
        }
    };
    const creditInfo = getCreditData(grade);
    
    return (
        <div className="text-black font-sans leading-tight text-[10px]">
            {/* Page 1 */}
            <div className="A4-page bg-white shadow-lg p-6 flex flex-col my-4">
                 <header className="text-center mb-2">
                    <h1 className="text-lg font-bold">HOLISTIC PROGRESS CARD (HPC)</h1>
                    <h2 className="text-base font-semibold">MIDDLE STAGE ({hpcData.academicYear})</h2>
                </header>
                 <section className="border-2 border-orange-500 p-2 rounded-md">
                    <h3 className="text-center font-bold text-base text-orange-700 mb-1">PART-A (1): GENERAL INFORMATION</h3>
                    <div className="flex gap-2">
                        <div className="flex-grow grid grid-cols-2 gap-x-4 gap-y-0.5">
                            <DetailItem label="School Name" value={schoolDetails.name} />
                            <DetailItem label="Address" value={schoolDetails.address} />
                            <DetailItem label="Student's Name" value={student.name} />
                            <DetailItem label="Class" value={student.className} />
                        </div>
                        <div className="flex-shrink-0 w-24">
                            {photo ? (
                                <img src={photo} alt="Student" className="w-full h-32 object-cover border-2 border-gray-400" />
                            ) : (
                                <div className="w-full h-32 border-2 border-dashed border-gray-400 flex items-center justify-center text-center text-[9px] p-1">
                                    Affix Passport Size Photograph
                                </div>
                            )}
                        </div>
                    </div>
                </section>
                <section className="border-2 border-orange-500 p-2 rounded-md mt-2 flex-grow">
                     <h3 className="text-center font-bold text-base text-orange-700 mb-1">PART-A (2): ALL ABOUT ME & GOALS</h3>
                     <DetailItem label="I live with" value={hpcData.middleData?.partA2?.liveWith} />
                     <DetailItem label="Academic Goal" value={hpcData.middleData?.partA2?.academicGoal?.description} />
                     <DetailItem label="Personal Goal" value={hpcData.middleData?.partA2?.personalGoal?.description} />
                </section>
                <div className="mt-auto pt-4 text-center text-gray-500 text-[9px]">Page 1 of 4</div>
            </div>
            
            {/* Page 2 */}
            <div className="A4-page bg-white shadow-lg p-6 flex flex-col my-4">
                 <header className="text-center mb-2">
                    <h1 className="text-base font-bold">PART A (3 & 4): AMBITION & PARTNERSHIP</h1>
                </header>
                <section className="border-2 border-orange-500 p-2 rounded-md">
                    <h3 className="text-center font-bold text-base text-orange-700 mb-1">MY AMBITION CARD</h3>
                    <DetailItem label="My ambition is" value={hpcData.middleData?.partA3?.ambition} />
                    <DetailItem label="Skills I need" value={hpcData.middleData?.partA3?.skillsNeeded} />
                </section>
                <section className="border-2 border-orange-500 p-2 rounded-md mt-2 flex-grow">
                     <h3 className="text-center font-bold text-base text-orange-700 mb-1">PARENT-TEACHER PARTNERSHIP</h3>
                     <p className="font-semibold">Support I will provide at home:</p>
                     <p className="font-mono h-20">{hpcData.middleData?.partA4?.supportAtHome}</p>
                </section>
                <div className="mt-auto pt-4 text-center text-gray-500 text-[9px]">Page 2 of 4</div>
            </div>
            
             {/* Page 3 */}
            <div className="A4-page bg-white shadow-lg p-6 flex flex-col my-4">
                <header className="text-center mb-2">
                    <h1 className="text-lg font-bold">PART-C: SUMMARY FOR THE ACADEMIC YEAR</h1>
                </header>
                <table className="w-full border-collapse border border-black">
                    <thead className="bg-orange-100 text-sm">
                        <tr>
                            <th rowSpan={2} className="border border-black p-1 w-[15%]">ABILITIES</th>
                            <th colSpan={3} className="border border-black p-1">Awareness</th>
                            <th colSpan={3} className="border border-black p-1">Sensitivity</th>
                            <th colSpan={3} className="border border-black p-1">Creativity</th>
                            <th rowSpan={2} className="border border-black p-1 w-[30%]">Observational Note</th>
                        </tr>
                        <tr className="text-[9px]">
                           {['B', 'P', 'A', 'B', 'P', 'A', 'B', 'P', 'A'].map((l, i) => <th key={i} className="border border-black p-0.5">{l}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {SUBJECTS.map(subject => (
                            <SummaryRow key={subject} subject={subject} summary={hpcData.summaries[subject]} />
                        ))}
                    </tbody>
                </table>
                <footer className="mt-auto pt-16 flex justify-between items-end">
                    <div className="text-center w-1/3"><div className="border-t-2 border-gray-500 mb-1"></div><p className="font-semibold">Parent's Signature</p></div>
                    <div className="text-center w-1/3"><div className="border-t-2 border-gray-500 mb-1"></div><p className="font-semibold">Teacher's Signature</p></div>
                    <div className="text-center w-1/3"><div className="border-t-2 border-gray-500 mb-1"></div><p className="font-semibold">Principal's Signature</p></div>
                </footer>
                <div className="mt-auto pt-4 text-center text-gray-500 text-[9px]">Page 3 of 4</div>
            </div>
            
            {/* Page 4 */}
            <div className="A4-page bg-white shadow-lg p-6 flex flex-col my-4">
                 <header className="text-center mb-2">
                    <h1 className="text-lg font-bold">CREDITS EARNED THROUGH HPC</h1>
                </header>
                <table className="w-full border-collapse border border-black text-center text-[9px]">
                    <thead className="bg-orange-100">
                        <tr>
                            <th className="border border-black p-1">Grade</th>
                            <th className="border border-black p-1">Credits Earned by Completing HPC (70%)</th>
                            <th className="border border-black p-1">National Credit Framework Level</th>
                            <th className="border border-black p-1">Total Credit Points Earned</th>
                            <th className="border border-black p-1">Credit Points from HPC (70%)</th>
                        </tr>
                    </thead>
                     <tbody>
                        <tr>
                            <td className="border border-black p-1 font-semibold">Grade {grade}</td>
                            <td className="border border-black p-1">28</td>
                            <td className="border border-black p-1">{creditInfo.level.toFixed(2)}</td>
                            <td className="border border-black p-1">{creditInfo.totalCredits}</td>
                            <td className="border border-black p-1">{creditInfo.hpcCredits}</td>
                        </tr>
                    </tbody>
                </table>
                <table className="w-full border-collapse border border-black text-center mt-4">
                    <thead className="bg-orange-100">
                        <tr>
                            <th className="border border-black p-1">Learning Standard</th>
                            <th className="border border-black p-1">Credits (70%)</th>
                            <th className="border border-black p-1">NCF Levels</th>
                            <th className="border border-black p-1">Credit Points</th>
                            <th className="border border-black p-1">Points Earned</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[...SUBJECTS].filter(s => s !== 'Overall').map(item => (
                            <tr key={item}>
                                <td className="border border-black p-1 text-left">{item}</td>
                                <td className="border border-black p-1">3.11</td>
                                <td className="border border-black p-1">{creditInfo.level.toFixed(2)}</td>
                                <td className="border border-black p-1">{creditInfo.points.toFixed(1)}</td>
                                <td className="border border-black p-1"></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 <div className="mt-auto pt-4 text-center text-gray-500 text-[9px]">Page 4 of 4</div>
            </div>
        </div>
    );
};

export default HPCMiddleCard;