import React from 'react';
import { createRoot } from 'react-dom/client';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const generatePdfFromComponent = async (
  ComponentToRender: React.ReactElement,
  fileName: string
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
    // FIX: Replaced JSX with React.createElement to resolve TypeScript errors in a .ts file.
    root.render(
      React.createElement('div', { id: 'pdf-render-target' }, ComponentToRender)
    );
    
    // Wait for rendering and resource loading (e.g., images).
    // A timeout is a pragmatic approach for this environment.
    await new Promise(resolve => setTimeout(resolve, 1000));

    const elementToCapture = container.querySelector('#pdf-render-target');
    if (!elementToCapture) {
      throw new Error("Failed to render component for PDF generation.");
    }
    
    const canvas = await html2canvas(elementToCapture as HTMLElement, {
      scale: 2, // Higher scale for better quality
      useCORS: true,
      backgroundColor: null, // Use component's own background
    });

    const imgData = canvas.toDataURL('image/png');
    
    // Determine PDF dimensions and orientation from the canvas itself
    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height],
      hotfixes: ["px_scaling"], // Important for accurate pixel scaling
    });

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
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