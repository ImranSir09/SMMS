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

export interface Staff {
  id?: number;
  name: string;
  staffId: string;
  dob: string;
  photo: string | null;
  qualification: string;
  designation: string;
  contact: string;
  joiningDate: string;
  cpisCode?: string;
  subjects: string;
  teachingAssignments: Array<{ className: string; subject: string; }>;
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

// Reusable parts for HPC
interface DomainAssessment {
    domain: string;
    curricularGoals?: string;
    competencies?: string;
    activity?: string;
    assessmentQuestions?: string;
    rubric?: {
        awareness?: string;
        sensitivity?: string;
        creativity?: string;
    };
    teacherFeedback?: string;
    selfAssessment?: { [key: string]: string };
    peerAssessment?: { [key: string]: string };
}

// Stage-specific data structures
export interface FoundationalData {
    meAndMySurroundings?: {
        age?: string;
        liveIn?: string;
        birthday?: string;
        wantsToBe?: string;
        friends?: string;
        favourites?: {
            colour?: string; food?: string; animal?: string;
            flower?: string; sport?: string; subject?: string;
        };
    };
    domainAssessments?: { [domain: string]: DomainAssessment };
}

export interface PreparatoryData {
    aboutMe?: {
        handDiagram?: {
            goodAt?: string; notSoGoodAt?: string; improveSkill?: string;
            likeToDo?: string; dontLikeToDo?: string;
        };
        favoriteThings?: { food?: string; games?: string; festivals?: string; };
        growUpToBe?: string;
        idol?: string;
        learnThisYear?: string;
    };
    howIFeel?: { [question: string]: string };
    peerFeedback1?: { [question: string]: string };
    peerFeedback2?: { [question: string]: string };
    parentFeedback?: {
      resources?: string[];
      questions?: { [question: string]: string };
      supportNeeded?: string[];
      specify?: string;
    };
    learningStandardAssessments?: { [standard: string]: DomainAssessment };
}

type MiddleData = PreparatoryData;

// Main HPC Report Interface
export interface HPCReportData {
  id?: number;
  studentId: number;
  academicYear: string;
  stage: 'Foundational' | 'Preparatory' | 'Middle';
  grade: string;
  
  // General Info (Part A1)
  healthNotes?: string;
  attendance?: { [month: string]: { working: number; present: number } };
  interests?: string[];

  // Stage-specific details
  foundationalData?: FoundationalData;
  preparatoryData?: PreparatoryData;
  middleData?: MiddleData;

  // Summary (Part C)
  summaries: { 
    [domainOrSubject: string]: {
      awareness?: string; 
      sensitivity?: string;
      creativity?: string;
      notes?: string;
    }
  };
}