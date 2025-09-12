// FIX: Replaced incorrect file content (which was a React component) with the correct type definitions.
// This resolves all cascading import and type errors across the application.

export interface SchoolDetails {
  id: number;
  name: string;
  address: string;
  contact: string;
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
  guardianInfo: string;
  contact: string;
  address: string;
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
    proficiencyLevel?: 'Stream' | 'Mountain' | 'Sky' | '';
    remarks?: string;
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

export interface TimetableSlot {
    id?: number;
    staffId: number;
    day: string;
    period: number;
    className: string;
    subject: string;
}