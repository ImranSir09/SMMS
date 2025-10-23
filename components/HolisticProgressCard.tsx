import React from 'react';
import { Student, SchoolDetails, SbaReportData, Mark, DetailedFormativeAssessment, StudentExamData, Exam, HPCReportData, FormativeProficiencyLevel } from '../types';
import ThermometerGauge from './ThermometerGauge';

interface ReportProps {
    student: Student;
    schoolDetails: SchoolDetails;
    sbaData: SbaReportData | null;
    hpcData: HPCReportData | null;
    allMarks: Mark[];
    allDetailedFA: DetailedFormativeAssessment[];
    allStudentExamData: StudentExamData[];
    allExams: Exam[];
}

const SUBJECT_ORDER = ['English', 'Math', 'Science', 'Social Science', 'Urdu', 'Kashmiri'];

const processAcademicData = (allMarks: Mark[], allExams: Exam[]) => {
    const examsMap = new Map<number, string>(allExams.map(e => [e.id!, e.name]));
    const subjectData: { [subject: string]: { [fa: string]: number | undefined } } = {};

    for (const mark of allMarks) {
        if (!subjectData[mark.subject]) subjectData[mark.subject] = {};
        for (let i = 1; i <= 6; i++) {
            const faKey = `fa${i}` as keyof Mark;
            if (mark[faKey] !== undefined) {
                subjectData[mark.subject][`F${i}`] = mark[faKey] as number;
            }
        }
    }
    return subjectData;
};

const getLatestDetailedFA = (allDetailedFA: DetailedFormativeAssessment[]) => {
    if (!allDetailedFA || allDetailedFA.length === 0) return null;
    // Get the latest record based on FA number (F6 > F1)
    return allDetailedFA.sort((a, b) => (b.assessmentName || '').localeCompare(a.assessmentName || ''))[0];
};

const mapProficiencyToScore = (level: FormativeProficiencyLevel | undefined, maxScore: number): number => {
    switch (level) {
        case 'Sky': return maxScore;
        case 'Mountain': return Math.round(maxScore * 0.66);
        case 'Stream': return Math.round(maxScore * 0.33);
        case 'Not-Satisfied': return 0;
        default: return 0;
    }
};

const mapSbaToPercent = (level: any): number => {
    if (!level) return 0;
    switch(level) {
        case 'High':
        case 'Talented':
        case 'Highly Talented':
        case 'Normal and Healthy': return 90;
        case 'Medium': return 60;
        case 'Low': 
        case 'No talent':
        case 'Needs Attention': return 30;
        default: return 0;
    }
}


