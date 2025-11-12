import React from 'react';
import { createRoot } from 'react-dom/client';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { SchoolDetails, Student } from '../types';
import { dateToWords, formatDateDDMMYYYY, getImageDimensions } from './formatters';

// --- VECTOR PDF GENERATION (NEW) ---

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 15;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

const addHeader = async (pdf: jsPDF, schoolDetails: SchoolDetails) => {
    if (schoolDetails.logo) {
        try {
            const imgDim = await getImageDimensions(schoolDetails.logo);
            const aspectRatio = imgDim.width / imgDim.height;
            const imgHeight = 25;
            const imgWidth = imgHeight * aspectRatio;
            const imgX = (PAGE_WIDTH - imgWidth) / 2;
            pdf.addImage(schoolDetails.logo, 'PNG', imgX, MARGIN - 5, imgWidth, imgHeight);
        } catch (e) { console.error("Could not add school logo to PDF", e); }
    }

    pdf.setFontSize(22);
    pdf.setFont('helvetica', 'bold');
    pdf.text(schoolDetails.name.toUpperCase(), PAGE_WIDTH / 2, MARGIN + 30, { align: 'center' });

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(schoolDetails.address, PAGE_WIDTH / 2, MARGIN + 36, { align: 'center' });

    const contactInfo = [
        schoolDetails.phone ? `Ph: ${schoolDetails.phone}` : null,
        schoolDetails.email ? `Email: ${schoolDetails.email}` : null,
        schoolDetails.udiseCode ? `UDISE: ${schoolDetails.udiseCode}` : null,
    ].filter(Boolean).join(' | ');
    pdf.setFontSize(8);
    pdf.text(contactInfo, PAGE_WIDTH / 2, MARGIN + 40, { align: 'center' });
};

const addFooter = (pdf: jsPDF, schoolDetails: SchoolDetails) => {
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');

    // Signature Line
    const signatureY = PAGE_HEIGHT - MARGIN - 20;
    pdf.line(PAGE_WIDTH - MARGIN - 60, signatureY, PAGE_WIDTH - MARGIN, signatureY);
    pdf.text("Principal / Headmaster", PAGE_WIDTH - MARGIN - 30, signatureY + 5, { align: 'center' });
    pdf.setFontSize(8);
    pdf.text(`(${schoolDetails.name})`, PAGE_WIDTH - MARGIN - 30, signatureY + 9, { align: 'center' });

    // App Credit
    pdf.setFontSize(7);
    pdf.setTextColor(100);
    pdf.text("This document was created from School Management Mobile System by Imran Gani Mugloo Teacher Zone Vailoo", PAGE_WIDTH / 2, PAGE_HEIGHT - 5, { align: 'center' });
};

const addPhoto = async (pdf: jsPDF, photo: string, x: number, y: number, w: number, h: number) => {
    try {
        pdf.addImage(photo, 'JPEG', x, y, w, h);
    } catch (e) {
        console.error("Could not add student photo to PDF", e);
        pdf.rect(x, y, w, h);
        pdf.setFontSize(8);
        pdf.text("Photo Error", x + w/2, y + h/2, { align: 'center' });
    }
};

export const generateDobCertificateVectorPdf = async (student: Student, schoolDetails: SchoolDetails, photo: string | null | undefined, fileName: string) => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    await addHeader(pdf, schoolDetails);

    if (photo) {
        await addPhoto(pdf, photo, PAGE_WIDTH - MARGIN - 35, 90, 30, 40);
    }

    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text("DATE OF BIRTH CERTIFICATE", PAGE_WIDTH / 2, 80, { align: 'center', renderingMode: 'fillThenStroke', charSpace: 1 });
    pdf.line(PAGE_WIDTH / 2 - 48, 81, PAGE_WIDTH / 2 + 48, 81);

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text("This is to certify that:", PAGE_WIDTH / 2, 100, { align: 'center' });

    let currentY = 115;
    const itemHeight = 8;
    const labelWidth = 50;
    
    const details = [
        { label: "Name of Student", value: student.name },
        { label: "Admission No.", value: student.admissionNo },
        { label: "Father’s Name", value: student.fathersName },
        { label: "Class/Section", value: `${student.className} '${student.section}'` },
        { label: "Mother’s Name", value: student.mothersName },
        { label: "Date of Birth (figures)", value: formatDateDDMMYYYY(student.dob) },
    ];

    pdf.setFont('helvetica', 'bold');
    details.forEach(item => {
        pdf.text(item.label + ":", MARGIN, currentY);
        pdf.setFont('helvetica', 'normal');
        pdf.text(item.value || 'N/A', MARGIN + labelWidth, currentY);
        currentY += itemHeight;
    });

    currentY += 5;
    pdf.setFont('helvetica', 'bold');
    pdf.text("Date of Birth (words):", MARGIN, currentY);
    pdf.setFont('helvetica', 'normal');
    const dobWords = dateToWords(student.dob);
    const splitWords = pdf.splitTextToSize(dobWords, CONTENT_WIDTH - labelWidth);
    pdf.text(splitWords, MARGIN + labelWidth, currentY);
    
    currentY += splitWords.length * 5 + 15;
    pdf.setFont('helvetica', 'italic');
    const note = "The above particulars have been taken from the Admission Register of the school and are correct to the best of my knowledge.";
    pdf.text(pdf.splitTextToSize(note, CONTENT_WIDTH), MARGIN, currentY);
    
    addFooter(pdf, schoolDetails);
    pdf.save(`${fileName}.pdf`);
};

