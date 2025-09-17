
import React from 'react';
import { Student, SchoolDetails, HPCReportData } from '../types';

interface HPCMiddleCardProps {
  student: Student;
  schoolDetails: SchoolDetails;
  hpcData: HPCReportData;
}

const STAGE_CONFIG = {
    Middle: {
        domains: ['Humanities', 'Science', 'Mathematics', 'Vocational Education', 'Arts', 'Sports'],
        aspects: {
            self: ['My Strengths', 'My Barriers', 'My Goals'],
            peer: ['Strengths of My Friend', 'Suggestions for My Friend'],
            teacher: ['Teacher\'s Observations on Student\'s Personality Traits']
        },
        partA4Resources: { books: "Books at home", internet: "Internet", newspaper: "Newspaper/Magazines", tv: "TV", adults: "Adults for discussion" },
        partA4Support: { studyHabits: "Study habits", emotionalSupport: "Emotional support", healthNutrition: "Health and nutrition", socialSkills: "Social skills", careerGuidance: "Career guidance" },
        partA4Understanding: { childsStrengths: "Child's strengths", childsInterests: "Child's interests", childsNeeds: "Child's needs", childsLearningStyle: "Child's learning style" }
    },
};

const HPCMiddleCard: React.FC<HPCMiddleCardProps> = ({ student, schoolDetails, hpcData }) => {

    const DetailBox: React.FC<{ label: string; value: string | undefined | null; className?: string }> = ({ label, value, className }) => (
        <div className={`flex items-baseline ${className}`}>
            <span className="font-semibold w-28 flex-shrink-0 text-gray-800">{label}:</span>
            <span className="flex-1 border-b border-dotted border-gray-500 pl-1">{value || ''}</span>
        </div>
    );
    
    const SummaryRow: React.FC<{ domain: string }> = ({ domain }) => {
        const summary = hpcData.summaries[domain] || {};
        return (
             <tr className="text-center">
                <td className="border p-1 text-left font-semibold">{domain}</td>
                <td className="border p-1 h-10 text-left align-top text-[10px] leading-tight">{summary.teacherRemarks}</td>
            </tr>
        );
    };

    const AssessmentBox: React.FC<{ title: string; aspects: string[]; data: { [key: string]: string } | undefined; className?: string }> = ({ title, aspects, data, className }) => (
        <div className={`border border-gray-400 p-2 h-full flex flex-col ${className}`}>
            <h4 className="font-bold text-center mb-1">{title}</h4>
            <div className="flex-grow space-y-1">
                {aspects.map(aspect => (
                    <div key={aspect}>
                        <p className="font-semibold mt-1">{aspect}:</p>
                        <p className="border-b border-dotted min-h-[1.5rem]">{data?.[aspect] || ''}</p>
                    </div>
                ))}
            </div>
        </div>
    );

    const LabeledText: React.FC<{label: string, value: string | string[] | undefined}> = ({label, value}) => (
        <div>
            <p className="font-semibold mt-1">{label}:</p>
            <p className="border-b border-dotted min-h-[1.5rem]">{Array.isArray(value) ? value.join(', ') : value || ''}</p>
        </div>
    );

    return (
        <div className="text-black font-sans leading-tight text-[10px]">
            {/* Page 1 */}
            <div className="A4-page bg-white shadow-lg p-6 flex flex-col my-4">
                 <header className="text-center mb-4">
                    <h1 className="text-lg font-bold">HOLISTIC PROGRESS CARD (HPC) - MIDDLE STAGE</h1>
                    <p className="text-base">Academic Year: {hpcData.academicYear}</p>
                 </header>

                 <section className="border-2 border-purple-600 p-3 rounded-md">
                    <h2 className="text-center font-bold text-base text-purple-700 mb-2">PART-A: GENERAL INFORMATION</h2>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                        <DetailBox label="School Name" value={schoolDetails.name} className="col-span-2" />
                        <DetailBox label="Student's Name" value={student.name} />
                        <DetailBox label="Admission No." value={student.admissionNo} />
                        <DetailBox label="Mother Tongue" value={hpcData.middleData?.partA1?.motherTongue} />
                        <DetailBox label="Area (Rural/Urban)" value={hpcData.middleData?.partA1?.ruralOrUrban} />
                    </div>
                 </section>
                 
                 <section className="border-2 border-purple-600 p-2 rounded-md mt-3">
                    <h2 className="text-center font-bold text-base text-purple-700 mb-2">PART-B: STUDENT'S PROGRESS IN VARIOUS DOMAINS</h2>
                     <table className="w-full border-collapse border border-gray-400">
                         <thead className="bg-purple-100 text-sm">
                            <tr>
                                <th className="border p-1 w-1/4">Domains</th>
                                <th className="border p-1">Teacher's Remarks on Progress</th>
                            </tr>
                        </thead>
                         <tbody>{STAGE_CONFIG.Middle.domains.map(domain => (<SummaryRow key={domain} domain={domain} />))}</tbody>
                     </table>
                 </section>

                  <section className="border-2 border-purple-600 p-3 rounded-md mt-3 flex-grow">
                    <h2 className="text-center font-bold text-base text-purple-700 mb-2">PART-C: STUDENT'S SELF, PEER & TEACHER ASSESSMENT</h2>
                    <div className="grid grid-cols-3 gap-2 h-full">
                        <AssessmentBox title="Self Assessment" aspects={STAGE_CONFIG.Middle.aspects.self} data={hpcData.middleData?.selfAssessment} />
                        <AssessmentBox title="Peer Assessment" aspects={STAGE_CONFIG.Middle.aspects.peer} data={hpcData.middleData?.peerAssessment} />
                        <AssessmentBox title="Teacher Assessment" aspects={STAGE_CONFIG.Middle.aspects.teacher} data={hpcData.middleData?.teacherAssessment} />
                    </div>
                  </section>
                 
                 <footer className="mt-auto pt-8 flex justify-between items-end">
                    <div className="text-center w-1/3"><div className="border-t-2 border-gray-500 mb-1"></div><p className="font-semibold">Parent's Signature</p></div>
                    <div className="text-center w-1/3"><div className="border-t-2 border-gray-500 mb-1"></div><p className="font-semibold">Teacher's Signature</p></div>
                    <div className="text-center w-1/3"><div className="border-t-2 border-gray-500 mb-1"></div><p className="font-semibold">Principal's Signature</p></div>
                </footer>
            </div>

             {/* Page 2 */}
            <div className="A4-page bg-white shadow-lg p-6 flex flex-col my-4">
                 <header className="text-center mb-4">
                    <h1 className="text-lg font-bold">HOLISTIC PROGRESS CARD - MIDDLE STAGE (Contd.)</h1>
                 </header>

                 <section className="border-2 border-purple-600 p-3 rounded-md">
                    <h2 className="text-center font-bold text-base text-purple-700 mb-2">PART-A2: SELF-PERCEPTION & GOALS</h2>
                    <LabeledText label="Academic Goal for the Year" value={hpcData.middleData?.partA2?.academicGoal} />
                    <LabeledText label="Personal/Social Goal for the Year" value={hpcData.middleData?.partA2?.personalGoal} />
                    <LabeledText label="Things I have learnt in school" value={hpcData.middleData?.partA2?.thingsLearntAtSchool} />
                    <LabeledText label="Things I have learnt outside school" value={hpcData.middleData?.partA2?.thingsLearntOutsideSchool} />
                 </section>
                 
                 <section className="border-2 border-purple-600 p-3 rounded-md mt-3">
                    <h2 className="text-center font-bold text-base text-purple-700 mb-2">PART-A3: MY AMBITION IN LIFE</h2>
                    <LabeledText label="My Ambition is" value={hpcData.middleData?.partA3?.myAmbition} />
                    <LabeledText label="Skills I need" value={hpcData.middleData?.partA3?.skillsForAmbition} />
                    <LabeledText label="Habits I need to develop" value={hpcData.middleData?.partA3?.habitsForAmbition} />
                 </section>

                 <section className="border-2 border-purple-600 p-3 rounded-md mt-3 flex-grow">
                    <h2 className="text-center font-bold text-base text-purple-700 mb-2">PART-A4: PARENT FEEDBACK</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h4 className="font-bold">Resources at home:</h4>
                            {Object.entries(STAGE_CONFIG.Middle.partA4Resources).map(([key, label]) => (
                                <p key={key}>{label}: <span className="font-semibold">{hpcData.middleData?.partA4?.resourcesAvailable?.[key as keyof typeof STAGE_CONFIG.Middle.partA4Resources] ? 'Yes' : 'No'}</span></p>
                            ))}
                        </div>
                         <div>
                            <h4 className="font-bold">Support needed:</h4>
                            {Object.entries(STAGE_CONFIG.Middle.partA4Support).map(([key, label]) => (
                                <p key={key}>{label}: <span className="font-semibold">{hpcData.middleData?.partA4?.needsSupportWith?.[key as keyof typeof STAGE_CONFIG.Middle.partA4Support] ? 'Yes' : 'No'}</span></p>
                            ))}
                        </div>
                        <div className="col-span-2">
                            <h4 className="font-bold">Parent's understanding of child:</h4>
                            {Object.entries(STAGE_CONFIG.Middle.partA4Understanding).map(([key, label]) => (
                                <p key={key}>{label}: <span className="font-semibold">{hpcData.middleData?.partA4?.understandingOfChild?.[key as keyof typeof STAGE_CONFIG.Middle.partA4Understanding] || '-'}</span></p>
                            ))}
                        </div>
                        <div className="col-span-2">
                             <LabeledText label="How I will support my child" value={hpcData.middleData?.partA4?.howParentWillSupport} />
                        </div>
                    </div>
                 </section>
            </div>
        </div>
    );
};

export default HPCMiddleCard;
