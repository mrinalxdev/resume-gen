import { RefObject } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const exportToPdf = async (resumeRef: RefObject<HTMLDivElement>, fileName: string = 'resume.pdf') => {
    if (!resumeRef.current) return;
  
    try {
      const element = resumeRef.current;
      // :TODO handle the GitHub contribution graph
      const contributionGraph = element.querySelector('img[alt="GitHub Contribution Chart"]');
      if (contributionGraph) {
        await new Promise((resolve) => {
          const img = contributionGraph as HTMLImageElement;
          if (img.complete) {
            resolve(true);
          } else {
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
          }
        });
      }
  
      const canvas = await html2canvas(element, {
        scale: 2, // Higher scale for better quality
        useCORS: true, // Enable CORS for images
        logging: false,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });
  
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
  
      const pdf = new jsPDF('p', 'mm');
      let position = 0;

      pdf.addImage(canvas.toDataURL('image/jpeg', 1.0), 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/jpeg', 1.0), 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
  
      // :TODO Save the PDF
      pdf.save(fileName);
      
      return true;
    } catch (error) {
      console.error('Error generating PDF:', error);
      return false;
    }
  };
  