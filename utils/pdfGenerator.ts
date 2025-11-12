
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Student, SchoolDetails } from '../types';

// Extend jsPDF with autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export const generateRollStatementVectorPdf = async (
    students: Student[],
    className: string,
    schoolDetails: SchoolDetails,
    filename: string
) => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(schoolDetails.name, doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(schoolDetails.address, doc.internal.pageSize.getWidth() / 2, 22, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Roll Statement - Class ${className}`, doc.internal.pageSize.getWidth() / 2, 30, { align: 'center' });
    
    // Table
    const tableColumn = ["Roll No", "Admission No", "Student Name", "Father's Name", "Category", "D.O.B"];
    const tableRows: (string | number | undefined | null)[][] = [];

    students.forEach(student => {
        const studentData = [
            student.rollNo,
            student.admissionNo,
            student.name,
            student.fathersName,
            student.category || 'N/A',
            student.dob,
        ];
        tableRows.push(studentData);
    });

    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 35,
        theme: 'grid',
        headStyles: { fillColor: [22, 160, 133] },
    });
    
    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        const footerText = `Page ${i} of ${pageCount} | Generated on: ${new Date().toLocaleDateString()}`;
        doc.text(footerText, doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
    }

    doc.save(`${filename}.pdf`);
};
