
// types.ts

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
  className: string;
  section: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  photo: string | null;
  category?: string;
  admissionDate?: string;
  bloodGroup?: string;
  fathersName: string;
  mothersName: string;
  contact: string;
  address: string;
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


// HOLISTIC PROGRESS CARD (HPC) TYPES
// ===================================

type HpcPerformanceLevel = 'Beginner' | 'Proficient' | 'Advanced' | 'Stream' | 'Mountain' | 'Sky' | '';

// General
interface HpcAttendance {
    [month: string]: { working?: number; present?: number; reason?: string };
}

// Universal Parent Feedback (Prep & Middle)
interface ParentFeedback {
    resources?: string[];
    childUnderstanding?: { [key: string]: string };
    supportNeeded?: string[];
    otherSupport?: string;
    supportAtHome?: string;
}

// Universal Subject/Domain Assessment
interface HpcTeacherFeedback {
    observationalNotes?: string;
}

interface HpcSubjectAssessment {
    curricularGoals?: string[];
    competencies?: string[];
    approach?: string[];
    activity?: string;
    assessmentQuestion?: string;
    observationalNotes?: string;
}

// STAGE-SPECIFIC DATA STRUCTURES
// --------------------------------

// Foundational Stage
interface FoundationalData {
    interests?: string[];
    domainAssessments?: { [domain: string]: { observationalNotes?: string } };
}

// Preparatory Stage
interface PreparatoryPartA2 {
    myFamily?: string; // image data
    handDiagram?: { iLikeTo?: string; iAmGoodAt?: string; iAmNotSoGoodAt?: string; iWouldLikeToImprove?: string; iDontLikeTo?: string; };
    favoriteThings?: { food?: string; games?: string; festivals?: string; };
    whenIGrowUp?: string;
    myIdol?: string;
    threeThingsToLearn?: string;
}

interface PreparatoryData {
    partA2?: PreparatoryPartA2;
    partA3?: { [key: string]: string }; // How do I feel at school?
    peerFeedback1?: { [key: string]: string };
    peerFeedback2?: { [key: string]: string };
    parentFeedback?: ParentFeedback;
    subjectAssessments?: { [subject: string]: HpcSubjectAssessment };
}

// Middle Stage
interface MiddlePartA2 {
    iLiveWith?: string; weStayAt?: string; freeTimeDoing?: string;
    iAmResponsible?: string; couldDoBetter?: string; iCareAboutOthers?: string; feelProud?: string;
    academicGoal?: { importantBecause?: string; steps?: string; };
    personalGoal?: { importantBecause?: string; steps?: string; };
    learnings?: { atSchool?: string; outsideSchool?: string; };
    forMyTeacher?: { helpMeWith?: string; teacherToKnow?: string; };
}

interface MiddlePartA3 {
    myAmbitionIs?: string; fiveSkills?: string; habitsToBe?: string;
    achieveAmbitionBy?: string; subjectsToFocusOn?: string;
    guidanceFrom?: string; personWillHelpBy?: string; willLearnNew?: string;
    willFeel?: string; parentsWillFeel?: string;
}

interface MiddleData {
    partA2?: MiddlePartA2;
    partA3?: MiddlePartA3;
    parentFeedback?: ParentFeedback;
    subjectAssessments?: { [subject: string]: HpcSubjectAssessment };
}


// Main HPC Report Interface
export interface HPCReportData {
  id?: number;
  studentId: number;
  academicYear: string;
  stage: 'Foundational' | 'Preparatory' | 'Middle';
  grade: string;
  
  // Part A1 General Info (shared across stages)
  healthNotes?: string; // Foundational
  attendance?: HpcAttendance;
  
  // School/Student info for Middle/Preparatory Stage Part A1
  village?: string; brc?: string; crc?: string; teacherCode?: string; apaarId?: string;
  registrationNo?: string; age?: string; motherGuardianEducation?: string; motherGuardianOccupation?: string;
  fatherGuardianEducation?: string; fatherGuardianOccupation?: string; siblingsCount?: number;
  siblingsAge?: string; motherTongue?: string; mediumOfInstruction?: string;
  ruralOrUrban?: 'Rural' | 'Urban'; illnessCount?: number;

  // Stage-specific details
  foundationalData?: FoundationalData;
  preparatoryData?: PreparatoryData;
  middleData?: MiddleData;

  // Summary (Part C)
  summaries: { 
    [domainOrSubject: string]: {
      awareness?: HpcPerformanceLevel; 
      sensitivity?: HpcPerformanceLevel;
      creativity?: HpcPerformanceLevel;
    }
  };
}
