
import { toast } from "@/hooks/use-toast";
import html2pdf from 'html2pdf.js';
import { DefectRecord } from '@/components/defect-records/DefectRecord.types';
import { format } from 'date-fns';

export const exportToPdf = (filteredRecords: DefectRecord[]) => {
  if (filteredRecords.length === 0) {
    toast({
      title: "WARNING",
      description: "NO RECORDS TO EXPORT",
      variant: "destructive",
    });
    return;
  }

  console.log("Starting PDF export with", filteredRecords.length, "records");
  
  // Create a temporary div element for rendering the PDF content
  const exportContainer = document.createElement('div');
  exportContainer.style.position = 'fixed';
  exportContainer.style.top = '0';
  exportContainer.style.left = '0';
  exportContainer.style.width = '1120px'; // A4 landscape approx width at 96 DPI
  exportContainer.style.height = '792px'; // A4 landscape approx height at 96 DPI
  exportContainer.style.backgroundColor = 'white';
  exportContainer.style.zIndex = '-9999';
  exportContainer.style.opacity = '0';
  
  document.body.appendChild(exportContainer);
  
  // Build table rows with explicit styling for each record
  const tableContent = filteredRecords.map(record => `
    <tr style="${record.ok ? 'background-color: #F2FCE2;' : record.sl ? 'background-color: #FEF7CD;' : 'background-color: #ffffff;'}">
      <td style="padding: 8px; border: 1px solid #000000; color: #000000;">${record.time || ''}</td>
      <td style="padding: 8px; border: 1px solid #000000; color: #000000;">${record.registration || ''}</td>
      <td style="padding: 8px; border: 1px solid #000000; color: #000000;">${record.station || ''}</td>
      <td style="padding: 8px; border: 1px solid #000000; color: #000000;">${record.defect || ''}</td>
      <td style="padding: 8px; border: 1px solid #000000; color: #000000;">${record.remarks || ''}</td>
      <td style="padding: 8px; border: 1px solid #000000; text-align: center; color: #000000;">${record.rst ? 'YES' : 'NO'}</td>
      <td style="padding: 8px; border: 1px solid #000000; text-align: center; color: #000000;">${record.ok ? 'YES' : 'NO'}</td>
    </tr>
  `).join('');
  
  // Create the HTML content with explicit styling
  exportContainer.innerHTML = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #000000 !important; background-color: white !important;">
      <h2 style="text-align: center; margin-bottom: 20px; color: #000000 !important; font-size: 18px; font-weight: bold;">Aircraft Defect Records - ${format(new Date(), 'dd/MM/yyyy')}</h2>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; color: #000000 !important; background-color: white !important; border: 1px solid #000000;">
        <thead>
          <tr style="background-color: #e0e0e0;">
            <th style="padding: 8px; text-align: left; font-weight: bold; border: 1px solid #000000; color: #000000 !important;">Time</th>
            <th style="padding: 8px; text-align: left; font-weight: bold; border: 1px solid #000000; color: #000000 !important;">Registration</th>
            <th style="padding: 8px; text-align: left; font-weight: bold; border: 1px solid #000000; color: #000000 !important;">Station</th>
            <th style="padding: 8px; text-align: left; font-weight: bold; border: 1px solid #000000; color: #000000 !important;">Defect</th>
            <th style="padding: 8px; text-align: left; font-weight: bold; border: 1px solid #000000; color: #000000 !important;">Remarks</th>
            <th style="padding: 8px; text-align: left; font-weight: bold; border: 1px solid #000000; color: #000000 !important;">RST</th>
            <th style="padding: 8px; text-align: left; font-weight: bold; border: 1px solid #000000; color: #000000 !important;">OK</th>
          </tr>
        </thead>
        <tbody>
          ${tableContent}
        </tbody>
      </table>
    </div>
  `;
  
  // Ensure the element is visible in the DOM
  console.log("HTML content for PDF:", exportContainer.innerHTML.substring(0, 200) + "...");
  
  // Configure PDF options with more robust settings
  const pdfOptions = {
    margin: [10, 10, 10, 10],
    filename: 'aircraft_defect_records.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2,
      useCORS: true,
      logging: true,
      letterRendering: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      removeContainer: false
    },
    jsPDF: { 
      unit: 'mm', 
      format: 'a4', 
      orientation: 'landscape',
      compress: true,
      precision: 3
    }
  };
  
  // Use a longer timeout to ensure DOM rendering is complete
  setTimeout(() => {
    console.log("Generating PDF now...");
    
    // Create and save the PDF
    html2pdf()
      .from(exportContainer)
      .set(pdfOptions)
      .save()
      .then(() => {
        console.log("PDF generation successful");
        document.body.removeChild(exportContainer);
        
        toast({
          title: "SUCCESS",
          description: "PDF EXPORT COMPLETE",
        });
      })
      .catch(error => {
        console.error("PDF generation error:", error);
        document.body.removeChild(exportContainer);
        
        toast({
          title: "ERROR",
          description: "FAILED TO GENERATE PDF: " + error.message,
          variant: "destructive"
        });
      });
  }, 1500); // Increased delay to ensure complete rendering
};
