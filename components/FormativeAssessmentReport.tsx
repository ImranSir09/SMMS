import React from 'react';
import { Student, SchoolDetails, SbaReportData, Mark, DetailedFormativeAssessment, FormativeProficiencyLevel } from '../types';
import { SUBJECTS } from '../constants';
import ProficiencyBarChart from './ProficiencyBarChart';

// Props Interface
interface FormativeAssessmentReportProps {
    student: Student;
    schoolDetails: SchoolDetails;
    sbaData: SbaReportData | null;
    allMarks: Mark[];
    allDetailedFA: DetailedFormativeAssessment[];
    photoOverride?: string | null;
}

// Helper Components
const PageContainer: React.FC<{ children: React.ReactNode, id: string, isLastPage?: boolean }> = ({ children, id, isLastPage = false }) => (
    <div id={id} className={`w-[210mm] h-[297mm] bg-white p-4 font-sans text-black text-xs relative overflow-hidden ${!isLastPage ? 'page-break' : ''}`}>
        <div className="w-full h-full border-2 border-dashed border-black p-2 flex flex-col">
            {children}
        </div>
    </div>
);

const Td: React.FC<{ children: React.ReactNode, className?: string, colSpan?: number }> = ({ children, className = '', colSpan }) => (
    <td className={`border border-black p-1 text-center ${className}`} colSpan={colSpan}>{children}</td>
);
const Th: React.FC<{ children: React.ReactNode, className?: string, colSpan?: number, rowSpan?: number }> = ({ children, className = '', colSpan, rowSpan }) => (
    <th className={`border border-black p-1 font-semibold bg-cyan-100 ${className}`} colSpan={colSpan} rowSpan={rowSpan}>{children}</th>
);

const SectionTitle: React.FC<{ title: string }> = ({ title }) => (
    <h3 className="font-bold text-sm my-1">{title}</h3>
);

