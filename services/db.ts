
import Dexie, { Table } from 'dexie';
// FIX: Import DailyLog type to be used in the database schema definition.
import { SchoolDetails, Student, Staff, Exam, Mark, DailyLog, TimetableSlot } from '../types';

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
