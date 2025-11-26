
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { Student, SchoolDetails } from '../types';
import { CLASS_OPTIONS } from '../constants';
import { formatDateLong, dateToWords, formatDateDDMMYYYY } from './formatters';

// --- Helper: Draw Decorative Border ---
const drawDecorativeBorder = (doc: jsPDF) => {
    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();
    
    // Outer double line
    doc.setLineWidth(1);
    doc.rect(5, 5, width - 10, height - 10);
    doc.setLineWidth(0.5);
    doc.rect(7, 7, width - 14, height - 14);
    
    // Inner thin line
    doc.setLineWidth(0.2);
    doc.rect(10, 10, width - 20, height - 20);
    
    // Corner Ornaments (Simple lines for elegance)
    doc.setLineWidth(1.5);
    const cornerSize = 15;
    // Top Left
    doc.line(12, 12, 12 + cornerSize, 12);
    doc.line(12, 12, 12, 12 + cornerSize);
    // Top Right
    doc.line(width - 12, 12, width - 12 - cornerSize, 12);
    doc.line(width - 12, 12, width - 12, 12 + cornerSize);
    // Bottom Left
    doc.line(12, height - 12, 12 + cornerSize, height - 12);
    doc.line(12, height - 12, 12, height - 12 - cornerSize);
    // Bottom Right
    doc.line(width - 12, height - 12, width - 12 - cornerSize, height - 12);
    doc.line(width - 12, height - 12, width - 12, height - 12 - cornerSize);
};