const HolisticProgressCard: React.FC<ReportProps> = ({ student, schoolDetails, sbaData, hpcData, allMarks, allDetailedFA, allExams }) => {
    const academicData = processAcademicData(allMarks, allExams);
    const latestDetailedFA = getLatestDetailedFA(allDetailedFA);

    const impressions: string[] = [];
    const gaugeData: { label: string; value: number; impression?: string }[] = [];
    
    // 1. Student Health
    const healthScore = (mapSbaToPercent(sbaData?.physicalWellbeing) + mapSbaToPercent(sbaData?.mentalWellbeing)) / 2;
    gaugeData.push({ label: '1. Student Health', value: healthScore });
    if (healthScore < 50) impressions.push("Your child has a health issue, please contact the School authorities for further assistance");

    // 2. 21st Century Skills
    const skills = [sbaData?.creativity, sbaData?.criticalThinking, sbaData?.communicationSkill, sbaData?.problemSolvingAbility, sbaData?.collaboration];
    const skillScore = skills.reduce((acc, s) => acc + mapSbaToPercent(s), 0) / skills.length;
    gaugeData.push({ label: '2. 21st Century Skills', value: skillScore });
    if (skillScore < 50) impressions.push("Your Child's 21st century skills are not satisfactory. We recommend focusing on its improvement.");

    // 3. Participation
    const participationScore = mapSbaToPercent(sbaData?.participationInActivities);
    gaugeData.push({ label: '3. Participation in activities', value: participationScore });
    if (participationScore < 50) impressions.push("Your child's participation in various activities has been a bit less, please contact school authoities for further improvement.");
    
    // 4. Attitude & Values
    const attitudeScore = mapSbaToPercent(sbaData?.attitudeAndValues);
    gaugeData.push({ label: '4. Student Attitude & Value', value: attitudeScore });
    if(attitudeScore < 50) impressions.push("Dear parent there have concerns about your child's attitude and values. Let's discuss how we can address this together.");

    // 5. Presentation Skill
    const presentationScore = mapSbaToPercent(sbaData?.presentationSkill);
    gaugeData.push({ label: '5. Presentation Skill', value: presentationScore });
    if(presentationScore < 50) impressions.push("Dear parent Your child has not good presentation skill. Let's discuss how we can address this together.");

    // 6. Writing Skill
    const writingScore = mapSbaToPercent(sbaData?.writingSkill);
    gaugeData.push({ label: '6. Writing Skill', value: writingScore });
    if(writingScore < 50) impressions.push("Dear parent Your child has not good writing skill. Let's discuss how we can address this together.");

    // 7. Comprehension Skill
    const comprehensionScore = mapSbaToPercent(sbaData?.comprehensionSkill);
    gaugeData.push({ label: '7. Comprehension Skill', value: comprehensionScore });
    if(comprehensionScore < 50) impressions.push("Dear parent Your child is facing challenges with comprehension skills. Let's explore ways to support their improvement.");
    
    // 8. Academic Performance
    const academicTotal = Object.values(academicData).reduce((sum, subj) => sum + Object.values(subj).reduce((s, m) => s + (m || 0), 0), 0);
    const academicMax = Object.keys(academicData).length * 30; // 6 FAs * 5 marks
    const academicScore = academicMax > 0 ? (academicTotal / academicMax) * 100 : 0;
    gaugeData.push({ label: '8. Academic Performance', value: academicScore });
    if(academicScore < 50) impressions.push("Dear parent Your child is facing challenges with academic performance. Let's explore ways to support its improvement.");

    // 9. Co-curricular
    const coCurricularRatings = latestDetailedFA?.cocurricularRatings;
    let coCurricularTotal = 0;
    let coCurricularMax = 0;
    if (coCurricularRatings) {
        Object.entries(coCurricularRatings).forEach(([key, level]) => {
            const max = ['physicalActivity', 'participationInSchoolActivities', 'culturalAndCreativeActivities'].includes(key) ? 4 : 2;
            coCurricularMax += max;
            coCurricularTotal += mapProficiencyToScore(level, max);
        });
    }
    const coCurricularScore = coCurricularMax > 0 ? (coCurricularTotal / coCurricularMax) * 100 : 0;
    gaugeData.push({ label: '9. Co-Curricular Activity', value: coCurricularScore });
    if(coCurricularScore < 50) impressions.push("Dear parent Your child is facing challenges with Co-curricular activities. Let's explore ways to support its improvement.");
    
    if (sbaData?.studentsTalent === 'Highly Talented' || sbaData?.studentsTalent === 'Talented') {
        impressions.push("Your child has remarkable talent like...");
    }

    return (
        <div className="text-black font-sans leading-tight text-[10px] bg-yellow-50">
            {/* PAGE 1 */}
            <div className="A4-page bg-white p-6 flex flex-col my-4 relative border-8 border-yellow-300">
                <div className="absolute top-20 left-4">
                    <img src="https://i.imgur.com/3h4jR5r.png" alt="decoration" className="w-48" />
                </div>
                <div className="absolute top-20 right-4">
                     <img src="https://i.imgur.com/3h4jR5r.png" alt="decoration" className="w-48 transform -scale-x-100" />
                </div>
                 <div className="absolute bottom-8 left-4">
                    <img src="https://i.imgur.com/Jz5d1dp.png" alt="boy" className="w-32" />
                 </div>
                <header className="text-center mb-4 z-10">
                    <h1 className="text-3xl font-bold font-gothic text-red-700 border-b-2 border-red-700 inline-block px-4">Holistic Progress Card</h1>
                    <h2 className="text-2xl font-semibold mt-8 underline">Student Profile</h2>
                </header>
                <main className="flex-grow flex flex-col items-center z-10">
                    {student.photo && <img src={student.photo} alt="student" className="w-32 h-40 object-cover border-4 border-gray-400 p-1 mb-4" />}
                    <div className="border-4 border-dashed border-gray-500 p-4 w-full max-w-lg text-base space-y-2">
                        {[
                            { label: "Admission No", value: student.admissionNo },
                            { label: "Name", value: student.name },
                            { label: "Father's Name", value: student.fathersName },
                            { label: "Mother's Name", value: student.mothersName },
                            { label: "Father's Occupation", value: hpcData?.foundationalData?.partA1?.fatherOccupation || hpcData?.preparatoryData?.partA1?.fatherOccupation || hpcData?.middleData?.partA1?.fatherOccupation },
                            { label: "Date of Birth", value: student.dob },
                            { label: "Address", value: student.address },
                            { label: "Gender", value: student.gender },
                            { label: "Class", value: student.className },
                            { label: "Category", value: student.category },
                            { label: "Aadhar No", value: student.aadharNo },
                            { label: "Bank Account", value: student.accountNo },
                            { label: "Bank Name", value: 'JAMMU AND KASHMIR BANK' },
                            { label: "IFSC Code", value: student.ifscCode },
                            { label: "Contact No", value: student.contact },
                        ].map(item => (
                            <div key={item.label} className="flex">
                                <strong className="w-48">{item.label}:</strong>
                                <span>{item.value}</span>
                            </div>
                        ))}
                    </div>
                </main>
                <footer className="mt-auto pt-16 flex justify-end z-10">
                    <div className="text-center">
                        <p className="border-t border-black pt-1">Principal/Headmaster</p>
                        <p>{schoolDetails.name}</p>
                    </div>
                </footer>
            </div>

            {/* PAGE 2 */}
             <div className="A4-page bg-white p-6 flex flex-col my-4 relative border-8 border-yellow-300">
                <div className="space-y-2">
                    <section>
                        <h2 className="bg-cyan-200 font-bold p-1 border border-black">1. Student Physical and Mental Wellbeing:</h2>
                        <table className="w-full border-collapse border border-black"><tbody>
                             <tr>{['Physical Wellbeing', 'Mental Wellbeing', 'Disease Found'].map(h => <th key={h} className="border border-black p-1 bg-cyan-100">{h}</th>)}</tr>
                             <tr>{[sbaData?.physicalWellbeing, sbaData?.mentalWellbeing, sbaData?.diseaseFound].map((d,i) => <td key={i} className="border border-black p-1 text-center h-6">{d || ''}</td>)}</tr>
                        </tbody></table>
                    </section>
                     <section>
                        <h2 className="bg-cyan-200 font-bold p-1 border border-black">2. 21st century learning skills (Proficiency Levels):</h2>
                        <table className="w-full border-collapse border border-black"><tbody>
                             <tr>{['Creativity', 'Critical Thinking', 'Communication Skill (Listening and Speaking)', 'Problem Solving Ability', 'Collaboration'].map(h => <th key={h} className="border border-black p-1 bg-cyan-100">{h}</th>)}</tr>
                             <tr>{[sbaData?.creativity, sbaData?.criticalThinking, sbaData?.communicationSkill, sbaData?.problemSolvingAbility, sbaData?.collaboration].map((d,i) => <td key={i} className="border border-black p-1 text-center h-6">{d || ''}</td>)}</tr>
                        </tbody></table>
                    </section>
                    <section>
                        <h2 className="bg-cyan-200 font-bold p-1 border border-black">3. Other Attributes:(Proficiency Levels):</h2>
                        <table className="w-full border-collapse border border-black"><tbody>
                             <tr>{["Talent of Student", "Participation in Activities", "Attitude and Values", "Presentation Skill", "Writing Skill", "Comprehension Skill"].map(h => <th key={h} className="border border-black p-1 bg-cyan-100 text-[9px]">{h}</th>)}</tr>
                             <tr>{[sbaData?.studentsTalent, sbaData?.participationInActivities, sbaData?.attitudeAndValues, sbaData?.presentationSkill, sbaData?.writingSkill, sbaData?.comprehensionSkill].map((d,i) => <td key={i} className="border border-black p-1 text-center h-6">{d || ''}</td>)}</tr>
                        </tbody></table>
                    </section>
                    <section><h2 className="bg-cyan-200 font-bold p-1 border border-black">4. Formative Assessment:</h2>
                        <h3 className="font-bold pl-2">A. Aademic Performance:</h3>
                        <table className="w-full border-collapse border border-black">
                            <thead className="bg-cyan-100"><tr>{['Subject', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'Total Score @ 30'].map(h => <th key={h} className="border border-black p-1">{h}</th>)}</tr></thead>
                            <tbody>
                                {SUBJECT_ORDER.map(subject => {
                                    const marks = academicData[subject] || {};
                                    const total = Object.values(marks).reduce((s, v) => s + (v || 0), 0);
                                    return ( <tr key={subject}>
                                            <td className="border border-black p-1 font-semibold">{subject}</td>
                                            {['F1','F2','F3','F4','F5','F6'].map(fa => <td key={fa} className="border border-black p-1 text-center h-5">{marks[fa] || ''}</td>)}
                                            <td className="border border-black p-1 text-center font-bold">{total > 0 ? total : ''}</td>
                                        </tr> )
                                })}
                            </tbody>
                        </table>
                        <h3 className="font-bold pl-2 mt-1">B. Co-Curricular Activities:</h3>
                        <table className="w-full border-collapse border border-black">
                            <thead className="bg-cyan-100"><tr>
                                {['Physical @ 4', 'Participation @ 4', 'Culture @ 4', 'Hygiene @ 2', 'Awareness @ 2', 'Discipline @ 2', 'Attendance @ 2', 'Total @ 20'].map(h => 
                                    <th key={h} className="border border-black p-1 text-[8px]">{h.split('@')[0]}<br/>{h.split('@')[1] ? `@ ${h.split('@')[1]}`: ''}</th>)}
                            </tr></thead>
                            <tbody><tr>{[coCurricularRatings?.physicalActivity, coCurricularRatings?.participationInSchoolActivities, coCurricularRatings?.culturalAndCreativeActivities, coCurricularRatings?.healthAndHygiene, coCurricularRatings?.environmentAndITAwareness, coCurricularRatings?.discipline, coCurricularRatings?.attendance, coCurricularScore > 0 ? Math.round(coCurricularTotal) : ''].map((d,i) => <td key={i} className="border border-black p-1 text-center h-5">{d || ''}</td>)}</tr></tbody>
                        </table>
                    </section>
                    <section>
                        <h2 className="bg-cyan-200 font-bold p-1 border border-black">5. Anecdotal Record:</h2>
                        <table className="w-full border-collapse border border-black">
                            <thead className="bg-cyan-100"><tr><th className="border border-black p-1 w-1/4">Dated</th><th className="border border-black p-1">Teachers Observation</th></tr></thead>
                            <tbody><tr>
                                <td className="border border-black p-1 text-center">{latestDetailedFA?.anecdotalRecord?.date || ''}</td>
                                <td className="border border-black p-1 h-12 align-top">{latestDetailedFA?.anecdotalRecord?.observation || ''}</td>
                            </tr></tbody>
                        </table>
                    </section>
                </div>
                 <div className="mt-4 p-2 bg-pink-100 border border-pink-300 rounded-md text-sm">
                    <p><strong>Dear {student.fathersName}</strong></p>
                    <p>I am presenting a comprehensive meter analysis of your child's overall performance for your insights and awareness:</p>
                </div>
                <div className="mt-2 flex justify-around">
                    <button className="bg-cyan-200 border border-cyan-400 text-cyan-800 font-semibold px-4 py-1 rounded-full text-sm">1. Student Health</button>
                    <button className="bg-cyan-200 border border-cyan-400 text-cyan-800 font-semibold px-4 py-1 rounded-full text-sm">2. 21st Century Skills</button>
                    <button className="bg-cyan-200 border border-cyan-400 text-cyan-800 font-semibold px-4 py-1 rounded-full text-sm">3. Participation in activities</button>
                </div>
            </div>

            {/* PAGE 3 */}
            <div className="A4-page bg-white p-6 flex flex-col my-4 relative border-8 border-yellow-300">
                <div className="grid grid-cols-3 gap-4">
                    {gaugeData.map(item => <ThermometerGauge key={item.label} label={item.label} value={item.value} />)}
                </div>
                <div className="mt-4">
                    <h3 className="text-lg font-bold underline">Impression:</h3>
                    <ul className="list-disc list-inside space-y-1 mt-2 text-sm">
                        {impressions.map((imp, i) => <li key={i}>{imp}</li>)}
                    </ul>
                </div>
                 <footer className="mt-auto pt-16 flex justify-end">
                    <div className="text-center">
                        <p className="border-t border-black pt-1">Principal/Headmaster</p>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default HolisticProgressCard;