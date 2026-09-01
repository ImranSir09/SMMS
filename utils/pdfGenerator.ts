import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { Student, SchoolDetails } from '../types';
import { CLASS_OPTIONS, CATEGORY_OPTIONS } from '../constants';
import { formatDateLong, dateToWords, formatDateDDMMYYYY } from './formatters';

// --- Helper: Draw Decorative Border ---
const drawDecorativeBorder = (doc: jsPDF) => {
    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();
    
    // Outer border
    doc.setDrawColor(30, 41, 59); // Slate 800
    doc.setLineWidth(1.2);
    doc.rect(6, 6, width - 12, height - 12);
    
    // Inner fine line
    doc.setLineWidth(0.4);
    doc.setDrawColor(71, 85, 105); // Slate 600
    doc.rect(8.5, 8.5, width - 17, height - 17);
    
    // Innermost hairline
    doc.setLineWidth(0.2);
    doc.setDrawColor(148, 163, 184); // Slate 400
    doc.rect(11, 11, width - 22, height - 22);
    
    // Corner Ornaments
    doc.setDrawColor(30, 41, 59);
    doc.setLineWidth(1.2);
    const cornerSize = 14;
    
    // Top Left
    doc.line(13, 13, 13 + cornerSize, 13);
    doc.line(13, 13, 13, 13 + cornerSize);
    doc.circle(13, 13, 0.8, 'F');
    
    // Top Right
    doc.line(width - 13, 13, width - 13 - cornerSize, 13);
    doc.line(width - 13, 13, width - 13, 13 + cornerSize);
    doc.circle(width - 13, 13, 0.8, 'F');
    
    // Bottom Left
    doc.line(13, height - 13, 13 + cornerSize, height - 13);
    doc.line(13, height - 13, 13, height - 13 - cornerSize);
    doc.circle(13, height - 13, 0.8, 'F');
    
    // Bottom Right
    doc.line(width - 13, height - 13, width - 13 - cornerSize, height - 13);
    doc.line(width - 13, height - 13, width - 13, height - 13 - cornerSize);
    doc.circle(width - 13, height - 13, 0.8, 'F');
};

