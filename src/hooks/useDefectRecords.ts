import { useState, useEffect } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { format } from "date-fns";
import { toast } from "sonner";
import { db, saveRecord as firebaseSaveRecord, getAllRecords, deleteRecord, deleteRecordsByDate } from "../utils/firebaseDB";
import { DefectRecord, FilterType } from "../components/defect-records/DefectRecord.types";

export const useDefectRecords = (userEmail: string | null | undefined) => {
  const [defectRecords, setDefectRecords] = useState<DefectRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({
    key: 'time',
    direction: 'asc'
  });

  useEffect(() => {
    setLoading(true);
    const fetchRecords = async () => {
      try {
        const records = await getAllRecords(userEmail);
        setDefectRecords(records);
        console.log(`Fetched ${records.length} records for user ${userEmail}`);
      } catch (error) {
        console.error("Error fetching records:", error);
        toast.error("Failed to load records: " + (error instanceof Error ? error.message : "Unknown error"));
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();

    const recordsCollection = collection(db, "defectRecords");
    let recordsQuery;
    
    if (userEmail) {
      recordsQuery = query(recordsCollection, where("createdBy", "==", userEmail));
    } else {
      recordsQuery = query(recordsCollection);
    }
    
    const unsubscribe = onSnapshot(recordsQuery, (snapshot) => {
      console.log(`Snapshot received, docs count: ${snapshot.docs.length} for user ${userEmail}`);
      const records = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as DefectRecord[];
      
      setDefectRecords(records);
      setLoading(false);
    }, (error) => {
      console.error("Firestore error:", error);
      toast.error("Failed to load records: " + error.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userEmail]);

  const handleSort = (column: string) => {
    setSortConfig(prevConfig => ({
      key: column,
      direction: prevConfig.key === column && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

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

  const exportToExcel = () => {
    try {
      const recordsToExport = getFilteredRecords();
      
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

  const saveRecord = async (record: DefectRecord) => {
    try {
      const timestamp = new Date().toISOString();
      const email = userEmail || 'unknown';
      
      const updatedRecord = {
        ...record,
        updatedBy: email,
        updatedAt: timestamp
      };
      
      await firebaseSaveRecord(updatedRecord);
      toast.success("Record updated successfully!");
    } catch (error) {
      console.error("Error updating record:", error);
      toast.error("Failed to update record: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };

  const getFilteredRecords = () => {
    return filter !== 'all'
      ? defectRecords.filter((record) => {
          if (filter === 'sl') return record.sl;
          if (filter === 'ok') return record.ok;
          if (filter === 'pln') return record.pln;
          return true;
        })
      : defectRecords;
  };

  return {
    defectRecords,
    loading,
    filter,
    setFilter,
    sortConfig,
    handleSort,
    handleDeleteRecord,
    handleDeleteAllByDate,
    exportToExcel,
    saveRecord,
    getFilteredRecords
  };
};
