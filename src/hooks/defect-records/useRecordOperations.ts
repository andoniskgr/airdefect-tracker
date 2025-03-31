
import { format } from "date-fns";
import { toast } from "sonner";
import { deleteRecord, deleteRecordsByDate } from "../../utils/firebaseDB";
import { DefectRecord } from "../../components/defect-records/DefectRecord.types";

export const useRecordOperations = (userEmail: string | null | undefined) => {
  const handleDeleteRecord = async (id: string) => {
    try {
      console.log("Deleting record with ID:", id);
      await deleteRecord(id, userEmail);
      toast.success("Record deleted successfully!");
    } catch (error) {
      console.error("Error deleting record:", error);
      toast.error("Failed to delete record: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };
  
  const handleDeleteAllByDate = async (date: string) => {
    try {
      await deleteRecordsByDate(date, userEmail);
      toast.success(`All records for ${format(new Date(date), 'dd/MM/yyyy')} deleted successfully!`);
    } catch (error) {
      console.error("Error deleting records:", error);
      toast.error("Failed to delete records: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };

  const archiveDate = (date: string) => {
    // Get existing archived dates from localStorage
    const archivedDatesJSON = localStorage.getItem('archivedDates') || '[]';
    const archivedDates = JSON.parse(archivedDatesJSON) as string[];
    
    // Add new date to archived dates if not already there
    if (!archivedDates.includes(date)) {
      archivedDates.push(date);
      localStorage.setItem('archivedDates', JSON.stringify(archivedDates));
      toast.success(`Date ${format(new Date(date), 'dd/MM/yyyy')} archived successfully!`);
      return true;
    }
    return false;
  };

  const exportToExcel = (getRecords: () => DefectRecord[]) => {
    try {
      const recordsToExport = getRecords();
      
      if (recordsToExport.length === 0) {
        toast.error("No records to export");
        return;
      }
      
      // Update headers and column mapping to exactly match the specified format
      const headers = [
        "TIME", "A/C", "STAND", "REPORTED DEFECT", "ACTION TAKEN", "RESET", "DELAY", "OK"
      ];
      
      const data = recordsToExport.map(record => [
        record.time,                       // TIME
        record.registration,               // A/C
        record.station,                    // STAND
        record.defect,                     // REPORTED DEFECT
        record.remarks,                    // ACTION TAKEN
        record.rst ? "YES" : "NO",         // RESET
        record.dly ? "YES" : "NO",         // DELAY (corrected to use dly field)
        record.ok ? "YES" : "NO"           // OK
      ]);
      
      let csvContent = headers.join(',') + '\n';
      data.forEach(row => {
        const formattedRow = row.map(cell => {
          if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))) {
            return `"${cell.replace(/"/g, '""')}"`;
          }
          return cell;
        });
        csvContent += formattedRow.join(',') + '\n';
      });
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `defect-records-${format(new Date(), 'yyyy-MM-dd')}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Excel export completed successfully");
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast.error("Failed to export to Excel");
    }
  };

  return {
    handleDeleteRecord,
    handleDeleteAllByDate,
    archiveDate,
    exportToExcel
  };
};
