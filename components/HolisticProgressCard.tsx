

import React from 'react';
import { Student, SchoolDetails, SbaReportData, HPCReportData, Mark, DetailedFormativeAssessment, StudentExamData, Exam, FormativeProficiencyLevel, SbaProficiencyLevel } from '../types';
import { SUBJECTS } from '../constants';
import ReportCardThermometer from './ReportCardThermometer';

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
const PageContainer: React.FC<{ children: React.ReactNode, id: string }> = ({ children, id }) => (
    <div id={id} className="w-[210mm] h-[297mm] bg-white p-4 font-serif text-black text-xs relative overflow-hidden page-break">
        <div className="w-full h-full border-2 border-dashed border-black p-2 flex flex-col">
            {children}
        </div>
    </div>
);

const Td: React.FC<{ children: React.ReactNode, className?: string, colSpan?: number }> = ({ children, className = '', colSpan }) => (
    <td className={`border border-black p-1 text-center ${className}`} colSpan={colSpan}>{children}</td>
);
const Th: React.FC<{ children: React.ReactNode, className?: string, colSpan?: number, rowSpan?: number }> = ({ children, className = '', colSpan, rowSpan }) => (
    <th className={`border border-black p-1 font-semibold bg-gray-100 ${className}`} colSpan={colSpan} rowSpan={rowSpan}>{children}</th>
);

