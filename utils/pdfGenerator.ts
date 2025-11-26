
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { Student, SchoolDetails } from '../types';
import { CLASS_OPTIONS } from '../constants';
import { formatDateLong, dateToWords } from './formatters';

// --- Helper: Draw Border ---
const drawPageBorder = (doc: jsPDF) => {
    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();
    doc.setLineWidth(0.5);
    doc.rect(5, 5, width - 10, height - 10); // Outer
    doc.setLineWidth(0.2);
    doc.rect(7, 7, width - 14, height - 14); // Inner
};

// --- Helper: Header ---
const addHeader = (doc: jsPDF, schoolDetails: SchoolDetails, yPos = 20) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    
    if (schoolDetails.logo) {
        try {
            // Add Logo centered above name or to the left
            // Let's put it top center for certificate style
            doc.addImage(schoolDetails.logo, 'PNG', (pageWidth / 2) - 12, yPos - 15, 24, 24);
            yPos += 15;
        } catch (e) {
            console.warn("Logo add failed", e);
        }
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(44, 62, 80); // Dark Blue
    doc.text(schoolDetails.name.toUpperCase(), pageWidth / 2, yPos, { align: 'center' });
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text(schoolDetails.address, pageWidth / 2, yPos + 6, { align: 'center' });
    
    let contact = '';
    if (schoolDetails.udiseCode) contact += `UDISE: ${schoolDetails.udiseCode}  `;
    if (schoolDetails.phone) contact += `Ph: ${schoolDetails.phone}`;
    if (schoolDetails.email) contact += ` | Email: ${schoolDetails.email}`;
    
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(contact, pageWidth / 2, yPos + 11, { align: 'center' });

    return yPos + 20; // Return next Y position
};

