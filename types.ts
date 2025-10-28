// FIX: Define and export the SchoolDetails interface. The previous import was circular.
export interface SchoolDetails {
  id?: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  udiseCode: string;
  logo: string | null;
}

export interface Session {
  id?: number;
  name: string; // e.g., "2024-25"
}

export interface StudentSessionInfo {
  id?: number;
  studentId: number;
  session: string;
  className: string;
  section: string;
  rollNo: string;
}

export interface Student {
  id?: number;
  name: string;
  admissionNo: string;
  dob: string; // YYYY-MM-DD
  gender: 'Male' | 'Female' | 'Other';
  fathersName: string;
  mothersName: string;
  contact: string;
  address: string;
  admissionDate?: string; // YYYY-MM-DD
  category?: string;
  bloodGroup?: string;
  aadharNo?: string;
  accountNo?: string;
  ifscCode?: string;
  photo?: string | null;
  // FIX: Add optional properties to match UI component expectations after DB schema change.
  // The UI logic has not been updated to handle the separation of student and session info.
  className?: string;
  section?: string;
  rollNo?: string;
}

export interface Exam {
  id?: number;
  name: string;
  className: string;
  session: string;
}

export interface Mark {
  id?: number;
  examId: number;
  studentId: number;
  subject: string;
  fa1?: number;
  fa2?: number;
  fa3?: number;
  fa4?: number;
  fa5?: number;
  fa6?: number;
  coCurricular?: number;
  summative?: number;
}

export interface StudentExamData {
  id?: number;
  examId: number;
  studentId: number;
  remarks?: string;
  proficiencyLevel?: 'Stream' | 'Mountain' | 'Sky';
}

export interface DailyLog {
  id?: number;
  date: string; // YYYY-MM-DD
  attendanceBalvatika: number;
  attendancePrimary: number;
  attendanceMiddle: number;
  expenditure: number;
  riceConsumed: number;
}

// For Holistic Progress Card (HPC)
export type Stage = 'Foundational' | 'Preparatory' | 'Middle';
export type HpcFoundationalPerformanceLevel = 'Stream' | 'Mountain' | 'Sky';
export type HpcPreparatoryPerformanceLevel = 'Beginner' | 'Proficient' | 'Advanced';
export type HpcPerformanceLevel = HpcFoundationalPerformanceLevel | HpcPreparatoryPerformanceLevel;


export interface HPCReportData {
  id?: number;
  studentId: number;
  session: string;
  stage: Stage;
  attendance?: {
    [month: string]: { working?: number; present?: number };
  };
  summaries: {
    [domainOrSubject: string]: {
      awareness?: HpcPerformanceLevel;
      sensitivity?: HpcPerformanceLevel;
      creativity?: HpcPerformanceLevel;
      observationalNotes?: string;
    };
  };
  // Stage-specific data
  foundationalData?: FoundationalData;
  preparatoryData?: PreparatoryData;
  middleData?: MiddleData;
}

// Data for Foundational Stage Card
export interface FoundationalData {
    partA1?: {
        teacherCode?: string;
        apaarId?: string;
        registrationNo?: string;
        motherEducation?: string;
        fatherEducation?: string;
        motherOccupation?: string;
        fatherOccupation?: string;
    };
    interests?: string[];
}

// Data for Preparatory Stage Card
export interface PreparatoryData {
    partA1?: {
        teacherCode?: string;
        registrationNo?: string;
        motherOccupation?: string;
        fatherOccupation?: string;
    };
    partA2?: {
        iAmYearsOld?: string;
        myFamily?: string;
        handDiagram?: {
            goodAt?: string;
            notSoGoodAt?: string;
            improveSkill?: string;
            likeToDo?: string;
            dontLikeToDo?: string;
        };
        myFavoriteThings?: {
            food?: string;
            games?: string;
            festivals?: string;
        };
        whenIGrowUp?: string;
        myIdol?: string;
        thingsToLearn?: string[];
    };
    partA3?: {
      [key: string]: 'Yes' | 'Sometimes' | 'No' | 'Not sure';
    };
    peerFeedback?: {
      [key: string]: 'Yes' | 'Sometimes' | 'No' | 'Not sure';
    };
    parentGuardianFeedback?: {
      resources?: string[];
      questions?: {
        [key: string]: 'Yes' | 'Sometimes' | 'No' | 'Not sure';
      },
      supportNeeded?: string[];
      otherSupport?: string;
    }
}

// Data for Middle Stage Card
export interface HpcProgressWheelSegment {
  student: HpcPreparatoryPerformanceLevel;
  peer: HpcPreparatoryPerformanceLevel;
  teacher: HpcPreparatoryPerformanceLevel;
}

export interface HpcMiddleSelfReflection {
  proudOfEffort?: 'Yes' | 'To an extent' | 'No' | 'Not sure';
  applyToRealLife?: 'Yes' | 'To an extent' | 'No' | 'Not sure';
  motivatedToLearn?: 'Yes' | 'To an extent' | 'No' | 'Not sure';
  progressGrid?: {
    awareness?: string[];
    sensitivity?: string[];
    creativity?: string[];
  };
  myLearnings?: string;
  interestingThing?: string;
  needPracticeOn?: string;
  needHelpWith?: string;
}

