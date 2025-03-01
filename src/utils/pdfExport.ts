
import { toast } from "@/hooks/use-toast";
import html2pdf from 'html2pdf.js';
import { DefectRecord } from '@/components/defect-records/DefectRecord.types';
import { format } from 'date-fns';

export const exportToPdf = (filteredRecords: DefectRecord[]) => {
  // Create a temporary hidden div for the PDF export
  const exportDiv = document.createElement('div');
  exportDiv.style.position = 'absolute';
  exportDiv.style.left = '-9999px';
  exportDiv.style.width = '1000px'; // Set fixed width to ensure layout
  document.body.appendChild(exportDiv);
  
  // Create table HTML with inline styles to ensure proper rendering
  exportDiv.innerHTML = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2 style="text-align: center; margin-bottom: 20px;">Aircraft Defect Records - ${format(new Date(), 'dd/MM/yyyy')}</h2>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr>
            <th style="background-color: #f3f4f6; padding: 8px; text-align: left; font-weight: bold; border: 1px solid #e5e7eb;">Time</th>
            <th style="background-color: #f3f4f6; padding: 8px; text-align: left; font-weight: bold; border: 1px solid #e5e7eb;">Registration</th>
            <th style="background-color: #f3f4f6; padding: 8px; text-align: left; font-weight: bold; border: 1px solid #e5e7eb;">Station</th>
            <th style="background-color: #f3f4f6; padding: 8px; text-align: left; font-weight: bold; border: 1px solid #e5e7eb;">Defect</th>
            <th style="background-color: #f3f4f6; padding: 8px; text-align: left; font-weight: bold; border: 1px solid #e5e7eb;">Remarks</th>
            <th style="background-color: #f3f4f6; padding: 8px; text-align: left; font-weight: bold; border: 1px solid #e5e7eb;">RST</th>
            <th style="background-color: #f3f4f6; padding: 8px; text-align: left; font-weight: bold; border: 1px solid #e5e7eb;">OK</th>
          </tr>
        </thead>
        <tbody>
          ${filteredRecords.map(record => `
            <tr style="${record.ok ? 'background-color: #F2FCE2;' : record.sl ? 'background-color: #FEF7CD;' : ''}">
              <td style="padding: 8px; border: 1px solid #e5e7eb;">${record.time || ''}</td>
              <td style="padding: 8px; border: 1px solid #e5e7eb;">${record.registration || ''}</td>
              <td style="padding: 8px; border: 1px solid #e5e7eb;">${record.station || ''}</td>
              <td style="padding: 8px; border: 1px solid #e5e7eb;">${record.defect || ''}</td>
              <td style="padding: 8px; border: 1px solid #e5e7eb;">${record.remarks || ''}</td>
              <td style="padding: 8px; border: 1px solid #e5e7eb;">${record.rst ? 'YES' : 'NO'}</td>
              <td style="padding: 8px; border: 1px solid #e5e7eb;">${record.ok ? 'YES' : 'NO'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
  
  // Ensure the element is in the DOM before generating PDF
  document.body.appendChild(exportDiv);
  
  // Export to PDF using html2pdf with improved options
  const opt = {
    margin: 10,
    filename: 'aircraft_defect_records.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
  };
  
  // Force a small delay to ensure DOM is fully ready
  setTimeout(() => {
    console.log("Generating PDF...");
    
    html2pdf().from(exportDiv).set(opt).save().then(() => {
      // Clean up
      document.body.removeChild(exportDiv);
      
      toast({
        title: "SUCCESS",
        description: "PDF EXPORT COMPLETE",
      });
    }).catch(error => {
      console.error("PDF generation error:", error);
      document.body.removeChild(exportDiv);
      
      toast({
        title: "ERROR",
        description: "FAILED TO GENERATE PDF: " + error.message,
        variant: "destructive"
      });
    });
  }, 500); // Longer delay to ensure rendering
};
