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
  // Styling to ensure the container doesn't affect the layout but its content is measurable
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '-9999px';
  container.style.zIndex = '-100';
  document.body.appendChild(container);

  const root = createRoot(container);

  try {
    // Render the component into the off-screen container
    root.render(
      React.createElement('div', { id: 'pdf-render-target' }, ComponentToRender)
    );
    
    // Wait for rendering and resource loading (e.g., images).
    await new Promise(resolve => setTimeout(resolve, 1500));

    const elementToCapture = container.querySelector('#pdf-render-target');
    if (!elementToCapture) {
      throw new Error("Failed to render component for PDF generation.");
    }
    
    const canvas = await html2canvas(elementToCapture as HTMLElement, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff', // Ensure solid background for multi-page splitting
      windowWidth: elementToCapture.scrollWidth,
      windowHeight: elementToCapture.scrollHeight,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    const finalPdfOptions = {
        orientation: 'p',
        unit: 'px',
        format: 'a4',
        ...pdfOptions,
    };
    const pdf = new jsPDF(finalPdfOptions);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    const ratio = imgWidth / pdfWidth;
    const scaledImgHeight = imgHeight / ratio;
    
    let heightLeft = scaledImgHeight;
    let position = 0;

    pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, scaledImgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = heightLeft - scaledImgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, scaledImgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save(`${fileName}.pdf`);

  } catch (error) {
    console.error('Error generating PDF from component:', error);
    alert('An error occurred while generating the PDF. See the console for details.');
  } finally {
    // Cleanup the off-screen container
    root.unmount();
    document.body.removeChild(container);
  }
};