export const generateBonafideCertificateVectorPdf = async (student: Student, schoolDetails: SchoolDetails, photo: string | null | undefined, fileName: string) => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const genderPronoun = student.gender === 'Female' ? 'she' : 'he';
    const relationPronoun = student.gender === 'Female' ? 'Daughter' : 'Son';
    
    await addHeader(pdf, schoolDetails);
    
    if (photo) {
        await addPhoto(pdf, photo, PAGE_WIDTH - MARGIN - 35, 90, 30, 40);
    }
    
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text("BONAFIDE CERTIFICATE", PAGE_WIDTH / 2, 80, { align: 'center', charSpace: 1 });
    pdf.line(PAGE_WIDTH / 2 - 40, 81, PAGE_WIDTH / 2 + 40, 81);
    
    let currentY = 100;
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Date: ${new Date().toLocaleDateString('en-GB')}`, PAGE_WIDTH - MARGIN, currentY, { align: 'right' });
    currentY += 20;

    const bodyText1 = `This is to certify that ${student.name}, ${relationPronoun} of ${student.fathersName}, is a bonafide student of this institution. At present, ${genderPronoun} is studying in Class ${student.className} '${student.section}' under Admission Number ${student.admissionNo}.`;
    const splitText1 = pdf.splitTextToSize(bodyText1, CONTENT_WIDTH - 40); // smaller width due to photo
    pdf.text(splitText1, MARGIN, currentY, { lineHeightFactor: 1.5 });
    currentY += splitText1.length * 12;

    const bodyText2 = `According to our school records, ${genderPronoun}r Date of Birth is ${formatDateDDMMYYYY(student.dob)}. This certificate is issued upon the request of the parent/guardian for all legitimate purposes. We wish ${genderPronoun}m all the best for ${genderPronoun}r future endeavors.`;
    const splitText2 = pdf.splitTextToSize(bodyText2, CONTENT_WIDTH);
    pdf.text(splitText2, MARGIN, currentY, { lineHeightFactor: 1.5 });

    addFooter(pdf, schoolDetails);
    pdf.save(`${fileName}.pdf`);
};

export const generateRollStatementVectorPdf = async (students: Student[], className: string, schoolDetails: SchoolDetails, fileName: string) => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(schoolDetails.name.toUpperCase(), PAGE_WIDTH / 2, MARGIN, { align: 'center' });

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Roll Statement - Class ${className}`, PAGE_WIDTH / 2, MARGIN + 8, { align: 'center' });

    const tableHeaders = ["Roll", "Adm No", "Student Name", "Father's Name", "Category", "D.O.B"];
    const colWidths = [15, 20, 55, 55, 20, 25];
    const rowHeight = 8;
    let currentY = MARGIN + 20;

    // Draw table header
    pdf.setFont('helvetica', 'bold');
    pdf.setFillColor(230, 230, 230);
    pdf.rect(MARGIN, currentY, CONTENT_WIDTH, rowHeight, 'F');
    let currentX = MARGIN;
    tableHeaders.forEach((header, i) => {
        pdf.text(header, currentX + 2, currentY + rowHeight / 2 + 2);
        currentX += colWidths[i];
    });
    currentY += rowHeight;

    // Draw table rows
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    students.forEach((student, rowIndex) => {
        if (currentY > PAGE_HEIGHT - MARGIN - rowHeight) { // Check for page break
            pdf.addPage();
            currentY = MARGIN;
        }

        const rowData = [
            student.rollNo,
            student.admissionNo,
            student.name,
            student.fathersName,
            student.category,
            student.dob,
        ];

        currentX = MARGIN;
        rowData.forEach((cell, i) => {
            const text = String(cell || '');
            const truncatedText = pdf.splitTextToSize(text, colWidths[i] - 4); // -4 for padding
            pdf.text(truncatedText[0], currentX + 2, currentY + rowHeight / 2 + 2);
            currentX += colWidths[i];
        });
        
        pdf.line(MARGIN, currentY + rowHeight, MARGIN + CONTENT_WIDTH, currentY + rowHeight); // horizontal line
        currentY += rowHeight;
    });

    // Draw vertical lines
    currentX = MARGIN;
    for (let i = 0; i <= colWidths.length; i++) {
        pdf.line(currentX, MARGIN + 20, currentX, currentY);
        if (i < colWidths.length) {
            currentX += colWidths[i];
        }
    }

    pdf.save(`${fileName}.pdf`);
};

