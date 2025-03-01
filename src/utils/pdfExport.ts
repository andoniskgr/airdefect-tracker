
import { toast } from "@/hooks/use-toast";
import html2pdf from 'html2pdf.js';
import { DefectRecord } from '@/components/defect-records/DefectRecord.types';
import { format } from 'date-fns';

export const exportToPdf = (filteredRecords: DefectRecord[]) => {
  console.log("Starting PDF export with", filteredRecords.length, "records");
  
  // Create a temporary hidden div for the PDF export
  const exportDiv = document.createElement('div');
  exportDiv.style.position = 'absolute';
  exportDiv.style.left = '-9999px';
  exportDiv.style.width = '1000px'; // Set fixed width to ensure layout
  document.body.appendChild(exportDiv);
  
  // Build the HTML content with more robust styling
  const tableContent = filteredRecords.map(record => `
    <tr style="${record.ok ? 'background-color: #F2FCE2;' : record.sl ? 'background-color: #FEF7CD;' : ''}">
      <td style="padding: 8px; border: 1px solid #e5e7eb;">${record.time || ''}</td>
      <td style="padding: 8px; border: 1px solid #e5e7eb;">${record.registration || ''}</td>
      <td style="padding: 8px; border: 1px solid #e5e7eb;">${record.station || ''}</td>
      <td style="padding: 8px; border: 1px solid #e5e7eb;">${record.defect || ''}</td>
      <td style="padding: 8px; border: 1px solid #e5e7eb;">${record.remarks || ''}</td>
      <td style="padding: 8px; border: 1px solid #e5e7eb; text-align: center;">${record.rst ? 'YES' : 'NO'}</td>
      <td style="padding: 8px; border: 1px solid #e5e7eb; text-align: center;">${record.ok ? 'YES' : 'NO'}</td>
    </tr>
  `).join('');
  
  // Create table HTML with improved styling for PDF output
  exportDiv.innerHTML = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #000;">
      <h2 style="text-align: center; margin-bottom: 20px; color: #000;">Aircraft Defect Records - ${format(new Date(), 'dd/MM/yyyy')}</h2>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; color: #000;">
        <thead>
          <tr>
            <th style="background-color: #f3f4f6; padding: 8px; text-align: left; font-weight: bold; border: 1px solid #e5e7eb; color: #000;">Time</th>
            <th style="background-color: #f3f4f6; padding: 8px; text-align: left; font-weight: bold; border: 1px solid #e5e7eb; color: #000;">Registration</th>
            <th style="background-color: #f3f4f6; padding: 8px; text-align: left; font-weight: bold; border: 1px solid #e5e7eb; color: #000;">Station</th>
            <th style="background-color: #f3f4f6; padding: 8px; text-align: left; font-weight: bold; border: 1px solid #e5e7eb; color: #000;">Defect</th>
            <th style="background-color: #f3f4f6; padding: 8px; text-align: left; font-weight: bold; border: 1px solid #e5e7eb; color: #000;">Remarks</th>
            <th style="background-color: #f3f4f6; padding: 8px; text-align: left; font-weight: bold; border: 1px solid #e5e7eb; color: #000;">RST</th>
            <th style="background-color: #f3f4f6; padding: 8px; text-align: left; font-weight: bold; border: 1px solid #e5e7eb; color: #000;">OK</th>
          </tr>
        </thead>
        <tbody>
          ${tableContent}
        </tbody>
      </table>
    </div>
  `;
  
  // Ensure the element is visibly appended to the DOM
  document.body.appendChild(exportDiv);
  
  // Configure PDF generation options
  const opt = {
    margin: 10,
    filename: 'aircraft_defect_records.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2,
      useCORS: true,
      logging: true,
      letterRendering: true,
      allowTaint: true
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
  };
  
  // Give the DOM time to fully render before generating PDF
  setTimeout(() => {
    console.log("Generating PDF with content:", exportDiv.innerHTML.substring(0, 100) + "...");
    
    // Create explicit promise chain for better error handling
    html2pdf()
      .from(exportDiv)
      .set(opt)
      .save()
      .then(() => {
        console.log("PDF generated successfully");
        document.body.removeChild(exportDiv);
        
        toast({
          title: "SUCCESS",
          description: "PDF EXPORT COMPLETE",
        });
      })
      .catch(error => {
        console.error("PDF generation error:", error);
        document.body.removeChild(exportDiv);
        
        toast({
          title: "ERROR",
          description: "FAILED TO GENERATE PDF: " + error.message,
          variant: "destructive"
        });
      });
  }, 1000); // Increased delay to ensure rendering
};