// --- 1. Vector DOB Certificate ---
export const generateDobCertificatePdf = async (student: Student, schoolDetails: SchoolDetails) => {
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    
    drawPageBorder(doc);
    let y = 20;
    y = addHeader(doc, schoolDetails, y);

    // Title
    y += 10;
    doc.setFont('times', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(0);
    doc.text('DATE OF BIRTH CERTIFICATE', pageWidth / 2, y, { align: 'center' });
    doc.setLineWidth(0.5);
    doc.line(pageWidth / 2 - 40, y + 2, pageWidth / 2 + 40, y + 2);

    // Photo Placeholder
    const photoX = pageWidth - 50;
    const photoY = 45;
    if (student.photo) {
        try {
            doc.addImage(student.photo, 'JPEG', photoX, photoY, 30, 38);
        } catch (e) { console.warn("Photo add failed", e); }
    } 
    doc.setDrawColor(0);
    doc.setLineWidth(0.2);
    doc.rect(photoX, photoY, 30, 38); // Photo border

    // Content
    y += 20;
    doc.setFont('times', 'normal');
    doc.setFontSize(12);
    doc.text('This is to certify that:', pageWidth / 2, y, { align: 'center' });

    y += 15;
    const startX = 25;
    const valueX = 80;
    const lineHeight = 12;

    const drawField = (label: string, value: string) => {
        doc.setFont('times', 'bold');
        doc.text(label, startX, y);
        doc.setFont('times', 'bold'); // Value is also bold
        doc.text(value, valueX, y);
        doc.setLineWidth(0.1);
        doc.setLineDash([1, 1], 0);
        doc.line(valueX, y + 1, pageWidth - 25, y + 1); // Dotted line
        doc.setLineDash([], 0); // Reset
        y += lineHeight;
    };

    drawField("Name of Student:", student.name);
    drawField("Admission No:", student.admissionNo);
    drawField("Father's Name:", student.fathersName);
    drawField("Mother's Name:", student.mothersName);
    drawField("Class / Section:", `${student.className}  '${student.section}'`);
    drawField("D.O.B (Figures):", student.dob.split('-').reverse().join('-'));
    
    // Multi-line for words
    doc.setFont('times', 'bold');
    doc.text("D.O.B (Words):", startX, y);
    doc.setFont('times', 'italic');
    const dobWords = dateToWords(student.dob);
    const splitDob = doc.splitTextToSize(dobWords, pageWidth - valueX - 25);
    doc.text(splitDob, valueX, y);
    y += (lineHeight * 1.5);

    // Footer Text
    y += 10;
    doc.setFont('times', 'italic');
    doc.setFontSize(10);
    const note = "The above particulars have been taken from the Admission Register of the school and are correct to the best of my knowledge.";
    const splitNote = doc.splitTextToSize(note, pageWidth - 50);
    doc.text(splitNote, pageWidth / 2, y, { align: 'center' });

    // Signatures
    const sigY = 260;
    const date = new Date().toLocaleDateString('en-GB');
    
    doc.setFont('times', 'normal');
    doc.setFontSize(11);
    
    doc.text(`Place: ${schoolDetails.address.split(',').pop()?.trim() || '___________'}`, 25, sigY - 10);
    doc.text(`Date: ${date}`, 25, sigY);

    doc.text("Principal / Headmaster", pageWidth - 40, sigY, { align: 'center' });
    doc.text("(Signature with Seal)", pageWidth - 40, sigY + 5, { align: 'center' });

    doc.save(`${student.name}_DOB_Certificate.pdf`);
};

// --- 2. Vector Bonafide Certificate (Updated Draft) ---
export const generateBonafideCertificatePdf = async (student: Student, schoolDetails: SchoolDetails) => {
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Double decorative border
    doc.setLineWidth(0.8);
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
    doc.setLineWidth(0.3);
    doc.rect(12, 12, pageWidth - 24, pageHeight - 24);

    // -- Header --
    let y = 25;
    // Manually add header to control spacing tightly
    if (schoolDetails.logo) {
        try {
            // Supports PNG transparency if logo is base64 PNG
            doc.addImage(schoolDetails.logo, 'PNG', (pageWidth / 2) - 10, y - 10, 20, 20);
            y += 15;
        } catch (e) { console.warn("Logo add failed", e); }
    }

    doc.setFont('times', 'bold');
    doc.setFontSize(20);
    doc.text(schoolDetails.name.toUpperCase(), pageWidth / 2, y, { align: 'center' });
    y += 6;
    
    doc.setFont('times', 'normal');
    doc.setFontSize(10);
    const addressLines = doc.splitTextToSize(schoolDetails.address, 160);
    doc.text(addressLines, pageWidth / 2, y, { align: 'center' });
    y += (addressLines.length * 4) + 2;

    let contactStr = "";
    if (schoolDetails.phone) contactStr += `Phone: ${schoolDetails.phone}`;
    if (schoolDetails.email) contactStr += ` | Email: ${schoolDetails.email}`;
    doc.text(contactStr, pageWidth / 2, y, { align: 'center' });
    y += 10;

    // Line under header
    doc.setLineWidth(0.5);
    doc.line(20, y, pageWidth - 20, y);
    y += 10;

    // -- Photo --
    const photoW = 25;
    const photoH = 32;
    const photoX = pageWidth - 25 - photoW; // Right margin
    const photoY = y + 5;
    
    if (student.photo) {
        try {
            doc.addImage(student.photo, 'JPEG', photoX, photoY, photoW, photoH);
        } catch(e){}
    }
    doc.setLineWidth(0.1);
    doc.rect(photoX, photoY, photoW, photoH);

    // -- Title --
    y += 15;
    doc.setFont('times', 'bold');
    doc.setFontSize(22);
    doc.text('BONAFIDE CERTIFICATE', pageWidth / 2, y, { align: 'center' });
    doc.setLineWidth(0.5);
    doc.line(pageWidth / 2 - 45, y + 2, pageWidth / 2 + 45, y + 2);
    y += 20;

    // -- Body Paragraph 1 --
    doc.setFontSize(12);
    doc.setFont('times', 'normal');
    
    const genderRel = student.gender === 'Female' ? 'daughter' : 'son';
    const margin = 20;
    const textWidth = pageWidth - (margin * 2);
    
    // Constructing the paragraph logic
    const p1 = `This is to certify that ${student.name}, ${genderRel} of ${student.fathersName}, has been a bonafide student of ${schoolDetails.name} from -------------------------- to --------------------------.`;
    const p2 = `The student was enrolled in Class ${student.className} and bears Enrollment/Admission Number ${student.admissionNo}.`;
    const p3 = `During the period of study, the student has conducted themselves in a disciplined manner and is pursuing studies in accordance with the rules and regulations of the institution. This certificate is issued upon their request for whatever purpose it may serve.`;

    // Reset margins for full width text
    const fullWidth = textWidth;
    
    doc.text(p1, margin, y, { maxWidth: fullWidth - 30 }); // Wrapping slightly before photo column
    y += 20;
    
    doc.text(p2, margin, y, { maxWidth: fullWidth });
    y += 15;

    doc.text(p3, margin, y, { maxWidth: fullWidth, align: 'justify' });
    y += 25;

    // -- Details Section --
    doc.setFont('times', 'bold');
    doc.text("Details:", margin + 5, y);
    doc.setFont('times', 'normal');
    y += 8;

    const detailsStartX = margin + 10;
    const valueStartX = margin + 70;
    const rowHeight = 8;

    const drawDetail = (label: string, value: string) => {
        doc.setFont('times', 'bold');
        doc.text(label, detailsStartX, y);
        doc.setFont('times', 'normal');
        doc.text(value, valueStartX, y);
        y += rowHeight;
    };

    drawDetail("Name of Student:", student.name);
    drawDetail("Enrollment/Admission Number:", student.admissionNo);
    drawDetail("Course/Class:", student.className);
    drawDetail("Duration:", `-------------------------- to --------------------------`);
    drawDetail("Date of Birth:", student.dob ? formatDateLong(student.dob) : 'N/A');

    y += 10;
    doc.text("We hereby confirm that the above-mentioned particulars are true to the best of our knowledge and records.", margin, y, { maxWidth: fullWidth });
    y += 20;

    // -- Footer --
    const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    doc.setFont('times', 'bold');
    doc.text(`Issued on: ${date}`, margin, y);
    y += 30;

    // Signatures
    const sigY = y;
    
    // Left
    doc.setFont('times', 'normal');
    doc.text("Authorized Signatory: ____________________", margin, sigY);
    doc.setFont('times', 'bold');
    doc.text("Principal / Head of Institution", margin, sigY + 6);
    doc.setFont('times', 'normal');
    doc.setFontSize(10);
    doc.text("Designation: Principal/Headmaster", margin, sigY + 11);

    // Right (Seal)
    const rightX = pageWidth - margin - 40;
    doc.setFontSize(10);
    doc.text("Seal/Stamp of Institution:", rightX, sigY - 5, { align: 'center' });
    doc.rect(rightX - 15, sigY, 30, 30); // Seal box
    
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

    addHeader(doc, schoolDetails, 15);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Consolidated Category & Gender Wise Roll Statement (${session})`, doc.internal.pageSize.getWidth() / 2, 40, { align: 'center' });

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
            // Include 'Other' in Total but not M/F columns to save space
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

// --- Re-export others if needed ---
export const generatePdfFromElement = async (elementId: string, filename: string) => {
    // Legacy fallback if specific generator not used
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
    addHeader(doc, schoolDetails);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Roll Statement - Class ${className}`, doc.internal.pageSize.getWidth() / 2, 45, { align: 'center' });
    
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
        startY: 50,
        theme: 'grid',
        headStyles: { fillColor: [44, 62, 80] },
    });
    
    doc.save(`${filename}.pdf`);
};

export const generateCategoryRollStatementPdf = async (students: Student[], className: string, schoolDetails: SchoolDetails) => {
    // Keeping existing logic but ensuring it exports
    const doc = new jsPDF();
    addHeader(doc, schoolDetails);
    doc.text("Category Roll Statement", 10, 50);
    doc.save(`Category_Roll_${className}.pdf`);
};
