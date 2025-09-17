
import React from 'react';
import { Student, SchoolDetails, HPCReportData, PreparatoryPartA3, ParentFeedback } from '../types';

interface HPCPreparatoryCardProps {
  student: Student;
  schoolDetails: SchoolDetails;
  hpcData: HPCReportData;
}

const STAGE_CONFIG = {
    Preparatory: {
        domains: ['Cognitive Development', 'Affective Development', 'Psychomotor Development'],
        aspects: {
            self: ['My Strengths', 'My Dreams', 'How I Can Improve'],
            peer: ['What I Like About My Friend', 'What I Want To Tell My Friend']
        },
        partA3Questions: {
            participatesInClass: "Participates in class discussions", asksQuestions: "Asks questions", listensAttentively: "Listens attentively", takesInitiative: "Takes initiative",
            worksIndependently: "Works independently", worksInGroups: "Works well in groups", isOrganized: "Is neat and organized", isPunctual: "Is punctual",
            respectsOthers: "Respects others' opinions", isResponsible: "Is responsible and helpful",
        },
        parentFeedbackQuestions: {
            childIsHappy: "Is your child happy at school?", childSharesLearning: "Does your child share about their learning?", childFeelsSafe: "Does your child feel safe at school?",
            childGetsHelp: "Does your child get help when needed?", parentObservesGrowth: "Have you observed any positive changes?"
        }
    },
};

const HPCPreparatoryCard: React.FC<HPCPreparatoryCardProps> = ({ student, schoolDetails, hpcData }) => {

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
                <td className="border p-1 h-12 text-left align-top text-[10px] leading-tight">{summary.teacherRemarks}</td>
                <td className="border p-1 text-left align-top text-[10px] leading-tight">{summary.parentRemarks}</td>
            </tr>
        );
    };

    const AssessmentBox: React.FC<{ title: string; aspects: string[]; data: { [key: string]: string } | undefined }> = ({ title, aspects, data }) => (
        <div className="border border-gray-400 p-2">
            <h4 className="font-bold text-center mb-1">{title}</h4>
            {aspects.map(aspect => (
                <div key={aspect}>
                    <p className="font-semibold mt-1">{aspect}:</p>
                    <p className="border-b border-dotted min-h-[1.5rem]">{data?.[aspect] || ''}</p>
                </div>
            ))}
        </div>
    );
    
    const SentimentTable: React.FC<{title: string, questions: Record<string, string>, data: any}> = ({title, questions, data}) => (
        <div className="border-2 border-green-600 p-2 rounded-md mt-3">
            <h2 className="text-center font-bold text-base text-green-700 mb-2">{title}</h2>
            <table className="w-full text-left">
                <tbody>
                    {Object.entries(questions).map(([key, label]) => (
                        <tr key={key}>
                            <td className="py-0.5 w-4/5">{label}</td>
                            <td className="py-0.5 text-center font-semibold">{data?.[key] || '-'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="text-black font-sans leading-tight text-[10px]">
            {/* Page 1 */}
            <div className="A4-page bg-white shadow-lg p-6 flex flex-col my-4">
                 <header className="text-center mb-4">
                    <h1 className="text-lg font-bold">HOLISTIC PROGRESS CARD (HPC) - PREPARATORY STAGE</h1>
                    <p className="text-base">Academic Year: {hpcData.academicYear}</p>
                 </header>

                 <section className="border-2 border-green-600 p-3 rounded-md">
                    <h2 className="text-center font-bold text-base text-green-700 mb-2">PART-A: GENERAL INFORMATION</h2>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                        <DetailBox label="School Name" value={schoolDetails.name} className="col-span-2" />
                        <DetailBox label="Student's Name" value={student.name} />
                        <DetailBox label="Admission No." value={student.admissionNo} />
                    </div>
                 </section>

                <section className="border-2 border-green-600 p-3 rounded-md mt-3">
                    <h2 className="text-center font-bold text-base text-green-700 mb-2">PART-A2: ALL ABOUT ME</h2>
                     <DetailBox label="My Family" value={hpcData.preparatoryData?.partA2?.myFamily} className="col-span-2" />
                     <div className="grid grid-cols-3 gap-x-2 mt-1">
                        <DetailBox label="Favorite Food" value={hpcData.preparatoryData?.partA2?.myFavoriteThings?.food} />
                        <DetailBox label="Favorite Games" value={hpcData.preparatoryData?.partA2?.myFavoriteThings?.games} />
                        <DetailBox label="Favorite Festivals" value={hpcData.preparatoryData?.partA2?.myFavoriteThings?.festivals} />
                     </div>
                     <DetailBox label="When I grow up, I want to be" value={hpcData.preparatoryData?.partA2?.whenIGrowUp} className="col-span-2 mt-1" />
                </section>

                 <section className="border-2 border-green-600 p-2 rounded-md mt-3">
                    <h2 className="text-center font-bold text-base text-green-700 mb-2">PART-B: ALL-ROUND DEVELOPMENT</h2>
                     <table className="w-full border-collapse border border-gray-400">
                         <thead className="bg-green-100 text-sm">
                            <tr>
                                <th className="border p-1 w-1/4">Domains of Development</th>
                                <th className="border p-1 w-1/3">Teacher's Remarks</th>
                                <th className="border p-1 w-1/3">Parent's Remarks</th>
                            </tr>
                        </thead>
                         <tbody>{STAGE_CONFIG.Preparatory.domains.map(domain => (<SummaryRow key={domain} domain={domain} />))}</tbody>
                     </table>
                 </section>

                  <section className="border-2 border-green-600 p-3 rounded-md mt-3 flex-grow">
                    <h2 className="text-center font-bold text-base text-green-700 mb-2">PART-C: STUDENT'S SELF & PEER ASSESSMENT</h2>
                    <div className="grid grid-cols-2 gap-2 h-full">
                        <AssessmentBox title="Self Assessment" aspects={STAGE_CONFIG.Preparatory.aspects.self} data={hpcData.preparatoryData?.selfAssessment} />
                        <AssessmentBox title="Peer Assessment" aspects={STAGE_CONFIG.Preparatory.aspects.peer} data={hpcData.preparatoryData?.peerAssessment} />
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
                    <h1 className="text-lg font-bold">HOLISTIC PROGRESS CARD - PREPARATORY STAGE (Contd.)</h1>
                 </header>

                 <SentimentTable title="PART-A3: MY HABITS & DISPOSITIONS" questions={STAGE_CONFIG.Preparatory.partA3Questions} data={hpcData.preparatoryData?.partA3} />
                 
                 <SentimentTable title="PARENT FEEDBACK" questions={STAGE_CONFIG.Preparatory.parentFeedbackQuestions} data={hpcData.preparatoryData?.parentFeedback} />
                
                 <div className="border-2 border-green-600 p-2 rounded-md mt-3 flex-grow">
                     <h2 className="text-center font-bold text-base text-green-700 mb-2">Suggestions for Improvement</h2>
                     <p>{hpcData.preparatoryData?.parentFeedback?.parentSuggestions}</p>
                 </div>
            </div>
        </div>
    );
};

export default HPCPreparatoryCard;