// Main Component
const HolisticProgressCard: React.FC<HPCProps> = ({
    student, schoolDetails, sbaData, hpcData, allMarks, allDetailedFA, allStudentExamData, allExams, photoOverride
}) => {
    
    const photo = photoOverride !== undefined ? photoOverride : student.photo;
    
    const fatherOccupation = hpcData?.foundationalData?.partA1?.fatherOccupation ||
                             hpcData?.preparatoryData?.partA1?.fatherOccupation ||
                             hpcData?.middleData?.partA1?.fatherOccupation || 'N/A';

    // --- Data Processing for Page 2 ---
    const academicMarksBySubject = new Map<string, Mark>();
    allMarks.forEach(mark => {
        if (!academicMarksBySubject.has(mark.subject)) {
            academicMarksBySubject.set(mark.subject, mark);
        }
    });

    const proficiencyToScore = (level: FormativeProficiencyLevel | undefined, maxScore: number): number => {
        if (!level) return 0;
        const baseScore = { 'Sky': 4, 'Mountain': 3, 'Stream': 2, 'Not-Satisfied': 1 }[level] || 0;
        if (maxScore === 4) return baseScore;
        if (maxScore === 2) return baseScore / 2;
        return 0;
    };

    const coCurricularScores: { [key: string]: number } = {};
    const coCurricularFields = [
        { key: 'physicalActivity', max: 4 }, { key: 'participationInSchoolActivities', max: 4 },
        { key: 'culturalAndCreativeActivities', max: 4 }, { key: 'healthAndHygiene', max: 2 },
        { key: 'environmentAndITAwareness', max: 2 }, { key: 'discipline', max: 2 }, { key: 'attendance', max: 2 },
    ];
    
    if (allDetailedFA.length > 0) {
        coCurricularFields.forEach(fieldInfo => {
            let totalScore = 0;
            allDetailedFA.forEach(fa => {
                if (fa.cocurricularRatings) {
                    const level = fa.cocurricularRatings[fieldInfo.key as keyof typeof fa.cocurricularRatings];
                    totalScore += proficiencyToScore(level, fieldInfo.max);
                }
            });
            coCurricularScores[fieldInfo.key] = Math.round(totalScore / allDetailedFA.length);
        });
    }
    const totalCoCurricularScore = Object.values(coCurricularScores).reduce((sum, score) => sum + score, 0);

    // --- Data Processing for Page 3 ---
    const proficiencyToPercent = (level: SbaProficiencyLevel | undefined) => ({ 'High': 90, 'Medium': 65, 'Low': 30 }[level || 'Low']);
    
    const healthValue = (((sbaData?.physicalWellbeing === 'Normal and Healthy' ? 100 : 40) + (sbaData?.mentalWellbeing === 'Normal and Healthy' ? 100 : 40)) / 2);
    const skillsValue = sbaData ? (proficiencyToPercent(sbaData.creativity) + proficiencyToPercent(sbaData.criticalThinking) + proficiencyToPercent(sbaData.communicationSkill) + proficiencyToPercent(sbaData.problemSolvingAbility) + proficiencyToPercent(sbaData.collaboration)) / 5 : 0;
    const participationValue = sbaData ? proficiencyToPercent(sbaData.participationInActivities) : 0;
    const attitudeValue = sbaData ? proficiencyToPercent(sbaData.attitudeAndValues) : 0;
    const presentationValue = sbaData ? proficiencyToPercent(sbaData.presentationSkill) : 0;
    const writingValue = sbaData ? proficiencyToPercent(sbaData.writingSkill) : 0;
    const comprehensionValue = sbaData ? proficiencyToPercent(sbaData.comprehensionSkill) : 0;
    
    let totalAcademicMarks = 0;
    let maxAcademicMarks = 0;
    academicMarksBySubject.forEach(mark => {
        const total = (mark.fa1||0)+(mark.fa2||0)+(mark.fa3||0)+(mark.fa4||0)+(mark.fa5||0)+(mark.fa6||0);
        totalAcademicMarks += total;
        maxAcademicMarks += 30;
    });
    const academicValue = maxAcademicMarks > 0 ? (totalAcademicMarks / maxAcademicMarks) * 100 : 0;
    const coCurricularValue = (totalCoCurricularScore / 20) * 100;

    const impressionMessages = [
        healthValue < 75 && "Your child has a health issue, please contact the School authorities for further assistance",
        skillsValue < 50 && "Your Child's 21st century skills are not satisfactory. We recommend focusing on its improvement.",
        participationValue < 50 && "Your child's participation in various activities has been a bit less, please contact school authoities for further improvement.",
        attitudeValue < 50 && "Dear parent there have concerns about your child's attitude and values. Let's discuss how we can address this together.",
        presentationValue < 50 && "Dear parent Your child has not good presentation skill. Let's discuss how we can address this together.",
        writingValue < 50 && "Dear parent Your child has not good writing skill. Let's discuss how we can address this together.",
        comprehensionValue < 50 && "Dear parent Your child is facing challenges with comprehension skills. Let's explore ways to support their improvement.",
        academicValue < 50 && "Dear parent Your child is facing challenges with academic performance. Let's explore ways to support its improvement.",
        coCurricularValue < 50 && "Dear parent Your child is facing challenges with Co-curricular activities. Let's explore ways to support its improvement.",
        sbaData?.studentsTalent && sbaData.studentsTalent !== 'No talent' && `Your child has remarkable talent like ${sbaData.studentsTalent}`
    ].filter(Boolean);

    return (
        <div className="font-sans">
            <style>{`.page-break { page-break-after: always; }`}</style>

            {/* Page 1 */}
            <PageContainer id={`hpc-page1-${student.id}`}>
                <p className="text-center font-semibold">Govt. of Jammu and Kashmir</p>
                <h1 className="text-center text-xl font-bold border-y-2 border-black my-2 py-1">GOVERNMENT MIDDLE SCHOOL SENZI</h1>
                <h2 className="text-center text-lg font-bold text-cyan-600 my-4">Holistic Progress Card</h2>
                <h3 className="text-center text-md font-bold underline my-4">Student Profile</h3>

                <div className="flex-grow flex items-center justify-center">
                    <div className="grid grid-cols-5 gap-4 w-full">
                        <div className="col-span-1"></div>
                        <div className="col-span-3 flex flex-col items-center">
                            {photo ? <img src={photo} alt="Student" className="w-28 h-32 object-cover border-2 border-black" /> : <div className="w-28 h-32 border-2 border-black bg-gray-200"></div>}
                            <div className="border-2 border-dashed border-black p-2 mt-4 w-full text-xs space-y-1">
                                {[
                                    {label: "Admission No", value: student.admissionNo}, {label: "Name", value: student.name},
                                    {label: "Father's Name", value: student.fathersName}, {label: "Mother's Name", value: student.mothersName},
                                    {label: "Father's Occupation", value: fatherOccupation}, {label: "Date of Birth", value: student.dob},
                                    {label: "Address", value: student.address}, {label: "Gender", value: student.gender},
                                    {label: "Class", value: student.className}, {label: "Category", value: student.category},
                                    {label: "Aadhar No", value: student.aadharNo}, {label: "Bank Account", value: student.accountNo},
                                    {label: "Bank Name", value: schoolDetails.name}, // Assuming school bank, not student's. Document is ambiguous.
                                    {label: "IFSC Code", value: student.ifscCode}, {label: "Contact No", value: student.contact},
                                ].map(item => (
                                    <p key={item.label}><strong className="w-32 inline-block">{item.label}:</strong> {item.value}</p>
                                ))}
                            </div>
                        </div>
                        <div className="col-span-1"></div>
                    </div>
                </div>

                <div className="flex justify-end mt-auto pt-4">
                    <div className="text-center">
                        <p className="font-bold">Principal/Headmaster</p>
                        <p>{schoolDetails.name}</p>
                    </div>
                </div>
                 <p className="text-[8px] text-center mt-2">This document was created from School Management Mobile System by Imran Gani Mugloo Teacher Zone Vailoo</p>
            </PageContainer>
            
            {/* Page 2 */}
            <PageContainer id={`hpc-page2-${student.id}`}>
                 <div className="space-y-2 text-[9px]">
                    <div>
                        <h4 className="font-bold">1. Student Physical and Mental Wellbeing:</h4>
                        <table className="w-full border-collapse"><tbody><tr>
                            <Td className="font-semibold w-1/3">Physical Wellbeing</Td><Td className="font-semibold w-1/3">Mental Wellbeing</Td><Td className="font-semibold w-1/3">Disease Found</Td>
                        </tr><tr>
                            <Td className="h-4">{sbaData?.physicalWellbeing}</Td><Td>{sbaData?.mentalWellbeing}</Td><Td>{sbaData?.diseaseFound}</Td>
                        </tr></tbody></table>
                    </div>
                    <div>
                        <h4 className="font-bold">2. 21st century learning skills (Proficiency Levels):</h4>
                        <table className="w-full border-collapse"><tbody><tr>
                            <Td className="font-semibold">Creativity</Td><Td className="font-semibold">Critical Thinking</Td><Td className="font-semibold">Communication Skill</Td><Td className="font-semibold">Problem Solving</Td><Td className="font-semibold">Collaboration</Td>
                        </tr><tr>
                            <Td className="h-4">{sbaData?.creativity}</Td><Td>{sbaData?.criticalThinking}</Td><Td>{sbaData?.communicationSkill}</Td><Td>{sbaData?.problemSolvingAbility}</Td><Td>{sbaData?.collaboration}</Td>
                        </tr></tbody></table>
                    </div>
                    <div>
                        <h4 className="font-bold">3. Other Attributes:(Proficiency Levels):</h4>
                        <table className="w-full border-collapse"><tbody><tr>
                            <Td className="font-semibold">Talent</Td><Td className="font-semibold">Participation</Td><Td className="font-semibold">Attitude</Td><Td className="font-semibold">Presentation</Td><Td className="font-semibold">Writing</Td><Td className="font-semibold">Comprehension</Td>
                        </tr><tr>
                            <Td className="h-4">{sbaData?.studentsTalent}</Td><Td>{sbaData?.participationInActivities}</Td><Td>{sbaData?.attitudeAndValues}</Td><Td>{sbaData?.presentationSkill}</Td><Td>{sbaData?.writingSkill}</Td><Td>{sbaData?.comprehensionSkill}</Td>
                        </tr></tbody></table>
                    </div>
                    <div>
                        <h4 className="font-bold">4. Formative Assessment:</h4>
                        <p className="font-semibold ml-4">A. Aademic Performance:</p>
                        <table className="w-full border-collapse"><thead>
                            <tr><Th>Subject</Th><Th>F1</Th><Th>F2</Th><Th>F3</Th><Th>F4</Th><Th>F5</Th><Th>F6</Th><Th>Total @ 30</Th></tr>
                        </thead><tbody>
                            {SUBJECTS.map(subject => {
                                const mark = academicMarksBySubject.get(subject);
                                const total = (mark?.fa1||0)+(mark?.fa2||0)+(mark?.fa3||0)+(mark?.fa4||0)+(mark?.fa5||0)+(mark?.fa6||0);
                                return (<tr key={subject}>
                                    <Td className="text-left">{subject}</Td><Td>{mark?.fa1||'-'}</Td><Td>{mark?.fa2||'-'}</Td><Td>{mark?.fa3||'-'}</Td>
                                    <Td>{mark?.fa4||'-'}</Td><Td>{mark?.fa5||'-'}</Td><Td>{mark?.fa6||'-'}</Td><Td>{total||'-'}</Td>
                                </tr>);
                            })}
                        </tbody></table>
                        <p className="font-semibold ml-4 mt-1">B. Co-Curricular Activities:</p>
                        <table className="w-full border-collapse"><thead><tr>
                           {['Formative Assessment @ 4', 'Physical Activities @ 4', 'Participation @ 4', 'Culture & Creativity @ 4', 'Health & Hygiene @ 2', 'Environment/IT @ 2', 'Discipline @ 2', 'Attendance @ 2', 'Total @ 20'].map(h => <Th key={h}>{h}</Th>)}
                        </tr></thead><tbody><tr>
                            <Td className="h-4">-</Td>
                            <Td>{coCurricularScores['physicalActivity'] || '-'}</Td><Td>{coCurricularScores['participationInSchoolActivities'] || '-'}</Td>
                            <Td>{coCurricularScores['culturalAndCreativeActivities'] || '-'}</Td><Td>{coCurricularScores['healthAndHygiene'] || '-'}</Td>
                            <Td>{coCurricularScores['environmentAndITAwareness'] || '-'}</Td><Td>{coCurricularScores['discipline'] || '-'}</Td>
                            <Td>{coCurricularScores['attendance'] || '-'}</Td><Td>{totalCoCurricularScore}</Td>
                        </tr></tbody></table>
                    </div>
                     <div>
                        <h4 className="font-bold">5. Anecdotal Record:</h4>
                        <table className="w-full border-collapse"><thead><tr>
                            <Th className="w-1/4">Dated</Th><Th>Teachers Observation</Th>
                        </tr></thead><tbody>
                            {allDetailedFA.slice(0, 3).map((fa, i) => (
                                <tr key={i}><Td className="h-8">{fa.anecdotalRecord?.date}</Td><Td className="text-left">{fa.anecdotalRecord?.observation}</Td></tr>
                            ))}
                            {allDetailedFA.length === 0 && <tr><Td className="h-8">&nbsp;</Td><Td></Td></tr>}
                        </tbody></table>
                    </div>
                     <div className="bg-pink-100 border border-pink-300 p-2 mt-4 text-center">
                        <p>Dear <strong>{student.fathersName}</strong></p>
                        <p>I am presenting a comprehensive meter analysis of your child's overall performance for your insights and awareness:</p>
                    </div>
                    <div className="flex justify-around mt-2">
                        <button className="bg-yellow-200 border border-yellow-400 px-4 py-1 rounded">1. Student Health</button>
                        <button className="bg-yellow-200 border border-yellow-400 px-4 py-1 rounded">2. 21st Century Skills</button>
                        <button className="bg-yellow-200 border border-yellow-400 px-4 py-1 rounded">3. Participation in activities</button>
                    </div>
                 </div>
                 <p className="text-[8px] text-center mt-auto">This document was created from School Management Mobile System by Imran Gani Mugloo Teacher Zone Vailoo</p>
            </PageContainer>

             {/* Page 3 */}
            <PageContainer id={`hpc-page3-${student.id}`}>
                 <div className="grid grid-cols-3 gap-4">
                    <ReportCardThermometer label="1. Student Health" value={healthValue} />
                    <ReportCardThermometer label="2. 21st Century Skills" value={skillsValue} />
                    <ReportCardThermometer label="3. Participation" value={participationValue} />
                    <ReportCardThermometer label="4. Student Attitude & Value" value={attitudeValue} />
                    <ReportCardThermometer label="5. Presentation Skill" value={presentationValue} />
                    <ReportCardThermometer label="6. Writing Skill" value={writingValue} />
                    <ReportCardThermometer label="7. Comprehension Skill" value={comprehensionValue} />
                    <ReportCardThermometer label="8. Academic Performance" value={academicValue} />
                    <ReportCardThermometer label="9. Co-Curricular Activity" value={coCurricularValue} />
                 </div>
                 <div className="mt-4">
                    <h4 className="font-bold text-md">Impression:</h4>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                        {impressionMessages.map((msg, i) => <li key={i}>{msg}</li>)}
                    </ul>
                 </div>
                 <div className="flex justify-end mt-auto pt-4">
                    <div className="text-center">
                        <p className="font-bold">Principal/Headmaster</p>
                    </div>
                </div>
                 <p className="text-[8px] text-center mt-2">This document was created from School Management Mobile System by Imran Gani Mugloo Teacher Zone Vailoo</p>
            </PageContainer>

            {/* Page 4 */}
            <PageContainer id={`hpc-page4-${student.id}`}>
                <div className="flex-grow bg-yellow-50"></div>
                <div className="flex justify-between items-end">
                    <span></span>
                    <p className="font-semibold">{schoolDetails.name}</p>
                </div>
                <p className="text-[8px] text-center mt-2">This document was created from School Management Mobile System by Imran Gani Mugloo Teacher Zone Vailoo</p>
            </PageContainer>
        </div>
    );
};

export default HolisticProgressCard;