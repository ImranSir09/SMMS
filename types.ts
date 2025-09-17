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

// HPC Data Structures Reworked

type HpcPerformanceLevel = 'Beginner' | 'Proficient' | 'Advanced' | 'Stream' | 'Mountain' | 'Sky' | '';

interface HpcTeacherFeedback {
    areasOfStrength?: string[];
    barriersToSuccess?: string[];
    helpProgressFurther?: string;
    observations?: string;
    // For Middle Stage Wheel
    wheel?: {
        awareness?: { teacher: HpcPerformanceLevel, student: HpcPerformanceLevel, peer: HpcPerformanceLevel };
        sensitivity?: { teacher: HpcPerformanceLevel, student: HpcPerformanceLevel, peer: HpcPerformanceLevel };
        creativity?: { teacher: HpcPerformanceLevel, student: HpcPerformanceLevel, peer: HpcPerformanceLevel };
    }
}

interface HpcSubjectAssessment {
    curricularGoals?: string[];
    competencies?: string[];
    approach?: string[];
    activity?: string;
    assessmentQuestion?: string;
    rubric?: {
        awareness?: HpcPerformanceLevel;
        sensitivity?: HpcPerformanceLevel;
        creativity?: HpcPerformanceLevel;
    };
    selfReflection?: { [key: string]: string }; // Map statement to response
    peerFeedback?: { [key: string]: string };
    teacherFeedback?: HpcTeacherFeedback;
    observationalNotes?: string;
    challenges?: string;
    howOvercame?: string;
}

export interface FoundationalData {
    interests?: string[];
    // Part A2: Me and My Surroundings is too graphical to model as data entry for now.
    domainAssessments?: { [domain: string]: HpcSubjectAssessment };
}

export interface PreparatoryData {
     partA2?: {
        myNameIs?: string;
        iAmYearsOld?: string;
        myFamily?: string; // image data
        handDiagram?: { iLikeTo?: string; iAmGoodAt?: string; iAmNotSoGoodAt?: string; iWouldLikeToImprove?: string; iDontLikeTo?: string; };
        favoriteThings?: { food?: string; games?: string; festivals?: string; };
        whenIGrowUp?: string;
        myIdol?: string;
        threeThingsToLearn?: string;
    };
    partA3?: { [key: string]: string }; // How do I feel at school?
    peerFeedback1?: { [key: string]: string };
    peerFeedback2?: { [key: string]: string };
    parentFeedback?: {
        resources?: string[];
        childUnderstanding?: { [key: string]: string };
        supportNeeded?: string[];
        otherSupport?: string;
        supportAtHome?: string;
    };
    subjectAssessments?: { [subject: string]: HpcSubjectAssessment };
}

export interface MiddleData {
    partA2?: {
        iLiveWith?: string; weStayAt?: string; freeTimeDoing?: string;
        iAmResponsible?: string; couldDoBetter?: string; iCareAboutOthers?: string; feelProud?: string;
        academicGoal?: { importantBecause?: string; steps?: string; };
        personalGoal?: { importantBecause?: string; steps?: string; };
        learnings?: { atSchool?: string; outsideSchool?: string; };
        forMyTeacher?: { helpMeWith?: string; teacherToKnow?: string; };
    };
    partA3?: {
        myAmbitionIs?: string; fiveSkills?: string; habitsToBe?: string;
        achieveAmbitionBy?: string; subjectsToFocusOn?: string;
        guidanceFrom?: string; personWillHelpBy?: string; willLearnNew?: string;
        willFeel?: string; parentsWillFeel?: string;
    };
    partA4?: PreparatoryData['parentFeedback'];
    subjectAssessments?: { [subject: string]: HpcSubjectAssessment };
}


// Main HPC Report Interface
export interface HPCReportData {
  id?: number;
  studentId: number;
  academicYear: string;
  stage: 'Foundational' | 'Preparatory' | 'Middle';
  grade: string;
  
  // Part A1 General Info 
  healthNotes?: string; // foundational
  attendance?: { [month: string]: { working?: number; present?: number; reason?: string } };
  interests?: string[]; // foundational
  
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
      notes?: string;
    }
  };
}