
import Dexie, { Table } from 'dexie';
import { SchoolDetails, Student, Exam, Mark, DailyLog, HPCReportData, StudentExamData, SbaReportData, DetailedFormativeAssessment, Session, StudentSessionInfo } from '../types';

export const db = new Dexie('AegisSchoolDB') as Dexie & {
  schoolDetails: Table<SchoolDetails, number>;
  students: Table<Student, number>;
  exams: Table<Exam, number>;
  marks: Table<Mark, number>;
  dailyLogs: Table<DailyLog, number>;
  hpcReports: Table<HPCReportData, number>;
  studentExamData: Table<StudentExamData, number>;
  sbaReports: Table<SbaReportData, number>;
  detailedFormativeAssessments: Table<DetailedFormativeAssessment, number>;
  sessions: Table<Session, number>;
  studentSessionInfo: Table<StudentSessionInfo, number>;
};

// ... (previous versions remain the same)

db.version(17).stores({
  schoolDetails: '++id, name',
  students: '++id, name, rollNo, admissionNo, className, gender',
  exams: '++id, name, className',
  marks: '++id, &[examId+studentId+subject], [examId+subject], studentId',
  dailyLogs: '++id, &date',
  studentExamData: '++id, &[examId+studentId], studentId',
  hpcReports: '++id, &[studentId+academicYear], studentId',
  sbaReports: '++id, &[studentId+academicYear], studentId',
  detailedFormativeAssessments: '++id, &[studentId+subject+assessmentName], studentId',
});

db.version(18).stores({
  // New tables
  sessions: '++id, &name',
  studentSessionInfo: '++id, &[studentId+session], studentId, session, className',

  // Modified tables
  students: '++id, name, admissionNo, gender', // Removed className, rollNo, section from schema
  exams: '++id, &[name+className+session], className, session', // Added session
  marks: '++id, &[examId+studentId+subject], [examId+subject], studentId',
  dailyLogs: '++id, &date',
  studentExamData: '++id, &[examId+studentId], studentId',
  hpcReports: '++id, &[studentId+session], studentId, session', // Renamed academicYear
  sbaReports: '++id, &[studentId+session], studentId, session', // Renamed academicYear
  detailedFormativeAssessments: '++id, &[studentId+subject+assessmentName+session], studentId, session', // Renamed academicYear & added session index
}).upgrade(async (tx) => {
    // Check if there's any data from the old schema to migrate.
    const studentCount = await tx.table('students').count();
    const examCount = await tx.table('exams').count();
    
    // Only create a default session and migrate if there is existing data.
    // For new users, counts will be 0, and no session will be created,
    // allowing the setup screen to show.
    if (studentCount > 0 || examCount > 0) {
        const defaultSessionName = '2024-25';

        // 1. Create a default session for the migration
        await tx.table('sessions').add({ name: defaultSessionName });

        // 2. Migrate student data
        const studentsTable = tx.table('students');
        const studentSessionInfoTable = tx.table('studentSessionInfo');
        await studentsTable.toCollection().modify(async (student: any) => {
          // Create a session info record for each student
          if (student.id && student.className && student.rollNo) {
            await studentSessionInfoTable.add({
              studentId: student.id,
              session: defaultSessionName,
              className: student.className,
              section: student.section,
              rollNo: student.rollNo,
            });
          }
          // Remove old fields from the student record
          delete student.className;
          delete student.section;
          delete student.rollNo;
        });

        // 3. Add session to exams
        const examsTable = tx.table('exams');
        await examsTable.toCollection().modify((exam: any) => {
          exam.session = defaultSessionName;
        });
        
        // 4. Rename academicYear to session in other tables
        const tablesToRename = ['sbaReports', 'detailedFormativeAssessments', 'hpcReports'];
        for (const tableName of tablesToRename) {
            const table = tx.table(tableName);
            await table.toCollection().modify((record: any) => {
                if (record.academicYear) {
                    record.session = record.academicYear;
                    delete record.academicYear;
                } else {
                    record.session = defaultSessionName;
                }
            });
        }
    }
});

db.version(19).stores({}).upgrade(async (tx) => {
    const corrections: { [key: string]: string } = {
        '2st': '2nd',
        '3nd': '3rd',
        '4rd': '4th',
        '5rd': '5th',
        '6rd': '6th',
        '7rd': '7th',
        '8rd': '8th',
    };

    const studentSessionInfoTable = tx.table('studentSessionInfo');
    await studentSessionInfoTable.toCollection().modify((record) => {
        if (record.className && corrections[record.className]) {
            record.className = corrections[record.className];
        }
    });

    const examsTable = tx.table('exams');
    await examsTable.toCollection().modify((record) => {
        if (record.className && corrections[record.className]) {
            record.className = corrections[record.className];
        }
    });
});