export interface HpcMiddlePeerFeedback {
  engagedAndMotivated?: 'Yes' | 'Sometimes' | 'No' | 'Not sure';
  sharedThoughts?: 'Yes' | 'Sometimes' | 'No' | 'Not sure';
  progressGrid?: {
    awareness?: string[];
    sensitivity?: string[];
    creativity?: string[];
  };
  needsToPractice?: string;
  needsHelpWith?: string;
}

export interface HpcMiddleTeacherFeedback {
  awareness?: HpcProgressWheelSegment;
  sensitivity?: HpcProgressWheelSegment;
  creativity?: HpcProgressWheelSegment;
  strengths?: string[];
  barriers?: string[];
  howToHelp?: string;
  observations?: string;
}

export interface HpcMiddleSubjectAssessment {
  curricularGoals?: string[];
  competencies?: string[];
  approachOfActivity?: string[];
  activity?: string;
  assessmentQuestion?: string;
  selfReflection?: HpcMiddleSelfReflection;
  peerFeedback?: HpcMiddlePeerFeedback;
  teacherFeedback?: HpcMiddleTeacherFeedback;
}

export interface MiddleData {
  partA1?: {
    teacherCode?: string;
    apaarId?: string;
    registrationNo?: string;
    motherOccupation?: string;
    fatherOccupation?: string;
  };
  partA2?: {
    liveWith?: string;
    stayAt?: string;
    freeTime?: string;
    responsible?: 'sometimes' | 'most times' | 'all the time';
    couldDoBetter?: string;
    careForOthers?: string;
    proudOfMyself?: string;
    academicGoal?: {
      description?: string;
      importance?: string;
      steps?: string[];
    };
    personalGoal?: {
      description?: string;
      importance?: string;
      steps?: string[];
    };
    learnings?: {
      atSchool?: string[];
      outsideSchool?: string[];
    };
    forTeacher?: {
      helpWith?: string;
      teacherToKnow?: string;
    };
  };
  partA3?: {
    ambition?: string;
    achieveBy?: string;
    skillsNeeded?: string;
    subjectsToFocus?: string;
    habitsNeeded?: string;
    guidanceFrom?: string;
    personWillHelpBy?: string;
    willLearnNew?: string;
    willFeel?: string;
    parentsWillFeel?: string;
  };
  partA4?: {
    resources?: string[];
    understanding?: {
      [key: string]: 'Yes' | 'Sometimes' | 'No' | 'Not sure';
    };
    supportNeeded?: string[];
    anyOtherSupport?: string;
    supportAtHome?: string;
  };
  subjectAssessments?: {
    [subject: string]: HpcMiddleSubjectAssessment;
  };
}
export type SbaProficiencyLevel = 'High' | 'Medium' | 'Low';
export type SbaTalentLevel =
  | 'No talent'
  | 'Painting and Drawing'
  | 'Playing musical instruments'
  | 'Singing'
  | 'Dancing'
  | 'Acting or Drama'
  | 'Photography'
  | 'Writing (Poetry, Fiction)'
  | 'Cooking or Baking'
  | 'Gardening'
  | 'Outdoor activities'
  | 'Playing Sports'
  | 'Crafting (Knitting, wood-working)'
  | 'Gaming (Video games, board game)'
  | 'Meditation'
  | 'Yoga'
  | 'Volunteer Work'
  | 'Travelling or Exploring'
  | 'Fashion design or Sewing'
  | 'Rock Climbing'
  | 'Martial Arts'
  | 'Horse back riding'
  | 'Water Sports'
  | 'Video editing'
  | 'Model Building'
  | 'Magic Tricks'
  | 'Leadership'
  | 'Multitalented'
  | 'Other Unique talent';

export interface SbaReportData {
  id?: number;
  studentId: number;
  session: string;
  physicalWellbeing: string;
  mentalWellbeing: string;
  diseaseFound: string;
  creativity: SbaProficiencyLevel;
  criticalThinking: SbaProficiencyLevel;
  communicationSkill: SbaProficiencyLevel;
  problemSolvingAbility: SbaProficiencyLevel;
  collaboration: SbaProficiencyLevel;
  studentsTalent: SbaTalentLevel;
  participationInActivities: SbaProficiencyLevel;
  attitudeAndValues: SbaProficiencyLevel;
  presentationSkill: SbaProficiencyLevel;
  writingSkill: SbaProficiencyLevel;
  comprehensionSkill: SbaProficiencyLevel;
}

export type FormativeProficiencyLevel = 'Sky' | 'Mountain' | 'Stream' | 'Not-Satisfied';

export interface DetailedFormativeAssessment {
  id?: number;
  studentId: number;
  session: string;
  subject: string;
  assessmentName: string; // e.g., F1, F2
  examRollNo?: string;
  registrationNo?: string;
  date?: string; // YYYY-MM-DD
  teacherName?: string;
  learningOutcomeCode?: string;
  academicProficiency: FormativeProficiencyLevel;
  cocurricularRatings?: {
    physicalActivity: FormativeProficiencyLevel;
    participationInSchoolActivities: FormativeProficiencyLevel;
    culturalAndCreativeActivities: FormativeProficiencyLevel;
    healthAndHygiene: FormativeProficiencyLevel;
    environmentAndITAwareness: FormativeProficiencyLevel;
    discipline: FormativeProficiencyLevel;
    attendance: FormativeProficiencyLevel;
  };
  anecdotalRecord?: {
    date: string;
    observation: string;
  };
}