// --- Helper: Header with Serif Fonts ---
const addCertificateHeader = (doc: jsPDF, schoolDetails: SchoolDetails, yPos = 30) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    
    if (schoolDetails.logo) {
        try {
            // Supports PNG transparency
            doc.addImage(schoolDetails.logo, 'PNG', (pageWidth / 2) - 12, yPos - 15, 24, 24);
            yPos += 15;
        } catch (e) { console.warn("Logo add failed", e); }
    }

    doc.setFont('times', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(0, 0, 0);
    doc.text(schoolDetails.name.toUpperCase(), pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 6;
    doc.setFont('times', 'normal');
    doc.setFontSize(11);
    doc.text(schoolDetails.address, pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 5;
    let contact = '';
    if (schoolDetails.udiseCode) contact += `UDISE: ${schoolDetails.udiseCode}  `;
    if (schoolDetails.phone) contact += `Ph: ${schoolDetails.phone}`;
    if (schoolDetails.email) contact += ` | Email: ${schoolDetails.email}`;
    
    doc.setFontSize(9);
    doc.setTextColor(60);
    doc.text(contact, pageWidth / 2, yPos, { align: 'center' });
    doc.setTextColor(0); // Reset color

    return yPos + 15; // Return next Y position
};

// --- 1. Vector DOB Certificate ---
export const generateDobCertificatePdf = async (student: Student, schoolDetails: SchoolDetails) => {
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    
    drawDecorativeBorder(doc);
    let y = 25;
    y = addCertificateHeader(doc, schoolDetails, y);

    // Divider Line
    doc.setLineWidth(0.5);
    doc.line(20, y - 5, pageWidth - 20, y - 5);

    // Photo Placeholder
    const photoW = 25;
    const photoH = 32;
    const photoX = pageWidth - 35;
    const photoY = y + 10;
    
    // Placeholder box
    doc.setLineWidth(0.2);
    doc.setDrawColor(100);
    doc.rect(photoX, photoY, photoW, photoH);
    doc.setFontSize(7);
    doc.text("Affix Photo", photoX + photoW/2, photoY + photoH/2, { align: 'center' });

    // Title
    y += 15;
    doc.setFont('times', 'bold');
    doc.setFontSize(22);
    doc.text('DATE OF BIRTH CERTIFICATE', pageWidth / 2, y, { align: 'center' });
    doc.setLineWidth(0.5);
    doc.line(pageWidth / 2 - 50, y + 2, pageWidth / 2 + 50, y + 2);
    doc.line(pageWidth / 2 - 50, y + 3.5, pageWidth / 2 + 50, y + 3.5); // Double underline style

    // Intro Text
    y += 20;
    doc.setFont('times', 'italic');
    doc.setFontSize(12);
    doc.text('This is to certify that the following information has been taken from the original Admission Register of the school.', pageWidth / 2, y, { align: 'center', maxWidth: pageWidth - 60 });

    // Details Section
    y += 20;
    const labelX = 30;
    const valueX = 85;
    const lineHeight = 12;

    const drawDetailRow = (label: string, value: string) => {
        doc.setFont('times', 'bold');
        doc.setFontSize(11);
        doc.text(label.toUpperCase(), labelX, y);
        
        doc.setFont('times', 'bold');
        doc.setFontSize(13);
        doc.text(value, valueX, y);
        
        // Dotted line
        doc.setLineWidth(0.2);
        doc.setLineDash([1, 1], 0);
        doc.line(valueX, y + 1, pageWidth - 60, y + 1);
        doc.setLineDash([], 0);
        
        y += lineHeight;
    };

    drawDetailRow("Name of Student", student.name);
    drawDetailRow("Admission No", student.admissionNo);
    drawDetailRow("Father's Name", student.fathersName);
    drawDetailRow("Mother's Name", student.mothersName);
    drawDetailRow("Class / Section", `${student.className}  '${student.section}'`);
    drawDetailRow("D.O.B (Figures)", formatDateDDMMYYYY(student.dob));
    
    // DOB Words
    doc.setFont('times', 'bold');
    doc.setFontSize(11);
    doc.text("D.O.B (WORDS)", labelX, y);
    doc.setFont('times', 'bolditalic');
    doc.setFontSize(12);
    const dobWords = dateToWords(student.dob);
    const splitDob = doc.splitTextToSize(dobWords, pageWidth - valueX - 40);
    doc.text(splitDob, valueX, y);
    doc.setLineWidth(0.2);
    doc.setLineDash([1, 1], 0);
    doc.line(valueX, y + 2, pageWidth - 60, y + 2);
    doc.setLineDash([], 0);
    
    y += lineHeight * 2;

    // Footer Note
    doc.setFont('times', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text("Note: This certificate is issued for official purposes only based on school records.", pageWidth / 2, y, { align: 'center' });
    doc.setTextColor(0);

    // Signatures
    const sigY = 250;
    const date = new Date().toLocaleDateString('en-GB');
    
    doc.setFont('times', 'normal');
    doc.setFontSize(11);
    
    // Left
    doc.text(`Place: ${schoolDetails.address.split(',').pop()?.trim() || '___________'}`, 30, sigY - 6);
    doc.text(`Date: ${date}`, 30, sigY);

    // Right
    doc.setFont('times', 'bold');
    doc.text("Principal / Headmaster", pageWidth - 40, sigY, { align: 'center' });
    doc.setFont('times', 'normal');
    doc.setFontSize(9);
    doc.text("(Signature with Seal)", pageWidth - 40, sigY + 5, { align: 'center' });

    doc.save(`${student.name}_DOB_Certificate.pdf`);
};

// --- 2. Vector Bonafide Certificate ---
export const generateBonafideCertificatePdf = async (student: Student, schoolDetails: SchoolDetails) => {
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    
    drawDecorativeBorder(doc);
    let y = 25;
    y = addCertificateHeader(doc, schoolDetails, y);

    // Divider
    doc.setLineWidth(0.5);
    doc.line(20, y - 5, pageWidth - 20, y - 5);

    // Photo Placeholder (Right aligned)
    const photoW = 25;
    const photoH = 32;
    const photoX = pageWidth - 35;
    const photoY = y + 5;
    
    doc.setLineWidth(0.2);
    doc.setDrawColor(100);
    doc.rect(photoX, photoY, photoW, photoH);
    doc.setFontSize(7);
    doc.text("Affix Photo", photoX + photoW/2, photoY + photoH/2, { align: 'center' });

    // Title
    y += 15;
    doc.setFont('times', 'bold');
    doc.setFontSize(22);
    doc.text('BONAFIDE CERTIFICATE', pageWidth / 2, y, { align: 'center' });
    // Decorative line under title
    doc.setLineWidth(0.5);
    doc.line(pageWidth / 2 - 45, y + 2, pageWidth / 2 + 45, y + 2);
    
    y += 25;

    // Content
    const margin = 25;
    const textWidth = pageWidth - (margin * 2);
    doc.setFont('times', 'normal');
    doc.setFontSize(14);
    doc.setLineHeightFactor(1.5);

    const genderPronoun = student.gender === 'Female' ? 'daughter' : 'son';
    
    // Helper to draw justified text with bold variables
    // Since jsPDF doesn't support mixed styles in justified text easily, we construct lines manually or use simple flow.
    // For best results, we will use a standard flow with placeholders.
    
    // Paragraph 1
    doc.text(`This is to certify that`, margin, y);
    doc.setFont('times', 'bold');
    doc.text(student.name.toUpperCase(), margin + 45, y);
    doc.setFont('times', 'normal');
    
    y += 10;
    doc.text(`${genderPronoun} of Mr.`, margin, y);
    doc.setFont('times', 'bold');
    doc.text(student.fathersName.toUpperCase(), margin + 35, y);
    doc.setFont('times', 'normal');
    doc.text(`, is a bonafide student of this institution.`, margin + 35 + (doc.getTextWidth(student.fathersName.toUpperCase()) + 2), y);

    y += 12;
    doc.text(`The student is studying in Class`, margin, y);
    doc.setFont('times', 'bold');
    doc.text(student.className, margin + 62, y);
    doc.setFont('times', 'normal');
    doc.text(`(Section '${student.section}') and bears Enrollment`, margin + 70, y); // Approx positioning
    
    y += 10;
    doc.text(`Number`, margin, y);
    doc.setFont('times', 'bold');
    doc.text(student.admissionNo, margin + 18, y);
    doc.setFont('times', 'normal');
    doc.text(`for the academic session`, margin + 35, y);
    doc.text(`____________________.`, margin + 85, y);

    y += 15;
    const p3 = `During the period of study, the student has conducted themselves in a disciplined manner and is pursuing studies in accordance with the rules and regulations of the institution. This certificate is issued upon their request for whatever purpose it may serve.`;
    const splitP3 = doc.splitTextToSize(p3, textWidth);
    doc.text(splitP3, margin, y, { align: 'justify', maxWidth: textWidth });
    
    y += (splitP3.length * 8) + 10;

    // Details Box
    doc.setDrawColor(0);
    doc.setLineWidth(0.2);
    doc.rect(margin, y, textWidth, 50);
    
    let detailY = y + 10;
    const detailLabelX = margin + 10;
    const detailValueX = margin + 60;
    const detailRowH = 8;

    doc.setFontSize(12);
    const addDetail = (label: string, value: string) => {
        doc.setFont('times', 'bold');
        doc.text(label, detailLabelX, detailY);
        doc.setFont('times', 'normal');
        doc.text(value, detailValueX, detailY);
        detailY += detailRowH;
    }

    addDetail("Name:", student.name);
    addDetail("Admission No:", student.admissionNo);
    addDetail("Class:", student.className);
    addDetail("Date of Birth:", student.dob ? formatDateLong(student.dob) : 'N/A');
    addDetail("Duration:", `_________________ to _________________`);

    y += 60;
    doc.setFontSize(11);
    doc.setFont('times', 'italic');
    doc.text("\"We hereby confirm that the above-mentioned particulars are true to the best of our knowledge and school records.\"", pageWidth/2, y, { align: 'center', maxWidth: textWidth });

    // Footer
    const sigY = 250;
    doc.setFont('times', 'normal');
    doc.setFontSize(12);
    
    const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    doc.text(`Issued on: ${date}`, margin, sigY - 20);

    // Signatures
    // Left
    doc.setFont('times', 'bold');
    doc.text("Prepared By", margin + 10, sigY, { align: 'center' });
    doc.line(margin, sigY - 5, margin + 30, sigY - 5);

    // Right
    const rightX = pageWidth - margin - 20;
    doc.text("Principal / Headmaster", rightX, sigY, { align: 'center' });
    doc.line(rightX - 30, sigY - 5, rightX + 30, sigY - 5);
    doc.setFontSize(9);
    doc.setFont('times', 'normal');
    doc.text("(Seal & Signature)", rightX, sigY + 5, { align: 'center' });

    doc.save(`${student.name}_Bonafide.pdf`);
};

// --- 3. Vector Consolidated Roll Statement ---
export const generateConsolidatedRollStatementPdf = async (
    studentsByClass: Map<string, Student[]>,
    schoolDetails: SchoolDetails,
    session: string
) => {
    const doc = new jsPDF({ orientation: 'landscape' });
    const TARGET_CATEGORIES = ['General', 'ST'];

    // Simple text header for roll statement as it's a report, not a certificate
    let yPos = 15;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text(schoolDetails.name.toUpperCase(), doc.internal.pageSize.getWidth() / 2, yPos, { align: 'center' });
    yPos += 6;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(schoolDetails.address, doc.internal.pageSize.getWidth() / 2, yPos, { align: 'center' });
    
    yPos += 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Consolidated Category & Gender Wise Roll Statement (${session})`, doc.internal.pageSize.getWidth() / 2, yPos, { align: 'center' });

    const head = [
        [
            { content: 'Class', rowSpan: 2, styles: { valign: 'middle', halign: 'center', fontStyle: 'bold' } },
            ...TARGET_CATEGORIES.map(cat => ({ content: cat, colSpan: 3, styles: { halign: 'center', fontStyle: 'bold' } })),
            { content: 'Grand Total', colSpan: 3, styles: { halign: 'center', fontStyle: 'bold', fillColor: [220, 220, 220] } }
        ],
        [
            ...TARGET_CATEGORIES.flatMap(() => ['M', 'F', 'T']),
            'M', 'F', 'Total'
        ]
    ];

    const body: any[] = [];
    
    // Sort Classes
    const classNames = Array.from(studentsByClass.keys()).sort((a, b) => {
        const indexA = CLASS_OPTIONS.indexOf(a);
        const indexB = CLASS_OPTIONS.indexOf(b);
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        return a.localeCompare(b, undefined, { numeric: true });
    });

    // Grand Totals across all classes
    const grandTotals: { [key: string]: { M: number, F: number, T: number } } = {};
    [...TARGET_CATEGORIES, 'Grand Total'].forEach(k => grandTotals[k] = { M:0, F:0, T:0 });

    classNames.forEach(className => {
        const students = studentsByClass.get(className) || [];
        const row: any[] = [className];

        let rowGrandM = 0, rowGrandF = 0, rowGrandT = 0;

        TARGET_CATEGORIES.forEach(cat => {
            // Logic: If student is ST -> ST. Else -> General.
            const catStudents = students.filter(s => {
                const c = s.category || 'General';
                return cat === 'ST' ? c === 'ST' : c !== 'ST'; 
            });

            const m = catStudents.filter(s => s.gender === 'Male').length;
            const f = catStudents.filter(s => s.gender === 'Female').length;
            const t = catStudents.length; 

            row.push(m, f, t);

            // Add to Column Totals
            grandTotals[cat].M += m;
            grandTotals[cat].F += f;
            grandTotals[cat].T += t;

            // Add to Row Totals
            rowGrandM += m;
            rowGrandF += f;
            rowGrandT += t;
        });

        // Grand Total Columns for this Row
        row.push(rowGrandM, rowGrandF, rowGrandT);
        
        // Add to Grand Totals Footer
        grandTotals['Grand Total'].M += rowGrandM;
        grandTotals['Grand Total'].F += rowGrandF;
        grandTotals['Grand Total'].T += rowGrandT;

        body.push(row);
    });

    // Footer Row
    const footerRow = ['TOTAL'];
    [...TARGET_CATEGORIES, 'Grand Total'].forEach(cat => {
        footerRow.push(String(grandTotals[cat].M));
        footerRow.push(String(grandTotals[cat].F));
        footerRow.push(String(grandTotals[cat].T));
    });

    autoTable(doc, {
        head: head,
        body: body,
        foot: [footerRow],
        startY: 45,
        theme: 'grid',
        headStyles: { fillColor: [44, 62, 80], textColor: 255, lineWidth: 0.1 },
        footStyles: { fillColor: [44, 62, 80], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 1.5, halign: 'center', lineColor: [0, 0, 0], lineWidth: 0.1 },
        columnStyles: {
            0: { fontStyle: 'bold', halign: 'left' },
            // Style the Grand Total columns specially
            [1 + (TARGET_CATEGORIES.length * 3)]: { fillColor: [240, 240, 240] },
            [2 + (TARGET_CATEGORIES.length * 3)]: { fillColor: [240, 240, 240] },
            [3 + (TARGET_CATEGORIES.length * 3)]: { fillColor: [220, 220, 220], fontStyle: 'bold' }
        }
    });

    // Footer Signature
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text("Signature of Head of Institution", doc.internal.pageSize.getWidth() - 20, finalY, { align: 'right' });

    doc.save(`Consolidated_Roll_${session}.pdf`);
};

export const generatePdfFromElement = async (elementId: string, filename: string) => {
    const input = document.getElementById(elementId);
    if (!input) return;
    const canvas = await html2canvas(input, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    pdf.addImage(imgData, 'PNG', 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());
    pdf.save(`${filename}.pdf`);
};

export const generateMultiPagePdfFromElements = async (elementIds: string[], filename: string) => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    for (let i = 0; i < elementIds.length; i++) {
        const elementId = elementIds[i];
        const input = document.getElementById(elementId);
        if (!input) continue;
        if (i > 0) pdf.addPage();
        const canvas = await html2canvas(input, { scale: 2, useCORS: true });
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    }
    pdf.save(`${filename}.pdf`);
};

export const generateRollStatementVectorPdf = async (
    students: Student[],
    className: string,
    schoolDetails: SchoolDetails,
    filename: string
) => {
    const doc = new jsPDF();
    let y = 15;
    
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(schoolDetails.name.toUpperCase(), doc.internal.pageSize.getWidth()/2, y, { align: 'center' });
    y += 7;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(schoolDetails.address, doc.internal.pageSize.getWidth()/2, y, { align: 'center' });
    
    y += 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Roll Statement - Class ${className}`, doc.internal.pageSize.getWidth() / 2, y, { align: 'center' });
    
    const tableColumn = ["Roll No", "Admission No", "Student Name", "Father's Name", "Category", "D.O.B"];
    const tableRows: (string | number | undefined | null)[][] = [];

    students.forEach(student => {
        const studentData = [
            student.rollNo,
            student.admissionNo,
            student.name,
            student.fathersName,
            student.category || 'General',
            student.dob,
        ];
        tableRows.push(studentData);
    });

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: y + 5,
        theme: 'grid',
        headStyles: { fillColor: [44, 62, 80] },
    });
    
    doc.save(`${filename}.pdf`);
};

export const generateCategoryRollStatementPdf = async (students: Student[], className: string, schoolDetails: SchoolDetails) => {
    const doc = new jsPDF();
    doc.text("Category Roll Statement Placeholder", 10, 10);
    doc.save(`Category_Roll_${className}.pdf`);
};
