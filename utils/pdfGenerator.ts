
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

// --- 2. Vector Bonafide Certificate ---
export const generateBonafideCertificatePdf = async (student: Student, schoolDetails: SchoolDetails) => {
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();

    // Decorative Border
    doc.setLineWidth(1);
    doc.rect(5, 5, pageWidth - 10, doc.internal.pageSize.getHeight() - 10);
    doc.setLineWidth(0.3);
    doc.rect(8, 8, pageWidth - 16, doc.internal.pageSize.getHeight() - 16);

    let y = 25;
    y = addHeader(doc, schoolDetails, y);

    y += 10;
    doc.setFont('times', 'bold');
    doc.setFontSize(20);
    doc.text('TO WHOM IT MAY CONCERN', pageWidth / 2, y, { align: 'center' });
    doc.setFontSize(16);
    doc.text('(BONAFIDE CERTIFICATE)', pageWidth / 2, y + 8, { align: 'center' });

    // Photo
    const photoX = pageWidth - 50;
    const photoY = 50;
    if (student.photo) {
        try {
            doc.addImage(student.photo, 'JPEG', photoX, photoY, 30, 38);
        } catch(e){}
    }
    doc.rect(photoX, photoY, 30, 38);

    y += 30;
    const mx = 25; // margin x
    const w = pageWidth - 50; // writable width

    doc.setFont('times', 'normal');
    doc.setFontSize(14);
    doc.setLineHeightFactor(1.8);

    const genderPronoun = student.gender === 'Female' ? 'she' : 'he';
    const relationPronoun = student.gender === 'Female' ? 'Daughter' : 'Son';
    const possPronoun = student.gender === 'Female' ? 'her' : 'his';
    const possPronounObj = student.gender === 'Female' ? 'her' : 'him';

    const text = `This is to certify that ${student.name}, ${relationPronoun} of Mr. ${student.fathersName}, is a bonafide student of this institution.`;
    const text2 = `At present, ${genderPronoun} is studying in Class ${student.className} (Section '${student.section}') under Admission Number ${student.admissionNo} for the academic session.`;
    const text3 = `According to our school records, ${possPronoun} Date of Birth is ${formatDateLong(student.dob)}.`;
    const text4 = `We wish ${possPronounObj} all the best for ${possPronoun} future endeavors.`;

    const splitText1 = doc.splitTextToSize(text, w - 40); 
    
    doc.text(splitText1, mx, y);
    y += (splitText1.length * 10) + 10;

    doc.text(doc.splitTextToSize(text2, w), mx, y);
    y += 25;

    doc.text(doc.splitTextToSize(text3, w), mx, y);
    y += 20;

    doc.text(doc.splitTextToSize(text4, w), mx, y);

    // Signatures
    const sigY = 250;
    doc.setFontSize(11);
    doc.text(`Date: ${new Date().toLocaleDateString('en-GB')}`, mx, sigY);
    
    doc.text("Principal / Headmaster", pageWidth - 40, sigY, { align: 'center' });
    doc.text(schoolDetails.name, pageWidth - 40, sigY + 5, { align: 'center' });

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
