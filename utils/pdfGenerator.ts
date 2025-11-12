import React from 'react';
import { createRoot } from 'react-dom/client';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const generatePdfFromComponent = async (
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
    let pages = Array.from(renderTarget.querySelectorAll('.A4-page-container, #progress-card, #nep-progress-card'));
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