// --- Helper: Header with Serif Fonts ---
const addCertificateHeader = (doc: jsPDF, schoolDetails: SchoolDetails, yPos = 24) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    
    if (schoolDetails.logo) {
        try {
            doc.addImage(schoolDetails.logo, 'PNG', (pageWidth / 2) - 12, yPos - 10, 24, 24);
            yPos += 18;
        } catch (e) { 
            console.warn("Logo add failed", e); 
        }
    }

    doc.setFont('times', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42); // Slate 900
    doc.text(schoolDetails.name.toUpperCase(), pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 6;
    doc.setFont('times', 'normal');
    doc.setFontSize(10.5);
    doc.setTextColor(51, 65, 85);
    doc.text(schoolDetails.address, pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 5;
    const metaParts: string[] = [];
    if (schoolDetails.udiseCode) metaParts.push(`UDISE Code: ${schoolDetails.udiseCode}`);
    if (schoolDetails.phone) metaParts.push(`Ph: ${schoolDetails.phone}`);
    if (schoolDetails.email) metaParts.push(`Email: ${schoolDetails.email}`);
    
    if (metaParts.length > 0) {
        doc.setFontSize(8.5);
        doc.setTextColor(100, 116, 139);
        doc.text(metaParts.join('  |  '), pageWidth / 2, yPos, { align: 'center' });
    }
    
    doc.setTextColor(0, 0, 0); // Reset color
    return yPos + 12; // Return next Y position
};

// --- 1. Vector DOB Certificate ---
export const generateDobCertificatePdf = async (student: Student, schoolDetails: SchoolDetails, photo?: string | null) => {
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    drawDecorativeBorder(doc);
    let y = 22;
    y = addCertificateHeader(doc, schoolDetails, y);

    // Decorative Divider Line
    doc.setDrawColor(30, 41, 59);
    doc.setLineWidth(0.6);
    doc.line(22, y - 4, pageWidth - 22, y - 4);
    doc.setLineWidth(0.2);
    doc.line(22, y - 2.5, pageWidth - 22, y - 2.5);

    // Photo Box / Placeholder
    const photoW = 28;
    const photoH = 34;
    const photoX = pageWidth - 44;
    const photoY = y + 8;
    
    if (photo) {
        try {
            doc.addImage(photo, 'JPEG', photoX, photoY, photoW, photoH);
            doc.setDrawColor(71, 85, 105);
            doc.setLineWidth(0.3);
            doc.rect(photoX, photoY, photoW, photoH);
        } catch (e) { 
            console.warn("Photo add failed", e); 
        }
    } else {
        doc.setDrawColor(148, 163, 184);
        doc.setLineWidth(0.3);
        (doc as any).setLineDash?.([1.5, 1.5], 0);
        doc.rect(photoX, photoY, photoW, photoH);
        (doc as any).setLineDash?.([], 0);
        doc.setFont('times', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text("Affix Photo", photoX + photoW / 2, photoY + photoH / 2 - 2, { align: 'center' });
        doc.setFontSize(7);
        doc.text("(Passport Size)", photoX + photoW / 2, photoY + photoH / 2 + 3, { align: 'center' });
        doc.setTextColor(0, 0, 0);
    }

    // Title
    y += 12;
    doc.setFont('times', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42);
    doc.text('DATE OF BIRTH CERTIFICATE', pageWidth / 2, y, { align: 'center' });
    
    doc.setDrawColor(30, 41, 59);
    doc.setLineWidth(0.6);
    doc.line(pageWidth / 2 - 55, y + 2.5, pageWidth / 2 + 55, y + 2.5);
    doc.setLineWidth(0.2);
    doc.line(pageWidth / 2 - 45, y + 4, pageWidth / 2 + 45, y + 4);

    // Intro Text
    y += 16;
    doc.setFont('times', 'italic');
    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105);
    doc.text('This is to certify that the following information has been taken from the original Admission Register of the school.', pageWidth / 2, y, { align: 'center', maxWidth: pageWidth - 65 });

    // Details Section
    y += 16;
    const labelX = 26;
    const valueX = 75;
    const lineEndX = pageWidth - 50;
    const lineHeight = 11;

    const drawDetailRow = (label: string, value: string) => {
        doc.setFont('times', 'bold');
        doc.setFontSize(10.5);
        doc.setTextColor(51, 65, 85);
        doc.text(label.toUpperCase(), labelX, y);
        
        doc.setFont('times', 'bold');
        doc.setFontSize(11.5);
        doc.setTextColor(15, 23, 42);
        doc.text(value || '-', valueX, y);
        
        // Dotted leader line
        doc.setLineWidth(0.2);
        doc.setDrawColor(203, 213, 225);
        (doc as any).setLineDash?.([0.8, 1.2], 0);
        doc.line(valueX, y + 1.2, lineEndX, y + 1.2);
        (doc as any).setLineDash?.([], 0);
        
        y += lineHeight;
    };

    drawDetailRow("Name of Student", student.name);
    drawDetailRow("Admission No.", student.admissionNo);
    drawDetailRow("Father's Name", student.fathersName);
    drawDetailRow("Mother's Name", student.mothersName);
    drawDetailRow("Class / Section", `${student.className || '-'}  '${student.section || '-'}'`);
    drawDetailRow("D.O.B (Figures)", formatDateDDMMYYYY(student.dob));
    
    // DOB in Words
    doc.setFont('times', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(51, 65, 85);
    doc.text("D.O.B (WORDS)", labelX, y);
    
    doc.setFont('times', 'bolditalic');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    const dobWords = dateToWords(student.dob);
    const splitDob = doc.splitTextToSize(dobWords, lineEndX - valueX);
    doc.text(splitDob, valueX, y);
    
    doc.setLineWidth(0.2);
    doc.setDrawColor(203, 213, 225);
    (doc as any).setLineDash?.([0.8, 1.2], 0);
    doc.line(valueX, y + 1.5, lineEndX, y + 1.5);
    (doc as any).setLineDash?.([], 0);
    
    y += (splitDob.length * 5) + 14;

    // Official Verification Notice Box
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(26, y - 3, pageWidth - 52, 12, 1.5, 1.5, 'FD');
    
    doc.setFont('times', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text("Note: This certificate is issued for official purposes only based on certified school admission records.", pageWidth / 2, y + 4, { align: 'center' });

    // Signatures
    const sigY = pageHeight - 38;
    const date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
    const place = schoolDetails.address.split(',').pop()?.trim() || 'School Campus';
    
    doc.setFont('times', 'normal');
    doc.setFontSize(10.5);
    doc.setTextColor(51, 65, 85);
    
    // Left: Issue particulars
    doc.text(`Place: ${place}`, 28, sigY - 5);
    doc.text(`Date of Issue: ${date}`, 28, sigY + 2);

    // Right: Principal / Headmaster
    const rightCenterX = pageWidth - 48;
    doc.setDrawColor(30, 41, 59);
    doc.setLineWidth(0.6);
    doc.line(rightCenterX - 28, sigY - 8, rightCenterX + 28, sigY - 8);
    
    doc.setFont('times', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text("Principal / Headmaster", rightCenterX, sigY - 2, { align: 'center' });
    
    doc.setFont('times', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text("(Signature with Seal)", rightCenterX, sigY + 4, { align: 'center' });

    doc.save(`${student.name}_DOB_Certificate.pdf`);
};

// --- 2. Vector Bonafide Certificate ---
export const generateBonafideCertificatePdf = async (student: Student, schoolDetails: SchoolDetails, photo?: string | null) => {
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    drawDecorativeBorder(doc);
    let y = 22;
    y = addCertificateHeader(doc, schoolDetails, y);

    // Divider
    doc.setDrawColor(30, 41, 59);
    doc.setLineWidth(0.6);
    doc.line(22, y - 4, pageWidth - 22, y - 4);
    doc.setLineWidth(0.2);
    doc.line(22, y - 2.5, pageWidth - 22, y - 2.5);

    // Photo Box / Placeholder
    const photoW = 28;
    const photoH = 34;
    const photoX = pageWidth - 44;
    const photoY = y + 8;
    
    if (photo) {
        try {
            doc.addImage(photo, 'JPEG', photoX, photoY, photoW, photoH);
            doc.setDrawColor(71, 85, 105);
            doc.setLineWidth(0.3);
            doc.rect(photoX, photoY, photoW, photoH);
        } catch (e) { 
            console.warn("Photo add failed", e); 
        }
    } else {
        doc.setDrawColor(148, 163, 184);
        doc.setLineWidth(0.3);
        (doc as any).setLineDash?.([1.5, 1.5], 0);
        doc.rect(photoX, photoY, photoW, photoH);
        (doc as any).setLineDash?.([], 0);
        doc.setFont('times', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text("Affix Photo", photoX + photoW / 2, photoY + photoH / 2 - 2, { align: 'center' });
        doc.setFontSize(7);
        doc.text("(Passport Size)", photoX + photoW / 2, photoY + photoH / 2 + 3, { align: 'center' });
        doc.setTextColor(0, 0, 0);
    }

    // Title
    y += 12;
    doc.setFont('times', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42);
    doc.text('BONAFIDE CERTIFICATE', pageWidth / 2, y, { align: 'center' });
    
    doc.setDrawColor(30, 41, 59);
    doc.setLineWidth(0.6);
    doc.line(pageWidth / 2 - 50, y + 2.5, pageWidth / 2 + 50, y + 2.5);
    doc.setLineWidth(0.2);
    doc.line(pageWidth / 2 - 40, y + 4, pageWidth / 2 + 40, y + 4);
    
    y += 18;

    // Body Text
    const margin = 24;
    const textWidth = pageWidth - (margin * 2);
    const genderPronoun = student.gender === 'Female' ? 'daughter' : 'son';
    
    doc.setFont('times', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.setLineHeightFactor(1.5);

    const p1 = `This is to certify that ${student.name.toUpperCase()}, ${genderPronoun} of Mr. ${student.fathersName.toUpperCase()}, is a bonafide student of this institution.`;
    const splitP1 = doc.splitTextToSize(p1, textWidth);
    doc.text(splitP1, margin, y);
    y += (splitP1.length * 6) + 4;

    const p2 = `The student is currently enrolled in Class ${student.className || '-'} (Section '${student.section || '-'}') under Admission/Enrollment Number ${student.admissionNo || '-'}.`;
    const splitP2 = doc.splitTextToSize(p2, textWidth);
    doc.text(splitP2, margin, y);
    y += (splitP2.length * 6) + 4;

    const p3 = `During the academic tenure, the student has maintained satisfactory conduct, discipline, and regular attendance in compliance with the institutional regulations. This certificate is issued upon request for official reference and documentation.`;
    const splitP3 = doc.splitTextToSize(p3, textWidth);
    doc.text(splitP3, margin, y, { maxWidth: textWidth });
    y += (splitP3.length * 6) + 8;

    // Student Particulars Box
    const boxW = textWidth;
    const boxH = 46;
    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, y, boxW, boxH, 2, 2, 'FD');
    
    // Box Title
    doc.setFont('times', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text("STUDENT PARTICULARS", margin + 8, y + 7);
    doc.setLineWidth(0.2);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin + 8, y + 9, margin + boxW - 8, y + 9);

    let detailY = y + 15;
    const dLabelX = margin + 8;
    const dValueX = margin + 55;
    const dRowH = 6.5;

    const addDetail = (lbl: string, val: string) => {
        doc.setFont('times', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(71, 85, 105);
        doc.text(lbl, dLabelX, detailY);
        
        doc.setFont('times', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(15, 23, 42);
        doc.text(val, dValueX, detailY);
        detailY += dRowH;
    };

    addDetail("Full Name:", student.name);
    addDetail("Admission No:", student.admissionNo);
    addDetail("Class / Grade:", `${student.className || '-'} (Sec: ${student.section || '-'})`);
    addDetail("Date of Birth:", student.dob ? formatDateLong(student.dob) : 'N/A');
    addDetail("Father's Name:", student.fathersName);

    y += boxH + 10;
    
    // Attestation Statement
    doc.setFontSize(9.5);
    doc.setFont('times', 'italic');
    doc.setTextColor(100, 116, 139);
    doc.text("\"We hereby attest that the above particulars are true and verified from official school records.\"", pageWidth / 2, y, { align: 'center', maxWidth: textWidth });

    // Footer & Signatures
    const sigY = pageHeight - 38;
    const date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
    
    doc.setFont('times', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    doc.text(`Date of Issue: ${date}`, margin, sigY - 2);

    // Left Signature: Prepared By
    const leftSigX = margin + 25;
    doc.setDrawColor(30, 41, 59);
    doc.setLineWidth(0.5);
    doc.line(leftSigX - 20, sigY - 6, leftSigX + 20, sigY - 6);
    doc.setFont('times', 'bold');
    doc.text("Prepared By", leftSigX, sigY, { align: 'center' });

    // Right Signature: Principal
    const rightSigX = pageWidth - margin - 25;
    doc.line(rightSigX - 25, sigY - 6, rightSigX + 25, sigY - 6);
    doc.setFont('times', 'bold');
    doc.text("Principal / Headmaster", rightSigX, sigY, { align: 'center' });
    doc.setFont('times', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text("(Seal & Signature)", rightSigX, sigY + 4.5, { align: 'center' });

    doc.save(`${student.name}_Bonafide_Certificate.pdf`);
};

// --- 3. Vector Consolidated Roll Statement ---
export const generateConsolidatedRollStatementPdf = async (
    studentsByClass: Map<string, Student[]>,
    schoolDetails: SchoolDetails,
    session: string
) => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const TARGET_CATEGORIES = ['General', 'ST'];

    let yPos = 14;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text(schoolDetails.name.toUpperCase(), pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 5.5;
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(schoolDetails.address, pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 7;
    doc.setFontSize(11.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(`Consolidated Category & Gender Wise Roll Statement (Session: ${session})`, pageWidth / 2, yPos, { align: 'center' });

    const head = [
        [
            { content: 'Class', rowSpan: 2, styles: { valign: 'middle', halign: 'center', fontStyle: 'bold' } },
            ...TARGET_CATEGORIES.map(cat => ({ content: cat, colSpan: 3, styles: { halign: 'center', fontStyle: 'bold' } })),
            { content: 'Grand Total', colSpan: 3, styles: { halign: 'center', fontStyle: 'bold', fillColor: [30, 41, 59], textColor: 255 } }
        ],
        [
            ...TARGET_CATEGORIES.flatMap(() => ['M', 'F', 'Total']),
            'M', 'F', 'Total'
        ]
    ];

    const body: any[] = [];
    
    const classNames = Array.from(studentsByClass.keys()).sort((a, b) => {
        const indexA = CLASS_OPTIONS.indexOf(a);
        const indexB = CLASS_OPTIONS.indexOf(b);
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        return a.localeCompare(b, undefined, { numeric: true });
    });

    const grandTotals: { [key: string]: { M: number, F: number, T: number } } = {};
    [...TARGET_CATEGORIES, 'Grand Total'].forEach(k => grandTotals[k] = { M: 0, F: 0, T: 0 });

    classNames.forEach(className => {
        const students = studentsByClass.get(className) || [];
        const row: any[] = [className];

        let rowGrandM = 0, rowGrandF = 0, rowGrandT = 0;

        TARGET_CATEGORIES.forEach(cat => {
            const catStudents = students.filter(s => {
                const c = s.category || 'General';
                return cat === 'ST' ? c === 'ST' : c !== 'ST'; 
            });

            const m = catStudents.filter(s => s.gender === 'Male').length;
            const f = catStudents.filter(s => s.gender === 'Female').length;
            const t = catStudents.length; 

            row.push(m || '', f || '', t || '');

            grandTotals[cat].M += m;
            grandTotals[cat].F += f;
            grandTotals[cat].T += t;

            rowGrandM += m;
            rowGrandF += f;
            rowGrandT += t;
        });

        row.push(rowGrandM || '', rowGrandF || '', rowGrandT || '');
        
        grandTotals['Grand Total'].M += rowGrandM;
        grandTotals['Grand Total'].F += rowGrandF;
        grandTotals['Grand Total'].T += rowGrandT;

        body.push(row);
    });

    const footerRow = ['TOTAL'];
    [...TARGET_CATEGORIES, 'Grand Total'].forEach(cat => {
        footerRow.push(String(grandTotals[cat].M));
        footerRow.push(String(grandTotals[cat].F));
        footerRow.push(String(grandTotals[cat].T));
    });

    autoTable(doc, {
        head: head as any,
        body: body,
        foot: [footerRow],
        startY: yPos + 4,
        theme: 'grid',
        headStyles: { fillColor: [44, 62, 80], textColor: 255, lineWidth: 0.1, halign: 'center' },
        footStyles: { fillColor: [30, 41, 59], textColor: 255, fontStyle: 'bold', halign: 'center' },
        styles: { fontSize: 8.5, cellPadding: 2, halign: 'center', lineColor: [180, 190, 200], lineWidth: 0.1 },
        columnStyles: {
            0: { fontStyle: 'bold', halign: 'left', fillColor: [248, 250, 252] },
            [1 + (TARGET_CATEGORIES.length * 3)]: { fillColor: [241, 245, 249] },
            [2 + (TARGET_CATEGORIES.length * 3)]: { fillColor: [241, 245, 249] },
            [3 + (TARGET_CATEGORIES.length * 3)]: { fillColor: [226, 232, 240], fontStyle: 'bold' }
        }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 16;
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-GB')}`, 14, finalY);
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text("Signature of Head of Institution", pageWidth - 14, finalY, { align: 'right' });

    doc.save(`Consolidated_Roll_Statement_${session}.pdf`);
};

// --- 4. Vector Roll Statement ---
export const generateRollStatementVectorPdf = async (
    students: Student[],
    className: string,
    schoolDetails: SchoolDetails,
    filename: string
) => {
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 16;
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(schoolDetails.name.toUpperCase(), pageWidth / 2, y, { align: 'center' });
    
    y += 5.5;
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(schoolDetails.address, pageWidth / 2, y, { align: 'center' });
    
    if (schoolDetails.udiseCode || schoolDetails.phone) {
        y += 4.5;
        const subInfo = [
            schoolDetails.udiseCode ? `UDISE: ${schoolDetails.udiseCode}` : '',
            schoolDetails.phone ? `Ph: ${schoolDetails.phone}` : '',
            schoolDetails.email ? `Email: ${schoolDetails.email}` : ''
        ].filter(Boolean).join('  |  ');
        doc.setFontSize(8.5);
        doc.setTextColor(100, 116, 139);
        doc.text(subInfo, pageWidth / 2, y, { align: 'center' });
    }
    
    y += 7;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(`Class Roll Statement — Class ${className}`, pageWidth / 2, y, { align: 'center' });
    
    const tableColumn = ["Roll No", "Adm No", "Student Name", "Father's Name", "Gender", "Category", "D.O.B"];
    const tableRows: (string | number | undefined | null)[][] = [];

    students.forEach(student => {
        tableRows.push([
            student.rollNo || '-',
            student.admissionNo || '-',
            student.name || '-',
            student.fathersName || '-',
            student.gender || '-',
            student.category || 'General',
            student.dob || '-',
        ]);
    });

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: y + 4,
        theme: 'striped',
        headStyles: { fillColor: [44, 62, 80], textColor: 255, fontStyle: 'bold', halign: 'center' },
        styles: { fontSize: 8.5, cellPadding: 2.2, halign: 'center', lineColor: [226, 232, 240], lineWidth: 0.1 },
        columnStyles: {
            0: { halign: 'center', fontStyle: 'bold' },
            1: { halign: 'center' },
            2: { halign: 'left', fontStyle: 'bold' },
            3: { halign: 'left' },
            4: { halign: 'center' },
            5: { halign: 'center' },
            6: { halign: 'center' },
        },
        alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 16;
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(`Total Students: ${students.length}   |   Date: ${new Date().toLocaleDateString('en-GB')}`, 14, finalY);
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text("Principal / Headmaster", pageWidth - 14, finalY, { align: 'right' });
    
    doc.save(`${filename}.pdf`);
};

// --- 5. Vector Category-Wise Roll Statement ---
export const generateCategoryRollStatementPdf = async (
    students: Student[],
    className: string,
    schoolDetails: SchoolDetails
) => {
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 16;

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(schoolDetails.name.toUpperCase(), pageWidth / 2, y, { align: 'center' });

    y += 5.5;
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(schoolDetails.address, pageWidth / 2, y, { align: 'center' });

    y += 7;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(`Gender & Category Wise Roll Statement — Class ${className}`, pageWidth / 2, y, { align: 'center' });

    const GENDERS = ['Male', 'Female', 'Other'];
    const summary: { [category: string]: { [gender: string]: number } } = {};
    CATEGORY_OPTIONS.forEach(cat => {
        summary[cat] = { Male: 0, Female: 0, Other: 0 };
    });

    students.forEach(student => {
        const category = student.category && CATEGORY_OPTIONS.includes(student.category) ? student.category : 'General';
        const gender = student.gender && GENDERS.includes(student.gender) ? student.gender : 'Other';
        if (summary[category]) {
            summary[category][gender]++;
        }
    });

    const genderTotals = { Male: 0, Female: 0, Other: 0 };
    GENDERS.forEach(gender => {
        genderTotals[gender as keyof typeof genderTotals] = CATEGORY_OPTIONS.reduce((acc, category) => acc + summary[category][gender], 0);
    });

    const categoryTotals: { [category: string]: number } = {};
    CATEGORY_OPTIONS.forEach(category => {
        categoryTotals[category] = GENDERS.reduce((acc, gender) => acc + summary[category][gender], 0);
    });

    const head = [
        ['Category', 'Male', 'Female', 'Other', 'Total']
    ];

    const body = CATEGORY_OPTIONS.map(cat => [
        cat,
        summary[cat].Male || 0,
        summary[cat].Female || 0,
        summary[cat].Other || 0,
        categoryTotals[cat] || 0
    ]);

    const foot = [
        [
            'TOTAL',
            genderTotals.Male,
            genderTotals.Female,
            genderTotals.Other,
            students.length
        ]
    ];

    autoTable(doc, {
        head,
        body,
        foot,
        startY: y + 5,
        theme: 'grid',
        headStyles: { fillColor: [44, 62, 80], textColor: 255, fontStyle: 'bold', halign: 'center' },
        footStyles: { fillColor: [30, 41, 59], textColor: 255, fontStyle: 'bold', halign: 'center' },
        styles: { fontSize: 9.5, cellPadding: 3, halign: 'center', lineColor: [180, 190, 200] },
        columnStyles: {
            0: { fontStyle: 'bold', halign: 'left', fillColor: [248, 250, 252] },
            4: { fontStyle: 'bold', fillColor: [241, 245, 249] }
        }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(`Total Students: ${students.length}   |   Date: ${new Date().toLocaleDateString('en-GB')}`, 14, finalY);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text("Principal / Headmaster", pageWidth - 14, finalY, { align: 'right' });

    doc.save(`Category_Roll_Statement_Class_${className}.pdf`);
};

// --- High-Quality HTML-to-PDF Capture ---
export const generatePdfFromElement = async (elementId: string, filename: string) => {
    const input = document.getElementById(elementId);
    if (!input) return;
    
    const canvas = await html2canvas(input, { 
        scale: 3, 
        useCORS: true, 
        logging: false,
        backgroundColor: '#ffffff'
    });
    
    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${filename}.pdf`);
};

// --- Multi-Page High-Quality HTML-to-PDF Capture ---
export const generateMultiPagePdfFromElements = async (elementIds: string[], filename: string) => {
    const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    let pageAdded = false;
    for (let i = 0; i < elementIds.length; i++) {
        const elementId = elementIds[i];
        const input = document.getElementById(elementId);
        if (!input) continue;
        
        if (pageAdded) pdf.addPage();
        
        const canvas = await html2canvas(input, { 
            scale: 3, 
            useCORS: true, 
            logging: false,
            backgroundColor: '#ffffff'
        });
        
        const imgData = canvas.toDataURL('image/jpeg', 0.98);
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        pageAdded = true;
    }
    
    pdf.save(`${filename}.pdf`);
};
