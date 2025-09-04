import { format } from "date-fns";
import { toast } from "sonner";
import { deleteRecord, deleteRecordsByDate, saveArchivedDate, removeArchivedDate, getUserArchivedDates, saveRecord } from "../../utils/firebaseDB";
import { DefectRecord } from "../../components/defect-records/DefectRecord.types";
import { Dispatch, SetStateAction, useEffect } from "react";

export const useRecordOperations = (
  userEmail: string | null | undefined,
  setArchivedDates?: Dispatch<SetStateAction<string[]>>
) => {
  useEffect(() => {
    if (userEmail && setArchivedDates) {
      const loadArchivedDates = async () => {
        try {
          const dates = await getUserArchivedDates(userEmail);
          setArchivedDates(dates);
          
          // Also update localStorage as a backup
          localStorage.setItem('archivedDates', JSON.stringify(dates));
        } catch (error) {
          console.error("Error loading archived dates:", error);
        }
      };
      
      loadArchivedDates();
    }
  }, [userEmail, setArchivedDates]);

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

  const handleUpdateRecord = async (id: string, updates: Partial<DefectRecord>) => {
    try {
      // Create a complete record object with the updates
      const updatedRecord: DefectRecord = {
        id,
        ...updates,
        updatedBy: userEmail || undefined,
        updatedAt: new Date().toISOString()
      } as DefectRecord;
      
      await saveRecord(updatedRecord);
      // Toast messages are handled by the calling component
    } catch (error) {
      console.error("Error updating record:", error);
      throw error; // Re-throw to let the calling component handle the error
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

  const archiveDate = async (date: string) => {
    if (!userEmail) {
      toast.error("You must be logged in to archive dates");
      return false;
    }
    
    try {
      // Save to Firebase
      await saveArchivedDate(userEmail, date);
      
      // Update localStorage as a backup
      const archivedDatesJSON = localStorage.getItem('archivedDates') || '[]';
      const archivedDates = JSON.parse(archivedDatesJSON) as string[];
      
      if (!archivedDates.includes(date)) {
        archivedDates.push(date);
        localStorage.setItem('archivedDates', JSON.stringify(archivedDates));
      }
      
      toast.success(`Date ${format(new Date(date), 'dd/MM/yyyy')} archived successfully!`);
      return true;
    } catch (error) {
      console.error("Error archiving date:", error);
      toast.error("Failed to archive date");
      return false;
    }
  };

  const unarchiveDate = async (date: string) => {
    if (!userEmail) {
      toast.error("You must be logged in to unarchive dates");
      return false;
    }
    
    try {
      // Remove from Firebase
      await removeArchivedDate(userEmail, date);
      
      // Update localStorage as a backup
      const archivedDatesJSON = localStorage.getItem('archivedDates') || '[]';
      const archivedDates = JSON.parse(archivedDatesJSON) as string[];
      const updatedDates = archivedDates.filter(d => d !== date);
      localStorage.setItem('archivedDates', JSON.stringify(updatedDates));
      
      // Update state if setter provided
      if (setArchivedDates) {
        setArchivedDates(updatedDates);
      }
      
      toast.success(`Date ${format(new Date(date), 'dd/MM/yyyy')} unarchived successfully!`);
      return true;
    } catch (error) {
      console.error("Error unarchiving date:", error);
      toast.error("Failed to unarchive date");
      return false;
    }
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
    handleUpdateRecord,
    handleDeleteAllByDate,
    archiveDate,
    unarchiveDate,
    exportToExcel
  };
};