// --- IMAGE-BASED PDF GENERATION (LEGACY) ---

export const generatePdfFromComponentAsImage = async (
  ComponentToRender: React.ReactElement,
  fileName: string,
  pdfOptions: any = {}
): Promise<void> => {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '-9999px'; // Off-screen
  container.style.zIndex = '-100';
  document.body.appendChild(container);

  const root = createRoot(container);

  try {
    root.render(
      React.createElement('div', { id: 'pdf-render-target' }, ComponentToRender)
    );
    
    // Give React a moment to render everything.
    await new Promise(resolve => setTimeout(resolve, 200));

    const renderTarget = container.querySelector('#pdf-render-target');
    if (!renderTarget) {
      throw new Error("Failed to find render target for PDF generation.");
    }
    
    // Prioritize elements explicitly marked as pages.
    let pages = Array.from(renderTarget.querySelectorAll('.A4-page-container, #progress-card, #nep-progress-card, .page-break'));
    if (pages.length === 0) {
        pages = [renderTarget.firstElementChild as HTMLElement || renderTarget as HTMLElement];
    }

    const finalPdfOptions = {
        orientation: 'p',
        unit: 'px',
        format: 'a4',
        ...pdfOptions,
    };
    const pdf = new jsPDF(finalPdfOptions);

    for (let i = 0; i < pages.length; i++) {
        const pageElement = pages[i] as HTMLElement;
        
        // Wait for all images within the current page element to load.
        const images = Array.from(pageElement.getElementsByTagName('img'));
        const imageLoadPromises = images.map(img => {
            if (img.complete && img.naturalHeight !== 0) return Promise.resolve();
            return new Promise<void>((resolve) => {
                img.onload = () => resolve();
                img.onerror = () => {
                    console.warn(`PDF Generation: Could not load image ${img.src}.`);
                    resolve(); // Don't block generation for a single broken image.
                };
            });
        });
        await Promise.all(imageLoadPromises);
        
        // A small final delay for fonts and other async rendering to complete.
        await new Promise(resolve => setTimeout(resolve, 100));

        const canvas = await html2canvas(pageElement, {
            scale: 3, // Increased scale for higher resolution
            useCORS: true,
            backgroundColor: '#ffffff',
            // Set dimensions explicitly to ensure consistency
            width: pageElement.offsetWidth,
            height: pageElement.offsetHeight,
        });

        const imgData = canvas.toDataURL('image/png'); // Use lossless PNG format
        
        // Match PDF page size, considering orientation
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        // Add new page if not the first one
        if (i > 0) {
            pdf.addPage();
        }
        
        // Scale image to fit PDF page width
        const ratio = canvas.width / pdfWidth;
        const scaledHeight = canvas.height / ratio;
        
        // Avoid adding an image that's much taller than the page, which can corrupt some viewers
        const displayHeight = Math.min(scaledHeight, pdfHeight);

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, displayHeight);
    }
    
    pdf.save(`${fileName}.pdf`);

  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('An error occurred while generating the PDF. Please check the console for details.');
  } finally {
    // Ensure cleanup happens
    root.unmount();
    document.body.removeChild(container);
  }
};