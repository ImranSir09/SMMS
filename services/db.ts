import Dexie, { Table } from 'dexie';
// FIX: Import the new StudentExamData and SbaReportData types.
import { SchoolDetails, Student, Exam, Mark, DailyLog, HPCReportData, StudentExamData, SbaReportData, FormativeAssessmentMark, DetailedFormativeAssessment } from '../types';

// FIX: Add studentExamData and sbaReports to the Dexie type definition.
export const db = new Dexie('AegisSchoolDB') as Dexie & {
  schoolDetails: Table<SchoolDetails, number>;
  students: Table<Student, number>;
  exams: Table<Exam, number>;
  marks: Table<Mark, number>;
  dailyLogs: Table<DailyLog, number>;
  hpcReports: Table<HPCReportData, number>;
  studentExamData: Table<StudentExamData, number>;
  sbaReports: Table<SbaReportData, number>;
  formativeMarks: Table<FormativeAssessmentMark, number>;
  detailedFormativeAssessments: Table<DetailedFormativeAssessment, number>;
};

// Dexie versions must be in ascending order.

// The previous version is kept for reference of the upgrade path
db.version(1).stores({
  schoolDetails: '++id, name',
  students: '++id, name, rollNo, admissionNo, className',
  staff: '++id, name, staffId, designation, subjects',
  exams: '++id, name, className',
  marks: '++id, &[examId+studentId+subject+assessment], studentId, examId'
});

db.version(2).stores({
  schoolDetails: '++id, name',
  students: '++id, name, rollNo, admissionNo, className',
  staff: '++id, name, staffId, designation, subjects',
  exams: '++id, name, className',
  marks: '++id, &[examId+studentId+subject+assessment], studentId, examId'
}).upgrade(tx => {
  // Migration logic for future versions can go here.
  // For v1 to v2, we are just adding new tables, which Dexie handles automatically.
});

db.version(3).stores({
  schoolDetails: '++id, name',
  students: '++id, name, rollNo, admissionNo, className',
  staff: '++id, name, staffId, designation, subjects',
  exams: '++id, name, className',
  marks: '++id, &[examId+studentId+subject+assessment], studentId, examId',
  dailyLogs: '++id, &date'
}).upgrade(tx => {
  // This is a new table, so no data migration is needed from v2 to v3.
});

db.version(4).stores({
  schoolDetails: '++id, name',
  students: '++id, name, rollNo, admissionNo, className',
  staff: '++id, name, staffId, designation, subjects',
  exams: '++id, name, className',
  marks: '++id, &[examId+studentId+subject+assessment], studentId, examId',
  dailyLogs: '++id, &date',
  timetable: '++id, &[staffId+day+period], staffId, day, period'
});

db.version(5).stores({
  schoolDetails: '++id, name',
  students: '++id, name, rollNo, admissionNo, className',
  staff: '++id, name, staffId, designation, subjects',
  exams: '++id, name, className',
  marks: '++id, &[examId+studentId+subject]', // Changed from assessment to subject
  dailyLogs: '++id, &date',
  timetable: '++id, &[staffId+day+period], staffId, day, period',
  studentExamData: '++id, &[examId+studentId]'
}).upgrade(tx => {
    // This upgrade modifies the marks table. If there was existing data, a migration would be needed.
    // For this case, we assume it's a structural change for new data.
    return tx.table('marks').toCollection().modify(mark => {
        // Example migration: if old marks exist, convert them.
        // This is a destructive change in this case as old schema is incompatible.
        // We will just let Dexie recreate the table based on the new schema.
    });
});

db.version(6).stores({
  schoolDetails: '++id, name',
  students: '++id, name, rollNo, admissionNo, className',
  staff: '++id, name, staffId, designation, subjects',
  exams: '++id, name, className',
  marks: '++id, &[examId+studentId+subject], [examId+subject]',
  dailyLogs: '++id, &date',
  timetable: '++id, &[staffId+day+period], staffId, day, period',
  studentExamData: '++id, &[examId+studentId]'
});

db.version(7).stores({
  schoolDetails: '++id, name',
  students: '++id, name, rollNo, admissionNo, className',
  staff: '++id, name, staffId, designation, subjects',
  exams: '++id, name, className',
  marks: '++id, &[examId+studentId+subject], [examId+subject]',
  dailyLogs: '++id, &date',
  timetable: '++id, &[staffId+day+period], staffId, day, period',
  studentExamData: '++id, &[examId+studentId]'
}).upgrade(tx => {
    return tx.table('schoolDetails').toCollection().modify(detail => {
        detail.phone = detail.contact || ''; // Migrate from 'contact' to 'phone'
        detail.email = detail.email || ''; // Add new field with default value
        detail.udiseCode = detail.udiseCode || ''; // Add new field with default value
        delete detail.contact; // Remove old field
    });
});

db.version(8).stores({
  schoolDetails: '++id, name',
  students: '++id, name, rollNo, admissionNo, className',
  staff: '++id, name, staffId, designation, subjects',
  exams: '++id, name, className',
  marks: '++id, &[examId+studentId+subject], [examId+subject]',
  dailyLogs: '++id, &date',
  timetable: '++id, &[staffId+day+period], staffId, day, period',
  studentExamData: '++id, &[examId+studentId]'
}).upgrade(tx => {
    return tx.table('students').toCollection().modify((student: any) => {
        if (typeof student.guardianInfo !== 'undefined') {
            student.fathersName = student.guardianInfo;
            delete student.guardianInfo;
        } else if (typeof student.fathersName === 'undefined') {
            student.fathersName = '';
        }
        if (typeof student.mothersName === 'undefined') {
            student.mothersName = '';
        }
    });
});