// Main Component
const FormativeAssessmentReport: React.FC<FormativeAssessmentReportProps> = ({
    student, schoolDetails, sbaData, allMarks, allDetailedFA, photoOverride
}) => {
    
    const photo = photoOverride !== undefined ? photoOverride : student.photo;
    
    // --- Data Processing ---
    const proficiencyCounts = allDetailedFA.reduce((acc, fa) => {
        const level = fa.academicProficiency;
        if (level && level !== 'Not-Satisfied') {
            acc[level] = (acc[level] || 0) + 1;
        }
        return acc;
    }, {} as Record<FormativeProficiencyLevel, number>);

    const chartData = [
        { label: 'Sky', value: proficiencyCounts['Sky'] || 0, color: '#3b82f6' },
        { label: 'Mountain', value: proficiencyCounts['Mountain'] || 0, color: '#f97316' },
        { label: 'Stream', value: proficiencyCounts['Stream'] || 0, color: '#808080' },
    ];

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

    return (
        <div>
            <style>{`.page-break { page-break-after: always; }`}</style>
            
            {/* Page 1 */}
            <PageContainer id={`fa-report-p1-${student.id}`}>
                <header className="text-center">
                    <p className="font-semibold">Govt. of Jammu and Kashmir</p>
                    <h1 className="text-2xl font-bold">{schoolDetails.name}</h1>
                </header>

                <div className="grid grid-cols-3 gap-2 my-2">
                    <div className="col-span-1">
                        {photo ? <img src={photo} alt="Student" className="w-full h-36 object-cover border-2 border-black" /> : <div className="w-full h-36 border-2 border-black bg-gray-200"></div>}
                    </div>
                    <div className="col-span-2 h-36">
                        <ProficiencyBarChart data={chartData} title="Student Proficiency level" />
                    </div>
                </div>

                <SectionTitle title="1. Student Profile:" />
                <table className="w-full border-collapse">
                    <thead><tr>
                        {['Adm No', 'Name', "Father's", "Mother's", 'D.O.B', 'Address', 'Class', 'Category', 'Aadhal No', 'Contact'].map(h => <Th key={h}>{h}</Th>)}
                    </tr></thead>
                    <tbody><tr>
                        {[student.admissionNo, student.name, student.fathersName, student.mothersName, student.dob, student.address, student.className, student.category, student.aadharNo, student.contact].map((d,i) => <Td key={i} className="h-5">{d}</Td>)}
                    </tr></tbody>
                </table>
                
                <SectionTitle title="2. Student Physical and Mental Wellbeing:" />
                <table className="w-full border-collapse"><tbody><tr>
                    <Th className="w-1/3">Physical Wellbeing</Th><Th className="w-1/3">Mental Wellbeing</Th><Th className="w-1/3">Disease Found</Th>
                </tr><tr>
                    <Td className="h-5">{sbaData?.physicalWellbeing}</Td><Td>{sbaData?.mentalWellbeing}</Td><Td>{sbaData?.diseaseFound}</Td>
                </tr></tbody></table>

                <SectionTitle title="3. 21st century learning skills (Proficiency Levels):" />
                <table className="w-full border-collapse"><tbody><tr>
                    <Th>Creativity</Th><Th>Critical Thinking</Th><Th>Communication</Th><Th>Problem Solving</Th><Th>Collaboration</Th>
                </tr><tr>
                    <Td className="h-5">{sbaData?.creativity}</Td><Td>{sbaData?.criticalThinking}</Td><Td>{sbaData?.communicationSkill}</Td><Td>{sbaData?.problemSolvingAbility}</Td><Td>{sbaData?.collaboration}</Td>
                </tr></tbody></table>
                
                <SectionTitle title="4. Other Attributes:(Proficiency Levels):" />
                <table className="w-full border-collapse"><tbody><tr>
                    <Th>Talent</Th><Th>Participation</Th><Th>Attitude</Th><Th>Presentation</Th><Th>Writing</Th><Th>Comprehension</Th>
                </tr><tr>
                    <Td className="h-5">{sbaData?.studentsTalent}</Td><Td>{sbaData?.participationInActivities}</Td><Td>{sbaData?.attitudeAndValues}</Td><Td>{sbaData?.presentationSkill}</Td><Td>{sbaData?.writingSkill}</Td><Td>{sbaData?.comprehensionSkill}</Td>
                </tr></tbody></table>

                <SectionTitle title="5. Formative Assessment:" />
            </PageContainer>
            
            {/* Page 2 */}
            <PageContainer id={`fa-report-p2-${student.id}`} isLastPage>
                <div className="flex-grow space-y-2">
                    <div>
                        <h4 className="font-semibold ml-4">A. Aademic Performance:</h4>
                        <table className="w-full border-collapse">
                            <thead><tr>
                                <Th>Subject</Th><Th>F1</Th><Th>F2</Th><Th>F3</Th><Th>F4</Th><Th>F5</Th><Th>F6</Th><Th>Total Score @ 30</Th>
                            </tr></thead>
                            <tbody>
                            {SUBJECTS.map(subject => {
                                const mark = academicMarksBySubject.get(subject);
                                const total = (mark?.fa1||0)+(mark?.fa2||0)+(mark?.fa3||0)+(mark?.fa4||0)+(mark?.fa5||0)+(mark?.fa6||0);
                                return (<tr key={subject}>
                                    <Td className="text-left">{subject}</Td><Td>{mark?.fa1||'-'}</Td><Td>{mark?.fa2||'-'}</Td><Td>{mark?.fa3||'-'}</Td>
                                    <Td>{mark?.fa4||'-'}</Td><Td>{mark?.fa5||'-'}</Td><Td>{mark?.fa6||'-'}</Td><Td>{total||'-'}</Td>
                                </tr>);
                            })}
                            </tbody>
                        </table>
                    </div>
                    <div>
                        <h4 className="font-semibold ml-4">B. Co-Curricular Activities:</h4>
                        <table className="w-full border-collapse text-[9px]"><thead><tr>
                           {['Formative Assess.', 'Physical Act. @4', 'Participation @4', 'Culture @4', 'Health @2', 'Env/IT @2', 'Discipline @2', 'Attendance @2', 'Total @20'].map(h => <Th key={h}>{h}</Th>)}
                        </tr></thead><tbody><tr>
                            <Td className="h-4">-</Td>
                            <Td>{coCurricularScores['physicalActivity'] || '-'}</Td><Td>{coCurricularScores['participationInSchoolActivities'] || '-'}</Td>
                            <Td>{coCurricularScores['culturalAndCreativeActivities'] || '-'}</Td><Td>{coCurricularScores['healthAndHygiene'] || '-'}</Td>
                            <Td>{coCurricularScores['environmentAndITAwareness'] || '-'}</Td><Td>{coCurricularScores['discipline'] || '-'}</Td>
                            <Td>{coCurricularScores['attendance'] || '-'}</Td><Td>{totalCoCurricularScore}</Td>
                        </tr></tbody></table>
                    </div>
                     <div>
                        <h4 className="font-bold text-sm">6. Anecdotal Record:</h4>
                        <table className="w-full border-collapse"><thead><tr>
                            <Th className="w-1/4">Dated</Th><Th>Teachers Observation</Th>
                        </tr></thead><tbody>
                            {allDetailedFA.slice(0, 5).map((fa, i) => (
                                <tr key={i}><Td className="h-8">{fa.anecdotalRecord?.date}</Td><Td className="text-left">{fa.anecdotalRecord?.observation}</Td></tr>
                            ))}
                            {Array.from({ length: Math.max(0, 5 - allDetailedFA.length) }).map((_, i) => (
                               <tr key={`empty-${i}`}><Td className="h-8">&nbsp;</Td><Td></Td></tr>
                            ))}
                        </tbody></table>
                    </div>
                </div>
                <div className="mt-auto pt-16 flex justify-end">
                    <div className="text-center">
                        <p className="font-bold text-sm">Principal/Headmaster</p>
                        <p className="text-xs">{schoolDetails.name}</p>
                    </div>
                </div>
            </PageContainer>
        </div>
    );
};

export default FormativeAssessmentReport;
