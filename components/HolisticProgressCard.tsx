import React from 'react';
import { Student, SchoolDetails, SbaReportData, HPCReportData, Mark, DetailedFormativeAssessment, StudentExamData, Exam } from '../types';
import { ACADEMIC_YEAR, SUBJECTS } from '../constants';

// Props Interface
interface HPCProps {
    student: Student;
    schoolDetails: SchoolDetails;
    sbaData: SbaReportData | null;
    hpcData: HPCReportData | null;
    allMarks: Mark[];
    allDetailedFA: DetailedFormativeAssessment[];
    allStudentExamData: StudentExamData[];
    allExams: Exam[];
    photoOverride?: string | null;
}

// Helper Components
const PageHeader: React.FC<{ school: SchoolDetails, title: string }> = ({ school, title }) => (
    <header className="text-center mb-2">
        <h1 className="text-xl font-bold">{school.name}</h1>
        <p className="text-xs">{school.address}</p>
        <h2 className="text-lg font-semibold mt-2 border-y-2 border-black py-1">{title}</h2>
    </header>
);

const StudentInfo: React.FC<{ student: Student, photo?: string | null }> = ({ student, photo }) => (
    <div className="flex justify-between items-start text-[9px] mb-2">
        <div className="grid grid-cols-2 gap-x-4">
            <span><strong>Name:</strong> {student.name}</span>
            <span><strong>Class:</strong> {student.className} '{student.section}'</span>
            <span><strong>Father's Name:</strong> {student.fathersName}</span>
            <span><strong>Roll No:</strong> {student.rollNo}</span>
            <span><strong>Mother's Name:</strong> {student.mothersName}</span>
            <span><strong>Admission No:</strong> {student.admissionNo}</span>
            <span><strong>Date of Birth:</strong> {student.dob}</span>
        </div>
        <div className="w-20 h-24 border border-black flex-shrink-0">
            {photo && <img src={photo} alt="Student" className="w-full h-full object-cover" />}
        </div>
    </div>
);

// FIX: Added colSpan to Td component props to fix type error.
const Td: React.FC<{ children: React.ReactNode, className?: string, colSpan?: number }> = ({ children, className, colSpan }) => (
    <td className={`border border-black p-0.5 text-center ${className}`} colSpan={colSpan}>{children}</td>
);
const Th: React.FC<{ children: React.ReactNode, className?: string, colSpan?: number, rowSpan?: number }> = ({ children, className, colSpan, rowSpan }) => (
    <th className={`border border-black p-0.5 font-semibold bg-gray-200 ${className}`} colSpan={colSpan} rowSpan={rowSpan}>{children}</th>
);

