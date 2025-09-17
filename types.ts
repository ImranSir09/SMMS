
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

export interface HPCReportData {
  id?: number;
  studentId: number;
  academicYear: string;
  stage: 'Foundational' | 'Preparatory' | 'Middle';
  summaries: {
    [domain: string]: {
      awareness?: string;
      sensitivity?: string;
      creativity?: string;
    };
  };
  healthNotes?: string;
  attendance?: {
    [month: string]: {
      working: number;
      present: number;
    };
  };
  foundationalData?: {
    interests?: string[];
    domainAssessments?: {
      [domain: string]: {
        observationalNotes?: string;
      };
    };
  };
  preparatoryData?: {
    selfAssessment?: { [aspect: string]: string };
    peerAssessment?: { [aspect: string]: string };
  };
  middleData?: {
    selfAssessment?: { [aspect: string]: string };
    peerAssessment?: { [aspect: string]: string };
    teacherAssessment?: { [aspect: string]: string };
  };
}
