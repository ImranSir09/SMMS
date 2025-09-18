

import React from 'react';
import { Student, SchoolDetails, HPCReportData } from '../types';

interface HPCFoundationalCardProps {
  student: Student;
  schoolDetails: SchoolDetails;
  hpcData: HPCReportData;
}

const DOMAINS = ['Physical Development', 'Socio-emotional Development', 'Cognitive Development', 'Language and Literacy', 'Aesthetic & Cultural', 'Positive Learning Habits'];
const INTERESTS = ['Reading', 'Dancing/Singing', 'Sport/Games', 'Creative writing', 'Gardening', 'Yoga', 'Art', 'Craft', 'Cooking', 'Chores'];

const DetailItem: React.FC<{ label: string; value: string | undefined | null; className?: string }> = ({ label, value, className }) => (
    <div className={`flex items-baseline ${className}`}>
        <span className="font-semibold w-32 flex-shrink-0 text-gray-800">{label}</span>
        <span className="flex-1 border-b border-dotted border-gray-500 pl-1 font-mono">{value || ''}</span>
    </div>
);

const AttendanceTable: React.FC<{ attendance: HPCReportData['attendance'] }> = ({ attendance }) => (
    <table className="w-full border-collapse border border-gray-400 text-center">
        <thead>
            <tr className="bg-orange-100 font-semibold">
                {['Month', 'Working Days', 'Days Present', '%'].map(h => 
                    <th key={h} className="border border-gray-400 p-0.5">{h}</th>
                )}
            </tr>
        </thead>
        <tbody>
            {['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'].map(month => {
                const monthKey = month.toLowerCase();
                const data = attendance?.[monthKey];
                const percentage = (data?.working && data?.present) ? Math.round((data.present / data.working) * 100) : '';
                return (
                    <tr key={month}>
                        <td className="border border-gray-400 p-0.5 font-semibold">{month}</td>
                        <td className="border border-gray-400 p-0.5 h-5">{data?.working || ''}</td>
                        <td className="border border-gray-400 p-0.5">{data?.present || ''}</td>
                        <td className="border border-gray-400 p-0.5">{percentage}%</td>
                    </tr>
                );
            })}
        </tbody>
    </table>
);

const InterestChecklist: React.FC<{ interests: string[] | undefined }> = ({ interests }) => (
    <div className="grid grid-cols-5 gap-x-2 gap-y-1">
        {INTERESTS.map(item => (
            <div key={item} className="flex items-center gap-1">
                <div className="w-3 h-3 border border-black flex items-center justify-center">
                    {interests?.includes(item) && <span className="font-bold">✓</span>}
                </div>
                <span>{item}</span>
            </div>
        ))}
    </div>
);

const SummaryRow: React.FC<{ domain: string; summary: HPCReportData['summaries'][string] }> = ({ domain, summary }) => {
    const ProficiencyDots: React.FC<{ level: string | undefined }> = ({ level }) => (
        <div className="flex justify-around items-center h-full">
            <div className={`w-3 h-3 rounded-full border border-black ${level === 'Stream' ? 'bg-black' : ''}`}></div>
            <div className={`w-3 h-3 rounded-full border border-black ${level === 'Mountain' ? 'bg-black' : ''}`}></div>
            <div className={`w-3 h-3 rounded-full border border-black ${level === 'Sky' ? 'bg-black' : ''}`}></div>
        </div>
    );

    return (
        <tr className="text-center">
            <td className="border border-black p-1 text-left font-semibold align-top">{domain}</td>
            <td className="border border-black p-1"><ProficiencyDots level={summary?.awareness} /></td>
            <td className="border border-black p-1"><ProficiencyDots level={summary?.sensitivity} /></td>
            <td className="border border-black p-1"><ProficiencyDots level={summary?.creativity} /></td>
            <td className="border border-black p-1 text-left align-top min-h-[3rem]">{summary?.observationalNotes || ''}</td>
        </tr>
    );
};