// Main Component
const HolisticProgressCard: React.FC<HPCProps> = ({
    student, schoolDetails, sbaData, hpcData, allMarks, allDetailedFA, allStudentExamData, allExams, photoOverride
}) => {
    
    const photo = photoOverride !== undefined ? photoOverride : student.photo;

    // Process Academic Data
    const examsInClass = allExams.filter(e => e.className === student.className);
    const termExams = examsInClass.filter(e => !e.name.startsWith('FA'));

    return (
        <div className="A4-page-container">
            <div id={`hpc-${student.id}`} className="w-[210mm] h-[297mm] bg-white p-4 font-sans text-black text-[8px]">
                <div className="w-full h-full border-2 border-black p-2 flex flex-col">
                    <PageHeader school={schoolDetails} title={`Holistic Progress Card (${ACADEMIC_YEAR})`} />
                    <StudentInfo student={student} photo={photo} />

                    {/* Part 1: Academic Performance */}
                    <h3 className="text-center font-bold bg-gray-200 border-x border-t border-black py-0.5">Part-I: Scholastic Areas (Academic Performance)</h3>
                    <table className="w-full border-collapse">
                        <thead>
                            <tr>
                                <Th rowSpan={2}>Subjects</Th>
                                {termExams.map(exam => <Th key={exam.id} colSpan={2}>{exam.name}</Th>)}
                                <Th rowSpan={2}>Overall Grade</Th>
                            </tr>
                            <tr>
                                {termExams.map(exam => <React.Fragment key={exam.id}><Th>Marks (100)</Th><Th>Grade</Th></React.Fragment>)}
                            </tr>
                        </thead>
                        <tbody>
                            {SUBJECTS.map(subject => {
                                let totalMarks = 0;
                                let examCount = 0;
                                return (
                                    <tr key={subject}>
                                        <Td className="text-left font-semibold">{subject}</Td>
                                        {termExams.map(exam => {
                                            const mark = allMarks.find(m => m.examId === exam.id && m.subject === subject);
                                            const faTotal = (mark?.fa1 || 0) + (mark?.fa2 || 0) + (mark?.fa3 || 0) + (mark?.fa4 || 0) + (mark?.fa5 || 0) + (mark?.fa6 || 0);
                                            const total100 = faTotal + (mark?.coCurricular || 0) + (mark?.summative || 0);
                                            if (mark) {
                                                totalMarks += total100;
                                                examCount++;
                                            }
                                            const grade = total100 >= 33 ? 'P' : 'F';
                                            return <React.Fragment key={exam.id}><Td>{total100 > 0 ? total100 : '-'}</Td><Td>{total100 > 0 ? grade : '-'}</Td></React.Fragment>
                                        })}
                                        <Td>{examCount > 0 ? (totalMarks/examCount >= 33 ? 'P' : 'F') : '-'}</Td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    
                    {/* Part 2: Co-Scholastic */}
                    <h3 className="text-center font-bold bg-gray-200 border-x border-t border-black py-0.5 mt-2">Part-II: Co-Scholastic Areas</h3>
                    <table className="w-full border-collapse">
                         <tbody>
                            <tr className="bg-gray-100"><Th className="text-left" colSpan={4}>A) Health and Wellbeing</Th></tr>
                            <tr><Td className="text-left">Physical Wellbeing</Td><Td>{sbaData?.physicalWellbeing}</Td><Td className="text-left">Mental Wellbeing</Td><Td>{sbaData?.mentalWellbeing}</Td></tr>
                            
                            <tr className="bg-gray-100"><Th className="text-left" colSpan={4}>B) Life Skills</Th></tr>
                            <tr><Td className="text-left">Creativity</Td><Td>{sbaData?.creativity}</Td><Td className="text-left">Critical Thinking</Td><Td>{sbaData?.criticalThinking}</Td></tr>
                            <tr><Td className="text-left">Communication</Td><Td>{sbaData?.communicationSkill}</Td><Td className="text-left">Problem Solving</Td><Td>{sbaData?.problemSolvingAbility}</Td></tr>
                            <tr><Td className="text-left">Collaboration</Td><Td colSpan={3}>{sbaData?.collaboration}</Td></tr>

                             <tr className="bg-gray-100"><Th className="text-left" colSpan={4}>C) Talents, Attitudes & Other Skills</Th></tr>
                            <tr><Td className="text-left">Student's Talent</Td><Td>{sbaData?.studentsTalent}</Td><Td className="text-left">Participation</Td><Td>{sbaData?.participationInActivities}</Td></tr>
                            <tr><Td className="text-left">Attitude & Values</Td><Td>{sbaData?.attitudeAndValues}</Td><Td className="text-left">Presentation</Td><Td>{sbaData?.presentationSkill}</Td></tr>
                            <tr><Td className="text-left">Writing Skill</Td><Td>{sbaData?.writingSkill}</Td><Td className="text-left">Comprehension</Td><Td>{sbaData?.comprehensionSkill}</Td></tr>
                         </tbody>
                    </table>
                     <p className="text-center text-[7px] border-x border-b border-black p-0.5">Grading Scale: High/Medium/Low, Talented/Highly Talented, Normal and Healthy/Needs Attention</p>

                    {/* Final Section */}
                    <div className="mt-auto pt-2">
                        <table className="w-full border-collapse">
                            <tbody>
                                <tr>
                                    <Td className="text-left h-12 align-top"><strong>Teacher's Remarks:</strong></Td>
                                    <Td className="text-center"><strong>Attendance:</strong> ___ / ___</Td>
                                </tr>
                                <tr>
                                    <Td className="text-left h-12 align-top"><strong>Result:</strong> Passed/Promoted to Class ____</Td>
                                    <Td className="text-center"><strong>Date:</strong> {new Date().toLocaleDateString('en-GB')}</Td>
                                </tr>
                            </tbody>
                        </table>
                        <div className="flex justify-between mt-10 text-[9px]">
                            <span>Class Teacher's Signature</span>
                            <span>Headmaster's Signature</span>
                            <span>Parent's Signature</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HolisticProgressCard;
