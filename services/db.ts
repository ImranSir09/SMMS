import Dexie, { Table } from 'dexie';
// FIX: Import DailyLog type to be used in the database schema definition.
import { SchoolDetails, Student, Staff, Exam, Mark, DailyLog, TimetableSlot, StudentExamData } from '../types';

// FIX: Resolved issues where TypeScript could not find Dexie's base methods
// (e.g., 'version', 'transaction', 'tables') on the subclassed AppDB. 
// Switched to a direct instantiation pattern with type assertion, which is a
// robust alternative that ensures the `db` object has the correct Dexie type.
export const db = new Dexie('AegisSchoolDB') as Dexie & {
  schoolDetails: Table<SchoolDetails, number>;
  students: Table<Student, number>;
  staff: Table<Staff, number>;
  exams: Table<Exam, number>;
  marks: Table<Mark, number>;
  // FIX: Add the dailyLogs table to the Dexie type definition.
  dailyLogs: Table<DailyLog, number>;
  timetable: Table<TimetableSlot, number>;
  studentExamData: Table<StudentExamData, number>;
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

// FIX: Introduce a new database version (v3) to add the dailyLogs table.
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