const HPCFoundationalCard: React.FC<HPCFoundationalCardProps> = ({ student, schoolDetails, hpcData }) => {
    return (
        <div className="text-black font-sans leading-tight text-[10px]">
            {/* Page 1 */}
            <div className="A4-page bg-white shadow-lg p-6 flex flex-col my-4">
                <header className="text-center mb-2">
                    <h1 className="text-lg font-bold">HOLISTIC PROGRESS CARD (HPC)</h1>
                    <h2 className="text-base font-semibold">FOUNDATIONAL STAGE ({hpcData.academicYear})</h2>
                </header>

                <section className="border-2 border-orange-500 p-2 rounded-md">
                    <h3 className="text-center font-bold text-base text-orange-700 mb-1">PART-A (1): GENERAL INFORMATION</h3>
                    <div className="space-y-0.5">
                        <DetailItem label="School Name & Address" value={`${schoolDetails.name}, ${schoolDetails.address}`} />
                        <div className="flex justify-between gap-4">
                            <DetailItem label="UDISE Code" value={schoolDetails.udiseCode} />
                            <DetailItem label="Teacher Code" value={hpcData.foundationalData?.partA1?.teacherCode} />
                        </div>
                        <div className="flex justify-between gap-4">
                            <DetailItem label="APAAR ID" value={hpcData.foundationalData?.partA1?.apaarId} />
                        </div>
                    </div>
                    
                    <hr className="my-1 border-gray-400" />
                    
                    <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                        <DetailItem label="Student's Name" value={student.name} />
                        <DetailItem label="Grade / Class" value={student.className} />
                        <DetailItem label="Roll No." value={student.rollNo} />
                        <DetailItem label="Section" value={student.section} />
                        <DetailItem label="Registration No." value={hpcData.foundationalData?.partA1?.registrationNo} />
                        <DetailItem label="Date of Birth" value={student.dob} />
                        <DetailItem label="Mother's Name" value={student.mothersName} />
                        <DetailItem label="Mother's Education" value={hpcData.foundationalData?.partA1?.motherEducation} />
                        <DetailItem label="Father's Name" value={student.fathersName} />
                        <DetailItem label="Father's Education" value={hpcData.foundationalData?.partA1?.fatherEducation} />
                        <DetailItem label="Address" value={student.address} className="col-span-2" />
                    </div>
                </section>
                
                <section className="grid grid-cols-2 gap-2 mt-2">
                    <div className="border-2 border-orange-500 p-1.5 rounded-md">
                        <h3 className="text-center font-bold text-orange-700 mb-1">ATTENDANCE</h3>
                        <AttendanceTable attendance={hpcData.attendance} />
                    </div>
                    <div className="border-2 border-orange-500 p-1.5 rounded-md flex flex-col">
                        <h3 className="text-center font-bold text-orange-700 mb-1">INTERESTS</h3>
                        <div className="flex-grow">
                             <InterestChecklist interests={hpcData.foundationalData?.interests} />
                        </div>
                         <p className="text-[9px] border-t border-gray-400 pt-1 mt-1">
                            <strong>Other:</strong> 
                            <span className="font-mono border-b border-dotted border-black">{hpcData.foundationalData?.interests?.find(i => !INTERESTS.includes(i)) || ''}</span>
                        </p>
                    </div>
                </section>
                <div className="mt-auto pt-4 text-center text-gray-500 text-[9px]">Page 1 of 2</div>
            </div>

            {/* Page 2 */}
            <div className="A4-page bg-white shadow-lg p-6 flex flex-col my-4">
                <section className="flex-grow">
                    <header className="text-center mb-2">
                        <h1 className="text-lg font-bold">PART-C: SUMMARY FOR THE ACADEMIC YEAR</h1>
                    </header>
                    <table className="w-full border-collapse border border-black">
                        <thead className="bg-orange-100 text-sm">
                            <tr>
                                <th className="border border-black p-1 w-[25%]">Domains of Development</th>
                                <th className="border border-black p-1 w-[10%]">Awareness</th>
                                <th className="border border-black p-1 w-[10%]">Sensitivity</th>
                                <th className="border border-black p-1 w-[10%]">Creativity</th>
                                <th className="border border-black p-1 w-[45%]">Key Performance Descriptors (Teacher's Notes)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {DOMAINS.map(domain => (
                                <SummaryRow key={domain} domain={domain} summary={hpcData.summaries[domain]} />
                            ))}
                        </tbody>
                    </table>
                    <div className="mt-2 text-[9px]">
                        <p className="font-bold">Key:</p>
                        <p>The 3 dots under each ability represent proficiency levels. From left to right: <strong>Stream</strong> (Beginning), <strong>Mountain</strong> (Developing), <strong>Sky</strong> (Achieved).</p>
                    </div>
                </section>

                <footer className="mt-auto pt-16 flex justify-between items-end">
                    <div className="text-center w-1/3">
                        <div className="border-t-2 border-gray-500 mb-1"></div>
                        <p className="font-semibold">Parent's Signature</p>
                    </div>
                    <div className="text-center w-1/3">
                        <div className="border-t-2 border-gray-500 mb-1"></div>
                        <p className="font-semibold">Teacher's Signature</p>
                    </div>
                    <div className="text-center w-1/3">
                        <div className="border-t-2 border-gray-500 mb-1"></div>
                        <p className="font-semibold">Principal's Signature</p>
                    </div>
                </footer>
                <div className="mt-auto pt-4 text-center text-gray-500 text-[9px]">Page 2 of 2</div>
            </div>
        </div>
    );
};

export default HPCFoundationalCard;
