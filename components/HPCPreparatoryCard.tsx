
import React from 'react';
import { Student, SchoolDetails, HPCReportData } from '../types';

interface HPCPreparatoryCardProps {
  student: Student;
  schoolDetails: SchoolDetails;
  hpcData: HPCReportData;
  photo?: string | null;
}

const SUBJECTS = ['Language (R1)', 'Language (R2)', 'Mathematics', 'The World Around Us', 'Art Education', 'Physical Education', 'Overall'];

const DetailItem: React.FC<{ label: string; value: string | undefined | null; className?: string }> = ({ label, value, className }) => (
    <div className={`flex items-baseline ${className}`}>
        <span className="font-semibold w-28 flex-shrink-0 text-gray-800">{label}</span>
        <span className="flex-1 border-b border-dotted border-gray-500 pl-1 font-mono">{value || ''}</span>
    </div>
);

const AttendanceTable: React.FC<{ attendance: HPCReportData['attendance'] }> = ({ attendance }) => (
    <table className="w-full border-collapse border border-gray-400 text-center text-[9px]">
        <thead>
            <tr className="bg-orange-100 font-semibold">
                {['MONTHS', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC', 'JAN', 'FEB', 'MAR'].map(h => 
                    <th key={h} className="border border-gray-400 p-0.5">{h}</th>
                )}
            </tr>
        </thead>
        <tbody>
            {['No. of Working Days', 'No. of Days Present', '% of Attendance'].map(rowLabel => {
                const key = rowLabel.includes('Working') ? 'working' : 'present';
                return (
                    <tr key={rowLabel}>
                        <td className="border border-gray-400 p-0.5 font-semibold text-left">{rowLabel}</td>
                        {['apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec', 'jan', 'feb', 'mar'].map(month => {
                            const data = attendance?.[month];
                            const value = rowLabel.startsWith('%') 
                                ? ((data?.working && data?.present) ? Math.round((data.present / data.working) * 100) + '%' : '')
                                : (data?.[key as 'working' | 'present'] || '');
                            return <td key={month} className="border border-gray-400 p-0.5 h-4">{value}</td>
                        })}
                    </tr>
                );
            })}
        </tbody>
    </table>
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

const HPCPreparatoryCard: React.FC<HPCPreparatoryCardProps> = ({ student, schoolDetails, hpcData, photo }) => {
    return (
        <div className="text-black font-sans leading-tight text-[10px]">
            {/* Page 1 */}
            <div className="A4-page bg-white shadow-lg p-6 flex flex-col my-4">
                <header className="text-center mb-2">
                    <h1 className="text-lg font-bold">HOLISTIC PROGRESS CARD (HPC)</h1>
                    <h2 className="text-base font-semibold">PREPARATORY STAGE ({hpcData.academicYear})</h2>
                </header>

                 <section className="border-2 border-orange-500 p-2 rounded-md">
                    <h3 className="text-center font-bold text-base text-orange-700 mb-1">PART-A (1): GENERAL INFORMATION</h3>
                    <div className="flex gap-2">
                        <div className="flex-grow">
                            <div className="space-y-0.5">
                                <DetailItem label="School Name & Address" value={`${schoolDetails.name}, ${schoolDetails.address}`} />
                                <div className="grid grid-cols-2 gap-x-4">
                                    <DetailItem label="UDISE Code" value={schoolDetails.udiseCode} />
                                    <DetailItem label="Teacher Code" value={hpcData.preparatoryData?.partA1?.teacherCode} />
                                </div>
                            </div>
                            
                            <hr className="my-1 border-gray-400" />
                            
                            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                                <DetailItem label="Student's Name" value={student.name} />
                                <DetailItem label="Grade / Class" value={student.className} />
                                <DetailItem label="Roll No." value={student.rollNo} />
                                <DetailItem label="Section" value={student.section} />
                                <DetailItem label="Registration No." value={hpcData.preparatoryData?.partA1?.registrationNo} />
                                <DetailItem label="Date of Birth" value={student.dob} />
                                <DetailItem label="Mother's Name" value={student.mothersName} />
                                <DetailItem label="Mother's Occupation" value={hpcData.preparatoryData?.partA1?.motherOccupation} />
                                <DetailItem label="Father's Name" value={student.fathersName} />
                                <DetailItem label="Father's Occupation" value={hpcData.preparatoryData?.partA1?.fatherOccupation} />
                                <DetailItem label="Address" value={student.address} className="col-span-2" />
                            </div>
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

                <section className="border-2 border-orange-500 p-1.5 rounded-md mt-2 flex-grow">
                    <h3 className="text-center font-bold text-orange-700 mb-1">ATTENDANCE</h3>
                    <AttendanceTable attendance={hpcData.attendance} />
                </section>
                <div className="mt-auto pt-4 text-center text-gray-500 text-[9px]">Page 1 of 4</div>
            </div>

            {/* Page 2 */}
            <div className="A4-page bg-white shadow-lg p-6 flex flex-col my-4">
                 <header className="text-center mb-2">
                    <h1 className="text-base font-bold">PART A (2): ALL ABOUT ME</h1>
                </header>
                <div className="border-2 border-orange-500 p-2 rounded-md flex-grow space-y-2">
                    <DetailItem label="My name is" value={student.name} />
                    <DetailItem label="I am" value={`${hpcData.preparatoryData?.partA2?.iAmYearsOld || ''} years old.`} />
                    <DetailItem label="My Family" value={hpcData.preparatoryData?.partA2?.myFamily} />
                    
                    <div className="border border-gray-400 p-2 rounded">
                        <h4 className="font-bold text-center">Things about me...</h4>
                        <DetailItem label="I am good at" value={hpcData.preparatoryData?.partA2?.handDiagram?.goodAt} />
                        <DetailItem label="I am not so good at" value={hpcData.preparatoryData?.partA2?.handDiagram?.notSoGoodAt} />
                        <DetailItem label="I would like to improve" value={hpcData.preparatoryData?.partA2?.handDiagram?.improveSkill} />
                        <DetailItem label="I like to" value={hpcData.preparatoryData?.partA2?.handDiagram?.likeToDo} />
                        <DetailItem label="I don't like to" value={hpcData.preparatoryData?.partA2?.handDiagram?.dontLikeToDo} />
                    </div>

                     <div className="border border-gray-400 p-2 rounded">
                        <h4 className="font-bold text-center">Some of my favorite things...</h4>
                        <DetailItem label="Food" value={hpcData.preparatoryData?.partA2?.myFavoriteThings?.food} />
                        <DetailItem label="Games" value={hpcData.preparatoryData?.partA2?.myFavoriteThings?.games} />
                        <DetailItem label="Festivals" value={hpcData.preparatoryData?.partA2?.myFavoriteThings?.festivals} />
                    </div>

                    <DetailItem label="When I grow up I want to be" value={hpcData.preparatoryData?.partA2?.whenIGrowUp} />
                    <DetailItem label="One person who inspires me is" value={hpcData.preparatoryData?.partA2?.myIdol} />
                    <DetailItem label="Things I want to learn this year" value={hpcData.preparatoryData?.partA2?.thingsToLearn?.join(', ')} />
                </div>
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
                <div className="mt-2 text-[9px]">
                    <p className="font-bold">Key:</p>
                    <p><strong>B</strong> - Beginner, <strong>P</strong> - Proficient, <strong>A</strong> - Advanced.</p>
                </div>
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
                <table className="w-full border-collapse border border-black text-center">
                    <thead className="bg-orange-100">
                        <tr>
                            <th className="border border-black p-1">Learning Standard</th>
                            <th className="border border-black p-1">Credits Earned by Completing the HPC (70%)</th>
                            <th className="border border-black p-1">National Credit Framework Levels</th>
                            <th className="border border-black p-1">Credit Points</th>
                            <th className="border border-black p-1">Credit Points Earned by the Learner</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            { name: 'Language Education (R1)', credits: 3.8 },
                            { name: 'Language Education (R2)', credits: 3.8 },
                            { name: 'Mathematics', credits: 3.8 },
                            { name: 'The World Around Us', credits: 3.8 },
                            { name: 'Art Education', credits: 3.8 },
                            { name: 'Physical Education', credits: 3.8 },
                        ].map(item => {
                            const level = student.className === '3rd' ? 0.6 : student.className === '4th' ? 0.8 : 1.0;
                            const points = student.className === '3rd' ? 2.3 : student.className === '4th' ? 3.0 : 3.8;
                            return (
                                <tr key={item.name}>
                                    <td className="border border-black p-1 text-left">{item.name}</td>
                                    <td className="border border-black p-1">{item.credits}</td>
                                    <td className="border border-black p-1">{level.toFixed(1)}</td>
                                    <td className="border border-black p-1">{points.toFixed(1)}</td>
                                    <td className="border border-black p-1"></td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                 <div className="mt-auto pt-4 text-center text-gray-500 text-[9px]">Page 4 of 4</div>
            </div>

        </div>
    );
};

export default HPCPreparatoryCard;