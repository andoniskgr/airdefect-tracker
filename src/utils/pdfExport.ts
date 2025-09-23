
import { toast } from "sonner";
import html2pdf from 'html2pdf.js';
import { DefectRecord } from '@/components/defect-records/DefectRecord.types';
import { format } from 'date-fns';

export const exportRecordsToPDF = (filteredRecords: DefectRecord[]) => {
  if (filteredRecords.length === 0) {
    toast("WARNING: NO RECORDS TO EXPORT");
    return;
  }

  
  // Create a temporary div element for rendering the PDF content
  const exportContainer = document.createElement('div');
  exportContainer.style.width = '100%';
  exportContainer.style.padding = '20px';
  exportContainer.style.position = 'absolute';
  exportContainer.style.left = '-9999px';
  exportContainer.style.background = 'white';
  
  document.body.appendChild(exportContainer);
  
  // Format date for the title
  const currentDate = format(new Date(), 'dd/MM/yyyy');
  
  // Build HTML content for PDF
  let htmlContent = `
    <div style="font-family: Arial, sans-serif; color: black; background-color: white; width: 100%;">
      <h2 style="text-align: center; margin-bottom: 20px; color: black; font-size: 18px; font-weight: bold;">Aircraft Defect Records - ${currentDate}</h2>
      <table style="width: 100%; border-collapse: collapse; border: 1px solid black;">
        <thead>
          <tr style="background-color: #e0e0e0;">
            <th style="padding: 8px; border: 1px solid black; color: black; text-align: left; font-weight: bold;">Time</th>
            <th style="padding: 8px; border: 1px solid black; color: black; text-align: left; font-weight: bold;">Registration</th>
            <th style="padding: 8px; border: 1px solid black; color: black; text-align: left; font-weight: bold;">Station</th>
            <th style="padding: 8px; border: 1px solid black; color: black; text-align: left; font-weight: bold;">Defect</th>
            <th style="padding: 8px; border: 1px solid black; color: black; text-align: left; font-weight: bold;">Remarks</th>
            <th style="padding: 8px; border: 1px solid black; color: black; text-align: center; font-weight: bold;">RST</th>
            <th style="padding: 8px; border: 1px solid black; color: black; text-align: center; font-weight: bold;">OK</th>
          </tr>
        </thead>
        <tbody>
  `;
  
  // Add table rows for each record
  filteredRecords.forEach(record => {
    const bgColor = record.ok ? "#F2FCE2" : record.sl ? "#FEF7CD" : "#ffffff";
    
    htmlContent += `
      <tr style="background-color: ${bgColor};">
        <td style="padding: 8px; border: 1px solid black; color: black;">${record.time || ''}</td>
        <td style="padding: 8px; border: 1px solid black; color: black;">${record.registration || ''}</td>
        <td style="padding: 8px; border: 1px solid black; color: black;">${record.station || ''}</td>
        <td style="padding: 8px; border: 1px solid black; color: black;">${record.defect || ''}</td>
        <td style="padding: 8px; border: 1px solid black; color: black;">${record.remarks || ''}</td>
        <td style="padding: 8px; border: 1px solid black; color: black; text-align: center;">${record.rst ? 'YES' : 'NO'}</td>
        <td style="padding: 8px; border: 1px solid black; color: black; text-align: center;">${record.ok ? 'YES' : 'NO'}</td>
      </tr>
    `;
  });
  
  // Close the table and containing div
  htmlContent += `
        </tbody>
      </table>
    </div>
  `;
  
  // Set the HTML content
  exportContainer.innerHTML = htmlContent;
  
  // Allow time for the DOM to update before generating PDF
  setTimeout(() => {
    // Configure PDF options
    const pdfOptions = {
      margin: 10,
      filename: 'aircraft_defect_records.pdf',
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { 
        scale: 2,
        useCORS: true
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'landscape'
      }
    };
    
    // Generate PDF
    html2pdf().from(exportContainer).set(pdfOptions).save().then(() => {
      document.body.removeChild(exportContainer);
      toast("PDF export complete");
    }).catch(error => {
      document.body.removeChild(exportContainer);
      toast("Failed to generate PDF: " + error.message);
    });
  }, 1000);
};
