
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

  const exportToExcel = (getRecords: () => DefectRecord[]) => {
    try {
      const recordsToExport = getRecords();
      
      if (recordsToExport.length === 0) {
        toast.error("No records to export");
        return;
      }
      
      const headers = [
        "Date", "Time", "Registration", "Station", "Defect", "Remarks", 
        "ETA", "STD", "UPD", "RST", "SL", "OK", "PLN"
      ];
      
      const data = recordsToExport.map(record => [
        format(new Date(record.date), 'dd/MM/yyyy'),
        record.time,
        record.registration,
        record.station,
        record.defect,
        record.remarks,
        record.eta,
        record.std,
        record.upd,
        record.rst ? "YES" : "NO",
        record.sl ? "YES" : "NO",
        record.ok ? "YES" : "NO",
        record.pln ? "YES" : "NO"
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
    exportToExcel
  };
};
