
import { toast } from "@/hooks/use-toast";
import html2pdf from 'html2pdf.js';
import { DefectRecord } from '@/components/defect-records/DefectRecord.types';

export const exportToPdf = (filteredRecords: DefectRecord[]) => {
  // Create a temporary hidden div for the PDF export
  const exportDiv = document.createElement('div');
  exportDiv.style.position = 'absolute';
  exportDiv.style.left = '-9999px';
  exportDiv.className = 'pdf-export';
  
  // Create table HTML
  exportDiv.innerHTML = `
    <style>
      .pdf-table {
        width: 100%;
        border-collapse: collapse;
        font-family: Arial, sans-serif;
      }
      .pdf-table th {
        background-color: #f3f4f6;
        padding: 8px;
        text-align: left;
        font-weight: bold;
        border-bottom: 1px solid #e5e7eb;
      }
      .pdf-table td {
        padding: 8px;
        border-bottom: 1px solid #e5e7eb;
      }
      .pdf-table tr:nth-child(even) {
        background-color: #f9fafb;
      }
      .pdf-table .ok-row {
        background-color: #F2FCE2;
      }
      .pdf-table .sl-row {
        background-color: #FEF7CD;
      }
    </style>
    <table class="pdf-table">
      <thead>
        <tr>
          <th>Time</th>
          <th>Registration</th>
          <th>Station</th>
          <th>Defect</th>
          <th>Remarks</th>
          <th>RST</th>
          <th>OK</th>
        </tr>
      </thead>
      <tbody>
        ${filteredRecords.map(record => `
          <tr class="${record.ok ? 'ok-row' : record.sl ? 'sl-row' : ''}">
            <td>${record.time}</td>
            <td>${record.registration}</td>
            <td>${record.station}</td>
            <td>${record.defect}</td>
            <td>${record.remarks}</td>
            <td>${record.rst ? 'YES' : 'NO'}</td>
            <td>${record.ok ? 'YES' : 'NO'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  
  document.body.appendChild(exportDiv);
  
  // Export to PDF using html2pdf
  const opt = {
    margin: 10,
    filename: 'aircraft_defect_records.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
  };
  
  html2pdf().from(exportDiv).set(opt).save().then(() => {
    // Clean up
    document.body.removeChild(exportDiv);
    
    toast({
      title: "SUCCESS",
      description: "PDF EXPORT COMPLETE",
    });
  });
};
