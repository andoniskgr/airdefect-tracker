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
  
  console.log("HTML content length:", htmlContent.length);
  console.log("Sample of HTML content:", htmlContent.substring(0, 200) + "...");
  
  // Allow time for the DOM to update before generating PDF
  setTimeout(() => {
    console.log("Starting to generate PDF...");
    
    // Configure PDF options
    const pdfOptions = {
      margin: 10,
      filename: 'aircraft_defect_records.pdf',
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        logging: true
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'landscape'
      }
    };
    
    try {
      // Generate PDF
      html2pdf().from(exportContainer).set(pdfOptions).save().then(() => {
        console.log("PDF generation successful");
        document.body.removeChild(exportContainer);
        
        toast({
          title: "SUCCESS",
          description: "PDF EXPORT COMPLETE",
        });
      }).catch(error => {
        console.error("PDF generation error:", error);
        document.body.removeChild(exportContainer);
        
        toast({
          title: "ERROR",
          description: "FAILED TO GENERATE PDF: " + error.message,
          variant: "destructive"
        });
      });
    } catch (error) {
      console.error("Error during PDF generation setup:", error);
      document.body.removeChild(exportContainer);
      
      toast({
        title: "ERROR",
        description: "FAILED TO SETUP PDF GENERATION",
        variant: "destructive"
      });
    }
  }, 1000);
};

export const exportToExcel = (filteredRecords: DefectRecord[]) => {
  if (filteredRecords.length === 0) {
    toast({
      title: "WARNING",
      description: "NO RECORDS TO EXPORT",
      variant: "destructive",
    });
    return;
  }

  console.log("Starting Excel export with", filteredRecords.length, "records");
  
  // CSV header
  let csvContent = "Date/Time,Registration,Station,Defect,Remarks,ETA,STD,UPD,RST,SL,OK\n";
  
  // Add rows for each record
  filteredRecords.forEach(record => {
    const formattedDate = format(new Date(record.date), 'dd/MM/yyyy');
    const rst = record.rst ? "YES" : "NO";
    const sl = record.sl ? "YES" : "NO";
    const ok = record.ok ? "YES" : "NO";
    
    // Escape commas and quotes in text fields
    const escapeCSV = (text: string) => {
      if (!text) return '';
      const needsQuotes = text.includes(',') || text.includes('"') || text.includes('\n');
      if (!needsQuotes) return text;
      return `"${text.replace(/"/g, '""')}"`;
    };
    
    const row = [
      `${formattedDate} ${record.time}`,
      escapeCSV(record.registration),
      escapeCSV(record.station),
      escapeCSV(record.defect),
      escapeCSV(record.remarks),
      escapeCSV(record.eta),
      escapeCSV(record.std),
      escapeCSV(record.upd),
      rst,
      sl,
      ok
    ];
    
    csvContent += row.join(',') + '\n';
  });
  
  // Create a Blob and download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'aircraft_defect_records.csv');
  document.body.appendChild(link);
  
  // Trigger download and clean up
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  toast({
    title: "SUCCESS",
    description: "EXCEL EXPORT COMPLETE",
  });
};