// v9: Correctly redefine the ENTIRE schema while adding new indexes
db.version(9).stores({
  schoolDetails: '++id, name',
  students: '++id, name, rollNo, admissionNo, className',
  staff: '++id, name, staffId, designation, subjects',
  exams: '++id, name, className',
  marks: '++id, &[examId+studentId+subject], [examId+subject], studentId', // <-- Index added
  dailyLogs: '++id, &date',
  timetable: '++id, &[staffId+day+period], staffId, day, period',
  studentExamData: '++id, &[examId+studentId], studentId' // <-- Index added
});

// v10: Data migration only, no schema change. Omit .stores()
db.version(10).upgrade(tx => {
    return tx.table('students').toCollection().modify((student: any) => {
        student.aadharNo = student.aadharNo || '';
        student.accountNo = student.accountNo || '';
        student.ifscCode = student.ifscCode || '';
    });
});

// v11: Data migration only, no schema change. Omit .stores()
db.version(11).upgrade(tx => {
    return tx.table('students').toCollection().modify((student: any) => {
        student.admissionDate = student.admissionDate || '';
        student.category = student.category || '';
        student.bloodGroup = student.bloodGroup || '';
    });
});

// v12: Add holisticRecords table for NEP 2020 data
db.version(12).stores({
  schoolDetails: '++id, name',
  students: '++id, name, rollNo, admissionNo, className',
  staff: '++id, name, staffId, designation, subjects',
  exams: '++id, name, className',
  marks: '++id, &[examId+studentId+subject], [examId+subject], studentId',
  dailyLogs: '++id, &date',
  timetable: '++id, &[staffId+day+period], staffId, day, period',
  studentExamData: '++id, &[examId+studentId], studentId',
  holisticRecords: '++id, &[studentId+domain+aspect], studentId, className',
});

// v13: Remove timetable table
db.version(13).stores({
  schoolDetails: '++id, name',
  students: '++id, name, rollNo, admissionNo, className',
  staff: '++id, name, staffId, designation, subjects',
  exams: '++id, name, className',
  marks: '++id, &[examId+studentId+subject], [examId+subject], studentId',
  dailyLogs: '++id, &date',
  studentExamData: '++id, &[examId+studentId], studentId',
  holisticRecords: '++id, &[studentId+domain+aspect], studentId, className',
  timetable: null, // This deletes the table
});

// v14: Add index on gender for faster dashboard queries
db.version(14).stores({
  schoolDetails: '++id, name',
  students: '++id, name, rollNo, admissionNo, className, gender',
  staff: '++id, name, staffId, designation, subjects',
  exams: '++id, name, className',
  marks: '++id, &[examId+studentId+subject], [examId+subject], studentId',
  dailyLogs: '++id, &date',
  studentExamData: '++id, &[examId+studentId], studentId',
  holisticRecords: '++id, &[studentId+domain+aspect], studentId, className',
});

// v1s: Replace holisticRecords with comprehensive hpcReports table
db.version(15).stores({
  schoolDetails: '++id, name',
  students: '++id, name, rollNo, admissionNo, className, gender',
  staff: '++id, name, staffId, designation, subjects',
  exams: '++id, name, className',
  marks: '++id, &[examId+studentId+subject], [examId+subject], studentId',
  dailyLogs: '++id, &date',
  studentExamData: '++id, &[examId+studentId], studentId',
  hpcReports: '++id, &[studentId+academicYear], studentId', // New table
  holisticRecords: null, // Delete old table
});

// v16: Remove staff table
db.version(16).stores({
  schoolDetails: '++id, name',
  students: '++id, name, rollNo, admissionNo, className, gender',
  staff: null, // Delete staff table
  exams: '++id, name, className',
  marks: '++id, &[examId+studentId+subject], [examId+subject], studentId',
  dailyLogs: '++id, &date',
  studentExamData: '++id, &[examId+studentId], studentId',
  hpcReports: '++id, &[studentId+academicYear], studentId',
});

// v17: Add sbaReports table
db.version(17).stores({
  schoolDetails: '++id, name',
  students: '++id, name, rollNo, admissionNo, className, gender',
  exams: '++id, name, className',
  marks: '++id, &[examId+studentId+subject], [examId+subject], studentId',
  dailyLogs: '++id, &date',
  studentExamData: '++id, &[examId+studentId], studentId',
  hpcReports: '++id, &[studentId+academicYear], studentId',
  sbaReports: '++id, &[studentId+academicYear], studentId',
});

// v18: Add formativeMarks table for detailed formative assessment entry
db.version(18).stores({
  schoolDetails: '++id, name',
  students: '++id, name, rollNo, admissionNo, className, gender',
  exams: '++id, name, className',
  marks: '++id, &[examId+studentId+subject], [examId+subject], studentId',
  dailyLogs: '++id, &date',
  studentExamData: '++id, &[examId+studentId], studentId',
  hpcReports: '++id, &[studentId+academicYear], studentId',
  sbaReports: '++id, &[studentId+academicYear], studentId',
  formativeMarks: '++id, &[studentId+subject+assessmentName], studentId, className',
});

// v19: Add detailedFormativeAssessments table for the new student-centric form
db.version(19).stores({
  schoolDetails: '++id, name',
  students: '++id, name, rollNo, admissionNo, className, gender',
  exams: '++id, name, className',
  marks: '++id, &[examId+studentId+subject], [examId+subject], studentId',
  dailyLogs: '++id, &date',
  studentExamData: '++id, &[examId+studentId], studentId',
  hpcReports: '++id, &[studentId+academicYear], studentId',
  sbaReports: '++id, &[studentId+academicYear], studentId',
  formativeMarks: '++id, &[studentId+subject+assessmentName], studentId, className',
  detailedFormativeAssessments: '++id, &[studentId+assessmentName+subject], studentId',
});