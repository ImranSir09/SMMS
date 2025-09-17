export interface SchoolDetails {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  udiseCode: string;
  logo: string | null;
}

export interface Student {
  id?: number;
  name: string;
  rollNo: string;
  admissionNo: string;
  dob: string; // YYYY-MM-DD
  gender: 'Male' | 'Female' | 'Other';
  className: string;
  section: string;
  fathersName: string;
  mothersName: string;
  contact: string;
  address: string;
  photo: string | null;
  admissionDate?: string; // YYYY-MM-DD
  category?: string;
  bloodGroup?: string;
  aadharNo?: string;
  accountNo?: string;
  ifscCode?: string;
}

export interface Exam {
  id?: number;
  name: string;
  className: string;
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

export interface DailyLog {
  id?: number;
  date: string; // YYYY-MM-DD
  attendanceBalvatika: number;
  attendancePrimary: number;
  attendanceMiddle: number;
  expenditure: number;
  riceConsumed: number;
}

export interface StudentExamData {
  id?: number;
  examId: number;
  studentId: number;
  remarks?: string;
  proficiencyLevel?: 'Stream' | 'Mountain' | 'Sky';
}

// ===============================================
// HOLISTIC PROGRESS CARD (HPC) TYPE DEFINITIONS
// ===============================================

// Generic Types
export type HpcPerformanceLevel = 'Stream' | 'Mountain' | 'Sky' | '';
export type HpcSentiment = 'Yes' | 'Sometimes' | 'No' | 'Not sure' | '';

export interface HpcDomainSummary {
  awareness?: HpcPerformanceLevel;
  sensitivity?: HpcPerformanceLevel;
  creativity?: HpcPerformanceLevel;
  observationalNotes?: string;
  teacherRemarks?: string;
  parentRemarks?: string;
}

export interface HpcAttendance {
  [month: string]: {
    working: number;
    present: number;
  };
}

// --- Foundational Stage (PP1-2nd) ---
export interface FoundationalData {
  interests?: string[];
}

// --- Preparatory Stage (3rd-5th) ---
export interface PreparatoryPartA2 {
  myFamily?: string;
  myFavoriteThings?: {
    food?: string;
    games?: string;
    festivals?: string;
  };
  whenIGrowUp?: string;
  thingsToLearn?: string[];
  myIdol?: string;
  handDiagram?: {
    goodAt?: string;
    notSoGoodAt?: string;
    improveSkill?: string;
    likeToDo?: string;
    dontLikeToDo?: string;
  };
}

export interface PreparatoryPartA3 {
  [key: string]: HpcSentiment;
}

export interface ParentFeedback {
  [key: string]: HpcSentiment | string;
}

export interface PreparatoryData {
  partA2?: PreparatoryPartA2;
  partA3?: PreparatoryPartA3;
  parentFeedback?: ParentFeedback;
  // FIX: Added missing selfAssessment and peerAssessment properties to align with usage in HPCPreparatoryCard.
  selfAssessment?: { [key: string]: string };
  peerAssessment?: { [key: string]: string };
}

// --- Middle Stage (6th-8th) ---
export interface MiddlePartA1 {
  siblings?: string;
  siblingsAge?: string;
  motherTongue?: string;
  mediumOfInstruction?: string;
  ruralOrUrban?: 'Rural' | 'Urban' | '';
  timesFallenIll?: string;
}

export interface MiddlePartA2 {
  liveWith?: string;
  stayAt?: string;
  freeTimeDoing?: string;
  amResponsible?: 'sometimes' | 'most times' | 'all the time' | '';
  couldDoBetter?: string;
  careForOthers?: string;
  proudOfMyself?: string;
  academicGoal?: string;
  academicGoalImportant?: string;
  academicGoalSteps?: string[];
  personalGoal?: string;
  personalGoalImportant?: string;
  personalGoalSteps?: string[];
  thingsLearntAtSchool?: string[];
  thingsLearntOutsideSchool?: string[];
  teacherHelpWith?: string;
  teacherToKnow?: string;
}

export interface MiddlePartA3 {
  myAmbition?: string;
  skillsForAmbition?: string;
  habitsForAmbition?: string;
  achieveAmbitionBy?: string;
  subjectsToFocus?: string;
  guidanceFrom?: string;
  personWillHelp?: string;
  willLearnNew?: string;
  willFeel?: string;
  parentsWillFeel?: string;
}

export interface MiddlePartA4 {
  resourcesAvailable?: { [key: string]: boolean };
  resourcesOther?: string;
  understandingOfChild?: { [key: string]: HpcSentiment };
  needsSupportWith?: { [key: string]: boolean };
  needsSupportOther?: string;
  howParentWillSupport?: string;
}

export interface MiddleData {
  partA1?: MiddlePartA1;
  partA2?: MiddlePartA2;
  partA3?: MiddlePartA3;
  partA4?: MiddlePartA4;
  // FIX: Added missing selfAssessment, peerAssessment, and teacherAssessment properties to align with usage in HPCMiddleCard.
  selfAssessment?: { [key: string]: string };
  peerAssessment?: { [key: string]: string };
  teacherAssessment?: { [key: string]: string };
}

// --- Part B: Subject Assessments (Preparatory & Middle) ---
export interface HpcSelfReflection {
  proud?: 'Yes' | 'To an extent' | 'No' | 'Not sure' | '';
  willApply?: 'Yes' | 'To an extent' | 'No' | 'Not sure' | '';
  motivated?: 'Yes' | 'To an extent' | 'No' | 'Not sure' | '';
  myLearnings?: string;
  mostInteresting?: string;
  needPracticeOn?: string;
  needHelpWith?: string;
  grid?: {
    [ability: string]: { [statement: string]: boolean };
  };
}

export interface HpcPeerFeedback {
  engaged?: 'Yes' | 'Sometimes' | 'No' | 'Not sure' | '';
  sharedThoughts?: 'Yes' | 'Sometimes' | 'No' | 'Not sure' | '';
  needsPractice?: string;
  needsHelpWith?: string;
  grid?: {
    [ability: string]: { [statement: string]: boolean };
  };
}

export interface HpcSubjectAssessment {
  curricularGoals?: string[];
  competencies?: string[];
  activityApproach?: string[];
  activity?: string;
  assessmentQuestion?: string;
  rubric?: {
    awareness?: 'Beginner' | 'Proficient' | 'Advanced' | '';
    sensitivity?: 'Beginner' | 'Proficient' | 'Advanced' | '';
    creativity?: 'Beginner' | 'Proficient' | 'Advanced' | '';
  };
  selfReflection?: HpcSelfReflection;
  peerFeedback?: HpcPeerFeedback;
  teacherFeedback?: {
    areasOfStrength?: { [key: string]: boolean };
    barriersToSuccess?: { [key: string]: boolean };
    howToHelp?: string;
    recommendations?: string;
  }
}

// --- Main HPCReportData Interface ---
export interface HPCReportData {
  id?: number;
  studentId: number;
  academicYear: string;
  stage: 'Foundational' | 'Preparatory' | 'Middle';
  
  // Part A
  healthNotes?: string;
  attendance?: HpcAttendance;
  
  foundationalData?: FoundationalData;
  preparatoryData?: PreparatoryData;
  middleData?: MiddleData;

  // Part B
  subjectAssessments?: {
    [subject: string]: HpcSubjectAssessment;
  };

  // Part C (Summary - Populated from other parts)
  summaries: {
    [domainOrSubject: string]: HpcDomainSummary;
  };
}